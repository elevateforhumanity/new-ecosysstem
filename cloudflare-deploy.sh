#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# CLOUDFLARE PAGES DEPLOYMENT SCRIPT
# ===================================================================
# Comprehensive deployment script for Cloudflare Pages
# Ensures all files are included and properly deployed
# ===================================================================

echo "🚀 Cloudflare Pages Deployment"
echo "=============================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${BLUE}→${NC} $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }
warn() { echo -e "${YELLOW}⚠️${NC} $*"; }

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

log "Preparing deployment to Cloudflare Pages..."

# Clean and create dist directory
log "Creating deployment directory..."
rm -rf dist
mkdir -p dist

# Copy all HTML files
log "Copying HTML files..."
cp *.html dist/ 2>/dev/null || warn "No HTML files found in root"

# Ensure index.html exists (use hub.html as fallback)
if [ ! -f "dist/index.html" ]; then
    if [ -f "hub.html" ]; then
        cp hub.html dist/index.html
        success "Using hub.html as index.html"
    else
        warn "No index.html or hub.html found"
    fi
fi

# Copy asset directories
log "Copying asset directories..."
for dir in assets css js images icons public branding; do
    if [ -d "$dir" ]; then
        cp -r "$dir" dist/
        success "Copied $dir directory"
    fi
done

# Copy configuration files
log "Copying configuration files..."
for file in robots.txt manifest.json _headers _redirects; do
    if [ -f "$file" ]; then
        cp "$file" dist/
        success "Copied $file"
    fi
done

# Copy sitemap files
log "Copying sitemap files..."
cp sitemap*.xml dist/ 2>/dev/null && success "Copied sitemap files" || warn "No sitemap files found"

# Copy any additional important files
log "Copying additional files..."
for file in favicon.ico apple-touch-icon.png; do
    if [ -f "$file" ]; then
        cp "$file" dist/
        success "Copied $file"
    fi
done

# Create _headers file for Cloudflare if it doesn't exist
if [ ! -f "dist/_headers" ]; then
    log "Creating _headers file for Cloudflare..."
    cat > dist/_headers << 'EOF'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.supabase.co; connect-src 'self' https://*.supabase.co https://api.stripe.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; frame-src https://js.stripe.com;

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: public, max-age=0, must-revalidate
EOF
    success "Created _headers file"
fi

# Create _redirects file for Cloudflare if it doesn't exist
if [ ! -f "dist/_redirects" ]; then
    log "Creating _redirects file for Cloudflare..."
    cat > dist/_redirects << 'EOF'
# Redirect www to non-www
https://www.elevateforhumanity.org/* https://elevateforhumanity.org/:splat 301!

# SPA routing
/lms /lms.html 200
/student-portal /lms.html 200
/connect /connect.html 200
/programs /programs.html 200
/about /about.html 200

# 404 fallback
/* /404.html 404
EOF
    success "Created _redirects file"
fi

# Display deployment summary
log "Deployment summary..."
echo ""
echo "📊 Files prepared for Cloudflare Pages:"
echo "======================================="
find dist -type f | sort | while read file; do
    echo "  ✓ $file"
done

echo ""
echo "📈 Deployment statistics:"
echo "========================"
echo "Total files: $(find dist -type f | wc -l)"
echo "Total size: $(du -sh dist | cut -f1)"

echo ""
echo "🎯 Next steps:"
echo "=============="
echo "1. Commit all changes to git"
echo "2. Push to main branch to trigger automatic deployment"
echo "3. Or manually deploy using: wrangler pages publish dist"

echo ""
success "Cloudflare Pages deployment preparation complete!"
echo "🌐 Your site will be available at: https://elevateforhumanity.pages.dev"
echo "🔗 Custom domain: https://elevateforhumanity.org"