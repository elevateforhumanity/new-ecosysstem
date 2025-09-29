# 🌐 DNS Automation Guide - Hub Pages

## 🚀 Quick Setup Options

### Option 1: Automated Script
```bash
# Run the automated DNS setup script
./setup-dns.sh
```

### Option 2: Manual Configuration
Follow the step-by-step instructions below.

---

## 🔧 Manual DNS Configuration

### Step 1: Access Cloudflare Dashboard
1. **Go to:** https://dash.cloudflare.com
2. **Login** with your Cloudflare account
3. **Select domain:** elevateforhumanity.org

### Step 2: Navigate to DNS Settings
1. Click **"DNS"** in the left sidebar
2. You'll see the DNS management interface

### Step 3: Add CNAME Record
Click **"Add record"** and configure:

```
Type: CNAME
Name: hubs
Target: elevateforhumanity.github.io
Proxy status: DNS only (gray cloud) ⚠️ CRITICAL
TTL: Auto
```

**⚠️ CRITICAL:** Ensure proxy status is **"DNS only"** (gray cloud), NOT **"Proxied"** (orange cloud)

### Step 4: Save and Verify
1. Click **"Save"**
2. Record should appear as: `hubs.elevateforhumanity.org CNAME elevateforhumanity.github.io DNS only`

---

## 🤖 API-Based Automation

### Prerequisites
- Cloudflare API Token with Zone:Edit permissions
- curl or similar HTTP client

### Get API Token
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use **"Custom token"** template
4. Set permissions:
   - Zone:Zone:Read
   - Zone:DNS:Edit
5. Set zone resources: Include specific zone `elevateforhumanity.org`

### Automated DNS Creation Script
```bash
#!/bin/bash

# Set your API token
export CLOUDFLARE_API_TOKEN="your_token_here"

# Domain configuration
DOMAIN="elevateforhumanity.org"
SUBDOMAIN="hubs"
TARGET="elevateforhumanity.github.io"

# Get Zone ID
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" | \
    jq -r '.result[0].id')

# Create CNAME record
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data '{
        "type": "CNAME",
        "name": "hubs",
        "content": "elevateforhumanity.github.io",
        "proxied": false,
        "ttl": 1
    }'
```

---

## 🧪 Verification Methods

### DNS Resolution Test
```bash
# Test with nslookup
nslookup hubs.elevateforhumanity.org

# Expected output:
# hubs.elevateforhumanity.org canonical name = elevateforhumanity.github.io

# Test with dig
dig hubs.elevateforhumanity.org

# Test with different DNS servers
nslookup hubs.elevateforhumanity.org 8.8.8.8
nslookup hubs.elevateforhumanity.org 1.1.1.1
```

### HTTP Response Test
```bash
# Test HTTP response
curl -I https://hubs.elevateforhumanity.org

# Expected: HTTP/2 200 OK (after GitHub Pages is configured)
```

### Online DNS Checkers
- https://www.whatsmydns.net/#CNAME/hubs.elevateforhumanity.org
- https://dnschecker.org/#CNAME/hubs.elevateforhumanity.org
- https://www.nslookup.io/domains/hubs.elevateforhumanity.org/dns-records/

---

## ⏰ Timeline & Expectations

### Immediate (0-2 minutes)
- DNS record creation in Cloudflare
- Record visible in Cloudflare dashboard

### Short Term (5-15 minutes)
- DNS propagation to major DNS servers
- nslookup/dig commands start working

### Global (15-30 minutes)
- Worldwide DNS propagation
- All DNS checkers show the record

### Full Functionality (30-45 minutes)
- GitHub Pages recognizes custom domain
- SSL certificate provisioned
- Hub pages fully accessible

---

## 🚨 Troubleshooting

### DNS Not Resolving
1. **Check record exists** in Cloudflare dashboard
2. **Verify proxy setting** is "DNS only" (gray cloud)
3. **Wait longer** - DNS can take up to 48 hours (usually 15 minutes)
4. **Clear DNS cache** on your device
5. **Test from different locations** using online tools

### Wrong DNS Response
1. **Check target** is exactly `elevateforhumanity.github.io`
2. **Verify record type** is CNAME, not A record
3. **Check for typos** in subdomain name
4. **Ensure no conflicting records** exist

### SSL Certificate Issues
1. **Wait for GitHub Pages** to detect custom domain
2. **Verify "Enforce HTTPS"** is enabled in GitHub Pages settings
3. **Check certificate status** in GitHub repository settings
4. **Allow time** for certificate provisioning (5-10 minutes)

---

## 🔄 Monitoring & Maintenance

### Automated Monitoring Script
```bash
#!/bin/bash
# monitor-dns.sh

DOMAIN="hubs.elevateforhumanity.org"
TARGET="elevateforhumanity.github.io"

while true; do
    echo "$(date): Checking DNS for $DOMAIN"
    
    RESULT=$(nslookup $DOMAIN 2>/dev/null | grep "canonical name" | awk '{print $4}')
    
    if [ "$RESULT" = "$TARGET" ]; then
        echo "✅ DNS is working correctly"
    else
        echo "❌ DNS issue detected: $RESULT"
    fi
    
    sleep 300  # Check every 5 minutes
done
```

### Health Check Endpoints
- **DNS Status:** https://www.whatsmydns.net/#CNAME/hubs.elevateforhumanity.org
- **Site Status:** https://hubs.elevateforhumanity.org
- **GitHub Pages:** https://github.com/elevateforhumanity/new-ecosysstem/settings/pages

---

## 📞 Support Resources

### Cloudflare Support
- **Dashboard:** https://dash.cloudflare.com
- **Documentation:** https://developers.cloudflare.com/dns/
- **Community:** https://community.cloudflare.com
- **Support:** https://support.cloudflare.com

### DNS Tools
- **DNS Checker:** https://dnschecker.org
- **What's My DNS:** https://www.whatsmydns.net
- **DNS Lookup:** https://www.nslookup.io
- **MX Toolbox:** https://mxtoolbox.com

---

## 🎯 Success Criteria

### ✅ DNS Configuration Complete When:
- [ ] CNAME record exists in Cloudflare
- [ ] Record shows "DNS only" (gray cloud)
- [ ] nslookup returns elevateforhumanity.github.io
- [ ] Online DNS checkers show the record globally
- [ ] GitHub Pages recognizes the custom domain

### ✅ Full System Operational When:
- [ ] All hub pages load with HTTPS
- [ ] SSL certificate is valid
- [ ] Mobile responsiveness confirmed
- [ ] Contact information displays correctly
- [ ] All links and navigation work properly

---

**🚀 Once DNS is configured, the hub pages will be live at:**
- https://hubs.elevateforhumanity.org/student-hub.html
- https://hubs.elevateforhumanity.org/business-hub.html
- https://hubs.elevateforhumanity.org/community-hub.html
- https://hubs.elevateforhumanity.org/educator-hub.html