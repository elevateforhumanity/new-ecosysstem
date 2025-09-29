#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# AUTOPILOT CONTINUOUS MONITORING & AUTO-FIX ENGINE
# ===================================================================
# Runs continuously to monitor and automatically fix issues
# Handles file sync, deployment, health, and performance issues
# ===================================================================

echo "🤖 Autopilot Continuous Monitor Starting..."
echo "=========================================="

# Configuration
MONITOR_INTERVAL=60        # Check every minute
HEALTH_INTERVAL=300       # Health check every 5 minutes
AUDIT_INTERVAL=1800       # Full audit every 30 minutes
LOG_FILE="/tmp/autopilot-continuous.log"
PID_FILE="/tmp/autopilot-continuous.pid"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { 
    local msg="[$(date +'%H:%M:%S')] $*"
    echo -e "${BLUE}$msg${NC}"
    echo "$msg" >> "$LOG_FILE"
}

fix() { 
    local msg="[$(date +'%H:%M:%S')] 🔧 $*"
    echo -e "${CYAN}$msg${NC}"
    echo "$msg" >> "$LOG_FILE"
}

success() { 
    local msg="[$(date +'%H:%M:%S')] ✅ $*"
    echo -e "${GREEN}$msg${NC}"
    echo "$msg" >> "$LOG_FILE"
}

# Function to auto-fix file sync issues
auto_fix_files() {
    if ! git diff-index --quiet HEAD --; then
        fix "Uncommitted changes detected, auto-fixing..."
        
        git add .
        git commit -m "🤖 Autopilot: Auto-sync files - $(date +'%H:%M:%S')

- Automatic file synchronization
- All explorer files included
- Continuous monitoring active

Co-authored-by: Ona <no-reply@ona.com>"
        
        git push origin main
        success "Files auto-synced and deployed"
        return 0
    fi
    return 1
}

# Function to check and fix deployment
check_deployment() {
    local dist_files=0
    if [ -d "dist" ]; then
        dist_files=$(find dist -type f | wc -l)
    fi
    
    if [ $dist_files -lt 200 ]; then
        fix "Deployment files missing, regenerating..."
        bash cloudflare-deploy.sh > /dev/null 2>&1
        success "Deployment files regenerated"
    fi
}

# Function to monitor health
monitor_health() {
    if ! curl -s -f --max-time 30 "https://elevateforhumanity.pages.dev" > /dev/null 2>&1; then
        fix "Site health issue detected, triggering recovery..."
        bash scripts/autopilot-deployment-engine.sh deploy > /dev/null 2>&1
    fi
}

# Cleanup function
cleanup() {
    log "Autopilot continuous monitor shutting down..."
    rm -f "$PID_FILE"
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Check if already running
if [ -f "$PID_FILE" ]; then
    local existing_pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
    if [ -n "$existing_pid" ] && kill -0 "$existing_pid" 2>/dev/null; then
        echo "Autopilot monitor already running with PID $existing_pid"
        exit 1
    fi
fi

# Write PID file
echo $$ > "$PID_FILE"

log "Autopilot continuous monitor started (PID $$)"

# Main monitoring loop
iteration=0
last_health_check=0
last_audit=0

while true; do
    ((iteration++))
    current_time=$(date +%s)
    
    # File sync check (every iteration)
    if auto_fix_files; then
        log "Auto-fix applied in iteration $iteration"
    fi
    
    # Deployment check (every iteration)
    check_deployment
    
    # Health check (every 5 minutes)
    if [ $((current_time - last_health_check)) -ge $HEALTH_INTERVAL ]; then
        monitor_health
        last_health_check=$current_time
    fi
    
    # Full audit (every 30 minutes)
    if [ $((current_time - last_audit)) -ge $AUDIT_INTERVAL ]; then
        log "Running scheduled audit..."
        bash scripts/autopilot-bulldog-audit.sh audit > /dev/null 2>&1 || true
        last_audit=$current_time
    fi
    
    # Status update every 10 iterations
    if [ $((iteration % 10)) -eq 0 ]; then
        log "Monitor active - iteration $iteration ($(( ($(date +%s) - $(stat -c %Y "$PID_FILE")) / 60 )) min uptime)"
    fi
    
    sleep $MONITOR_INTERVAL
done