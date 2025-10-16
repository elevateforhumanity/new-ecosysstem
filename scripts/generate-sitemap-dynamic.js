/**
 * Dynamic Sitemap Generator
 * Generates sitemaps for all pages, courses, and dynamic content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://lms.elevateforhumanity.org';
const OUTPUT_DIR = path.join(__dirname, '../public');

// Static pages
const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/courses', priority: 0.9, changefreq: 'daily' },
  { url: '/programs', priority: 0.9, changefreq: 'weekly' },
  { url: '/lms', priority: 0.9, changefreq: 'daily' },
  { url: '/get-started', priority: 0.8, changefreq: 'weekly' },
  { url: '/partners', priority: 0.8, changefreq: 'weekly' },
  { url: '/ecosystem', priority: 0.7, changefreq: 'weekly' },
  { url: '/donate', priority: 0.7, changefreq: 'monthly' },
  { url: '/about', priority: 0.6, changefreq: 'monthly' },
  { url: '/support', priority: 0.6, changefreq: 'monthly' },
  { url: '/login', priority: 0.5, changefreq: 'monthly' },
  { url: '/privacy-policy', priority: 0.4, changefreq: 'yearly' },
  { url: '/terms-of-service', priority: 0.4, changefreq: 'yearly' },
];

// Dynamic pages (will be fetched from API in production)
const dynamicPages = {
  courses: [
    // These would come from API: /api/courses
    // Example: { id: '123', slug: 'web-development', updated: '2024-01-15' }
  ],
  programs: [
    // These would come from API: /api/programs
  ],
  partners: [
    // These would come from API: /api/partners
  ]
};

function generateSitemapXML(pages, filename) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq || 'weekly'}</changefreq>
    <priority>${page.priority || 0.5}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, filename), xml);
  console.log(`✅ Generated ${filename}`);
}

function generateSitemapIndex() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-courses.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), xml);
  console.log('✅ Generated sitemap.xml (index)');
}

// Generate sitemaps
console.log('🗺️  Generating sitemaps...\n');

// Static pages sitemap
generateSitemapXML(staticPages, 'sitemap-pages.xml');

// Courses sitemap (placeholder - will be dynamic in production)
const coursesPages = [
  { url: '/courses', priority: 0.9, changefreq: 'daily' },
  { url: '/courses/catalog', priority: 0.8, changefreq: 'daily' },
];
generateSitemapXML(coursesPages, 'sitemap-courses.xml');

// Main sitemap index
generateSitemapIndex();

console.log('\n✅ All sitemaps generated successfully!');
