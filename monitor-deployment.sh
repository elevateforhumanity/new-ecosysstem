#!/bin/bash

# 📊 Hub Pages Deployment Monitoring Script
# This script monitors the status of GitHub Pages deployment and DNS configuration

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
REPO_OWNER="elevateforhumanity"
REPO_NAME="new-ecosysstem"
DOMAIN="hubs.elevateforhumanity.org"
TARGET="elevateforhumanity.github.io"

# Hub pages to check
HUB_PAGES=(
    "student-hub.html"
    "business-hub.html"
    "community-hub.html"
    "educator-hub.html"
)

echo -e "${MAGENTA}📊 Hub Pages Deployment Monitor${NC}"
echo -e "${MAGENTA}===============================${NC}"
echo -e "${BLUE}Repository:${NC} ${REPO_OWNER}/${REPO_NAME}"
echo -e "${BLUE}Domain:${NC} ${DOMAIN}"
echo -e "${BLUE}Target:${NC} ${TARGET}"
echo ""

# Function to check GitHub Pages status
check_github_pages() {
    echo -e "${BLUE}🔍 Checking GitHub Pages status...${NC}"
    
    RESPONSE=$(curl -s "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pages" 2>/dev/null)
    
    if echo "$RESPONSE" | grep -q '"html_url"'; then
        STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        URL=$(echo "$RESPONSE" | grep -o '"html_url":"[^"]*"' | cut -d'"' -f4)
        CUSTOM_DOMAIN=$(echo "$RESPONSE" | grep -o '"custom_domain":"[^"]*"' | cut -d'"' -f4)
        HTTPS_ENFORCED=$(echo "$RESPONSE" | grep -o '"https_enforced":[^,}]*' | cut -d':' -f2)
        
        echo -e "${GREEN}✅ GitHub Pages is configured${NC}"
        echo -e "${CYAN}   Status: ${STATUS}${NC}"
        echo -e "${CYAN}   URL: ${URL}${NC}"
        echo -e "${CYAN}   Custom Domain: ${CUSTOM_DOMAIN:-"Not set"}${NC}"
        echo -e "${CYAN}   HTTPS Enforced: ${HTTPS_ENFORCED}${NC}"
        return 0
    else
        echo -e "${RED}❌ GitHub Pages is not configured${NC}"
        echo -e "${YELLOW}   Configure at: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/pages${NC}"
        return 1
    fi
}

# Function to check DNS resolution
check_dns() {
    echo -e "${BLUE}🌐 Checking DNS resolution...${NC}"
    
    if command -v nslookup &> /dev/null; then
        DNS_RESULT=$(nslookup "${DOMAIN}" 8.8.8.8 2>/dev/null | grep "canonical name" | awk '{print $4}' | sed 's/\.$//')
        
        if [ "$DNS_RESULT" = "$TARGET" ]; then
            echo -e "${GREEN}✅ DNS is correctly configured${NC}"
            echo -e "${CYAN}   ${DOMAIN} → ${DNS_RESULT}${NC}"
            return 0
        elif [ -n "$DNS_RESULT" ]; then
            echo -e "${YELLOW}⚠️  DNS points to wrong target${NC}"
            echo -e "${CYAN}   Expected: ${TARGET}${NC}"
            echo -e "${CYAN}   Actual: ${DNS_RESULT}${NC}"
            return 1
        else
            echo -e "${RED}❌ DNS record not found${NC}"
            echo -e "${YELLOW}   Add CNAME record: ${DOMAIN} → ${TARGET}${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  nslookup not available, using curl test${NC}"
        if curl -s --connect-timeout 5 "https://${DOMAIN}" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Domain is accessible${NC}"
            return 0
        else
            echo -e "${RED}❌ Domain is not accessible${NC}"
            return 1
        fi
    fi
}

# Function to check workflow status
check_workflows() {
    echo -e "${BLUE}⚙️  Checking GitHub Actions workflows...${NC}"
    
    # Check hub pages workflows
    WORKFLOWS=$(curl -s "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows" | grep -o '"name":"[^"]*hub[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$WORKFLOWS" ]; then
        echo -e "${GREEN}✅ Hub pages workflows found:${NC}"
        echo "$WORKFLOWS" | while read -r workflow; do
            echo -e "${CYAN}   - ${workflow}${NC}"
        done
        
        # Check recent runs
        RECENT_RUNS=$(curl -s "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=3" | grep -o '"conclusion":"[^"]*"' | head -3)
        
        if [ -n "$RECENT_RUNS" ]; then
            echo -e "${BLUE}   Recent workflow conclusions:${NC}"
            echo "$RECENT_RUNS" | while read -r conclusion; do
                STATUS=$(echo "$conclusion" | cut -d'"' -f4)
                case "$STATUS" in
                    "success")
                        echo -e "${GREEN}   ✅ ${STATUS}${NC}"
                        ;;
                    "failure")
                        echo -e "${RED}   ❌ ${STATUS}${NC}"
                        ;;
                    "startup_failure")
                        echo -e "${YELLOW}   ⚠️  ${STATUS} (GitHub Pages not configured)${NC}"
                        ;;
                    *)
                        echo -e "${CYAN}   ℹ️  ${STATUS}${NC}"
                        ;;
                esac
            done
        fi
        return 0
    else
        echo -e "${YELLOW}⚠️  No hub pages workflows found${NC}"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl() {
    echo -e "${BLUE}🔒 Checking SSL certificate...${NC}"
    
    if command -v openssl &> /dev/null; then
        SSL_INFO=$(echo | openssl s_client -connect "${DOMAIN}:443" -servername "${DOMAIN}" 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null)
        
        if [ $? -eq 0 ] && [ -n "$SSL_INFO" ]; then
            echo -e "${GREEN}✅ SSL certificate is valid${NC}"
            echo "$SSL_INFO" | while read -r line; do
                echo -e "${CYAN}   ${line}${NC}"
            done
            return 0
        else
            echo -e "${RED}❌ SSL certificate not available or invalid${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  OpenSSL not available, using curl test${NC}"
        if curl -s --connect-timeout 5 "https://${DOMAIN}" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ HTTPS is working${NC}"
            return 0
        else
            echo -e "${RED}❌ HTTPS is not working${NC}"
            return 1
        fi
    fi
}

# Function to check individual hub pages
check_hub_pages() {
    echo -e "${BLUE}📄 Checking individual hub pages...${NC}"
    
    local all_working=true
    
    for page in "${HUB_PAGES[@]}"; do
        URL="https://${DOMAIN}/${page}"
        
        if curl -s --connect-timeout 10 -o /dev/null -w "%{http_code}" "$URL" | grep -q "200"; then
            echo -e "${GREEN}✅ ${page}${NC}"
        else
            echo -e "${RED}❌ ${page}${NC}"
            all_working=false
        fi
    done
    
    if $all_working; then
        return 0
    else
        return 1
    fi
}

# Function to generate status report
generate_report() {
    echo ""
    echo -e "${MAGENTA}📋 DEPLOYMENT STATUS REPORT${NC}"
    echo -e "${MAGENTA}===========================${NC}"
    
    local github_pages_ok=false
    local dns_ok=false
    local workflows_ok=false
    local ssl_ok=false
    local pages_ok=false
    
    # Run all checks
    if check_github_pages; then github_pages_ok=true; fi
    echo ""
    if check_dns; then dns_ok=true; fi
    echo ""
    if check_workflows; then workflows_ok=true; fi
    echo ""
    if check_ssl; then ssl_ok=true; fi
    echo ""
    if check_hub_pages; then pages_ok=true; fi
    
    echo ""
    echo -e "${BLUE}📊 Summary:${NC}"
    
    if $github_pages_ok; then
        echo -e "${GREEN}✅ GitHub Pages: Configured${NC}"
    else
        echo -e "${RED}❌ GitHub Pages: Not configured${NC}"
    fi
    
    if $dns_ok; then
        echo -e "${GREEN}✅ DNS: Working${NC}"
    else
        echo -e "${RED}❌ DNS: Not working${NC}"
    fi
    
    if $workflows_ok; then
        echo -e "${GREEN}✅ Workflows: Active${NC}"
    else
        echo -e "${YELLOW}⚠️  Workflows: Issues detected${NC}"
    fi
    
    if $ssl_ok; then
        echo -e "${GREEN}✅ SSL: Valid${NC}"
    else
        echo -e "${RED}❌ SSL: Not available${NC}"
    fi
    
    if $pages_ok; then
        echo -e "${GREEN}✅ Hub Pages: All accessible${NC}"
    else
        echo -e "${RED}❌ Hub Pages: Some issues${NC}"
    fi
    
    echo ""
    
    if $github_pages_ok && $dns_ok && $ssl_ok && $pages_ok; then
        echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
        echo -e "${GREEN}All hub pages are live and accessible.${NC}"
        echo ""
        echo -e "${BLUE}🎯 Hub Pages URLs:${NC}"
        for page in "${HUB_PAGES[@]}"; do
            echo -e "${GREEN}   https://${DOMAIN}/${page}${NC}"
        done
    else
        echo -e "${YELLOW}⚠️  DEPLOYMENT INCOMPLETE${NC}"
        echo -e "${YELLOW}Some components need attention.${NC}"
        echo ""
        echo -e "${BLUE}🔧 Next Steps:${NC}"
        
        if ! $github_pages_ok; then
            echo -e "${CYAN}   1. Configure GitHub Pages at:${NC}"
            echo -e "${CYAN}      https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/pages${NC}"
        fi
        
        if ! $dns_ok; then
            echo -e "${CYAN}   2. Configure DNS CNAME record:${NC}"
            echo -e "${CYAN}      ${DOMAIN} → ${TARGET}${NC}"
        fi
        
        if ! $ssl_ok && $dns_ok; then
            echo -e "${CYAN}   3. Wait for SSL certificate provisioning (5-10 minutes)${NC}"
        fi
    fi
}

# Main execution
case "${1:-status}" in
    "status"|"")
        generate_report
        ;;
    "watch")
        echo -e "${BLUE}👀 Watching deployment status (Ctrl+C to stop)...${NC}"
        while true; do
            clear
            generate_report
            echo ""
            echo -e "${CYAN}Refreshing in 30 seconds...${NC}"
            sleep 30
        done
        ;;
    "github")
        check_github_pages
        ;;
    "dns")
        check_dns
        ;;
    "ssl")
        check_ssl
        ;;
    "pages")
        check_hub_pages
        ;;
    "workflows")
        check_workflows
        ;;
    *)
        echo "Usage: $0 [status|watch|github|dns|ssl|pages|workflows]"
        echo ""
        echo "Commands:"
        echo "  status     - Full deployment status report (default)"
        echo "  watch      - Continuously monitor deployment"
        echo "  github     - Check GitHub Pages configuration"
        echo "  dns        - Check DNS resolution"
        echo "  ssl        - Check SSL certificate"
        echo "  pages      - Check individual hub pages"
        echo "  workflows  - Check GitHub Actions workflows"
        exit 1
        ;;
esac