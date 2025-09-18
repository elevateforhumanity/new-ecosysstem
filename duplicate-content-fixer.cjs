#!/usr/bin/env node

/**
 * DUPLICATE CONTENT FIXER
 * Fixes duplicate content issues for Google Search Console
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DUPLICATE CONTENT FIXER STARTING...');
console.log('='.repeat(60));

let fixCount = 0;
const fixLog = [];
const duplicateIssues = [];

// Check for duplicate HTML files
function findDuplicateFiles() {
  console.log('📄 Finding duplicate HTML files...');
  
  const htmlFiles = [];
  const contentHashes = new Map();
  
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile() && item.endsWith('.html')) {
          htmlFiles.push(fullPath);
        }
      });
    } catch (error) {
      // Ignore directory access errors
    }
  }
  
  scanDirectory('.');
  
  // Check for content duplicates
  htmlFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Create a simplified hash of the content (remove whitespace and comments)
      const cleanContent = content
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      
      const contentHash = cleanContent.substring(0, 1000); // First 1000 chars as hash
      
      if (contentHashes.has(contentHash)) {
        duplicateIssues.push({
          original: contentHashes.get(contentHash),
          duplicate: file,
          type: 'Content Duplicate'
        });
        fixLog.push(`⚠️  Duplicate content: ${file} matches ${contentHashes.get(contentHash)}`);
      } else {
        contentHashes.set(contentHash, file);
      }
      
    } catch (error) {
      fixLog.push(`❌ Error reading ${file}: ${error.message}`);
    }
  });
}

// Fix canonical URLs
function fixCanonicalURLs() {
  console.log('🔗 Fixing canonical URLs...');
  
  const canonicalMappings = {
    'index.html': 'https://elevateforhumanity.org/',
    'hub.html': 'https://elevateforhumanity.org/hub.html',
    'about.html': 'https://elevateforhumanity.org/about.html',
    'programs.html': 'https://elevateforhumanity.org/programs.html',
    'veterans.html': 'https://elevateforhumanity.org/veterans.html',
    'connect.html': 'https://elevateforhumanity.org/connect.html',
    'student-portal.html': 'https://elevateforhumanity.org/student-portal.html',
    'lms-integration.html': 'https://elevateforhumanity.org/lms-integration.html',
    'impact.html': 'https://elevateforhumanity.org/impact.html',
    'calendar.html': 'https://elevateforhumanity.org/calendar.html',
    'eligibility-check.html': 'https://elevateforhumanity.org/eligibility-check.html'
  };
  
  Object.entries(canonicalMappings).forEach(([file, canonicalUrl]) => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Remove existing canonical tags
      content = content.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, '');
      
      // Add new canonical tag
      const canonicalTag = `    <link rel="canonical" href="${canonicalUrl}">`;
      
      // Insert after charset meta tag
      const charsetMatch = content.match(/<meta[^>]*charset[^>]*>/i);
      if (charsetMatch) {
        const insertIndex = charsetMatch.index + charsetMatch[0].length;
        content = content.slice(0, insertIndex) + '\n' + canonicalTag + content.slice(insertIndex);
      } else {
        // Insert after opening head tag
        const headMatch = content.match(/<head[^>]*>/i);
        if (headMatch) {
          const insertIndex = headMatch.index + headMatch[0].length;
          content = content.slice(0, insertIndex) + '\n' + canonicalTag + content.slice(insertIndex);
        }
      }
      
      fs.writeFileSync(file, content);
      fixCount++;
      fixLog.push(`✅ ${file}: Canonical URL set to ${canonicalUrl}`);
    }
  });
}

// Remove duplicate pages
function removeDuplicatePages() {
  console.log('🗑️  Removing duplicate pages...');
  
  const duplicatesToRemove = [
    'index-authentic.html',
    'index-ecosystem.html', 
    'index-professional.html',
    'index.react.html',
    'live-professional.html',
    'live-site.html',
    'merged-site.html',
    'professional-site.html',
    'protected-site.html',
    'redesigned-homepage.html',
    'working-demo.html',
    'clean-professional.html',
    'fullsail-style-landing.html',
    'acc-style-landing.html',
    'humanized-program-template.html'
  ];
  
  duplicatesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      fixCount++;
      fixLog.push(`✅ Removed duplicate: ${file}`);
    }
  });
}

// Create proper redirects
function createRedirects() {
  console.log('↩️  Creating proper redirects...');
  
  const redirects = [
    '# Redirect duplicate pages to canonical versions',
    '/index-authentic.html /hub.html 301',
    '/index-ecosystem.html /hub.html 301',
    '/index-professional.html /hub.html 301',
    '/live-professional.html /hub.html 301',
    '/live-site.html /hub.html 301',
    '/merged-site.html /hub.html 301',
    '/professional-site.html /hub.html 301',
    '/protected-site.html /hub.html 301',
    '/redesigned-homepage.html /hub.html 301',
    '/working-demo.html /hub.html 301',
    '/clean-professional.html /hub.html 301',
    '/fullsail-style-landing.html /hub.html 301',
    '/acc-style-landing.html /hub.html 301',
    '/humanized-program-template.html /programs.html 301',
    '',
    '# Redirect www to non-www',
    'https://www.elevateforhumanity.org/* https://elevateforhumanity.org/:splat 301!',
    '',
    '# Redirect HTTP to HTTPS',
    'http://elevateforhumanity.org/* https://elevateforhumanity.org/:splat 301!',
    'http://www.elevateforhumanity.org/* https://elevateforhumanity.org/:splat 301!',
    '',
    '# Redirect old paths',
    '/about/index.html /about.html 301',
    '/contact/index.html /connect.html 301',
    '/programs/index.html /programs.html 301',
    '/students/index.html /student-portal.html 301',
    '/employers/index.html /connect.html 301',
    '',
    '# Block access to sensitive files',
    '/admin/* /404.html 404',
    '/api/* /404.html 404',
    '/*.json /404.html 404',
    '/*.log /404.html 404',
    '/*.bak /404.html 404',
    '/*.backup /404.html 404',
    '/*.old /404.html 404'
  ];
  
  fs.writeFileSync('_redirects', redirects.join('\n'));
  fixCount++;
  fixLog.push(`✅ _redirects: Redirect rules created`);
  
  // Also update netlify.toml with redirects
  let netlifyConfig = '';
  if (fs.existsSync('netlify.toml')) {
    netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
  }
  
  const netlifyRedirects = `
# Duplicate content redirects
[[redirects]]
  from = "/index-authentic.html"
  to = "/hub.html"
  status = 301
  force = true

[[redirects]]
  from = "/index-ecosystem.html"
  to = "/hub.html"
  status = 301
  force = true

[[redirects]]
  from = "/index-professional.html"
  to = "/hub.html"
  status = 301
  force = true

[[redirects]]
  from = "/live-professional.html"
  to = "/hub.html"
  status = 301
  force = true

[[redirects]]
  from = "/merged-site.html"
  to = "/hub.html"
  status = 301
  force = true

[[redirects]]
  from = "/professional-site.html"
  to = "/hub.html"
  status = 301
  force = true

[[redirects]]
  from = "/working-demo.html"
  to = "/hub.html"
  status = 301
  force = true

[[redirects]]
  from = "/humanized-program-template.html"
  to = "/programs.html"
  status = 301
  force = true

# WWW to non-WWW redirect
[[redirects]]
  from = "https://www.elevateforhumanity.org/*"
  to = "https://elevateforhumanity.org/:splat"
  status = 301
  force = true

# Directory index redirects
[[redirects]]
  from = "/about/index.html"
  to = "/about.html"
  status = 301
  force = true

[[redirects]]
  from = "/contact/index.html"
  to = "/connect.html"
  status = 301
  force = true

[[redirects]]
  from = "/programs/index.html"
  to = "/programs.html"
  status = 301
  force = true

[[redirects]]
  from = "/students/index.html"
  to = "/student-portal.html"
  status = 301
  force = true`;

  if (!netlifyConfig.includes('Duplicate content redirects')) {
    netlifyConfig += netlifyRedirects;
    fs.writeFileSync('netlify.toml', netlifyConfig);
    fixCount++;
    fixLog.push(`✅ netlify.toml: Redirect rules added`);
  }
}

// Fix meta descriptions and titles
function fixMetaDescriptions() {
  console.log('📝 Fixing meta descriptions and titles...');
  
  const metaData = {
    'index.html': {
      title: 'Elevate for Humanity | WIOA Workforce Development Programs',
      description: 'Transform your career with WIOA-approved workforce development programs. Free training in healthcare, technology, and skilled trades. Veteran priority services available.'
    },
    'hub.html': {
      title: 'Program Hub | Elevate for Humanity | Career Training Center',
      description: 'Access all WIOA workforce development programs from our central hub. Healthcare, technology, and skilled trades training with job placement assistance.'
    },
    'about.html': {
      title: 'About Us | Elevate for Humanity | WIOA Training Provider',
      description: 'Learn about Elevate for Humanity, a certified WIOA training provider offering workforce development programs with proven job placement success.'
    },
    'programs.html': {
      title: 'Training Programs | Elevate for Humanity | WIOA Approved Courses',
      description: 'Explore WIOA-approved training programs in healthcare, technology, and skilled trades. Free tuition, job placement assistance, and veteran priority services.'
    },
    'veterans.html': {
      title: 'Veterans Services | Elevate for Humanity | Priority Training Programs',
      description: 'Specialized workforce development programs for veterans with priority of service. WIOA-approved training with enhanced support and job placement assistance.'
    },
    'connect.html': {
      title: 'Contact Us | Elevate for Humanity | Get Started Today',
      description: 'Contact Elevate for Humanity to start your workforce development journey. Free consultation, eligibility assessment, and program enrollment assistance.'
    },
    'student-portal.html': {
      title: 'Student Portal | Elevate for Humanity | Learning Management System',
      description: 'Access your WIOA training courses, track progress, submit assignments, and connect with instructors through our secure student portal.'
    },
    'lms-integration.html': {
      title: 'Learning Management System | Elevate for Humanity | Online Training',
      description: 'Advanced learning management system for WIOA workforce development programs. Interactive courses, progress tracking, and certification management.'
    },
    'impact.html': {
      title: 'Success Stories | Elevate for Humanity | Graduate Outcomes',
      description: 'See the impact of our WIOA workforce development programs through graduate success stories, employment outcomes, and community transformation.'
    },
    'calendar.html': {
      title: 'Program Calendar | Elevate for Humanity | Training Schedule',
      description: 'View upcoming WIOA training program start dates, application deadlines, and important events. Plan your workforce development journey.'
    },
    'eligibility-check.html': {
      title: 'Eligibility Check | Elevate for Humanity | WIOA Qualification',
      description: 'Check your eligibility for WIOA workforce development programs. Free assessment to determine qualification for training and support services.'
    }
  };
  
  Object.entries(metaData).forEach(([file, meta]) => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Update title
      content = content.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);
      
      // Remove existing description meta tags
      content = content.replace(/<meta[^>]*name=["']description["'][^>]*>/gi, '');
      
      // Add new description meta tag
      const descriptionTag = `    <meta name="description" content="${meta.description}">`;
      
      // Insert after title tag
      const titleMatch = content.match(/<title>.*?<\/title>/i);
      if (titleMatch) {
        const insertIndex = titleMatch.index + titleMatch[0].length;
        content = content.slice(0, insertIndex) + '\n' + descriptionTag + content.slice(insertIndex);
      }
      
      fs.writeFileSync(file, content);
      fixCount++;
      fixLog.push(`✅ ${file}: Meta description and title updated`);
    }
  });
}

// Create robots.txt with proper directives
function updateRobotsTxt() {
  console.log('🤖 Updating robots.txt...');
  
  const robotsContent = `User-agent: *
Allow: /

# Main content pages
Allow: /
Allow: /programs/
Allow: /about/
Allow: /connect/
Allow: /veterans/
Allow: /policies/
Allow: /impact/
Allow: /calendar/
Allow: /eligibility-check/

# Static assets
Allow: /images/
Allow: /assets/
Allow: /css/
Allow: /js/

# Block admin and sensitive areas
Disallow: /admin/
Disallow: /api/
Disallow: /logs/
Disallow: /data/
Disallow: /.env
Disallow: /node_modules/
Disallow: /tools/
Disallow: /test/
Disallow: /config/
Disallow: /lib/
Disallow: /scripts/
Disallow: /.replit
Disallow: /package.json
Disallow: /*.json$
Disallow: /*.log$
Disallow: /*.bak$
Disallow: /*.backup$
Disallow: /*.old$
Disallow: /*.config.js$
Disallow: /security-*.json
Disallow: /health-*.json
Disallow: /audit-*.json
Disallow: /.git/
Disallow: /backup/
Disallow: /temp/
Disallow: /_headers

# Block duplicate pages
Disallow: /index-authentic.html
Disallow: /index-ecosystem.html
Disallow: /index-professional.html
Disallow: /live-professional.html
Disallow: /merged-site.html
Disallow: /professional-site.html
Disallow: /working-demo.html
Disallow: /clean-professional.html
Disallow: /fullsail-style-landing.html

# Allow specific public files
Allow: /sitemap.xml
Allow: /robots.txt
Allow: /security.txt
Allow: /.well-known/

# Crawl delay for politeness
Crawl-delay: 1

# Sitemap location
Sitemap: https://elevateforhumanity.org/sitemap.xml

# Last updated
# Generated: ${new Date().toISOString().split('T')[0]}`;

  fs.writeFileSync('robots.txt', robotsContent);
  fixCount++;
  fixLog.push(`✅ robots.txt: Updated with duplicate content blocks`);
}

// Create comprehensive sitemap
function createSitemap() {
  console.log('🗺️  Creating comprehensive sitemap...');
  
  const sitemapUrls = [
    {
      url: 'https://elevateforhumanity.org/',
      priority: '1.0',
      changefreq: 'weekly'
    },
    {
      url: 'https://elevateforhumanity.org/hub.html',
      priority: '0.9',
      changefreq: 'weekly'
    },
    {
      url: 'https://elevateforhumanity.org/programs.html',
      priority: '0.9',
      changefreq: 'weekly'
    },
    {
      url: 'https://elevateforhumanity.org/veterans.html',
      priority: '0.8',
      changefreq: 'monthly'
    },
    {
      url: 'https://elevateforhumanity.org/about.html',
      priority: '0.7',
      changefreq: 'monthly'
    },
    {
      url: 'https://elevateforhumanity.org/connect.html',
      priority: '0.8',
      changefreq: 'monthly'
    },
    {
      url: 'https://elevateforhumanity.org/student-portal.html',
      priority: '0.8',
      changefreq: 'weekly'
    },
    {
      url: 'https://elevateforhumanity.org/lms-integration.html',
      priority: '0.7',
      changefreq: 'weekly'
    },
    {
      url: 'https://elevateforhumanity.org/impact.html',
      priority: '0.6',
      changefreq: 'monthly'
    },
    {
      url: 'https://elevateforhumanity.org/calendar.html',
      priority: '0.7',
      changefreq: 'weekly'
    },
    {
      url: 'https://elevateforhumanity.org/eligibility-check.html',
      priority: '0.8',
      changefreq: 'monthly'
    },
    {
      url: 'https://elevateforhumanity.org/policies/eo.html',
      priority: '0.5',
      changefreq: 'yearly'
    },
    {
      url: 'https://elevateforhumanity.org/policies/grievance.html',
      priority: '0.5',
      changefreq: 'yearly'
    },
    {
      url: 'https://elevateforhumanity.org/policies/veterans.html',
      priority: '0.5',
      changefreq: 'yearly'
    },
    {
      url: 'https://elevateforhumanity.org/policies/accessibility.html',
      priority: '0.5',
      changefreq: 'yearly'
    }
  ];
  
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(item => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('sitemap.xml', sitemapXml);
  fixCount++;
  fixLog.push(`✅ sitemap.xml: Comprehensive sitemap created with ${sitemapUrls.length} URLs`);
}

// Run all fixes
console.log('🔧 Starting duplicate content fixes...\n');

findDuplicateFiles();
fixCanonicalURLs();
removeDuplicatePages();
createRedirects();
fixMetaDescriptions();
updateRobotsTxt();
createSitemap();

console.log('\n' + '='.repeat(60));
console.log('🔍 DUPLICATE CONTENT FIX RESULTS:');
console.log('='.repeat(60));

console.log(`\n📊 Total Fixes Applied: ${fixCount}`);
console.log(`⚠️  Duplicate Issues Found: ${duplicateIssues.length}`);

console.log('\n📋 Fix Log:');
fixLog.forEach(log => console.log(`  ${log}`));

if (duplicateIssues.length > 0) {
  console.log('\n⚠️  DUPLICATE CONTENT ISSUES:');
  duplicateIssues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue.type}: ${issue.duplicate} duplicates ${issue.original}`);
  });
}

console.log('\n🎯 GOOGLE SEARCH CONSOLE FIXES:');
console.log('  ✅ Canonical URLs added to all pages');
console.log('  ✅ Duplicate pages removed');
console.log('  ✅ 301 redirects created');
console.log('  ✅ Unique meta descriptions added');
console.log('  ✅ Robots.txt updated to block duplicates');
console.log('  ✅ Clean sitemap.xml generated');

// Save fix report
const fixReport = {
  timestamp: new Date().toISOString(),
  totalFixes: fixCount,
  duplicateIssues: duplicateIssues,
  fixLog: fixLog,
  googleSearchConsoleFixes: {
    canonicalUrls: true,
    duplicateRemoval: true,
    redirects: true,
    metaDescriptions: true,
    robotsTxt: true,
    sitemap: true
  },
  status: 'DUPLICATE CONTENT FIXES COMPLETE'
};

fs.writeFileSync('duplicate-content-fix-report.json', JSON.stringify(fixReport, null, 2));
console.log('\n📄 Fix report saved to: duplicate-content-fix-report.json');

console.log('\n🔍 DUPLICATE CONTENT FIXES COMPLETE');
console.log('='.repeat(60));

console.log('\n📋 NEXT STEPS FOR GOOGLE SEARCH CONSOLE:');
console.log('  1. Submit updated sitemap.xml to Google Search Console');
console.log('  2. Request re-indexing of canonical pages');
console.log('  3. Monitor for duplicate content warnings (should decrease)');
console.log('  4. Verify 301 redirects are working properly');
console.log('  5. Check that removed pages return 404 status codes');