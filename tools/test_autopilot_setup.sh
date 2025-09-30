#!/usr/bin/env bash
set -euo pipefail

echo "Testing EFH Autopilot + Copilot setup..."

# Test 1: Check that required files were created
echo "✅ Testing file creation..."
test -f "scripts/autopilot-env.sh" || { echo "❌ autopilot-env.sh missing"; exit 1; }
test -f "scripts/autopilot-guard.sh" || { echo "❌ autopilot-guard.sh missing"; exit 1; }
test -f "pm2.config.cjs" || { echo "❌ pm2.config.cjs missing"; exit 1; }
test -d "infra" || { echo "❌ infra directory missing"; exit 1; }
test -f "infra/providers.tf" || { echo "❌ providers.tf missing"; exit 1; }
test -f ".devcontainer/devcontainer.json" || { echo "❌ devcontainer.json missing"; exit 1; }

# Test 2: Check that scripts are executable
echo "✅ Testing script permissions..."
test -x "scripts/autopilot-env.sh" || { echo "❌ autopilot-env.sh not executable"; exit 1; }
test -x "scripts/autopilot-guard.sh" || { echo "❌ autopilot-guard.sh not executable"; exit 1; }

# Test 3: Check PM2 configuration syntax
echo "✅ Testing PM2 config syntax..."
node -c pm2.config.cjs || { echo "❌ pm2.config.cjs has syntax errors"; exit 1; }

# Test 4: Check that environment script validates properly
echo "✅ Testing environment validation..."
CF_PAGES_PROJECT="test-project" scripts/autopilot-env.sh >/dev/null 2>&1 && echo "✅ Environment validation passed" || { echo "❌ autopilot-env.sh validation failed"; exit 1; }

# Test 5: Verify build still works
echo "✅ Testing build process..."
npm run build > /dev/null || { echo "❌ npm run build failed"; exit 1; }

# Test 6: Check Terraform syntax
echo "✅ Testing Terraform configuration..."
command -v terraform >/dev/null && {
  cd infra
  terraform init -backend=false > /dev/null 2>&1 || true
  terraform validate || { echo "❌ Terraform configuration invalid"; exit 1; }
  cd ..
} || echo "ℹ Terraform not available, skipping validation"

echo ""
echo "🎉 All tests passed! EFH Autopilot + Copilot setup is working correctly."
echo ""
echo "Next steps:"
echo "1. Set environment variables for Cloudflare (CF_PAGES_PROJECT, CF_API_TOKEN, etc.)"
echo "2. Run: pm2 start pm2.config.cjs --env development"
echo "3. Run: pm2 start scripts/autopilot-guard.sh --name autopilot-guard"
echo "4. Run: pm2 save"