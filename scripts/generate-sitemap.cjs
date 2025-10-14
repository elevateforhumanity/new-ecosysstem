#!/usr/bin/env node

/*
  Automated Sitemap Generator
  Generates comprehensive sitemaps with proper crawling structure
*/

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://elevateforhumanity.org';
const OUTPUT_DIR = path.join(__dirname, '../public');
const SITEMAP_DIR = path.join(OUTPUT_DIR, 'sitemaps');

// Ensure directories exist
if (!fs.existsSync(SITEMAP_DIR)) {
  fs.mkdirSync(SITEMAP_DIR, { recursive: true });
}

// Core pages with priority and change frequency
const pages = [
  // High priority pages
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/programs', priority: 0.9, changefreq: 'daily' },
  { url: '/government', priority: 0.9, changefreq: 'weekly' },
  { url: '/philanthropy', priority: 0.9, changefreq: 'weekly' },
  { url: '/partners', priority: 0.9, changefreq: 'weekly' },
  { url: '/about', priority: 0.8, changefreq: 'monthly' },
  { url: '/apply', priority: 0.9, changefreq: 'daily' },
  
  // Program pages
  { url: '/programs/clinical-informatics', priority: 0.8, changefreq: 'weekly' },
  { url: '/programs/cybersecurity', priority: 0.8, changefreq: 'weekly' },
  { url: '/programs/cloud-computing', priority: 0.8, changefreq: 'weekly' },
  { url: '/programs/healthcare-it', priority: 0.8, changefreq: 'weekly' },
  { url: '/programs/apprenticeships', priority: 0.8, changefreq: 'weekly' },
  { url: '/programs/workkeys', priority: 0.8, changefreq: 'weekly' },
  
  // Government contracting
  { url: '/government/federal-contracts', priority: 0.8, changefreq: 'weekly' },
  { url: '/government/state-contracts', priority: 0.8, changefreq: 'weekly' },
  { url: '/government/sam-gov', priority: 0.8, changefreq: 'weekly' },
  { url: '/government/etpl', priority: 0.8, changefreq: 'weekly' },
  
  // Philanthropy
  { url: '/philanthropy/grants', priority: 0.8, changefreq: 'weekly' },
  { url: '/philanthropy/impact', priority: 0.7, changefreq: 'monthly' },
  { url: '/philanthropy/nonprofit', priority: 0.8, changefreq: 'monthly' },
  
  // Student resources
  { url: '/student', priority: 0.7, changefreq: 'weekly' },
  { url: '/lms', priority: 0.7, changefreq: 'daily' },
  { url: '/hub', priority: 0.7, changefreq: 'daily' },
  { url: '/connect', priority: 0.7, changefreq: 'daily' },
  
  // Support pages
  { url: '/support', priority: 0.6, changefreq: 'monthly' },
  { url: '/faq', priority: 0.6, changefreq: 'monthly' },
  { url: '/contact', priority: 0.7, changefreq: 'monthly' },
  
  // Legal pages
  { url: '/compliance', priority: 0.5, changefreq: 'monthly' },
  { url: '/accessibility', priority: 0.5, changefreq: 'monthly' },
  { url: '/privacy-policy', priority: 0.5, changefreq: 'monthly' },
  { url: '/terms-of-service', priority: 0.5, changefreq: 'monthly' },
  
  // Payment and donations
  { url: '/pay', priority: 0.7, changefreq: 'monthly' },
  { url: '/donate', priority: 0.8, changefreq: 'monthly' },
  
  // Blog and resources
  { url: '/blog', priority: 0.7, changefreq: 'daily' },
  { url: '/resources', priority: 0.6, changefreq: 'weekly' },
  { url: '/calendar', priority: 0.6, changefreq: 'daily' }
];

function generateSitemapXML(urls, filename) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(page => `  <url>
    <loc>${DOMAIN}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(SITEMAP_DIR, filename), xml);
  console.log(`✅ Generated ${filename}`);
}

function generateSitemapIndex() {
  const sitemaps = [
    'sitemap-main.xml',
    'sitemap-programs.xml',
    'sitemap-government.xml',
    'sitemap-philanthropy.xml',
    'sitemap-blog.xml'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${DOMAIN}/sitemaps/${sitemap}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), xml);
  console.log('✅ Generated sitemap index');
}

function generateRobotsTxt() {
  const robots = `# Elevate for Humanity - Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

# Sitemaps
Sitemap: ${DOMAIN}/sitemap.xml
Sitemap: ${DOMAIN}/sitemaps/sitemap-main.xml
Sitemap: ${DOMAIN}/sitemaps/sitemap-programs.xml
Sitemap: ${DOMAIN}/sitemaps/sitemap-government.xml
Sitemap: ${DOMAIN}/sitemaps/sitemap-philanthropy.xml
Sitemap: ${DOMAIN}/sitemaps/sitemap-blog.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Allow all major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'robots.txt'), robots);
  console.log('✅ Generated robots.txt');
}

// Generate individual sitemaps
console.log('🗺️  Generating sitemaps...\n');

// Main sitemap
const mainPages = pages.filter(p => 
  !p.url.includes('/programs/') && 
  !p.url.includes('/government/') && 
  !p.url.includes('/philanthropy/') &&
  !p.url.includes('/blog/')
);
generateSitemapXML(mainPages, 'sitemap-main.xml');

// Programs sitemap
const programPages = pages.filter(p => p.url.includes('/programs/'));
generateSitemapXML(programPages, 'sitemap-programs.xml');

// Government sitemap
const govPages = pages.filter(p => p.url.includes('/government/'));
generateSitemapXML(govPages, 'sitemap-government.xml');

// Philanthropy sitemap
const philPages = pages.filter(p => p.url.includes('/philanthropy/'));
generateSitemapXML(philPages, 'sitemap-philanthropy.xml');

// Blog sitemap (placeholder - will be populated by blog system)
generateSitemapXML([{ url: '/blog', priority: 0.7, changefreq: 'daily' }], 'sitemap-blog.xml');

// Generate sitemap index
generateSitemapIndex();

// Generate robots.txt
generateRobotsTxt();

console.log('\n✅ All sitemaps generated successfully!');
console.log(`📍 Location: ${OUTPUT_DIR}`);
console.log(`🌐 Submit to Google: https://search.google.com/search-console`);
console.log(`🌐 Submit to Bing: https://www.bing.com/webmasters`);
