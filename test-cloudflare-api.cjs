#!/usr/bin/env node

/**
 * TEST CLOUDFLARE API CONNECTION
 * Tests the API token and provides debugging info
 */

const https = require('https');

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "B6Ei4OLJoHTzXykbr6zO6cP0HqhcW-p7cgzaIIm3";

console.log('🔍 TESTING CLOUDFLARE API CONNECTION...');
console.log('='.repeat(50));

// Test API token validity
function testAPIToken() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: '/client/v4/user/tokens/verify',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// List zones to find the domain
function listZones() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: '/client/v4/zones',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔑 Testing API token validity...');
  
  try {
    const tokenTest = await testAPIToken();
    console.log(`📊 Token test status: ${tokenTest.statusCode}`);
    
    if (tokenTest.data.success) {
      console.log('✅ API token is valid!');
      console.log(`📋 Token ID: ${tokenTest.data.result.id}`);
      console.log(`📋 Status: ${tokenTest.data.result.status}`);
    } else {
      console.log('❌ API token is invalid');
      console.log('Errors:', tokenTest.data.errors);
      return;
    }
    
  } catch (error) {
    console.log(`❌ Token test failed: ${error.message}`);
    return;
  }
  
  console.log('\n🌐 Listing available zones...');
  
  try {
    const zonesTest = await listZones();
    console.log(`📊 Zones list status: ${zonesTest.statusCode}`);
    
    if (zonesTest.data.success) {
      console.log(`✅ Found ${zonesTest.data.result.length} zones:`);
      
      zonesTest.data.result.forEach((zone, index) => {
        console.log(`  ${index + 1}. ${zone.name} (ID: ${zone.id})`);
        console.log(`     Status: ${zone.status}`);
        console.log(`     Plan: ${zone.plan.name}`);
      });
      
      // Check if our domain is in the list
      const targetZone = zonesTest.data.result.find(zone => 
        zone.name === 'elevateforhumanity.org'
      );
      
      if (targetZone) {
        console.log(`\n✅ Found elevateforhumanity.org zone!`);
        console.log(`📋 Zone ID: ${targetZone.id}`);
        console.log(`📋 Status: ${targetZone.status}`);
        
        // Now test SSL settings access
        await testSSLSettings(targetZone.id);
        
      } else {
        console.log(`\n❌ elevateforhumanity.org not found in your zones`);
        console.log('💡 Make sure the domain is added to your Cloudflare account');
      }
      
    } else {
      console.log('❌ Failed to list zones');
      console.log('Errors:', zonesTest.data.errors);
    }
    
  } catch (error) {
    console.log(`❌ Zones test failed: ${error.message}`);
  }
}

// Test SSL settings access
function testSSLSettings(zoneId) {
  return new Promise((resolve, reject) => {
    console.log('\n🔒 Testing SSL settings access...');
    
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${zoneId}/settings/ssl`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`📊 SSL settings status: ${res.statusCode}`);
          
          if (response.success) {
            console.log(`✅ Current SSL mode: ${response.result.value}`);
            console.log('🎯 API has access to modify SSL settings!');
          } else {
            console.log('❌ Cannot access SSL settings');
            console.log('Errors:', response.errors);
          }
          
          resolve(response);
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

runTests().then(() => {
  console.log('\n🔍 API TEST COMPLETE');
  console.log('='.repeat(50));
}).catch(error => {
  console.error('❌ Test failed:', error);
});