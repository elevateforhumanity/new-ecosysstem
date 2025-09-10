#!/usr/bin/env node
/**
 * Apply Google configuration (GA4 ID + Search Console verification) to HTML files.
 * Replaces GA_MEASUREMENT_ID and fills google-site-verification where placeholder exists.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const GA_ID = process.env.GOOGLE_ANALYTICS_ID || process.env.NEXT_PUBLIC_GA_ID;
const GOOGLE_VERIFY = process.env.GOOGLE_SITE_VERIFICATION;

const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

let changed = 0;
htmlFiles.forEach(file => {
  const p = path.join(ROOT, file);
  let content = fs.readFileSync(p, 'utf8');
  let updated = content;

  if (GA_ID) {
    updated = updated.replace(/GA_MEASUREMENT_ID/g, GA_ID);
  }
  if (GOOGLE_VERIFY) {
    updated = updated.replace(
      /<meta name="google-site-verification" content="[^"]*"\s*\/>/,
      `<meta name="google-site-verification" content="${GOOGLE_VERIFY}" />`
    );
  }
  if (updated !== content) {
    fs.writeFileSync(p, updated, 'utf8');
    changed++;
    console.log(`updated: ${file}`);
  }
});

console.log(`Google config applied to ${changed} file(s).`);
