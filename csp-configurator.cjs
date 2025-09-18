#!/usr/bin/env node

/**
 * CONTENT SECURITY POLICY CONFIGURATOR
 * Sets up comprehensive CSP policies for enhanced security
 */

const fs = require('fs');
const path = require('path');

console.log('🛡️  CONTENT SECURITY POLICY CONFIGURATOR STARTING...');
console.log('='.repeat(60));

let cspConfigCount = 0;
const cspConfigLog = [];

// Define comprehensive CSP policies
const cspPolicies = {
  strict: {
    name: 'Strict CSP (High Security)',
    policy: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  },
  moderate: {
    name: 'Moderate CSP (Balanced)',
    policy: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  },
  development: {
    name: 'Development CSP (Permissive)',
    policy: "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https: ws: wss:; frame-ancestors 'none';"
  }
};

// Create CSP configuration file
function createCSPConfig() {
  console.log('📋 Creating CSP configuration file...');
  
  const cspConfig = {
    policies: cspPolicies,
    currentPolicy: 'moderate',
    reportUri: '/api/csp-report',
    reportOnly: false,
    nonce: {
      enabled: true,
      algorithm: 'sha256'
    },
    violations: {
      logToConsole: true,
      logToFile: true,
      reportToEndpoint: true
    },
    exemptions: {
      adminPages: ['admin-dashboard.html', 'admin-approvals-dashboard.html'],
      developmentPages: ['test.html', 'demo-site.html'],
      strictPages: ['student-portal.html', 'lms-integration.html']
    }
  };
  
  fs.writeFileSync('csp-config.json', JSON.stringify(cspConfig, null, 2));
  cspConfigCount++;
  cspConfigLog.push(`✅ csp-config.json: CSP configuration created`);
}

// Update HTML files with appropriate CSP
function updateHTMLWithCSP() {
  console.log('📄 Updating HTML files with appropriate CSP...');
  
  const htmlFiles = [
    { file: 'index.html', policy: 'moderate' },
    { file: 'hub.html', policy: 'moderate' },
    { file: 'student-portal.html', policy: 'strict' },
    { file: 'lms-integration.html', policy: 'strict' },
    { file: 'admin-dashboard.html', policy: 'strict' },
    { file: 'admin-approvals-dashboard.html', policy: 'strict' },
    { file: 'programs.html', policy: 'moderate' },
    { file: 'veterans.html', policy: 'moderate' },
    { file: 'about.html', policy: 'moderate' },
    { file: 'connect.html', policy: 'moderate' }
  ];
  
  htmlFiles.forEach(({ file, policy }) => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Remove existing CSP if present
      content = content.replace(/<meta[^>]*Content-Security-Policy[^>]*>/gi, '');
      
      // Add new CSP based on policy level
      const cspMeta = `    <meta http-equiv="Content-Security-Policy" content="${cspPolicies[policy].policy}">`;
      
      // Insert after charset meta tag
      const charsetMatch = content.match(/<meta[^>]*charset[^>]*>/i);
      if (charsetMatch) {
        const insertIndex = charsetMatch.index + charsetMatch[0].length;
        content = content.slice(0, insertIndex) + '\n' + cspMeta + content.slice(insertIndex);
      } else {
        // Insert after opening head tag
        const headMatch = content.match(/<head[^>]*>/i);
        if (headMatch) {
          const insertIndex = headMatch.index + headMatch[0].length;
          content = content.slice(0, insertIndex) + '\n' + cspMeta + content.slice(insertIndex);
        }
      }
      
      fs.writeFileSync(file, content);
      cspConfigCount++;
      cspConfigLog.push(`✅ ${file}: ${cspPolicies[policy].name} applied`);
    }
  });
}

// Create CSP violation reporting endpoint
function createCSPReportEndpoint() {
  console.log('📊 Creating CSP violation reporting endpoint...');
  
  const reportEndpoint = `// CSP Violation Reporting Endpoint
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// CSP violation report handler
router.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  const violation = req.body;
  const timestamp = new Date().toISOString();
  
  // Log violation to console
  console.warn('CSP Violation:', {
    timestamp,
    violation
  });
  
  // Log violation to file
  const logEntry = {
    timestamp,
    violation,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    referer: req.get('Referer')
  };
  
  const logFile = path.join(__dirname, 'logs', 'csp-violations.log');
  
  // Ensure logs directory exists
  const logsDir = path.dirname(logFile);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to log file
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\\n');
  
  // Send response
  res.status(204).send();
});

// CSP violation dashboard
router.get('/csp-violations', (req, res) => {
  const logFile = path.join(__dirname, 'logs', 'csp-violations.log');
  
  if (!fs.existsSync(logFile)) {
    return res.json({ violations: [] });
  }
  
  const logContent = fs.readFileSync(logFile, 'utf8');
  const violations = logContent
    .split('\\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .slice(-100); // Last 100 violations
  
  res.json({ violations });
});

module.exports = router;`;

  // Ensure api directory exists
  if (!fs.existsSync('api')) {
    fs.mkdirSync('api');
  }
  
  fs.writeFileSync('api/csp-report.js', reportEndpoint);
  cspConfigCount++;
  cspConfigLog.push(`✅ api/csp-report.js: CSP violation reporting endpoint created`);
}

// Create CSP nonce generator
function createCSPNonceGenerator() {
  console.log('🔐 Creating CSP nonce generator...');
  
  const nonceGenerator = `// CSP Nonce Generator
const crypto = require('crypto');

class CSPNonceGenerator {
  constructor() {
    this.nonces = new Map();
    this.maxAge = 300000; // 5 minutes
  }
  
  // Generate a new nonce
  generateNonce() {
    const nonce = crypto.randomBytes(16).toString('base64');
    const timestamp = Date.now();
    
    this.nonces.set(nonce, timestamp);
    this.cleanupExpiredNonces();
    
    return nonce;
  }
  
  // Validate a nonce
  validateNonce(nonce) {
    const timestamp = this.nonces.get(nonce);
    if (!timestamp) return false;
    
    const age = Date.now() - timestamp;
    if (age > this.maxAge) {
      this.nonces.delete(nonce);
      return false;
    }
    
    return true;
  }
  
  // Clean up expired nonces
  cleanupExpiredNonces() {
    const now = Date.now();
    for (const [nonce, timestamp] of this.nonces.entries()) {
      if (now - timestamp > this.maxAge) {
        this.nonces.delete(nonce);
      }
    }
  }
  
  // Get CSP header with nonce
  getCSPHeader(policy = 'moderate', nonce = null) {
    if (!nonce) {
      nonce = this.generateNonce();
    }
    
    const policies = {
      strict: \`default-src 'self'; script-src 'self' 'nonce-\${nonce}'; style-src 'self' 'nonce-\${nonce}'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';\`,
      moderate: \`default-src 'self'; script-src 'self' 'nonce-\${nonce}' https://cdn.tailwindcss.com; style-src 'self' 'nonce-\${nonce}' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';\`,
      development: \`default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-\${nonce}' https:; style-src 'self' 'unsafe-inline' 'nonce-\${nonce}' https:;\`
    };
    
    return {
      policy: policies[policy] || policies.moderate,
      nonce: nonce
    };
  }
}

module.exports = CSPNonceGenerator;`;

  fs.writeFileSync('lib/csp-nonce-generator.js', nonceGenerator);
  cspConfigCount++;
  cspConfigLog.push(`✅ lib/csp-nonce-generator.js: CSP nonce generator created`);
}

// Create CSP middleware for Express
function createCSPMiddleware() {
  console.log('⚙️  Creating CSP middleware for Express...');
  
  const cspMiddleware = `// CSP Middleware for Express
const CSPNonceGenerator = require('../lib/csp-nonce-generator');

const nonceGenerator = new CSPNonceGenerator();

// CSP middleware factory
function createCSPMiddleware(options = {}) {
  const {
    policy = 'moderate',
    reportUri = '/api/csp-report',
    reportOnly = false,
    useNonce = true
  } = options;
  
  return (req, res, next) => {
    let cspHeader;
    let nonce = null;
    
    if (useNonce) {
      const cspData = nonceGenerator.getCSPHeader(policy);
      cspHeader = cspData.policy;
      nonce = cspData.nonce;
      
      // Make nonce available to templates
      res.locals.cspNonce = nonce;
    } else {
      // Use static policy without nonce
      const policies = {
        strict: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
        moderate: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';",
        development: "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:;"
      };
      cspHeader = policies[policy] || policies.moderate;
    }
    
    // Add report URI if specified
    if (reportUri) {
      cspHeader += \` report-uri \${reportUri};\`;
    }
    
    // Set CSP header
    const headerName = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
    res.setHeader(headerName, cspHeader);
    
    next();
  };
}

// Route-specific CSP middleware
function routeCSP(policy) {
  return createCSPMiddleware({ policy });
}

// Admin routes CSP (strict)
function adminCSP() {
  return createCSPMiddleware({ policy: 'strict', useNonce: true });
}

// Student portal CSP (strict)
function studentCSP() {
  return createCSPMiddleware({ policy: 'strict', useNonce: true });
}

// Public pages CSP (moderate)
function publicCSP() {
  return createCSPMiddleware({ policy: 'moderate', useNonce: false });
}

module.exports = {
  createCSPMiddleware,
  routeCSP,
  adminCSP,
  studentCSP,
  publicCSP
};`;

  // Ensure middleware directory exists
  if (!fs.existsSync('middleware')) {
    fs.mkdirSync('middleware');
  }
  
  fs.writeFileSync('middleware/csp.js', cspMiddleware);
  cspConfigCount++;
  cspConfigLog.push(`✅ middleware/csp.js: CSP middleware created`);
}

// Create CSP testing tool
function createCSPTester() {
  console.log('🧪 Creating CSP testing tool...');
  
  const cspTester = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSP Testing Tool</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; report-uri /api/csp-report;">
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        .test-section { margin: 2rem 0; padding: 1rem; border: 1px solid #ccc; }
        .pass { color: green; }
        .fail { color: red; }
        .violation { background: #ffe6e6; padding: 0.5rem; margin: 0.5rem 0; }
    </style>
</head>
<body>
    <h1>CSP Testing Tool</h1>
    
    <div class="test-section">
        <h2>Inline Script Test</h2>
        <p id="inline-script-result">Testing...</p>
        <script>
            document.getElementById('inline-script-result').textContent = 'Inline script executed (should be blocked in strict CSP)';
            document.getElementById('inline-script-result').className = 'fail';
        </script>
    </div>
    
    <div class="test-section">
        <h2>External Script Test</h2>
        <p id="external-script-result">Testing external script...</p>
        <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
        <script>
            if (typeof _ !== 'undefined') {
                document.getElementById('external-script-result').textContent = 'External script loaded (should be blocked in strict CSP)';
                document.getElementById('external-script-result').className = 'fail';
            } else {
                document.getElementById('external-script-result').textContent = 'External script blocked';
                document.getElementById('external-script-result').className = 'pass';
            }
        </script>
    </div>
    
    <div class="test-section">
        <h2>Inline Style Test</h2>
        <p style="color: red; font-weight: bold;">This text should be red and bold (inline style)</p>
        <p>If the text above is styled, inline styles are allowed</p>
    </div>
    
    <div class="test-section">
        <h2>Image Source Test</h2>
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwZiIgLz4KICA8dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD4KPC9zdmc+" alt="Data URI Image" style="width: 100px; height: 100px;">
        <p>Data URI image test (should be allowed)</p>
    </div>
    
    <div class="test-section">
        <h2>Frame Test</h2>
        <iframe src="about:blank" width="300" height="200"></iframe>
        <p>If you see a frame above, frame-src is allowed</p>
    </div>
    
    <div class="test-section">
        <h2>CSP Violations Log</h2>
        <div id="violations-log">
            <p>Checking for violations...</p>
        </div>
        <button onclick="loadViolations()">Refresh Violations</button>
    </div>
    
    <script>
        // Load CSP violations
        function loadViolations() {
            fetch('/api/csp-violations')
                .then(response => response.json())
                .then(data => {
                    const log = document.getElementById('violations-log');
                    if (data.violations && data.violations.length > 0) {
                        log.innerHTML = '<h3>Recent Violations:</h3>' + 
                            data.violations.slice(-10).map(v => 
                                \`<div class="violation">
                                    <strong>\${new Date(v.timestamp).toLocaleString()}</strong><br>
                                    Blocked URI: \${v.violation['csp-report']['blocked-uri']}<br>
                                    Violated Directive: \${v.violation['csp-report']['violated-directive']}
                                </div>\`
                            ).join('');
                    } else {
                        log.innerHTML = '<p class="pass">No violations found</p>';
                    }
                })
                .catch(err => {
                    document.getElementById('violations-log').innerHTML = '<p class="fail">Error loading violations: ' + err.message + '</p>';
                });
        }
        
        // Load violations on page load
        setTimeout(loadViolations, 1000);
    </script>
</body>
</html>`;

  fs.writeFileSync('csp-test.html', cspTester);
  cspConfigCount++;
  cspConfigLog.push(`✅ csp-test.html: CSP testing tool created`);
}

// Update server configuration with CSP
function updateServerWithCSP() {
  console.log('🖥️  Updating server configuration with CSP...');
  
  const serverUpdate = `
// Add this to your Express server configuration

const { adminCSP, studentCSP, publicCSP } = require('./middleware/csp');
const cspReportRouter = require('./api/csp-report');

// Use CSP reporting endpoint
app.use('/api', cspReportRouter);

// Apply CSP middleware to different routes
app.use('/admin/*', adminCSP());
app.use('/student-portal*', studentCSP());
app.use('/lms-integration*', studentCSP());
app.use('/', publicCSP());

// Example route with custom CSP
app.get('/secure-page', routeCSP('strict'), (req, res) => {
  res.render('secure-page', { cspNonce: res.locals.cspNonce });
});
`;

  fs.writeFileSync('server-csp-integration.txt', serverUpdate);
  cspConfigCount++;
  cspConfigLog.push(`✅ server-csp-integration.txt: Server integration guide created`);
}

// Run all CSP configurations
console.log('🔧 Starting CSP configuration...\n');

createCSPConfig();
updateHTMLWithCSP();
createCSPReportEndpoint();
createCSPNonceGenerator();
createCSPMiddleware();
createCSPTester();
updateServerWithCSP();

console.log('\n' + '='.repeat(60));
console.log('🛡️  CONTENT SECURITY POLICY CONFIGURATION RESULTS:');
console.log('='.repeat(60));

console.log(`\n📊 Total CSP Configurations: ${cspConfigCount}`);

console.log('\n📋 CSP Configuration Log:');
cspConfigLog.forEach(log => console.log(`  ${log}`));

console.log('\n🔍 CSP Policy Levels:');
Object.entries(cspPolicies).forEach(([key, policy]) => {
  console.log(`  ${key.toUpperCase()}: ${policy.name}`);
});

// Save CSP configuration report
const cspReport = {
  timestamp: new Date().toISOString(),
  totalConfigurations: cspConfigCount,
  configurationLog: cspConfigLog,
  policies: cspPolicies,
  features: {
    nonceGeneration: true,
    violationReporting: true,
    routeSpecificCSP: true,
    testingTool: true,
    expressMiddleware: true
  },
  status: 'CSP CONFIGURATION COMPLETE'
};

fs.writeFileSync('csp-configuration-report.json', JSON.stringify(cspReport, null, 2));
console.log('\n📄 CSP configuration report saved to: csp-configuration-report.json');

console.log('\n🛡️  CONTENT SECURITY POLICY CONFIGURATION COMPLETE');
console.log('='.repeat(60));