#!/usr/bin/env node

/**
 * ACCESS CONTROL & AUTHENTICATION CHECKER
 * Verifies authentication systems and access controls
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 ACCESS CONTROL & AUTHENTICATION CHECKER STARTING...');
console.log('='.repeat(60));

let accessControlScore = 0;
let totalAccessChecks = 0;
const accessControlLog = [];
const accessVulnerabilities = [];
const accessRecommendations = [];

// Check authentication implementation
function checkAuthentication() {
  console.log('🔑 Checking authentication implementation...');
  
  const authFiles = [
    'auth-login.html',
    'login.html',
    'auth.js',
    'authentication.js',
    'jwt.js'
  ];
  
  let hasAuthSystem = false;
  
  authFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalAccessChecks++;
      hasAuthSystem = true;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasPasswordValidation = content.includes('password') && (content.includes('validate') || content.includes('check'));
      const hasTokenManagement = content.includes('token') || content.includes('jwt') || content.includes('session');
      const hasSecureStorage = content.includes('localStorage') || content.includes('sessionStorage') || content.includes('cookie');
      const hasLogout = content.includes('logout') || content.includes('signout');
      
      let authFeatures = 0;
      if (hasPasswordValidation) authFeatures++;
      if (hasTokenManagement) authFeatures++;
      if (hasSecureStorage) authFeatures++;
      if (hasLogout) authFeatures++;
      
      if (authFeatures >= 3) {
        accessControlScore++;
        accessControlLog.push(`✅ ${file}: Complete authentication system (${authFeatures}/4)`);
      } else {
        accessControlLog.push(`⚠️  ${file}: Incomplete authentication (${authFeatures}/4)`);
        if (!hasPasswordValidation) accessRecommendations.push(`Add password validation to ${file}`);
        if (!hasTokenManagement) accessRecommendations.push(`Add token management to ${file}`);
        if (!hasLogout) accessRecommendations.push(`Add logout functionality to ${file}`);
      }
      
      // Check for security issues
      if (content.includes('password') && content.includes('console.log')) {
        accessVulnerabilities.push(`Password logging detected in ${file}`);
      }
      
      if (content.includes('localStorage') && content.includes('password')) {
        accessVulnerabilities.push(`Password stored in localStorage in ${file}`);
      }
    }
  });
  
  if (!hasAuthSystem) {
    accessVulnerabilities.push('No authentication system found');
    accessRecommendations.push('Implement authentication system');
  }
}

// Check admin access controls
function checkAdminAccess() {
  console.log('👨‍💼 Checking admin access controls...');
  
  const adminFiles = [
    'admin-dashboard.html',
    'admin-approvals-dashboard.html',
    'admin/index.html'
  ];
  
  adminFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalAccessChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasAuthCheck = content.includes('auth') || content.includes('login') || content.includes('token');
      const hasRoleCheck = content.includes('role') || content.includes('admin') || content.includes('permission');
      const hasRedirect = content.includes('redirect') || content.includes('window.location');
      const hasSessionValidation = content.includes('session') || content.includes('validate');
      
      let adminSecurity = 0;
      if (hasAuthCheck) adminSecurity++;
      if (hasRoleCheck) adminSecurity++;
      if (hasRedirect) adminSecurity++;
      if (hasSessionValidation) adminSecurity++;
      
      if (adminSecurity >= 2) {
        accessControlScore++;
        accessControlLog.push(`✅ ${file}: Protected admin access (${adminSecurity}/4)`);
      } else {
        accessControlLog.push(`❌ ${file}: Unprotected admin access (${adminSecurity}/4)`);
        accessVulnerabilities.push(`Admin file lacks proper protection: ${file}`);
        if (!hasAuthCheck) accessRecommendations.push(`Add authentication check to ${file}`);
        if (!hasRoleCheck) accessRecommendations.push(`Add role-based access to ${file}`);
      }
    }
  });
}

// Check student portal access
function checkStudentAccess() {
  console.log('🎓 Checking student portal access controls...');
  
  const studentFiles = [
    'student-portal.html',
    'lms-integration.html',
    'student-dashboard.html'
  ];
  
  studentFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalAccessChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasStudentAuth = content.includes('student') && (content.includes('auth') || content.includes('login'));
      const hasDataProtection = content.includes('PII') || content.includes('privacy') || content.includes('secure');
      const hasSessionManagement = content.includes('session') || content.includes('token');
      
      let studentSecurity = 0;
      if (hasStudentAuth) studentSecurity++;
      if (hasDataProtection) studentSecurity++;
      if (hasSessionManagement) studentSecurity++;
      
      if (studentSecurity >= 2) {
        accessControlScore++;
        accessControlLog.push(`✅ ${file}: Protected student access (${studentSecurity}/3)`);
      } else {
        accessControlLog.push(`⚠️  ${file}: Limited student protection (${studentSecurity}/3)`);
        if (!hasStudentAuth) accessRecommendations.push(`Add student authentication to ${file}`);
        if (!hasDataProtection) accessRecommendations.push(`Add data protection measures to ${file}`);
      }
    }
  });
}

// Check API access controls
function checkAPIAccess() {
  console.log('🔌 Checking API access controls...');
  
  const apiFiles = [
    'api/auth.js',
    'api/admin.js',
    'api/students.js',
    'routes/api.js',
    'backend-api.js'
  ];
  
  apiFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalAccessChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasAPIAuth = content.includes('authenticate') || content.includes('authorize');
      const hasAPIKeys = content.includes('api_key') || content.includes('apiKey') || content.includes('API_KEY');
      const hasRateLimit = content.includes('rateLimit') || content.includes('rate-limit');
      const hasInputValidation = content.includes('validate') || content.includes('sanitize');
      const hasErrorHandling = content.includes('try') && content.includes('catch');
      
      let apiSecurity = 0;
      if (hasAPIAuth) apiSecurity++;
      if (hasAPIKeys) apiSecurity++;
      if (hasRateLimit) apiSecurity++;
      if (hasInputValidation) apiSecurity++;
      if (hasErrorHandling) apiSecurity++;
      
      if (apiSecurity >= 3) {
        accessControlScore++;
        accessControlLog.push(`✅ ${file}: Secure API access (${apiSecurity}/5)`);
      } else {
        accessControlLog.push(`⚠️  ${file}: Insecure API access (${apiSecurity}/5)`);
        if (!hasAPIAuth) accessRecommendations.push(`Add API authentication to ${file}`);
        if (!hasRateLimit) accessRecommendations.push(`Add rate limiting to ${file}`);
        if (!hasInputValidation) accessRecommendations.push(`Add input validation to ${file}`);
      }
    }
  });
}

// Check session management
function checkSessionManagement() {
  console.log('🕐 Checking session management...');
  
  const sessionFiles = [
    'js/session.js',
    'js/auth.js',
    'session-manager.js'
  ];
  
  let hasSessionSystem = false;
  
  sessionFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalAccessChecks++;
      hasSessionSystem = true;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasSessionTimeout = content.includes('timeout') || content.includes('expire');
      const hasSessionValidation = content.includes('validate') || content.includes('check');
      const hasSecureStorage = content.includes('httpOnly') || content.includes('secure');
      const hasSessionDestroy = content.includes('destroy') || content.includes('clear');
      
      let sessionFeatures = 0;
      if (hasSessionTimeout) sessionFeatures++;
      if (hasSessionValidation) sessionFeatures++;
      if (hasSecureStorage) sessionFeatures++;
      if (hasSessionDestroy) sessionFeatures++;
      
      if (sessionFeatures >= 2) {
        accessControlScore++;
        accessControlLog.push(`✅ ${file}: Good session management (${sessionFeatures}/4)`);
      } else {
        accessControlLog.push(`⚠️  ${file}: Poor session management (${sessionFeatures}/4)`);
        if (!hasSessionTimeout) accessRecommendations.push(`Add session timeout to ${file}`);
        if (!hasSecureStorage) accessRecommendations.push(`Add secure storage to ${file}`);
      }
    }
  });
  
  if (!hasSessionSystem) {
    accessRecommendations.push('Implement session management system');
  }
}

// Check role-based access control
function checkRoleBasedAccess() {
  console.log('👥 Checking role-based access control...');
  
  totalAccessChecks++;
  const allFiles = [
    'admin-dashboard.html',
    'student-portal.html',
    'lms-integration.html'
  ];
  
  let hasRoleSystem = false;
  let roleImplementations = 0;
  
  allFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('role') || content.includes('permission') || content.includes('access_level')) {
        hasRoleSystem = true;
        roleImplementations++;
      }
    }
  });
  
  if (hasRoleSystem && roleImplementations >= 2) {
    accessControlScore++;
    accessControlLog.push(`✅ Role-based access control implemented (${roleImplementations} files)`);
  } else if (hasRoleSystem) {
    accessControlLog.push(`⚠️  Partial role-based access control (${roleImplementations} files)`);
    accessRecommendations.push('Expand role-based access control to all protected pages');
  } else {
    accessControlLog.push(`❌ No role-based access control found`);
    accessVulnerabilities.push('Missing role-based access control system');
    accessRecommendations.push('Implement role-based access control system');
  }
}

// Check password security
function checkPasswordSecurity() {
  console.log('🔒 Checking password security...');
  
  const authFiles = ['auth-login.html', 'login.html', 'register.html', 'signup.html'];
  
  authFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalAccessChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasPasswordRequirements = content.includes('minlength') || content.includes('pattern') || content.includes('required');
      const hasPasswordHashing = content.includes('hash') || content.includes('bcrypt') || content.includes('crypto');
      const hasPasswordStrength = content.includes('strength') || content.includes('complexity');
      const hasPasswordConfirm = content.includes('confirm') || content.includes('repeat');
      
      let passwordSecurity = 0;
      if (hasPasswordRequirements) passwordSecurity++;
      if (hasPasswordHashing) passwordSecurity++;
      if (hasPasswordStrength) passwordSecurity++;
      if (hasPasswordConfirm) passwordSecurity++;
      
      if (passwordSecurity >= 2) {
        accessControlScore++;
        accessControlLog.push(`✅ ${file}: Good password security (${passwordSecurity}/4)`);
      } else {
        accessControlLog.push(`⚠️  ${file}: Weak password security (${passwordSecurity}/4)`);
        if (!hasPasswordRequirements) accessRecommendations.push(`Add password requirements to ${file}`);
        if (!hasPasswordHashing) accessRecommendations.push(`Add password hashing to ${file}`);
      }
    }
  });
}

// Run all access control checks
console.log('🔧 Starting access control and authentication analysis...\n');

checkAuthentication();
checkAdminAccess();
checkStudentAccess();
checkAPIAccess();
checkSessionManagement();
checkRoleBasedAccess();
checkPasswordSecurity();

// Calculate access control score
const accessControlPercentage = totalAccessChecks > 0 ? Math.round((accessControlScore / totalAccessChecks) * 100) : 0;

console.log('\n' + '='.repeat(60));
console.log('🔐 ACCESS CONTROL & AUTHENTICATION RESULTS:');
console.log('='.repeat(60));

console.log(`\n📊 Access Control Score: ${accessControlScore}/${totalAccessChecks} (${accessControlPercentage}%)`);

let accessControlStatus;
if (accessControlPercentage >= 90) {
  accessControlStatus = '🟢 EXCELLENT';
} else if (accessControlPercentage >= 75) {
  accessControlStatus = '🟡 GOOD';
} else if (accessControlPercentage >= 60) {
  accessControlStatus = '🟠 FAIR';
} else {
  accessControlStatus = '🔴 POOR';
}

console.log(`🎯 Access Control Level: ${accessControlStatus}`);

console.log('\n📋 Access Control Log:');
accessControlLog.forEach(log => console.log(`  ${log}`));

if (accessVulnerabilities.length > 0) {
  console.log('\n⚠️  ACCESS CONTROL VULNERABILITIES:');
  accessVulnerabilities.forEach((vuln, index) => console.log(`  ${index + 1}. ${vuln}`));
}

if (accessRecommendations.length > 0) {
  console.log('\n💡 ACCESS CONTROL RECOMMENDATIONS:');
  accessRecommendations.forEach((rec, index) => console.log(`  ${index + 1}. ${rec}`));
}

// Save access control report
const accessControlReport = {
  timestamp: new Date().toISOString(),
  accessControlScore: accessControlScore,
  totalAccessChecks: totalAccessChecks,
  accessControlPercentage: accessControlPercentage,
  accessControlStatus: accessControlStatus,
  accessControlLog: accessControlLog,
  accessVulnerabilities: accessVulnerabilities,
  accessRecommendations: accessRecommendations,
  status: 'ACCESS CONTROL ANALYSIS COMPLETE'
};

fs.writeFileSync('access-control-report.json', JSON.stringify(accessControlReport, null, 2));
console.log('\n📄 Access control report saved to: access-control-report.json');

console.log('\n🔐 ACCESS CONTROL & AUTHENTICATION ANALYSIS COMPLETE');
console.log('='.repeat(60));