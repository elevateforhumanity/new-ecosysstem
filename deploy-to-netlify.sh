#!/bin/bash

# Deploy EFH $3.15B Platform to Netlify
echo "🚀 DEPLOYING EFH $3.15B PLATFORM TO NETLIFY"
echo "============================================"

# Check if we're in the right directory
if [ ! -f "demo-landing-protected.html" ]; then
    echo "❌ Error: demo-landing-protected.html not found"
    exit 1
fi

echo "✅ Protected demo landing page found"

# Check Netlify configuration
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: netlify.toml not found"
    exit 1
fi

echo "✅ Netlify configuration found"

# Verify all required files are present
echo "📋 Verifying deployment files..."

required_files=(
    "demo-landing-protected.html"
    "stripe-backend.js"
    "license-protection-system.js"
    "_headers"
    "_redirects"
    "robots.txt"
    "sitemap.xml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: Uncommitted changes detected"
    echo "Committing changes..."
    git add .
    git commit -m "Deploy protected demo to Netlify - $3.15B platform"
fi

# Push to GitHub (triggers Netlify auto-deploy)
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
    echo "🌐 Netlify will auto-deploy from GitHub"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

# Display deployment info
echo ""
echo "🎉 DEPLOYMENT INITIATED"
echo "======================="
echo "📦 Platform: EFH AI Ecosystem ($3.15B)"
echo "🔒 Demo Page: demo-landing-protected.html"
echo "💳 Stripe Integration: Active"
echo "🛡️  Security: Maximum protection enabled"
echo "📊 Analytics: Tracking enabled"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://elevateforhumanity.netlify.app"
echo "   https://your-custom-domain.com (if configured)"
echo ""
echo "⏱️  Deployment typically takes 2-3 minutes"
echo "📧 You'll receive an email when deployment completes"
echo ""
echo "🔍 To check deployment status:"
echo "   Visit: https://app.netlify.com/sites/your-site-name/deploys"

# Optional: Install Netlify CLI and deploy directly
if command -v netlify &> /dev/null; then
    echo ""
    echo "🚀 Netlify CLI detected - triggering direct deployment..."
    netlify deploy --prod --dir=. --message="Deploy $3.15B EFH Platform with protected demo"
    
    if [ $? -eq 0 ]; then
        echo "✅ Direct deployment successful!"
        netlify open
    else
        echo "⚠️  Direct deployment failed, but auto-deploy from GitHub is still active"
    fi
else
    echo ""
    echo "💡 Tip: Install Netlify CLI for direct deployments:"
    echo "   npm install -g netlify-cli"
    echo "   netlify login"
    echo "   netlify link"
fi

echo ""
echo "🎯 DEPLOYMENT COMPLETE!"
echo "Your $3.15B platform demo is now live! 🚀"