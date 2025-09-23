#!/usr/bin/env node

/**
 * FORCE AUTOPILOT SETUP - Works even with pending zones
 */

const https = require('https');
const fs = require('fs');

console.log('🤖 FORCE AUTOPILOT SETUP');
console.log('========================');

// Load config
const env = Object.fromEntries(
  fs.readFileSync('.env.autopilot', 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const i = line.indexOf('=');
      return [line.slice(0, i), line.slice(i + 1)];
    })
);

const CF_API_TOKEN = env.CF_API_TOKEN;
const CF_ZONE_NAME = env.CF_ZONE_NAME;
const WIX_A_IP = env.WIX_A_IP;
const WIX_CNAME_TARGET = env.WIX_CNAME_TARGET;

console.log(`Zone: ${CF_ZONE_NAME}`);
console.log(`Wix A IP: ${WIX_A_IP}`);
console.log(`Wix CNAME: ${WIX_CNAME_TARGET}`);

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({ response, status: res.statusCode });
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

async function createDNSRecord(zoneId, type, name, content, proxied = false) {
  console.log(`Creating ${type} record: ${name} → ${content}`);
  
  try {
    // First, try to find existing record
    const findResult = await makeRequest(`/zones/${zoneId}/dns_records?type=${type}&name=${name}`);
    
    const recordData = {
      type: type,
      name: name,
      content: content,
      proxied: proxied,
      ttl: 300
    };

    if (findResult.response.success && findResult.response.result.length > 0) {
      // Update existing record
      const recordId = findResult.response.result[0].id;
      console.log(`  Updating existing ${type} record...`);
      
      const updateResult = await makeRequest(`/zones/${zoneId}/dns_records/${recordId}`, 'PUT', recordData);
      
      if (updateResult.response.success) {
        console.log(`  ✅ ${type} record updated successfully`);
        return true;
      } else {
        console.log(`  ❌ Failed to update ${type} record:`, updateResult.response.errors);
        return false;
      }
    } else {
      // Create new record
      console.log(`  Creating new ${type} record...`);
      
      const createResult = await makeRequest(`/zones/${zoneId}/dns_records`, 'POST', recordData);
      
      if (createResult.response.success) {
        console.log(`  ✅ ${type} record created successfully`);
        return true;
      } else {
        console.log(`  ❌ Failed to create ${type} record:`, createResult.response.errors);
        return false;
      }
    }
  } catch (error) {
    console.log(`  ❌ Error with ${type} record:`, error.message);
    return false;
  }
}

async function main() {
  try {
    // Get zone ID
    console.log('\n🔍 Finding zone...');
    const zoneResult = await makeRequest(`/zones?name=${CF_ZONE_NAME}`);
    
    if (!zoneResult.response.success || zoneResult.response.result.length === 0) {
      throw new Error(`Zone ${CF_ZONE_NAME} not found`);
    }
    
    const zone = zoneResult.response.result[0];
    const zoneId = zone.id;
    
    console.log(`✅ Found zone: ${zone.name} (${zone.id})`);
    console.log(`   Status: ${zone.status}`);
    
    if (zone.status === 'pending') {
      console.log('⚠️  Zone is pending - this may affect DNS propagation');
      console.log('   Records will be created but may not resolve until zone is active');
    }
    
    // Create DNS records
    console.log('\n🔧 Creating DNS records...');
    
    // A record for apex
    const aRecordSuccess = await createDNSRecord(zoneId, 'A', CF_ZONE_NAME, WIX_A_IP, false);
    
    // CNAME record for www
    const cnameRecordSuccess = await createDNSRecord(zoneId, 'CNAME', `www.${CF_ZONE_NAME}`, WIX_CNAME_TARGET, false);
    
    console.log('\n📊 Results:');
    console.log(`A Record (${CF_ZONE_NAME}): ${aRecordSuccess ? '✅ Success' : '❌ Failed'}`);
    console.log(`CNAME Record (www.${CF_ZONE_NAME}): ${cnameRecordSuccess ? '✅ Success' : '❌ Failed'}`);
    
    if (aRecordSuccess && cnameRecordSuccess) {
      console.log('\n🎉 AUTOPILOT SETUP COMPLETE!');
      console.log('\n📋 DNS Records Created:');
      console.log(`   A @ → ${WIX_A_IP} (unproxied)`);
      console.log(`   CNAME www → ${WIX_CNAME_TARGET} (unproxied)`);
      
      if (zone.status === 'pending') {
        console.log('\n⏰ Next Steps:');
        console.log('1. Update nameservers at your domain registrar to:');
        console.log('   - ava.ns.cloudflare.com');
        console.log('   - bob.ns.cloudflare.com');
        console.log('2. Wait for zone to become active');
        console.log('3. DNS records will then resolve properly');
      } else {
        console.log('\n🧪 Test your setup:');
        console.log(`   curl -I https://${CF_ZONE_NAME}`);
        console.log(`   curl -I https://www.${CF_ZONE_NAME}`);
      }
    } else {
      console.log('\n❌ Some records failed to create');
      console.log('Check the errors above and try again');
    }
    
  } catch (error) {
    console.log('\n❌ Autopilot failed:', error.message);
    console.log('\n📋 Manual fallback - create these records in Cloudflare:');
    console.log(`   A @ → ${WIX_A_IP} (unproxied)`);
    console.log(`   CNAME www → ${WIX_CNAME_TARGET} (unproxied)`);
  }
}

main();