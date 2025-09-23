#!/usr/bin/env bash
set -euo pipefail

echo "🚀 RUNNING AUTOPILOT WITH EXISTING CONFIG..."
echo "============================================"

# Check if we have the config file with API token
if [ -f "autopilot-cloudflare-setup.json" ]; then
    echo "📋 Found existing Cloudflare config"
    
    # Extract values from existing config
    CF_API_TOKEN=$(jq -r '.credentials.cloudflare_api_token' autopilot-cloudflare-setup.json)
    CF_ZONE_NAME="elevateforhumanity.org"
    APEX_IP="192.0.2.1"  # TEST IP - replace with real IP for production
    REDIRECT_TO="https://elevate4humanity.org"
    
    echo "🔑 Using API token from config: ${CF_API_TOKEN:0:10}..."
    echo "🌐 Zone: $CF_ZONE_NAME"
    echo "📍 Apex IP: $APEX_IP (⚠️  TEST IP - replace for production)"
    echo "🔄 Redirect to: $REDIRECT_TO"
    
    # Create env file
    ENV_FILE=".env.autopilot"
    cat > "$ENV_FILE" <<EOF
CF_API_TOKEN=${CF_API_TOKEN}
CF_ZONE_NAME=${CF_ZONE_NAME}
APEX_IP=${APEX_IP}
REDIRECT_TO=${REDIRECT_TO}
EOF
    
    echo "✅ Created $ENV_FILE"
    
    # Test the token
    echo "🧪 Testing API token..."
    resp=$(curl -sS -H "Authorization: Bearer ${CF_API_TOKEN}" \
      "https://api.cloudflare.com/client/v4/zones?name=${CF_ZONE_NAME}")
    
    ok=$(echo "$resp" | jq -r '.success')
    if [ "$ok" != "true" ]; then
        echo "❌ API token test failed. Response:"
        echo "$resp" | jq '.'
        echo ""
        echo "💡 You may need a fresh API token. Get one at:"
        echo "   https://dash.cloudflare.com/profile/api-tokens"
        echo "   Use 'Zone:Zone:Edit' template for elevateforhumanity.org"
        exit 1
    fi
    
    count=$(echo "$resp" | jq -r '.result | length')
    if [ "$count" -eq 0 ]; then
        echo "❌ Zone not found: ${CF_ZONE_NAME}"
        echo "   Make sure the token has access to this zone"
        exit 1
    fi
    
    echo "✅ API token and zone verified!"
    
    # Run the autopilot
    echo "🤖 Running autopilot..."
    if command -v node >/dev/null 2>&1; then
        node fix-autopilot-cloudflare-production.cjs
        echo ""
        echo "🎉 AUTOPILOT COMPLETE!"
        echo "🧪 Test the redirect:"
        echo "   ./test-autopilot-redirect.sh"
    else
        echo "❌ Node.js not found. Please install Node 18+ and re-run."
        exit 1
    fi
    
else
    echo "❌ No autopilot-cloudflare-setup.json found"
    echo "💡 Run the interactive setup:"
    echo "   ./autopilot-cloudflare-fix.sh"
    exit 1
fi