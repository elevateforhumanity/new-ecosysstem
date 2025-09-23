#!/usr/bin/env bash
set -euo pipefail

echo "🤖 ELEVATE AUTOPILOT - EVERYTHING IN ONE RUN"
echo "============================================="
echo ""
echo "This autopilot will set up:"
echo "✅ Cloudflare DNS redirect (elevateforhumanity.org → elevate4humanity.org)"
echo "✅ Wix DNS pointing (optional)"
echo "✅ Supabase custom domain (optional)"
echo "✅ Gitpod tunnel setup (optional)"
echo ""

# Check dependencies
echo "🔍 Checking dependencies..."
missing_deps=()
command -v node >/dev/null 2>&1 || missing_deps+=("node")
command -v jq >/dev/null 2>&1 || missing_deps+=("jq")
command -v curl >/dev/null 2>&1 || missing_deps+=("curl")

if [ ${#missing_deps[@]} -ne 0 ]; then
    echo "❌ Missing dependencies: ${missing_deps[*]}"
    echo "Please install them and re-run."
    exit 1
fi
echo "✅ All dependencies found"
echo ""

# Get Cloudflare API Token
echo "🔑 CLOUDFLARE API TOKEN SETUP"
echo "=============================="
echo ""

if [ -f ".env.autopilot" ] && grep -q "CF_API_TOKEN" .env.autopilot; then
    echo "📋 Found existing .env.autopilot"
    source .env.autopilot
    
    # Test existing token
    echo "🧪 Testing existing token..."
    resp=$(curl -sS -H "Authorization: Bearer ${CF_API_TOKEN}" \
      "https://api.cloudflare.com/client/v4/zones?name=elevateforhumanity.org" 2>/dev/null || echo '{"success":false}')
    
    ok=$(echo "$resp" | jq -r '.success' 2>/dev/null || echo "false")
    
    if [ "$ok" = "true" ]; then
        echo "✅ Existing token works!"
        use_existing="y"
    else
        echo "❌ Existing token invalid"
        read -p "Get fresh token? (y/n): " use_existing
    fi
else
    use_existing="n"
fi

if [ "$use_existing" != "y" ]; then
    echo ""
    echo "📋 To get a fresh API token:"
    echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Click 'Create Token'"
    echo "3. Use 'Edit zone DNS' template"
    echo "4. Scope to 'elevateforhumanity.org' zone"
    echo "5. Copy the token"
    echo ""
    
    # Try to open browser
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "https://dash.cloudflare.com/profile/api-tokens" 2>/dev/null || true
    elif command -v open >/dev/null 2>&1; then
        open "https://dash.cloudflare.com/profile/api-tokens" 2>/dev/null || true
    fi
    
    read -p "📝 Paste your Cloudflare API token: " CF_API_TOKEN
    
    if [ -z "$CF_API_TOKEN" ]; then
        echo "❌ No token provided. Exiting."
        exit 1
    fi
    
    # Test the token
    echo "🧪 Testing token..."
    resp=$(curl -sS -H "Authorization: Bearer ${CF_API_TOKEN}" \
      "https://api.cloudflare.com/client/v4/zones?name=elevateforhumanity.org")
    
    ok=$(echo "$resp" | jq -r '.success')
    if [ "$ok" != "true" ]; then
        echo "❌ Token test failed:"
        echo "$resp" | jq '.'
        exit 1
    fi
    
    echo "✅ Token verified!"
    
    # Save base config
    cat > .env.autopilot <<EOF
CF_API_TOKEN=${CF_API_TOKEN}
CF_ZONE_NAME=elevateforhumanity.org
APEX_IP=192.0.2.1
REDIRECT_TO=https://elevate4humanity.org
EOF
    echo "✅ Saved .env.autopilot"
fi

echo ""
echo "🎯 WHAT DO YOU WANT TO SET UP?"
echo "==============================="
echo ""

# Ask what to set up
read -p "1️⃣  Set up basic redirect (elevateforhumanity.org → elevate4humanity.org)? (y/n): " setup_redirect
read -p "2️⃣  Set up Wix DNS pointing? (y/n): " setup_wix
read -p "3️⃣  Set up Supabase custom domain? (y/n): " setup_supabase
read -p "4️⃣  Set up Gitpod tunnel? (y/n): " setup_gitpod

echo ""

# 1. Basic Redirect Setup
if [ "$setup_redirect" = "y" ]; then
    echo "🔄 SETTING UP BASIC REDIRECT"
    echo "============================"
    echo "Creating: elevateforhumanity.org → elevate4humanity.org"
    
    if node fix-autopilot-cloudflare-production.cjs; then
        echo "✅ Basic redirect setup complete!"
    else
        echo "❌ Basic redirect setup failed"
    fi
    echo ""
fi

# 2. Wix Setup
if [ "$setup_wix" = "y" ]; then
    echo "🎨 WIX DNS POINTING SETUP"
    echo "========================="
    echo ""
    echo "📋 Get these values from your Wix dashboard:"
    echo "1. Go to Wix Studio → Settings → Domains"
    echo "2. Click 'Connect a domain you own'"
    echo "3. Choose 'Via pointing'"
    echo "4. Copy the A record IP and CNAME target"
    echo ""
    
    read -p "Wix A record IP (e.g., 23.236.62.147): " WIX_A_IP
    read -p "Wix CNAME target (e.g., www123.wixdns.net): " WIX_CNAME_TARGET
    
    if [ -n "$WIX_A_IP" ] && [ -n "$WIX_CNAME_TARGET" ]; then
        # Add to env file
        echo "WIX_A_IP=${WIX_A_IP}" >> .env.autopilot
        echo "WIX_CNAME_TARGET=${WIX_CNAME_TARGET}" >> .env.autopilot
        
        echo "🚀 Running Wix autopilot..."
        if node autopilot-wix.cjs; then
            echo "✅ Wix DNS setup complete!"
            echo "🔄 Now go to Wix and verify the domain connection."
        else
            echo "❌ Wix setup failed"
        fi
    else
        echo "⚠️  Skipping Wix setup (missing values)"
    fi
    echo ""
fi

# 3. Supabase Setup
if [ "$setup_supabase" = "y" ]; then
    echo "🔐 SUPABASE CUSTOM DOMAIN SETUP"
    echo "==============================="
    echo ""
    echo "📋 First, create the domain in Supabase:"
    echo "supabase domains create --custom-hostname auth.elevateforhumanity.org"
    echo ""
    echo "Then paste the TXT and CNAME records here:"
    echo ""
    
    read -p "Subdomain name (e.g., auth): " SUPABASE_SUBDOMAIN
    read -p "TXT record 1 name (e.g., _supabase-challenge.auth): " TXT1_NAME
    read -p "TXT record 1 value: " TXT1_VALUE
    read -p "TXT record 2 name (e.g., _supabase-verification.auth): " TXT2_NAME
    read -p "TXT record 2 value: " TXT2_VALUE
    read -p "CNAME target (e.g., abcd.supabase.co): " CNAME_TARGET
    
    if [ -n "$SUPABASE_SUBDOMAIN" ] && [ -n "$TXT1_NAME" ] && [ -n "$CNAME_TARGET" ]; then
        # Create supabase-records.json
        cat > supabase-records.json <<EOF
{
  "host": "${SUPABASE_SUBDOMAIN}.elevateforhumanity.org",
  "txt": [
    {"name": "${TXT1_NAME}", "value": "${TXT1_VALUE}"},
    {"name": "${TXT2_NAME}", "value": "${TXT2_VALUE}"}
  ],
  "cname": {"name": "${SUPABASE_SUBDOMAIN}", "target": "${CNAME_TARGET}"}
}
EOF
        
        echo "🚀 Running Supabase autopilot..."
        if node autopilot-supabase.cjs; then
            echo "✅ Supabase DNS setup complete!"
            echo "🔄 Go back to Supabase and click 'Verify' to complete setup."
        else
            echo "❌ Supabase setup failed"
        fi
    else
        echo "⚠️  Skipping Supabase setup (missing values)"
    fi
    echo ""
fi

# 4. Gitpod Tunnel Setup
if [ "$setup_gitpod" = "y" ]; then
    echo "🚇 GITPOD TUNNEL SETUP"
    echo "======================"
    echo ""
    echo "This sets up a stable subdomain for your Gitpod workspace."
    echo ""
    
    read -p "Subdomain for Gitpod (e.g., studio): " GITPOD_SUBDOMAIN
    read -p "Local port your app runs on (default: 8080): " GITPOD_PORT
    GITPOD_PORT=${GITPOD_PORT:-8080}
    
    if [ -n "$GITPOD_SUBDOMAIN" ]; then
        # Update gitpod-tunnel.sh with custom values
        sed -i "s/studio\.elevateforhumanity\.org/${GITPOD_SUBDOMAIN}.elevateforhumanity.org/g" gitpod-tunnel.sh
        sed -i "s/LOCAL_PORT:=8080/LOCAL_PORT:=${GITPOD_PORT}/g" gitpod-tunnel.sh
        
        echo "✅ Gitpod tunnel configured!"
        echo "📋 To start the tunnel (run this in your Gitpod workspace):"
        echo "   chmod +x gitpod-tunnel.sh"
        echo "   ./gitpod-tunnel.sh"
        echo ""
        echo "🌐 Your app will be available at: https://${GITPOD_SUBDOMAIN}.elevateforhumanity.org"
    else
        echo "⚠️  Skipping Gitpod setup"
    fi
    echo ""
fi

echo "🎉 AUTOPILOT COMPLETE!"
echo "======================"
echo ""
echo "✅ Summary of what was set up:"
[ "$setup_redirect" = "y" ] && echo "   🔄 Basic redirect: elevateforhumanity.org → elevate4humanity.org"
[ "$setup_wix" = "y" ] && echo "   🎨 Wix DNS pointing for apex and www"
[ "$setup_supabase" = "y" ] && echo "   🔐 Supabase custom domain DNS records"
[ "$setup_gitpod" = "y" ] && echo "   🚇 Gitpod tunnel configuration"
echo ""
echo "🧪 Test your setup:"
echo "   ./test-autopilot-redirect.sh"
echo ""
echo "⏰ DNS changes may take a few minutes to propagate globally."
echo ""
echo "🎯 All done! Your domains are configured automatically."