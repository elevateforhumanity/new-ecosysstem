#!/usr/bin/env bash
set -euo pipefail

echo "🔍 60-second Cloudflare deployment triage"

# 1) Secrets present?
echo "1️⃣  Checking secrets via workflow run..."
if command -v gh >/dev/null 2>&1; then
  gh workflow run "Verify Cloudflare Secrets" --ref $(git branch --show-current)
  echo "⏳ Waiting for verification workflow..."
  sleep 10
  gh run watch --exit-status || echo "❌ Secrets verification failed"
else
  echo "⚠️  GitHub CLI not available. Manual check required."
fi

# 2) Node/build mismatch? Align locally:
echo "2️⃣  Checking Node version and build config..."
echo "Current Node version:"
node -v
echo "Package.json engines and scripts:"
cat package.json | jq '.engines // empty, .scripts' 2>/dev/null || {
  echo "jq not available, showing package.json excerpts:"
  grep -A5 '"engines"' package.json || echo "No engines specified"
  grep -A10 '"scripts"' package.json || echo "No scripts found"
}

# 3) Output folder check
echo "3️⃣  Checking build output..."
echo "Build folder contents:"
if [ -d dist ]; then
  ls -la dist/
  echo "✅ dist folder exists"
else
  echo "❌ dist folder missing - run 'npm run build'"
fi

echo "4️⃣  Verifying workflow configuration..."
echo "Checking if workflow uses correct output folder:"
grep -n "directory:" .github/workflows/cloudflare-pages.yml || echo "No directory specified"

echo "5️⃣  Recent workflow runs:"
if command -v gh >/dev/null 2>&1; then
  gh run list --limit 5 --workflow "Deploy to Cloudflare Pages" || echo "No recent runs found"
else
  echo "⚠️  GitHub CLI not available"
fi

echo "🏁 Triage complete. Common fixes:"
echo "   - Ensure CF_API_TOKEN has Pages:Edit permission"
echo "   - Verify CLOUDFLARE_ACCOUNT_ID matches your account"
echo "   - Check CLOUDFLARE_PAGES_PROJECT name matches exactly"
echo "   - Confirm build output goes to 'dist' folder"