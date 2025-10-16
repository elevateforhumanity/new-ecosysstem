#!/usr/bin/env bash
# Diagnostic: Routing and Dynamic Pages Structure

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ROUTING & DYNAMIC PAGES DIAGNOSTIC                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ISSUES=0
WARNINGS=0

# ============================================
# TEST 1: Check App.jsx exists and is valid
# ============================================
echo "TEST 1: Checking App.jsx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "src/App.jsx" ]; then
  log_success "App.jsx exists"
  
  # Check if it has Routes
  if grep -q "Routes" src/App.jsx; then
    log_success "Routes component found"
  else
    log_error "Routes component not found"
    ISSUES=$((ISSUES + 1))
  fi
  
  # Check if it has BrowserRouter
  if grep -q "BrowserRouter\|Router" src/App.jsx; then
    log_success "Router configured"
  else
    log_error "Router not configured"
    ISSUES=$((ISSUES + 1))
  fi
else
  log_error "App.jsx not found"
  ISSUES=$((ISSUES + 1))
fi

echo ""

# ============================================
# TEST 2: Extract all lazy imports from App.jsx
# ============================================
echo "TEST 2: Analyzing Lazy Imports"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "src/App.jsx" ]; then
  log_info "Extracting lazy imports..."
  
  # Extract all lazy imports
  grep "lazy(() => import" src/App.jsx | sed 's/.*import("\([^"]*\)").*/\1/' > /tmp/lazy_imports.txt
  
  TOTAL_IMPORTS=$(wc -l < /tmp/lazy_imports.txt)
  log_info "Found $TOTAL_IMPORTS lazy imports"
  
  echo ""
  log_info "Checking if imported files exist..."
  
  MISSING=0
  while IFS= read -r import_path; do
    # Convert import path to file path
    file_path="src/${import_path}.jsx"
    file_path_tsx="src/${import_path}.tsx"
    
    if [ -f "$file_path" ] || [ -f "$file_path_tsx" ]; then
      echo "  ✅ $(basename $import_path)"
    else
      echo "  ❌ $(basename $import_path) - FILE MISSING"
      MISSING=$((MISSING + 1))
    fi
  done < /tmp/lazy_imports.txt
  
  echo ""
  if [ $MISSING -eq 0 ]; then
    log_success "All imported files exist"
  else
    log_error "$MISSING imported files are missing"
    ISSUES=$((ISSUES + MISSING))
  fi
fi

echo ""

# ============================================
# TEST 3: Check Route Definitions
# ============================================
echo "TEST 3: Checking Route Definitions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "src/App.jsx" ]; then
  # Count Route components
  ROUTE_COUNT=$(grep -c "<Route" src/App.jsx || echo "0")
  log_info "Found $ROUTE_COUNT route definitions"
  
  # Check for common routes
  declare -a EXPECTED_ROUTES=("/" "/login" "/courses" "/dashboard" "/lms")
  
  for route in "${EXPECTED_ROUTES[@]}"; do
    if grep -q "path=\"$route\"" src/App.jsx; then
      echo "  ✅ Route: $route"
    else
      echo "  ⚠️  Route: $route (not found)"
      WARNINGS=$((WARNINGS + 1))
    fi
  done
fi

echo ""

# ============================================
# TEST 4: Check for Duplicate Pages
# ============================================
echo "TEST 4: Checking for Duplicate Pages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Looking for duplicate page names..."

# Find pages with both .jsx and .tsx versions
for jsx_file in src/pages/*.jsx; do
  if [ -f "$jsx_file" ]; then
    basename=$(basename "$jsx_file" .jsx)
    tsx_file="src/pages/${basename}.tsx"
    
    if [ -f "$tsx_file" ]; then
      echo "  ⚠️  Duplicate: $basename (.jsx and .tsx)"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi
done

echo ""

# ============================================
# TEST 5: Check Page Structure
# ============================================
echo "TEST 5: Checking Page Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Analyzing page exports..."

INVALID_PAGES=0
for file in src/pages/*.jsx src/pages/*.tsx; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    
    # Check if page has export default
    if ! grep -q "export default" "$file"; then
      echo "  ❌ $filename - Missing 'export default'"
      INVALID_PAGES=$((INVALID_PAGES + 1))
    fi
  fi
done

if [ $INVALID_PAGES -eq 0 ]; then
  log_success "All pages have proper exports"
else
  log_error "$INVALID_PAGES pages missing proper exports"
  ISSUES=$((ISSUES + INVALID_PAGES))
fi

echo ""

# ============================================
# TEST 6: Check Router Configuration
# ============================================
echo "TEST 6: Checking Router Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "src/router.jsx" ] || [ -f "src/router.tsx" ]; then
  log_success "Separate router file found"
  
  ROUTER_FILE=$([ -f "src/router.jsx" ] && echo "src/router.jsx" || echo "src/router.tsx")
  
  if grep -q "createBrowserRouter\|BrowserRouter" "$ROUTER_FILE"; then
    log_success "Router properly configured"
  else
    log_warning "Router configuration unclear"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  log_info "No separate router file (routes in App.jsx)"
fi

echo ""

# ============================================
# TEST 7: Check for Missing Components
# ============================================
echo "TEST 7: Checking for Missing Components"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

declare -a COMMON_COMPONENTS=("NavBar" "Footer" "ErrorBoundary" "ProtectedRoute")

for component in "${COMMON_COMPONENTS[@]}"; do
  if [ -f "src/components/${component}.jsx" ] || [ -f "src/components/${component}.tsx" ]; then
    echo "  ✅ $component"
  else
    echo "  ⚠️  $component (not found)"
    WARNINGS=$((WARNINGS + 1))
  fi
done

echo ""

# ============================================
# TEST 8: Check Index/Entry Point
# ============================================
echo "TEST 8: Checking Entry Point"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "src/main.jsx" ] || [ -f "src/main.tsx" ]; then
  MAIN_FILE=$([ -f "src/main.jsx" ] && echo "src/main.jsx" || echo "src/main.tsx")
  log_success "Entry point found: $MAIN_FILE"
  
  # Check if it imports App
  if grep -q "import.*App" "$MAIN_FILE"; then
    log_success "App component imported"
  else
    log_error "App component not imported"
    ISSUES=$((ISSUES + 1))
  fi
  
  # Check if it renders to DOM
  if grep -q "createRoot\|render" "$MAIN_FILE"; then
    log_success "DOM rendering configured"
  else
    log_error "DOM rendering not configured"
    ISSUES=$((ISSUES + 1))
  fi
else
  log_error "Entry point (main.jsx/tsx) not found"
  ISSUES=$((ISSUES + 1))
fi

echo ""

# ============================================
# TEST 9: Check index.html
# ============================================
echo "TEST 9: Checking index.html"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "index.html" ]; then
  log_success "index.html exists"
  
  # Check for root div
  if grep -q 'id="root"' index.html; then
    log_success "Root div found"
  else
    log_error "Root div not found"
    ISSUES=$((ISSUES + 1))
  fi
  
  # Check for script tag
  if grep -q "src=\"/src/main" index.html; then
    log_success "Script tag references main entry point"
  else
    log_warning "Script tag may not reference correct entry point"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  log_error "index.html not found"
  ISSUES=$((ISSUES + 1))
fi

echo ""

# ============================================
# TEST 10: Check Vite Configuration
# ============================================
echo "TEST 10: Checking Vite Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
  VITE_CONFIG=$([ -f "vite.config.js" ] && echo "vite.config.js" || echo "vite.config.ts")
  log_success "Vite config found: $VITE_CONFIG"
  
  # Check for React plugin
  if grep -q "@vitejs/plugin-react" "$VITE_CONFIG"; then
    log_success "React plugin configured"
  else
    log_error "React plugin not configured"
    ISSUES=$((ISSUES + 1))
  fi
else
  log_error "Vite config not found"
  ISSUES=$((ISSUES + 1))
fi

echo ""

# ============================================
# DETAILED ANALYSIS: Missing Pages
# ============================================
echo "DETAILED ANALYSIS: Missing Pages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "src/App.jsx" ]; then
  log_info "Pages referenced in App.jsx but missing:"
  echo ""
  
  grep "lazy(() => import" src/App.jsx | sed 's/.*import("\([^"]*\)").*/\1/' | while IFS= read -r import_path; do
    file_path="src/${import_path}.jsx"
    file_path_tsx="src/${import_path}.tsx"
    
    if [ ! -f "$file_path" ] && [ ! -f "$file_path_tsx" ]; then
      page_name=$(basename "$import_path")
      echo "  ❌ $page_name"
      echo "     Expected: $file_path"
      echo ""
    fi
  done
fi

# ============================================
# DETAILED ANALYSIS: Unused Pages
# ============================================
echo "DETAILED ANALYSIS: Unused Pages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Pages that exist but are NOT imported in App.jsx:"
echo ""

for file in src/pages/*.jsx src/pages/*.tsx; do
  if [ -f "$file" ]; then
    filename=$(basename "$file" | sed 's/\.[jt]sx$//')
    
    # Skip test files
    if [[ "$filename" == *".test"* ]] || [[ "$filename" == *"__"* ]]; then
      continue
    fi
    
    # Check if imported in App.jsx
    if ! grep -q "pages/$filename" src/App.jsx 2>/dev/null; then
      echo "  ⚠️  $filename - Not imported in App.jsx"
    fi
  fi
done

echo ""

# ============================================
# SUMMARY
# ============================================
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    DIAGNOSTIC SUMMARY                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

TOTAL_PAGES=$(find src/pages -name "*.jsx" -o -name "*.tsx" | wc -l)
log_info "Total pages found: $TOTAL_PAGES"

if [ -f "src/App.jsx" ]; then
  IMPORTED_PAGES=$(grep -c "lazy(() => import" src/App.jsx || echo "0")
  log_info "Pages imported in App.jsx: $IMPORTED_PAGES"
fi

echo ""

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  log_success "🎉 No issues found! Routing structure is healthy."
  exit 0
elif [ $ISSUES -eq 0 ]; then
  log_warning "⚠️  Found $WARNINGS warnings (non-critical)"
  exit 0
else
  log_error "❌ Found $ISSUES critical issues and $WARNINGS warnings"
  echo ""
  echo "Run this to see detailed fixes:"
  echo "  bash scripts/fix-routing-issues.sh"
  exit 1
fi
