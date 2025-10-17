const fs = require('fs');
const base = process.env.SITE_URL || 'https://elevateforhumanity.pages.dev';
const pages = [
  '/',
  '/programs',
  '/lms',
  '/apply',
  '/connect',
  '/partners',
  '/pay',
];

const urls = pages
  .map(
    (p) => `  <url><loc>${base}${p}</loc><changefreq>weekly</changefreq></url>`
  )
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/sitemap.xml', xml);
console.log('✅ sitemap.xml generated');
