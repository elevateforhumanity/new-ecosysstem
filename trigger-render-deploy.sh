#!/bin/bash
set -e

echo "🚀 Render Deployment Trigger & Diagnostics"
echo "=========================================="
echo ""

# Check if we have the necessary info
if [ -z "$RENDER_API_KEY" ]; then
  echo "❌ RENDER_API_KEY not set"
  echo ""
  echo "To get your Render API key:"
  echo "1. Go to https://dashboard.render.com"
  echo "2. Click your profile → Account Settings"
  echo "3. API Keys → Create API Key"
  echo "4. Export it: export RENDER_API_KEY=rnd_xxxxx"
  echo ""
  exit 1
fi

if [ -z "$RENDER_SERVICE_ID" ]; then
  echo "❌ RENDER_SERVICE_ID not set"
  echo ""
  echo "To get your service ID:"
  echo "1. Go to your service in Render Dashboard"
  echo "2. URL will be: https://dashboard.render.com/web/srv-XXXXX"
  echo "3. Export it: export RENDER_SERVICE_ID=srv-xxxxx"
  echo ""
  exit 1
fi

echo "📋 Service ID: $RENDER_SERVICE_ID"
echo ""

# Get service info
echo "1️⃣  Fetching service information..."
SERVICE_INFO=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services/$RENDER_SERVICE_ID")

SERVICE_NAME=$(echo "$SERVICE_INFO" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
SERVICE_TYPE=$(echo "$SERVICE_INFO" | grep -o '"type":"[^"]*"' | head -1 | cut -d'"' -f4)
SERVICE_URL=$(echo "$SERVICE_INFO" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "   Name: $SERVICE_NAME"
echo "   Type: $SERVICE_TYPE"
echo "   URL: $SERVICE_URL"
echo ""

# Get latest deploy
echo "2️⃣  Fetching latest deployment..."
DEPLOYS=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys?limit=1")

LATEST_DEPLOY_ID=$(echo "$DEPLOYS" | grep -o '"id":"dep-[^"]*"' | head -1 | cut -d'"' -f4)
LATEST_STATUS=$(echo "$DEPLOYS" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
LATEST_COMMIT=$(echo "$DEPLOYS" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "   Deploy ID: $LATEST_DEPLOY_ID"
echo "   Status: $LATEST_STATUS"
echo "   Commit: $LATEST_COMMIT"
echo ""

# Check if deployment is in progress or failed
if [ "$LATEST_STATUS" = "build_failed" ] || [ "$LATEST_STATUS" = "update_failed" ]; then
  echo "❌ Latest deployment FAILED: $LATEST_STATUS"
  echo ""
  echo "3️⃣  Fetching error details..."
  
  DEPLOY_DETAILS=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
    "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys/$LATEST_DEPLOY_ID")
  
  echo "$DEPLOY_DETAILS" | grep -o '"error":"[^"]*"' | cut -d'"' -f4
  echo ""
  
elif [ "$LATEST_STATUS" = "live" ]; then
  echo "✅ Latest deployment is LIVE"
  echo ""
  
else
  echo "⏳ Deployment in progress: $LATEST_STATUS"
  echo ""
fi

# Trigger new deployment
echo "4️⃣  Triggering new deployment..."
TRIGGER_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -d '{"clearCache":"clear"}')

NEW_DEPLOY_ID=$(echo "$TRIGGER_RESPONSE" | grep -o '"id":"dep-[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$NEW_DEPLOY_ID" ]; then
  echo "   ✅ New deployment triggered: $NEW_DEPLOY_ID"
  echo ""
  echo "5️⃣  Monitoring deployment (will check every 15 seconds)..."
  echo ""
  
  # Monitor the deployment
  for i in {1..40}; do
    sleep 15
    
    DEPLOY_STATUS=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
      "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys/$NEW_DEPLOY_ID")
    
    STATUS=$(echo "$DEPLOY_STATUS" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    echo "   [$((i*15))s] Status: $STATUS"
    
    if [ "$STATUS" = "live" ]; then
      echo ""
      echo "🎉 Deployment SUCCESSFUL!"
      echo ""
      echo "Testing URL..."
      TITLE=$(curl -s "$SERVICE_URL" | grep -o "<title>.*</title>" | head -1)
      echo "   Title: $TITLE"
      echo ""
      exit 0
    fi
    
    if [ "$STATUS" = "build_failed" ] || [ "$STATUS" = "update_failed" ]; then
      echo ""
      echo "❌ Deployment FAILED: $STATUS"
      echo ""
      echo "Error details:"
      echo "$DEPLOY_STATUS" | grep -o '"error":"[^"]*"' | cut -d'"' -f4
      echo ""
      echo "🔗 Check logs: https://dashboard.render.com/web/$RENDER_SERVICE_ID/logs"
      exit 1
    fi
  done
  
  echo ""
  echo "⏰ Timeout after 10 minutes"
  echo "🔗 Check status: https://dashboard.render.com/web/$RENDER_SERVICE_ID"
  
else
  echo "   ❌ Failed to trigger deployment"
  echo "   Response: $TRIGGER_RESPONSE"
fi
