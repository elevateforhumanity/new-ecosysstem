#!/usr/bin/env bash
# scripts/blue-green-switch.sh
# Zero-downtime blue/green deployment switching

set -euo pipefail

BLUE_SITE_ID=${1:-}
GREEN_SITE_ID=${2:-}

if [ -z "$BLUE_SITE_ID" ] || [ -z "$GREEN_SITE_ID" ]; then
  echo "❌ Usage: $0 <blue-site-id> <green-site-id>"
  echo "   Example: $0 abc123-blue def456-green"
  exit 1
fi

: "${NETLIFY_AUTH_TOKEN:?Missing NETLIFY_AUTH_TOKEN}"
: "${DOMAIN:?Missing DOMAIN}"

WWW="www.${DOMAIN}"

echo "🔄 Blue/Green Deployment Switch"
echo "   Blue Site: $BLUE_SITE_ID"
echo "   Green Site: $GREEN_SITE_ID"
echo "   Domain: $WWW"

# Function to get current primary domain for a site
get_primary_domain() {
  local site_id=$1
  curl -fsSL \
    -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
    "https://api.netlify.com/api/v1/sites/$site_id" | \
    grep -oE '"name":"[^"]*"' | head -1 | cut -d: -f2 | tr -d '"'
}

# Function to switch domain to target site
switch_domain() {
  local target_site_id=$1
  local domain=$2
  
  echo "🔄 Switching $domain to site $target_site_id..."
  
  # Remove domain from all sites first (to avoid conflicts)
  for site_id in "$BLUE_SITE_ID" "$GREEN_SITE_ID"; do
    curl -fsSL -X DELETE \
      -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
      "https://api.netlify.com/api/v1/sites/$site_id/domains/$domain" \
      2>/dev/null || true
  done
  
  # Add domain to target site
  curl -fsSL -X POST \
    -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$domain\"}" \
    "https://api.netlify.com/api/v1/sites/$target_site_id/domains"
  
  # Set as primary domain
  curl -fsSL -X PUT \
    -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$domain\"}" \
    "https://api.netlify.com/api/v1/sites/$target_site_id"
  
  echo "✅ Domain $domain switched to site $target_site_id"
}

# Function to health check a site
health_check() {
  local site_id=$1
  local site_url
  
  # Get site URL
  site_url=$(curl -fsSL \
    -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
    "https://api.netlify.com/api/v1/sites/$site_id" | \
    grep -oE '"ssl_url":"[^"]*"' | cut -d: -f2- | tr -d '"')
  
  if [ -z "$site_url" ]; then
    echo "❌ Could not get URL for site $site_id"
    return 1
  fi
  
  echo "🔍 Health checking $site_url..."
  
  # Test HTTP response
  local status_code
  status_code=$(curl -s -o /dev/null -w "%{http_code}" "$site_url" || echo "000")
  
  if [ "$status_code" = "200" ]; then
    echo "✅ Site $site_id is healthy (HTTP $status_code)"
    return 0
  else
    echo "❌ Site $site_id is unhealthy (HTTP $status_code)"
    return 1
  fi
}

# Determine current active site
echo "🔍 Determining current active site..."

BLUE_PRIMARY=$(get_primary_domain "$BLUE_SITE_ID")
GREEN_PRIMARY=$(get_primary_domain "$GREEN_SITE_ID")

if [ "$BLUE_PRIMARY" = "$WWW" ]; then
  CURRENT_SITE="blue"
  CURRENT_SITE_ID="$BLUE_SITE_ID"
  TARGET_SITE="green"
  TARGET_SITE_ID="$GREEN_SITE_ID"
elif [ "$GREEN_PRIMARY" = "$WWW" ]; then
  CURRENT_SITE="green"
  CURRENT_SITE_ID="$GREEN_SITE_ID"
  TARGET_SITE="blue"
  TARGET_SITE_ID="$BLUE_SITE_ID"
else
  echo "❌ Neither site has $WWW as primary domain"
  echo "   Blue primary: $BLUE_PRIMARY"
  echo "   Green primary: $GREEN_PRIMARY"
  exit 1
fi

echo "📊 Current state:"
echo "   Active: $CURRENT_SITE ($CURRENT_SITE_ID)"
echo "   Target: $TARGET_SITE ($TARGET_SITE_ID)"

# Health check target site before switching
echo "🏥 Pre-switch health check..."
if ! health_check "$TARGET_SITE_ID"; then
  echo "❌ Target site failed health check. Aborting switch."
  exit 1
fi

# Perform the switch
echo "🔄 Performing blue/green switch..."
switch_domain "$TARGET_SITE_ID" "$WWW"
switch_domain "$TARGET_SITE_ID" "$DOMAIN"

# Wait for DNS propagation
echo "⏳ Waiting for DNS propagation..."
sleep 10

# Post-switch health check
echo "🏥 Post-switch health check..."
if health_check "$TARGET_SITE_ID"; then
  echo "🎉 Blue/green switch successful!"
  echo "   $WWW is now pointing to $TARGET_SITE ($TARGET_SITE_ID)"
  
  # Optional: Send notification
  if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    curl -fsSL -X POST \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"🔄 Blue/green switch completed: $WWW now points to $TARGET_SITE site\"}" \
      "$SLACK_WEBHOOK_URL" || true
  fi
  
else
  echo "❌ Post-switch health check failed!"
  echo "🔄 Rolling back..."
  
  # Rollback
  switch_domain "$CURRENT_SITE_ID" "$WWW"
  switch_domain "$CURRENT_SITE_ID" "$DOMAIN"
  
  echo "✅ Rollback completed. $WWW restored to $CURRENT_SITE site."
  exit 1
fi

echo ""
echo "📋 Switch Summary:"
echo "   Previous: $CURRENT_SITE ($CURRENT_SITE_ID)"
echo "   Current:  $TARGET_SITE ($TARGET_SITE_ID)"
echo "   Domain:   $WWW"
echo ""
echo "🔧 Rollback command:"
echo "   $0 $TARGET_SITE_ID $CURRENT_SITE_ID"