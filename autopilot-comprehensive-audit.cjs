#!/usr/bin/env node

/**
 * AUTOPILOT COMPREHENSIVE SITE AUDIT
 * Identifies all issues mentioned by user and creates fix plan
 */

const fs = require('fs');
const path = require('path');

console.log('🤖 AUTOPILOT COMPREHENSIVE AUDIT STARTING...');
console.log('='.repeat(60));

const issues = {
  browsing: [],
  socialMedia: [],
  blogs: [],
  partners: [],
  sisterSites: [],
  groupedPages: [],
  lms: [],
  structure: [],
  navigation: []
};

const fixes = [];

// Scan all HTML files
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath);
    } else if (file.endsWith('.html')) {
      scanFile(filePath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative('.', filePath);
  
  console.log(`🔍 Scanning: ${relativePath}`);
  
  // Check for browsing issues
  if (content.includes('404') || content.includes('broken') || content.includes('error')) {
    issues.browsing.push(`${relativePath}: Potential browsing issues detected`);
  }
  
  // Check for social media integration
  if (content.includes('facebook') || content.includes('twitter') || content.includes('linkedin') || 
      content.includes('instagram') || content.includes('social-media') || content.includes('share')) {
    issues.socialMedia.push(`${relativePath}: Social media integration found`);
    fixes.push(`Remove social media from ${relativePath}`);
  }
  
  // Check for blog references
  if (content.includes('blog') || content.includes('Blog') || content.includes('article') || 
      content.includes('post') || content.includes('news')) {
    issues.blogs.push(`${relativePath}: Blog system references found`);
    fixes.push(`Remove blog references from ${relativePath}`);
  }
  
  // Check for partner/sister site groupings
  if (content.includes('partner') || content.includes('sister') || content.includes('network') ||
      content.includes('affiliate') || content.includes('consortium')) {
    issues.partners.push(`${relativePath}: Partner/sister site references found`);
    fixes.push(`Convert to single page structure in ${relativePath}`);
  }
  
  // Check for grouped page structures
  if (content.includes('sites/') || content.includes('partners/') || content.includes('network/')) {
    issues.groupedPages.push(`${relativePath}: Grouped page structure detected`);
    fixes.push(`Flatten page structure in ${relativePath}`);
  }
  
  // Check for LMS issues
  if (content.includes('lms') || content.includes('LMS') || content.includes('learning')) {
    if (!content.includes('student-portal') && !content.includes('dashboard')) {
      issues.lms.push(`${relativePath}: LMS references without proper integration`);
      fixes.push(`Fix LMS integration in ${relativePath}`);
    }
  }
  
  // Check navigation structure
  if (content.includes('nav') || content.includes('menu')) {
    if (content.includes('sites/') || content.includes('partners/')) {
      issues.navigation.push(`${relativePath}: Navigation has grouped site references`);
      fixes.push(`Fix navigation structure in ${relativePath}`);
    }
  }
}

// Run the scan
scanDirectory('.');

console.log('\n' + '='.repeat(60));
console.log('🚨 ISSUES IDENTIFIED:');
console.log('='.repeat(60));

console.log('\n📱 BROWSING ISSUES:');
issues.browsing.forEach(issue => console.log(`  ❌ ${issue}`));

console.log('\n📱 SOCIAL MEDIA INTEGRATION:');
issues.socialMedia.forEach(issue => console.log(`  ❌ ${issue}`));

console.log('\n📝 BLOG SYSTEM REFERENCES:');
issues.blogs.forEach(issue => console.log(`  ❌ ${issue}`));

console.log('\n🤝 PARTNER/SISTER SITE GROUPINGS:');
issues.partners.forEach(issue => console.log(`  ❌ ${issue}`));

console.log('\n📁 GROUPED PAGE STRUCTURES:');
issues.groupedPages.forEach(issue => console.log(`  ❌ ${issue}`));

console.log('\n🎓 LMS INTEGRATION ISSUES:');
issues.lms.forEach(issue => console.log(`  ❌ ${issue}`));

console.log('\n🧭 NAVIGATION STRUCTURE ISSUES:');
issues.navigation.forEach(issue => console.log(`  ❌ ${issue}`));

console.log('\n' + '='.repeat(60));
console.log('🔧 FIXES REQUIRED:');
console.log('='.repeat(60));

fixes.forEach((fix, index) => {
  console.log(`${index + 1}. ${fix}`);
});

console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY:');
console.log('='.repeat(60));

const totalIssues = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);
console.log(`Total Issues Found: ${totalIssues}`);
console.log(`Total Fixes Required: ${fixes.length}`);

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  totalIssues,
  totalFixes: fixes.length,
  issues,
  fixes,
  status: 'AUTOPILOT READY TO FIX'
};

fs.writeFileSync('autopilot-audit-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Detailed report saved to: autopilot-audit-report.json');

console.log('\n🤖 AUTOPILOT READY TO BEGIN FIXES...');
console.log('='.repeat(60));