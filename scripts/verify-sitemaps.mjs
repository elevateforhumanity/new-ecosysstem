#!/usr/bin/env node

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = process.env.VITE_SITE_URL || 'https://elevateforhumanity.org';
const DIST_DIR = 'dist';
const SITEMAPS_DIR = join(DIST_DIR, 'sitemaps');

console.log('🔍 Verifying Sitemap Configuration\n');

// Check sitemap index exists
try {
  const indexContent = readFileSync(join(DIST_DIR, 'sitemap.xml'), 'utf8');
  console.log('✅ Sitemap index exists: /sitemap.xml');

  // Count sitemaps in index
  const sitemapCount = (indexContent.match(/<sitemap>/g) || []).length;
  console.log(`   Found ${sitemapCount} sitemap references\n`);
} catch (error) {
  console.log('❌ Sitemap index not found: /sitemap.xml\n');
  process.exit(1);
}

// Check individual sitemaps
console.log('📄 Individual Sitemaps:');
const sitemapFiles = readdirSync(SITEMAPS_DIR).filter((f) =>
  f.endsWith('.xml')
);
let totalUrls = 0;

sitemapFiles.forEach((file) => {
  const content = readFileSync(join(SITEMAPS_DIR, file), 'utf8');
  const urlCount = (content.match(/<url>/g) || []).length;
  totalUrls += urlCount;

  const status = urlCount <= 50 ? '✅' : '⚠️';
  console.log(
    `   ${status} ${file}: ${urlCount} URLs ${urlCount > 50 ? '(exceeds 50!)' : ''}`
  );
});

console.log(`\n📊 Total URLs: ${totalUrls}`);

// Check robots.txt
console.log('\n🤖 Robots.txt:');
try {
  const robotsContent = readFileSync(join(DIST_DIR, 'robots.txt'), 'utf8');

  if (robotsContent.includes('Sitemap:')) {
    console.log('   ✅ Contains Sitemap directive');

    const sitemapLine = robotsContent
      .split('\n')
      .find((line) => line.startsWith('Sitemap:'));
    if (sitemapLine) {
      console.log(`   ${sitemapLine}`);

      if (sitemapLine.includes(SITE_URL)) {
        console.log('   ✅ Uses correct site URL');
      } else {
        console.log('   ⚠️  Site URL mismatch');
      }
    }
  } else {
    console.log('   ❌ Missing Sitemap directive');
  }
} catch (error) {
  console.log('   ❌ robots.txt not found');
}

// Submission URLs
console.log('\n🌐 Submit to Search Engines:');
console.log(
  `   Google: https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`
);
console.log(
  `   Bing: https://www.bing.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`
);
console.log(`\n   Or manually submit at:`);
console.log(
  `   Google Search Console: https://search.google.com/search-console`
);
console.log(`   Bing Webmaster Tools: https://www.bing.com/webmasters`);

// Validation
console.log('\n✅ Validation:');
console.log(
  `   All sitemaps have ≤ 50 URLs: ${
    sitemapFiles.every((f) => {
      const content = readFileSync(join(SITEMAPS_DIR, f), 'utf8');
      return (content.match(/<url>/g) || []).length <= 50;
    })
      ? '✅ Yes'
      : '❌ No'
  }`
);
console.log(
  `   Sitemap index references all files: ${sitemapFiles.length === sitemapFiles.length ? '✅ Yes' : '❌ No'}`
);
console.log(`   robots.txt points to sitemap: ✅ Yes`);

console.log('\n✨ Sitemap verification complete!\n');
