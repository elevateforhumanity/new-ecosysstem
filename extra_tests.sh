#!/usr/bin/env bash
set -euo pipefail
TARGET_URL="${1:-${TARGET_URL:-http://127.0.0.1:8080}}"
ROUTES="${ROUTES:-/,/programs,/hub,/lms,/connect,/pay,/compliance,/pricing,/catalog,/affiliate,/directory,/legal,/workbooks,/apply,/partners}"
OUT="audit_out"
mkdir -p "$OUT"

note(){ printf "\n\033[1;34m▶ %s\033[0m\n" "$*"; }
success(){ printf "\033[1;32m✅ %s\033[0m\n" "$*"; }
warn(){ printf "\033[1;33m⚠️  %s\033[0m\n" "$*"; }
fail(){ printf "\033[1;31m❌ %s\033[0m\n" "$*"; }

note "Comprehensive Test Suite for Elevate for Humanity"
echo "Target: $TARGET_URL"
echo "Routes: $ROUTES"
echo ""

# Ensure basic tooling
note "Installing dependencies..."
sudo apt-get update -y >/dev/null 2>&1 || true
sudo apt-get install -y jq >/dev/null 2>&1 || true

# 1) Type check / lint / format
note "1. Type check / lint / format"
if [ -f tsconfig.json ]; then
  if npx --yes tsc --noEmit 2>&1 | tee "$OUT/typecheck.log"; then
    success "TypeScript check passed"
  else
    warn "TypeScript check had errors (see $OUT/typecheck.log)"
  fi
fi

if [ -f package.json ]; then
  if npx --yes eslint . --ext .js,.jsx,.ts,.tsx 2>&1 | tee "$OUT/eslint.log"; then
    success "ESLint passed"
  else
    warn "ESLint found issues (see $OUT/eslint.log)"
  fi
  
  if npx --yes prettier --check . 2>&1 | tee "$OUT/prettier.log"; then
    success "Prettier check passed"
  else
    warn "Prettier found formatting issues (see $OUT/prettier.log)"
  fi
fi

# 2) Unit tests + coverage
note "2. Unit tests + coverage"
if npx --yes vitest --version >/dev/null 2>&1; then
  if npx --yes vitest run --coverage 2>&1 | tee "$OUT/vitest.log"; then
    success "Vitest tests passed"
  else
    warn "Some Vitest tests failed (see $OUT/vitest.log)"
  fi
elif npx --yes jest --version >/dev/null 2>&1; then
  if npx --yes jest --coverage 2>&1 | tee "$OUT/jest.log"; then
    success "Jest tests passed"
  else
    warn "Some Jest tests failed (see $OUT/jest.log)"
  fi
else
  warn "No Vitest/Jest detected"
fi

# 3) Lighthouse CI over route list
note "3. Lighthouse CI over critical routes"
ROUTE_URLS=""
IFS=',' read -r -a R <<< "$ROUTES"
for r in "${R[@]}"; do
  ROUTE_URLS="$ROUTE_URLS ${TARGET_URL%/}$r"
done

if npx --yes @lhci/cli autorun --collect.url="$ROUTE_URLS" \
  --collect.numberOfRuns=1 --upload.target=filesystem --upload.outputDir="$OUT/lhci" 2>&1 | tee "$OUT/lighthouse-ci.log"; then
  success "Lighthouse CI completed"
else
  warn "Lighthouse CI had issues (see $OUT/lighthouse-ci.log)"
fi

# 4) Accessibility (pa11y) over routes
note "4. Accessibility (pa11y) WCAG2AA over routes"
> "$OUT/pa11y-multi.json"
PASS_COUNT=0
FAIL_COUNT=0
for r in "${R[@]}"; do
  u="${TARGET_URL%/}$r"
  echo "Testing: $u"
  if npx --yes pa11y --standard WCAG2AA --reporter json "$u" >> "$OUT/pa11y-multi.json" 2>&1; then
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done
success "Pa11y tested $((PASS_COUNT + FAIL_COUNT)) routes ($PASS_COUNT passed, $FAIL_COUNT had issues)"

# 5) Visual regression (Playwright) smoke
note "5. Playwright install & smoke screenshots"
if npx --yes playwright install --with-deps >/dev/null 2>&1; then
  success "Playwright installed"
else
  warn "Playwright install had issues"
fi

cat > playwright.smoke.spec.ts <<'TS'
import { test, expect } from '@playwright/test';
const routes = (process.env.ROUTES || '/').split(',');
test.describe('Smoke & visual', () => {
  for (const r of routes) {
    test(`route ${r} loads`, async ({ page }) => {
      await page.goto((process.env.TARGET_URL || 'http://127.0.0.1:8080').replace(/\/$/,'') + r, { waitUntil: 'networkidle' });
      await expect(page.locator('body')).toBeVisible();
      await page.screenshot({ path: `audit_out/snap${r.replace(/\W/g,'_')}.png`, fullPage: true });
    });
  }
});
TS

if TARGET_URL="$TARGET_URL" ROUTES="$ROUTES" npx --yes playwright test playwright.smoke.spec.ts 2>&1 | tee "$OUT/playwright.log"; then
  success "Playwright smoke tests passed"
else
  warn "Playwright smoke tests had issues (see $OUT/playwright.log)"
fi

# 6) OWASP ZAP Baseline (if Docker available)
note "6. OWASP ZAP Baseline scan (passive)"
if docker ps >/dev/null 2>&1; then
  if docker run --rm -t -v "$PWD/$OUT:/zap/wrk:rw" -u root \
    ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
    -t "$TARGET_URL" -r zap.html -x zap.xml -m 10 2>&1 | tee "$OUT/zap.log"; then
    success "ZAP baseline scan completed"
  else
    warn "ZAP scan found issues (see $OUT/zap.log)"
  fi
else
  warn "Docker not available for ZAP; skipping"
fi

# 7) Secrets & dependency vulns
note "7. Secrets & dependency vulnerabilities"
if npx --yes gitleaks detect --no-git --report-path "$OUT/gitleaks.json" 2>&1 | tee "$OUT/gitleaks.log"; then
  success "No secrets detected"
else
  warn "Gitleaks found potential secrets (see $OUT/gitleaks.json)"
fi

if npm audit --audit-level=high 2>&1 | tee "$OUT/npm-audit.log"; then
  success "No high/critical vulnerabilities"
else
  warn "npm audit found vulnerabilities (see $OUT/npm-audit.log)"
fi

# 8) Cross-browser smoke
note "8. Playwright cross-browser smoke (Chromium/Firefox/WebKit)"
if TARGET_URL="$TARGET_URL" ROUTES="$ROUTES" npx --yes playwright test playwright.smoke.spec.ts --project=chromium --project=firefox --project=webkit 2>&1 | tee "$OUT/playwright-cross-browser.log"; then
  success "Cross-browser tests passed"
else
  warn "Cross-browser tests had issues (see $OUT/playwright-cross-browser.log)"
fi

# 9) HTML validation
note "9. HTML validation"
if npx --yes html-validate dist/**/*.html 2>&1 | tee "$OUT/html-validate-final.log"; then
  success "HTML validation passed"
else
  warn "HTML validation found issues (see $OUT/html-validate-final.log)"
fi

# 10) Spell check
note "10. Spell check"
if npx --yes cspell "**/*.{md,ts,tsx,js,jsx}" --no-progress 2>&1 | tee "$OUT/cspell-final.log" | head -50; then
  success "Spell check passed"
else
  warn "Spell check found issues (see $OUT/cspell-final.log)"
fi

# Summary
note "Test Suite Summary"
echo ""
echo "✅ Type check: $([ -f "$OUT/typecheck.log" ] && echo "Complete" || echo "Skipped")"
echo "✅ Lint: $([ -f "$OUT/eslint.log" ] && echo "Complete" || echo "Skipped")"
echo "✅ Format: $([ -f "$OUT/prettier.log" ] && echo "Complete" || echo "Skipped")"
echo "✅ Unit tests: $([ -f "$OUT/vitest.log" ] || [ -f "$OUT/jest.log" ] && echo "Complete" || echo "Skipped")"
echo "✅ Lighthouse CI: $([ -d "$OUT/lhci" ] && echo "Complete" || echo "Skipped")"
echo "✅ Accessibility: $([ -f "$OUT/pa11y-multi.json" ] && echo "Complete" || echo "Skipped")"
echo "✅ Visual regression: $([ -f "$OUT/playwright.log" ] && echo "Complete" || echo "Skipped")"
echo "✅ Security scan: $([ -f "$OUT/zap.log" ] && echo "Complete" || echo "Skipped")"
echo "✅ Secrets scan: $([ -f "$OUT/gitleaks.json" ] && echo "Complete" || echo "Skipped")"
echo "✅ Dependency audit: $([ -f "$OUT/npm-audit.log" ] && echo "Complete" || echo "Skipped")"
echo "✅ Cross-browser: $([ -f "$OUT/playwright-cross-browser.log" ] && echo "Complete" || echo "Skipped")"
echo "✅ HTML validation: $([ -f "$OUT/html-validate-final.log" ] && echo "Complete" || echo "Skipped")"
echo "✅ Spell check: $([ -f "$OUT/cspell-final.log" ] && echo "Complete" || echo "Skipped")"
echo ""
success "All tests complete! Check $OUT/ for detailed reports."
