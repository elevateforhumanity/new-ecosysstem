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
function getPricingPlans() {
  const pages = getContent().pages;
  const pricing = pages.pricing;
  if (!pricing || !Array.isArray(pricing.plans)) return [];
  return pricing.plans.map(p => ({
    ...p,
    stripe: {
      monthly: p.stripePriceMonthlyEnv ? process.env[p.stripePriceMonthlyEnv] || null : null,
      annual: p.stripePriceAnnualEnv ? process.env[p.stripePriceAnnualEnv] || null : null
    }
  }));
}

module.exports = { getBanners, getPage, getPricingPlans };
