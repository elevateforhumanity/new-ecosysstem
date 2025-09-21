// scripts/split-sitemaps.js
// Split large sitemaps into multiple files with sitemap index

import fs from "fs";
import path from "path";

const config = {
  domain: process.env.DOMAIN || "elevate4humanity.org",
  outputDir: "dist",
  maxUrlsPerSitemap: 45000, // Safe under 50k limit
  sitemapDir: "sitemaps"
};

/**
 * Parse URLs from existing sitemap
 */
function parseUrlsFromSitemap(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) {
    console.error(`❌ Sitemap not found: ${sitemapPath}`);
    console.error("Run sitemap generation first");
    return [];
  }
  
  const xml = fs.readFileSync(sitemapPath, "utf-8");
  const urlMatches = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
  
  return urlMatches.map(match => match[0]);
}

/**
 * Create sitemap chunk
 */
function createSitemapChunk(urls, chunkIndex) {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
  
  const footer = `</urlset>`;
  
  const urlsXml = urls.join("\n");
  
  return `${header}\n${urlsXml}\n${footer}`;
}

/**
 * Create sitemap index
 */
function createSitemapIndex(chunkCount) {
  const baseUrl = `https://${config.domain}`;
  const lastmod = new Date().toISOString();
  
  const sitemaps = [];
  for (let i = 1; i <= chunkCount; i++) {
    sitemaps.push(`  <sitemap>
    <loc>${baseUrl}/${config.sitemapDir}/sitemap-${i}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`);
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join("\n")}
</sitemapindex>`;
}

/**
 * Split sitemap into multiple files if needed
 */
export function splitSitemaps() {
  console.log("🗂️ Checking if sitemap needs splitting...");
  
  const mainSitemapPath = path.join(config.outputDir, "sitemap.xml");
  const urls = parseUrlsFromSitemap(mainSitemapPath);
  
  if (urls.length === 0) {
    console.log("⚠️ No URLs found in sitemap");
    return { success: false, reason: "No URLs found" };
  }
  
  console.log(`📊 Found ${urls.length} URLs in sitemap`);
  
  if (urls.length <= config.maxUrlsPerSitemap) {
    console.log("✅ Single sitemap is sufficient (under limit)");
    return { success: true, sitemaps: 1, split: false };
  }
  
  console.log(`📦 Splitting sitemap (${urls.length} URLs > ${config.maxUrlsPerSitemap} limit)`);
  
  // Create sitemaps directory
  const sitemapsDir = path.join(config.outputDir, config.sitemapDir);
  if (!fs.existsSync(sitemapsDir)) {
    fs.mkdirSync(sitemapsDir, { recursive: true });
  }
  
  // Split URLs into chunks
  const chunks = [];
  for (let i = 0; i < urls.length; i += config.maxUrlsPerSitemap) {
    chunks.push(urls.slice(i, i + config.maxUrlsPerSitemap));
  }
  
  // Create individual sitemap files
  chunks.forEach((chunk, index) => {
    const chunkIndex = index + 1;
    const sitemapContent = createSitemapChunk(chunk, chunkIndex);
    const sitemapPath = path.join(sitemapsDir, `sitemap-${chunkIndex}.xml`);
    
    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log(`✅ Created sitemap-${chunkIndex}.xml (${chunk.length} URLs)`);
  });
  
  // Create sitemap index
  const indexContent = createSitemapIndex(chunks.length);
  const indexPath = path.join(config.outputDir, "sitemap-index.xml");
  fs.writeFileSync(indexPath, indexContent);
  
  // Replace main sitemap with index
  fs.writeFileSync(mainSitemapPath, indexContent);
  
  console.log(`✅ Created sitemap index with ${chunks.length} sitemaps`);
  console.log(`📁 Sitemaps directory: ${config.sitemapDir}/`);
  
  return {
    success: true,
    sitemaps: chunks.length,
    split: true,
    totalUrls: urls.length,
    indexPath: "sitemap.xml",
    sitemapPaths: chunks.map((_, i) => `${config.sitemapDir}/sitemap-${i + 1}.xml`)
  };
}

/**
 * Validate sitemap structure
 */
export function validateSitemaps() {
  console.log("🔍 Validating sitemap structure...");
  
  const mainSitemapPath = path.join(config.outputDir, "sitemap.xml");
  if (!fs.existsSync(mainSitemapPath)) {
    console.log("❌ Main sitemap not found");
    return { success: false, reason: "Main sitemap missing" };
  }
  
  const xml = fs.readFileSync(mainSitemapPath, "utf-8");
  const issues = [];
  
  // Check for sitemap index vs regular sitemap
  const isSitemapIndex = xml.includes("<sitemapindex");
  const isRegularSitemap = xml.includes("<urlset");
  
  if (!isSitemapIndex && !isRegularSitemap) {
    issues.push("Invalid sitemap format");
  }
  
  if (isSitemapIndex) {
    // Validate sitemap index
    const sitemapRefs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
    console.log(`📊 Sitemap index references ${sitemapRefs.length} sitemaps`);
    
    // Check if referenced sitemaps exist
    for (const match of sitemapRefs) {
      const url = match[1];
      const relativePath = url.replace(`https://${config.domain}/`, "");
      const filePath = path.join(config.outputDir, relativePath);
      
      if (!fs.existsSync(filePath)) {
        issues.push(`Referenced sitemap not found: ${relativePath}`);
      }
    }
  } else {
    // Validate regular sitemap
    const urls = [...xml.matchAll(/<url>/g)];
    console.log(`📊 Regular sitemap contains ${urls.length} URLs`);
    
    if (urls.length > config.maxUrlsPerSitemap) {
      issues.push(`Too many URLs in single sitemap: ${urls.length} > ${config.maxUrlsPerSitemap}`);
    }
  }
  
  if (issues.length === 0) {
    console.log("✅ Sitemap structure is valid");
    return { success: true, type: isSitemapIndex ? "index" : "regular" };
  } else {
    console.log("❌ Sitemap validation issues:");
    issues.forEach(issue => console.log(`   - ${issue}`));
    return { success: false, issues };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case "validate":
      validateSitemaps();
      break;
    case "split":
    default:
      splitSitemaps();
      break;
  }
}