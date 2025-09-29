#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# ECOSYSTEM AUTOPILOT SCRIPT
# ===================================================================
# Manages multi-repository ecosystem with automated workflows
# ===================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="/workspaces"
ECOSYSTEM_CONFIG="$WORKSPACE_ROOT/ecosystem-config.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"; }
success() { echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅${NC} $*"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️${NC} $*"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] ❌${NC} $*"; }
info() { echo -e "${PURPLE}[$(date +'%H:%M:%S')] ℹ️${NC} $*"; }

# Function to check if a service is running
check_service() {
    local port=$1
    local name=$2
    
    if curl -s -f "http://localhost:$port" > /dev/null 2>&1; then
        success "$name service is running on port $port"
        return 0
    else
        warn "$name service is not responding on port $port"
        return 1
    fi
}

# Function to start a service
start_service() {
    local repo_path=$1
    local command=$2
    local port=$3
    local name=$4
    
    if [ -d "$repo_path" ]; then
        log "Starting $name service..."
        cd "$repo_path"
        
        # Kill any existing process on the port
        pkill -f ":$port" 2>/dev/null || true
        
        # Start the service in background
        nohup bash -c "$command" > "/tmp/${name}-service.log" 2>&1 &
        local pid=$!
        
        # Wait a moment for startup
        sleep 3
        
        if check_service "$port" "$name"; then
            echo "$pid" > "/tmp/${name}-service.pid"
            success "$name service started with PID $pid"
        else
            error "Failed to start $name service"
            return 1
        fi
    else
        error "Repository path $repo_path not found"
        return 1
    fi
}

# Function to sync repositories
sync_repositories() {
    log "Syncing repositories..."
    
    cd "$WORKSPACE_ROOT"
    
    # List of repositories to manage
    local repos=(
        "new-ecosysstem"
        # Add more repositories as they become available
    )
    
    for repo in "${repos[@]}"; do
        if [ -d "$repo" ]; then
            log "Syncing $repo..."
            cd "$repo"
            
            # Pull latest changes
            if git pull origin main 2>/dev/null || git pull origin master 2>/dev/null; then
                success "Synced $repo"
            else
                warn "Failed to sync $repo"
            fi
            
            # Install/update dependencies
            if [ -f "package.json" ]; then
                log "Updating dependencies in $repo..."
                pnpm install --frozen-lockfile || pnpm install || npm install
            fi
            
            cd "$WORKSPACE_ROOT"
        else
            warn "Repository $repo not found, skipping"
        fi
    done
}

# Function to perform health checks
health_check() {
    log "Performing ecosystem health check..."
    
    local health_status="healthy"
    local issues=()
    
    # Check main services
    if ! check_service 8080 "Main Site"; then
        health_status="degraded"
        issues+=("Main site not responding")
    fi
    
    if ! check_service 8012 "Autopilot"; then
        health_status="degraded"
        issues+=("Autopilot service not responding")
    fi
    
    # Check repository status
    cd "$WORKSPACE_ROOT"
    for repo in */; do
        if [ -d "$repo/.git" ]; then
            cd "$repo"
            local repo_name=$(basename "$repo")
            
            # Check for uncommitted changes
            if ! git diff-index --quiet HEAD --; then
                warn "$repo_name has uncommitted changes"
                issues+=("$repo_name has uncommitted changes")
            fi
            
            # Check if dependencies are installed
            if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
                warn "$repo_name missing node_modules"
                issues+=("$repo_name missing dependencies")
            fi
            
            cd "$WORKSPACE_ROOT"
        fi
    done
    
    # Generate health report
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    cat > "/tmp/ecosystem-health.json" << EOF
{
  "timestamp": "$timestamp",
  "status": "$health_status",
  "services": {
    "main_site": {
      "port": 8080,
      "status": "$(check_service 8080 "Main" && echo "healthy" || echo "unhealthy")"
    },
    "autopilot": {
      "port": 8012,
      "status": "$(check_service 8012 "Autopilot" && echo "healthy" || echo "unhealthy")"
    }
  },
  "issues": $(printf '%s\n' "${issues[@]}" | jq -R . | jq -s .),
  "repositories": $(find "$WORKSPACE_ROOT" -maxdepth 1 -type d -name "*" -exec basename {} \; | grep -v "^\.$" | jq -R . | jq -s .)
}
EOF
    
    if [ "$health_status" = "healthy" ]; then
        success "Ecosystem health check passed"
    else
        warn "Ecosystem health check found issues: ${issues[*]}"
    fi
    
    return 0
}

# Function to auto-fix common issues
auto_fix() {
    log "Running auto-fix procedures..."
    
    cd "$WORKSPACE_ROOT"
    
    # Fix missing dependencies
    for repo in */; do
        if [ -d "$repo/.git" ]; then
            cd "$repo"
            local repo_name=$(basename "$repo")
            
            if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
                log "Installing dependencies in $repo_name..."
                pnpm install --frozen-lockfile || pnpm install || npm install
            fi
            
            cd "$WORKSPACE_ROOT"
        fi
    done
    
    # Restart failed services
    if ! check_service 8080 "Main Site"; then
        log "Attempting to restart main site..."
        start_service "$WORKSPACE_ROOT/new-ecosysstem" "pnpm dev --host 0.0.0.0 --port 8080" 8080 "main-site"
    fi
    
    if ! check_service 8012 "Autopilot"; then
        log "Attempting to restart autopilot..."
        start_service "$WORKSPACE_ROOT/new-ecosysstem" "pnpm dev --host 0.0.0.0 --port 8012" 8012 "autopilot"
    fi
    
    success "Auto-fix procedures completed"
}

# Function to clone additional repositories
clone_repos() {
    log "Cloning additional repositories..."
    
    cd "$WORKSPACE_ROOT"
    
    # List of repositories to clone (update with actual repo names)
    local repos_to_clone=(
        # "hub-site"
        # "programs-platform"
        # "lms-system"
        # Add actual repository names here
    )
    
    for repo in "${repos_to_clone[@]}"; do
        if [ ! -d "$repo" ]; then
            log "Cloning $repo..."
            if git clone "https://github.com/elevateforhumanity/$repo.git"; then
                success "Cloned $repo"
                
                # Install dependencies
                cd "$repo"
                if [ -f "package.json" ]; then
                    pnpm install --frozen-lockfile || pnpm install || npm install
                fi
                cd "$WORKSPACE_ROOT"
            else
                warn "Failed to clone $repo (may not exist or be private)"
            fi
        else
            info "$repo already exists, skipping"
        fi
    done
}

# Main autopilot loop
autopilot_loop() {
    log "Starting ecosystem autopilot loop..."
    
    local iteration=0
    
    while true; do
        iteration=$((iteration + 1))
        log "Autopilot iteration $iteration"
        
        # Perform health check
        health_check
        
        # Auto-fix issues if found
        if [ -f "/tmp/ecosystem-health.json" ]; then
            local status=$(jq -r '.status' /tmp/ecosystem-health.json)
            if [ "$status" != "healthy" ]; then
                warn "Issues detected, running auto-fix..."
                auto_fix
            fi
        fi
        
        # Sync repositories every 10 iterations
        if [ $((iteration % 10)) -eq 0 ]; then
            sync_repositories
        fi
        
        # Wait before next iteration
        sleep 30
    done
}

# Command handling
COMMAND=${1:-help}

case $COMMAND in
    "start")
        log "Starting ecosystem autopilot..."
        autopilot_loop
        ;;
    "health")
        health_check
        ;;
    "sync")
        sync_repositories
        ;;
    "fix")
        auto_fix
        ;;
    "clone")
        clone_repos
        ;;
    "status")
        if [ -f "/tmp/ecosystem-health.json" ]; then
            cat /tmp/ecosystem-health.json | jq .
        else
            warn "No health data available, run 'health' command first"
        fi
        ;;
    "help"|*)
        echo "Ecosystem Autopilot Commands:"
        echo "  start  - Start autopilot monitoring loop"
        echo "  health - Perform health check"
        echo "  sync   - Sync all repositories"
        echo "  fix    - Auto-fix common issues"
        echo "  clone  - Clone additional repositories"
        echo "  status - Show current ecosystem status"
        ;;
esac