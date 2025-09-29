#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# AUTOPILOT MONITORING DAEMON
# ===================================================================
# Continuous monitoring service for deployment health and triggers
# Runs in background and manages automatic deployments
# ===================================================================

echo "👁️ Autopilot Monitoring Daemon Starting..."
echo "=========================================="

# Configuration
MONITOR_INTERVAL=60        # Check every minute
HEALTH_CHECK_INTERVAL=300  # Health check every 5 minutes
DEPLOYMENT_COOLDOWN=300    # Wait 5 minutes between deployments
LOG_FILE="/tmp/autopilot-monitor.log"
PID_FILE="/tmp/autopilot-monitor.pid"
STATUS_FILE="/tmp/autopilot-monitor-status.json"

# URLs to monitor
DEPLOYMENT_URL="https://elevateforhumanity.pages.dev"
CUSTOM_DOMAIN="https://elevateforhumanity.org"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() { 
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $*"
    echo -e "${BLUE}$msg${NC}"
    echo "$msg" >> "$LOG_FILE"
}

success() { 
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $*"
    echo -e "${GREEN}$msg${NC}"
    echo "$msg" >> "$LOG_FILE"
}

warn() { 
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ $*"
    echo -e "${YELLOW}$msg${NC}"
    echo "$msg" >> "$LOG_FILE"
}

error() { 
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $*"
    echo -e "${RED}$msg${NC}"
    echo "$msg" >> "$LOG_FILE"
}

# Function to update monitor status
update_monitor_status() {
    local status=$1
    local message=$2
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    cat > "$STATUS_FILE" << EOF
{
  "status": "$status",
  "message": "$message",
  "timestamp": "$timestamp",
  "pid": $$,
  "uptime": "$(ps -o etime= -p $$ 2>/dev/null | tr -d ' ' || echo 'unknown')",
  "deployment_url": "$DEPLOYMENT_URL",
  "custom_domain": "$CUSTOM_DOMAIN",
  "log_file": "$LOG_FILE"
}
EOF
}

# Function to check if changes need deployment
check_for_changes() {
    local current_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    local last_deployed_file="/tmp/last-deployed-commit"
    local last_deployed=""
    
    if [ -f "$last_deployed_file" ]; then
        last_deployed=$(cat "$last_deployed_file" 2>/dev/null || echo "")
    fi
    
    if [ "$current_commit" != "$last_deployed" ] && [ "$current_commit" != "unknown" ]; then
        log "New commit detected: $current_commit (last deployed: ${last_deployed:-'none'})"
        return 0  # Changes detected
    else
        return 1  # No changes
    fi
}

# Function to check deployment health
check_deployment_health() {
    local health_score=0
    local total_checks=4
    
    # Check primary URL
    if curl -s -f --max-time 30 "$DEPLOYMENT_URL" > /dev/null 2>&1; then
        ((health_score++))
    fi
    
    # Check custom domain
    if curl -s -f --max-time 30 "$CUSTOM_DOMAIN" > /dev/null 2>&1; then
        ((health_score++))
    fi
    
    # Check HTML content
    local content=$(curl -s --max-time 30 "$DEPLOYMENT_URL" 2>/dev/null || echo "")
    if echo "$content" | grep -q "<!DOCTYPE html\|<html"; then
        ((health_score++))
    fi
    
    # Check response time
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 30 "$DEPLOYMENT_URL" 2>/dev/null || echo "30")
    if (( $(echo "$response_time < 5.0" | bc -l 2>/dev/null || echo "0") )); then
        ((health_score++))
    fi
    
    local health_percentage=$(( (health_score * 100) / total_checks ))
    
    if [ $health_score -ge 3 ]; then
        success "Health check passed: $health_score/$total_checks ($health_percentage%)"
        return 0
    else
        error "Health check failed: $health_score/$total_checks ($health_percentage%)"
        return 1
    fi
}

# Function to trigger deployment
trigger_deployment() {
    log "Triggering automatic deployment..."
    
    # Check deployment cooldown
    local cooldown_file="/tmp/last-deployment-time"
    local current_time=$(date +%s)
    local last_deployment_time=0
    
    if [ -f "$cooldown_file" ]; then
        last_deployment_time=$(cat "$cooldown_file" 2>/dev/null || echo "0")
    fi
    
    local time_since_last=$((current_time - last_deployment_time))
    
    if [ $time_since_last -lt $DEPLOYMENT_COOLDOWN ]; then
        warn "Deployment cooldown active: $((DEPLOYMENT_COOLDOWN - time_since_last))s remaining"
        return 1
    fi
    
    # Run deployment engine
    if bash scripts/autopilot-deployment-engine.sh deploy; then
        success "Automatic deployment completed successfully"
        echo "$current_time" > "$cooldown_file"
        return 0
    else
        error "Automatic deployment failed"
        return 1
    fi
}

# Function to handle signals
cleanup() {
    log "Autopilot monitor daemon shutting down..."
    update_monitor_status "stopped" "Daemon stopped by signal"
    rm -f "$PID_FILE"
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Check if already running
if [ -f "$PID_FILE" ]; then
    local existing_pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
    if [ -n "$existing_pid" ] && kill -0 "$existing_pid" 2>/dev/null; then
        error "Autopilot monitor already running with PID $existing_pid"
        exit 1
    else
        warn "Removing stale PID file"
        rm -f "$PID_FILE"
    fi
fi

# Write PID file
echo $$ > "$PID_FILE"

# Initialize
log "Autopilot monitor daemon started with PID $$"
update_monitor_status "starting" "Monitor daemon initializing"

# Main monitoring loop
last_health_check=0
deployment_failures=0
max_failures=3

update_monitor_status "running" "Monitor daemon active and watching for changes"

while true; do
    current_time=$(date +%s)
    
    # Check for changes and trigger deployment if needed
    if check_for_changes; then
        log "Changes detected, triggering deployment..."
        update_monitor_status "deploying" "Automatic deployment triggered"
        
        if trigger_deployment; then
            success "Deployment completed successfully"
            deployment_failures=0
            update_monitor_status "running" "Deployment successful, monitoring continues"
        else
            error "Deployment failed"
            ((deployment_failures++))
            
            if [ $deployment_failures -ge $max_failures ]; then
                error "Maximum deployment failures reached ($max_failures), stopping daemon"
                update_monitor_status "failed" "Too many deployment failures, manual intervention required"
                break
            else
                warn "Deployment failure $deployment_failures/$max_failures, continuing to monitor"
                update_monitor_status "running" "Deployment failed but monitoring continues"
            fi
        fi
    fi
    
    # Periodic health check
    if [ $((current_time - last_health_check)) -ge $HEALTH_CHECK_INTERVAL ]; then
        log "Performing periodic health check..."
        
        if check_deployment_health; then
            success "Periodic health check passed"
        else
            warn "Periodic health check failed"
            # Could trigger alerts or recovery actions here
        fi
        
        last_health_check=$current_time
    fi
    
    # Sleep until next check
    sleep $MONITOR_INTERVAL
done

# Cleanup on exit
cleanup