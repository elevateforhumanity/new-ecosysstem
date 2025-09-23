#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Elevate Autopilot • Cloudflare DNS + Redirects
 * - Verifies token & zone
 * - Creates/updates:
 *   - A @ -> APEX_IP
 *   - CNAME www -> apex
 *   - Redirect: https://elevateforhumanity.org => REDIRECT_TO (301)
 *
 * Requirements:
 *   - Node 18+ (built-in fetch)
 *   - .env.autopilot file created by autopilot-cloudflare-fix.sh
 *
 * Notes:
 *   - 192.0.2.1 is a TEST IP. Replace with your real origin for production.
 */

const fs = require("fs");
const path = require("path");

// --- load env ---
const ENV_PATH = path.resolve(process.cwd(), ".env.autopilot");
if (!fs.existsSync(ENV_PATH)) {
  console.error("Missing .env.autopilot. Run ./autopilot-cloudflare-fix.sh first.");
  process.exit(1);
}
const env = Object.fromEntries(
  fs.readFileSync(ENV_PATH, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    })
);

const CF_API_TOKEN = env.CF_API_TOKEN;
const CF_ZONE_NAME = env.CF_ZONE_NAME || "elevateforhumanity.org";
const APEX_IP = env.APEX_IP || "192.0.2.1"; // replace with real origin for production
const REDIRECT_TO = env.REDIRECT_TO || "https://elevate4humanity.org";
const CF_API = "https://api.cloudflare.com/client/v4";

if (!CF_API_TOKEN) {
  console.error("CF_API_TOKEN missing in .env.autopilot");
  process.exit(1);
}

// --- helpers ---
async function cfFetch(path, opts = {}) {
  const res = await fetch(`${CF_API}${path}`, {
    ...opts,
    headers: {
      "Authorization": `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });
  const json = await res.json();
  if (!json.success) {
    const msg = JSON.stringify(json.errors || json, null, 2);
    throw new Error(`Cloudflare API error for ${path}: ${msg}`);
  }
  return json;
}

async function getZoneByName(name) {
  const data = await cfFetch(`/zones?name=${encodeURIComponent(name)}`);
  if (!data.result?.length) throw new Error(`Zone not found: ${name}`);
  return data.result[0]; // assume exact match
}

function getZones(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: '/client/v4/zones',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.end();
  });
}

function createDNSRecord(token, zoneId, type, name, content) {
  return new Promise((resolve) => {
    const data = {
      type: type,
      name: name,
      content: content,
      ttl: 3600,
      proxied: true
    };

    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${zoneId}/dns_records`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

function createPageRule(token, zoneId, pattern, target) {
  return new Promise((resolve) => {
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

    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${zoneId}/pagerules`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🔑 CLOUDFLARE API TOKEN SETUP');
  console.log('');
  console.log('To get a new API token:');
  console.log('1. Go to: https://dash.cloudflare.com/profile/api-tokens');
  console.log('2. Click "Create Token"');
  console.log('3. Use "Zone:Zone:Edit" template');
  console.log('4. Include elevateforhumanity.org zone');
  console.log('5. Copy the token');
  console.log('');

  const token = await askQuestion('Enter your Cloudflare API Token: ');
  
  if (!token) {
    console.log('❌ No token provided');
    rl.close();
    return;
  }

  console.log('🧪 Testing API token...');
  const tokenTest = await testApiToken(token);
  
  if (!tokenTest.success) {
    console.log('❌ API token test failed:', tokenTest.error || 'Invalid token');
    rl.close();
    return;
  }

  console.log('✅ API token is valid!');

  console.log('🔍 Getting zones...');
  const zones = await getZones(token);
  
  if (!zones.success) {
    console.log('❌ Failed to get zones:', zones.error);
    rl.close();
    return;
  }

  const elevateZone = zones.result.find(zone => zone.name === 'elevateforhumanity.org');
  
  if (!elevateZone) {
    console.log('❌ elevateforhumanity.org zone not found');
    console.log('Available zones:', zones.result.map(z => z.name));
    rl.close();
    return;
  }

  console.log('✅ Found elevateforhumanity.org zone:', elevateZone.id);

  // Create DNS records
  console.log('🔧 Creating DNS records...');
  
  const aRecord = await createDNSRecord(token, elevateZone.id, 'A', '@', '192.0.2.1');
  if (aRecord.success) {
    console.log('✅ A record created');
  } else {
    console.log('⚠️ A record:', aRecord.errors?.[0]?.message || 'Failed');
  }

  const cnameRecord = await createDNSRecord(token, elevateZone.id, 'CNAME', 'www', 'elevateforhumanity.org');
  if (cnameRecord.success) {
    console.log('✅ CNAME record created');
  } else {
    console.log('⚠️ CNAME record:', cnameRecord.errors?.[0]?.message || 'Failed');
  }

  // Create page rules
  console.log('🔄 Creating redirect rules...');
  
  const rule1 = await createPageRule(token, elevateZone.id, '*elevateforhumanity.org/*', 'https://elevate4humanity.org/$2');
  if (rule1.success) {
    console.log('✅ Wildcard redirect rule created');
  } else {
    console.log('⚠️ Wildcard rule:', rule1.errors?.[0]?.message || 'Failed');
  }

  const rule2 = await createPageRule(token, elevateZone.id, 'elevateforhumanity.org/*', 'https://elevate4humanity.org/$1');
  if (rule2.success) {
    console.log('✅ Apex redirect rule created');
  } else {
    console.log('⚠️ Apex rule:', rule2.errors?.[0]?.message || 'Failed');
  }

  // Update config file
  const config = JSON.parse(fs.readFileSync('autopilot-cloudflare-setup.json', 'utf8'));
  config.credentials.cloudflare_api_token = token;
  config.credentials.zone_id = elevateZone.id;
  fs.writeFileSync('autopilot-cloudflare-setup.json', JSON.stringify(config, null, 2));

  console.log('✅ Updated autopilot-cloudflare-setup.json with working credentials');

  console.log('');
  console.log('🎉 AUTOPILOT CLOUDFLARE SETUP COMPLETE!');
  console.log('🔄 Redirect: elevateforhumanity.org → elevate4humanity.org');
  console.log('⏰ DNS changes may take up to 24 hours to propagate');
  console.log('');
  console.log('🧪 Test commands:');
  console.log('curl -I https://elevateforhumanity.org');
  console.log('curl -I https://www.elevateforhumanity.org');

  rl.close();
}

main().catch(console.error);