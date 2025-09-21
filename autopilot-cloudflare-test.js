#!/usr/bin/env node

console.log('☁️ AUTOPILOT: Testing Cloudflare configuration...\n');

// Cloudflare credentials from autopilot config
const CLOUDFLARE_CONFIG = {
  api_token: '7W2pnC5oQxQKewWDjTLKB-1tY9Zd9xqEpA9qjyoB',
  account_id: 'ff0d5ca582b5911a626ba012935cf3ec',
  zone_id: '0cde07dbe1f6b3e3c25ec30421ee7ced'
};

async function testCloudflareAPI() {
  try {
    console.log('🔑 Testing Cloudflare API token...');
    
    const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_CONFIG.api_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Cloudflare API token valid');
      console.log(`   Status: ${result.result.status}`);
    } else {
      console.log('❌ Cloudflare API token invalid');
      console.log('   Errors:', result.errors);
      return false;
    }
    
    // Test zone access
    console.log('\n🌐 Testing zone access...');
    
    const zoneResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_CONFIG.zone_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_CONFIG.api_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const zoneResult = await zoneResponse.json();
    
    if (zoneResult.success) {
      console.log('✅ Zone access confirmed');
      console.log(`   Domain: ${zoneResult.result.name}`);
      console.log(`   Status: ${zoneResult.result.status}`);
    } else {
      console.log('❌ Zone access failed');
      console.log('   Errors:', zoneResult.errors);
      return false;
    }
    
    // Test Pages access
    console.log('\n📄 Testing Cloudflare Pages access...');
    
    const pagesResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.account_id}/pages/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_CONFIG.api_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const pagesResult = await pagesResponse.json();
    
    if (pagesResult.success) {
      console.log('✅ Cloudflare Pages access confirmed');
      console.log(`   Projects found: ${pagesResult.result.length}`);
      
      // Look for existing elevateforhumanity project
      const existingProject = pagesResult.result.find(p => 
        p.name === 'elevateforhumanity' || 
        p.name.includes('elevate')
      );
      
      if (existingProject) {
        console.log(`   Found project: ${existingProject.name}`);
        console.log(`   URL: https://${existingProject.subdomain}.pages.dev`);
      } else {
        console.log('   No existing elevateforhumanity project found');
      }
    } else {
      console.log('❌ Cloudflare Pages access failed');
      console.log('   Errors:', pagesResult.errors);
      return false;
    }
    
    console.log('\n🎯 AUTOPILOT CLOUDFLARE STATUS:');
    console.log('✅ API token working');
    console.log('✅ Zone access confirmed');
    console.log('✅ Pages access confirmed');
    console.log('🚀 Ready for deployment configuration');
    
    return true;
    
  } catch (error) {
    console.log('❌ Cloudflare test failed:', error.message);
    return false;
  }
}

testCloudflareAPI().then(success => {
  if (success) {
    console.log('\n🤖 AUTOPILOT: Cloudflare ready, proceeding...');
  } else {
    console.log('\n🔧 AUTOPILOT: Cloudflare needs configuration');
  }
});