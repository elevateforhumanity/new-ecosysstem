#!/usr/bin/env bash
set -euo pipefail

URL="${1:-https://3a4b7a1a.elevateforhumanity.pages.dev}"
REPORT="AUTOPILOT_DIAGNOSTIC_REPORT.md"

echo "🔍 Advanced Autopilot: Diagnosing $URL"
echo ""

cat > "$REPORT" << 'HEADER'
# 🔍 Advanced Autopilot Diagnostic Report

**Target URL:** https://3a4b7a1a.elevateforhumanity.pages.dev
**Date:** $(date)
**Status:** Running diagnostics...

---

HEADER

echo "## 1. HTTP Response Check" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
echo "- HTTP Status: **$STATUS**" | tee -a "$REPORT"

if [ "$STATUS" = "200" ]; then
  echo "  - ✅ Site is accessible" | tee -a "$REPORT"
else
  echo "  - ❌ Site returned non-200 status" | tee -a "$REPORT"
fi

RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$URL")
echo "- Response Time: **${RESPONSE_TIME}s**" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "## 2. HTML Structure Analysis" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

HTML=$(curl -s "$URL")

# Check for root element
if echo "$HTML" | grep -q 'id="root"'; then
  echo "- ✅ Root element present: \`<div id=\"root\"></div>\`" | tee -a "$REPORT"
else
  echo "- ❌ Root element missing" | tee -a "$REPORT"
fi

# Check for noscript
if echo "$HTML" | grep -q '<noscript>'; then
  echo "- ⚠️  Noscript block present (fallback for no-JS)" | tee -a "$REPORT"
fi

# Check for module script
SCRIPT=$(echo "$HTML" | grep -o 'src="/assets/[^"]*\.js"' | head -1)
if [ -n "$SCRIPT" ]; then
  SCRIPT_PATH=$(echo "$SCRIPT" | sed 's/src="//;s/"//')
  echo "- ✅ Module script found: \`$SCRIPT_PATH\`" | tee -a "$REPORT"
  
  # Test if script loads
  SCRIPT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL$SCRIPT_PATH")
  echo "  - Script HTTP Status: **$SCRIPT_STATUS**" | tee -a "$REPORT"
  
  if [ "$SCRIPT_STATUS" = "200" ]; then
    SCRIPT_SIZE=$(curl -s "$URL$SCRIPT_PATH" | wc -c)
    echo "  - Script Size: **$SCRIPT_SIZE bytes**" | tee -a "$REPORT"
  fi
else
  echo "- ❌ No module script found in HTML" | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"

echo "## 3. Content Analysis" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# Check if actual content is in HTML (SSR) or if it's SPA
if echo "$HTML" | grep -q "Empowering People"; then
  echo "- ✅ Content found in HTML (SSR or pre-rendered)" | tee -a "$REPORT"
  echo "  - Found: 'Empowering People' in HTML source" | tee -a "$REPORT"
else
  echo "- ⚠️  Content NOT in HTML source (client-side rendered)" | tee -a "$REPORT"
  echo "  - This is normal for SPAs, but means JS must execute" | tee -a "$REPORT"
fi

# Check for React hydration markers
if echo "$HTML" | grep -q "react"; then
  echo "- ✅ React markers found in HTML" | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"

echo "## 4. Security Headers Check" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

HEADERS=$(curl -sI "$URL")

check_header() {
  local header="$1"
  if echo "$HEADERS" | grep -qi "^$header:"; then
    local value=$(echo "$HEADERS" | grep -i "^$header:" | cut -d: -f2- | xargs)
    echo "- ✅ **$header:** \`$value\`" | tee -a "$REPORT"
  else
    echo "- ❌ **$header:** Missing" | tee -a "$REPORT"
  fi
}

check_header "content-security-policy"
check_header "x-content-type-options"
check_header "x-frame-options"
check_header "strict-transport-security"
check_header "cache-control"

echo "" | tee -a "$REPORT"

echo "## 5. Asset Loading Test" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# Extract all asset URLs
ASSETS=$(echo "$HTML" | grep -o 'src="/assets/[^"]*"' | sed 's/src="//;s/"//' | head -10)

ASSET_COUNT=$(echo "$ASSETS" | wc -l)
echo "- Found **$ASSET_COUNT** asset references" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

FAILED_ASSETS=0
for asset in $ASSETS; do
  ASSET_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL$asset")
  if [ "$ASSET_STATUS" = "200" ]; then
    echo "  - ✅ $asset ($ASSET_STATUS)" | tee -a "$REPORT"
  else
    echo "  - ❌ $asset ($ASSET_STATUS)" | tee -a "$REPORT"
    FAILED_ASSETS=$((FAILED_ASSETS + 1))
  fi
done

echo "" | tee -a "$REPORT"

echo "## 6. Critical Routes Test" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

ROUTES=("/" "/programs" "/get-started" "/lms" "/student" "/hub" "/connect")

for route in "${ROUTES[@]}"; do
  ROUTE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL$route")
  if [ "$ROUTE_STATUS" = "200" ] || [ "$ROUTE_STATUS" = "308" ]; then
    echo "- ✅ \`$route\` → $ROUTE_STATUS" | tee -a "$REPORT"
  else
    echo "- ❌ \`$route\` → $ROUTE_STATUS" | tee -a "$REPORT"
  fi
done

echo "" | tee -a "$REPORT"

echo "## 7. Meta Tags & SEO" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# Check for essential meta tags
if echo "$HTML" | grep -q '<title>'; then
  TITLE=$(echo "$HTML" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//')
  echo "- ✅ **Title:** $TITLE" | tee -a "$REPORT"
else
  echo "- ❌ Title tag missing" | tee -a "$REPORT"
fi

if echo "$HTML" | grep -q 'name="description"'; then
  DESC=$(echo "$HTML" | grep 'name="description"' | grep -o 'content="[^"]*"' | sed 's/content="//;s/"//' | head -1)
  echo "- ✅ **Description:** ${DESC:0:100}..." | tee -a "$REPORT"
else
  echo "- ❌ Description meta tag missing" | tee -a "$REPORT"
fi

if echo "$HTML" | grep -q 'name="viewport"'; then
  echo "- ✅ Viewport meta tag present" | tee -a "$REPORT"
else
  echo "- ❌ Viewport meta tag missing" | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"

echo "## 8. Diagnostic Summary" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

ISSUES=0

if [ "$STATUS" != "200" ]; then
  echo "- ❌ **CRITICAL:** Site not returning 200 OK" | tee -a "$REPORT"
  ISSUES=$((ISSUES + 1))
fi

if [ "$FAILED_ASSETS" -gt 0 ]; then
  echo "- ⚠️  **WARNING:** $FAILED_ASSETS assets failed to load" | tee -a "$REPORT"
  ISSUES=$((ISSUES + 1))
fi

if ! echo "$HTML" | grep -q 'id="root"'; then
  echo "- ❌ **CRITICAL:** Root element missing" | tee -a "$REPORT"
  ISSUES=$((ISSUES + 1))
fi

if [ -z "$SCRIPT" ]; then
  echo "- ❌ **CRITICAL:** No JavaScript bundle found" | tee -a "$REPORT"
  ISSUES=$((ISSUES + 1))
fi

if [ "$ISSUES" -eq 0 ]; then
  echo "- ✅ **No critical issues detected**" | tee -a "$REPORT"
  echo "" | tee -a "$REPORT"
  echo "### Overall Status: ✅ HEALTHY" | tee -a "$REPORT"
else
  echo "" | tee -a "$REPORT"
  echo "### Overall Status: ⚠️  $ISSUES ISSUES FOUND" | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"
echo "---" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"
echo "**Report generated:** $(date)" | tee -a "$REPORT"

echo ""
echo "✅ Diagnostic complete. Report saved to: $REPORT"
cat "$REPORT"
