#!/usr/bin/env bash
# Aggressive Fix - Clear everything and rebuild from scratch

set -e

echo "🔥 AGGRESSIVE FIX MODE - Clearing all caches and rebuilding"
echo "============================================================"

# 1. Clear all build artifacts
echo ""
echo "1️⃣ Clearing build artifacts..."
rm -rf dist/
rm -rf .vite/
rm -rf node_modules/.vite/
rm -rf .cache/
rm -rf build/
echo "   ✅ Build artifacts cleared"

# 2. Clear node_modules and reinstall
echo ""
echo "2️⃣ Clearing node_modules..."
rm -rf node_modules/
rm -rf package-lock.json
echo "   ✅ node_modules cleared"

# 3. Fresh install
echo ""
echo "3️⃣ Fresh npm install..."
npm install
echo "   ✅ Dependencies installed"

# 4. Clear backend cache
echo ""
echo "4️⃣ Clearing backend cache..."
cd backend
rm -rf node_modules/
rm -rf package-lock.json
npm install
cd ..
echo "   ✅ Backend dependencies installed"

# 5. Build with no cache
echo ""
echo "5️⃣ Building with --force (no cache)..."
npm run build -- --force
echo "   ✅ Build complete"

# 6. Verify structured data in output
echo ""
echo "6️⃣ Verifying structured data..."
if grep -q "EducationalOrganization" dist/index.html; then
  echo "   ✅ Structured data found in dist/index.html"
else
  echo "   ❌ Structured data NOT found in dist/index.html"
fi

# 7. Check what's actually being served
echo ""
echo "7️⃣ Checking SSR output..."
if [ -f "dist/index.html" ]; then
  echo "   📄 dist/index.html exists"
  grep -o "@type" dist/index.html | wc -l | xargs echo "   Found schema types:"
else
  echo "   ❌ dist/index.html not found"
fi

echo ""
echo "✅ AGGRESSIVE FIX COMPLETE!"
echo ""
echo "Next: git add -A && git commit -m 'fix: aggressive rebuild' && git push"
