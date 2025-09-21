#!/usr/bin/env bash
# scripts/cf-netlify-domain-autopilot.sh
# Complete DNS + domain attach + SSL automation for Cloudflare + Netlify

set -euo pipefail

# Required environment variables
: "${DOMAIN:?Missing DOMAIN environment variable}"
: "${NETLIFY_SITE_ID:?Missing NETLIFY_SITE_ID environment variable}"
: "${NETLIFY_AUTH_TOKEN:?Missing NETLIFY_AUTH_TOKEN environment variable}"
: "${CF_API_TOKEN:?Missing CF_API_TOKEN environment variable}"
: "${CF_ZONE_ID:?Missing CF_ZONE_ID environment variable}"

echo "🚀 Starting Cloudflare + Netlify domain autopilot..."
echo "   Domain: $DOMAIN"
echo "   Netlify Site: $NETLIFY_SITE_ID"

# Get Netlify site subdomain
echo "🔍 Getting Netlify site information..."
SITE_JSON=$(curl -fsSL \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID")

NETLIFY_SUB=$(echo "$SITE_JSON" | grep -oE '"url":"https://[^"]+\.netlify\.app' | sed 's/.*https:\/\///')

if [ -z "$NETLIFY_SUB" ]; then
  echo "❌ Failed to get Netlify subdomain"
  exit 1
fi

echo "✅ Netlify subdomain: $NETLIFY_SUB"

# Set up domains
WWW="www.${DOMAIN}"
CF_API="https://api.cloudflare.com/client/v4"
AUTH_HEADERS=(-H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json")

echo "🌐 Setting up Cloudflare DNS records..."

# Function to upsert CNAME record
upsert_cname() {
  local hostname=$1
  local target=$2
  
  echo "   Setting $hostname → $target"
  
  # Check if record exists
  RECORDS_JSON=$(curl -fsSL \
    "${CF_API}/zones/${CF_ZONE_ID}/dns_records?type=CNAME&name=${hostname}" \
    "${AUTH_HEADERS[@]}")
  
  REC_ID=$(echo "$RECORDS_JSON" | grep -oE '"id":"[a-z0-9]+"' | head -n1 | cut -d: -f2 | tr -d '"')
  
  DATA="{\"type\":\"CNAME\",\"name\":\"${hostname}\",\"content\":\"${target}\",\"ttl\":120,\"proxied\":true}"
  
  if [ -n "$REC_ID" ]; then
    # Update existing record
    curl -fsSL -X PUT \
      "${CF_API}/zones/${CF_ZONE_ID}/dns_records/${REC_ID}" \
      "${AUTH_HEADERS[@]}" \
      --data "$DATA" >/dev/null
    echo "   ✅ Updated existing CNAME for $hostname"
  else
    # Create new record
    curl -fsSL -X POST \
      "${CF_API}/zones/${CF_ZONE_ID}/dns_records" \
      "${AUTH_HEADERS[@]}" \
      --data "$DATA" >/dev/null
    echo "   ✅ Created new CNAME for $hostname"
  fi
}

# Set up both apex and www domains
upsert_cname "$DOMAIN" "$NETLIFY_SUB"
upsert_cname "$WWW" "$NETLIFY_SUB"

echo "🔗 Attaching domains to Netlify site..."

# Attach domains to Netlify site
ALIASES=$(printf '[{"name":"%s"},{"name":"%s"}]' "$DOMAIN" "$WWW")
ATTACH_RESPONSE=$(curl -fsSL -X PUT \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ALIASES" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/domains")

echo "✅ Domains attached to Netlify site"

echo "🌐 Setting primary domain to www..."

# Set primary domain to www
curl -fsSL -X PUT \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$WWW\"}" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID" >/dev/null

echo "✅ Primary domain set to $WWW"

echo "🔒 Provisioning SSL certificate..."

# Trigger SSL provisioning
SSL_RESPONSE=$(curl -fsSL -X POST \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/ssl")

echo "✅ SSL provisioning initiated"

echo "🛡️ Enabling Cloudflare security features..."

# Enable security features
enable_cf_setting() {
  local setting=$1
  local value=$2
  
  curl -fsSL -X PATCH \
    "${CF_API}/zones/${CF_ZONE_ID}/settings/${setting}" \
    "${AUTH_HEADERS[@]}" \
    --data "{\"value\":\"${value}\"}" >/dev/null
  
  echo "   ✅ Enabled $setting"
}

# Enable security settings
enable_cf_setting "always_use_https" "on"
enable_cf_setting "security_level" "medium"
enable_cf_setting "bot_fight_mode" "on"
enable_cf_setting "browser_check" "on"

echo "🔍 Verifying setup..."

# Wait a moment for DNS propagation
sleep 5

# Test domain resolution
echo "   Testing DNS resolution..."
if nslookup "$WWW" >/dev/null 2>&1; then
  echo "   ✅ DNS resolution working"
else
  echo "   ⚠️ DNS may still be propagating (this is normal)"
fi

# Test HTTP response
echo "   Testing HTTP response..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$WWW" || echo "000")

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
  echo "   ✅ Site is responding (HTTP $HTTP_STATUS)"
else
  echo "   ⚠️ Site not yet responding (HTTP $HTTP_STATUS) - SSL may still be provisioning"
fi

echo ""
echo "🎉 Domain autopilot complete!"
echo ""
echo "📋 Summary:"
echo "   • DNS: $DOMAIN and $WWW → $NETLIFY_SUB"
echo "   • Primary: $WWW"
echo "   • SSL: Provisioning initiated"
echo "   • Security: Cloudflare protection enabled"
echo ""
echo "🕐 Next steps:"
echo "   • SSL certificate may take 5-10 minutes to provision"
echo "   • DNS changes may take up to 24 hours to fully propagate"
echo "   • Test your site: https://$WWW"
echo ""
echo "🔧 Troubleshooting:"
echo "   • If SSL fails, check Netlify dashboard for certificate status"
echo "   • If DNS doesn't resolve, verify Cloudflare zone settings"
echo "   • For immediate testing, use: https://$NETLIFY_SUB"