#!/usr/bin/env bash
set -euo pipefail

echo "🤖 AUTOPILOT COMPLETE - DOING EVERYTHING FOR YOU"
echo "================================================"

# Check if we need a fresh token
if [ -f ".env.autopilot" ]; then
    echo "📋 Found existing autopilot config"
    source .env.autopilot
    
    # Test existing token
    echo "🧪 Testing existing token..."
    resp=$(curl -sS -H "Authorization: Bearer ${CF_API_TOKEN}" \
      "https://api.cloudflare.com/client/v4/zones?name=elevateforhumanity.org" 2>/dev/null || echo '{"success":false}')
    
    ok=$(echo "$resp" | jq -r '.success' 2>/dev/null || echo "false")
    
    if [ "$ok" = "true" ]; then
        echo "✅ Existing token works!"
        echo "🚀 Running autopilot..."
        node fix-autopilot-cloudflare-production.cjs
        echo ""
        echo "🧪 Testing redirect..."
        ./test-autopilot-redirect.sh
        echo ""
        echo "🎉 AUTOPILOT COMPLETE! Your redirect is set up."
        exit 0
    else
        echo "❌ Existing token invalid, need fresh one"
    fi
fi

echo ""
echo "🔑 AUTOPILOT NEEDS FRESH CLOUDFLARE API TOKEN"
echo "============================================="
echo ""
echo "I'll open the Cloudflare token page for you..."
echo ""
echo "📋 Steps:"
echo "1. Click 'Create Token'"
echo "2. Use 'Zone:Zone:Edit' template"  
echo "3. Scope to 'elevateforhumanity.org' zone"
echo "4. Copy the token"
echo "5. Paste it below"
echo ""

# Try to open browser (works in some environments)
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "https://dash.cloudflare.com/profile/api-tokens" 2>/dev/null || true
elif command -v open >/dev/null 2>&1; then
    open "https://dash.cloudflare.com/profile/api-tokens" 2>/dev/null || true
fi

echo "🌐 URL: https://dash.cloudflare.com/profile/api-tokens"
echo ""
read -p "📝 Paste your fresh API token here: " CF_API_TOKEN

if [ -z "$CF_API_TOKEN" ]; then
    echo "❌ No token provided. Run ./autopilot-complete.sh again when ready."
    exit 1
fi

echo ""
echo "🧪 Testing your token..."

# Test the token
resp=$(curl -sS -H "Authorization: Bearer ${CF_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/zones?name=elevateforhumanity.org")

ok=$(echo "$resp" | jq -r '.success')
if [ "$ok" != "true" ]; then
    echo "❌ Token test failed:"
    echo "$resp" | jq '.'
    echo ""
    echo "💡 Make sure the token has:"
    echo "   - Zone:Zone:Read permission"
    echo "   - Zone:DNS:Edit permission"  
    echo "   - Access to elevateforhumanity.org zone"
    exit 1
fi

count=$(echo "$resp" | jq -r '.result | length')
if [ "$count" -eq 0 ]; then
    echo "❌ Zone 'elevateforhumanity.org' not found"
    echo "   Make sure the token has access to this zone"
    exit 1
fi

echo "✅ Token verified!"

# Create autopilot config
cat > .env.autopilot <<EOF
CF_API_TOKEN=${CF_API_TOKEN}
CF_ZONE_NAME=elevateforhumanity.org
APEX_IP=192.0.2.1
REDIRECT_TO=https://elevate4humanity.org
EOF

echo "✅ Saved autopilot config"

# Run the autopilot
echo ""
echo "🤖 RUNNING AUTOPILOT..."
echo "======================"

if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js not found. Please install Node 18+ first."
    exit 1
fi

# Run autopilot
node fix-autopilot-cloudflare-production.cjs

echo ""
echo "🧪 TESTING REDIRECT..."
echo "====================="
./test-autopilot-redirect.sh

echo ""
echo "🎉 AUTOPILOT COMPLETE!"
echo "====================="
echo ""
echo "✅ DNS Records Created:"
echo "   A @ → 192.0.2.1 (proxied)"
echo "   CNAME www → elevateforhumanity.org (proxied)"
echo ""
echo "✅ Redirect Rules Created:"
echo "   elevateforhumanity.org → elevate4humanity.org (301)"
echo ""
echo "⏰ Changes may take a few minutes to propagate globally"
echo ""
echo "🔄 Your redirect is now live!"
echo "   elevateforhumanity.org → elevate4humanity.org"
echo "   www.elevateforhumanity.org → www.elevate4humanity.org"