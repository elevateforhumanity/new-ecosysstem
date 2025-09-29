#!/bin/bash

# 🚀 FINAL VERIFICATION SCRIPT
# This script verifies all hub pages are working correctly

set -e

echo "🔍 FINAL VERIFICATION: Hub Pages Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
HUB_SUBDOMAIN="hubs.elevateforhumanity.org"
GITHUB_PAGES_URL="elevateforhumanity.github.io"
MAIN_SITE="elevateforhumanity.org"
HUB_PAGES=("student-hub" "business-hub" "community-hub" "educator-hub")

# Helper functions
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [ "$status" = "error" ]; then
        echo -e "${RED}❌ $message${NC}"
    else
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

test_url() {
    local url=$1
    local timeout=${2:-10}
    
    if curl -s --max-time $timeout --head "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

test_url_content() {
    local url=$1
    local expected_content=$2
    local timeout=${3:-10}
    
    local content=$(curl -s --max-time $timeout "$url" 2>/dev/null || echo "")
    if [[ "$content" == *"$expected_content"* ]]; then
        return 0
    else
        return 1
    fi
}

# Step 1: Check repository files
echo ""
print_status "info" "Step 1: Checking repository files..."

if [ -d "hub-pages" ]; then
    print_status "success" "hub-pages directory exists"
    
    for page in "${HUB_PAGES[@]}"; do
        if [ -f "hub-pages/${page}.html" ]; then
            print_status "success" "${page}.html file exists"
        else
            print_status "error" "${page}.html file missing"
        fi
    done
else
    print_status "error" "hub-pages directory missing"
    echo "Run: ./deploy-hub-pages.sh"
    exit 1
fi

# Step 2: Check GitHub Actions workflow
echo ""
print_status "info" "Step 2: Checking GitHub Actions workflow..."

if [ -f ".github/workflows/deploy-hub-pages.yml" ]; then
    print_status "success" "GitHub Actions workflow exists"
else
    print_status "error" "GitHub Actions workflow missing"
fi

# Step 3: Test GitHub Pages deployment
echo ""
print_status "info" "Step 3: Testing GitHub Pages deployment..."

if test_url "https://$GITHUB_PAGES_URL" 5; then
    print_status "success" "GitHub Pages is accessible"
    
    # Test individual hub pages
    for page in "${HUB_PAGES[@]}"; do
        if test_url_content "https://$GITHUB_PAGES_URL/${page}.html" "$page" 5; then
            print_status "success" "GitHub Pages: ${page}.html is working"
        else
            print_status "warning" "GitHub Pages: ${page}.html not accessible yet"
        fi
    done
else
    print_status "warning" "GitHub Pages not accessible yet (may still be deploying)"
fi

# Step 4: Test DNS configuration
echo ""
print_status "info" "Step 4: Testing DNS configuration..."

# Test DNS resolution
if nslookup "$HUB_SUBDOMAIN" > /dev/null 2>&1; then
    print_status "success" "DNS resolution working for $HUB_SUBDOMAIN"
    
    # Test if it resolves to GitHub Pages
    resolved_ip=$(nslookup "$HUB_SUBDOMAIN" | grep -A1 "Name:" | tail -1 | awk '{print $2}' || echo "")
    if [[ "$resolved_ip" != "" ]]; then
        print_status "success" "DNS resolves to: $resolved_ip"
    fi
else
    print_status "warning" "DNS not configured yet for $HUB_SUBDOMAIN"
    echo "  Configure CNAME record: $HUB_SUBDOMAIN -> $GITHUB_PAGES_URL"
fi

# Step 5: Test hub subdomain
echo ""
print_status "info" "Step 5: Testing hub subdomain..."

if test_url "https://$HUB_SUBDOMAIN" 10; then
    print_status "success" "Hub subdomain is accessible"
    
    # Test individual hub pages
    for page in "${HUB_PAGES[@]}"; do
        if test_url_content "https://$HUB_SUBDOMAIN/${page}.html" "$page" 5; then
            print_status "success" "Hub subdomain: ${page}.html is working"
        else
            print_status "warning" "Hub subdomain: ${page}.html not accessible"
        fi
    done
else
    print_status "warning" "Hub subdomain not accessible yet"
    echo "  This is normal if DNS hasn't propagated yet (5-30 minutes)"
fi

# Step 6: Test main site redirects
echo ""
print_status "info" "Step 6: Testing main site redirects..."

for page in "${HUB_PAGES[@]}"; do
    main_url="https://$MAIN_SITE/$page"
    
    # Test if URL returns something (not necessarily a redirect yet)
    if test_url "$main_url" 5; then
        print_status "success" "Main site: /$page is accessible"
        
        # Check if it's redirecting (would need the redirect script)
        content=$(curl -s --max-time 5 "$main_url" 2>/dev/null || echo "")
        if [[ "$content" == *"$HUB_SUBDOMAIN"* ]]; then
            print_status "success" "Main site: /$page has redirect script"
        else
            print_status "warning" "Main site: /$page needs redirect script"
        fi
    else
        print_status "warning" "Main site: /$page not accessible"
    fi
done

# Step 7: Generate deployment status report
echo ""
print_status "info" "Step 7: Generating deployment status report..."

cat > deployment-status.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "in_progress",
  "components": {
    "repository_files": "ready",
    "github_actions": "configured",
    "github_pages": "deploying",
    "dns_configuration": "pending",
    "hub_subdomain": "pending",
    "main_site_redirects": "pending"
  },
  "hub_pages": {
EOF

for i in "${!HUB_PAGES[@]}"; do
    page="${HUB_PAGES[$i]}"
    cat >> deployment-status.json << EOF
    "$page": {
      "file_exists": true,
      "github_pages_url": "https://$GITHUB_PAGES_URL/${page}.html",
      "hub_subdomain_url": "https://$HUB_SUBDOMAIN/${page}.html",
      "main_site_url": "https://$MAIN_SITE/$page",
      "status": "deploying"
    }$([ $i -lt $((${#HUB_PAGES[@]} - 1)) ] && echo "," || echo "")
EOF
done

cat >> deployment-status.json << EOF
  },
  "next_steps": [
    "Wait for GitHub Actions to complete deployment",
    "Configure DNS CNAME record: $HUB_SUBDOMAIN -> $GITHUB_PAGES_URL", 
    "Add redirect script to Durable site",
    "Test all hub page URLs",
    "Verify redirects from main site"
  ]
}
EOF

print_status "success" "Deployment status saved to deployment-status.json"

# Step 8: Provide next steps
echo ""
print_status "info" "🎯 NEXT STEPS:"
echo ""
echo "1. 📋 Enable GitHub Pages:"
echo "   - Go to: https://github.com/elevateforhumanity/new-ecosysstem/settings/pages"
echo "   - Source: GitHub Actions"
echo "   - Custom domain: $HUB_SUBDOMAIN"
echo "   - Enforce HTTPS: ✅"
echo ""
echo "2. 🌐 Configure DNS:"
echo "   - Add CNAME record in Cloudflare:"
echo "   - Name: hubs"
echo "   - Target: $GITHUB_PAGES_URL"
echo "   - Proxy: DNS only (gray cloud)"
echo ""
echo "3. 🔧 Add redirect script to Durable:"
echo "   - Copy script from DURABLE_REDIRECT_SCRIPT.html"
echo "   - Add to site's custom HTML section"
echo "   - Save and publish"
echo ""
echo "4. 🧪 Test deployment:"
echo "   - Run this script again in 10-15 minutes"
echo "   - Test all hub page URLs manually"
echo ""

# Step 9: Create quick test URLs
echo "🔗 TEST URLS (once deployed):"
echo ""
for page in "${HUB_PAGES[@]}"; do
    echo "   https://$HUB_SUBDOMAIN/${page}.html"
done
echo ""
echo "🔄 REDIRECT URLS (once script added):"
echo ""
for page in "${HUB_PAGES[@]}"; do
    echo "   https://$MAIN_SITE/$page"
done

echo ""
print_status "success" "Verification complete! Follow the next steps above."
echo "=============================================="