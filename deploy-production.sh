#!/bin/bash
set -e

echo "🚀 Deploying High-End Polished Design System to Production"
echo "=========================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Merge to main
echo -e "${BLUE}📦 Step 1: Merging to main branch...${NC}"
git checkout main
git pull origin main
git merge copilot/fix-v-code-emviornment-issues --no-edit
echo -e "${GREEN}✅ Merged to main${NC}"
echo ""

# Step 2: Build frontend
echo -e "${BLUE}🔨 Step 2: Building frontend...${NC}"
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# Step 3: Verify sitemaps
echo -e "${BLUE}🗺️  Step 3: Verifying sitemaps...${NC}"
if [ -f "frontend/public/sitemap.xml" ]; then
    echo -e "${GREEN}✅ sitemap.xml found${NC}"
else
    echo -e "${YELLOW}⚠️  Generating sitemaps...${NC}"
    npm run sitemap:generate
fi
echo ""

# Step 4: Push to GitHub
echo -e "${BLUE}📤 Step 4: Pushing to GitHub...${NC}"
git push origin main
echo -e "${GREEN}✅ Pushed to GitHub${NC}"
echo ""

# Step 5: Verify deployment
echo -e "${BLUE}🔍 Step 5: Deployment verification...${NC}"
echo ""
echo "Render will automatically deploy from main branch."
echo ""
echo "After deployment completes, verify these URLs:"
echo "  • https://elevateforhumanity.org"
echo "  • https://elevateforhumanity.org/sitemap.xml"
echo "  • https://elevateforhumanity.org/robots.txt"
echo ""
echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo ""
echo "Monitor deployment at: https://dashboard.render.com"
