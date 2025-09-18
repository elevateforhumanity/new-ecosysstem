#!/bin/bash

# Quick Deploy Script - Immediate Commit to Live
# Usage: ./quick-deploy.sh "Your commit message"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 QUICK DEPLOY TO LIVE SITE${NC}"
echo "=================================="

# Get commit message from argument or prompt
if [ -z "$1" ]; then
    echo -e "${YELLOW}Enter commit message:${NC}"
    read -r COMMIT_MSG
else
    COMMIT_MSG="$1"
fi

# Check if there are changes to commit
if git diff --quiet && git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  No changes detected. Nothing to deploy.${NC}"
    exit 0
fi

echo -e "${BLUE}📝 Commit message:${NC} $COMMIT_MSG"
echo ""

# Show what will be committed
echo -e "${BLUE}📋 Files to be committed:${NC}"
git status --porcelain
echo ""

# Add all changes
echo -e "${BLUE}📦 Adding all changes...${NC}"
git add .

# Commit changes
echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "$COMMIT_MSG

Co-authored-by: Ona <no-reply@ona.com>"

# Push to GitHub (triggers Netlify auto-deploy)
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
git push origin main

echo ""
echo -e "${GREEN}✅ SUCCESS! Changes pushed to GitHub${NC}"
echo -e "${GREEN}🌐 Netlify will auto-deploy in ~30 seconds${NC}"
echo ""
echo -e "${YELLOW}📊 Monitor deployment at:${NC}"
echo "   • Netlify Dashboard: https://app.netlify.com"
echo "   • GitHub Actions: https://github.com/elevateforhumanity/new-ecosysstem/actions"
echo ""
echo -e "${GREEN}🎉 Your changes will be LIVE shortly!${NC}"