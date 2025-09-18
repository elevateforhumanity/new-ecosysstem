#!/usr/bin/env node

/**
 * SSL/TLS DIAGNOSTICS AND FIX TOOL
 * Diagnoses and provides fixes for SSL certificate and configuration issues
 */

const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('🔒 SSL/TLS DIAGNOSTICS STARTING...');
console.log('='.repeat(60));

const domain = 'elevateforhumanity.org';
const wwwDomain = 'www.elevateforhumanity.org';

let diagnosticsResults = {
  timestamp: new Date().toISOString(),
  domain: domain,
  issues: [],
  recommendations: [],
  cloudflareStatus: 'unknown',
  sslStatus: 'unknown',
  certificateInfo: null
};

// Test SSL connection
async function testSSLConnection(hostname) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing SSL connection to ${hostname}...`);
    
    const options = {
      hostname: hostname,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 10000,
      rejectUnauthorized: false // Allow self-signed for testing
    };

    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      resolve({
        success: true,
        statusCode: res.statusCode,
        certificate: cert,
        tlsVersion: res.socket.getProtocol(),
        cipher: res.socket.getCipher()
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        code: error.code
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Connection timeout',
        code: 'TIMEOUT'
      });
    });

    req.end();
  });
}

// Check DNS resolution
async function checkDNS(hostname) {
  try {
    console.log(`🌐 Checking DNS for ${hostname}...`);
    const { stdout } = await execAsync(`nslookup ${hostname}`);
    return {
      success: true,
      result: stdout
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Check Cloudflare status
async function checkCloudflareStatus() {
  console.log('☁️  Checking Cloudflare configuration...');
  
  try {
    // Check if domain is using Cloudflare
    const { stdout } = await execAsync(`dig ${domain} NS`);
    const isCloudflare = stdout.includes('cloudflare');
    
    if (isCloudflare) {
      diagnosticsResults.cloudflareStatus = 'active';
      diagnosticsResults.recommendations.push('Domain is using Cloudflare - check SSL/TLS settings in Cloudflare dashboard');
    } else {
      diagnosticsResults.cloudflareStatus = 'not_detected';
      diagnosticsResults.recommendations.push('Consider using Cloudflare for SSL/TLS management');
    }
    
    return isCloudflare;
  } catch (error) {
    diagnosticsResults.cloudflareStatus = 'error';
    diagnosticsResults.issues.push(`DNS check failed: ${error.message}`);
    return false;
  }
}

// Generate SSL configuration recommendations
function generateSSLRecommendations() {
  console.log('📋 Generating SSL configuration recommendations...');
  
  const recommendations = {
    cloudflare: {
      title: 'Cloudflare SSL/TLS Settings',
      steps: [
        '1. Log into Cloudflare Dashboard',
        '2. Go to SSL/TLS → Overview',
        '3. Set encryption mode to "Full (strict)" or "Full"',
        '4. Go to SSL/TLS → Edge Certificates',
        '5. Enable "Always Use HTTPS"',
        '6. Set Minimum TLS Version to 1.2',
        '7. Enable "TLS 1.3"',
        '8. Enable "Automatic HTTPS Rewrites"',
        '9. Go to SSL/TLS → Origin Server',
        '10. Create Origin Certificate if needed'
      ]
    },
    nginx: {
      title: 'Nginx SSL Configuration',
      config: `server {
    listen 443 ssl http2;
    server_name elevateforhumanity.org www.elevateforhumanity.org;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Redirect www to non-www
    if ($host = www.elevateforhumanity.org) {
        return 301 https://elevateforhumanity.org$request_uri;
    }
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name elevateforhumanity.org www.elevateforhumanity.org;
    return 301 https://elevateforhumanity.org$request_uri;
}`
    },
    apache: {
      title: 'Apache SSL Configuration',
      config: `<VirtualHost *:443>
    ServerName elevateforhumanity.org
    ServerAlias www.elevateforhumanity.org
    DocumentRoot /var/www/html
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    SSLCertificateChainFile /path/to/chain.crt
    
    # Modern SSL protocols and ciphers
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder off
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    
    # Redirect www to non-www
    RewriteEngine On
    RewriteCond %{HTTP_HOST} ^www\\.elevateforhumanity\\.org$ [NC]
    RewriteRule ^(.*)$ https://elevateforhumanity.org$1 [R=301,L]
</VirtualHost>

# Redirect HTTP to HTTPS
<VirtualHost *:80>
    ServerName elevateforhumanity.org
    ServerAlias www.elevateforhumanity.org
    RewriteEngine On
    RewriteRule ^(.*)$ https://elevateforhumanity.org$1 [R=301,L]
</VirtualHost>`
    }
  };
  
  return recommendations;
}

// Create SSL test page
function createSSLTestPage() {
  console.log('📄 Creating SSL test page...');
  
  const testPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSL Test - Elevate for Humanity</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { padding: 15px; margin: 20px 0; border-radius: 5px; font-weight: bold; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 SSL/TLS Connection Test</h1>
        <p>This page tests the SSL/TLS connection for Elevate for Humanity.</p>
        
        <div id="ssl-status" class="status info">
            🔍 Testing SSL connection...
        </div>
        
        <h2>Connection Information</h2>
        <div id="connection-info">
            <p><strong>Protocol:</strong> <span id="protocol">Loading...</span></p>
            <p><strong>Cipher:</strong> <span id="cipher">Loading...</span></p>
            <p><strong>Certificate Valid:</strong> <span id="cert-valid">Loading...</span></p>
            <p><strong>Certificate Issuer:</strong> <span id="cert-issuer">Loading...</span></p>
            <p><strong>Certificate Expires:</strong> <span id="cert-expires">Loading...</span></p>
        </div>
        
        <h2>Security Headers</h2>
        <div id="security-headers">
            <p><strong>HSTS:</strong> <span id="hsts">Loading...</span></p>
            <p><strong>X-Frame-Options:</strong> <span id="x-frame">Loading...</span></p>
            <p><strong>Content-Security-Policy:</strong> <span id="csp">Loading...</span></p>
        </div>
        
        <h2>Recommendations</h2>
        <div id="recommendations">
            <ul>
                <li>Ensure SSL certificate is valid and not expired</li>
                <li>Use TLS 1.2 or higher</li>
                <li>Enable HSTS (HTTP Strict Transport Security)</li>
                <li>Configure proper security headers</li>
                <li>Redirect HTTP to HTTPS</li>
                <li>Redirect www to non-www (or vice versa)</li>
            </ul>
        </div>
    </div>
    
    <script>
        // Test SSL connection details
        function testSSLConnection() {
            const protocol = location.protocol;
            const isSecure = protocol === 'https:';
            
            const statusDiv = document.getElementById('ssl-status');
            
            if (isSecure) {
                statusDiv.className = 'status success';
                statusDiv.innerHTML = '✅ SSL connection successful!';
                
                // Update connection info
                document.getElementById('protocol').textContent = protocol;
                
                // Test security headers
                fetch(location.href, { method: 'HEAD' })
                    .then(response => {
                        const headers = response.headers;
                        
                        document.getElementById('hsts').textContent = 
                            headers.get('strict-transport-security') || 'Not set';
                        document.getElementById('x-frame').textContent = 
                            headers.get('x-frame-options') || 'Not set';
                        document.getElementById('csp').textContent = 
                            headers.get('content-security-policy') ? 'Set' : 'Not set';
                    })
                    .catch(error => {
                        console.error('Error checking headers:', error);
                    });
                    
            } else {
                statusDiv.className = 'status error';
                statusDiv.innerHTML = '❌ Not using HTTPS! Connection is not secure.';
            }
        }
        
        // Run test when page loads
        document.addEventListener('DOMContentLoaded', testSSLConnection);
    </script>
</body>
</html>`;

  fs.writeFileSync('ssl-test.html', testPageContent);
  diagnosticsResults.recommendations.push('Created ssl-test.html for connection testing');
}

// Main diagnostic function
async function runSSLDiagnostics() {
  console.log('🔧 Starting SSL/TLS diagnostics...\n');
  
  // Test both domain and www subdomain
  const domainTest = await testSSLConnection(domain);
  const wwwTest = await testSSLConnection(wwwDomain);
  
  console.log(`\n📊 SSL Test Results for ${domain}:`);
  if (domainTest.success) {
    console.log(`✅ Connection successful`);
    console.log(`📋 TLS Version: ${domainTest.tlsVersion}`);
    console.log(`🔐 Cipher: ${domainTest.cipher?.name || 'Unknown'}`);
    diagnosticsResults.sslStatus = 'working';
  } else {
    console.log(`❌ Connection failed: ${domainTest.error}`);
    diagnosticsResults.issues.push(`SSL connection failed for ${domain}: ${domainTest.error}`);
    diagnosticsResults.sslStatus = 'failed';
  }
  
  console.log(`\n📊 SSL Test Results for ${wwwDomain}:`);
  if (wwwTest.success) {
    console.log(`✅ Connection successful`);
    console.log(`📋 TLS Version: ${wwwTest.tlsVersion}`);
    console.log(`🔐 Cipher: ${wwwTest.cipher?.name || 'Unknown'}`);
  } else {
    console.log(`❌ Connection failed: ${wwwTest.error}`);
    diagnosticsResults.issues.push(`SSL connection failed for ${wwwDomain}: ${wwwTest.error}`);
  }
  
  // Check DNS
  const dnsCheck = await checkDNS(domain);
  if (!dnsCheck.success) {
    diagnosticsResults.issues.push(`DNS resolution failed: ${dnsCheck.error}`);
  }
  
  // Check Cloudflare
  await checkCloudflareStatus();
  
  // Generate recommendations
  const sslRecommendations = generateSSLRecommendations();
  
  // Create test page
  createSSLTestPage();
  
  return { domainTest, wwwTest, sslRecommendations };
}

// Run diagnostics and generate report
runSSLDiagnostics().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log('🔒 SSL/TLS DIAGNOSTICS RESULTS:');
  console.log('='.repeat(60));
  
  console.log(`\n🎯 SSL Status: ${diagnosticsResults.sslStatus.toUpperCase()}`);
  console.log(`☁️  Cloudflare Status: ${diagnosticsResults.cloudflareStatus.toUpperCase()}`);
  
  if (diagnosticsResults.issues.length > 0) {
    console.log('\n⚠️  ISSUES FOUND:');
    diagnosticsResults.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  }
  
  console.log('\n💡 IMMEDIATE ACTIONS:');
  console.log('  1. Check Cloudflare SSL/TLS settings (if using Cloudflare)');
  console.log('  2. Verify SSL certificate is valid and not expired');
  console.log('  3. Ensure TLS 1.2+ is enabled');
  console.log('  4. Check server SSL configuration');
  console.log('  5. Test with ssl-test.html page');
  
  console.log('\n📋 CLOUDFLARE QUICK FIX:');
  console.log('  1. Login to Cloudflare Dashboard');
  console.log('  2. Go to SSL/TLS → Overview');
  console.log('  3. Change encryption mode to "Full" or "Full (strict)"');
  console.log('  4. Go to SSL/TLS → Edge Certificates');
  console.log('  5. Enable "Always Use HTTPS"');
  console.log('  6. Set Minimum TLS Version to 1.2');
  
  // Save diagnostic report
  const fullReport = {
    diagnostics: diagnosticsResults,
    testResults: results,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('ssl-diagnostics-report.json', JSON.stringify(fullReport, null, 2));
  console.log('\n📄 Diagnostic report saved to: ssl-diagnostics-report.json');
  console.log('📄 SSL test page created: ssl-test.html');
  
  console.log('\n🔒 SSL/TLS DIAGNOSTICS COMPLETE');
  console.log('='.repeat(60));
}).catch(error => {
  console.error('❌ Diagnostics failed:', error);
});