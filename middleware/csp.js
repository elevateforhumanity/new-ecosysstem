// CSP Middleware for Express
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
      cspHeader += ` report-uri ${reportUri};`;
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
};