#!/bin/bash

# Cloudflare SSL Autopilot Setup Script

echo "🔑 Cloudflare API Setup for SSL Autopilot"
echo "========================================"

echo ""
echo "Choose authentication method:"
echo "1) API Token (Recommended)"
echo "2) Email + Global API Key"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "📋 API Token Setup:"
    echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Click 'Create Token'"
    echo "3. Use 'Zone:Zone:Edit' template"
    echo "4. Include your elevateforhumanity.org zone"
    echo "5. Copy the token"
    echo ""
    read -p "Enter your API Token: " api_token
    
    export CLOUDFLARE_API_TOKEN="$api_token"
    echo "export CLOUDFLARE_API_TOKEN="$api_token"" >> ~/.bashrc
    
    echo "✅ API Token configured!"
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "📋 Email + API Key Setup:"
    echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Scroll to 'Global API Key'"
    echo "3. Click 'View' and copy the key"
    echo ""
    read -p "Enter your Cloudflare email: " email
    read -p "Enter your Global API Key: " api_key
    
    export CLOUDFLARE_EMAIL="$email"
    export CLOUDFLARE_API_KEY="$api_key"
    echo "export CLOUDFLARE_EMAIL="$email"" >> ~/.bashrc
    echo "export CLOUDFLARE_API_KEY="$api_key"" >> ~/.bashrc
    
    echo "✅ Email + API Key configured!"
    
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "🚀 Running SSL Autopilot Fix..."
node autopilot-cloudflare-ssl-fix.cjs

echo ""
echo "✅ Setup complete!"
echo "💡 You can now run 'node autopilot-cloudflare-ssl-fix.cjs' anytime"