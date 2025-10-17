#!/usr/bin/env node

import {
  readdirSync,
  writeFileSync,
  statSync,
  existsSync,
  mkdirSync,
} from 'node:fs';
import { join, relative } from 'node:path';

const SITE_URL = process.env.VITE_SITE_URL || 'https://elevateforhumanity.org';
const DIST_DIR = 'dist';
const SITEMAPS_DIR = join(DIST_DIR, 'sitemaps');
const URLS_PER_SITEMAP = 50; // Google recommends max 50,000 but we'll use 50 for better organization

// Ensure sitemaps directory exists
if (!existsSync(SITEMAPS_DIR)) {
  mkdirSync(SITEMAPS_DIR, { recursive: true });
}

// Get all HTML files recursively
function getAllHtmlFiles(dir, baseDir = dir) {
  const files = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip certain directories
      if (
        ['assets', 'client', 'server', '_next', 'node_modules'].includes(item)
      ) {
        continue;
      }
      files.push(...getAllHtmlFiles(fullPath, baseDir));
    } else if (item.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Convert file path to URL
function filePathToUrl(filePath, baseDir) {
  let relativePath = relative(baseDir, filePath);

  // Remove index.html
  relativePath = relativePath.replace(/index\.html$/, '');

  // Remove .html extension
  relativePath = relativePath.replace(/\.html$/, '');

  // Convert to URL path
  let urlPath = '/' + relativePath.replace(/\\/g, '/');

  // Clean up double slashes
  urlPath = urlPath.replace(/\/+/g, '/');

  // Remove trailing slash except for root
  if (urlPath !== '/' && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }

  return urlPath;
}

// Get priority based on URL
function getPriority(url) {
  if (url === '/') return '1.0';
  if (url.match(/^\/(programs|lms|about|contact|get-started)$/)) return '0.9';
  if (url.match(/^\/(student|instructor|courses)/)) return '0.8';
  if (url.match(/^\/(privacy|terms|refund|accessibility)/)) return '0.5';
  return '0.7';
}

// Get change frequency based on URL
function getChangeFreq(url) {
  if (url === '/') return 'daily';
  if (url.match(/^\/(programs|courses|lms)/)) return 'weekly';
  if (url.match(/^\/(blog|news)/)) return 'daily';
  if (url.match(/^\/(privacy|terms|refund)/)) return 'yearly';
  return 'monthly';
}

// Generate sitemap XML for a group of URLs
function generateSitemapXml(urls) {
  const urlEntries = urls
    .map((url) => {
      const fullUrl = `${SITE_URL}${url}`;
      const priority = getPriority(url);
      const changefreq = getChangeFreq(url);
      const lastmod = new Date().toISOString().split('T')[0];

      return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

// Generate sitemap index
function generateSitemapIndex(sitemapFiles) {
  const lastmod = new Date().toISOString().split('T')[0];

  const sitemapEntries = sitemapFiles
    .map((filename) => {
      return `  <sitemap>
    <loc>${SITE_URL}/sitemaps/${filename}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
              http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd">
${sitemapEntries}
</sitemapindex>`;
}

// Main function
function generateSitemaps() {
  console.log('🗺️  Generating comprehensive sitemaps...\n');

  // Get all HTML files
  const htmlFiles = getAllHtmlFiles(DIST_DIR);
  console.log(`📄 Found ${htmlFiles.length} HTML files`);

  // Convert to URLs and remove duplicates
  const urls = [
    ...new Set(htmlFiles.map((file) => filePathToUrl(file, DIST_DIR))),
  ];
  console.log(`🔗 Generated ${urls.length} unique URLs`);

  // Sort URLs for consistent output
  urls.sort();

  // Split URLs into groups of 50
  const urlGroups = [];
  for (let i = 0; i < urls.length; i += URLS_PER_SITEMAP) {
    urlGroups.push(urls.slice(i, i + URLS_PER_SITEMAP));
  }

  console.log(
    `📦 Split into ${urlGroups.length} sitemap files (${URLS_PER_SITEMAP} URLs each)\n`
  );

  // Generate individual sitemaps
  const sitemapFiles = [];
  urlGroups.forEach((group, index) => {
    const filename = `sitemap-${index + 1}.xml`;
    const xml = generateSitemapXml(group);
    const filepath = join(SITEMAPS_DIR, filename);

    writeFileSync(filepath, xml);
    sitemapFiles.push(filename);

    console.log(`✅ ${filename} (${group.length} URLs)`);
  });

  // Generate sitemap index
  const indexXml = generateSitemapIndex(sitemapFiles);
  writeFileSync(join(DIST_DIR, 'sitemap.xml'), indexXml);
  console.log(`\n✅ sitemap.xml (index file)`);

  // Also copy to root for backwards compatibility
  writeFileSync(join(DIST_DIR, 'sitemap_index.xml'), indexXml);

  // Generate summary
  console.log('\n📊 Summary:');
  console.log(`   Total URLs: ${urls.length}`);
  console.log(`   Sitemap files: ${sitemapFiles.length}`);
  console.log(`   URLs per file: ${URLS_PER_SITEMAP}`);
  console.log(`   Site URL: ${SITE_URL}`);
  console.log(`\n🌐 Submit to search engines:`);
  console.log(`   ${SITE_URL}/sitemap.xml`);
}

// Run
try {
  generateSitemaps();
} catch (error) {
  console.error('❌ Error generating sitemaps:', error);
  process.exit(1);
}
