#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Enable Auto-Deploy on Render"
echo "================================"
echo ""

# Check for API key
if [ -z "${RENDER_API_KEY:-}" ]; then
  echo "❌ RENDER_API_KEY not set"
  echo ""
  echo "Get your API key from:"
  echo "https://dashboard.render.com → Account Settings → API Keys"
  echo ""
  echo "Then run: export RENDER_API_KEY=rnd_xxxxx"
  exit 1
fi

# Check for service ID
if [ -z "${RENDER_SERVICE_ID:-}" ]; then
  echo "❌ RENDER_SERVICE_ID not set"
  echo ""
  
  # Try to load from saved file
  if [ -f ".render-service-id" ]; then
    echo "💡 Found saved service ID, loading..."
    source .render-service-id
    echo "   Loaded: $RENDER_SERVICE_ID"
    echo ""
  else
    echo "Run this first to find your service ID:"
    echo "  ./scripts/render/activate-services.sh"
    echo ""
    echo "Then run: export RENDER_SERVICE_ID=srv-xxxxx"
    exit 1
  fi
fi

echo "✅ Configuration loaded"
echo "   Service ID: $RENDER_SERVICE_ID"
echo ""

# Helper function
render_api() {
  local method=$1
  local path=$2
  local data=${3:-}
  
  if [ -n "$data" ]; then
    curl -s -X "$method" \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "https://api.render.com/v1${path}"
  else
    curl -s -X "$method" \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      "https://api.render.com/v1${path}"
  fi
}

# Get current service details
echo "1️⃣  Fetching service details..."
SERVICE_INFO=$(render_api GET "/services/$RENDER_SERVICE_ID")

if echo "$SERVICE_INFO" | grep -q "error"; then
  echo "❌ Error fetching service:"
  echo "$SERVICE_INFO" | grep -o '"message":"[^"]*"' | cut -d'"' -f4
  exit 1
fi

SERVICE_NAME=$(echo "$SERVICE_INFO" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
SERVICE_TYPE=$(echo "$SERVICE_INFO" | grep -o '"type":"[^"]*"' | head -1 | cut -d'"' -f4)
SERVICE_BRANCH=$(echo "$SERVICE_INFO" | grep -o '"branch":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "main")
AUTO_DEPLOY=$(echo "$SERVICE_INFO" | grep -o '"autoDeploy":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "no")

echo "   Name: $SERVICE_NAME"
echo "   Type: $SERVICE_TYPE"
echo "   Branch: $SERVICE_BRANCH"
echo "   Current Auto-Deploy: $AUTO_DEPLOY"
echo ""

# Check current status
if [ "$AUTO_DEPLOY" = "yes" ] || [ "$AUTO_DEPLOY" = "true" ]; then
  echo "✅ Auto-deploy is already ENABLED"
  echo ""
  echo "Pushes to branch '$SERVICE_BRANCH' will automatically trigger deployments."
  echo ""
  exit 0
fi

# Enable auto-deploy
echo "2️⃣  Enabling auto-deploy..."
echo ""
echo "⚠️  Note: The Render API doesn't support updating auto-deploy settings."
echo "   You must enable it manually in the dashboard."
echo ""
echo "📋 Steps to Enable Auto-Deploy:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to your service:"
echo "   https://dashboard.render.com/web/$RENDER_SERVICE_ID"
echo ""
echo "2. Click 'Settings' tab (left sidebar)"
echo ""
echo "3. Scroll to 'Build & Deploy' section"
echo ""
echo "4. Find 'Auto-Deploy' setting"
echo ""
echo "5. Change to: Yes"
echo ""
echo "6. Click 'Save Changes'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After enabling, verify with:"
echo "  ./scripts/render/activate-services.sh"
echo ""

# Offer to open browser
read -p "Open Render dashboard now? (y/N): " OPEN_BROWSER

if [[ "$OPEN_BROWSER" =~ ^[Yy]$ ]]; then
  URL="https://dashboard.render.com/web/$RENDER_SERVICE_ID/settings"
  
  if command -v xdg-open > /dev/null; then
    xdg-open "$URL" 2>/dev/null || true
  elif command -v open > /dev/null; then
    open "$URL" 2>/dev/null || true
  else
    echo "Copy this URL to your browser:"
    echo "$URL"
  fi
fi

echo ""
echo "💡 Alternative: Use Deploy Hooks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If you prefer GitHub Actions to trigger deployments:"
echo ""
echo "1. In Render Dashboard → Settings → Deploy Hook"
echo "2. Click 'Create Deploy Hook'"
echo "3. Copy the webhook URL"
echo "4. Add to GitHub Secrets as RENDER_DEPLOY_HOOK"
echo "5. GitHub Actions will trigger deployments on push"
echo ""
echo "The workflow is already configured in:"
echo "  .github/workflows/autopilot-render.yml"
echo ""

# Create a helper script for manual deploys
cat > .render-manual-deploy.sh <<'DEPLOY'
#!/bin/bash
# Quick manual deploy trigger
if [ -z "$RENDER_API_KEY" ] || [ -z "$RENDER_SERVICE_ID" ]; then
  echo "Set RENDER_API_KEY and RENDER_SERVICE_ID first"
  exit 1
fi

echo "Triggering deployment..."
curl -X POST \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":"clear"}' \
  "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys"
echo ""
echo "Deployment triggered!"
DEPLOY

chmod +x .render-manual-deploy.sh

echo "✅ Created manual deploy script: .render-manual-deploy.sh"
echo ""
echo "To manually trigger a deployment anytime:"
echo "  ./.render-manual-deploy.sh"
echo ""
