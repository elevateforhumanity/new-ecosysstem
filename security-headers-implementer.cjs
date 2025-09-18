#!/usr/bin/env node

/**
 * SECURITY HEADERS IMPLEMENTER
 * Adds comprehensive security headers to all HTML files
 */

const fs = require('fs');
const path = require('path');

console.log('🛡️  SECURITY HEADERS IMPLEMENTER STARTING...');
console.log('='.repeat(60));

let implementationCount = 0;
const implementationLog = [];

// Define comprehensive security headers
const securityHeaders = `
    <!-- Security Headers -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
    <meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()">
    <meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">`;

// Get all HTML files
function getAllHTMLFiles() {
  const htmlFiles = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && item.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    });
  }
  
  scanDirectory('.');
  return htmlFiles;
}

// Add security headers to HTML file
function addSecurityHeaders(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if security headers already exist
    if (content.includes('Content-Security-Policy') || content.includes('X-Frame-Options')) {
      implementationLog.push(`⚠️  ${filePath}: Security headers already present`);
      return false;
    }
    
    // Find the head section
    const headMatch = content.match(/<head[^>]*>/i);
    if (!headMatch) {
      implementationLog.push(`❌ ${filePath}: No <head> section found`);
      return false;
    }
    
    // Insert security headers after the opening <head> tag
    const headIndex = headMatch.index + headMatch[0].length;
    const newContent = content.slice(0, headIndex) + securityHeaders + content.slice(headIndex);
    
    // Write the updated content
    fs.writeFileSync(filePath, newContent, 'utf8');
    implementationCount++;
    implementationLog.push(`✅ ${filePath}: Security headers added`);
    return true;
    
  } catch (error) {
    implementationLog.push(`❌ ${filePath}: Error - ${error.message}`);
    return false;
  }
}

// Create .htaccess with security configurations
function createHtaccess() {
  console.log('📝 Creating .htaccess with security configurations...');
  
  const htaccessContent = `# Security Headers
<IfModule mod_headers.c>
    # Content Security Policy
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';"
    
    # Prevent clickjacking
    Header always set X-Frame-Options "DENY"
    
    # Prevent MIME type sniffing
    Header always set X-Content-Type-Options "nosniff"
    
    # XSS Protection
    Header always set X-XSS-Protection "1; mode=block"
    
    # Referrer Policy
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # Permissions Policy
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    
    # HSTS (HTTPS only)
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
</IfModule>

# Disable directory browsing
Options -Indexes

# Prevent access to sensitive files
<Files ".env*">
    Order allow,deny
    Deny from all
</Files>

<Files "*.bak">
    Order allow,deny
    Deny from all
</Files>

<Files "*.backup">
    Order allow,deny
    Deny from all
</Files>

<Files "*.old">
    Order allow,deny
    Deny from all
</Files>

<Files "*.log">
    Order allow,deny
    Deny from all
</Files>

# Prevent access to configuration files
<Files "package.json">
    Order allow,deny
    Deny from all
</Files>

<Files "*.config.js">
    Order allow,deny
    Deny from all
</Files>

# Force HTTPS redirect
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Cache control for security
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/html "access plus 0 seconds"
    ExpiresByType application/json "access plus 0 seconds"
</IfModule>`;

  fs.writeFileSync('.htaccess', htaccessContent);
  implementationCount++;
  implementationLog.push(`✅ .htaccess: Security configuration created`);
}

// Update _headers file for Netlify
function updateNetlifyHeaders() {
  console.log('📝 Updating _headers for Netlify...');
  
  const headersContent = `/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

/admin/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate

/api/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate

/*.json
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate

/*.bak
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate

/*.backup
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate

/*.old
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate`;

  fs.writeFileSync('_headers', headersContent);
  implementationCount++;
  implementationLog.push(`✅ _headers: Netlify security headers updated`);
}

// Create security.txt file
function createSecurityTxt() {
  console.log('📝 Creating security.txt...');
  
  const securityTxtContent = `Contact: security@elevateforhumanity.org
Expires: 2025-12-31T23:59:59.000Z
Encryption: https://elevateforhumanity.org/pgp-key.txt
Preferred-Languages: en
Canonical: https://elevateforhumanity.org/.well-known/security.txt
Policy: https://elevateforhumanity.org/security-policy
Acknowledgments: https://elevateforhumanity.org/security-acknowledgments`;

  // Create .well-known directory if it doesn't exist
  if (!fs.existsSync('.well-known')) {
    fs.mkdirSync('.well-known');
  }
  
  fs.writeFileSync('.well-known/security.txt', securityTxtContent);
  fs.writeFileSync('security.txt', securityTxtContent); // Also in root for compatibility
  
  implementationCount++;
  implementationLog.push(`✅ security.txt: Security contact information created`);
}

// Run implementation
console.log('🔧 Starting security headers implementation...\n');

// Get all HTML files and add security headers
const htmlFiles = getAllHTMLFiles();
console.log(`📄 Found ${htmlFiles.length} HTML files to process...\n`);

htmlFiles.forEach(file => {
  addSecurityHeaders(file);
});

// Create additional security configurations
createHtaccess();
updateNetlifyHeaders();
createSecurityTxt();

console.log('\n' + '='.repeat(60));
console.log('🛡️  SECURITY HEADERS IMPLEMENTATION RESULTS:');
console.log('='.repeat(60));

console.log(`\n📊 Total Implementations: ${implementationCount}`);
console.log(`📄 HTML Files Processed: ${htmlFiles.length}`);

console.log('\n📋 Implementation Log:');
implementationLog.forEach(log => console.log(`  ${log}`));

// Save implementation report
const implementationReport = {
  timestamp: new Date().toISOString(),
  totalImplementations: implementationCount,
  htmlFilesProcessed: htmlFiles.length,
  implementationLog: implementationLog,
  securityHeaders: {
    contentSecurityPolicy: true,
    xFrameOptions: true,
    xContentTypeOptions: true,
    referrerPolicy: true,
    permissionsPolicy: true,
    strictTransportSecurity: true,
    xssProtection: true
  },
  additionalConfigurations: {
    htaccess: true,
    netlifyHeaders: true,
    securityTxt: true
  },
  status: 'SECURITY HEADERS IMPLEMENTATION COMPLETE'
};

fs.writeFileSync('security-headers-report.json', JSON.stringify(implementationReport, null, 2));
console.log('\n📄 Implementation report saved to: security-headers-report.json');

console.log('\n🛡️  SECURITY HEADERS IMPLEMENTATION COMPLETE');
console.log('='.repeat(60));