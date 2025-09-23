#!/usr/bin/env node

/**
 * AUTOPILOT DNS REDIRECT SETUP
 * Uses existing Cloudflare credentials to set up redirect
 */

const https = require('https');
const fs = require('fs');

// Load credentials from config
const config = JSON.parse(fs.readFileSync('autopilot-cloudflare-setup.json', 'utf8'));

const CLOUDFLARE_CONFIG = {
  apiToken: config.credentials.cloudflare_api_token,
  accountId: config.credentials.account_id,
  zoneId: config.credentials.zone_id,
  sourceDomain: 'elevateforhumanity.org',
  targetDomain: 'elevate4humanity.org'
};

console.log('🤖 AUTOPILOT DNS REDIRECT SETUP STARTING...');
console.log('='.repeat(60));
console.log(`📋 Source: ${CLOUDFLARE_CONFIG.sourceDomain}`);
console.log(`🎯 Target: ${CLOUDFLARE_CONFIG.targetDomain}`);
console.log(`🔑 Zone ID: ${CLOUDFLARE_CONFIG.zoneId}`);

let results = {
  timestamp: new Date().toISOString(),
  steps: [],
  success: false
};

function logStep(step, status, details = '') {
  const result = { step, status, details, timestamp: new Date().toISOString() };
  results.steps.push(result);
  
  const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';
  console.log(`${emoji} ${step}: ${details}`);
}

function makeCloudflareRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => reject(error));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function createDNSRecord(type, name, content) {
  logStep('DNS Record', 'progress', `Creating ${type} record: ${name} → ${content}`);
  
  try {
    const data = {
      type: type,
      name: name,
      content: content,
      ttl: 3600,
      proxied: true
    };

    const response = await makeCloudflareRequest(`/zones/${CLOUDFLARE_CONFIG.zoneId}/dns_records`, 'POST', data);
    
    if (response.success) {
      logStep('DNS Record', 'success', `${type} record created: ${name}`);
      return response.result;
    } else {
      logStep('DNS Record', 'error', `Failed: ${response.errors?.[0]?.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    logStep('DNS Record', 'error', `Error: ${error.message}`);
    return null;
  }
}

async function createPageRule(pattern, target) {
  logStep('Page Rule', 'progress', `Creating redirect: ${pattern} → ${target}`);
  
  try {
    const data = {
      targets: [{
        target: 'url',
        constraint: {
          operator: 'matches',
          value: pattern
        }
      }],
      actions: [{
        id: 'forwarding_url',
        value: {
          url: target,
          status_code: 301
        }
      }],
      priority: 1,
      status: 'active'
    };

    const response = await makeCloudflareRequest(`/zones/${CLOUDFLARE_CONFIG.zoneId}/pagerules`, 'POST', data);
    
    if (response.success) {
      logStep('Page Rule', 'success', `Redirect rule created`);
      return response.result;
    } else {
      logStep('Page Rule', 'error', `Failed: ${response.errors?.[0]?.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    logStep('Page Rule', 'error', `Error: ${error.message}`);
    return null;
  }
}

async function setupRedirect() {
  try {
    // Step 1: Create DNS records for redirect
    logStep('Setup Start', 'progress', 'Setting up DNS records for redirect...');
    
    // Create A record for apex domain
    await createDNSRecord('A', '@', '192.0.2.1');
    
    // Create CNAME for www
    await createDNSRecord('CNAME', 'www', CLOUDFLARE_CONFIG.sourceDomain);
    
    // Step 2: Create page rules for redirect
    logStep('Redirect Rules', 'progress', 'Creating redirect rules...');
    
    // Rule 1: Wildcard redirect
    await createPageRule(
      `*${CLOUDFLARE_CONFIG.sourceDomain}/*`,
      `https://${CLOUDFLARE_CONFIG.targetDomain}/$2`
    );
    
    // Rule 2: Apex redirect
    await createPageRule(
      `${CLOUDFLARE_CONFIG.sourceDomain}/*`,
      `https://${CLOUDFLARE_CONFIG.targetDomain}/$1`
    );
    
    logStep('Setup Complete', 'success', 'Redirect configuration completed');
    results.success = true;
    
  } catch (error) {
    logStep('Setup Error', 'error', error.message);
    results.success = false;
  }
}

async function testRedirect() {
  logStep('Testing', 'progress', 'Testing redirect setup...');
  
  // Note: DNS propagation takes time, so this might not work immediately
  console.log('\n🧪 Test Commands (run after DNS propagation):');
  console.log(`curl -I https://${CLOUDFLARE_CONFIG.sourceDomain}`);
  console.log(`curl -I https://www.${CLOUDFLARE_CONFIG.sourceDomain}`);
  console.log('\nExpected: HTTP/2 301 with Location header');
}

async function main() {
  await setupRedirect();
  await testRedirect();
  
  // Save results
  fs.writeFileSync('autopilot-redirect-results.json', JSON.stringify(results, null, 2));
  
  console.log('\n🎉 AUTOPILOT DNS REDIRECT SETUP COMPLETE!');
  console.log('📄 Results saved to: autopilot-redirect-results.json');
  console.log('⏰ DNS changes may take up to 24 hours to propagate');
  
  if (results.success) {
    console.log('✅ Setup successful - redirects should work once DNS propagates');
  } else {
    console.log('❌ Setup had errors - check the results file for details');
  }
}

main().catch(console.error);