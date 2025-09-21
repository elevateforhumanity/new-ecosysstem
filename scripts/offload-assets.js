import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const R2_BUCKET = process.env.R2_BUCKET || "efh-builds";
const R2_ENDPOINT = process.env.R2_ENDPOINT || "https://your-account-id.r2.cloudflarestorage.com";
const R2_PUBLIC_BASE = process.env.R2_PUBLIC_BASE || "https://cdn.elevateforhumanity.org";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// File size threshold for offloading (in bytes)
const SIZE_THRESHOLD = 1024 * 1024; // 1MB

// File types to offload
const OFFLOAD_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.zip', '.tar.gz', '.pdf', '.psd', '.ai'];

let offloadedFiles = [];
let totalSizeSaved = 0;

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function shouldOffload(filePath, stats) {
  // Check file size
  if (stats.size < SIZE_THRESHOLD) return false;
  
  // Check file extension
  const ext = path.extname(filePath).toLowerCase();
  if (OFFLOAD_EXTENSIONS.includes(ext)) return true;
  
  // Check for large images (over 5MB)
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  if (imageExts.includes(ext) && stats.size > 5 * 1024 * 1024) return true;
  
  return false;
}

function createStubFile(originalPath, r2Url, originalSize) {
  const stubContent = {
    type: "asset-stub",
    originalPath,
    r2Url,
    originalSize,
    offloadedAt: new Date().toISOString(),
    note: "This file has been offloaded to R2 CDN for performance. Use the r2Url to access the actual file."
  };
  
  const stubPath = originalPath + '.stub.json';
  fs.writeFileSync(stubPath, JSON.stringify(stubContent, null, 2));
  
  // Create a simple HTML redirect for web access
  if (path.extname(originalPath).toLowerCase() === '.html') {
    const redirectHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${r2Url}">
  <title>Redirecting...</title>
</head>
<body>
  <p>This content has been moved to our CDN. <a href="${r2Url}">Click here if you are not redirected automatically</a>.</p>
</body>
</html>`;
    fs.writeFileSync(originalPath, redirectHtml);
  }
  
  return stubPath;
}

async function offloadToR2(filePath) {
  try {
    const relativePath = path.relative('dist', filePath);
    const r2Key = `assets/${relativePath}`;
    const r2Url = `${R2_PUBLIC_BASE}/${r2Key}`;
    
    // Check if AWS CLI is available
    try {
      execSync('which aws', { stdio: 'ignore' });
    } catch (error) {
      console.warn("⚠️  AWS CLI not available - skipping R2 upload");
      return null;
    }
    
    // Upload to R2 using AWS CLI
    const uploadCommand = `aws --endpoint-url=${R2_ENDPOINT} s3 cp "${filePath}" "s3://${R2_BUCKET}/${r2Key}" --no-progress`;
    
    console.log(`📤 Uploading ${relativePath} to R2...`);
    execSync(uploadCommand, { stdio: 'pipe' });
    
    return r2Url;
  } catch (error) {
    console.error(`❌ Failed to upload ${filePath} to R2:`, error.message);
    return null;
  }
}

async function offloadToSupabase(filePath) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn("⚠️  Supabase credentials not available - skipping Supabase upload");
    return null;
  }
  
  try {
    // Import Supabase dynamically
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const relativePath = path.relative('dist', filePath);
    const fileName = `assets/${relativePath}`;
    
    console.log(`📤 Uploading ${relativePath} to Supabase Storage...`);
    
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error(`❌ Supabase upload failed:`, error.message);
      return null;
    }
    
    const { data: publicData } = supabase.storage
      .from('assets')
      .getPublicUrl(fileName);
    
    return publicData.publicUrl;
  } catch (error) {
    console.error(`❌ Failed to upload ${filePath} to Supabase:`, error.message);
    return null;
  }
}

function scanAndOffload(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`📁 Directory ${dir} does not exist - skipping`);
    return;
  }
  
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanAndOffload(fullPath);
    } else if (entry.isFile()) {
      const stats = fs.statSync(fullPath);
      
      if (shouldOffload(fullPath, stats)) {
        console.log(`🔍 Found large file: ${fullPath} (${formatBytes(stats.size)})`);
        
        // Try R2 first, then Supabase as fallback
        offloadToR2(fullPath)
          .then(r2Url => {
            if (r2Url) {
              const stubPath = createStubFile(fullPath, r2Url, stats.size);
              fs.unlinkSync(fullPath); // Remove original file
              
              offloadedFiles.push({
                originalPath: fullPath,
                stubPath,
                r2Url,
                size: stats.size
              });
              
              totalSizeSaved += stats.size;
              console.log(`✅ Offloaded ${fullPath} to R2`);
            } else {
              // Try Supabase as fallback
              return offloadToSupabase(fullPath);
            }
          })
          .then(supabaseUrl => {
            if (supabaseUrl && !offloadedFiles.find(f => f.originalPath === fullPath)) {
              const stubPath = createStubFile(fullPath, supabaseUrl, stats.size);
              fs.unlinkSync(fullPath); // Remove original file
              
              offloadedFiles.push({
                originalPath: fullPath,
                stubPath,
                supabaseUrl,
                size: stats.size
              });
              
              totalSizeSaved += stats.size;
              console.log(`✅ Offloaded ${fullPath} to Supabase Storage`);
            }
          })
          .catch(error => {
            console.error(`❌ Failed to offload ${fullPath}:`, error.message);
          });
      }
    }
  }
}

console.log("🚀 Starting asset offloading process...");

// Scan dist directory for large files
scanAndOffload('dist');

// Create offload report
const report = {
  timestamp: new Date().toISOString(),
  totalFilesOffloaded: offloadedFiles.length,
  totalSizeSaved: formatBytes(totalSizeSaved),
  files: offloadedFiles
};

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

fs.writeFileSync('dist/offload-report.json', JSON.stringify(report, null, 2));

console.log(`\n📊 Offload Summary:`);
console.log(`   Files offloaded: ${offloadedFiles.length}`);
console.log(`   Space saved: ${formatBytes(totalSizeSaved)}`);
console.log(`   Report saved to: dist/offload-report.json`);

if (offloadedFiles.length > 0) {
  console.log(`\n✅ Asset offloading complete`);
} else {
  console.log(`\n📝 No files needed offloading`);
}