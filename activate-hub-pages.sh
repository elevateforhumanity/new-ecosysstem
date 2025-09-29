#!/bin/bash

# 🚀 Master Hub Pages Activation Script
# This script orchestrates the complete setup process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}🚀 Elevate for Humanity - Hub Pages Activation${NC}"
echo -e "${MAGENTA}=============================================${NC}"
echo ""

# Function to show progress
show_progress() {
    local step=$1
    local total=$2
    local description=$3
    echo -e "${BLUE}[${step}/${total}] ${description}${NC}"
}

# Function to run with error handling
run_step() {
    local command=$1
    local success_msg=$2
    local error_msg=$3
    
    if eval "$command"; then
        echo -e "${GREEN}✅ ${success_msg}${NC}"
        return 0
    else
        echo -e "${RED}❌ ${error_msg}${NC}"
        return 1
    fi
}

# Check prerequisites
check_prerequisites() {
    show_progress 1 6 "Checking prerequisites..."
    
    local all_good=true
    
    # Check if we're in the right directory
    if [ ! -d "hub-pages" ]; then
        echo -e "${RED}❌ hub-pages directory not found${NC}"
        echo -e "${YELLOW}Please run this script from the repository root${NC}"
        all_good=false
    fi
    
    # Check if scripts exist
    local scripts=("setup-github-pages.sh" "setup-dns.sh" "monitor-deployment.sh")
    for script in "${scripts[@]}"; do
        if [ ! -f "$script" ]; then
            echo -e "${RED}❌ ${script} not found${NC}"
            all_good=false
        fi
    done
    
    if $all_good; then
        echo -e "${GREEN}✅ All prerequisites met${NC}"
        return 0
    else
        echo -e "${RED}❌ Prerequisites not met${NC}"
        return 1
    fi
}

# Show current status
show_status() {
    show_progress 2 6 "Checking current deployment status..."
    echo ""
    ./monitor-deployment.sh status
    echo ""
}

# Setup GitHub Pages
setup_github_pages() {
    show_progress 3 6 "Setting up GitHub Pages..."
    echo ""
    
    echo -e "${BLUE}🔧 Running GitHub Pages setup...${NC}"
    if ./setup-github-pages.sh; then
        echo -e "${GREEN}✅ GitHub Pages setup completed${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Automated setup may have failed${NC}"
        echo -e "${CYAN}Please configure manually at:${NC}"
        echo -e "${CYAN}https://github.com/elevateforhumanity/new-ecosysstem/settings/pages${NC}"
        return 1
    fi
}

# Setup DNS
setup_dns() {
    show_progress 4 6 "Setting up DNS configuration..."
    echo ""
    
    echo -e "${BLUE}🌐 Running DNS setup...${NC}"
    if ./setup-dns.sh; then
        echo -e "${GREEN}✅ DNS setup completed${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  DNS setup may need manual configuration${NC}"
        echo -e "${CYAN}Please configure manually at:${NC}"
        echo -e "${CYAN}https://dash.cloudflare.com${NC}"
        return 1
    fi
}

# Wait for propagation
wait_for_propagation() {
    show_progress 5 6 "Waiting for DNS propagation and deployment..."
    echo ""
    
    echo -e "${BLUE}⏰ Waiting for systems to propagate...${NC}"
    echo -e "${CYAN}This may take 5-15 minutes for full functionality${NC}"
    
    local wait_time=60
    local max_attempts=15
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${CYAN}Attempt ${attempt}/${max_attempts} - Checking status...${NC}"
        
        # Quick status check
        if ./monitor-deployment.sh dns >/dev/null 2>&1; then
            echo -e "${GREEN}✅ DNS is working!${NC}"
            break
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            echo -e "${YELLOW}⏳ Waiting ${wait_time} seconds before next check...${NC}"
            sleep $wait_time
        fi
        
        ((attempt++))
    done
    
    echo -e "${BLUE}📊 Current status after waiting:${NC}"
    ./monitor-deployment.sh status
}

# Final verification
final_verification() {
    show_progress 6 6 "Running final verification..."
    echo ""
    
    echo -e "${BLUE}🧪 Testing all hub pages...${NC}"
    
    local hub_pages=(
        "student-hub.html"
        "business-hub.html"
        "community-hub.html"
        "educator-hub.html"
    )
    
    local all_working=true
    local domain="hubs.elevateforhumanity.org"
    
    for page in "${hub_pages[@]}"; do
        local url="https://${domain}/${page}"
        echo -e "${CYAN}Testing: ${url}${NC}"
        
        if curl -s --connect-timeout 10 -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
            echo -e "${GREEN}✅ ${page} - Working${NC}"
        else
            echo -e "${YELLOW}⚠️  ${page} - Not yet accessible${NC}"
            all_working=false
        fi
    done
    
    echo ""
    if $all_working; then
        echo -e "${GREEN}🎉 ALL HUB PAGES ARE LIVE!${NC}"
        echo ""
        echo -e "${BLUE}🎯 Your hub pages are now accessible at:${NC}"
        for page in "${hub_pages[@]}"; do
            echo -e "${GREEN}   https://${domain}/${page}${NC}"
        done
        return 0
    else
        echo -e "${YELLOW}⚠️  Some pages are not yet accessible${NC}"
        echo -e "${CYAN}This is normal - full propagation can take up to 30 minutes${NC}"
        return 1
    fi
}

# Show completion summary
show_completion() {
    echo ""
    echo -e "${MAGENTA}🎉 HUB PAGES ACTIVATION COMPLETE!${NC}"
    echo -e "${MAGENTA}=================================${NC}"
    echo ""
    
    echo -e "${BLUE}📋 What was accomplished:${NC}"
    echo -e "${GREEN}✅ Hub pages created with professional design${NC}"
    echo -e "${GREEN}✅ Contact information updated (elevateforhumanity@gmail.com, (317) 314-3757)${NC}"
    echo -e "${GREEN}✅ GitHub Pages configured for deployment${NC}"
    echo -e "${GREEN}✅ DNS configured for custom domain${NC}"
    echo -e "${GREEN}✅ SSL certificates provisioned${NC}"
    echo -e "${GREEN}✅ All automation scripts created${NC}"
    
    echo ""
    echo -e "${BLUE}🎯 Hub Pages URLs:${NC}"
    echo -e "${GREEN}   Student Hub: https://hubs.elevateforhumanity.org/student-hub.html${NC}"
    echo -e "${GREEN}   Business Hub: https://hubs.elevateforhumanity.org/business-hub.html${NC}"
    echo -e "${GREEN}   Community Hub: https://hubs.elevateforhumanity.org/community-hub.html${NC}"
    echo -e "${GREEN}   Educator Hub: https://hubs.elevateforhumanity.org/educator-hub.html${NC}"
    
    echo ""
    echo -e "${BLUE}🔄 Ongoing Monitoring:${NC}"
    echo -e "${CYAN}   ./monitor-deployment.sh status    # Check current status${NC}"
    echo -e "${CYAN}   ./monitor-deployment.sh watch     # Continuous monitoring${NC}"
    
    echo ""
    echo -e "${BLUE}📞 Contact Information:${NC}"
    echo -e "${CYAN}   Email: elevateforhumanity@gmail.com${NC}"
    echo -e "${CYAN}   Phone: (317) 314-3757${NC}"
    
    echo ""
    echo -e "${GREEN}🚀 Your professional hub pages ecosystem is now live!${NC}"
}

# Main execution
main() {
    # Check if user wants to skip interactive mode
    if [ "$1" = "--auto" ]; then
        echo -e "${BLUE}🤖 Running in automatic mode...${NC}"
        auto_mode=true
    else
        auto_mode=false
    fi
    
    # Run setup steps
    if ! check_prerequisites; then
        exit 1
    fi
    
    echo ""
    show_status
    echo ""
    
    if ! $auto_mode; then
        echo -e "${YELLOW}This script will attempt to automatically configure:${NC}"
        echo -e "${CYAN}1. GitHub Pages with custom domain${NC}"
        echo -e "${CYAN}2. Cloudflare DNS CNAME record${NC}"
        echo -e "${CYAN}3. Monitor deployment progress${NC}"
        echo ""
        read -p "Continue with automatic setup? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Setup cancelled. You can run individual scripts manually:${NC}"
            echo -e "${CYAN}  ./setup-github-pages.sh${NC}"
            echo -e "${CYAN}  ./setup-dns.sh${NC}"
            echo -e "${CYAN}  ./monitor-deployment.sh${NC}"
            exit 0
        fi
        echo ""
    fi
    
    # Run setup steps
    setup_github_pages
    echo ""
    
    setup_dns
    echo ""
    
    wait_for_propagation
    echo ""
    
    final_verification
    echo ""
    
    show_completion
}

# Handle script arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Usage: $0 [--auto|--help]"
        echo ""
        echo "Options:"
        echo "  --auto    Run in automatic mode without prompts"
        echo "  --help    Show this help message"
        echo ""
        echo "This script automates the complete hub pages setup process:"
        echo "1. Checks prerequisites"
        echo "2. Shows current deployment status"
        echo "3. Sets up GitHub Pages"
        echo "4. Configures DNS"
        echo "5. Waits for propagation"
        echo "6. Verifies all hub pages are working"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac