#!/bin/bash
set -e

echo "🔍 Deployment Verification Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Build succeeds
echo "1️⃣  Testing build..."
if pnpm build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    tail -20 /tmp/build.log
    exit 1
fi

# Check 2: Required files exist
echo ""
echo "2️⃣  Checking required files..."
REQUIRED_FILES=(
    "dist/index.html"
    "dist/_redirects"
    "dist/_headers"
    "dist/404.html"
    "dist/sitemap.xml"
    "dist/robots.txt"
    "serve-static.cjs"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        exit 1
    fi
done

# Check 3: serve-static.cjs runs
echo ""
echo "3️⃣  Testing serve-static.cjs..."
if timeout 3 node serve-static.cjs > /tmp/server.log 2>&1 & then
    sleep 2
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server starts and responds${NC}"
        pkill -f serve-static || true
    else
        echo -e "${RED}❌ Server not responding${NC}"
        cat /tmp/server.log
        exit 1
    fi
else
    echo -e "${RED}❌ Server failed to start${NC}"
    cat /tmp/server.log
    exit 1
fi

# Check 4: Environment variables
echo ""
echo "4️⃣  Checking environment variables in render.yaml..."
if grep -q "VITE_SUPABASE_URL" render.yaml && grep -q "VITE_SUPABASE_ANON_KEY" render.yaml; then
    echo -e "${GREEN}✅ Supabase env vars configured${NC}"
else
    echo -e "${RED}❌ Missing Supabase env vars${NC}"
    exit 1
fi

# Check 5: Dependencies
echo ""
echo "5️⃣  Checking dependencies..."
if grep -q '"compression"' package.json; then
    echo -e "${GREEN}✅ compression dependency present${NC}"
else
    echo -e "${RED}❌ Missing compression dependency${NC}"
    exit 1
fi

# Check 6: Route files
echo ""
echo "6️⃣  Checking route-specific HTML files..."
ROUTES=("programs" "lms" "hub" "connect" "get-started")
for route in "${ROUTES[@]}"; do
    if [ -f "dist/$route/index.html" ]; then
        echo -e "${GREEN}✅ dist/$route/index.html${NC}"
    else
        echo -e "${YELLOW}⚠️  Missing: dist/$route/index.html (optional)${NC}"
    fi
done

echo ""
echo "=================================="
echo -e "${GREEN}🎉 All deployment checks passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin $(git branch --show-current)"
echo "2. Render will auto-deploy from render.yaml"
echo "3. For Cloudflare Pages, see CLOUDFLARE_PAGES_SETUP.md"
echo ""
