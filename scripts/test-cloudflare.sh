#!/usr/bin/env bash
# Test Cloudflare Pages Deployment Configuration

set -euo pipefail

echo "🧪 CLOUDFLARE PAGES DEPLOYMENT TEST"
echo "===================================="
echo ""

# Check wrangler installation
echo "1️⃣  Checking Wrangler installation..."
if command -v wrangler &> /dev/null; then
  WRANGLER_VERSION=$(wrangler --version)
  echo "   ✅ Wrangler installed: $WRANGLER_VERSION"
else
  echo "   ❌ Wrangler not found"
  echo "   Installing wrangler..."
  pnpm add -D wrangler
  echo "   ✅ Wrangler installed"
fi

echo ""

# Check for API token
echo "2️⃣  Checking Cloudflare API Token..."
if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "   ✅ CLOUDFLARE_API_TOKEN is set"
  echo "   Token: ${CLOUDFLARE_API_TOKEN:0:20}..."
else
  echo "   ❌ CLOUDFLARE_API_TOKEN not set"
  echo ""
  echo "   To set it:"
  echo "   1. Go to: https://dash.cloudflare.com/profile/api-tokens"
  echo "   2. Create token with 'Cloudflare Pages' template"
  echo "   3. export CLOUDFLARE_API_TOKEN='your-token'"
  echo ""
  read -p "   Do you want to set it now? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "   Enter CLOUDFLARE_API_TOKEN: " CLOUDFLARE_API_TOKEN
    export CLOUDFLARE_API_TOKEN
    echo "   ✅ Token set for this session"
  else
    echo "   ⏭️  Skipping - some tests will fail"
  fi
fi

echo ""

# Check for Account ID
echo "3️⃣  Checking Cloudflare Account ID..."
if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "   ✅ CLOUDFLARE_ACCOUNT_ID is set: $CLOUDFLARE_ACCOUNT_ID"
else
  echo "   ❌ CLOUDFLARE_ACCOUNT_ID not set"
  echo ""
  echo "   To find it:"
  echo "   1. Go to: https://dash.cloudflare.com/"
  echo "   2. Select any site"
  echo "   3. Account ID is in the right sidebar"
  echo ""
  read -p "   Do you want to set it now? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "   Enter CLOUDFLARE_ACCOUNT_ID: " CLOUDFLARE_ACCOUNT_ID
    export CLOUDFLARE_ACCOUNT_ID
    echo "   ✅ Account ID set for this session"
  else
    echo "   ⏭️  Skipping - deployment will fail"
  fi
fi

echo ""

# Test authentication
echo "4️⃣  Testing Cloudflare Authentication..."
if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "   Testing API token..."
  
  # Test with whoami endpoint
  RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Authentication successful!"
    echo "   Token is valid and active"
  else
    echo "   ❌ Authentication failed"
    echo "   Response: $RESPONSE"
  fi
else
  echo "   ⏭️  Skipping - no token set"
fi

echo ""

# Check for dist directory
echo "5️⃣  Checking Build Output..."
if [ -d "dist" ]; then
  FILE_COUNT=$(find dist -type f | wc -l)
  echo "   ✅ dist/ directory exists"
  echo "   Files: $FILE_COUNT"
  
  # Check for index.html
  if [ -f "dist/index.html" ]; then
    echo "   ✅ dist/index.html found"
  else
    echo "   ⚠️  dist/index.html not found"
  fi
else
  echo "   ❌ dist/ directory not found"
  echo "   Need to build first: pnpm run build"
fi

echo ""

# Check for existing Pages project
echo "6️⃣  Checking Cloudflare Pages Project..."
if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]] && [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "   Checking for 'elevateforhumanity' project..."
  
  RESPONSE=$(curl -s -X GET \
    "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/elevateforhumanity" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Project 'elevateforhumanity' exists"
    
    # Get deployment URL
    DEPLOY_URL=$(echo "$RESPONSE" | grep -o '"subdomain":"[^"]*"' | cut -d'"' -f4)
    if [[ -n "$DEPLOY_URL" ]]; then
      echo "   🌐 URL: https://${DEPLOY_URL}.pages.dev"
    fi
  else
    echo "   ⚠️  Project 'elevateforhumanity' not found"
    echo "   Will be created on first deployment"
  fi
else
  echo "   ⏭️  Skipping - credentials not set"
fi

echo ""

# Test deployment (dry run)
echo "7️⃣  Testing Deployment Command..."
if [ -d "dist" ] && [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "   Running dry-run deployment test..."
  echo "   Command: wrangler pages deploy dist --project-name=elevateforhumanity"
  echo ""
  echo "   Note: This will NOT actually deploy, just test the command"
  echo ""
  read -p "   Run deployment test? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    if npx wrangler pages deploy dist --project-name=elevateforhumanity --dry-run 2>&1; then
      echo "   ✅ Deployment command works!"
    else
      echo "   ⚠️  Deployment test had issues (check output above)"
    fi
  else
    echo "   ⏭️  Skipped deployment test"
  fi
else
  echo "   ⏭️  Skipping - need dist/ and CLOUDFLARE_API_TOKEN"
fi

echo ""
echo "===================================="
echo "📊 TEST SUMMARY"
echo "===================================="
echo ""

# Summary
ISSUES=0

if ! command -v wrangler &> /dev/null; then
  echo "❌ Wrangler not installed"
  ISSUES=$((ISSUES + 1))
else
  echo "✅ Wrangler installed"
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "❌ CLOUDFLARE_API_TOKEN not set"
  ISSUES=$((ISSUES + 1))
else
  echo "✅ CLOUDFLARE_API_TOKEN set"
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "❌ CLOUDFLARE_ACCOUNT_ID not set"
  ISSUES=$((ISSUES + 1))
else
  echo "✅ CLOUDFLARE_ACCOUNT_ID set"
fi

if [ ! -d "dist" ]; then
  echo "❌ dist/ directory missing - run: pnpm run build"
  ISSUES=$((ISSUES + 1))
else
  echo "✅ dist/ directory exists"
fi

echo ""

if [ $ISSUES -eq 0 ]; then
  echo "🎉 All checks passed! Ready to deploy to Cloudflare Pages"
  echo ""
  echo "To deploy now, run:"
  echo "  npx wrangler pages deploy dist --project-name=elevateforhumanity"
else
  echo "⚠️  Found $ISSUES issue(s) - fix them before deploying"
  echo ""
  echo "Quick fixes:"
  if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    echo "  • Get API token: https://dash.cloudflare.com/profile/api-tokens"
  fi
  if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
    echo "  • Get Account ID: https://dash.cloudflare.com/ (right sidebar)"
  fi
  if [ ! -d "dist" ]; then
    echo "  • Build app: pnpm run build"
  fi
fi

echo ""
