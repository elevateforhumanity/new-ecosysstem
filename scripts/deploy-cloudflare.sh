#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Cloudflare Pages Deploy Sequence"

# 1) Quick preflight (ensures env is present)
echo "1️⃣  Checking environment variables..."
echo "These should print values (not empty). If any are blank, add them as Codespaces secrets."
printenv CF_API_TOKEN CF_ACCOUNT_ID CF_ZONE_NAME CF_PAGES_PROJECT || {
  echo "❌ Environment variables not set. Please add them as:"
  echo "  - GitHub repo secrets for CI (Settings → Secrets and variables → Actions)"
  echo "  - Codespaces secrets for local development"
  echo "Required: CF_API_TOKEN, CF_ACCOUNT_ID, CF_ZONE_NAME, CF_PAGES_PROJECT"
  exit 1
}

# 2) Verify Wrangler auth (fast fail if token bad)
echo "2️⃣  Verifying Wrangler auth..."
npm i -g wrangler >/dev/null 2>&1
wrangler whoami

# 3) Build locally (matches CI build step)
echo "3️⃣  Building locally..."
npm ci
npm run build

# 4) Trigger the Pages workflow
echo "4️⃣  Triggering Pages workflow..."
echo "Creating empty commit to trigger deployment..."
git add -A
git commit --allow-empty -m "chore(ci): trigger Cloudflare Pages deploy"
git push origin $(git branch --show-current)

# 5) Watch it deploy (if gh is available)
echo "5️⃣  Monitoring deployment..."
if command -v gh >/dev/null 2>&1; then
  echo "Watching workflow run..."
  gh run watch --exit-status || true
  gh run view --log || true
else
  echo "GitHub CLI not available. Check deployment at:"
  echo "https://github.com/elevateforhumanity/new-ecosysstem/actions"
fi

# 6) Post-deploy checks
echo "7️⃣  Post-deploy checks..."
# Replace with your Pages prod/preview URL if you know it
PAGES_URL="https://${CF_PAGES_PROJECT}.pages.dev"

echo "Testing deployment at $PAGES_URL"
# Basic health
curl -I "$PAGES_URL" || echo "❌ Main page check failed"
# Static asset exists?
curl -I "$PAGES_URL/favicon.ico" || echo "❌ Favicon check failed"
# Your built index present?
test -f dist/index.html && echo "✅ dist/index.html exists" || echo "❌ dist/index.html missing"

echo "🎉 Deploy sequence complete!"
echo "📊 View your site at: $PAGES_URL"