#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Autopilot Build Verification"
echo "================================"
echo ""

WEB_DIR="${WEB_DIR:-.}"
DIST_DIR="${WEB_DIR}/dist"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
  local file=$1
  local required=$2
  
  if [ -f "$file" ]; then
    echo -e "   ${GREEN}✅${NC} $file"
    return 0
  else
    if [ "$required" = "true" ]; then
      echo -e "   ${RED}❌${NC} $file (REQUIRED)"
      ERRORS=$((ERRORS + 1))
      return 1
    else
      echo -e "   ${YELLOW}⚠️${NC}  $file (optional)"
      WARNINGS=$((WARNINGS + 1))
      return 0
    fi
  fi
}

# 1. Check source files
echo "1️⃣  Checking source files..."
check_file "${WEB_DIR}/index.html" true
check_file "${WEB_DIR}/vite.config.js" false || check_file "${WEB_DIR}/vite.config.ts" false
check_file "${WEB_DIR}/package.json" true
check_file "${WEB_DIR}/public/_redirects" true
check_file "${WEB_DIR}/public/_headers" false
echo ""

# 2. Check dist exists
echo "2️⃣  Checking dist directory..."
if [ -d "$DIST_DIR" ]; then
  echo -e "   ${GREEN}✅${NC} $DIST_DIR exists"
else
  echo -e "   ${RED}❌${NC} $DIST_DIR not found!"
  echo ""
  echo "Run: pnpm run build:frontend"
  exit 1
fi
echo ""

# 3. Check required dist files
echo "3️⃣  Checking required dist files..."
check_file "${DIST_DIR}/index.html" true
check_file "${DIST_DIR}/_redirects" true
check_file "${DIST_DIR}/_headers" false
echo ""

# 4. Verify index.html content
echo "4️⃣  Verifying index.html content..."
if [ -f "${DIST_DIR}/index.html" ]; then
  TITLE=$(grep -o "<title>.*</title>" "${DIST_DIR}/index.html" | head -1 || echo "")
  
  if [ -n "$TITLE" ]; then
    echo -e "   ${GREEN}✅${NC} Title found: $TITLE"
    
    if [[ "$TITLE" == *"Elevate for Humanity"* ]]; then
      echo -e "   ${GREEN}✅${NC} Title is correct"
    else
      echo -e "   ${YELLOW}⚠️${NC}  Title may need updating"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    echo -e "   ${RED}❌${NC} No title found in index.html"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check for root div
  if grep -q 'id="root"' "${DIST_DIR}/index.html"; then
    echo -e "   ${GREEN}✅${NC} Root div found"
  else
    echo -e "   ${RED}❌${NC} No root div found"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check for script tags
  if grep -q '<script' "${DIST_DIR}/index.html"; then
    echo -e "   ${GREEN}✅${NC} Script tags found"
  else
    echo -e "   ${RED}❌${NC} No script tags found"
    ERRORS=$((ERRORS + 1))
  fi
fi
echo ""

# 5. Verify _redirects content
echo "5️⃣  Verifying _redirects content..."
if [ -f "${DIST_DIR}/_redirects" ]; then
  if grep -q '/\* /index.html 200' "${DIST_DIR}/_redirects" || grep -q '/\*   /index.html   200' "${DIST_DIR}/_redirects"; then
    echo -e "   ${GREEN}✅${NC} SPA fallback rule found"
  else
    echo -e "   ${RED}❌${NC} SPA fallback rule missing"
    echo "   Expected: /* /index.html 200"
    ERRORS=$((ERRORS + 1))
  fi
  
  LINE_COUNT=$(wc -l < "${DIST_DIR}/_redirects")
  echo -e "   ${GREEN}✅${NC} $LINE_COUNT redirect rules"
fi
echo ""

# 6. Check assets directory
echo "6️⃣  Checking assets..."
if [ -d "${DIST_DIR}/assets" ]; then
  JS_COUNT=$(find "${DIST_DIR}/assets" -name "*.js" | wc -l)
  CSS_COUNT=$(find "${DIST_DIR}/assets" -name "*.css" | wc -l)
  echo -e "   ${GREEN}✅${NC} assets/ directory exists"
  echo -e "   ${GREEN}✅${NC} $JS_COUNT JavaScript files"
  echo -e "   ${GREEN}✅${NC} $CSS_COUNT CSS files"
else
  echo -e "   ${RED}❌${NC} assets/ directory not found"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 7. Check route-specific HTML files
echo "7️⃣  Checking route-specific HTML files..."
ROUTES=("programs" "lms" "hub" "connect" "get-started" "student" "meet" "drive" "calendar")
ROUTE_COUNT=0
for route in "${ROUTES[@]}"; do
  if [ -f "${DIST_DIR}/${route}/index.html" ]; then
    ROUTE_COUNT=$((ROUTE_COUNT + 1))
  fi
done
echo -e "   ${GREEN}✅${NC} $ROUTE_COUNT/${#ROUTES[@]} route HTML files found"
echo ""

# 8. Check file sizes
echo "8️⃣  Checking file sizes..."
if [ -f "${DIST_DIR}/index.html" ]; then
  SIZE=$(stat -f%z "${DIST_DIR}/index.html" 2>/dev/null || stat -c%s "${DIST_DIR}/index.html" 2>/dev/null || echo "0")
  if [ "$SIZE" -gt 100 ]; then
    echo -e "   ${GREEN}✅${NC} index.html size: $SIZE bytes"
  else
    echo -e "   ${RED}❌${NC} index.html too small: $SIZE bytes"
    ERRORS=$((ERRORS + 1))
  fi
fi
echo ""

# Summary
echo "================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warnings${NC}"
  fi
  echo ""
  echo "🚀 Build is ready for deployment!"
  exit 0
else
  echo -e "${RED}❌ $ERRORS errors found${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warnings${NC}"
  fi
  echo ""
  echo "🔧 Fix the errors above and rebuild:"
  echo "   pnpm run build:frontend"
  exit 1
fi
