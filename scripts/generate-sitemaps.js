import fs from "fs";
const urls = fs.readFileSync('dist/all-urls.txt', 'utf-8').split('\n').filter(Boolean);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>${url.endsWith('/') ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;
fs.writeFileSync('dist/sitemap.xml', sitemap);
console.log(`✅ Generated sitemap with ${urls.length} URLs`);
