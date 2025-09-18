#!/usr/bin/env node

/**
 * AUTOPILOT CLOUDFLARE SSL FIX
 * Automatically fixes Cloudflare SSL/TLS settings via API
 */

const https = require('https');
const fs = require('fs');

console.log('🤖 AUTOPILOT CLOUDFLARE SSL FIX STARTING...');
console.log('='.repeat(60));

// Cloudflare API configuration
const CLOUDFLARE_CONFIG = {
  baseURL: 'https://api.cloudflare.com/client/v4',
  domain: 'elevateforhumanity.org',
  // These need to be provided by user
  apiToken: process.env.CLOUDFLARE_API_TOKEN || null,
  email: process.env.CLOUDFLARE_EMAIL || null,
  apiKey: process.env.CLOUDFLARE_API_KEY || null
};

let autopilotResults = {
  timestamp: new Date().toISOString(),
  domain: CLOUDFLARE_CONFIG.domain,
  fixes: [],
  errors: [],
  success: false
};

// Make Cloudflare API request
function makeCloudflareRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CLOUDFLARE_CONFIG.baseURL);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Elevate-Autopilot/1.0'
      }
    };
    
    // Add authentication headers
    if (CLOUDFLARE_CONFIG.apiToken) {
      options.headers['Authorization'] = `Bearer ${CLOUDFLARE_CONFIG.apiToken}`;
    } else if (CLOUDFLARE_CONFIG.email && CLOUDFLARE_CONFIG.apiKey) {
      options.headers['X-Auth-Email'] = CLOUDFLARE_CONFIG.email;
      options.headers['X-Auth-Key'] = CLOUDFLARE_CONFIG.apiKey;
    } else {
      reject(new Error('No Cloudflare API credentials provided'));
      return;
    }
    
    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (parsedData.success) {
            resolve(parsedData);
          } else {
            reject(new Error(`API Error: ${parsedData.errors?.map(e => e.message).join(', ') || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error(`Parse Error: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Get zone ID for domain
async function getZoneId() {
  console.log('🔍 Getting zone ID for domain...');
  
  try {
    const response = await makeCloudflareRequest(`/zones?name=${CLOUDFLARE_CONFIG.domain}&status=active`);
    
    if (response.result && response.result.length > 0) {
      const zoneId = response.result[0].id;
      console.log(`✅ Found zone ID: ${zoneId}`);
      return zoneId;
    } else {
      throw new Error('Domain not found in Cloudflare account');
    }
  } catch (error) {
    autopilotResults.errors.push(`Failed to get zone ID: ${error.message}`);
    throw error;
  }
}

// Fix SSL/TLS settings
async function fixSSLSettings(zoneId) {
  console.log('🔧 Fixing SSL/TLS settings...');
  
  const fixes = [
    {
      name: 'Set SSL mode to Full',
      endpoint: `/zones/${zoneId}/settings/ssl`,
      data: { value: 'full' }
    },
    {
      name: 'Enable Always Use HTTPS',
      endpoint: `/zones/${zoneId}/settings/always_use_https`,
      data: { value: 'on' }
    },
    {
      name: 'Set Minimum TLS Version to 1.2',
      endpoint: `/zones/${zoneId}/settings/min_tls_version`,
      data: { value: '1.2' }
    },
    {
      name: 'Enable TLS 1.3',
      endpoint: `/zones/${zoneId}/settings/tls_1_3`,
      data: { value: 'on' }
    },
    {
      name: 'Enable Automatic HTTPS Rewrites',
      endpoint: `/zones/${zoneId}/settings/automatic_https_rewrites`,
      data: { value: 'on' }
    },
    {
      name: 'Enable HSTS',
      endpoint: `/zones/${zoneId}/settings/security_header`,
      data: {
        value: {
          strict_transport_security: {
            enabled: true,
            max_age: 31536000,
            include_subdomains: true,
            preload: true
          }
        }
      }
    }
  ];
  
  for (const fix of fixes) {
    try {
      console.log(`🔧 ${fix.name}...`);
      await makeCloudflareRequest(fix.endpoint, 'PATCH', fix.data);
      autopilotResults.fixes.push(`✅ ${fix.name}`);
      console.log(`✅ ${fix.name} - Success`);
    } catch (error) {
      autopilotResults.errors.push(`❌ ${fix.name}: ${error.message}`);
      console.log(`❌ ${fix.name} - Failed: ${error.message}`);
    }
  }
}

// Create www redirect rule
async function createWWWRedirect(zoneId) {
  console.log('🔄 Creating www redirect rule...');
  
  try {
    // First, check if redirect rule already exists
    const existingRules = await makeCloudflareRequest(`/zones/${zoneId}/pagerules`);
    
    const wwwRedirectExists = existingRules.result.some(rule => 
      rule.targets[0]?.constraint?.value?.includes('www.elevateforhumanity.org')
    );
    
    if (wwwRedirectExists) {
      autopilotResults.fixes.push('✅ WWW redirect rule already exists');
      console.log('✅ WWW redirect rule already exists');
      return;
    }
    
    // Create new page rule for www redirect
    const redirectRule = {
      targets: [{
        target: 'url',
        constraint: {
          operator: 'matches',
          value: 'www.elevateforhumanity.org/*'
        }
      }],
      actions: [{
        id: 'forwarding_url',
        value: {
          url: 'https://elevateforhumanity.org/$1',
          status_code: 301
        }
      }],
      status: 'active'
    };
    
    await makeCloudflareRequest(`/zones/${zoneId}/pagerules`, 'POST', redirectRule);
    autopilotResults.fixes.push('✅ Created www to non-www redirect rule');
    console.log('✅ Created www to non-www redirect rule');
    
  } catch (error) {
    autopilotResults.errors.push(`❌ WWW redirect rule: ${error.message}`);
    console.log(`❌ WWW redirect rule failed: ${error.message}`);
  }
}

// Check credentials and provide setup instructions
function checkCredentials() {
  console.log('🔑 Checking Cloudflare API credentials...');
  
  if (!CLOUDFLARE_CONFIG.apiToken && (!CLOUDFLARE_CONFIG.email || !CLOUDFLARE_CONFIG.apiKey)) {
    console.log('❌ No Cloudflare API credentials found!');
    console.log('\n📋 TO ENABLE AUTOPILOT SSL FIX:');
    console.log('1. Get Cloudflare API Token:');
    console.log('   - Go to https://dash.cloudflare.com/profile/api-tokens');
    console.log('   - Click "Create Token"');
    console.log('   - Use "Zone:Zone:Edit" template');
    console.log('   - Include your domain zone');
    console.log('');
    console.log('2. Set environment variable:');
    console.log('   export CLOUDFLARE_API_TOKEN="your_token_here"');
    console.log('');
    console.log('3. Run this script again:');
    console.log('   node autopilot-cloudflare-ssl-fix.cjs');
    console.log('');
    console.log('OR use email + API key:');
    console.log('   export CLOUDFLARE_EMAIL="your_email@example.com"');
    console.log('   export CLOUDFLARE_API_KEY="your_global_api_key"');
    
    return false;
  }
  
  console.log('✅ Cloudflare API credentials found');
  return true;
}

// Main autopilot function
async function runAutopilotSSLFix() {
  console.log('🤖 Starting autopilot SSL fix...\n');
  
  if (!checkCredentials()) {
    return;
  }
  
  try {
    // Get zone ID
    const zoneId = await getZoneId();
    
    // Fix SSL settings
    await fixSSLSettings(zoneId);
    
    // Create www redirect
    await createWWWRedirect(zoneId);
    
    autopilotResults.success = autopilotResults.errors.length === 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('🤖 AUTOPILOT SSL FIX RESULTS:');
    console.log('='.repeat(60));
    
    console.log(`\n🎯 Success: ${autopilotResults.success ? 'YES' : 'PARTIAL'}`);
    console.log(`✅ Fixes Applied: ${autopilotResults.fixes.length}`);
    console.log(`❌ Errors: ${autopilotResults.errors.length}`);
    
    if (autopilotResults.fixes.length > 0) {
      console.log('\n✅ SUCCESSFUL FIXES:');
      autopilotResults.fixes.forEach(fix => console.log(`  ${fix}`));
    }
    
    if (autopilotResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      autopilotResults.errors.forEach(error => console.log(`  ${error}`));
    }
    
    console.log('\n⏰ PROPAGATION TIME:');
    console.log('  SSL changes may take 5-15 minutes to take effect globally');
    console.log('  Test your site after waiting a few minutes');
    
    console.log('\n🧪 TEST YOUR SITE:');
    console.log('  https://elevateforhumanity.org');
    console.log('  https://www.elevateforhumanity.org (should redirect)');
    
  } catch (error) {
    autopilotResults.errors.push(`Fatal error: ${error.message}`);
    console.log(`\n❌ Autopilot failed: ${error.message}`);
  }
  
  // Save results
  fs.writeFileSync('autopilot-ssl-fix-results.json', JSON.stringify(autopilotResults, null, 2));
  console.log('\n📄 Results saved to: autopilot-ssl-fix-results.json');
  
  console.log('\n🤖 AUTOPILOT SSL FIX COMPLETE');
  console.log('='.repeat(60));
}

// Create setup script for easy credential configuration
function createSetupScript() {
  const setupScript = `#!/bin/bash

# Cloudflare SSL Autopilot Setup Script

echo "🔑 Cloudflare API Setup for SSL Autopilot"
echo "========================================"

echo ""
echo "Choose authentication method:"
echo "1) API Token (Recommended)"
echo "2) Email + Global API Key"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "📋 API Token Setup:"
    echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Click 'Create Token'"
    echo "3. Use 'Zone:Zone:Edit' template"
    echo "4. Include your elevateforhumanity.org zone"
    echo "5. Copy the token"
    echo ""
    read -p "Enter your API Token: " api_token
    
    export CLOUDFLARE_API_TOKEN="$api_token"
    echo "export CLOUDFLARE_API_TOKEN=\"$api_token\"" >> ~/.bashrc
    
    echo "✅ API Token configured!"
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "📋 Email + API Key Setup:"
    echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Scroll to 'Global API Key'"
    echo "3. Click 'View' and copy the key"
    echo ""
    read -p "Enter your Cloudflare email: " email
    read -p "Enter your Global API Key: " api_key
    
    export CLOUDFLARE_EMAIL="$email"
    export CLOUDFLARE_API_KEY="$api_key"
    echo "export CLOUDFLARE_EMAIL=\"$email\"" >> ~/.bashrc
    echo "export CLOUDFLARE_API_KEY=\"$api_key\"" >> ~/.bashrc
    
    echo "✅ Email + API Key configured!"
    
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "🚀 Running SSL Autopilot Fix..."
node autopilot-cloudflare-ssl-fix.cjs

echo ""
echo "✅ Setup complete!"
echo "💡 You can now run 'node autopilot-cloudflare-ssl-fix.cjs' anytime"`;

  fs.writeFileSync('setup-cloudflare-autopilot.sh', setupScript);
  fs.chmodSync('setup-cloudflare-autopilot.sh', '755');
  
  console.log('📄 Created setup-cloudflare-autopilot.sh');
}

// Run the autopilot or show setup instructions
if (require.main === module) {
  createSetupScript();
  runAutopilotSSLFix();
}

module.exports = { runAutopilotSSLFix };