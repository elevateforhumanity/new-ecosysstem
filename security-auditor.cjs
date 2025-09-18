#!/usr/bin/env node

/**
 * COMPREHENSIVE SECURITY AUDITOR
 * Audits current security configurations and identifies gaps
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 COMPREHENSIVE SECURITY AUDITOR STARTING...');
console.log('='.repeat(60));

let securityScore = 0;
let totalChecks = 0;
const securityLog = [];
const vulnerabilities = [];
const recommendations = [];

// Check if file exists and analyze content
function checkSecurityFile(filePath, description, requiredContent = []) {
  totalChecks++;
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    let hasRequired = true;
    
    if (requiredContent.length > 0) {
      hasRequired = requiredContent.every(req => content.includes(req));
    }
    
    if (hasRequired) {
      securityScore++;
      securityLog.push(`✅ ${description}: Present and configured`);
      return { exists: true, configured: true, content };
    } else {
      securityLog.push(`⚠️  ${description}: Present but missing required content`);
      return { exists: true, configured: false, content };
    }
  } else {
    securityLog.push(`❌ ${description}: Missing`);
    vulnerabilities.push(`Missing ${description}`);
    return { exists: false, configured: false, content: null };
  }
}

// Check robots.txt configuration
function checkRobotsTxt() {
  console.log('🤖 Checking robots.txt configuration...');
  
  const result = checkSecurityFile('robots.txt', 'robots.txt file');
  
  if (result.exists) {
    const content = result.content;
    const hasDisallows = content.includes('Disallow:');
    const hasUserAgent = content.includes('User-agent:');
    const hasSitemap = content.includes('Sitemap:');
    
    if (hasDisallows && hasUserAgent) {
      securityLog.push(`✅ robots.txt: Properly configured with restrictions`);
    } else {
      vulnerabilities.push('robots.txt lacks proper disallow rules');
      recommendations.push('Add specific Disallow rules to robots.txt');
    }
    
    if (!hasSitemap) {
      recommendations.push('Add Sitemap directive to robots.txt');
    }
  } else {
    recommendations.push('Create robots.txt with proper disallow rules');
  }
}

// Check .htaccess security configurations
function checkHtaccess() {
  console.log('🛡️  Checking .htaccess security configurations...');
  
  const result = checkSecurityFile('.htaccess', '.htaccess file');
  
  if (result.exists) {
    const content = result.content;
    const hasDirectoryListing = content.includes('Options -Indexes');
    const hasSecurityHeaders = content.includes('Header always set');
    const hasFileProtection = content.includes('<Files');
    
    if (hasDirectoryListing) {
      securityLog.push(`✅ Directory listing disabled`);
    } else {
      vulnerabilities.push('Directory listing not disabled');
      recommendations.push('Add "Options -Indexes" to .htaccess');
    }
    
    if (hasSecurityHeaders) {
      securityLog.push(`✅ Security headers configured`);
    } else {
      vulnerabilities.push('Missing security headers in .htaccess');
      recommendations.push('Add security headers to .htaccess');
    }
  } else {
    vulnerabilities.push('Missing .htaccess file');
    recommendations.push('Create .htaccess with security configurations');
  }
}

// Check for sensitive files exposure
function checkSensitiveFiles() {
  console.log('🔍 Checking for sensitive file exposure...');
  
  const sensitiveFiles = [
    '.env',
    '.env.local',
    '.env.production',
    'config.json',
    'database.json',
    'secrets.json',
    '.git/config',
    'package-lock.json',
    'composer.lock',
    'yarn.lock'
  ];
  
  sensitiveFiles.forEach(file => {
    totalChecks++;
    if (fs.existsSync(file)) {
      // Check if it's in a public directory
      const isInPublic = file.startsWith('public/') || file.startsWith('www/');
      if (isInPublic) {
        vulnerabilities.push(`Sensitive file exposed: ${file}`);
        securityLog.push(`❌ Sensitive file in public: ${file}`);
        recommendations.push(`Move ${file} outside public directory`);
      } else {
        securityScore++;
        securityLog.push(`✅ Sensitive file protected: ${file}`);
      }
    } else {
      securityScore++;
      securityLog.push(`✅ No sensitive file: ${file}`);
    }
  });
}

// Check HTML security headers
function checkHTMLSecurity() {
  console.log('📄 Checking HTML security configurations...');
  
  const htmlFiles = [
    'index.html',
    'hub.html',
    'student-portal.html',
    'lms-integration.html',
    'admin-dashboard.html'
  ];
  
  htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasCSP = content.includes('Content-Security-Policy');
      const hasXFrame = content.includes('X-Frame-Options');
      const hasXContent = content.includes('X-Content-Type-Options');
      const hasReferrer = content.includes('Referrer-Policy');
      
      let securityHeaders = 0;
      if (hasCSP) securityHeaders++;
      if (hasXFrame) securityHeaders++;
      if (hasXContent) securityHeaders++;
      if (hasReferrer) securityHeaders++;
      
      if (securityHeaders >= 2) {
        securityScore++;
        securityLog.push(`✅ ${file}: Has security headers (${securityHeaders}/4)`);
      } else {
        securityLog.push(`⚠️  ${file}: Missing security headers (${securityHeaders}/4)`);
        recommendations.push(`Add security meta tags to ${file}`);
      }
    }
  });
}

// Check JavaScript security
function checkJavaScriptSecurity() {
  console.log('📜 Checking JavaScript security...');
  
  const jsFiles = ['js/unified-navigation.js'];
  
  jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasEval = content.includes('eval(');
      const hasInnerHTML = content.includes('innerHTML');
      const hasDocumentWrite = content.includes('document.write');
      const hasConsoleLog = content.includes('console.log');
      
      let vulnerablePatterns = 0;
      if (hasEval) vulnerablePatterns++;
      if (hasInnerHTML) vulnerablePatterns++;
      if (hasDocumentWrite) vulnerablePatterns++;
      
      if (vulnerablePatterns === 0) {
        securityScore++;
        securityLog.push(`✅ ${file}: No dangerous patterns found`);
      } else {
        securityLog.push(`⚠️  ${file}: Found ${vulnerablePatterns} potentially dangerous patterns`);
        if (hasEval) recommendations.push(`Avoid eval() in ${file}`);
        if (hasDocumentWrite) recommendations.push(`Avoid document.write() in ${file}`);
      }
      
      if (hasConsoleLog) {
        recommendations.push(`Remove console.log statements from ${file} for production`);
      }
    }
  });
}

// Check access control configurations
function checkAccessControl() {
  console.log('🔐 Checking access control configurations...');
  
  const adminFiles = [
    'admin-dashboard.html',
    'admin-approvals-dashboard.html'
  ];
  
  adminFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasAuth = content.includes('login') || content.includes('auth') || content.includes('session');
      const hasRedirect = content.includes('redirect') || content.includes('window.location');
      
      if (hasAuth) {
        securityScore++;
        securityLog.push(`✅ ${file}: Has authentication references`);
      } else {
        vulnerabilities.push(`Admin file lacks authentication: ${file}`);
        securityLog.push(`❌ ${file}: No authentication found`);
        recommendations.push(`Add authentication to ${file}`);
      }
    }
  });
}

// Check for backup files and temporary files
function checkBackupFiles() {
  console.log('🗂️  Checking for backup and temporary files...');
  
  const backupPatterns = [
    '*.bak',
    '*.backup',
    '*.old',
    '*.tmp',
    '*~',
    '*.swp',
    '.DS_Store'
  ];
  
  function findFiles(dir, pattern) {
    const files = [];
    if (fs.existsSync(dir)) {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          files.push(...findFiles(fullPath, pattern));
        } else if (item.match(pattern.replace('*', '.*'))) {
          files.push(fullPath);
        }
      });
    }
    return files;
  }
  
  backupPatterns.forEach(pattern => {
    totalChecks++;
    const foundFiles = findFiles('.', pattern);
    if (foundFiles.length === 0) {
      securityScore++;
      securityLog.push(`✅ No backup files found: ${pattern}`);
    } else {
      vulnerabilities.push(`Backup files found: ${foundFiles.join(', ')}`);
      securityLog.push(`❌ Backup files found: ${foundFiles.length} files matching ${pattern}`);
      recommendations.push(`Remove backup files matching ${pattern}`);
    }
  });
}

// Check production deploy security
function checkProductionSecurity() {
  console.log('🚀 Checking production deployment security...');
  
  if (fs.existsSync('production-deploy')) {
    totalChecks++;
    const prodFiles = fs.readdirSync('production-deploy', { recursive: true });
    
    const hasSecureConfig = prodFiles.some(file => file.includes('security') || file.includes('config'));
    const hasMinifiedFiles = prodFiles.some(file => file.includes('.min.'));
    
    if (hasMinifiedFiles) {
      securityScore++;
      securityLog.push(`✅ Production: Has minified files`);
    } else {
      recommendations.push('Minify JavaScript and CSS for production');
    }
    
    securityLog.push(`✅ Production deploy directory exists with ${prodFiles.length} files`);
  } else {
    recommendations.push('Set up secure production deployment');
  }
}

// Run all security checks
console.log('🔧 Starting comprehensive security audit...\n');

checkRobotsTxt();
checkHtaccess();
checkSensitiveFiles();
checkHTMLSecurity();
checkJavaScriptSecurity();
checkAccessControl();
checkBackupFiles();
checkProductionSecurity();

// Calculate security score
const securityPercentage = Math.round((securityScore / totalChecks) * 100);

console.log('\n' + '='.repeat(60));
console.log('🔒 COMPREHENSIVE SECURITY AUDIT RESULTS:');
console.log('='.repeat(60));

console.log(`\n📊 Security Score: ${securityScore}/${totalChecks} (${securityPercentage}%)`);

let securityStatus;
if (securityPercentage >= 90) {
  securityStatus = '🟢 EXCELLENT';
} else if (securityPercentage >= 75) {
  securityStatus = '🟡 GOOD';
} else if (securityPercentage >= 60) {
  securityStatus = '🟠 FAIR';
} else {
  securityStatus = '🔴 POOR';
}

console.log(`🎯 Security Level: ${securityStatus}`);

console.log('\n📋 Security Audit Log:');
securityLog.forEach(log => console.log(`  ${log}`));

if (vulnerabilities.length > 0) {
  console.log('\n⚠️  VULNERABILITIES FOUND:');
  vulnerabilities.forEach((vuln, index) => console.log(`  ${index + 1}. ${vuln}`));
}

if (recommendations.length > 0) {
  console.log('\n💡 SECURITY RECOMMENDATIONS:');
  recommendations.forEach((rec, index) => console.log(`  ${index + 1}. ${rec}`));
}

// Save security report
const securityReport = {
  timestamp: new Date().toISOString(),
  securityScore: securityScore,
  totalChecks: totalChecks,
  securityPercentage: securityPercentage,
  securityStatus: securityStatus,
  securityLog: securityLog,
  vulnerabilities: vulnerabilities,
  recommendations: recommendations,
  status: 'SECURITY AUDIT COMPLETE'
};

fs.writeFileSync('security-audit-report.json', JSON.stringify(securityReport, null, 2));
console.log('\n📄 Security report saved to: security-audit-report.json');

console.log('\n🔒 COMPREHENSIVE SECURITY AUDIT COMPLETE');
console.log('='.repeat(60));