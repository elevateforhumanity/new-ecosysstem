#!/usr/bin/env bash
set -euo pipefail

echo "🔐 Render Credentials Setup"
echo "==========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if credentials already exist
if [ -f ".env.render" ]; then
  echo "⚠️  Found existing .env.render file"
  echo ""
  cat .env.render
  echo ""
  read -p "Overwrite existing credentials? (y/N): " OVERWRITE
  if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
    echo "Keeping existing credentials."
    echo ""
    echo "To use them, run: source .env.render"
    exit 0
  fi
fi

echo -e "${BLUE}Step 1: Get Render API Key${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open: https://dashboard.render.com"
echo "2. Click your profile (top right) → Account Settings"
echo "3. Scroll to 'API Keys' section"
echo "4. Click 'Create API Key'"
echo "5. Give it a name (e.g., 'Autopilot Deploy')"
echo "6. Copy the key (starts with 'rnd_')"
echo ""

read -p "Paste your Render API Key: " RENDER_API_KEY

if [ -z "$RENDER_API_KEY" ]; then
  echo "❌ API key cannot be empty"
  exit 1
fi

if [[ ! "$RENDER_API_KEY" =~ ^rnd_ ]]; then
  echo "⚠️  Warning: API key should start with 'rnd_'"
  read -p "Continue anyway? (y/N): " CONTINUE
  if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo ""
echo -e "${GREEN}✅ API Key saved${NC}"
echo ""

# Test API key
echo "Testing API key..."
TEST_RESPONSE=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services" || echo "error")

if echo "$TEST_RESPONSE" | grep -q "error\|unauthorized\|invalid"; then
  echo "❌ API key test failed"
  echo "Response: $TEST_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ API key is valid${NC}"
echo ""

# Get service ID
echo -e "${BLUE}Step 2: Get Service ID${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# List services
SERVICE_COUNT=$(echo "$TEST_RESPONSE" | grep -o '"id":"srv-[^"]*"' | wc -l | tr -d ' ')

if [ "$SERVICE_COUNT" -eq 0 ]; then
  echo "❌ No services found in your Render account"
  echo ""
  echo "You need to create a service first:"
  echo "1. Go to https://dashboard.render.com"
  echo "2. Click 'New +' → 'Web Service'"
  echo "3. Connect repository: elevateforhumanity/fix2"
  echo "4. Configure and create service"
  echo "5. Then run this script again"
  echo ""
  exit 1
fi

echo "Found $SERVICE_COUNT service(s):"
echo ""

# Display services
SERVICE_LIST=$(echo "$TEST_RESPONSE" | grep -o '"id":"srv-[^"]*","name":"[^"]*","type":"[^"]*"')
INDEX=1

declare -a SERVICE_IDS
declare -a SERVICE_NAMES

while IFS= read -r line; do
  SRV_ID=$(echo "$line" | grep -o 'srv-[^"]*' | head -1)
  SRV_NAME=$(echo "$line" | grep -o 'name":"[^"]*' | cut -d'"' -f3)
  SRV_TYPE=$(echo "$line" | grep -o 'type":"[^"]*' | cut -d'"' -f3)
  
  SERVICE_IDS[$INDEX]=$SRV_ID
  SERVICE_NAMES[$INDEX]=$SRV_NAME
  
  echo "  $INDEX) $SRV_NAME ($SRV_TYPE)"
  echo "     ID: $SRV_ID"
  echo ""
  
  INDEX=$((INDEX + 1))
done <<< "$SERVICE_LIST"

echo ""

if [ "$SERVICE_COUNT" -eq 1 ]; then
  echo "Only one service found, using: ${SERVICE_IDS[1]}"
  RENDER_SERVICE_ID="${SERVICE_IDS[1]}"
else
  read -p "Select service number (1-$SERVICE_COUNT): " SERVICE_NUM
  
  if [ "$SERVICE_NUM" -lt 1 ] || [ "$SERVICE_NUM" -gt "$SERVICE_COUNT" ]; then
    echo "❌ Invalid selection"
    exit 1
  fi
  
  RENDER_SERVICE_ID="${SERVICE_IDS[$SERVICE_NUM]}"
fi

echo ""
echo -e "${GREEN}✅ Service ID: $RENDER_SERVICE_ID${NC}"
echo ""

# Save credentials
echo -e "${BLUE}Step 3: Save Credentials${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > .env.render <<EOF
# Render Credentials
# Generated: $(date)
export RENDER_API_KEY=$RENDER_API_KEY
export RENDER_SERVICE_ID=$RENDER_SERVICE_ID
EOF

echo -e "${GREEN}✅ Saved to .env.render${NC}"
echo ""

# Add to .gitignore
if ! grep -q ".env.render" .gitignore 2>/dev/null; then
  echo ".env.render" >> .gitignore
  echo -e "${GREEN}✅ Added .env.render to .gitignore${NC}"
fi

# Source the file
source .env.render

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Credentials saved and loaded!"
echo ""
echo "To use in future sessions, run:"
echo -e "  ${YELLOW}source .env.render${NC}"
echo ""
echo "Or add to your shell profile (~/.bashrc or ~/.zshrc):"
echo -e "  ${YELLOW}source /workspaces/fix2/.env.render${NC}"
echo ""

# Test service access
echo "Testing service access..."
SERVICE_INFO=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services/$RENDER_SERVICE_ID")

SERVICE_NAME=$(echo "$SERVICE_INFO" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
SERVICE_URL=$(echo "$SERVICE_INFO" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "N/A")

echo ""
echo "Service Details:"
echo "  Name: $SERVICE_NAME"
echo "  URL: $SERVICE_URL"
echo ""

# Offer to run next steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Check service status:"
echo "   ./scripts/render/activate-services.sh"
echo ""
echo "2. Enable auto-deploy:"
echo "   ./scripts/render/enable-auto-deploy.sh"
echo ""
echo "3. Run full audit:"
echo "   ./scripts/render/audit-and-cleanup.sh"
echo ""
echo "4. Verify setup:"
echo "   ./scripts/verify-full-setup.sh"
echo ""

read -p "Run service status check now? (y/N): " RUN_CHECK

if [[ "$RUN_CHECK" =~ ^[Yy]$ ]]; then
  echo ""
  ./scripts/render/activate-services.sh
fi

echo ""
echo "🎉 All done!"
