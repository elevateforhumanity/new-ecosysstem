#!/bin/bash

# Cloudflare Pages Deployment Script
# Automated deployment with compliance checks

set -e

echo "🚀 Starting Cloudflare deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}❌ CLOUDFLARE_API_TOKEN not set${NC}"
    echo "Set it with: export CLOUDFLARE_API_TOKEN=your_token"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ CLOUDFLARE_ACCOUNT_ID not set${NC}"
    echo "Set it with: export CLOUDFLARE_ACCOUNT_ID=your_account_id"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

# Run compliance checks
echo -e "${YELLOW}🔍 Running compliance checks...${NC}"
npm run compliance:check || echo -e "${YELLOW}⚠️  Compliance check warnings (continuing)${NC}"

# Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Deploy to Cloudflare Pages
echo -e "${YELLOW}☁️  Deploying to Cloudflare Pages...${NC}"

# Install Wrangler if not already installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing Wrangler..."
    npm install -g wrangler
fi

# Deploy using Wrangler
wrangler pages deploy dist --project-name=elevateforhumanity

# Purge Cloudflare cache
echo -e "${YELLOW}🧹 Purging Cloudflare cache...${NC}"
if [ ! -z "$CLOUDFLARE_ZONE_ID" ]; then
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data '{"purge_everything":true}' \
      --silent --output /dev/null
    echo -e "${GREEN}✅ Cache purged${NC}"
else
    echo -e "${YELLOW}⚠️  CLOUDFLARE_ZONE_ID not set, skipping cache purge${NC}"
fi

# Generate and upload sitemap
echo -e "${YELLOW}🗺️  Generating sitemap...${NC}"
npm run sitemap:generate || echo -e "${YELLOW}⚠️  Sitemap generation skipped${NC}"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "🌐 Your site should be live at: https://elevateforhumanity.org"
echo ""
echo "Next steps:"
echo "1. Verify deployment at Cloudflare dashboard"
echo "2. Check compliance status"
echo "3. Test all pages and functionality"
echo "4. Monitor analytics"
