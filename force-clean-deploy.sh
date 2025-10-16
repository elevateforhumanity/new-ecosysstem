#!/bin/bash
set -e

echo "🧹 Force Clean Deployment - Delete Old Builds"
echo "=============================================="
echo ""

# Clean local build artifacts
echo "1️⃣  Cleaning local build artifacts..."
rm -rf dist/
rm -rf .vite/
rm -rf node_modules/.vite/
rm -rf .turbo/
rm -rf .cache/
echo "   ✅ Local artifacts cleaned"
echo ""

# Clean pnpm cache
echo "2️⃣  Cleaning pnpm cache..."
pnpm store prune || true
echo "   ✅ pnpm cache cleaned"
echo ""

# Rebuild from scratch
echo "3️⃣  Building from scratch..."
pnpm install --frozen-lockfile=false
echo "   ✅ Dependencies installed"
echo ""

echo "4️⃣  Running build..."
pnpm run build
echo "   ✅ Build complete"
echo ""

# Verify build output
echo "5️⃣  Verifying build output..."
if [ -f "dist/index.html" ]; then
  echo "   ✅ dist/index.html exists"
  TITLE=$(grep -o "<title>.*</title>" dist/index.html | head -1)
  echo "   Title: $TITLE"
else
  echo "   ❌ dist/index.html not found!"
  exit 1
fi

if [ -f "dist/_redirects" ]; then
  echo "   ✅ dist/_redirects exists"
else
  echo "   ❌ dist/_redirects not found!"
  exit 1
fi

if [ -f "dist/_headers" ]; then
  echo "   ✅ dist/_headers exists"
else
  echo "   ❌ dist/_headers not found!"
  exit 1
fi

echo ""
echo "6️⃣  Checking dist/ contents..."
ls -lh dist/ | head -20
echo ""

# Create a deployment marker
echo "7️⃣  Creating deployment marker..."
echo "Build timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" > dist/.deploy-marker
echo "Commit: $(git rev-parse --short HEAD)" >> dist/.deploy-marker
echo "Branch: $(git branch --show-current)" >> dist/.deploy-marker
echo "   ✅ Deployment marker created"
echo ""

# Commit the clean build
echo "8️⃣  Committing clean build..."
git add dist/.deploy-marker
git commit -m "Force clean build - delete old artifacts

- Cleaned all build caches
- Rebuilt from scratch
- Verified all required files
- Build timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

[watch-render]

Co-authored-by: Ona <no-reply@ona.com>" || echo "Nothing to commit"
echo ""

# Push to trigger Render deployment
echo "9️⃣  Pushing to trigger Render deployment..."
git push origin main --force
echo "   ✅ Pushed to main"
echo ""

echo "=============================================="
echo "✅ Clean build complete and pushed!"
echo ""
echo "🔄 Render should now deploy the new build"
echo "⏳ Wait 3-5 minutes for deployment"
echo ""
echo "To monitor deployment:"
echo "   ./monitor-deployment.sh"
echo ""
echo "Or check manually:"
echo "   https://dashboard.render.com"
echo ""
