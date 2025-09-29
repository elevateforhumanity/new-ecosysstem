#!/bin/bash

# 🌐 Cloudflare DNS Automated Setup Script
# This script helps configure DNS for the hub pages

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="elevateforhumanity.org"
SUBDOMAIN="hubs"
TARGET="elevateforhumanity.github.io"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"

echo -e "${MAGENTA}🌐 Cloudflare DNS Setup for Hub Pages${NC}"
echo -e "${MAGENTA}=====================================${NC}"
echo ""

echo -e "${BLUE}Domain:${NC} ${DOMAIN}"
echo -e "${BLUE}Subdomain:${NC} ${SUBDOMAIN}"
echo -e "${BLUE}Full Domain:${NC} ${FULL_DOMAIN}"
echo -e "${BLUE}Target:${NC} ${TARGET}"
echo ""

# Function to test DNS resolution
test_dns() {
    echo -e "${BLUE}🧪 Testing DNS resolution...${NC}"
    
    # Try different DNS resolution methods
    if command -v nslookup &> /dev/null; then
        echo -e "${CYAN}Using nslookup:${NC}"
        nslookup "${FULL_DOMAIN}" 8.8.8.8 || echo -e "${YELLOW}⚠️  DNS not resolved yet${NC}"
    elif command -v dig &> /dev/null; then
        echo -e "${CYAN}Using dig:${NC}"
        dig "${FULL_DOMAIN}" @8.8.8.8 || echo -e "${YELLOW}⚠️  DNS not resolved yet${NC}"
    else
        echo -e "${YELLOW}⚠️  No DNS tools available (nslookup/dig)${NC}"
    fi
    
    # Test with curl
    echo -e "${CYAN}Testing HTTP response:${NC}"
    curl -I "https://${FULL_DOMAIN}" --connect-timeout 5 2>/dev/null || echo -e "${YELLOW}⚠️  Site not accessible yet${NC}"
}

# Function to check if Cloudflare CLI is available
check_cloudflare_cli() {
    if command -v cloudflared &> /dev/null; then
        echo -e "${GREEN}✅ Cloudflare CLI found${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Cloudflare CLI not found${NC}"
        echo "Install with: curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared"
        return 1
    fi
}

# Function to create DNS record via API (requires API token)
create_dns_record() {
    echo -e "${BLUE}🔧 Attempting to create DNS record via API...${NC}"
    
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        echo -e "${YELLOW}⚠️  CLOUDFLARE_API_TOKEN environment variable not set${NC}"
        echo "Please set your Cloudflare API token:"
        echo "export CLOUDFLARE_API_TOKEN='your_token_here'"
        return 1
    fi
    
    # Get zone ID
    echo -e "${CYAN}Getting zone ID for ${DOMAIN}...${NC}"
    ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" | \
        grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$ZONE_ID" ]; then
        echo -e "${RED}❌ Could not get zone ID for ${DOMAIN}${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Zone ID: ${ZONE_ID}${NC}"
    
    # Create CNAME record
    echo -e "${CYAN}Creating CNAME record...${NC}"
    RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data "{
            \"type\": \"CNAME\",
            \"name\": \"${SUBDOMAIN}\",
            \"content\": \"${TARGET}\",
            \"proxied\": false,
            \"ttl\": 1
        }")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ DNS record created successfully!${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to create DNS record${NC}"
        echo "Response: $RESPONSE"
        return 1
    fi
}

# Main execution
echo -e "${BLUE}🔍 Current DNS status:${NC}"
test_dns
echo ""

echo -e "${BLUE}🚀 DNS Setup Options:${NC}"
echo "1. Automated setup (requires Cloudflare API token)"
echo "2. Manual setup instructions"
echo ""

read -p "Choose option (1 or 2): " choice

case $choice in
    1)
        echo -e "${BLUE}🤖 Attempting automated setup...${NC}"
        if create_dns_record; then
            echo -e "${GREEN}✅ Automated setup completed!${NC}"
            echo -e "${YELLOW}⏰ Waiting 30 seconds for DNS propagation...${NC}"
            sleep 30
            test_dns
        else
            echo -e "${RED}❌ Automated setup failed. Please use manual setup.${NC}"
            choice=2
        fi
        ;;
    2)
        echo -e "${BLUE}📋 Manual setup selected${NC}"
        ;;
    *)
        echo -e "${YELLOW}Invalid choice. Showing manual instructions.${NC}"
        choice=2
        ;;
esac

if [ "$choice" = "2" ]; then
    echo ""
    echo -e "${MAGENTA}📋 MANUAL DNS SETUP INSTRUCTIONS${NC}"
    echo -e "${MAGENTA}================================${NC}"
    echo ""
    echo -e "${BLUE}Step 1: Login to Cloudflare${NC}"
    echo -e "${CYAN}   Go to: https://dash.cloudflare.com${NC}"
    echo -e "${CYAN}   Login with your account${NC}"
    echo -e "${CYAN}   Select domain: ${DOMAIN}${NC}"
    echo ""
    echo -e "${BLUE}Step 2: Navigate to DNS${NC}"
    echo -e "${CYAN}   Click 'DNS' in the left sidebar${NC}"
    echo ""
    echo -e "${BLUE}Step 3: Add CNAME Record${NC}"
    echo -e "${CYAN}   Click 'Add record'${NC}"
    echo -e "${CYAN}   Configure these EXACT values:${NC}"
    echo ""
    echo -e "${GREEN}   Type: CNAME${NC}"
    echo -e "${GREEN}   Name: ${SUBDOMAIN}${NC}"
    echo -e "${GREEN}   Target: ${TARGET}${NC}"
    echo -e "${GREEN}   Proxy: DNS only (gray cloud) ⚠️ CRITICAL${NC}"
    echo -e "${GREEN}   TTL: Auto${NC}"
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: Make sure proxy is 'DNS only' (gray cloud)${NC}"
    echo -e "${RED}   NOT 'Proxied' (orange cloud)${NC}"
    echo ""
    echo -e "${BLUE}Step 4: Save and Wait${NC}"
    echo -e "${CYAN}   Click 'Save'${NC}"
    echo -e "${CYAN}   Wait 5-15 minutes for DNS propagation${NC}"
fi

echo ""
echo -e "${BLUE}🧪 Verification Commands:${NC}"
echo -e "${CYAN}   nslookup ${FULL_DOMAIN}${NC}"
echo -e "${CYAN}   curl -I https://${FULL_DOMAIN}${NC}"
echo ""
echo -e "${BLUE}🎯 Expected Result:${NC}"
echo -e "${GREEN}   ${FULL_DOMAIN} canonical name = ${TARGET}${NC}"
echo ""
echo -e "${BLUE}⏰ Timeline:${NC}"
echo -e "${CYAN}   DNS Record Creation: 0-2 minutes${NC}"
echo -e "${CYAN}   DNS Propagation: 5-30 minutes globally${NC}"
echo -e "${CYAN}   Site Accessibility: 15-45 minutes total${NC}"
echo ""
echo -e "${BLUE}🎉 Hub Pages URLs (after setup):${NC}"
echo -e "${GREEN}   https://${FULL_DOMAIN}/student-hub.html${NC}"
echo -e "${GREEN}   https://${FULL_DOMAIN}/business-hub.html${NC}"
echo -e "${GREEN}   https://${FULL_DOMAIN}/community-hub.html${NC}"
echo -e "${GREEN}   https://${FULL_DOMAIN}/educator-hub.html${NC}"
echo ""
echo "🌐 DNS setup script completed!"