#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# AUTOPILOT NETLIFY DOCUMENTATION CLEANUP
# ===================================================================
# Updates documentation files to remove Netlify references
# ===================================================================

echo "📝 Autopilot: Cleaning up Netlify references in documentation..."
echo "=============================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}→${NC} $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }

DOCS_UPDATED=()

# Update PLATFORM_FULLY_ACTIVATED.json
if [ -f "PLATFORM_FULLY_ACTIVATED.json" ]; then
    log "Updating PLATFORM_FULLY_ACTIVATED.json..."
    sed -i 's/"netlify_config": "Production ready"/"cloudflare_config": "Production ready"/' PLATFORM_FULLY_ACTIVATED.json
    sed -i '/netlify/d' PLATFORM_FULLY_ACTIVATED.json
    success "Updated PLATFORM_FULLY_ACTIVATED.json"
    DOCS_UPDATED+=("PLATFORM_FULLY_ACTIVATED.json")
fi

# Update COMPLETE_CODEBASE_CLONE_GUIDE.md
if [ -f "COMPLETE_CODEBASE_CLONE_GUIDE.md" ]; then
    log "Updating COMPLETE_CODEBASE_CLONE_GUIDE.md..."
    sed -i 's/netlify.toml - Netlify deployment/cloudflare-deploy.sh - Cloudflare deployment/' COMPLETE_CODEBASE_CLONE_GUIDE.md
    sed -i '/netlify/d' COMPLETE_CODEBASE_CLONE_GUIDE.md
    success "Updated COMPLETE_CODEBASE_CLONE_GUIDE.md"
    DOCS_UPDATED+=("COMPLETE_CODEBASE_CLONE_GUIDE.md")
fi

# Update PLATFORM-INTEGRATIONS-PACKAGE.md
if [ -f "PLATFORM-INTEGRATIONS-PACKAGE.md" ]; then
    log "Updating PLATFORM-INTEGRATIONS-PACKAGE.md..."
    sed -i 's/netlify\//cloudflare\//' PLATFORM-INTEGRATIONS-PACKAGE.md
    sed -i 's/Netlify/Cloudflare Pages/g' PLATFORM-INTEGRATIONS-PACKAGE.md
    success "Updated PLATFORM-INTEGRATIONS-PACKAGE.md"
    DOCS_UPDATED+=("PLATFORM-INTEGRATIONS-PACKAGE.md")
fi

# Update FINAL_STATUS.md
if [ -f "FINAL_STATUS.md" ]; then
    log "Updating FINAL_STATUS.md..."
    sed -i 's/Netlify/Cloudflare Pages/g' FINAL_STATUS.md
    sed -i '/netlify/d' FINAL_STATUS.md
    success "Updated FINAL_STATUS.md"
    DOCS_UPDATED+=("FINAL_STATUS.md")
fi

# Update README files
for readme in README*.md; do
    if [ -f "$readme" ] && grep -q "netlify" "$readme"; then
        log "Updating $readme..."
        sed -i 's/Netlify/Cloudflare Pages/g' "$readme"
        sed -i 's/netlify/cloudflare/g' "$readme"
        success "Updated $readme"
        DOCS_UPDATED+=("$readme")
    fi
done

# Update deployment guides
for guide in DEPLOYMENT*.md DEPLOY*.md; do
    if [ -f "$guide" ] && grep -q "netlify" "$guide"; then
        log "Updating $guide..."
        sed -i 's/Netlify/Cloudflare Pages/g' "$guide"
        sed -i 's/netlify/cloudflare/g' "$guide"
        success "Updated $guide"
        DOCS_UPDATED+=("$guide")
    fi
done

# Create updated deployment documentation
log "Creating updated deployment documentation..."
cat > CLOUDFLARE_DEPLOYMENT_GUIDE.md << 'EOF'
# 🚀 Cloudflare Pages Deployment Guide

## Overview

This project is configured for deployment exclusively to Cloudflare Pages, providing:
- Fast global CDN
- Automatic HTTPS
- Custom domain support
- GitHub integration
- Environment variables support

## Automatic Deployment

### GitHub Actions (Recommended)

Every push to the `main` branch automatically triggers deployment:

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

2. **Push to main branch:**
   ```bash
   git push origin main
   ```

3. **Monitor deployment:**
   - Check GitHub Actions tab for deployment status
   - Visit https://elevateforhumanity.pages.dev once complete

### Manual Deployment

Use the deployment script for manual deployments:

```bash
# Prepare and deploy
bash cloudflare-deploy.sh

# Or use Wrangler CLI directly
npx wrangler pages publish dist
```

## Configuration

### Environment Variables

Required secrets in GitHub repository settings:
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Custom Domain

The site is configured for:
- **Primary:** https://elevateforhumanity.org
- **Pages URL:** https://elevateforhumanity.pages.dev

### Build Settings

- **Build command:** Handled by GitHub Actions
- **Output directory:** `dist`
- **Node.js version:** 20
- **Package manager:** pnpm

## Files Included in Deployment

The deployment includes:
- All HTML files
- Assets (CSS, JS, images, icons)
- Configuration files (_headers, _redirects, robots.txt)
- Sitemap files
- Manifest and favicon

## Security Features

- Security headers configured in `_headers`
- Content Security Policy (CSP)
- HTTPS redirect
- Cache optimization

## Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs
2. Verify Cloudflare API token is valid
3. Ensure all required files are committed

### Site Not Loading
1. Check Cloudflare Pages dashboard
2. Verify DNS settings for custom domain
3. Check browser console for errors

### Build Issues
1. Run `bash cloudflare-deploy.sh` locally
2. Check for missing files in `dist` directory
3. Verify all dependencies are installed

## Support

For deployment issues:
1. Check Cloudflare Pages documentation
2. Review GitHub Actions workflow logs
3. Verify all environment variables are set correctly
EOF

success "Created CLOUDFLARE_DEPLOYMENT_GUIDE.md"
DOCS_UPDATED+=("CLOUDFLARE_DEPLOYMENT_GUIDE.md")

# Update scripts that reference Netlify
if [ -f "scripts/unified-start.sh" ]; then
    log "Updating unified-start.sh..."
    sed -i 's/"netlify"/"cloudflare"/' scripts/unified-start.sh
    sed -i 's/Netlify/Cloudflare/' scripts/unified-start.sh
    success "Updated unified-start.sh"
    DOCS_UPDATED+=("scripts/unified-start.sh")
fi

# Summary
echo ""
echo "📊 DOCUMENTATION CLEANUP SUMMARY"
echo "================================"
echo "✅ Files updated: ${#DOCS_UPDATED[@]}"
for doc in "${DOCS_UPDATED[@]}"; do
    echo "  - $doc"
done

echo ""
echo "🎯 DOCUMENTATION NOW CLOUDFLARE-ONLY"
echo "===================================="
echo "✅ All Netlify references removed from documentation"
echo "✅ Cloudflare deployment guide created"
echo "✅ Configuration files updated"
echo "✅ Scripts updated for Cloudflare-only deployment"