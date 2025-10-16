#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Advanced Autopilot: Render Full Audit & Cleanup"
echo "=================================================="
echo ""

# Check required env vars
if [ -z "${RENDER_API_KEY:-}" ]; then
  echo "❌ RENDER_API_KEY not set"
  echo ""
  echo "Get your API key:"
  echo "1. Go to https://dashboard.render.com"
  echo "2. Click profile → Account Settings → API Keys"
  echo "3. Create API Key"
  echo "4. Export: export RENDER_API_KEY=rnd_xxxxx"
  exit 1
fi

if [ -z "${RENDER_SERVICE_ID:-}" ]; then
  echo "⚠️  RENDER_SERVICE_ID not set, will list all services"
  LIST_ALL=true
else
  LIST_ALL=false
  echo "📋 Service ID: $RENDER_SERVICE_ID"
fi

echo ""

# Helper function for API calls
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

# 1. List all services
echo "1️⃣  Fetching all services..."
SERVICES=$(render_api GET "/services")

# Parse service list
SERVICE_COUNT=$(echo "$SERVICES" | grep -o '"id":"srv-[^"]*"' | wc -l || echo "0")
echo "   Found $SERVICE_COUNT service(s)"
echo ""

if [ "$SERVICE_COUNT" -eq 0 ]; then
  echo "❌ No services found. Check your API key."
  exit 1
fi

# Display services
echo "📋 Services:"
echo "$SERVICES" | grep -o '"id":"srv-[^"]*","name":"[^"]*","type":"[^"]*"' | while read -r line; do
  SRV_ID=$(echo "$line" | grep -o 'srv-[^"]*' | head -1)
  SRV_NAME=$(echo "$line" | grep -o 'name":"[^"]*' | cut -d'"' -f3)
  SRV_TYPE=$(echo "$line" | grep -o 'type":"[^"]*' | cut -d'"' -f3)
  echo "   - $SRV_NAME ($SRV_TYPE) - $SRV_ID"
done
echo ""

# If no specific service, ask user to set it
if [ "$LIST_ALL" = true ]; then
  echo "💡 To audit a specific service, set:"
  echo "   export RENDER_SERVICE_ID=srv-xxxxx"
  echo ""
  read -p "Enter service ID to audit (or press Enter to skip): " USER_SERVICE_ID
  if [ -n "$USER_SERVICE_ID" ]; then
    RENDER_SERVICE_ID=$USER_SERVICE_ID
    LIST_ALL=false
  else
    echo "Skipping detailed audit."
    exit 0
  fi
fi

# 2. Get service details
echo "2️⃣  Fetching service details..."
SERVICE_INFO=$(render_api GET "/services/$RENDER_SERVICE_ID")

SERVICE_NAME=$(echo "$SERVICE_INFO" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
SERVICE_TYPE=$(echo "$SERVICE_INFO" | grep -o '"type":"[^"]*"' | head -1 | cut -d'"' -f4)
SERVICE_BRANCH=$(echo "$SERVICE_INFO" | grep -o '"branch":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "main")
SERVICE_URL=$(echo "$SERVICE_INFO" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "N/A")
AUTO_DEPLOY=$(echo "$SERVICE_INFO" | grep -o '"autoDeploy":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "unknown")

echo "   Name: $SERVICE_NAME"
echo "   Type: $SERVICE_TYPE"
echo "   Branch: $SERVICE_BRANCH"
echo "   URL: $SERVICE_URL"
echo "   Auto-deploy: $AUTO_DEPLOY"
echo ""

# 3. List all deployments
echo "3️⃣  Fetching deployments..."
DEPLOYS=$(render_api GET "/services/$RENDER_SERVICE_ID/deploys?limit=20")

DEPLOY_COUNT=$(echo "$DEPLOYS" | grep -o '"id":"dep-[^"]*"' | wc -l || echo "0")
echo "   Found $DEPLOY_COUNT deployment(s)"
echo ""

# Parse deployments
echo "📋 Recent Deployments:"
FAILED_DEPLOYS=()
LIVE_DEPLOY=""

echo "$DEPLOYS" | grep -o '"id":"dep-[^"]*","commit":{"id":"[^"]*","message":"[^"]*"},"status":"[^"]*","createdAt":"[^"]*"' | head -10 | while IFS= read -r line; do
  DEP_ID=$(echo "$line" | grep -o 'dep-[^"]*' | head -1)
  DEP_STATUS=$(echo "$line" | grep -o 'status":"[^"]*' | cut -d'"' -f3)
  DEP_COMMIT=$(echo "$line" | grep -o 'message":"[^"]*' | cut -d'"' -f3 | head -c 50)
  DEP_DATE=$(echo "$line" | grep -o 'createdAt":"[^"]*' | cut -d'"' -f3)
  
  STATUS_ICON="⏳"
  case "$DEP_STATUS" in
    live) STATUS_ICON="✅" ;;
    build_failed|update_failed) STATUS_ICON="❌" ;;
    canceled) STATUS_ICON="🚫" ;;
  esac
  
  echo "   $STATUS_ICON $DEP_ID - $DEP_STATUS - $DEP_COMMIT"
  
  # Track failed deployments
  if [[ "$DEP_STATUS" == *"failed"* ]]; then
    echo "$DEP_ID" >> /tmp/failed_deploys.txt
  fi
  
  # Track live deployment
  if [ "$DEP_STATUS" = "live" ] && [ -z "$LIVE_DEPLOY" ]; then
    echo "$DEP_ID" > /tmp/live_deploy.txt
  fi
done
echo ""

# 4. Check environment variables
echo "4️⃣  Checking environment variables..."
ENV_VARS=$(echo "$SERVICE_INFO" | grep -o '"envVars":\[.*\]' || echo "")

if [ -n "$ENV_VARS" ]; then
  ENV_COUNT=$(echo "$ENV_VARS" | grep -o '"key":"[^"]*"' | wc -l || echo "0")
  echo "   Found $ENV_COUNT environment variable(s)"
  
  # Check for required vars
  REQUIRED_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "NODE_ENV")
  for var in "${REQUIRED_VARS[@]}"; do
    if echo "$ENV_VARS" | grep -q "\"key\":\"$var\""; then
      echo "   ✅ $var"
    else
      echo "   ❌ $var (MISSING)"
    fi
  done
else
  echo "   ⚠️  No environment variables found"
fi
echo ""

# 5. Check build configuration
echo "5️⃣  Checking build configuration..."
BUILD_CMD=$(echo "$SERVICE_INFO" | grep -o '"buildCommand":"[^"]*"' | cut -d'"' -f4 || echo "N/A")
START_CMD=$(echo "$SERVICE_INFO" | grep -o '"startCommand":"[^"]*"' | cut -d'"' -f4 || echo "N/A")

echo "   Build: $BUILD_CMD"
echo "   Start: $START_CMD"

# Verify commands
if [[ "$BUILD_CMD" == *"pnpm"* ]] && [[ "$BUILD_CMD" == *"build"* ]]; then
  echo "   ✅ Build command looks good"
else
  echo "   ⚠️  Build command may need review"
fi

if [[ "$START_CMD" == *"serve-static.cjs"* ]] || [[ "$START_CMD" == *"pnpm start"* ]]; then
  echo "   ✅ Start command looks good"
else
  echo "   ⚠️  Start command may need review"
fi
echo ""

# 6. Cleanup old/failed deployments
if [ -f /tmp/failed_deploys.txt ]; then
  FAILED_COUNT=$(wc -l < /tmp/failed_deploys.txt || echo "0")
  if [ "$FAILED_COUNT" -gt 0 ]; then
    echo "6️⃣  Found $FAILED_COUNT failed deployment(s)"
    echo "   Note: Render doesn't provide API to delete deployments"
    echo "   Failed deployments will be cleaned up automatically by Render"
  fi
  rm -f /tmp/failed_deploys.txt
fi
echo ""

# 7. Clear build cache (trigger new deployment with cache clear)
echo "7️⃣  Clearing build cache..."
read -p "   Clear cache and trigger new deployment? (y/N): " CLEAR_CACHE

if [[ "$CLEAR_CACHE" =~ ^[Yy]$ ]]; then
  echo "   Triggering deployment with cache clear..."
  TRIGGER_RESPONSE=$(render_api POST "/services/$RENDER_SERVICE_ID/deploys" '{"clearCache":"clear"}')
  
  NEW_DEPLOY_ID=$(echo "$TRIGGER_RESPONSE" | grep -o '"id":"dep-[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -n "$NEW_DEPLOY_ID" ]; then
    echo "   ✅ New deployment triggered: $NEW_DEPLOY_ID"
    echo "   🔗 Monitor: https://dashboard.render.com/web/$RENDER_SERVICE_ID"
  else
    echo "   ❌ Failed to trigger deployment"
    echo "   Response: $TRIGGER_RESPONSE"
  fi
else
  echo "   Skipped cache clear"
fi
echo ""

# 8. Verify auto-deploy settings
echo "8️⃣  Verifying auto-deploy configuration..."
if [ "$AUTO_DEPLOY" = "yes" ] || [ "$AUTO_DEPLOY" = "true" ]; then
  echo "   ✅ Auto-deploy is ENABLED"
  echo "   Branch: $SERVICE_BRANCH"
  echo "   Pushes to '$SERVICE_BRANCH' will trigger deployments"
else
  echo "   ⚠️  Auto-deploy is DISABLED"
  echo "   You must manually trigger deployments"
  echo ""
  read -p "   Enable auto-deploy? (y/N): " ENABLE_AUTO
  
  if [[ "$ENABLE_AUTO" =~ ^[Yy]$ ]]; then
    echo "   Note: Use Render Dashboard to enable auto-deploy"
    echo "   Settings → Build & Deploy → Auto-Deploy: Yes"
  fi
fi
echo ""

# 9. Test service health
echo "9️⃣  Testing service health..."
if [ "$SERVICE_URL" != "N/A" ]; then
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL" || echo "000")
  
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ Service is responding: $HTTP_STATUS"
    
    # Check title
    TITLE=$(curl -s "$SERVICE_URL" | grep -o "<title>.*</title>" | head -1 || echo "")
    if [ -n "$TITLE" ]; then
      echo "   Title: $TITLE"
      
      if [[ "$TITLE" == *"Elevate for Humanity"* ]]; then
        echo "   ✅ Correct title detected"
      else
        echo "   ⚠️  Title may be from old build"
      fi
    fi
  else
    echo "   ⚠️  Service returned: $HTTP_STATUS"
  fi
else
  echo "   ⚠️  No service URL available"
fi
echo ""

# 10. Summary and recommendations
echo "=================================================="
echo "📊 Audit Summary"
echo "=================================================="
echo ""
echo "Service: $SERVICE_NAME ($SERVICE_TYPE)"
echo "URL: $SERVICE_URL"
echo "Deployments: $DEPLOY_COUNT total"
echo "Auto-deploy: $AUTO_DEPLOY"
echo "Branch: $SERVICE_BRANCH"
echo ""

echo "🔧 Recommendations:"
echo ""

if [ "$AUTO_DEPLOY" != "yes" ] && [ "$AUTO_DEPLOY" != "true" ]; then
  echo "1. ⚠️  Enable auto-deploy in Render Dashboard"
  echo "   Settings → Build & Deploy → Auto-Deploy: Yes"
  echo ""
fi

if [[ "$BUILD_CMD" != *"pnpm"* ]]; then
  echo "2. ⚠️  Update build command to use pnpm"
  echo "   Recommended: pnpm install --frozen-lockfile=false && pnpm run build:frontend"
  echo ""
fi

if [ "$HTTP_STATUS" != "200" ]; then
  echo "3. ⚠️  Service not responding correctly"
  echo "   Check deployment logs in Render Dashboard"
  echo ""
fi

echo "✅ Next Steps:"
echo "1. Review recommendations above"
echo "2. Check Render Dashboard: https://dashboard.render.com/web/$RENDER_SERVICE_ID"
echo "3. Monitor latest deployment"
echo "4. Run verification: ./check-deployment-status.sh"
echo ""

# Cleanup
rm -f /tmp/live_deploy.txt /tmp/failed_deploys.txt

echo "🎉 Audit complete!"
