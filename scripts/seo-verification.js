// scripts/seo-verification.js
// Generate and manage search engine verification files and meta tags

import fs from 'fs';
import path from 'path';

const config = {
  domain: process.env.DOMAIN || 'elevate4humanity.org',
  googleVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
  bingVerification: process.env.BING_SITE_VERIFICATION || '',
  outputDir: 'dist'
};

/**
 * Generate Google verification file
 */
export function generateGoogleVerificationFile() {
  if (!config.googleVerification) {
    console.log("⚠️ GOOGLE_SITE_VERIFICATION not set, skipping Google verification file");
    return { success: false, reason: 'No verification code' };
  }
  
  console.log("🔍 Generating Google verification file...");
  
  const content = `google-site-verification: ${config.googleVerification}`;
  const filename = `google${config.googleVerification}.html`;
  const filepath = path.join(config.outputDir, filename);
  
  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, content);
  
  console.log(`✅ Google verification file created: ${filename}`);
  return { 
    success: true, 
    filename, 
    url: `https://${config.domain}/${filename}` 
  };
}

/**
 * Generate Bing verification file
 */
export function generateBingVerificationFile() {
  if (!config.bingVerification) {
    console.log("⚠️ BING_SITE_VERIFICATION not set, skipping Bing verification file");
    return { success: false, reason: 'No verification code' };
  }
  
  console.log("🔍 Generating Bing verification file...");
  
  const content = `<?xml version="1.0"?>
<users>
  <user>${config.bingVerification}</user>
</users>`;
  
  const filename = 'BingSiteAuth.xml';
  const filepath = path.join(config.outputDir, filename);
  
  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, content);
  
  console.log(`✅ Bing verification file created: ${filename}`);
  return { 
    success: true, 
    filename, 
    url: `https://${config.domain}/${filename}` 
  };
}

/**
 * Generate verification meta tags for HTML injection
 */
export function generateVerificationMetaTags() {
  console.log("📝 Generating verification meta tags...");
  
  const metaTags = [];
  
  if (config.googleVerification) {
    metaTags.push(`<meta name="google-site-verification" content="${config.googleVerification}">`);
  }
  
  if (config.bingVerification) {
    metaTags.push(`<meta name="msvalidate.01" content="${config.bingVerification}">`);
  }
  
  if (metaTags.length === 0) {
    console.log("⚠️ No verification codes configured");
    return { success: false, reason: 'No verification codes' };
  }
  
  const metaContent = metaTags.join('\n  ');
  const metaFile = path.join(config.outputDir, 'verification-meta.html');
  
  fs.writeFileSync(metaFile, `  ${metaContent}\n`);
  
  console.log(`✅ Verification meta tags generated: ${metaTags.length} tags`);
  return { 
    success: true, 
    tags: metaTags.length, 
    content: metaContent 
  };
}

/**
 * Inject verification meta tags into existing HTML files
 */
export function injectVerificationIntoHTML(htmlFiles = []) {
  console.log("💉 Injecting verification meta tags into HTML files...");
  
  if (htmlFiles.length === 0) {
    // Default to index.html if no files specified
    const indexPath = path.join(config.outputDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      htmlFiles = [indexPath];
    } else {
      console.log("⚠️ No HTML files found to inject verification tags");
      return { success: false, reason: 'No HTML files found' };
    }
  }
  
  const verificationMeta = generateVerificationMetaTags();
  if (!verificationMeta.success) {
    return verificationMeta;
  }
  
  const results = [];
  
  for (const htmlFile of htmlFiles) {
    try {
      if (!fs.existsSync(htmlFile)) {
        console.log(`⚠️ HTML file not found: ${htmlFile}`);
        results.push({ file: htmlFile, success: false, reason: 'File not found' });
        continue;
      }
      
      let html = fs.readFileSync(htmlFile, 'utf-8');
      
      // Check if verification tags already exist
      if (html.includes('google-site-verification') || html.includes('msvalidate.01')) {
        console.log(`✅ Verification tags already present in ${path.basename(htmlFile)}`);
        results.push({ file: htmlFile, success: true, action: 'already_present' });
        continue;
      }
      
      // Inject before closing </head> tag
      if (html.includes('</head>')) {
        html = html.replace('</head>', `  ${verificationMeta.content}\n</head>`);
        fs.writeFileSync(htmlFile, html);
        
        console.log(`✅ Verification tags injected into ${path.basename(htmlFile)}`);
        results.push({ file: htmlFile, success: true, action: 'injected' });
      } else {
        console.log(`⚠️ No </head> tag found in ${path.basename(htmlFile)}`);
        results.push({ file: htmlFile, success: false, reason: 'No head tag' });
      }
      
    } catch (error) {
      console.error(`❌ Failed to process ${htmlFile}:`, error.message);
      results.push({ file: htmlFile, success: false, error: error.message });
    }
  }
  
  const successful = results.filter(r => r.success).length;
  console.log(`📊 Verification injection: ${successful}/${results.length} files processed`);
  
  return { success: successful > 0, results };
}

/**
 * Verify that verification files are accessible
 */
export async function verifyVerificationFiles() {
  console.log("🔍 Verifying verification files are accessible...");
  
  const checks = [];
  
  // Check Google verification file
  if (config.googleVerification) {
    const googleUrl = `https://${config.domain}/google${config.googleVerification}.html`;
    try {
      const response = await fetch(googleUrl);
      checks.push({
        type: 'google',
        url: googleUrl,
        status: response.status,
        success: response.status === 200
      });
    } catch (error) {
      checks.push({
        type: 'google',
        url: googleUrl,
        error: error.message,
        success: false
      });
    }
  }
  
  // Check Bing verification file
  if (config.bingVerification) {
    const bingUrl = `https://${config.domain}/BingSiteAuth.xml`;
    try {
      const response = await fetch(bingUrl);
      checks.push({
        type: 'bing',
        url: bingUrl,
        status: response.status,
        success: response.status === 200
      });
    } catch (error) {
      checks.push({
        type: 'bing',
        url: bingUrl,
        error: error.message,
        success: false
      });
    }
  }
  
  const successful = checks.filter(c => c.success).length;
  
  console.log(`📊 Verification file accessibility: ${successful}/${checks.length} files accessible`);
  
  for (const check of checks) {
    if (check.success) {
      console.log(`✅ ${check.type}: ${check.url} (HTTP ${check.status})`);
    } else {
      console.log(`❌ ${check.type}: ${check.url} - ${check.error || `HTTP ${check.status}`}`);
    }
  }
  
  return { success: successful === checks.length, checks };
}

/**
 * Generate all verification assets
 */
export async function generateAllVerificationAssets() {
  console.log("🔍 Generating all verification assets...");
  
  const results = {};
  
  // Generate files
  results.googleFile = generateGoogleVerificationFile();
  results.bingFile = generateBingVerificationFile();
  
  // Generate meta tags
  results.metaTags = generateVerificationMetaTags();
  
  // Inject into HTML
  results.htmlInjection = injectVerificationIntoHTML();
  
  // Verify accessibility (if files were generated)
  if (results.googleFile.success || results.bingFile.success) {
    console.log("⏳ Waiting 5 seconds before verification check...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    results.verification = await verifyVerificationFiles();
  }
  
  return results;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'google':
      generateGoogleVerificationFile();
      break;
    case 'bing':
      generateBingVerificationFile();
      break;
    case 'meta':
      generateVerificationMetaTags();
      break;
    case 'inject':
      const htmlFiles = process.argv.slice(3);
      injectVerificationIntoHTML(htmlFiles);
      break;
    case 'verify':
      await verifyVerificationFiles();
      break;
    case 'all':
      await generateAllVerificationAssets();
      break;
    default:
      console.log("Usage: node seo-verification.js [google|bing|meta|inject|verify|all]");
      console.log("Examples:");
      console.log("  node seo-verification.js all");
      console.log("  node seo-verification.js inject dist/index.html dist/about.html");
      console.log("  node seo-verification.js verify");
  }
}