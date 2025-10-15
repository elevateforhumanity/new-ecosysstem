#!/bin/bash

# Comprehensive Smoke Test Suite
# Tests all critical systems and integrations

set -e

echo "🔥 SMOKE TEST SUITE - Starting..."
echo "=================================="
echo ""

PASS=0
FAIL=0
WARN=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS++))
}

test_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL++))
}

test_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARN++))
}

echo "📦 1. DEPENDENCY CHECKS"
echo "----------------------"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    test_pass "Node.js installed: $NODE_VERSION"
else
    test_fail "Node.js not found"
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    test_pass "npm installed: $NPM_VERSION"
else
    test_fail "npm not found"
fi

# Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    test_pass "Python installed: $PYTHON_VERSION"
else
    test_warn "Python not found (needed for reels)"
fi

# Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    test_pass "Git installed: $GIT_VERSION"
else
    test_fail "Git not found"
fi

echo ""
echo "📁 2. PROJECT STRUCTURE"
echo "----------------------"

# Critical files
CRITICAL_FILES=(
    "package.json"
    "vite.config.js"
    "vitest.config.js"
    "index.html"
    "src/App.jsx"
    ".env.example"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_pass "File exists: $file"
    else
        test_fail "Missing file: $file"
    fi
done

# Critical directories
CRITICAL_DIRS=(
    "src"
    "src/pages"
    "src/components"
    "scripts"
    "docs"
    "reels"
)

for dir in "${CRITICAL_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        test_pass "Directory exists: $dir"
    else
        test_fail "Missing directory: $dir"
    fi
done

echo ""
echo "🔧 3. BUILD SYSTEM"
echo "----------------------"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    test_pass "node_modules directory exists"
else
    test_warn "node_modules not found - run 'npm install'"
fi

# Try to build
echo "Building project..."
if npm run build > /tmp/build.log 2>&1; then
    test_pass "Build successful"
    if [ -d "dist" ]; then
        test_pass "dist directory created"
        DIST_SIZE=$(du -sh dist | cut -f1)
        test_pass "Build size: $DIST_SIZE"
    else
        test_fail "dist directory not created"
    fi
else
    test_fail "Build failed - check /tmp/build.log"
fi

echo ""
echo "🧪 4. TEST SUITE"
echo "----------------------"

# Run tests
echo "Running tests..."
if npm test -- --run > /tmp/test.log 2>&1; then
    test_pass "All tests passed"
    TEST_COUNT=$(grep -o "Test Files.*passed" /tmp/test.log | head -1 || echo "Tests completed")
    echo "   $TEST_COUNT"
else
    test_fail "Some tests failed - check /tmp/test.log"
fi

echo ""
echo "📱 5. SOCIAL MEDIA AUTOMATION"
echo "----------------------"

# Check social media files
if [ -f "scripts/social-media-automation.js" ]; then
    test_pass "Social media automation script exists"
    
    # Check for required functions
    if grep -q "postToFacebook" scripts/social-media-automation.js; then
        test_pass "Facebook integration present"
    else
        test_fail "Facebook integration missing"
    fi
    
    if grep -q "postToYouTube" scripts/social-media-automation.js; then
        test_pass "YouTube integration present"
    else
        test_fail "YouTube integration missing"
    fi
    
    if grep -q "postToLinkedIn" scripts/social-media-automation.js; then
        test_pass "LinkedIn integration present"
    else
        test_fail "LinkedIn integration missing"
    fi
else
    test_fail "Social media automation script missing"
fi

# Check OAuth setup
if [ -f "scripts/setup-social-oauth.js" ]; then
    test_pass "OAuth setup tool exists"
else
    test_fail "OAuth setup tool missing"
fi

# Check documentation
if [ -f "docs/SOCIAL_MEDIA_AUTOMATION_SETUP.md" ]; then
    test_pass "Social media documentation exists"
else
    test_warn "Social media documentation missing"
fi

echo ""
echo "🎬 6. REELS GENERATION SYSTEM"
echo "----------------------"

# Check reels files
if [ -f "reels/reels_maker.py" ]; then
    test_pass "Reels maker script exists"
    
    # Check Python syntax
    if python3 -m py_compile reels/reels_maker.py 2>/dev/null; then
        test_pass "Reels maker syntax valid"
    else
        test_fail "Reels maker has syntax errors"
    fi
else
    test_fail "Reels maker script missing"
fi

if [ -f "reels/add_subtitles.py" ]; then
    test_pass "Subtitles script exists"
else
    test_warn "Subtitles script missing"
fi

if [ -f "reels/content.csv" ]; then
    test_pass "Sample content CSV exists"
    CONTENT_COUNT=$(wc -l < reels/content.csv)
    test_pass "Content items: $((CONTENT_COUNT - 1))"
else
    test_fail "Sample content CSV missing"
fi

if [ -f "reels/requirements.txt" ]; then
    test_pass "Python requirements file exists"
else
    test_fail "Python requirements file missing"
fi

# Check reels directories
if [ -d "reels/assets" ]; then
    test_pass "Assets directory exists"
else
    test_warn "Assets directory missing - create with mkdir -p reels/assets"
fi

echo ""
echo "📄 7. DOCUMENTATION"
echo "----------------------"

DOC_FILES=(
    "README.md"
    "docs/SOCIAL_MEDIA_AUTOMATION_SETUP.md"
    "docs/SOCIAL_MEDIA_QUICK_START.md"
    "reels/README.md"
    "reels/QUICKSTART.md"
    "ECOSYSTEM_HEALTH_REPORT.md"
)

for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        test_pass "Documentation: $doc"
    else
        test_warn "Missing documentation: $doc"
    fi
done

echo ""
echo "🔐 8. SECURITY & CONFIGURATION"
echo "----------------------"

# Check .env.example
if [ -f ".env.example" ]; then
    test_pass ".env.example exists"
    
    # Check for required variables
    REQUIRED_VARS=(
        "VITE_SUPABASE_URL"
        "VITE_SUPABASE_ANON_KEY"
        "FACEBOOK_PAGE_ID_1"
        "YOUTUBE_CHANNEL_ID"
        "LINKEDIN_ORGANIZATION_ID"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "$var" .env.example; then
            test_pass "Environment variable documented: $var"
        else
            test_warn "Missing env var in .env.example: $var"
        fi
    done
else
    test_fail ".env.example missing"
fi

# Check .gitignore
if [ -f ".gitignore" ]; then
    test_pass ".gitignore exists"
    if grep -q ".env" .gitignore; then
        test_pass ".env properly ignored"
    else
        test_warn ".env not in .gitignore"
    fi
else
    test_fail ".gitignore missing"
fi

echo ""
echo "🌐 9. GIT REPOSITORY"
echo "----------------------"

# Check git status
if git rev-parse --git-dir > /dev/null 2>&1; then
    test_pass "Git repository initialized"
    
    BRANCH=$(git branch --show-current)
    test_pass "Current branch: $BRANCH"
    
    if git diff --quiet; then
        test_pass "Working directory clean"
    else
        test_warn "Uncommitted changes present"
    fi
    
    REMOTE=$(git remote get-url origin 2>/dev/null || echo "none")
    if [ "$REMOTE" != "none" ]; then
        test_pass "Remote configured: $REMOTE"
    else
        test_warn "No remote configured"
    fi
else
    test_fail "Not a git repository"
fi

echo ""
echo "🚀 10. DEPLOYMENT READINESS"
echo "----------------------"

# Check if dist exists and has content
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    test_pass "Build artifacts ready for deployment"
    
    # Check for index.html
    if [ -f "dist/index.html" ]; then
        test_pass "dist/index.html exists"
    else
        test_fail "dist/index.html missing"
    fi
    
    # Check for assets
    if [ -d "dist/assets" ]; then
        ASSET_COUNT=$(ls -1 dist/assets | wc -l)
        test_pass "Asset files: $ASSET_COUNT"
    else
        test_warn "dist/assets directory missing"
    fi
else
    test_warn "No build artifacts - run 'npm run build'"
fi

# Check package.json scripts
if grep -q '"build"' package.json; then
    test_pass "Build script configured"
else
    test_fail "Build script missing in package.json"
fi

if grep -q '"preview"' package.json; then
    test_pass "Preview script configured"
else
    test_warn "Preview script missing in package.json"
fi

echo ""
echo "=================================="
echo "🔥 SMOKE TEST COMPLETE"
echo "=================================="
echo ""
echo -e "${GREEN}✅ PASSED${NC}: $PASS"
echo -e "${YELLOW}⚠️  WARNINGS${NC}: $WARN"
echo -e "${RED}❌ FAILED${NC}: $FAIL"
echo ""

TOTAL=$((PASS + WARN + FAIL))
SCORE=$((PASS * 100 / TOTAL))

echo "Overall Score: $SCORE% ($PASS/$TOTAL)"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Review above for details.${NC}"
    exit 1
fi
