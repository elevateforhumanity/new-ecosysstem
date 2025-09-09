#!/usr/bin/env node
/**
 * Generate sitemap(s) strictly for stable canonical pages only.
 * Excludes: experimental, dynamic, verification, and API shards.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CANONICAL = process.env.CANONICAL_DOMAIN || 'https://example.com';

// Explicit allow‑list of stable canonical routes (root html pages mapped manually)
const STABLE_ROUTES = new Set([
  '/',
  '/programs',
  '/hub',
  '/lms',
  '/connect',
  '/compliance',
  '/pay',
  '/partners',
  '/account'
]);

// Logical groupings for smaller shard sitemaps (can expand as ecosystem grows)
const GROUPS = {
  high: ['/', '/programs', '/hub', '/lms', '/connect', '/pay'],
  compliance: ['/compliance'],
  partners: ['/partners'],
  account: ['/account'],
  learning: ['/lms'],
  marketing: ['/programs', '/hub', '/connect']
};

// Employer related (if stable page exists)
if (fs.existsSync(path.join(ROOT, 'employer-dashboard.html'))) {
  STABLE_ROUTES.add('/employer-dashboard');
  GROUPS.employer = ['/employer-dashboard'];
}

// Enrollment / intake (placeholder if later added as static pages)
['/enrollment', '/intake'].forEach(r => {
  const file = r.replace(/\//,'') + '.html';
  if (fs.existsSync(path.join(ROOT, file))) {
    STABLE_ROUTES.add(r);
    GROUPS.intake = (GROUPS.intake||[]).concat([r]);
  }
});

// Collect root html files (exclude templates & verification pages if needed)
function getRootHtmlFiles() {
  return fs.readdirSync(ROOT)
    .filter(f => f.endsWith('.html'))
    .filter(f => !['bing-site-verification.html','google-site-verification.html','google-search-console-setup.html','google-search-console-submit.html'].includes(f));
}

function xmlEscape(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function makeUrlEntry(loc, changefreq='monthly', priority='0.5', lastmod){
  return `  <url><loc>${xmlEscape(loc)}</loc>${lastmod?`<lastmod>${lastmod}</lastmod>`:''}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

function writeFile(rel, content){
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.trim()+"\n", 'utf8');
}

function generateStableSitemap(){
  const today = new Date().toISOString().slice(0,10);
  const urls = Array.from(STABLE_ROUTES).map((r,i)=> makeUrlEntry(`${CANONICAL}${r}`,'weekly', i===0 ? '1.0':'0.7', today));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  writeFile('sitemaps/stable.xml', xml);
}

function generateGroupSitemaps(){
  const today = new Date().toISOString().slice(0,10);
  Object.entries(GROUPS).forEach(([name, routes]) => {
    const unique = [...new Set(routes.filter(r => STABLE_ROUTES.has(r)))];
    if (!unique.length) return;
    const urls = unique.map((r,i) => makeUrlEntry(`${CANONICAL}${r}`,'weekly', i===0?'0.9':'0.6', today));
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    writeFile(`sitemaps/${name}.xml`, xml);
  });
}

function generateIndex(){
  const today = new Date().toISOString().slice(0,10);
  const shardFiles = ['stable.xml'].concat(Object.keys(GROUPS).map(g => `${g}.xml`));
  const entries = shardFiles.map(s => `  <sitemap><loc>${CANONICAL}/sitemaps/${s}</loc><lastmod>${today}</lastmod></sitemap>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</sitemapindex>`;
  writeFile('sitemap-index.xml', xml);
}

function run(){
  generateStableSitemap();
  generateGroupSitemaps();
  generateIndex();
  console.log('Sitemaps generated: stable + group shards and sitemap-index.xml updated.');
}
run();
