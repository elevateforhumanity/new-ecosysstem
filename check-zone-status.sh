#!/usr/bin/env bash

echo "🔍 CHECKING CLOUDFLARE ZONE STATUS"
echo "=================================="

if [ ! -f ".env.autopilot" ]; then
    echo "❌ Missing .env.autopilot file"
    echo "Create it with your API token and zone name"
    exit 1
fi

# Load environment variables
CF_API_TOKEN="$(grep ^CF_API_TOKEN .env.autopilot | cut -d= -f2)"
CF_ZONE_NAME="$(grep ^CF_ZONE_NAME .env.autopilot | cut -d= -f2)"

if [ -z "$CF_API_TOKEN" ] || [ -z "$CF_ZONE_NAME" ]; then
    echo "❌ Missing CF_API_TOKEN or CF_ZONE_NAME in .env.autopilot"
    exit 1
fi

echo "Zone: $CF_ZONE_NAME"
echo "Token: ${CF_API_TOKEN:0:10}..."
echo ""

# Check zone status
response=$(curl -sS -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones?name=$CF_ZONE_NAME")

if ! echo "$response" | jq -e '.success' >/dev/null 2>&1; then
    echo "❌ API request failed:"
    echo "$response" | jq '.'
    exit 1
fi

# Extract zone info
zone_info=$(echo "$response" | jq -r '.result[0] | "status=\(.status)\nid=\(.id)\nns=\(.name_servers|join(", "))"')

echo "📊 Zone Information:"
echo "$zone_info"
echo ""

status=$(echo "$zone_info" | grep "^status=" | cut -d= -f2)
nameservers=$(echo "$zone_info" | grep "^ns=" | cut -d= -f2)

if [ "$status" = "active" ]; then
    echo "✅ Zone is ACTIVE - DNS records will resolve"
    echo "🚀 Ready to run autopilot!"
elif [ "$status" = "pending" ]; then
    echo "⚠️  Zone is PENDING - DNS won't resolve yet"
    echo ""
    echo "🔧 To fix:"
    echo "1. Go to your domain registrar"
    echo "2. Update nameservers to:"
    echo "   $nameservers"
    echo "3. Wait for propagation (up to 24 hours)"
    echo "4. Zone status will change to 'active'"
    echo ""
    echo "💡 You can still create DNS records, but they won't resolve until active"
else
    echo "❓ Zone status: $status"
    echo "Check Cloudflare dashboard for details"
fi