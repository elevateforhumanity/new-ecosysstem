#!/bin/bash
set -e

echo "🧪 Testing Deployment Build..."
echo ""

# Clean
echo "1. Cleaning..."
rm -rf node_modules/.cache dist .vite

# Install
echo "2. Installing dependencies..."
NODE_ENV=production CI=true pnpm install --frozen-lockfile

# Build
echo "3. Building..."
NODE_ENV=production CI=true pnpm run build

# Verify
echo "4. Verifying build..."
if [ ! -d "dist" ]; then
  echo "❌ dist folder not created"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "❌ index.html not found"
  exit 1
fi

if [ ! -d "dist/assets" ]; then
  echo "❌ assets folder not found"
  exit 1
fi

echo ""
echo "✅ Build successful!"
echo "📦 Dist size: $(du -sh dist | cut -f1)"
echo "📄 HTML files: $(find dist -name '*.html' | wc -l)"
echo "🎨 Assets: $(ls dist/assets | wc -l)"
echo ""
echo "Ready for deployment!"
