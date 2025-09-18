// CSP Nonce Generator
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
      strict: `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`,
      moderate: `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://cdn.tailwindcss.com; style-src 'self' 'nonce-${nonce}' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';`,
      development: `default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}' https:; style-src 'self' 'unsafe-inline' 'nonce-${nonce}' https:;`
    };
    
    return {
      policy: policies[policy] || policies.moderate,
      nonce: nonce
    };
  }
}

module.exports = CSPNonceGenerator;