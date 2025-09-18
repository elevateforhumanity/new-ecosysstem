#!/usr/bin/env node

/**
 * CLIENT-SIDE CODE EXPOSURE AUDITOR
 * Audits and protects client-side code from exposure
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 CLIENT-SIDE CODE EXPOSURE AUDITOR STARTING...');
console.log('='.repeat(60));

let auditCount = 0;
let protectionCount = 0;
const auditLog = [];
const exposureRisks = [];
const protectionMeasures = [];

// Scan for exposed sensitive information
function scanForSensitiveInfo() {
  console.log('🔎 Scanning for exposed sensitive information...');
  
  const sensitivePatterns = [
    { name: 'API Keys', pattern: /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi },
    { name: 'Passwords', pattern: /password\s*[:=]\s*["'][^"']+["']/gi },
    { name: 'Secrets', pattern: /secret\s*[:=]\s*["'][^"']+["']/gi },
    { name: 'Tokens', pattern: /token\s*[:=]\s*["'][^"']+["']/gi },
    { name: 'Database URLs', pattern: /database[_-]?url\s*[:=]\s*["'][^"']+["']/gi },
    { name: 'Private Keys', pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/gi },
    { name: 'Email Addresses', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    { name: 'Phone Numbers', pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g },
    { name: 'SSN Patterns', pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
    { name: 'Credit Card Numbers', pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g }
  ];
  
  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      sensitivePatterns.forEach(({ name, pattern }) => {
        const matches = content.match(pattern);
        if (matches) {
          exposureRisks.push({
            file: filePath,
            type: name,
            matches: matches.length,
            severity: getSeverity(name)
          });
          auditLog.push(`⚠️  ${filePath}: Found ${matches.length} ${name} patterns`);
        }
      });
      
    } catch (error) {
      auditLog.push(`❌ ${filePath}: Error scanning - ${error.message}`);
    }
  }
  
  function getSeverity(type) {
    const highRisk = ['API Keys', 'Passwords', 'Secrets', 'Tokens', 'Private Keys', 'Database URLs'];
    const mediumRisk = ['SSN Patterns', 'Credit Card Numbers'];
    const lowRisk = ['Email Addresses', 'Phone Numbers'];
    
    if (highRisk.includes(type)) return 'HIGH';
    if (mediumRisk.includes(type)) return 'MEDIUM';
    if (lowRisk.includes(type)) return 'LOW';
    return 'UNKNOWN';
  }
  
  // Scan JavaScript files
  const jsFiles = [
    'js/unified-navigation.js',
    'js/auth.js',
    'js/api.js',
    'app.js',
    'main.js'
  ];
  
  jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      auditCount++;
      scanFile(file);
    }
  });
  
  // Scan HTML files for inline scripts
  const htmlFiles = ['index.html', 'hub.html', 'student-portal.html', 'admin-dashboard.html'];
  
  htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
      auditCount++;
      scanFile(file);
    }
  });
}

// Check for debug information exposure
function checkDebugExposure() {
  console.log('🐛 Checking for debug information exposure...');
  
  const debugPatterns = [
    { name: 'Console Logs', pattern: /console\.(log|debug|info|warn|error)/g },
    { name: 'Alert Statements', pattern: /alert\s*\(/g },
    { name: 'Debugger Statements', pattern: /debugger\s*;/g },
    { name: 'TODO Comments', pattern: /\/\/\s*TODO|\/\*\s*TODO/gi },
    { name: 'FIXME Comments', pattern: /\/\/\s*FIXME|\/\*\s*FIXME/gi },
    { name: 'Development URLs', pattern: /localhost|127\.0\.0\.1|dev\.|staging\./g }
  ];
  
  function scanForDebug(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      debugPatterns.forEach(({ name, pattern }) => {
        const matches = content.match(pattern);
        if (matches) {
          exposureRisks.push({
            file: filePath,
            type: name,
            matches: matches.length,
            severity: 'LOW'
          });
          auditLog.push(`ℹ️  ${filePath}: Found ${matches.length} ${name}`);
        }
      });
      
    } catch (error) {
      auditLog.push(`❌ ${filePath}: Error scanning debug - ${error.message}`);
    }
  }
  
  // Scan all JavaScript files
  function findJSFiles(dir) {
    const jsFiles = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          jsFiles.push(...findJSFiles(fullPath));
        } else if (stat.isFile() && item.endsWith('.js')) {
          jsFiles.push(fullPath);
        }
      });
    } catch (error) {
      // Ignore directory access errors
    }
    
    return jsFiles;
  }
  
  const allJSFiles = findJSFiles('.');
  allJSFiles.forEach(file => {
    auditCount++;
    scanForDebug(file);
  });
}

// Check source map exposure
function checkSourceMapExposure() {
  console.log('🗺️  Checking for source map exposure...');
  
  function findSourceMaps(dir) {
    const mapFiles = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          mapFiles.push(...findSourceMaps(fullPath));
        } else if (stat.isFile() && item.endsWith('.map')) {
          mapFiles.push(fullPath);
        }
      });
    } catch (error) {
      // Ignore directory access errors
    }
    
    return mapFiles;
  }
  
  const sourceMapFiles = findSourceMaps('.');
  
  sourceMapFiles.forEach(file => {
    auditCount++;
    exposureRisks.push({
      file: file,
      type: 'Source Map',
      matches: 1,
      severity: 'MEDIUM'
    });
    auditLog.push(`⚠️  ${file}: Source map file exposed`);
  });
  
  // Check for source map references in JS files
  function checkSourceMapReferences(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('//# sourceMappingURL=')) {
        exposureRisks.push({
          file: filePath,
          type: 'Source Map Reference',
          matches: 1,
          severity: 'MEDIUM'
        });
        auditLog.push(`⚠️  ${filePath}: Contains source map reference`);
      }
      
    } catch (error) {
      // Ignore file read errors
    }
  }
  
  const jsFiles = findSourceMaps('.').filter(f => f.endsWith('.js'));
  jsFiles.forEach(checkSourceMapReferences);
}

// Implement code obfuscation
function implementCodeObfuscation() {
  console.log('🔒 Implementing code obfuscation measures...');
  
  const obfuscationScript = `#!/usr/bin/env node

/**
 * CODE OBFUSCATION SCRIPT
 * Obfuscates JavaScript files for production
 */

const fs = require('fs');
const path = require('path');

// Simple obfuscation function (for demonstration)
function obfuscateCode(code) {
  // Remove comments
  code = code.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');
  code = code.replace(/\\/\\/.*$/gm, '');
  
  // Remove extra whitespace
  code = code.replace(/\\s+/g, ' ');
  code = code.replace(/;\\s*}/g, ';}');
  code = code.replace(/{\\s*/g, '{');
  code = code.replace(/}\\s*/g, '}');
  
  // Simple variable name obfuscation
  const varMap = new Map();
  let varCounter = 0;
  
  code = code.replace(/\\b(var|let|const)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\b/g, (match, keyword, varName) => {
    if (!varMap.has(varName)) {
      varMap.set(varName, \`_\${varCounter.toString(36)}\`);
      varCounter++;
    }
    return \`\${keyword} \${varMap.get(varName)}\`;
  });
  
  // Replace variable references
  varMap.forEach((obfuscated, original) => {
    const regex = new RegExp(\`\\\\b\${original}\\\\b\`, 'g');
    code = code.replace(regex, obfuscated);
  });
  
  return code;
}

// Obfuscate production files
function obfuscateProductionFiles() {
  const filesToObfuscate = [
    'js/unified-navigation.js',
    'js/auth.js',
    'js/api.js'
  ];
  
  filesToObfuscate.forEach(file => {
    if (fs.existsSync(file)) {
      const originalCode = fs.readFileSync(file, 'utf8');
      const obfuscatedCode = obfuscateCode(originalCode);
      
      // Create backup
      fs.writeFileSync(\`\${file}.original\`, originalCode);
      
      // Write obfuscated version
      fs.writeFileSync(file, obfuscatedCode);
      
      console.log(\`✅ Obfuscated: \${file}\`);
    }
  });
}

// Run obfuscation
if (require.main === module) {
  obfuscateProductionFiles();
}

module.exports = { obfuscateCode, obfuscateProductionFiles };`;

  fs.writeFileSync('scripts/obfuscate-code.js', obfuscationScript);
  protectionCount++;
  protectionMeasures.push('Code obfuscation script created');
  auditLog.push(`✅ scripts/obfuscate-code.js: Code obfuscation script created`);
}

// Create production build script
function createProductionBuildScript() {
  console.log('🏗️  Creating production build script...');
  
  const buildScript = `#!/usr/bin/env node

/**
 * PRODUCTION BUILD SCRIPT
 * Prepares code for production deployment with security measures
 */

const fs = require('fs');
const path = require('path');
const { obfuscateProductionFiles } = require('./obfuscate-code');

console.log('🏗️  Starting production build...');

// Remove development files
function removeDevFiles() {
  const devFiles = [
    'csp-test.html',
    'test.html',
    'demo-site.html',
    '*.log',
    '*.bak',
    '*.backup',
    '*.old',
    '*.map'
  ];
  
  devFiles.forEach(pattern => {
    if (pattern.includes('*')) {
      // Handle glob patterns
      const regex = new RegExp(pattern.replace('*', '.*'));
      fs.readdirSync('.').forEach(file => {
        if (regex.test(file)) {
          fs.unlinkSync(file);
          console.log(\`🗑️  Removed: \${file}\`);
        }
      });
    } else if (fs.existsSync(pattern)) {
      fs.unlinkSync(pattern);
      console.log(\`🗑️  Removed: \${pattern}\`);
    }
  });
}

// Minify CSS files
function minifyCSS() {
  const cssFiles = ['css/styles.css', 'animations.css'];
  
  cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let css = fs.readFileSync(file, 'utf8');
      
      // Simple CSS minification
      css = css.replace(/\\/\\*[\\s\\S]*?\\*\\//g, ''); // Remove comments
      css = css.replace(/\\s+/g, ' '); // Collapse whitespace
      css = css.replace(/;\\s*}/g, ';}'); // Remove space before closing brace
      css = css.replace(/{\\s*/g, '{'); // Remove space after opening brace
      css = css.replace(/}\\s*/g, '}'); // Remove space after closing brace
      css = css.replace(/;\\s*/g, ';'); // Remove space after semicolon
      css = css.trim();
      
      fs.writeFileSync(file, css);
      console.log(\`✅ Minified: \${file}\`);
    }
  });
}

// Remove source map references
function removeSourceMapReferences() {
  function processFile(filePath) {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/\\/\\/# sourceMappingURL=.*$/gm, '');
      fs.writeFileSync(filePath, content);
      console.log(\`✅ Removed source map references: \${filePath}\`);
    }
  }
  
  const jsFiles = ['js/unified-navigation.js', 'app.js', 'main.js'];
  jsFiles.forEach(processFile);
}

// Add production headers
function addProductionHeaders() {
  const productionHeaders = \`/*
  Production Build - \${new Date().toISOString()}
  Copyright (c) 2025 Elevate for Humanity
  All rights reserved. Unauthorized copying prohibited.
*/\`;

  const filesToHeader = ['index.html', 'hub.html', 'js/unified-navigation.js'];
  
  filesToHeader.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const newContent = file.endsWith('.html') 
        ? \`<!-- \${productionHeaders} -->\\n\${content}\`
        : \`\${productionHeaders}\\n\${content}\`;
      
      fs.writeFileSync(file, newContent);
      console.log(\`✅ Added production header: \${file}\`);
    }
  });
}

// Run production build
function runProductionBuild() {
  console.log('1. Removing development files...');
  removeDevFiles();
  
  console.log('2. Obfuscating JavaScript...');
  obfuscateProductionFiles();
  
  console.log('3. Minifying CSS...');
  minifyCSS();
  
  console.log('4. Removing source map references...');
  removeSourceMapReferences();
  
  console.log('5. Adding production headers...');
  addProductionHeaders();
  
  console.log('🎉 Production build complete!');
}

if (require.main === module) {
  runProductionBuild();
}

module.exports = { runProductionBuild };`;

  // Ensure scripts directory exists
  if (!fs.existsSync('scripts')) {
    fs.mkdirSync('scripts');
  }
  
  fs.writeFileSync('scripts/production-build.js', buildScript);
  protectionCount++;
  protectionMeasures.push('Production build script created');
  auditLog.push(`✅ scripts/production-build.js: Production build script created`);
}

// Create client-side security headers
function createClientSecurityHeaders() {
  console.log('🛡️  Creating client-side security headers...');
  
  const securityJS = `/**
 * CLIENT-SIDE SECURITY MEASURES
 * Implements additional security measures on the client side
 */

(function() {
  'use strict';
  
  // Disable right-click context menu (basic protection)
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });
  
  // Disable F12, Ctrl+Shift+I, Ctrl+U (basic protection)
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+S
    if (e.ctrlKey && e.keyCode === 83) {
      e.preventDefault();
      return false;
    }
  });
  
  // Detect developer tools (basic detection)
  let devtools = {
    open: false,
    orientation: null
  };
  
  setInterval(function() {
    if (window.outerHeight - window.innerHeight > 200 || 
        window.outerWidth - window.innerWidth > 200) {
      if (!devtools.open) {
        devtools.open = true;
        console.clear();
        console.log('%cDeveloper tools detected!', 'color: red; font-size: 20px; font-weight: bold;');
        console.log('%cThis site is protected. Unauthorized access is prohibited.', 'color: red; font-size: 14px;');
      }
    } else {
      devtools.open = false;
    }
  }, 500);
  
  // Console warning
  console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
  console.log('%cThis is a browser feature intended for developers. Unauthorized access to this system is prohibited.', 'color: red; font-size: 16px;');
  console.log('%cIf someone told you to copy-paste something here, it is likely a scam.', 'color: red; font-size: 14px;');
  
  // Disable text selection (basic protection)
  document.onselectstart = function() {
    return false;
  };
  
  document.onmousedown = function() {
    return false;
  };
  
  // Clear console periodically
  setInterval(function() {
    console.clear();
  }, 10000);
  
  // Basic anti-debugging
  function detectDebugger() {
    const start = new Date().getTime();
    debugger;
    const end = new Date().getTime();
    
    if (end - start > 100) {
      console.log('Debugger detected!');
      // Could redirect or take other action
    }
  }
  
  // Run detection periodically
  setInterval(detectDebugger, 1000);
  
})();`;

  fs.writeFileSync('js/security.js', securityJS);
  protectionCount++;
  protectionMeasures.push('Client-side security measures implemented');
  auditLog.push(`✅ js/security.js: Client-side security measures created`);
}

// Run all audits and protections
console.log('🔧 Starting client-side code exposure audit...\n');

scanForSensitiveInfo();
checkDebugExposure();
checkSourceMapExposure();
implementCodeObfuscation();
createProductionBuildScript();
createClientSecurityHeaders();

// Calculate risk levels
const highRisks = exposureRisks.filter(r => r.severity === 'HIGH').length;
const mediumRisks = exposureRisks.filter(r => r.severity === 'MEDIUM').length;
const lowRisks = exposureRisks.filter(r => r.severity === 'LOW').length;

console.log('\n' + '='.repeat(60));
console.log('🔍 CLIENT-SIDE CODE EXPOSURE AUDIT RESULTS:');
console.log('='.repeat(60));

console.log(`\n📊 Files Audited: ${auditCount}`);
console.log(`🛡️  Protection Measures: ${protectionCount}`);
console.log(`⚠️  Total Exposure Risks: ${exposureRisks.length}`);
console.log(`  🔴 High Risk: ${highRisks}`);
console.log(`  🟡 Medium Risk: ${mediumRisks}`);
console.log(`  🟢 Low Risk: ${lowRisks}`);

console.log('\n📋 Audit Log:');
auditLog.forEach(log => console.log(`  ${log}`));

if (exposureRisks.length > 0) {
  console.log('\n⚠️  EXPOSURE RISKS FOUND:');
  exposureRisks.forEach((risk, index) => {
    console.log(`  ${index + 1}. ${risk.file}: ${risk.type} (${risk.severity}) - ${risk.matches} instances`);
  });
}

console.log('\n🛡️  PROTECTION MEASURES IMPLEMENTED:');
protectionMeasures.forEach((measure, index) => {
  console.log(`  ${index + 1}. ${measure}`);
});

// Save audit report
const clientAuditReport = {
  timestamp: new Date().toISOString(),
  filesAudited: auditCount,
  protectionMeasures: protectionCount,
  exposureRisks: exposureRisks,
  riskSummary: {
    high: highRisks,
    medium: mediumRisks,
    low: lowRisks,
    total: exposureRisks.length
  },
  auditLog: auditLog,
  protectionMeasures: protectionMeasures,
  status: 'CLIENT-SIDE CODE AUDIT COMPLETE'
};

fs.writeFileSync('client-code-audit-report.json', JSON.stringify(clientAuditReport, null, 2));
console.log('\n📄 Client code audit report saved to: client-code-audit-report.json');

console.log('\n🔍 CLIENT-SIDE CODE EXPOSURE AUDIT COMPLETE');
console.log('='.repeat(60));