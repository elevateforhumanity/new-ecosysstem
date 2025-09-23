#!/usr/bin/env node

/**
 * Cloudflare Redirect Autopilot
 * Sets up elevateforhumanity.org → elevate4humanity.org redirect
 */

const fs = require('fs');
const path = require('path');

class CloudflareRedirectAutopilot {
  constructor() {
    this.config = {
      sourceDomain: 'elevateforhumanity.org',
      targetDomain: 'elevate4humanity.org',
      cloudflareEmail: process.env.CLOUDFLARE_EMAIL || 'YOUR_EMAIL',
      cloudflareApiKey: process.env.CLOUDFLARE_API_KEY || 'YOUR_API_KEY',
      zoneId: process.env.CLOUDFLARE_ZONE_ID || 'YOUR_ZONE_ID'
    };
  }

  generateInstructions() {
    const instructions = `
# 🚀 Cloudflare Redirect Setup Instructions

## Step 1: DNS Records for ${this.config.sourceDomain}

### In Cloudflare Dashboard:

1. **Go to DNS → Records**
2. **Add these records:**

\`\`\`
Type: A
Name: @
Value: 192.0.2.1
Proxy: ON (Orange Cloud)

Type: CNAME
Name: www
Value: ${this.config.sourceDomain}
Proxy: ON (Orange Cloud)
\`\`\`

## Step 2: Redirect Rules

### Go to Rules → Redirect Rules:

1. **Create New Rule:**
\`\`\`
Rule Name: Redirect to ${this.config.targetDomain}

When incoming requests match:
- Field: Hostname
- Operator: contains
- Value: ${this.config.sourceDomain}

Then:
- Type: Dynamic
- Expression: concat("https://", regex_replace(http.host, "${this.config.sourceDomain.replace('.', '\\.')}", "${this.config.targetDomain}"), http.request.uri.path)
- Status Code: 301
\`\`\`

## Step 3: Alternative (Page Rules Method)

### Go to Rules → Page Rules:

1. **Create Rule 1:**
\`\`\`
URL Pattern: *${this.config.sourceDomain}/*
Setting: Forwarding URL (301 - Permanent Redirect)
Destination: https://${this.config.targetDomain}/$2
\`\`\`

2. **Create Rule 2:**
\`\`\`
URL Pattern: ${this.config.sourceDomain}/*
Setting: Forwarding URL (301 - Permanent Redirect)
Destination: https://${this.config.targetDomain}/$1
\`\`\`

## Step 4: Test

After setup, test these URLs:
- https://${this.config.sourceDomain} → Should redirect to https://${this.config.targetDomain}
- https://www.${this.config.sourceDomain} → Should redirect to https://www.${this.config.targetDomain}

## 🔧 Troubleshooting

If redirects don't work immediately:
1. Wait up to 24 hours for DNS propagation
2. Clear browser cache
3. Test in incognito mode
4. Check Cloudflare Analytics for redirect hits

## ✅ Success Criteria

- All URLs redirect with 301 status
- No 404 or 500 errors
- Redirects preserve URL paths
- SSL certificates work on both domains
`;

    return instructions;
  }

  generateCurlCommands() {
    return `
# 🧪 Test Commands

## Test DNS Resolution:
curl -I https://${this.config.sourceDomain}
curl -I https://www.${this.config.sourceDomain}

## Expected Results:
# Should return HTTP/2 301 or HTTP/2 308
# Location header should point to ${this.config.targetDomain}

## Test Redirect Chain:
curl -L -I https://${this.config.sourceDomain}
# Should follow redirects and end up at ${this.config.targetDomain}
`;
  }

  generateCloudflareAPI() {
    return `
# 🔑 Cloudflare API Setup (Optional)

## If you want to use API instead of dashboard:

### 1. Get your credentials:
- Email: Your Cloudflare account email
- API Key: Global API Key from Cloudflare dashboard
- Zone ID: Found in domain overview

### 2. Set environment variables:
export CLOUDFLARE_EMAIL="${this.config.cloudflareEmail}"
export CLOUDFLARE_API_KEY="${this.config.cloudflareApiKey}"
export CLOUDFLARE_ZONE_ID="${this.config.zoneId}"

### 3. Create DNS records via API:
curl -X POST "https://api.cloudflare.com/client/v4/zones/\${CLOUDFLARE_ZONE_ID}/dns_records" \\
  -H "X-Auth-Email: \${CLOUDFLARE_EMAIL}" \\
  -H "X-Auth-Key: \${CLOUDFLARE_API_KEY}" \\
  -H "Content-Type: application/json" \\
  --data '{
    "type": "A",
    "name": "@",
    "content": "192.0.2.1",
    "proxied": true
  }'

### 4. Create redirect rule via API:
curl -X POST "https://api.cloudflare.com/client/v4/zones/\${CLOUDFLARE_ZONE_ID}/rulesets" \\
  -H "X-Auth-Email: \${CLOUDFLARE_EMAIL}" \\
  -H "X-Auth-Key: \${CLOUDFLARE_API_KEY}" \\
  -H "Content-Type: application/json" \\
  --data '{
    "name": "Redirect to ${this.config.targetDomain}",
    "kind": "zone",
    "phase": "http_request_dynamic_redirect",
    "rules": [{
      "expression": "http.host contains \\"${this.config.sourceDomain}\\"",
      "action": "redirect",
      "action_parameters": {
        "from_value": {
          "status_code": 301,
          "target_url": {
            "expression": "concat(\\"https://\\", regex_replace(http.host, \\"${this.config.sourceDomain.replace('.', '\\.')}\\" , \\"${this.config.targetDomain}\\"), http.request.uri.path)"
          }
        }
      }
    }]
  }'
`;
  }

  run() {
    console.log('🚀 Cloudflare Redirect Autopilot Starting...\n');

    // Generate all instructions
    const instructions = this.generateInstructions();
    const testCommands = this.generateCurlCommands();
    const apiCommands = this.generateCloudflareAPI();

    // Write to files
    fs.writeFileSync('CLOUDFLARE_SETUP_INSTRUCTIONS.md', instructions);
    fs.writeFileSync('CLOUDFLARE_TEST_COMMANDS.md', testCommands);
    fs.writeFileSync('CLOUDFLARE_API_SETUP.md', apiCommands);

    console.log('✅ Generated setup files:');
    console.log('   📄 CLOUDFLARE_SETUP_INSTRUCTIONS.md');
    console.log('   🧪 CLOUDFLARE_TEST_COMMANDS.md');
    console.log('   🔑 CLOUDFLARE_API_SETUP.md\n');

    console.log('🎯 Quick Summary:');
    console.log(`   Source: ${this.config.sourceDomain}`);
    console.log(`   Target: ${this.config.targetDomain}`);
    console.log('   Method: 301 Permanent Redirect\n');

    console.log('📋 Next Steps:');
    console.log('   1. Open CLOUDFLARE_SETUP_INSTRUCTIONS.md');
    console.log('   2. Follow the step-by-step guide');
    console.log('   3. Use test commands to verify setup');
    console.log('   4. Wait up to 24 hours for full propagation\n');

    console.log('🚀 Autopilot Complete!');
  }
}

// Run if called directly
if (require.main === module) {
  const autopilot = new CloudflareRedirectAutopilot();
  autopilot.run();
}

module.exports = CloudflareRedirectAutopilot;