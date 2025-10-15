#!/bin/bash
# Deploy LMS Backend to Render
# This script helps set up the Render deployment

set -e

echo "🚀 Render Deployment Helper"
echo "============================"
echo ""

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found!"
    exit 1
fi

echo "✅ render.yaml found"
echo ""

# Check backend directory
if [ ! -d "backend" ]; then
    echo "❌ backend directory not found!"
    exit 1
fi

echo "✅ backend directory found"
echo ""

# Check backend dependencies
cd backend
if [ ! -f "package.json" ]; then
    echo "❌ backend/package.json not found!"
    exit 1
fi

echo "✅ backend/package.json found"
echo ""

# Test backend dependencies install
echo "📦 Testing backend dependencies..."
npm install --silent
echo "✅ Dependencies installed successfully"
echo ""

cd ..

# Check if .env.example exists
if [ -f "backend/.env.example" ]; then
    echo "✅ backend/.env.example found"
else
    echo "⚠️  backend/.env.example not found (optional)"
fi

echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo ""
echo "1. Go to: https://dashboard.render.com"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Connect repository: elevateforhumanity/fix2"
echo "4. Configure:"
echo "   - Name: efh-lms-backend"
echo "   - Region: Oregon (US West)"
echo "   - Branch: main"
echo "   - Root Directory: backend"
echo "   - Runtime: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Plan: Free"
echo ""
echo "5. Add Environment Variables:"
echo "   NODE_ENV=production"
echo "   SUPABASE_URL=<your-supabase-url>"
echo "   SUPABASE_ANON_KEY=<your-anon-key>"
echo "   SUPABASE_SERVICE_KEY=<your-service-key>"
echo "   JWT_SECRET=<generate-with-command-below>"
echo "   FRONTEND_URL=https://elevateforhumanity.pages.dev"
echo ""
echo "6. Generate JWT Secret:"
echo "   node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
echo ""
echo "7. Click 'Create Web Service'"
echo ""
echo "✅ Ready for deployment!"
echo ""
echo "📖 Full guide: DEPLOY_LMS_PRODUCTION.md"
