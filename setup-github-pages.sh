#!/bin/bash

# 🚀 GitHub Pages Automated Setup Script
# This script helps configure GitHub Pages for the hub pages

set -e

echo "🚀 GitHub Pages Setup Script for Elevate for Humanity Hub Pages"
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository details
REPO_OWNER="elevateforhumanity"
REPO_NAME="new-ecosysstem"
CUSTOM_DOMAIN="hubs.elevateforhumanity.org"

echo -e "${BLUE}Repository:${NC} ${REPO_OWNER}/${REPO_NAME}"
echo -e "${BLUE}Custom Domain:${NC} ${CUSTOM_DOMAIN}"
echo ""

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI found${NC}"
    
    # Check if user is authenticated
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
        
        echo -e "${YELLOW}🔧 Attempting to enable GitHub Pages...${NC}"
        
        # Try to enable GitHub Pages with GitHub Actions source
        gh api \
          --method POST \
          -H "Accept: application/vnd.github+json" \
          "/repos/${REPO_OWNER}/${REPO_NAME}/pages" \
          -f source='{"branch":"main","path":"/hub-pages"}' \
          -f custom_domain="${CUSTOM_DOMAIN}" \
          -F https_enforced=true \
          && echo -e "${GREEN}✅ GitHub Pages enabled successfully!${NC}" \
          || echo -e "${YELLOW}⚠️  GitHub Pages may already be enabled or needs manual setup${NC}"
        
        # Check current Pages status
        echo -e "${BLUE}📊 Current GitHub Pages status:${NC}"
        gh api "/repos/${REPO_OWNER}/${REPO_NAME}/pages" 2>/dev/null || echo "Pages not yet configured"
        
    else
        echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
        echo "Please run: gh auth login"
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI not found${NC}"
    echo "Please install GitHub CLI: https://cli.github.com/"
fi

echo ""
echo -e "${BLUE}📋 Manual Setup Instructions:${NC}"
echo "If automated setup didn't work, please:"
echo "1. Go to: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/pages"
echo "2. Set Source to: 'GitHub Actions'"
echo "3. Set Custom domain to: '${CUSTOM_DOMAIN}'"
echo "4. Check 'Enforce HTTPS'"
echo "5. Click 'Save'"

echo ""
echo -e "${BLUE}🌐 DNS Configuration Required:${NC}"
echo "Add this CNAME record in Cloudflare:"
echo "  Type: CNAME"
echo "  Name: hubs"
echo "  Target: ${REPO_OWNER}.github.io"
echo "  Proxy: DNS only (gray cloud)"

echo ""
echo -e "${BLUE}🧪 Verification Commands:${NC}"
echo "After setup, test with:"
echo "  nslookup ${CUSTOM_DOMAIN}"
echo "  curl -I https://${CUSTOM_DOMAIN}"

echo ""
echo -e "${GREEN}🎯 Expected Hub Pages URLs:${NC}"
echo "  https://${CUSTOM_DOMAIN}/student-hub.html"
echo "  https://${CUSTOM_DOMAIN}/business-hub.html"
echo "  https://${CUSTOM_DOMAIN}/community-hub.html"
echo "  https://${CUSTOM_DOMAIN}/educator-hub.html"

echo ""
echo -e "${BLUE}⏰ Timeline:${NC}"
echo "  GitHub Pages activation: 2-5 minutes"
echo "  DNS propagation: 5-15 minutes"
echo "  SSL certificate: 5-10 minutes"
echo "  Full functionality: 15-30 minutes"

echo ""
echo "🚀 Setup script completed!"