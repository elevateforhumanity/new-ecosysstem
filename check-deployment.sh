#!/bin/bash
# Check Render deployment status

echo "🔍 Checking Render Deployment Status"
echo "======================================"
echo ""

# Check current deployed version
echo "📦 Deployed Version:"
DEPLOYED_HASH=$(curl -s https://elevateforhumanity.onrender.com/ | grep -o 'index-[^"]*\.js' | head -1)
echo "   Asset: $DEPLOYED_HASH"
echo ""

# Check local build version
echo "📦 Local Build Version:"
LOCAL_HASH=$(ls -1 dist/assets/index-*.js 2>/dev/null | head -1 | xargs basename)
echo "   Asset: $LOCAL_HASH"
echo ""

# Check if they match
if [ "$DEPLOYED_HASH" = "$LOCAL_HASH" ]; then
    echo "✅ Deployment is UP TO DATE"
else
    echo "❌ Deployment is OUTDATED"
    echo ""
    echo "Possible reasons:"
    echo "1. Render is still building (wait 5-10 minutes)"
    echo "2. Render auto-deploy is not configured"
    echo "3. Build failed on Render (check dashboard)"
    echo ""
    echo "Actions:"
    echo "- Check: https://dashboard.render.com"
    echo "- Manual deploy: Click 'Manual Deploy' in Render dashboard"
fi
echo ""

# Check if meta tags are present
echo "🏷️  Checking Meta Tags:"
TITLE=$(curl -s https://elevateforhumanity.onrender.com/programs | grep -o '<title>[^<]*</title>')
echo "   /programs: $TITLE"

if [[ "$TITLE" == *"Training Programs"* ]]; then
    echo "   ✅ SEO meta tags are working!"
else
    echo "   ❌ SEO meta tags NOT working"
fi
