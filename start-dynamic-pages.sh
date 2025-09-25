#!/bin/bash

# Dynamic Pages Server Startup Script
# Handles Vite dev server, build preview, and port management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEFAULT_PORT=8080
PROJECT_DIR="/workspaces/new-ecosysstem"
GITPOD_WORKSPACE_URL=${GITPOD_WORKSPACE_URL:-""}

echo -e "${BLUE}🚀 Dynamic Pages Server Startup Script${NC}"
echo -e "${BLUE}======================================${NC}"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔄 Killing existing process on port $port...${NC}"
    pkill -f ":$port" 2>/dev/null || true
    sleep 2
}

# Function to get Gitpod URL
get_gitpod_url() {
    local port=$1
    if [[ -n "$GITPOD_WORKSPACE_URL" ]]; then
        # Extract workspace ID from URL
        local workspace_id=$(echo "$GITPOD_WORKSPACE_URL" | sed 's|https://||' | cut -d'.' -f1)
        echo "https://$port--$workspace_id.gitpod.dev"
    else
        echo "http://localhost:$port"
    fi
}

# Function to start dev server
start_dev() {
    local port=${1:-$DEFAULT_PORT}
    echo -e "${GREEN}🔧 Starting Vite development server on port $port...${NC}"
    
    cd "$PROJECT_DIR"
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
    fi
    
    # Check if required packages are installed
    if ! npm list @vitejs/plugin-react >/dev/null 2>&1; then
        echo -e "${YELLOW}📦 Installing Vite React plugin...${NC}"
        npm install @vitejs/plugin-react vite rollup-plugin-visualizer
    fi
    
    # Kill existing process on port
    if check_port $port; then
        kill_port $port
    fi
    
    echo -e "${GREEN}🚀 Starting development server...${NC}"
    npm run dev -- --port $port --host 0.0.0.0 &
    
    # Wait for server to start
    echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
    sleep 5
    
    local url=$(get_gitpod_url $port)
    echo -e "${GREEN}✅ Development server started!${NC}"
    echo -e "${GREEN}🌐 Access your app at: $url${NC}"
    echo -e "${GREEN}📋 All 72 dynamic pages available at routes like:${NC}"
    echo -e "   • $url/ (Homepage)"
    echo -e "   • $url/durable-ai (AI Builder)"
    echo -e "   • $url/government (Government)"
    echo -e "   • $url/programs (Programs)"
    
    return 0
}

# Function to build and preview
start_preview() {
    local port=${1:-$DEFAULT_PORT}
    echo -e "${GREEN}🏗️ Building and starting preview server on port $port...${NC}"
    
    cd "$PROJECT_DIR"
    
    # Build the project
    echo -e "${YELLOW}🔨 Building project...${NC}"
    npm run build
    
    # Kill existing process on port
    if check_port $port; then
        kill_port $port
    fi
    
    echo -e "${GREEN}🚀 Starting preview server...${NC}"
    npm run preview -- --port $port --host 0.0.0.0 &
    
    # Wait for server to start
    echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
    sleep 3
    
    local url=$(get_gitpod_url $port)
    echo -e "${GREEN}✅ Preview server started!${NC}"
    echo -e "${GREEN}🌐 Access your app at: $url${NC}"
    
    return 0
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Server Status${NC}"
    echo -e "${BLUE}===============${NC}"
    
    local common_ports=(3000 5173 8080 8081 8082)
    
    for port in "${common_ports[@]}"; do
        if check_port $port; then
            local url=$(get_gitpod_url $port)
            echo -e "${GREEN}✅ Port $port: ACTIVE - $url${NC}"
        else
            echo -e "${RED}❌ Port $port: INACTIVE${NC}"
        fi
    done
    
    echo ""
    echo -e "${YELLOW}🔗 Dynamic Pages Available:${NC}"
    echo "• Homepage: /"
    echo "• Durable AI: /durable-ai"
    echo "• Templates: /durable-templates"
    echo "• Features: /durable-features"
    echo "• Pricing: /durable-pricing"
    echo "• Government: /government"
    echo "• Programs: /programs"
    echo "• And 65+ more pages..."
}

# Function to update domain in links
update_domain() {
    local new_domain=$1
    local files_to_update=(
        "ALL_DYNAMIC_PAGES_LIST.md"
        "LIVE_ROUTING_LINKS.md"
        "dynamic-pages-dashboard.html"
        "durable-pages-preview.html"
    )
    
    echo -e "${YELLOW}🔄 Updating domain to: $new_domain${NC}"
    
    for file in "${files_to_update[@]}"; do
        if [ -f "$PROJECT_DIR/$file" ]; then
            # Replace Gitpod URLs with new domain
            sed -i "s|https://[0-9]*--[a-z0-9-]*\.gitpod\.dev|$new_domain|g" "$PROJECT_DIR/$file"
            echo -e "${GREEN}✅ Updated: $file${NC}"
        fi
    done
    
    echo -e "${GREEN}🎉 Domain updated in all files!${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}🚀 Dynamic Pages Server Script${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 [command] [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  dev [port]       Start development server (default: 8080)"
    echo "  preview [port]   Build and start preview server (default: 8080)"
    echo "  status          Show server status"
    echo "  domain <url>    Update domain in all link files"
    echo "  help            Show this help"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 dev 8080                    # Start dev server on port 8080"
    echo "  $0 preview 3000                # Build and preview on port 3000"
    echo "  $0 domain https://mysite.com   # Update all links to use mysite.com"
    echo "  $0 status                      # Check what's running"
}

# Main script logic
case "${1:-dev}" in
    "dev")
        start_dev ${2:-$DEFAULT_PORT}
        ;;
    "preview")
        start_preview ${2:-$DEFAULT_PORT}
        ;;
    "status")
        show_status
        ;;
    "domain")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Error: Please provide a domain${NC}"
            echo "Usage: $0 domain https://your-domain.com"
            exit 1
        fi
        update_domain "$2"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac

# Keep script running if server was started
if [[ "$1" == "dev" || "$1" == "preview" || -z "$1" ]]; then
    echo ""
    echo -e "${YELLOW}📝 Server is running in background${NC}"
    echo -e "${YELLOW}💡 Run './start-dynamic-pages.sh status' to check status${NC}"
    echo -e "${YELLOW}🛑 Press Ctrl+C to stop this script (server will continue)${NC}"
    
    # Wait for user interrupt
    trap 'echo -e "\n${GREEN}👋 Script stopped. Server is still running.${NC}"; exit 0' INT
    
    while true; do
        sleep 10
        if ! check_port ${2:-$DEFAULT_PORT}; then
            echo -e "${RED}❌ Server stopped unexpectedly${NC}"
            exit 1
        fi
    done
fi