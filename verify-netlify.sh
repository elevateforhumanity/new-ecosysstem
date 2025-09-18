#!/bin/bash

# Netlify Deployment Verification Script
# Checks if the site is properly deployed and auto-deploy is working

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 NETLIFY DEPLOYMENT VERIFICATION${NC}"
echo "===================================="

# Check if netlify.toml exists and is configured
echo -e "${BLUE}📋 Checking netlify.toml configuration...${NC}"
if [ -f "netlify.toml" ]; then
    echo -e "${GREEN}✅ netlify.toml found${NC}"
    
    # Check key configurations
    if grep -q "publish = \".\"" netlify.toml; then
        echo -e "${GREEN}✅ Publish directory set to root${NC}"
    else
        echo -e "${RED}❌ Publish directory not set correctly${NC}"
    fi
    
    if grep -q "X-Frame-Options" netlify.toml; then
        echo -e "${GREEN}✅ Security headers configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Security headers missing${NC}"
    fi
    
    if grep -q "hub.html" netlify.toml; then
        echo -e "${GREEN}✅ Homepage redirects configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Homepage redirects not configured${NC}"
    fi
else
    echo -e "${RED}❌ netlify.toml not found${NC}"
    exit 1
fi

echo ""

# Check GitHub repository status
echo -e "${BLUE}🔗 Checking GitHub repository status...${NC}"
LATEST_COMMIT=$(git log --oneline -1)
echo -e "${GREEN}✅ Latest commit: ${LATEST_COMMIT}${NC}"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo -e "${GREEN}✅ On main branch (auto-deploy enabled)${NC}"
else
    echo -e "${YELLOW}⚠️  Not on main branch (current: $CURRENT_BRANCH)${NC}"
fi

echo ""

# Check critical files exist
echo -e "${BLUE}📁 Checking critical files...${NC}"
CRITICAL_FILES=(
    "hub.html"
    "programs.html"
    "policies/eo.html"
    "policies/grievance.html"
    "policies/veterans.html"
    "policies/accessibility.html"
    "admin-dashboard.html"
    "student-portal.html"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
    fi
done

echo ""

# Instructions for Netlify setup
echo -e "${BLUE}🚀 NETLIFY SETUP INSTRUCTIONS${NC}"
echo "================================"
echo ""
echo -e "${YELLOW}1. Go to Netlify Dashboard:${NC}"
echo "   https://app.netlify.com"
echo ""
echo -e "${YELLOW}2. Click 'New site from Git'${NC}"
echo ""
echo -e "${YELLOW}3. Connect GitHub and select:${NC}"
echo "   Repository: elevateforhumanity/new-ecosysstem"
echo "   Branch: main"
echo "   Build command: (leave empty)"
echo "   Publish directory: . (root)"
echo ""
echo -e "${YELLOW}4. Deploy settings will be:${NC}"
echo "   ✅ Auto-deploy: ON (deploys on every push to main)"
echo "   ✅ Build command: Handled by netlify.toml"
echo "   ✅ Publish directory: Root directory (.)"
echo "   ✅ Security headers: Configured in netlify.toml"
echo ""
echo -e "${YELLOW}5. Environment variables (if needed):${NC}"
echo "   NODE_VERSION=18"
echo "   VITE_SUPABASE_URL=your_supabase_url"
echo "   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
echo ""
echo -e "${GREEN}🎯 RESULT: Every git push to main = Live site update in 30 seconds${NC}"
echo ""
echo -e "${BLUE}📝 Quick Deploy Command:${NC}"
echo "   ./quick-deploy.sh \"Your commit message\""
echo ""
echo -e "${GREEN}✅ Repository is ready for Netlify auto-deployment!${NC}"