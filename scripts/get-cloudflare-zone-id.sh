#!/bin/bash
# Get Cloudflare Zone ID for your domain

echo "🔍 CLOUDFLARE ZONE ID FINDER"
echo "============================="
echo ""

CLOUDFLARE_API_TOKEN="Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS"
CLOUDFLARE_ACCOUNT_ID="6ba1d2a52a3fa230972960db307ac7c0"

export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID

echo "## Method 1: Using Cloudflare API"
echo "----------------------------------"
echo ""

# Try to list zones
echo "Fetching zones from Cloudflare..."
ZONES=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json")

if echo "$ZONES" | grep -q '"success":true'; then
    echo "✅ Successfully connected to Cloudflare API"
    echo ""
    echo "Your domains and Zone IDs:"
    echo ""
    echo "$ZONES" | grep -o '"name":"[^"]*"' | sed 's/"name":"//;s/"$//' | while read domain; do
        ZONE_ID=$(echo "$ZONES" | grep -A 5 "\"name\":\"$domain\"" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"$//')
        if [ -n "$ZONE_ID" ]; then
            echo "  Domain: $domain"
            echo "  Zone ID: $ZONE_ID"
            echo ""
        fi
    done
else
    echo "❌ Failed to fetch zones from API"
    echo ""
    echo "Response:"
    echo "$ZONES" | head -20
    echo ""
fi

echo "## Method 2: Manual Lookup"
echo "--------------------------"
echo ""
echo "If the API method didn't work, get your Zone ID manually:"
echo ""
echo "1. Go to: https://dash.cloudflare.com/"
echo "2. Click on your domain (e.g., elevateforhumanity.org)"
echo "3. Scroll down in the Overview tab"
echo "4. Look for 'Zone ID' in the right sidebar"
echo "5. Copy the Zone ID (format: 32 character hex string)"
echo ""
echo "Example Zone ID format: 1234567890abcdef1234567890abcdef"
echo ""

echo "## What to do with Zone ID"
echo "--------------------------"
echo ""
echo "Add it as a GitHub secret:"
echo "1. Go to: https://github.com/elevateforhumanity/fix2/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Name: CLOUDFLARE_ZONE_ID"
echo "4. Value: [paste your Zone ID]"
echo "5. Click 'Add secret'"
echo ""

echo "This enables cache purging in the GitHub Actions workflow."
