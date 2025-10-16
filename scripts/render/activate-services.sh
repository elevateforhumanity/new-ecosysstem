#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Render Services Activation Check"
echo "===================================="
echo ""

# Check for API key
if [ -z "${RENDER_API_KEY:-}" ]; then
  echo "❌ RENDER_API_KEY not set"
  echo ""
  echo "To get your API key:"
  echo "1. Go to https://dashboard.render.com"
  echo "2. Click your profile (top right) → Account Settings"
  echo "3. Scroll to 'API Keys' section"
  echo "4. Click 'Create API Key'"
  echo "5. Copy the key and run:"
  echo "   export RENDER_API_KEY=rnd_xxxxxxxxxxxxx"
  echo ""
  exit 1
fi

echo "✅ API key configured"
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

# Fetch all services
echo "1️⃣  Fetching all services..."
SERVICES=$(render_api GET "/services")

# Check if we got a valid response
if echo "$SERVICES" | grep -q "error"; then
  echo "❌ API Error:"
  echo "$SERVICES" | grep -o '"message":"[^"]*"' | cut -d'"' -f4
  exit 1
fi

# Count services
SERVICE_COUNT=$(echo "$SERVICES" | grep -o '"id":"srv-[^"]*"' | wc -l | tr -d ' ')

echo "   Found: $SERVICE_COUNT service(s)"
echo ""

if [ "$SERVICE_COUNT" -eq 0 ]; then
  echo "❌ No services found in your Render account"
  echo ""
  echo "This could mean:"
  echo "1. You haven't created any services yet"
  echo "2. The API key doesn't have access to services"
  echo "3. Services are in a different team/account"
  echo ""
  echo "📋 Next Steps:"
  echo ""
  echo "Option 1: Create a new service"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "1. Go to https://dashboard.render.com"
  echo "2. Click 'New +' → 'Web Service'"
  echo "3. Connect your GitHub repository: elevateforhumanity/fix2"
  echo "4. Configure:"
  echo "   Name: elevateforhumanity"
  echo "   Branch: main"
  echo "   Build Command: pnpm install --frozen-lockfile=false && pnpm run build:frontend"
  echo "   Start Command: pnpm start"
  echo "5. Add environment variables:"
  echo "   NODE_ENV=production"
  echo "   VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co"
  echo "   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  echo "6. Click 'Create Web Service'"
  echo ""
  echo "Option 2: Check existing services"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "1. Go to https://dashboard.render.com"
  echo "2. Check if services exist in the dashboard"
  echo "3. If they exist but API shows none:"
  echo "   - You may be using the wrong API key"
  echo "   - Services may be in a different team"
  echo "   - Try creating a new API key"
  echo ""
  exit 1
fi

# List all services with details
echo "2️⃣  Service Details:"
echo ""

ACTIVE_COUNT=0
SUSPENDED_COUNT=0

# Parse and display each service
echo "$SERVICES" | grep -o '"service":{[^}]*"id":"srv-[^"]*"[^}]*"name":"[^"]*"[^}]*"type":"[^"]*"[^}]*"suspended":"[^"]*"[^}]*"suspenders":\[[^\]]*\]' | while IFS= read -r service_block; do
  SRV_ID=$(echo "$service_block" | grep -o 'srv-[^"]*' | head -1)
  SRV_NAME=$(echo "$service_block" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
  SRV_TYPE=$(echo "$service_block" | grep -o '"type":"[^"]*"' | cut -d'"' -f4)
  SUSPENDED=$(echo "$service_block" | grep -o '"suspended":"[^"]*"' | cut -d'"' -f4)
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Service: $SRV_NAME"
  echo "ID: $SRV_ID"
  echo "Type: $SRV_TYPE"
  
  if [ "$SUSPENDED" = "suspended" ] || [ "$SUSPENDED" = "true" ]; then
    echo "Status: ⚠️  SUSPENDED"
    SUSPENDED_COUNT=$((SUSPENDED_COUNT + 1))
    echo ""
    echo "This service is suspended. To resume:"
    echo "1. Go to https://dashboard.render.com/web/$SRV_ID"
    echo "2. Click 'Resume Service' button"
    echo "3. Wait for service to start"
  else
    echo "Status: ✅ ACTIVE"
    ACTIVE_COUNT=$((ACTIVE_COUNT + 1))
    
    # Get more details
    SERVICE_DETAIL=$(render_api GET "/services/$SRV_ID")
    SERVICE_URL=$(echo "$SERVICE_DETAIL" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "N/A")
    
    echo "URL: $SERVICE_URL"
    
    # Test if service is responding
    if [ "$SERVICE_URL" != "N/A" ]; then
      HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL" 2>/dev/null || echo "000")
      
      if [ "$HTTP_STATUS" = "200" ]; then
        echo "Health: ✅ Responding ($HTTP_STATUS)"
      else
        echo "Health: ⚠️  Not responding ($HTTP_STATUS)"
      fi
    fi
  fi
  
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total Services: $SERVICE_COUNT"
echo "Active: $ACTIVE_COUNT"
echo "Suspended: $SUSPENDED_COUNT"
echo ""

if [ "$SUSPENDED_COUNT" -gt 0 ]; then
  echo "⚠️  You have $SUSPENDED_COUNT suspended service(s)"
  echo ""
  echo "To resume suspended services:"
  echo "1. Go to https://dashboard.render.com"
  echo "2. Click on the suspended service"
  echo "3. Click 'Resume Service'"
  echo ""
  exit 1
elif [ "$ACTIVE_COUNT" -eq 0 ]; then
  echo "❌ No active services found"
  echo ""
  echo "All services may be suspended or deleted."
  echo "Check https://dashboard.render.com"
  echo ""
  exit 1
else
  echo "✅ All services are active!"
  echo ""
  
  # If we have exactly one active service, export it
  if [ "$ACTIVE_COUNT" -eq 1 ]; then
    SINGLE_SERVICE_ID=$(echo "$SERVICES" | grep -o '"id":"srv-[^"]*"' | head -1 | cut -d'"' -f4)
    echo "💡 Single service detected: $SINGLE_SERVICE_ID"
    echo ""
    echo "To use this service with other scripts, run:"
    echo "  export RENDER_SERVICE_ID=$SINGLE_SERVICE_ID"
    echo ""
    
    # Save to file for easy sourcing
    echo "export RENDER_SERVICE_ID=$SINGLE_SERVICE_ID" > .render-service-id
    echo "✅ Saved to .render-service-id"
    echo "   Source it: source .render-service-id"
  fi
fi

echo ""
echo "🎉 Service check complete!"
