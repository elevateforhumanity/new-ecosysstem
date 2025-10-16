#!/usr/bin/env bash
# Deploy LMS Backend - Automated Setup
set -euo pipefail

echo "🚀 LMS BACKEND DEPLOYMENT"
echo "========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
echo ""

if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo ""

# Step 2: Apply database migrations
echo "📝 Step 2: Database Migrations"
echo "================================"
echo ""
echo -e "${YELLOW}⚠️  MANUAL STEP REQUIRED${NC}"
echo ""
echo "You need to apply database migrations in Supabase:"
echo ""
echo "1. Open: https://supabase.com/dashboard/project/cuxzzpsyufcewtmicszk/sql/new"
echo ""
echo "2. Copy and run this SQL:"
echo "   File: supabase/migrations/002_lms_schema.sql"
echo ""
echo "3. Then copy and run this SQL:"
echo "   File: supabase/migrations/003_lms_seed_data.sql"
echo ""
read -p "Press ENTER when you've completed the migrations..."
echo ""

# Test Supabase connection
echo "🔍 Testing Supabase connection..."
SUPABASE_URL="https://cuxzzpsyufcewtmicszk.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA"

COURSES_COUNT=$(curl -s "${SUPABASE_URL}/rest/v1/courses?select=count" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" | jq -r '.[0].count // 0')

if [[ "$COURSES_COUNT" -gt 0 ]]; then
    echo -e "${GREEN}✅ Database migrations applied! Found $COURSES_COUNT courses${NC}"
else
    echo -e "${RED}❌ No courses found. Please apply migrations first.${NC}"
    exit 1
fi
echo ""

# Step 3: Deploy to Render
echo "📝 Step 3: Deploy to Render"
echo "============================"
echo ""
echo -e "${YELLOW}⚠️  MANUAL STEP REQUIRED${NC}"
echo ""
echo "Deploy your backend to Render.com:"
echo ""
echo "1. Open: https://dashboard.render.com/create?type=web"
echo ""
echo "2. Connect GitHub repository:"
echo "   Repository: elevateforhumanity/fix2"
echo ""
echo "3. Configure service:"
echo "   Name: efh-lms-backend"
echo "   Region: Oregon (US West)"
echo "   Branch: main"
echo "   Root Directory: backend"
echo "   Runtime: Node"
echo "   Build Command: npm install"
echo "   Start Command: npm start"
echo "   Instance Type: Free"
echo ""
echo "4. Add Environment Variables:"
echo "   SUPABASE_URL=${SUPABASE_URL}"
echo "   SUPABASE_ANON_KEY=${SUPABASE_KEY}"
echo "   NODE_ENV=production"
echo ""
echo "5. Click 'Create Web Service'"
echo ""
echo "6. Wait for deployment (2-3 minutes)"
echo ""
read -p "Enter your Render backend URL (e.g., https://efh-lms-backend.onrender.com): " BACKEND_URL
echo ""

# Validate backend URL
if [[ ! "$BACKEND_URL" =~ ^https?:// ]]; then
    echo -e "${RED}❌ Invalid URL format${NC}"
    exit 1
fi

# Remove trailing slash
BACKEND_URL="${BACKEND_URL%/}"

# Step 4: Test backend
echo "🧪 Step 4: Testing backend..."
echo ""

echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/health" || echo "000")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)

if [[ "$HEALTH_CODE" == "200" ]]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed (HTTP $HEALTH_CODE)${NC}"
    echo "   Backend may still be deploying. Wait 1-2 minutes and try again."
    exit 1
fi

echo ""
echo "Testing courses API..."
COURSES_RESPONSE=$(curl -s "${BACKEND_URL}/api/courses")
COURSES_SUCCESS=$(echo "$COURSES_RESPONSE" | jq -r '.success // false')

if [[ "$COURSES_SUCCESS" == "true" ]]; then
    COURSES_COUNT=$(echo "$COURSES_RESPONSE" | jq -r '.data | length')
    echo -e "${GREEN}✅ Courses API working! Found $COURSES_COUNT courses${NC}"
else
    echo -e "${RED}❌ Courses API failed${NC}"
    echo "   Response: $COURSES_RESPONSE"
    exit 1
fi

echo ""

# Step 5: Update frontend
echo "📝 Step 5: Update frontend configuration"
echo "========================================"
echo ""

# Update .env
if [[ -f .env ]]; then
    if grep -q "VITE_API_URL" .env; then
        sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=${BACKEND_URL}|" .env
        echo -e "${GREEN}✅ Updated .env${NC}"
    else
        echo "VITE_API_URL=${BACKEND_URL}" >> .env
        echo -e "${GREEN}✅ Added VITE_API_URL to .env${NC}"
    fi
else
    echo "VITE_API_URL=${BACKEND_URL}" > .env
    echo -e "${GREEN}✅ Created .env with VITE_API_URL${NC}"
fi

# Update .env.example
if ! grep -q "VITE_API_URL" .env.example; then
    echo "" >> .env.example
    echo "# ============================================" >> .env.example
    echo "# LMS BACKEND API" >> .env.example
    echo "# ============================================" >> .env.example
    echo "VITE_API_URL=https://efh-lms-backend.onrender.com" >> .env.example
    echo -e "${GREEN}✅ Updated .env.example${NC}"
fi

echo ""

# Step 6: Add GitHub Secret
echo "📝 Step 6: Add GitHub Secret"
echo "============================="
echo ""

if command -v gh &> /dev/null; then
    echo "Adding VITE_API_URL to GitHub Secrets..."
    if gh secret set VITE_API_URL -b"${BACKEND_URL}" 2>/dev/null; then
        echo -e "${GREEN}✅ GitHub Secret added${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not add GitHub Secret automatically${NC}"
        echo "   Add manually: https://github.com/elevateforhumanity/fix2/settings/secrets/actions"
        echo "   Name: VITE_API_URL"
        echo "   Value: ${BACKEND_URL}"
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI not available${NC}"
    echo "   Add secret manually: https://github.com/elevateforhumanity/fix2/settings/secrets/actions"
    echo "   Name: VITE_API_URL"
    echo "   Value: ${BACKEND_URL}"
fi

echo ""

# Summary
echo "================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "📊 Summary:"
echo "   Backend URL: ${BACKEND_URL}"
echo "   Database: ✅ Migrated"
echo "   API: ✅ Working"
echo "   Frontend: ✅ Configured"
echo ""
echo "🔗 Test your backend:"
echo "   Health: ${BACKEND_URL}/health"
echo "   Courses: ${BACKEND_URL}/api/courses"
echo ""
echo "🚀 Next steps:"
echo "   1. Commit changes: git add .env.example && git commit -m 'feat: Add backend URL'"
echo "   2. Push to deploy: git push origin main"
echo "   3. Test LMS: https://elevateforhumanity.pages.dev/lms"
echo ""
echo "📚 API Documentation: See DEPLOY-BACKEND.md"
echo ""
