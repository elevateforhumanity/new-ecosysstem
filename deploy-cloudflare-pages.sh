#!/bin/bash
# Deploy Frontend to Cloudflare Pages
# Automated deployment script

set -e

echo "☁️  Cloudflare Pages Deployment"
echo "==============================="
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "📦 Building frontend..."
    npm run build
    echo "✅ Build complete"
else
    echo "✅ dist directory found"
fi

echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler CLI not found"
    echo "📥 Installing wrangler..."
    npm install -g wrangler
    echo "✅ Wrangler installed"
fi

echo ""

# Check authentication
echo "🔐 Checking Cloudflare authentication..."
if wrangler whoami &> /dev/null; then
    echo "✅ Already authenticated"
    wrangler whoami
else
    echo "⚠️  Not authenticated"
    echo "🔑 Please login to Cloudflare..."
    wrangler login
fi

echo ""
echo "📋 Deployment Options:"
echo "======================"
echo ""
echo "1. Deploy via Wrangler CLI (recommended)"
echo "2. Deploy via Cloudflare Dashboard (manual)"
echo ""
read -p "Choose option (1 or 2): " option

if [ "$option" = "1" ]; then
    echo ""
    echo "🚀 Deploying to Cloudflare Pages..."
    
    # Check if project exists
    PROJECT_NAME="elevateforhumanity"
    
    echo "📤 Deploying dist/ to $PROJECT_NAME..."
    wrangler pages deploy dist --project-name=$PROJECT_NAME
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "🌐 Your site is live at:"
    echo "   https://$PROJECT_NAME.pages.dev"
    echo ""
    
elif [ "$option" = "2" ]; then
    echo ""
    echo "📖 Manual Deployment Steps:"
    echo "==========================="
    echo ""
    echo "1. Go to: https://dash.cloudflare.com"
    echo "2. Click 'Workers & Pages' → 'Create application'"
    echo "3. Click 'Pages' tab → 'Connect to Git'"
    echo "4. Select repository: elevateforhumanity/fix2"
    echo "5. Configure:"
    echo "   - Project name: elevateforhumanity"
    echo "   - Production branch: main"
    echo "   - Build command: npm run build"
    echo "   - Build output directory: dist"
    echo ""
    echo "6. Add Environment Variables:"
    echo "   VITE_SUPABASE_URL=<your-supabase-url>"
    echo "   VITE_SUPABASE_ANON_KEY=<your-anon-key>"
    echo "   VITE_API_URL=<your-render-backend-url>"
    echo ""
    echo "7. Click 'Save and Deploy'"
    echo ""
else
    echo "❌ Invalid option"
    exit 1
fi

echo ""
echo "📖 Full deployment guide: DEPLOY_LMS_PRODUCTION.md"
echo ""
echo "🔧 Next steps:"
echo "  1. Set up custom domain (optional)"
echo "  2. Configure environment variables"
echo "  3. Test the deployment"
echo "  4. Set up monitoring"
