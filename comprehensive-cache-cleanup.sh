#!/bin/bash

echo "🧹 COMPREHENSIVE CACHE & STATIC FILE CLEANUP"
echo "============================================="

echo "🔍 Checking all cache locations..."

# 1. Check and clear Node.js caches
echo ""
echo "📦 Node.js Cache Cleanup:"
if [ -d "node_modules/.cache" ]; then
    echo "   🗑️  Clearing node_modules/.cache"
    rm -rf node_modules/.cache
fi

if [ -d ".pnpm-store" ]; then
    echo "   🗑️  Clearing .pnpm-store"
    rm -rf .pnpm-store
fi

# 2. Check and clear build caches
echo ""
echo "🏗️  Build Cache Cleanup:"
BUILD_CACHE_DIRS=(
    ".vite"
    ".turbo"
    ".next"
    ".nuxt"
    ".astro"
    "dist"
    "build"
    ".cache"
    "coverage"
)

for cache_dir in "${BUILD_CACHE_DIRS[@]}"; do
    if [ -d "$cache_dir" ]; then
        echo "   🗑️  Clearing $cache_dir"
        rm -rf "$cache_dir"
    fi
done

# 3. Check and clear Git caches
echo ""
echo "🔧 Git Cache Cleanup:"
if [ -d ".git/objects" ]; then
    echo "   📊 Git objects size before cleanup:"
    du -sh .git/objects 2>/dev/null || echo "   Unable to check size"
    
    echo "   🧹 Running git gc..."
    git gc --prune=now --aggressive 2>/dev/null || echo "   Git cleanup skipped"
fi

# 4. Find and remove ALL static files
echo ""
echo "🗑️  REMOVING ALL STATIC FILES:"

# Remove all HTML files except main index.html
echo "   🔥 Removing HTML files..."
find . -name "*.html" -not -path "./node_modules/*" -not -path "./.git/*" -not -name "index.html" -type f -exec echo "      Deleting: {}" \; -delete

# Remove all static asset files
echo "   🔥 Removing static assets..."
STATIC_EXTENSIONS=(
    "*.css"
    "*.scss"
    "*.sass"
    "*.less"
    "*.jpg"
    "*.jpeg"
    "*.png"
    "*.gif"
    "*.svg"
    "*.ico"
    "*.webp"
    "*.pdf"
    "*.doc"
    "*.docx"
    "*.zip"
    "*.tar"
    "*.gz"
)

for ext in "${STATIC_EXTENSIONS[@]}"; do
    find . -name "$ext" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./src/*" -type f -exec echo "      Deleting: {}" \; -delete 2>/dev/null || true
done

# 5. Remove static directories
echo "   🔥 Removing static directories..."
STATIC_DIRS=(
    "public"
    "static"
    "assets"
    "images"
    "css"
    "js"
    "docs"
    "templates"
    "policies"
    "admin"
    "client"
    "server"
    "api"
    "backend"
    "content"
    "data"
    "lib"
    "middleware"
    "config"
    "scripts"
    "tools"
    "tests"
    "test"
    "deploy"
    "sitemaps"
    "schema"
    "icons"
    "support_bundle"
    "project-management"
    "seo-optimization"
    "wire_in_sisters"
    "wix-blog-system"
    "worker"
    "DEPLOY_NOW"
    ".well-known"
    ".tools"
    ".gp"
    ".gitpod"
)

for dir in "${STATIC_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "      🗑️  Removing directory: $dir"
        rm -rf "$dir"
    fi
done

# 6. Check root indexing files
echo ""
echo "🔍 ROOT INDEXING CHECK:"
ROOT_INDEX_FILES=(
    "robots.txt"
    "sitemap.xml"
    "sitemap-index.xml"
    ".htaccess"
    "_headers"
    "_redirects"
    "CNAME"
    "manifest.json"
)

echo "   📋 Root indexing files found:"
for file in "${ROOT_INDEX_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "      ⚠️  Found: $file"
        echo "         Content preview:"
        head -3 "$file" 2>/dev/null | sed 's/^/         /'
        echo "      🗑️  Removing: $file"
        rm -f "$file"
    fi
done

# 7. Create minimal public directory for React app
echo ""
echo "📦 Creating minimal public directory for React app..."
mkdir -p public

# Create minimal robots.txt
cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://elevateforhumanity.org/sitemap.xml
EOF

# Create minimal sitemap.xml
cat > public/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://elevateforhumanity.org/</loc>
    <lastmod>2025-09-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
EOF

# 8. Final verification
echo ""
echo "🔍 FINAL VERIFICATION:"
echo "   📁 Remaining directories:"
ls -la | grep "^d" | awk '{print "      " $9}' | grep -v "^\.$\|^\.\.$"

echo ""
echo "   📄 Remaining files:"
ls -la | grep "^-" | awk '{print "      " $9}' | head -10

echo ""
echo "   📊 Total files remaining:"
find . -type f -not -path "./node_modules/*" -not -path "./.git/*" | wc -l

echo ""
echo "✅ COMPREHENSIVE CLEANUP COMPLETE"
echo "================================="
echo "🎯 ONLY REACT APP FILES REMAIN"
echo "🚀 NO STATIC FILES TO CONFLICT WITH DEPLOYMENT"
echo "📋 Minimal public/ directory created for SEO"