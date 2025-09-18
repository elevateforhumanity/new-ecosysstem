#!/usr/bin/env node

/**
 * COMPREHENSIVE HEALTH CHECKER
 * Verifies all site fixes and functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🏥 COMPREHENSIVE HEALTH CHECKER STARTING...');
console.log('='.repeat(60));

let healthScore = 0;
let totalChecks = 0;
const healthLog = [];

// Check if file exists and is valid
function checkFile(filePath, description) {
  totalChecks++;
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.size > 0) {
      healthScore++;
      healthLog.push(`✅ ${description}: ${filePath} (${stats.size} bytes)`);
      return true;
    } else {
      healthLog.push(`⚠️  ${description}: ${filePath} (empty file)`);
      return false;
    }
  } else {
    healthLog.push(`❌ ${description}: ${filePath} (missing)`);
    return false;
  }
}

// Check HTML file structure
function checkHTMLStructure(filePath, description) {
  totalChecks++;
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasDoctype = content.includes('<!DOCTYPE html>');
    const hasTitle = content.includes('<title>');
    const hasNav = content.includes('nav') || content.includes('shared-nav');
    const hasFooter = content.includes('footer') || content.includes('shared-footer');
    
    if (hasDoctype && hasTitle && hasNav && hasFooter) {
      healthScore++;
      healthLog.push(`✅ ${description}: Valid HTML structure`);
      return true;
    } else {
      healthLog.push(`⚠️  ${description}: Missing elements (doctype:${hasDoctype}, title:${hasTitle}, nav:${hasNav}, footer:${hasFooter})`);
      return false;
    }
  } else {
    healthLog.push(`❌ ${description}: File missing`);
    return false;
  }
}

// Check directory structure
function checkDirectoryStructure() {
  console.log('📁 Checking directory structure...');
  
  const requiredDirs = ['js', 'css', 'images', 'policies'];
  const removedDirs = ['sites', 'deploy', 'durable-deploy'];
  
  requiredDirs.forEach(dir => {
    totalChecks++;
    if (fs.existsSync(dir)) {
      healthScore++;
      healthLog.push(`✅ Required directory exists: ${dir}`);
    } else {
      healthLog.push(`❌ Required directory missing: ${dir}`);
    }
  });
  
  removedDirs.forEach(dir => {
    totalChecks++;
    if (!fs.existsSync(dir)) {
      healthScore++;
      healthLog.push(`✅ Unnecessary directory removed: ${dir}`);
    } else {
      healthLog.push(`⚠️  Unnecessary directory still exists: ${dir}`);
    }
  });
}

// Check core pages
function checkCorePages() {
  console.log('📄 Checking core pages...');
  
  const corePages = [
    'index.html',
    'hub.html',
    'about.html',
    'programs.html',
    'veterans.html',
    'connect.html',
    'student-portal.html',
    'lms-integration.html',
    'impact.html',
    'calendar.html',
    'eligibility-check.html'
  ];
  
  corePages.forEach(page => {
    checkHTMLStructure(page, `Core page: ${page}`);
  });
}

// Check compliance pages
function checkCompliancePages() {
  console.log('⚖️  Checking compliance pages...');
  
  const compliancePages = [
    'policies/eo.html',
    'policies/grievance.html',
    'policies/veterans.html',
    'policies/accessibility.html'
  ];
  
  compliancePages.forEach(page => {
    checkHTMLStructure(page, `Compliance page: ${page}`);
  });
}

// Check admin pages
function checkAdminPages() {
  console.log('👨‍💼 Checking admin pages...');
  
  const adminPages = [
    'admin-dashboard.html',
    'admin-approvals-dashboard.html'
  ];
  
  adminPages.forEach(page => {
    checkHTMLStructure(page, `Admin page: ${page}`);
  });
}

// Check removed files
function checkRemovedFiles() {
  console.log('🗑️  Checking removed files...');
  
  const removedFiles = [
    'blog.html',
    'partner-marketplace.html',
    'sister-sites.html',
    'kingdom-konnect.html',
    'rise-forward.html',
    'serene-comfort-care.html',
    'urban-build-crew.html'
  ];
  
  removedFiles.forEach(file => {
    totalChecks++;
    if (!fs.existsSync(file)) {
      healthScore++;
      healthLog.push(`✅ Unnecessary file removed: ${file}`);
    } else {
      healthLog.push(`⚠️  Unnecessary file still exists: ${file}`);
    }
  });
}

// Check navigation system
function checkNavigationSystem() {
  console.log('🧭 Checking navigation system...');
  
  checkFile('js/unified-navigation.js', 'Unified navigation system');
  checkFile('navigation-config.json', 'Navigation configuration');
  checkFile('site-structure-map.json', 'Site structure map');
}

// Check production deploy
function checkProductionDeploy() {
  console.log('🚀 Checking production deploy...');
  
  const productionFiles = [
    'production-deploy/public/index.html',
    'production-deploy/public/login.html',
    'production-deploy/public/portal/index.html',
    'production-deploy/public/lms/index.html',
    'production-deploy/public/enroll/index.html'
  ];
  
  productionFiles.forEach(file => {
    checkFile(file, `Production file: ${file}`);
  });
}

// Check LMS integration
function checkLMSIntegration() {
  console.log('🎓 Checking LMS integration...');
  
  totalChecks++;
  if (fs.existsSync('lms-integration.html')) {
    const content = fs.readFileSync('lms-integration.html', 'utf8');
    const hasStudentPortal = content.includes('Student Portal');
    const hasCourseAccess = content.includes('Course Access');
    const hasProgressTracking = content.includes('Progress Tracking');
    const hasAssignments = content.includes('Assignment');
    
    if (hasStudentPortal && hasCourseAccess && hasProgressTracking && hasAssignments) {
      healthScore++;
      healthLog.push(`✅ LMS Integration: Complete functionality`);
    } else {
      healthLog.push(`⚠️  LMS Integration: Missing features`);
    }
  } else {
    healthLog.push(`❌ LMS Integration: File missing`);
  }
}

// Check WIOA compliance
function checkWIOACompliance() {
  console.log('📋 Checking WIOA compliance...');
  
  const complianceChecks = [
    { file: 'policies/eo.html', requirement: 'Equal Opportunity' },
    { file: 'policies/grievance.html', requirement: 'Grievance Procedures' },
    { file: 'policies/veterans.html', requirement: 'Veterans Priority' },
    { file: 'policies/accessibility.html', requirement: 'Accessibility' },
    { file: 'eligibility-check.html', requirement: 'Eligibility Assessment' }
  ];
  
  complianceChecks.forEach(check => {
    totalChecks++;
    if (fs.existsSync(check.file)) {
      healthScore++;
      healthLog.push(`✅ WIOA Compliance: ${check.requirement}`);
    } else {
      healthLog.push(`❌ WIOA Compliance: Missing ${check.requirement}`);
    }
  });
}

// Run all health checks
console.log('🔧 Starting comprehensive health checks...\n');

checkDirectoryStructure();
checkCorePages();
checkCompliancePages();
checkAdminPages();
checkRemovedFiles();
checkNavigationSystem();
checkProductionDeploy();
checkLMSIntegration();
checkWIOACompliance();

// Calculate health score
const healthPercentage = Math.round((healthScore / totalChecks) * 100);

console.log('\n' + '='.repeat(60));
console.log('🏥 COMPREHENSIVE HEALTH CHECK RESULTS:');
console.log('='.repeat(60));

console.log(`\n📊 Health Score: ${healthScore}/${totalChecks} (${healthPercentage}%)`);

let healthStatus;
if (healthPercentage >= 95) {
  healthStatus = '🟢 EXCELLENT';
} else if (healthPercentage >= 85) {
  healthStatus = '🟡 GOOD';
} else if (healthPercentage >= 70) {
  healthStatus = '🟠 FAIR';
} else {
  healthStatus = '🔴 POOR';
}

console.log(`🎯 Overall Health: ${healthStatus}`);

console.log('\n📋 Health Check Log:');
healthLog.forEach(log => console.log(`  ${log}`));

// Save health report
const healthReport = {
  timestamp: new Date().toISOString(),
  healthScore: healthScore,
  totalChecks: totalChecks,
  healthPercentage: healthPercentage,
  healthStatus: healthStatus,
  healthLog: healthLog,
  status: 'HEALTH CHECK COMPLETE'
};

fs.writeFileSync('health-check-report.json', JSON.stringify(healthReport, null, 2));
console.log('\n📄 Health report saved to: health-check-report.json');

console.log('\n🏥 COMPREHENSIVE HEALTH CHECK COMPLETE');
console.log('='.repeat(60));