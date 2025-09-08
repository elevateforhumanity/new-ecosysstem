const fs = require('fs');
const path = require('path');

function loadJson(file) {
  try {
    const p = path.join(process.cwd(), 'content', file);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch { return null; }
}

let cache = { banners: null, pages: null, ts: 0 };
function getContent() {
  const now = Date.now();
  if (!cache.banners || (now - cache.ts) > 60_000) {
    cache = {
      banners: loadJson('banners.json') || [],
      pages: loadJson('pages.json') || {},
      ts: now
    };
  }
  return cache;
}

function getBanners() { return getContent().banners; }
function getPage(key) { return getContent().pages[key]; }

module.exports = { getBanners, getPage };
