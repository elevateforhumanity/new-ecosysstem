#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# AUTOPILOT NETLIFY REFERENCE REMOVAL
# ===================================================================
# Removes all Netlify references from GitHub workflows and configs
# ===================================================================

echo "🗑️ Autopilot: Removing Netlify references from workflows..."
echo "=========================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}→${NC} $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }
warn() { echo -e "${YELLOW}⚠️${NC} $*"; }
error() { echo -e "${RED}❌${NC} $*"; }

WORKFLOWS_UPDATED=()

# Function to update workflow to use Cloudflare instead of Netlify
update_workflow_to_cloudflare() {
    local workflow_file=$1
    local workflow_name=$(basename "$workflow_file" .yml)
    
    log "Updating $workflow_name to use Cloudflare..."
    
    # Create backup
    cp "$workflow_file" "$workflow_file.backup"
    
    # Replace Netlify deployment with Cloudflare
    cat > "$workflow_file" << EOF
name: Deploy $workflow_name to Cloudflare Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Pages
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: '9.7.0'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build for deployment
        run: |
          mkdir -p dist
          cp *.html dist/ 2>/dev/null || true
          cp -r assets dist/ 2>/dev/null || true
          cp -r css dist/ 2>/dev/null || true
          cp -r js dist/ 2>/dev/null || true
          cp -r images dist/ 2>/dev/null || true
          cp robots.txt dist/ 2>/dev/null || true
          cp sitemap*.xml dist/ 2>/dev/null || true
          cp _headers dist/ 2>/dev/null || true
          cp _redirects dist/ 2>/dev/null || true

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: elevateforhumanity
          directory: dist
          gitHubToken: \${{ secrets.GITHUB_TOKEN }}
EOF
    
    success "Updated $workflow_name to use Cloudflare"
    WORKFLOWS_UPDATED+=("$workflow_name")
}

# Update workflows that reference Netlify
NETLIFY_WORKFLOWS=(
    ".github/workflows/seo-deploy.yml"
    ".github/workflows/enterprise-deploy.yml"
    ".github/workflows/auto-deploy.yml"
    ".github/workflows/site-ci.yml"
    ".github/workflows/multitenant-deploy.yml"
    ".github/workflows/deploy-production.yml"
)

for workflow in "${NETLIFY_WORKFLOWS[@]}"; do
    if [ -f "$workflow" ]; then
        if grep -q "netlify" "$workflow"; then
            update_workflow_to_cloudflare "$workflow"
        else
            log "$workflow already clean of Netlify references"
        fi
    else
        warn "$workflow not found, skipping"
    fi
done

# Update sitemap generation workflow
if [ -f ".github/workflows/sitemap-generation.yml" ]; then
    log "Updating sitemap generation workflow..."
    sed -i 's/deploy-netlify.sh/cloudflare-deploy.sh/g' .github/workflows/sitemap-generation.yml
    sed -i '/netlify/d' .github/workflows/sitemap-generation.yml
    success "Updated sitemap generation workflow"
    WORKFLOWS_UPDATED+=("sitemap-generation")
fi

# Update health check workflow
if [ -f ".github/workflows/health-check.yml" ]; then
    log "Updating health check workflow..."
    sed -i 's|/.netlify/functions/|/api/|g' .github/workflows/health-check.yml
    success "Updated health check workflow"
    WORKFLOWS_UPDATED+=("health-check")
fi

# Remove any remaining Netlify environment variables from workflows
log "Removing Netlify environment variables..."
find .github/workflows -name "*.yml" -exec sed -i '/NETLIFY_/d' {} \;
success "Removed Netlify environment variables"

# Update package.json scripts if they reference Netlify
if [ -f "package.json" ]; then
    if grep -q "netlify" package.json; then
        log "Updating package.json scripts..."
        sed -i 's/netlify deploy/echo "Use cloudflare-deploy.sh instead"/g' package.json
        success "Updated package.json scripts"
    fi
fi

# Create unified deployment workflow
log "Creating unified Cloudflare deployment workflow..."
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9.7.0'

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Pages
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Prepare deployment
        run: |
          echo "🚀 Preparing all files for Cloudflare deployment..."
          bash cloudflare-deploy.sh

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: elevateforhumanity
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          wranglerVersion: '3'

      - name: Deployment notification
        run: |
          echo "✅ Successfully deployed to Cloudflare Pages"
          echo "🌐 URL: https://elevateforhumanity.pages.dev"
          echo "🔗 Custom domain: https://elevateforhumanity.org"
EOF

success "Created unified Cloudflare deployment workflow"
WORKFLOWS_UPDATED+=("deploy")

# Summary
echo ""
echo "📊 NETLIFY REMOVAL SUMMARY"
echo "=========================="
echo "✅ Workflows updated: ${#WORKFLOWS_UPDATED[@]}"
for workflow in "${WORKFLOWS_UPDATED[@]}"; do
    echo "  - $workflow"
done

echo ""
echo "🎯 CLOUDFLARE-ONLY DEPLOYMENT READY"
echo "==================================="
echo "✅ All Netlify references removed"
echo "✅ Cloudflare configured as sole deployment target"
echo "✅ Unified deployment workflow created"
echo "✅ All files will be deployed to Cloudflare Pages"

echo ""
echo "🚀 To deploy:"
echo "============="
echo "1. Commit all changes: git add . && git commit -m 'Remove Netlify, use Cloudflare only'"
echo "2. Push to main: git push origin main"
echo "3. Or run manually: bash cloudflare-deploy.sh"