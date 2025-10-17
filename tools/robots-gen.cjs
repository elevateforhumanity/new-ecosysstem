const fs = require('fs');
const base = process.env.SITE_URL || 'https://elevateforhumanity.pages.dev';
const txt = `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`;

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/robots.txt', txt);
console.log('✅ robots.txt generated');
