#!/usr/bin/env bash
set -euo pipefail

# Extra Add-on Tests for Elevate for Humanity
# Stack: Vite + React + Supabase
# Critical Routes: /, /programs, /hub, /lms, /connect, /pay, /compliance, /pricing

BASE="${TARGET_URL:-http://127.0.0.1:8080}"
ROUTES="${ROUTES:-/,/programs,/hub,/lms,/connect,/pay,/compliance,/pricing,/catalog,/affiliate,/directory,/legal,/workbooks,/apply,/partners}"
OUT="audit_out"
mkdir -p "$OUT"

note() { printf "\n\033[1;34m▶ %s\033[0m\n" "$*"; }
success() { printf "\033[1;32m✅ %s\033[0m\n" "$*"; }
warn() { printf "\033[1;33m⚠️  %s\033[0m\n" "$*"; }
fail() { printf "\033[1;31m❌ %s\033[0m\n" "$*"; }

note "Extra Add-on Tests for EFH"
echo "Base URL: $BASE"
echo "Routes: $ROUTES"
echo ""

# 1) Canonicalization & redirects
note "1. Canonicalization & redirects"
> "$OUT/redirects.txt"
for u in "$BASE" "${BASE/http:/https:}" "${BASE/https:/http:}"; do
  RESULT=$(curl -sS -o /dev/null -w "%{url_effective} %{http_code}\n" -L "$u" 2>&1 || echo "FAILED")
  echo "$RESULT" | tee -a "$OUT/redirects.txt"
done

if grep -q "https://" "$OUT/redirects.txt" && grep -q "200" "$OUT/redirects.txt"; then
  success "HTTPS canonicalization working"
else
  warn "Check canonicalization (see $OUT/redirects.txt)"
fi

# 2) CORS & cookie flags
note "2. CORS & cookie security flags"
curl -sI "$BASE" > "$OUT/headers.full.txt" 2>&1 || true
grep -Ei 'access-control-allow-origin|set-cookie|strict-transport-security|content-security-policy|x-frame-options|x-content-type-options' "$OUT/headers.full.txt" > "$OUT/headers.key.txt" || true

HEADER_COUNT=0
if grep -qi "strict-transport-security" "$OUT/headers.key.txt"; then
  success "HSTS present"
  HEADER_COUNT=$((HEADER_COUNT + 1))
fi

if grep -qi "content-security-policy" "$OUT/headers.key.txt"; then
  success "CSP present"
  HEADER_COUNT=$((HEADER_COUNT + 1))
fi

if grep -qi "x-frame-options" "$OUT/headers.key.txt"; then
  success "X-Frame-Options present"
  HEADER_COUNT=$((HEADER_COUNT + 1))
fi

if grep -qi "x-content-type-options" "$OUT/headers.key.txt"; then
  success "X-Content-Type-Options present"
  HEADER_COUNT=$((HEADER_COUNT + 1))
fi

if [[ $HEADER_COUNT -ge 3 ]]; then
  success "Security headers configured ($HEADER_COUNT/4)"
else
  warn "Some security headers missing ($HEADER_COUNT/4)"
fi

# Check cookies if present
if grep -qi "set-cookie" "$OUT/headers.key.txt"; then
  if grep -i "set-cookie" "$OUT/headers.key.txt" | grep -qi "secure"; then
    success "Cookies have Secure flag"
  else
    warn "Cookies missing Secure flag"
  fi
  
  if grep -i "set-cookie" "$OUT/headers.key.txt" | grep -qi "httponly"; then
    success "Cookies have HttpOnly flag"
  else
    warn "Cookies missing HttpOnly flag"
  fi
  
  if grep -i "set-cookie" "$OUT/headers.key.txt" | grep -qi "samesite"; then
    success "Cookies have SameSite flag"
  else
    warn "Cookies missing SameSite flag"
  fi
fi

# 3) Sitemap parity
note "3. Sitemap parity check"
curl -s "${BASE%/}/sitemap.xml" > "$OUT/sitemap.xml" 2>&1 || echo "<empty/>" > "$OUT/sitemap.xml"

if grep -q "<loc>" "$OUT/sitemap.xml"; then
  awk -F'[<>]' '/<loc>/{print $3}' "$OUT/sitemap.xml" | sort > "$OUT/sitemap_urls.txt"
  SITEMAP_COUNT=$(wc -l < "$OUT/sitemap_urls.txt")
  success "Sitemap found with $SITEMAP_COUNT URLs"
else
  warn "No sitemap found or empty"
  echo "$BASE/" > "$OUT/sitemap_urls.txt"
fi

# Create expected URLs from routes
IFS=',' read -r -a ROUTE_ARRAY <<< "$ROUTES"
> "$OUT/expected_urls.txt"
for r in "${ROUTE_ARRAY[@]}"; do
  echo "${BASE%/}$r" | sed 's#//#/#g' >> "$OUT/expected_urls.txt"
done
sort -o "$OUT/expected_urls.txt" "$OUT/expected_urls.txt"

# Compare
comm -3 "$OUT/expected_urls.txt" "$OUT/sitemap_urls.txt" > "$OUT/sitemap_diff.txt" || true

if [[ -s "$OUT/sitemap_diff.txt" ]]; then
  warn "Sitemap differences found (see $OUT/sitemap_diff.txt)"
else
  success "Sitemap matches expected routes"
fi

# 4) Playwright hydration/console checks
note "4. Playwright hydration & console error checks"

cat > pw.hydration.spec.ts <<'TS'
import { test, expect } from '@playwright/test';
const routes = (process.env.ROUTES || '/').split(',');
const base = process.env.BASE || 'http://127.0.0.1:8080';

test.describe('Hydration & console clean', () => {
  for (const r of routes) {
    test(`no console errors: ${r}`, async ({ page }) => {
      const errs: string[] = [];
      const warns: string[] = [];
      
      page.on('console', m => {
        if (m.type() === 'error') errs.push(m.text());
        if (m.type() === 'warning') warns.push(m.text());
      });
      
      page.on('pageerror', e => errs.push(String(e)));
      
      await page.goto(base.replace(/\/$/, '') + r, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      await expect(page.locator('body')).toBeVisible();
      
      if (errs.length) {
        console.error(`Console/Page errors on ${r}:\n` + errs.join('\n'));
      }
      
      if (warns.length > 0) {
        console.warn(`Warnings on ${r}: ${warns.length}`);
      }
      
      expect(errs.length, `Console/page errors present on ${r}`).toBe(0);
    });
  }
});
TS

if npx --yes playwright install --with-deps >/dev/null 2>&1; then
  success "Playwright installed"
else
  warn "Playwright install had issues"
fi

if BASE="$BASE" ROUTES="$ROUTES" npx --yes playwright test pw.hydration.spec.ts --reporter=list 2>&1 | tee "$OUT/hydration.log"; then
  success "No console errors detected"
else
  warn "Console errors found (see $OUT/hydration.log)"
fi

# 5) License check
note "5. License compliance check"
if npx --yes license-checker-rseidelsohn --summary 2>&1 | tee "$OUT/licenses.txt"; then
  success "License check complete"
else
  warn "License check had issues (see $OUT/licenses.txt)"
fi

# Check for problematic licenses
if grep -Ei "GPL|AGPL|SSPL|Commons Clause" "$OUT/licenses.txt" >/dev/null 2>&1; then
  warn "Potentially problematic licenses detected"
else
  success "No problematic licenses detected"
fi

# 6) Secrets in build artifacts
note "6. Secrets scan in build artifacts"
if [[ -d "dist" ]]; then
  if npx --yes gitleaks detect --source dist/ --no-git --report-path "$OUT/gitleaks-dist.json" 2>&1 | tee "$OUT/gitleaks-dist.log"; then
    success "No secrets in build artifacts"
  else
    warn "Potential secrets in build artifacts (see $OUT/gitleaks-dist.json)"
  fi
else
  warn "No dist directory found, skipping build artifact scan"
fi

# 7) Responsive images check
note "7. Responsive images check"
if [[ -d "dist" ]]; then
  LARGE_IMAGES=$(find dist -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -size +1536k 2>/dev/null | wc -l)
  
  if [[ $LARGE_IMAGES -eq 0 ]]; then
    success "No images > 1.5MB found"
  else
    warn "$LARGE_IMAGES images > 1.5MB found"
  fi
  
  # Check for srcset usage
  SRCSET_COUNT=$(grep -r "srcset=" dist --include="*.html" 2>/dev/null | wc -l || echo 0)
  if [[ $SRCSET_COUNT -gt 0 ]]; then
    success "Responsive images (srcset) found: $SRCSET_COUNT"
  else
    warn "No responsive images (srcset) detected"
  fi
fi

# 8) PWA/Service Worker check
note "8. PWA/Service Worker check"
if curl -s "${BASE%/}/sw.js" -o "$OUT/sw.js" 2>&1; then
  if [[ -s "$OUT/sw.js" ]]; then
    success "Service worker found"
  else
    warn "Service worker not found or empty"
  fi
else
  warn "No service worker detected"
fi

if curl -s "${BASE%/}/manifest.json" -o "$OUT/manifest.json" 2>&1; then
  if [[ -s "$OUT/manifest.json" ]] && grep -q "name" "$OUT/manifest.json"; then
    success "PWA manifest found"
  else
    warn "PWA manifest not found or invalid"
  fi
else
  warn "No PWA manifest detected"
fi

# 9) Meta tags uniqueness
note "9. Meta tags uniqueness check"
> "$OUT/meta_titles.txt"
IFS=',' read -r -a ROUTE_ARRAY <<< "$ROUTES"
for r in "${ROUTE_ARRAY[@]}"; do
  TITLE=$(curl -s "${BASE%/}$r" | grep -oP '<title>\K[^<]+' || echo "NO_TITLE")
  echo "$r: $TITLE" >> "$OUT/meta_titles.txt"
done

UNIQUE_TITLES=$(cut -d: -f2- "$OUT/meta_titles.txt" | sort -u | wc -l)
TOTAL_ROUTES=$(echo "$ROUTES" | tr ',' '\n' | wc -l)

if [[ $UNIQUE_TITLES -eq $TOTAL_ROUTES ]]; then
  success "All routes have unique titles ($UNIQUE_TITLES/$TOTAL_ROUTES)"
else
  warn "Some routes share titles ($UNIQUE_TITLES unique out of $TOTAL_ROUTES)"
fi

# 10) Structured data validation
note "10. Structured data per route"
> "$OUT/structured_data_summary.txt"
for r in "${ROUTE_ARRAY[@]}"; do
  SD_TYPES=$(curl -s "${BASE%/}$r" | grep -oP 'type":\s*"\K[^"]+' | sort -u | tr '\n' ',' || echo "none")
  echo "$r: $SD_TYPES" >> "$OUT/structured_data_summary.txt"
done

if grep -q "Organization\|WebSite" "$OUT/structured_data_summary.txt"; then
  success "Structured data found on routes"
else
  warn "Limited structured data detected"
fi

# Summary
note "Extra Add-on Tests Summary"
echo ""
echo "✅ Canonicalization: $([ -f "$OUT/redirects.txt" ] && echo "Checked" || echo "Skipped")"
echo "✅ Security headers: $([ -f "$OUT/headers.key.txt" ] && echo "Checked" || echo "Skipped")"
echo "✅ Sitemap parity: $([ -f "$OUT/sitemap_diff.txt" ] && echo "Checked" || echo "Skipped")"
echo "✅ Console errors: $([ -f "$OUT/hydration.log" ] && echo "Checked" || echo "Skipped")"
echo "✅ License compliance: $([ -f "$OUT/licenses.txt" ] && echo "Checked" || echo "Skipped")"
echo "✅ Build secrets: $([ -f "$OUT/gitleaks-dist.log" ] && echo "Checked" || echo "Skipped")"
echo "✅ Responsive images: $([ $LARGE_IMAGES -eq 0 ] && echo "Pass" || echo "Review")"
echo "✅ PWA/Service Worker: $([ -f "$OUT/sw.js" ] && echo "Checked" || echo "Skipped")"
echo "✅ Meta uniqueness: $([ -f "$OUT/meta_titles.txt" ] && echo "Checked" || echo "Skipped")"
echo "✅ Structured data: $([ -f "$OUT/structured_data_summary.txt" ] && echo "Checked" || echo "Skipped")"
echo ""
success "All extra add-on tests complete! Check $OUT/ for details."
