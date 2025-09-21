// scripts/inject-canonical.js
// Inject canonical URLs to prevent duplicate content issues

import fs from "fs";
import path from "path";
import { glob } from "glob";

const config = {
  domain: process.env.DOMAIN || "elevate4humanity.org",
  outputDir: "dist"
};

/**
 * Inject canonical link into HTML file
 */
function injectCanonical(filePath, canonicalUrl) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return false;
  }
  
  let html = fs.readFileSync(filePath, "utf-8");
  
  // Check if canonical already exists
  if (html.includes('rel="canonical"')) {
    console.log(`✅ Canonical already present in ${path.basename(filePath)}`);
    return true;
  }
  
  const canonicalTag = `  <link rel="canonical" href="${canonicalUrl}" />`;
  
  if (html.includes("</head>")) {
    html = html.replace("</head>", `${canonicalTag}\n</head>`);
    fs.writeFileSync(filePath, html);
    console.log(`✅ Canonical added to ${path.basename(filePath)}: ${canonicalUrl}`);
    return true;
  } else {
    console.log(`⚠️ No </head> tag found in ${path.basename(filePath)}`);
    return false;
  }
}

/**
 * Generate canonical URLs for all HTML files
 */
export async function injectCanonicalUrls() {
  console.log("🔗 Injecting canonical URLs...");
  
  const baseUrl = `https://${config.domain}`;
  const results = [];
  
  // Find all HTML files in output directory
  const htmlFiles = await glob(`${config.outputDir}/**/*.html`);
  
  for (const filePath of htmlFiles) {
    // Determine canonical URL based on file path
    const relativePath = path.relative(config.outputDir, filePath);
    let canonicalUrl;
    
    if (relativePath === "index.html") {
      canonicalUrl = `${baseUrl}/`;
    } else if (relativePath.endsWith("/index.html")) {
      // Directory index files
      const dirPath = path.dirname(relativePath);
      canonicalUrl = `${baseUrl}/${dirPath}/`;
    } else if (relativePath.endsWith(".html")) {
      // Regular HTML files
      const urlPath = relativePath.replace(/\.html$/, "");
      canonicalUrl = `${baseUrl}/${urlPath}`;
    } else {
      continue; // Skip non-HTML files
    }
    
    const success = injectCanonical(filePath, canonicalUrl);
    results.push({
      file: relativePath,
      canonicalUrl,
      success
    });
  }
  
  const successful = results.filter(r => r.success).length;
  console.log(`📊 Canonical injection: ${successful}/${results.length} files processed`);
  
  return { success: successful > 0, results };
}

/**
 * Inject canonical for specific page
 */
export function injectCanonicalForPage(pagePath, customUrl = null) {
  console.log(`🔗 Injecting canonical for specific page: ${pagePath}`);
  
  const filePath = path.join(config.outputDir, pagePath);
  const baseUrl = `https://${config.domain}`;
  
  let canonicalUrl;
  if (customUrl) {
    canonicalUrl = customUrl;
  } else if (pagePath === "index.html") {
    canonicalUrl = `${baseUrl}/`;
  } else if (pagePath.endsWith(".html")) {
    const urlPath = pagePath.replace(/\.html$/, "");
    canonicalUrl = `${baseUrl}/${urlPath}`;
  } else {
    canonicalUrl = `${baseUrl}/${pagePath}`;
  }
  
  const success = injectCanonical(filePath, canonicalUrl);
  return { success, canonicalUrl };
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const specificPage = process.argv[2];
  const customUrl = process.argv[3];
  
  if (specificPage) {
    injectCanonicalForPage(specificPage, customUrl);
  } else {
    await injectCanonicalUrls();
  }
}