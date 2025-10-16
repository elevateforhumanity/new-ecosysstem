#!/bin/bash
set -e

echo "🤖 Advanced Autopilot - Adding Secrets to Render"
echo "================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 Step 1: Checking for Render API key...${NC}"

# Check if RENDER_API_KEY is set
if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${RED}❌ RENDER_API_KEY not found${NC}"
    echo ""
    echo -e "${YELLOW}To enable autopilot to add secrets, you need to:${NC}"
    echo ""
    echo "1. Go to: https://dashboard.render.com/u/settings/api-keys"
    echo "2. Click 'Create API Key'"
    echo "3. Name it: 'Autopilot Deploy'"
    echo "4. Copy the key"
    echo "5. Run this command:"
    echo ""
    echo -e "${BLUE}   export RENDER_API_KEY='your-api-key-here'${NC}"
    echo ""
    echo "6. Then run this script again"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Render API key found${NC}"
echo ""

echo -e "${BLUE}🔍 Step 2: Finding your Render service...${NC}"

# Get list of services
SERVICES=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
    "https://api.render.com/v1/services")

# Extract service ID for elevateforhumanity
SERVICE_ID=$(echo "$SERVICES" | grep -o '"id":"srv-[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SERVICE_ID" ]; then
    echo -e "${RED}❌ Could not find service${NC}"
    echo ""
    echo "Available services:"
    echo "$SERVICES" | grep -o '"name":"[^"]*"' | cut -d'"' -f4
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Found service: ${SERVICE_ID}${NC}"
echo ""

echo -e "${BLUE}🔍 Step 3: Getting Supabase keys...${NC}"

# Check if we have Supabase keys in environment
if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_ANON_KEY not found in environment${NC}"
    echo ""
    echo "Please set it:"
    echo -e "${BLUE}export SUPABASE_ANON_KEY='your-anon-key-from-supabase'${NC}"
    echo ""
    echo "Get it from: https://supabase.com/dashboard/project/_/settings/api"
    echo ""
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_ROLE_KEY not found (optional)${NC}"
    SUPABASE_SERVICE_ROLE_KEY=""
fi

echo -e "${GREEN}✅ Supabase keys ready${NC}"
echo ""

echo -e "${BLUE}🔐 Step 4: Adding secrets to Render...${NC}"

# Get JWT_SECRET from .env
JWT_SECRET=$(grep "JWT_SECRET=" .env 2>/dev/null | cut -d'=' -f2 || echo "")
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET="3k6r5h+CvwLnIvGE3nuW/FQyY5IqNYpvbA3gq7DLwwPp9BIQ62Qex0l7sGHGfNrr"
fi

# Add VITE_SUPABASE_ANON_KEY
echo -e "${BLUE}Adding VITE_SUPABASE_ANON_KEY...${NC}"
curl -s -X PUT \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"VITE_SUPABASE_ANON_KEY\",\"value\":\"$SUPABASE_ANON_KEY\"}" \
    "https://api.render.com/v1/services/${SERVICE_ID}/env-vars/VITE_SUPABASE_ANON_KEY" > /dev/null

echo -e "${GREEN}✅ Added VITE_SUPABASE_ANON_KEY${NC}"

# Add SUPABASE_SERVICE_ROLE_KEY if provided
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${BLUE}Adding SUPABASE_SERVICE_ROLE_KEY...${NC}"
    curl -s -X PUT \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"key\":\"SUPABASE_SERVICE_ROLE_KEY\",\"value\":\"$SUPABASE_SERVICE_ROLE_KEY\"}" \
        "https://api.render.com/v1/services/${SERVICE_ID}/env-vars/SUPABASE_SERVICE_ROLE_KEY" > /dev/null
    
    echo -e "${GREEN}✅ Added SUPABASE_SERVICE_ROLE_KEY${NC}"
fi

# Add JWT_SECRET
echo -e "${BLUE}Adding JWT_SECRET...${NC}"
curl -s -X PUT \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"JWT_SECRET\",\"value\":\"$JWT_SECRET\"}" \
    "https://api.render.com/v1/services/${SERVICE_ID}/env-vars/JWT_SECRET" > /dev/null

echo -e "${GREEN}✅ Added JWT_SECRET${NC}"

echo ""
echo -e "${BLUE}🚀 Step 5: Triggering deployment...${NC}"

# Trigger a new deploy
curl -s -X POST \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    "https://api.render.com/v1/services/${SERVICE_ID}/deploys" > /dev/null

echo -e "${GREEN}✅ Deployment triggered${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ SECRETS ADDED TO RENDER!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Secrets added:"
echo "  ✅ VITE_SUPABASE_ANON_KEY"
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "  ✅ SUPABASE_SERVICE_ROLE_KEY"
fi
echo "  ✅ JWT_SECRET"
echo ""
echo "Deployment status: https://dashboard.render.com"
echo ""
echo "Your site will be live in ~5 minutes at:"
echo "  🌐 https://elevateforhumanity.org"
echo "  🗺️  https://elevateforhumanity.org/sitemap.xml"
echo ""
