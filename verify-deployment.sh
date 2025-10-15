#!/bin/bash
# Verify LMS Deployment
# Comprehensive health check for all services

set -e

echo "🏥 LMS Deployment Health Check"
echo "==============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to check URL
check_url() {
    local url=$1
    local name=$2
    local expected_code=${3:-200}
    
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $response, expected $expected_code)"
        ((FAILED++))
        return 1
    fi
}

# Function to check JSON response
check_json() {
    local url=$1
    local name=$2
    local field=$3
    local expected=$4
    
    echo -n "Checking $name... "
    
    response=$(curl -s "$url" 2>/dev/null || echo "{}")
    value=$(echo "$response" | grep -o "\"$field\":\"[^\"]*\"" | cut -d'"' -f4 || echo "")
    
    if [ "$value" = "$expected" ]; then
        echo -e "${GREEN}✅ OK${NC} ($field=$value)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} ($field=$value, expected $expected)"
        ((FAILED++))
        return 1
    fi
}

echo "📋 Pre-flight Checks"
echo "===================="
echo ""

# Check if build exists
if [ -d "dist" ]; then
    echo -e "${GREEN}✅${NC} dist/ directory exists"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} dist/ directory missing - run 'npm run build'"
    ((FAILED++))
fi

# Check backend dependencies
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅${NC} Backend dependencies installed"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}  Backend dependencies not installed"
    ((WARNINGS++))
fi

# Check frontend dependencies
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅${NC} Frontend dependencies installed"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Frontend dependencies not installed"
    ((FAILED++))
fi

echo ""
echo "🗄️  Database Checks"
echo "==================="
echo ""

# Check if migrations exist
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
if [ "$MIGRATION_COUNT" -ge 12 ]; then
    echo -e "${GREEN}✅${NC} All $MIGRATION_COUNT migrations present"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}  Only $MIGRATION_COUNT migrations found (expected 12)"
    ((WARNINGS++))
fi

echo ""
echo "🔧 Configuration Checks"
echo "======================="
echo ""

# Check environment files
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅${NC} .env.example exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}  .env.example missing"
    ((WARNINGS++))
fi

if [ -f "backend/.env.example" ]; then
    echo -e "${GREEN}✅${NC} backend/.env.example exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}  backend/.env.example missing"
    ((WARNINGS++))
fi

# Check render.yaml
if [ -f "render.yaml" ]; then
    echo -e "${GREEN}✅${NC} render.yaml exists"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} render.yaml missing"
    ((FAILED++))
fi

# Check wrangler.toml
if [ -f "wrangler.toml" ]; then
    echo -e "${GREEN}✅${NC} wrangler.toml exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}  wrangler.toml missing"
    ((WARNINGS++))
fi

echo ""
echo "🧪 Testing Local Backend (if running)"
echo "======================================"
echo ""

# Try to check local backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    check_url "http://localhost:3001/health" "Local backend health"
    check_json "http://localhost:3001/health" "Local backend status" "status" "ok"
else
    echo -e "${YELLOW}⚠️${NC}  Local backend not running (this is OK if deploying to Render)"
    ((WARNINGS++))
fi

echo ""
echo "🌐 Testing Production Endpoints (if deployed)"
echo "=============================================="
echo ""

# Check if user wants to test production
read -p "Do you have production URLs to test? (y/n): " test_prod

if [ "$test_prod" = "y" ] || [ "$test_prod" = "Y" ]; then
    echo ""
    read -p "Enter Render backend URL (e.g., https://efh-lms-backend.onrender.com): " BACKEND_URL
    read -p "Enter Cloudflare Pages URL (e.g., https://elevateforhumanity.pages.dev): " FRONTEND_URL
    
    echo ""
    echo "Testing backend..."
    check_url "$BACKEND_URL/health" "Backend health"
    check_url "$BACKEND_URL/api/v1/courses" "Backend courses API"
    
    echo ""
    echo "Testing frontend..."
    check_url "$FRONTEND_URL" "Frontend home page"
    check_url "$FRONTEND_URL/about" "Frontend about page"
    check_url "$FRONTEND_URL/programs" "Frontend programs page"
    check_url "$FRONTEND_URL/lms" "Frontend LMS page"
else
    echo "Skipping production tests"
fi

echo ""
echo "📊 Summary"
echo "=========="
echo ""
echo -e "${GREEN}✅ Passed:${NC} $PASSED"
echo -e "${YELLOW}⚠️  Warnings:${NC} $WARNINGS"
echo -e "${RED}❌ Failed:${NC} $FAILED"
echo ""

TOTAL=$((PASSED + WARNINGS + FAILED))
SCORE=$((PASSED * 100 / TOTAL))

echo "Score: $SCORE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical checks passed!${NC}"
    echo ""
    echo "✅ Ready for deployment"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy backend: ./deploy-render.sh"
    echo "  2. Deploy frontend: ./deploy-cloudflare-pages.sh"
    echo "  3. Run migrations in Supabase dashboard"
    echo "  4. Test production deployment"
    exit 0
else
    echo -e "${RED}❌ Some checks failed${NC}"
    echo ""
    echo "Please fix the issues above before deploying"
    exit 1
fi
