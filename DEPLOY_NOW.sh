#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ELEVATE FOR HUMANITY - PRODUCTION DEPLOYMENT           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in to Cloudflare
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare"
    echo "📝 Please run: wrangler login"
    echo ""
    echo "Or set environment variables:"
    echo "  export CLOUDFLARE_API_TOKEN=your-token"
    echo "  export CLOUDFLARE_ACCOUNT_ID=your-account-id"
    exit 1
fi

echo "✅ Cloudflare authenticated"
echo ""

# Build the project
echo "📦 Building project..."
pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Deploy to Cloudflare Pages
echo "☁️  Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=elevateforhumanity

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if project 'elevateforhumanity' exists in Cloudflare"
    echo "2. Verify your API token has Pages permissions"
    echo "3. Try creating the project first in Cloudflare Dashboard"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              DEPLOYMENT SUCCESSFUL! 🎉                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Your site is live at:"
echo "   https://elevateforhumanity.pages.dev"
echo ""
echo "📋 Next steps:"
echo "   1. Set environment variables in Cloudflare Dashboard"
echo "   2. Run database migrations: supabase db push"
echo "   3. Test the live site"
echo ""
echo "📚 See PRODUCTION_READINESS.md for complete checklist"
echo ""
