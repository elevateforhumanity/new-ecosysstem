#!/usr/bin/env node

/**
 * AUTOPILOT FIX ENGINE
 * Automatically fixes all identified issues
 */

const fs = require('fs');
const path = require('path');

console.log('🤖 AUTOPILOT FIX ENGINE STARTING...');
console.log('='.repeat(60));

let fixCount = 0;
const fixLog = [];

// Fix 1: Remove social media integration
function removeSocialMedia(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove social media links and scripts
    const socialPatterns = [
      /<!--.*?social.*?-->/gis,
      /<script.*?facebook.*?<\/script>/gis,
      /<script.*?twitter.*?<\/script>/gis,
      /<script.*?linkedin.*?<\/script>/gis,
      /<script.*?instagram.*?<\/script>/gis,
      /<div.*?social.*?<\/div>/gis,
      /<a.*?facebook.*?<\/a>/gis,
      /<a.*?twitter.*?<\/a>/gis,
      /<a.*?linkedin.*?<\/a>/gis,
      /<a.*?instagram.*?<\/a>/gis,
      /class=".*?social.*?"/gi,
      /id=".*?social.*?"/gi
    ];
    
    socialPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      fixCount++;
      fixLog.push(`✅ Removed social media from ${filePath}`);
    }
  } catch (error) {
    fixLog.push(`❌ Error fixing ${filePath}: ${error.message}`);
  }
}

// Fix 2: Remove blog references
function removeBlogReferences(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove blog-related content
    const blogPatterns = [
      /<!--.*?blog.*?-->/gis,
      /<section.*?blog.*?<\/section>/gis,
      /<div.*?blog.*?<\/div>/gis,
      /<a.*?blog.*?<\/a>/gis,
      /href=".*?blog.*?"/gi,
      /class=".*?blog.*?"/gi,
      /id=".*?blog.*?"/gi,
      /<nav.*?blog.*?<\/nav>/gis
    ];
    
    blogPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      fixCount++;
      fixLog.push(`✅ Removed blog references from ${filePath}`);
    }
  } catch (error) {
    fixLog.push(`❌ Error fixing ${filePath}: ${error.message}`);
  }
}

// Fix 3: Remove partner/sister site groupings
function removePartnerGroupings(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove partner/sister site references
    const partnerPatterns = [
      /<!--.*?partner.*?-->/gis,
      /<!--.*?sister.*?-->/gis,
      /<section.*?partner.*?<\/section>/gis,
      /<div.*?partner.*?<\/div>/gis,
      /<div.*?sister.*?<\/div>/gis,
      /href=".*?sites\/.*?"/gi,
      /href=".*?partners\/.*?"/gi,
      /class=".*?partner.*?"/gi,
      /class=".*?sister.*?"/gi,
      /id=".*?partner.*?"/gi,
      /id=".*?sister.*?"/gi
    ];
    
    partnerPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      fixCount++;
      fixLog.push(`✅ Removed partner groupings from ${filePath}`);
    }
  } catch (error) {
    fixLog.push(`❌ Error fixing ${filePath}: ${error.message}`);
  }
}

// Fix 4: Fix LMS integration
function fixLMSIntegration(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix LMS references to point to student-portal
    if (content.includes('lms') || content.includes('LMS')) {
      content = content.replace(/href=".*?lms.*?"/gi, 'href="/student-portal.html"');
      content = content.replace(/href=".*?LMS.*?"/gi, 'href="/student-portal.html"');
      content = content.replace(/Learning Management System/gi, 'Student Portal');
      content = content.replace(/LMS/gi, 'Student Portal');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      fixCount++;
      fixLog.push(`✅ Fixed LMS integration in ${filePath}`);
    }
  } catch (error) {
    fixLog.push(`❌ Error fixing ${filePath}: ${error.message}`);
  }
}

// Fix 5: Fix navigation structure
function fixNavigation(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix navigation to remove grouped site references
    if (content.includes('<nav') || content.includes('navigation')) {
      content = content.replace(/href=".*?sites\/.*?"/gi, 'href="#"');
      content = content.replace(/href=".*?partners\/.*?"/gi, 'href="#"');
      content = content.replace(/href=".*?network\/.*?"/gi, 'href="#"');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      fixCount++;
      fixLog.push(`✅ Fixed navigation in ${filePath}`);
    }
  } catch (error) {
    fixLog.push(`❌ Error fixing ${filePath}: ${error.message}`);
  }
}

// Fix 6: Remove broken/error content
function removeBrokenContent(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove error/broken references
    const brokenPatterns = [
      /<!--.*?error.*?-->/gis,
      /<!--.*?broken.*?-->/gis,
      /<div.*?error.*?<\/div>/gis,
      /<div.*?broken.*?<\/div>/gis,
      /class=".*?error.*?"/gi,
      /class=".*?broken.*?"/gi
    ];
    
    brokenPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      fixCount++;
      fixLog.push(`✅ Removed broken content from ${filePath}`);
    }
  } catch (error) {
    fixLog.push(`❌ Error fixing ${filePath}: ${error.message}`);
  }
}

// Process all HTML files
function processFile(filePath) {
  const relativePath = path.relative('.', filePath);
  
  // Skip certain directories
  if (relativePath.includes('node_modules') || 
      relativePath.includes('.git') || 
      relativePath.includes('data/samples') ||
      relativePath.includes('docs/examples') ||
      relativePath.includes('tests/e2e')) {
    return;
  }
  
  console.log(`🔧 Fixing: ${relativePath}`);
  
  removeSocialMedia(filePath);
  removeBlogReferences(filePath);
  removePartnerGroupings(filePath);
  fixLMSIntegration(filePath);
  fixNavigation(filePath);
  removeBrokenContent(filePath);
}

function scanAndFix(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanAndFix(filePath);
    } else if (file.endsWith('.html')) {
      processFile(filePath);
    }
  }
}

// Run the fixes
console.log('🔧 Starting automated fixes...\n');
scanAndFix('.');

console.log('\n' + '='.repeat(60));
console.log('🎯 AUTOPILOT FIX RESULTS:');
console.log('='.repeat(60));

console.log(`\n📊 Total Fixes Applied: ${fixCount}`);

console.log('\n📋 Fix Log:');
fixLog.forEach(log => console.log(`  ${log}`));

// Save fix report
const fixReport = {
  timestamp: new Date().toISOString(),
  totalFixes: fixCount,
  fixLog: fixLog,
  status: 'AUTOPILOT FIXES COMPLETE'
};

fs.writeFileSync('autopilot-fix-report.json', JSON.stringify(fixReport, null, 2));
console.log('\n📄 Fix report saved to: autopilot-fix-report.json');

console.log('\n🤖 AUTOPILOT FIXES COMPLETE - READY FOR COMMIT');
console.log('='.repeat(60));