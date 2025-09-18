#!/usr/bin/env node

/**
 * SERVER-SIDE SECURITY CHECKER
 * Analyzes server configurations and protections
 */

const fs = require('fs');
const path = require('path');

console.log('🛡️  SERVER-SIDE SECURITY CHECKER STARTING...');
console.log('='.repeat(60));

let serverSecurityScore = 0;
let totalServerChecks = 0;
const serverSecurityLog = [];
const serverVulnerabilities = [];
const serverRecommendations = [];

// Check server configuration files
function checkServerConfigs() {
  console.log('⚙️  Checking server configuration files...');
  
  const serverFiles = [
    'server.js',
    'simple-server.js',
    'simple-server.cjs',
    'production-server.js',
    'optimized-server.cjs'
  ];
  
  serverFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalServerChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for security middleware
      const hasHelmet = content.includes('helmet');
      const hasRateLimit = content.includes('rateLimit') || content.includes('rate-limit');
      const hasCompression = content.includes('compression');
      const hasCors = content.includes('cors');
      const hasAuth = content.includes('auth') || content.includes('jwt') || content.includes('session');
      
      let securityFeatures = 0;
      if (hasHelmet) securityFeatures++;
      if (hasRateLimit) securityFeatures++;
      if (hasCompression) securityFeatures++;
      if (hasCors) securityFeatures++;
      if (hasAuth) securityFeatures++;
      
      if (securityFeatures >= 3) {
        serverSecurityScore++;
        serverSecurityLog.push(`✅ ${file}: Good security middleware (${securityFeatures}/5)`);
      } else {
        serverSecurityLog.push(`⚠️  ${file}: Limited security middleware (${securityFeatures}/5)`);
        if (!hasHelmet) serverRecommendations.push(`Add Helmet.js to ${file}`);
        if (!hasRateLimit) serverRecommendations.push(`Add rate limiting to ${file}`);
        if (!hasCors) serverRecommendations.push(`Add CORS configuration to ${file}`);
      }
      
      // Check for dangerous patterns
      const hasEval = content.includes('eval(');
      const hasExec = content.includes('exec(') || content.includes('spawn(');
      const hasFileSystem = content.includes('fs.writeFile') || content.includes('fs.unlink');
      
      if (hasEval) {
        serverVulnerabilities.push(`Dangerous eval() found in ${file}`);
        serverRecommendations.push(`Remove eval() usage from ${file}`);
      }
      
      if (hasExec) {
        serverVulnerabilities.push(`Command execution found in ${file}`);
        serverRecommendations.push(`Secure command execution in ${file}`);
      }
    }
  });
}

// Check environment configuration
function checkEnvironmentConfig() {
  console.log('🌍 Checking environment configuration...');
  
  const envFiles = ['.env', '.env.example', '.env.template', '.env.production'];
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalServerChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasSecrets = content.includes('SECRET') || content.includes('KEY') || content.includes('PASSWORD');
      const hasDatabase = content.includes('DATABASE') || content.includes('DB_');
      const hasAPI = content.includes('API_KEY') || content.includes('API_SECRET');
      
      if (file === '.env' && hasSecrets) {
        serverVulnerabilities.push('Production secrets in .env file');
        serverRecommendations.push('Move production secrets to secure environment variables');
      } else if (file.includes('example') || file.includes('template')) {
        if (!hasSecrets) {
          serverSecurityScore++;
          serverSecurityLog.push(`✅ ${file}: No secrets exposed in template`);
        } else {
          serverVulnerabilities.push(`Template file contains actual secrets: ${file}`);
        }
      }
    }
  });
}

// Check Docker security
function checkDockerSecurity() {
  console.log('🐳 Checking Docker security configurations...');
  
  const dockerFiles = ['Dockerfile', 'Dockerfile.dev', 'docker-compose.yml'];
  
  dockerFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalServerChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasNonRootUser = content.includes('USER ') && !content.includes('USER root');
      const hasHealthCheck = content.includes('HEALTHCHECK');
      const hasSecrets = content.includes('--secret') || content.includes('secrets:');
      const hasPrivileged = content.includes('privileged: true');
      
      if (hasNonRootUser) {
        serverSecurityScore++;
        serverSecurityLog.push(`✅ ${file}: Uses non-root user`);
      } else {
        serverVulnerabilities.push(`Docker runs as root: ${file}`);
        serverRecommendations.push(`Add non-root USER directive to ${file}`);
      }
      
      if (hasHealthCheck) {
        serverSecurityLog.push(`✅ ${file}: Has health check`);
      } else {
        serverRecommendations.push(`Add HEALTHCHECK to ${file}`);
      }
      
      if (hasPrivileged) {
        serverVulnerabilities.push(`Privileged mode enabled: ${file}`);
        serverRecommendations.push(`Remove privileged mode from ${file}`);
      }
    }
  });
}

// Check API security
function checkAPISecurity() {
  console.log('🔌 Checking API security configurations...');
  
  const apiFiles = [
    'api/index.js',
    'routes/api.js',
    'backend-api.js',
    'license-api.js'
  ];
  
  apiFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalServerChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasValidation = content.includes('validate') || content.includes('joi') || content.includes('yup');
      const hasAuth = content.includes('authenticate') || content.includes('authorize') || content.includes('jwt');
      const hasSanitization = content.includes('sanitize') || content.includes('escape');
      const hasRateLimit = content.includes('rateLimit');
      
      let apiSecurity = 0;
      if (hasValidation) apiSecurity++;
      if (hasAuth) apiSecurity++;
      if (hasSanitization) apiSecurity++;
      if (hasRateLimit) apiSecurity++;
      
      if (apiSecurity >= 2) {
        serverSecurityScore++;
        serverSecurityLog.push(`✅ ${file}: Good API security (${apiSecurity}/4)`);
      } else {
        serverSecurityLog.push(`⚠️  ${file}: Limited API security (${apiSecurity}/4)`);
        if (!hasValidation) serverRecommendations.push(`Add input validation to ${file}`);
        if (!hasAuth) serverRecommendations.push(`Add authentication to ${file}`);
        if (!hasSanitization) serverRecommendations.push(`Add input sanitization to ${file}`);
      }
    }
  });
}

// Check database security
function checkDatabaseSecurity() {
  console.log('🗄️  Checking database security configurations...');
  
  const dbFiles = [
    'prisma/schema.prisma',
    'supabase/config.toml',
    'database.js',
    'db/config.js'
  ];
  
  dbFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalServerChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasSSL = content.includes('ssl') || content.includes('sslmode');
      const hasEncryption = content.includes('encrypt') || content.includes('cipher');
      const hasConnectionLimit = content.includes('max_connections') || content.includes('pool');
      const hasHardcodedCreds = content.match(/password\s*[:=]\s*["'][^"']+["']/i);
      
      if (hasSSL) {
        serverSecurityScore++;
        serverSecurityLog.push(`✅ ${file}: SSL/TLS configured`);
      } else {
        serverRecommendations.push(`Enable SSL/TLS for ${file}`);
      }
      
      if (hasHardcodedCreds) {
        serverVulnerabilities.push(`Hardcoded credentials in ${file}`);
        serverRecommendations.push(`Use environment variables for credentials in ${file}`);
      }
    }
  });
}

// Check logging and monitoring
function checkLoggingMonitoring() {
  console.log('📊 Checking logging and monitoring configurations...');
  
  totalServerChecks++;
  const serverFiles = ['simple-server.cjs', 'server.js'];
  let hasLogging = false;
  let hasMonitoring = false;
  
  serverFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('pino') || content.includes('winston') || content.includes('console.log')) {
        hasLogging = true;
      }
      
      if (content.includes('monitor') || content.includes('metrics') || content.includes('health')) {
        hasMonitoring = true;
      }
    }
  });
  
  if (hasLogging && hasMonitoring) {
    serverSecurityScore++;
    serverSecurityLog.push(`✅ Logging and monitoring configured`);
  } else {
    if (!hasLogging) serverRecommendations.push('Add structured logging');
    if (!hasMonitoring) serverRecommendations.push('Add health monitoring');
  }
}

// Check SSL/TLS configuration
function checkSSLTLS() {
  console.log('🔒 Checking SSL/TLS configurations...');
  
  const configFiles = [
    'netlify.toml',
    '_headers',
    '.htaccess',
    'vercel.json'
  ];
  
  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalServerChecks++;
      const content = fs.readFileSync(file, 'utf8');
      
      const hasHTTPS = content.includes('https') || content.includes('ssl') || content.includes('tls');
      const hasHSTS = content.includes('Strict-Transport-Security');
      const hasSecureHeaders = content.includes('X-Frame-Options') || content.includes('Content-Security-Policy');
      
      if (hasHTTPS && hasHSTS) {
        serverSecurityScore++;
        serverSecurityLog.push(`✅ ${file}: HTTPS and HSTS configured`);
      } else {
        if (!hasHTTPS) serverRecommendations.push(`Enable HTTPS in ${file}`);
        if (!hasHSTS) serverRecommendations.push(`Add HSTS header to ${file}`);
      }
    }
  });
}

// Run all server security checks
console.log('🔧 Starting server-side security analysis...\n');

checkServerConfigs();
checkEnvironmentConfig();
checkDockerSecurity();
checkAPISecurity();
checkDatabaseSecurity();
checkLoggingMonitoring();
checkSSLTLS();

// Calculate server security score
const serverSecurityPercentage = totalServerChecks > 0 ? Math.round((serverSecurityScore / totalServerChecks) * 100) : 0;

console.log('\n' + '='.repeat(60));
console.log('🛡️  SERVER-SIDE SECURITY ANALYSIS RESULTS:');
console.log('='.repeat(60));

console.log(`\n📊 Server Security Score: ${serverSecurityScore}/${totalServerChecks} (${serverSecurityPercentage}%)`);

let serverSecurityStatus;
if (serverSecurityPercentage >= 90) {
  serverSecurityStatus = '🟢 EXCELLENT';
} else if (serverSecurityPercentage >= 75) {
  serverSecurityStatus = '🟡 GOOD';
} else if (serverSecurityPercentage >= 60) {
  serverSecurityStatus = '🟠 FAIR';
} else {
  serverSecurityStatus = '🔴 POOR';
}

console.log(`🎯 Server Security Level: ${serverSecurityStatus}`);

console.log('\n📋 Server Security Log:');
serverSecurityLog.forEach(log => console.log(`  ${log}`));

if (serverVulnerabilities.length > 0) {
  console.log('\n⚠️  SERVER VULNERABILITIES FOUND:');
  serverVulnerabilities.forEach((vuln, index) => console.log(`  ${index + 1}. ${vuln}`));
}

if (serverRecommendations.length > 0) {
  console.log('\n💡 SERVER SECURITY RECOMMENDATIONS:');
  serverRecommendations.forEach((rec, index) => console.log(`  ${index + 1}. ${rec}`));
}

// Save server security report
const serverSecurityReport = {
  timestamp: new Date().toISOString(),
  serverSecurityScore: serverSecurityScore,
  totalServerChecks: totalServerChecks,
  serverSecurityPercentage: serverSecurityPercentage,
  serverSecurityStatus: serverSecurityStatus,
  serverSecurityLog: serverSecurityLog,
  serverVulnerabilities: serverVulnerabilities,
  serverRecommendations: serverRecommendations,
  status: 'SERVER SECURITY ANALYSIS COMPLETE'
};

fs.writeFileSync('server-security-report.json', JSON.stringify(serverSecurityReport, null, 2));
console.log('\n📄 Server security report saved to: server-security-report.json');

console.log('\n🛡️  SERVER-SIDE SECURITY ANALYSIS COMPLETE');
console.log('='.repeat(60));