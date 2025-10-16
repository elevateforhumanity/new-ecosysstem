#!/bin/bash

echo "🔍 Monitoring Render Deployment"
echo "================================"
echo ""

URL="https://elevateforhumanity.onrender.com"
MAX_ATTEMPTS=20
SLEEP_TIME=15

for i in $(seq 1 $MAX_ATTEMPTS); do
    echo "Attempt $i/$MAX_ATTEMPTS (waiting ${SLEEP_TIME}s between checks)..."
    
    # Check HTTP status
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)
    
    # Get title
    TITLE=$(curl -s $URL | grep -o "<title>.*</title>" | head -1)
    
    echo "  Status: $HTTP_STATUS"
    echo "  Title: $TITLE"
    
    # Check if deployment is complete
    if [[ "$TITLE" == *"Elevate for Humanity"* ]]; then
        echo ""
        echo "✅ NEW DEPLOYMENT DETECTED!"
        echo "================================"
        echo ""
        echo "Testing routes..."
        for route in "" "programs" "lms" "hub" "connect"; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL/$route)
            echo "  /$route: $STATUS"
        done
        echo ""
        echo "🎉 Deployment successful!"
        exit 0
    fi
    
    if [ $i -lt $MAX_ATTEMPTS ]; then
        echo "  ⏳ Still old build, waiting..."
        sleep $SLEEP_TIME
    fi
    echo ""
done

echo "⚠️  Deployment not detected after $((MAX_ATTEMPTS * SLEEP_TIME / 60)) minutes"
echo ""
echo "Possible reasons:"
echo "1. Render is still building (check dashboard)"
echo "2. Build failed (check logs in Render dashboard)"
echo "3. Service needs manual deploy trigger"
echo ""
echo "Next steps:"
echo "1. Go to: https://dashboard.render.com"
echo "2. Check deployment logs"
echo "3. Manually trigger deploy if needed"
