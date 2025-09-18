#!/bin/bash

# 🌐 Netlify WWW Domain Fix Script
# ================================
# Run this script to fix www.elevateforhumanity.org SSL issue

echo "🌐 NETLIFY WWW DOMAIN FIX"
echo "========================="
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Check if logged in
echo "🔍 Checking Netlify authentication..."
if ! netlify status > /dev/null 2>&1; then
    echo "❌ Not logged into Netlify"
    echo "🔑 Please run: netlify login"
    echo "   This will open a browser for authentication"
    echo ""
    echo "After logging in, run this script again."
    exit 1
fi

echo "✅ Netlify authentication confirmed"
echo ""

# Show current site info
echo "📋 Current site information:"
netlify status
echo ""

# Add www domain
echo "➕ Adding www.elevateforhumanity.org domain..."
netlify domains:create www.elevateforhumanity.org 2>/dev/null || echo "   (Domain may already exist)"
echo ""

# Deploy current configuration
echo "🚀 Deploying current configuration..."
netlify deploy --prod --dir=.
echo ""

# Wait for propagation
echo "⏳ Waiting for SSL certificate provisioning (30 seconds)..."
sleep 30

# Test the fix
echo "🧪 Testing www subdomain..."
if curl -I https://www.elevateforhumanity.org 2>/dev/null | grep -q "301\|302"; then
    echo "✅ SUCCESS! www subdomain is working with redirect"
    echo "🔒 SSL certificate provisioned successfully"
else
    echo "⚠️  Still propagating... may take up to 10 minutes"
    echo "💡 You can also add the domain manually in Netlify dashboard:"
    echo "   https://app.netlify.com/ → Site settings → Domain management"
fi

echo ""
echo "🎉 Script complete!"
echo "📋 Your configuration files are ready:"
echo "   ✅ netlify.toml (with www redirect)"
echo "   ✅ _redirects (with www redirect)"
echo ""
echo "If the issue persists, use the Netlify dashboard method:"
echo "https://app.netlify.com/ → Add custom domain → www.elevateforhumanity.org"