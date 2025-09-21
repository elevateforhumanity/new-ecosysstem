// scripts/generate-master-sitemaps.js
// Generate comprehensive sitemap index from collected URLs

import fs from "fs";
import path from "path";

const config = {
  domain: process.env.DOMAIN || "elevate4humanity.org",
  outputDir: "dist",
  sitemapDir: "sitemaps",
  maxUrlsPerSitemap: 45000, // Safe under 50k Google limit
  baseUrl: `https://${process.env.DOMAIN || "elevate4humanity.org"}`
};

/**
 * Load collected URLs
 */
function loadCollectedUrls() {
  const urlFile = path.join(config.outputDir, "url-collection.json");
  
  if (!fs.existsSync(urlFile)) {
    console.error("❌ URL collection file not found");
    console.error("Run 'node scripts/collect-urls.js' first");
    return [];
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(urlFile, "utf-8"));
    console.log(`📊 Loaded ${data.length} URLs from collection`);
    return data;
  } catch (error) {
    console.error("❌ Failed to parse URL collection:", error.message);
    return [];
  }
}

/**
 * Create sitemap XML content
 */
function createSitemapXml(urls) {
  const urlElements = urls.map(urlObj => {
    const url = typeof urlObj === 'string' ? urlObj : urlObj.url;
    const lastmod = urlObj.lastmod || new Date().toISOString();
    const priority = urlObj.priority || "0.5";
    const changefreq = urlObj.changefreq || "weekly";
    
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlElements}
</urlset>`;
}

/**
 * Create sitemap index XML
 */
function createSitemapIndexXml(sitemapFiles) {
  const lastmod = new Date().toISOString();
  
  const sitemapElements = sitemapFiles.map(filename => `  <sitemap>
    <loc>${config.baseUrl}/${config.sitemapDir}/${filename}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join("\n");
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

/**
 * Split URLs into chunks and generate sitemaps
 */
function generateSitemapChunks(urls) {
  console.log("📦 Splitting URLs into sitemap chunks...");
  
  // Create sitemaps directory
  const sitemapsPath = path.join(config.outputDir, config.sitemapDir);
  if (!fs.existsSync(sitemapsPath)) {
    fs.mkdirSync(sitemapsPath, { recursive: true });
  }
  
  // Split URLs into chunks
  const chunks = [];
  for (let i = 0; i < urls.length; i += config.maxUrlsPerSitemap) {
    chunks.push(urls.slice(i, i + config.maxUrlsPerSitemap));
  }
  
  console.log(`📊 Creating ${chunks.length} sitemap chunks`);
  
  // Generate individual sitemap files
  const sitemapFiles = [];
  chunks.forEach((chunk, index) => {
    const filename = `sitemap-${index + 1}.xml`;
    const filepath = path.join(sitemapsPath, filename);
    const sitemapXml = createSitemapXml(chunk);
    
    fs.writeFileSync(filepath, sitemapXml);
    sitemapFiles.push(filename);
    
    console.log(`✅ Generated ${filename} (${chunk.length} URLs)`);
  });
  
  return sitemapFiles;
}

/**
 * Generate sitemap index
 */
function generateSitemapIndex(sitemapFiles) {
  console.log("📋 Generating sitemap index...");
  
  const indexXml = createSitemapIndexXml(sitemapFiles);
  const indexPath = path.join(config.outputDir, "sitemap.xml");
  
  fs.writeFileSync(indexPath, indexXml);
  
  // Also create sitemap-index.xml for explicit reference
  const explicitIndexPath = path.join(config.outputDir, "sitemap-index.xml");
  fs.writeFileSync(explicitIndexPath, indexXml);
  
  console.log(`✅ Sitemap index created: sitemap.xml`);
  console.log(`✅ Explicit index created: sitemap-index.xml`);
  
  return indexPath;
}

/**
 * Generate robots.txt reference
 */
function updateRobotsTxt(sitemapFiles) {
  console.log("🤖 Updating robots.txt with sitemap references...");
  
  const robotsPath = path.join(config.outputDir, "robots.txt");
  let robotsContent = "";
  
  // Read existing robots.txt if it exists
  if (fs.existsSync(robotsPath)) {
    robotsContent = fs.readFileSync(robotsPath, "utf-8");
    
    // Remove existing sitemap lines
    robotsContent = robotsContent
      .split("\n")
      .filter(line => !line.toLowerCase().startsWith("sitemap:"))
      .join("\n");
  } else {
    // Create basic robots.txt
    robotsContent = `User-agent: *
Allow: /

# Block admin areas
Disallow: /admin/
Disallow: /_netlify/
Disallow: /api/

`;
  }
  
  // Add sitemap references
  robotsContent += `\n# Sitemaps\n`;
  robotsContent += `Sitemap: ${config.baseUrl}/sitemap.xml\n`;
  robotsContent += `Sitemap: ${config.baseUrl}/sitemap-index.xml\n`;
  
  // Add individual sitemaps for direct reference
  sitemapFiles.forEach(filename => {
    robotsContent += `Sitemap: ${config.baseUrl}/${config.sitemapDir}/${filename}\n`;
  });
  
  fs.writeFileSync(robotsPath, robotsContent);
  console.log("✅ robots.txt updated with sitemap references");
}

/**
 * Validate generated sitemaps
 */
function validateSitemaps(sitemapFiles) {
  console.log("🔍 Validating generated sitemaps...");
  
  const issues = [];
  
  // Check main sitemap index
  const mainSitemapPath = path.join(config.outputDir, "sitemap.xml");
  if (!fs.existsSync(mainSitemapPath)) {
    issues.push("Main sitemap.xml not found");
  }
  
  // Check individual sitemaps
  sitemapFiles.forEach(filename => {
    const filepath = path.join(config.outputDir, config.sitemapDir, filename);
    if (!fs.existsSync(filepath)) {
      issues.push(`Sitemap file missing: ${filename}`);
    } else {
      // Basic XML validation
      const content = fs.readFileSync(filepath, "utf-8");
      if (!content.includes("<urlset") || !content.includes("</urlset>")) {
        issues.push(`Invalid XML structure in: ${filename}`);
      }
    }
  });
  
  if (issues.length === 0) {
    console.log("✅ All sitemaps validated successfully");
    return true;
  } else {
    console.log("❌ Sitemap validation issues:");
    issues.forEach(issue => console.log(`   - ${issue}`));
    return false;
  }
}

/**
 * Generate comprehensive sitemap report
 */
function generateSitemapReport(urls, sitemapFiles) {
  const report = {
    timestamp: new Date().toISOString(),
    domain: config.domain,
    baseUrl: config.baseUrl,
    totalUrls: urls.length,
    sitemapChunks: sitemapFiles.length,
    maxUrlsPerSitemap: config.maxUrlsPerSitemap,
    sitemapFiles: sitemapFiles.map((filename, index) => {
      const startIndex = index * config.maxUrlsPerSitemap;
      const endIndex = Math.min(startIndex + config.maxUrlsPerSitemap, urls.length);
      return {
        filename,
        urlCount: endIndex - startIndex,
        path: `/${config.sitemapDir}/${filename}`,
        url: `${config.baseUrl}/${config.sitemapDir}/${filename}`
      };
    }),
    indexFiles: [
      {
        filename: "sitemap.xml",
        path: "/sitemap.xml",
        url: `${config.baseUrl}/sitemap.xml`
      },
      {
        filename: "sitemap-index.xml", 
        path: "/sitemap-index.xml",
        url: `${config.baseUrl}/sitemap-index.xml`
      }
    ],
    urlsByPriority: {
      high: urls.filter(u => parseFloat(u.priority || 0.5) >= 0.8).length,
      medium: urls.filter(u => {
        const p = parseFloat(u.priority || 0.5);
        return p >= 0.5 && p < 0.8;
      }).length,
      low: urls.filter(u => parseFloat(u.priority || 0.5) < 0.5).length
    }
  };
  
  const reportPath = path.join(config.outputDir, "sitemap-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log("📊 Sitemap generation report:");
  console.log(`   Total URLs: ${report.totalUrls}`);
  console.log(`   Sitemap chunks: ${report.sitemapChunks}`);
  console.log(`   High priority URLs: ${report.urlsByPriority.high}`);
  console.log(`   Medium priority URLs: ${report.urlsByPriority.medium}`);
  console.log(`   Low priority URLs: ${report.urlsByPriority.low}`);
  
  return report;
}

/**
 * Main sitemap generation function
 */
export async function generateMasterSitemaps() {
  console.log("🗺️ Starting master sitemap generation...");
  console.log(`📍 Domain: ${config.domain}`);
  
  try {
    // Load collected URLs
    const urls = loadCollectedUrls();
    if (urls.length === 0) {
      throw new Error("No URLs found to generate sitemaps");
    }
    
    // Generate sitemap chunks
    const sitemapFiles = generateSitemapChunks(urls);
    
    // Generate sitemap index
    generateSitemapIndex(sitemapFiles);
    
    // Update robots.txt
    updateRobotsTxt(sitemapFiles);
    
    // Validate sitemaps
    const isValid = validateSitemaps(sitemapFiles);
    
    // Generate report
    const report = generateSitemapReport(urls, sitemapFiles);
    
    console.log("\n🎉 Master sitemap generation complete!");
    console.log(`📁 Generated files:`);
    console.log(`   sitemap.xml - Main sitemap index`);
    console.log(`   sitemap-index.xml - Explicit index`);
    console.log(`   ${config.sitemapDir}/ - ${sitemapFiles.length} sitemap chunks`);
    console.log(`   robots.txt - Updated with sitemap references`);
    console.log(`   sitemap-report.json - Generation report`);
    
    return {
      success: true,
      totalUrls: urls.length,
      sitemapFiles,
      isValid,
      report
    };
    
  } catch (error) {
    console.error("💥 Master sitemap generation failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  await generateMasterSitemaps();
}