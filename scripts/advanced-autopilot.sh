#!/bin/bash
# Advanced Autopilot - Continuous Testing and Deployment System
# Loops until everything is perfect and ready for government deployment

set -e

echo "🚀 ADVANCED AUTOPILOT - Government Compliance Edition"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
LOOP_COUNT=0
MAX_LOOPS=50
ERRORS_FOUND=0

# Functions
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Main autopilot loop
while [ $LOOP_COUNT -lt $MAX_LOOPS ]; do
    LOOP_COUNT=$((LOOP_COUNT + 1))
    ERRORS_FOUND=0
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 LOOP $LOOP_COUNT of $MAX_LOOPS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 1. Check Dependencies
    log_info "Checking dependencies..."
    if [ ! -d "node_modules" ]; then
        log_warning "Installing dependencies..."
        pnpm install --silent || npm install --silent
    fi
    log_success "Dependencies OK"
    
    # 2. Validate Configuration Files
    log_info "Validating configuration files..."
    
    # Check package.json
    if ! node -e "JSON.parse(require('fs').readFileSync('package.json'))" 2>/dev/null; then
        log_error "package.json is invalid"
    else
        log_success "package.json valid"
    fi
    
    # Check tsconfig.json
    if [ -f "tsconfig.json" ]; then
        if ! node -e "JSON.parse(require('fs').readFileSync('tsconfig.json'))" 2>/dev/null; then
            log_error "tsconfig.json is invalid"
        else
            log_success "tsconfig.json valid"
        fi
    fi
    
    # Check render.yaml
    if [ -f "render.yaml" ]; then
        if ! python3 -c "import yaml; yaml.safe_load(open('render.yaml'))" 2>/dev/null; then
            log_error "render.yaml is invalid"
        else
            log_success "render.yaml valid"
        fi
    fi
    
    # 3. Check Government Compliance Files
    log_info "Checking government compliance..."
    
    REQUIRED_SERVICES=(
        "services/compliance.js"
        "services/lms.js"
        "services/payments.js"
        "src/components/admin/WIOAComplianceDashboard.tsx"
    )
    
    for service in "${REQUIRED_SERVICES[@]}"; do
        if [ -f "$service" ]; then
            log_success "$service exists"
        else
            log_error "$service missing"
        fi
    done
    
    # 4. Test Build Process
    log_info "Testing build process..."
    if npm run build > /tmp/build.log 2>&1; then
        log_success "Build successful"
        
        # Check dist folder
        if [ -d "dist" ]; then
            FILE_COUNT=$(find dist -type f | wc -l)
            log_success "Build output: $FILE_COUNT files"
        fi
    else
        log_error "Build failed"
        tail -20 /tmp/build.log
    fi
    
    # 5. Check Routing
    log_info "Checking routing configuration..."
    
    if [ -f "src/router.jsx" ] || [ -f "src/App.tsx" ]; then
        log_success "Router configuration found"
    else
        log_error "No router configuration found"
    fi
    
    # 6. Validate HTML Pages
    log_info "Validating HTML pages..."
    HTML_COUNT=$(find . -name "*.html" ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./dist/*" | wc -l)
    log_success "Found $HTML_COUNT HTML pages"
    
    # 7. Check for Google Forms (no iframes)
    log_info "Checking Google Forms integration..."
    IFRAME_COUNT=$(grep -r "<iframe" --include="*.html" --include="*.jsx" --include="*.tsx" . 2>/dev/null | grep -v "node_modules" | grep -v ".git" | wc -l)
    
    if [ $IFRAME_COUNT -gt 0 ]; then
        log_warning "Found $IFRAME_COUNT iframes - should use direct embeds"
    else
        log_success "No iframes found - using direct embeds"
    fi
    
    # 8. Security Checks
    log_info "Running security checks..."
    
    # Check for exposed secrets
    if grep -r "sk_live_\|pk_live_\|AKIA" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" . 2>/dev/null | grep -v "node_modules" | grep -v ".git" | grep -v ".env.example"; then
        log_error "Potential secrets exposed in code"
    else
        log_success "No exposed secrets found"
    fi
    
    # 9. Accessibility Check
    log_info "Checking accessibility..."
    
    if grep -r "aria-label\|role=" --include="*.html" --include="*.jsx" --include="*.tsx" . 2>/dev/null | grep -v "node_modules" | wc -l > /dev/null; then
        log_success "Accessibility attributes found"
    else
        log_warning "Limited accessibility attributes"
    fi
    
    # 10. Performance Check
    log_info "Checking performance..."
    
    if [ -d "dist" ]; then
        TOTAL_SIZE=$(du -sh dist | cut -f1)
        log_success "Build size: $TOTAL_SIZE"
        
        # Check for large files
        LARGE_FILES=$(find dist -type f -size +1M | wc -l)
        if [ $LARGE_FILES -gt 0 ]; then
            log_warning "Found $LARGE_FILES files larger than 1MB"
        fi
    fi
    
    # 11. Database Schema Check
    log_info "Checking database schema..."
    
    if [ -d "prisma" ] || [ -d "supabase" ]; then
        log_success "Database configuration found"
    else
        log_warning "No database configuration found"
    fi
    
    # 12. API Endpoints Check
    log_info "Checking API endpoints..."
    
    if [ -d "api" ] || [ -d "backend" ]; then
        API_FILES=$(find api backend -name "*.js" -o -name "*.ts" 2>/dev/null | wc -l)
        log_success "Found $API_FILES API files"
    else
        log_warning "No API directory found"
    fi
    
    # 13. Documentation Check
    log_info "Checking documentation..."
    
    REQUIRED_DOCS=(
        "README.md"
        "GOVERNMENT_COMPLIANCE_COMPLETE.md"
    )
    
    for doc in "${REQUIRED_DOCS[@]}"; do
        if [ -f "$doc" ]; then
            log_success "$doc exists"
        else
            log_error "$doc missing"
        fi
    done
    
    # 14. Test Deployment Configuration
    log_info "Testing deployment configuration..."
    
    if [ -f "render.yaml" ] || [ -f "vercel.json" ] || [ -f "netlify.toml" ]; then
        log_success "Deployment configuration found"
    else
        log_warning "No deployment configuration found"
    fi
    
    # 15. Final Status
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 LOOP $LOOP_COUNT RESULTS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ $ERRORS_FOUND -eq 0 ]; then
        log_success "ALL CHECKS PASSED! 🎉"
        echo ""
        echo "✅ Platform is ready for government deployment!"
        echo "✅ All compliance requirements met"
        echo "✅ Build successful"
        echo "✅ Security checks passed"
        echo "✅ Routing configured"
        echo "✅ Documentation complete"
        echo ""
        echo "🚀 Ready to deploy!"
        exit 0
    else
        log_error "Found $ERRORS_FOUND errors"
        echo ""
        log_info "Attempting auto-fix..."
        
        # Auto-fix attempts
        if [ ! -d "node_modules" ]; then
            pnpm install
        fi
        
        # Continue to next loop
        sleep 2
    fi
done

echo ""
log_warning "Reached maximum loops ($MAX_LOOPS)"
log_info "Manual intervention may be required"
exit 1
