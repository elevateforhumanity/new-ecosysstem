#!/bin/bash

echo "🔍 Deployment Status Check"
echo "=========================="
echo ""

URL="https://elevateforhumanity.onrender.com"

echo "1️⃣  Checking service status..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)
echo "   HTTP Status: $HTTP_STATUS"
echo ""

echo "2️⃣  Checking page title..."
TITLE=$(curl -s $URL | grep -o "<title>.*</title>" | head -1)
echo "   Current: $TITLE"
echo "   Expected: <title>Elevate for Humanity - Workforce Development & Learning Platform</title>"
echo ""

if [[ "$TITLE" == *"Elevate for Humanity"* ]]; then
  echo "   ✅ NEW BUILD DEPLOYED!"
else
  echo "   ⚠️  Still showing old build"
fi
echo ""

echo "3️⃣  Checking routes..."
for route in "" "programs" "lms" "hub" "connect"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL/$route)
  echo "   /$route: $STATUS"
done
echo ""

echo "4️⃣  Checking static files..."
curl -s -o /dev/null -w "   /sitemap.xml: %{http_code}\n" $URL/sitemap.xml
curl -s -o /dev/null -w "   /robots.txt: %{http_code}\n" $URL/robots.txt
echo ""

echo "5️⃣  Latest local commit..."
echo "   $(git log --oneline -1)"
echo ""

echo "=========================="
if [[ "$TITLE" == *"Elevate for Humanity"* ]]; then
  echo "✅ Deployment successful!"
else
  echo "⏳ Deployment still in progress or needs manual trigger"
  echo ""
  echo "Next steps:"
  echo "1. Wait 5-10 minutes for Render to build"
  echo "2. Check Render Dashboard: https://dashboard.render.com"
  echo "3. Manually trigger deploy if needed"
  echo "4. Run this script again: ./check-deployment-status.sh"
fi
echo ""
