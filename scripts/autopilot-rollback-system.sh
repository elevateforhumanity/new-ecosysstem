#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# AUTOPILOT ROLLBACK SYSTEM
# ===================================================================
# Automatic rollback system for failed deployments
# Monitors deployment health and triggers rollback when needed
# ===================================================================

echo "🔄 Autopilot Rollback System Starting..."
echo "======================================="

# Configuration
DEPLOYMENT_URL="https://elevateforhumanity.pages.dev"
CUSTOM_DOMAIN="https://elevateforhumanity.org"
ROLLBACK_LOG="/tmp/autopilot-rollback.log"
ROLLBACK_STATUS="/tmp/rollback-status.json"
HEALTH_CHECK_ATTEMPTS=3
HEALTH_CHECK_INTERVAL=60
ROLLBACK_TIMEOUT=600  # 10 minutes

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
    echo "$msg" >> "$ROLLBACK_LOG"
}

success() { 
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $*"
    echo -e "${GREEN}$msg${NC}"
    echo "$msg" >> "$ROLLBACK_LOG"
}

warn() { 
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ $*"
    echo -e "${YELLOW}$msg${NC}"
    echo "$msg" >> "$ROLLBACK_LOG"
}

error() { 
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $*"
    echo -e "${RED}$msg${NC}"
    echo "$msg" >> "$ROLLBACK_LOG"
}

# Function to update rollback status
update_rollback_status() {
    local status=$1
    local message=$2
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local current_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    
    cat > "$ROLLBACK_STATUS" << EOF
{
  "status": "$status",
  "message": "$message",
  "timestamp": "$timestamp",
  "current_commit": "$current_commit",
  "deployment_url": "$DEPLOYMENT_URL",
  "custom_domain": "$CUSTOM_DOMAIN",
  "log_file": "$ROLLBACK_LOG"
}
EOF
}

# Function to check deployment health
check_deployment_health() {
    local url=$1
    local name=$2
    
    log "Checking $name health..."
    
    # Basic connectivity check
    if ! curl -s -f --max-time 30 "$url" > /dev/null 2>&1; then
        error "$name is not responding"
        return 1
    fi
    
    # Content validation
    local content=$(curl -s --max-time 30 "$url" 2>/dev/null || echo "")
    if ! echo "$content" | grep -q "<!DOCTYPE html\|<html"; then
        error "$name is not serving valid HTML content"
        return 1
    fi
    
    # Check for error pages
    if echo "$content" | grep -qi "error\|not found\|500\|502\|503\|504"; then
        error "$name is serving error content"
        return 1
    fi
    
    success "$name health check passed"
    return 0
}

# Function to perform comprehensive health assessment
assess_deployment_health() {
    log "Performing comprehensive health assessment..."
    
    local health_score=0
    local total_checks=4
    
    # Check primary URL
    if check_deployment_health "$DEPLOYMENT_URL" "Primary site"; then
        ((health_score++))
    fi
    
    # Check custom domain
    if check_deployment_health "$CUSTOM_DOMAIN" "Custom domain"; then
        ((health_score++))
    fi
    
    # Check essential pages
    local pages=("/" "/about.html" "/programs.html" "/lms.html")
    local accessible_pages=0
    
    for page in "${pages[@]}"; do
        if curl -s -f --max-time 15 "${DEPLOYMENT_URL}${page}" > /dev/null 2>&1; then
            ((accessible_pages++))
        fi
    done
    
    if [ $accessible_pages -ge 3 ]; then
        ((health_score++))
        success "Essential pages accessible ($accessible_pages/4)"
    else
        error "Essential pages not accessible ($accessible_pages/4)"
    fi
    
    # Performance check
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 30 "$DEPLOYMENT_URL" 2>/dev/null || echo "30")
    if (( $(echo "$response_time < 10.0" | bc -l 2>/dev/null || echo "0") )); then
        ((health_score++))
        success "Performance acceptable (${response_time}s)"
    else
        error "Performance poor (${response_time}s)"
    fi
    
    local health_percentage=$(( (health_score * 100) / total_checks ))
    log "Health assessment: $health_score/$total_checks checks passed ($health_percentage%)"
    
    if [ $health_score -ge 3 ]; then
        success "Deployment health is acceptable"
        return 0
    else
        error "Deployment health is poor - rollback may be needed"
        return 1
    fi
}

# Function to get the last known good commit
get_last_good_commit() {
    local last_good_file="/tmp/last-good-commit"
    
    if [ -f "$last_good_file" ]; then
        cat "$last_good_file"
    else
        # Fallback to previous commit
        git rev-parse HEAD~1 2>/dev/null || echo ""
    fi
}

# Function to save current commit as good
save_good_commit() {
    local commit=$(git rev-parse HEAD 2>/dev/null || echo "")
    if [ -n "$commit" ]; then
        echo "$commit" > "/tmp/last-good-commit"
        log "Saved commit $commit as last known good"
    fi
}

# Function to create rollback branch
create_rollback_branch() {
    local target_commit=$1
    local rollback_branch="autopilot-rollback-$(date +%s)"
    
    log "Creating rollback branch: $rollback_branch"
    
    if git checkout -b "$rollback_branch" 2>/dev/null; then
        if git reset --hard "$target_commit" 2>/dev/null; then
            success "Rollback branch created and reset to $target_commit"
            echo "$rollback_branch"
            return 0
        else
            error "Failed to reset to target commit"
            git checkout main 2>/dev/null || true
            git branch -D "$rollback_branch" 2>/dev/null || true
            return 1
        fi
    else
        error "Failed to create rollback branch"
        return 1
    fi
}

# Function to execute rollback
execute_rollback() {
    local target_commit=$1
    local reason=${2:-"Automatic rollback due to deployment failure"}
    
    log "Executing rollback to commit $target_commit"
    update_rollback_status "rolling_back" "Rollback in progress to commit $target_commit"
    
    # Create rollback branch
    local rollback_branch=$(create_rollback_branch "$target_commit")
    if [ -z "$rollback_branch" ]; then
        error "Failed to create rollback branch"
        update_rollback_status "failed" "Rollback failed - could not create branch"
        return 1
    fi
    
    # Prepare rollback deployment
    log "Preparing rollback deployment..."
    if bash cloudflare-deploy.sh > /tmp/rollback-deploy.log 2>&1; then
        success "Rollback files prepared"
    else
        error "Failed to prepare rollback files"
        cat /tmp/rollback-deploy.log
        update_rollback_status "failed" "Rollback failed - could not prepare files"
        return 1
    fi
    
    # Commit rollback changes
    git add .
    git commit -m "🔄 Autopilot Rollback: $reason

- Rolling back to commit: $target_commit
- Reason: $reason
- Rollback initiated: $(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)
- Files prepared for deployment

Co-authored-by: Ona <no-reply@ona.com>" 2>/dev/null || true
    
    # Push rollback (this will trigger deployment)
    log "Pushing rollback to trigger deployment..."
    if git push origin "$rollback_branch":main --force; then
        success "Rollback pushed successfully"
        
        # Wait for rollback deployment to complete
        log "Waiting for rollback deployment to complete..."
        sleep 120  # Wait 2 minutes for deployment
        
        # Verify rollback success
        if assess_deployment_health; then
            success "Rollback completed successfully"
            update_rollback_status "completed" "Rollback successful to commit $target_commit"
            
            # Clean up rollback branch
            git checkout main 2>/dev/null || true
            git branch -D "$rollback_branch" 2>/dev/null || true
            
            return 0
        else
            error "Rollback deployment failed health check"
            update_rollback_status "failed" "Rollback deployment failed health check"
            return 1
        fi
    else
        error "Failed to push rollback"
        update_rollback_status "failed" "Failed to push rollback"
        return 1
    fi
}

# Function to monitor deployment and trigger rollback if needed
monitor_and_rollback() {
    local max_attempts=${1:-$HEALTH_CHECK_ATTEMPTS}
    local check_interval=${2:-$HEALTH_CHECK_INTERVAL}
    
    log "Starting deployment monitoring for rollback detection..."
    update_rollback_status "monitoring" "Monitoring deployment health for potential rollback"
    
    local attempt=1
    local consecutive_failures=0
    local max_consecutive_failures=2
    
    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts"
        
        if assess_deployment_health; then
            success "Deployment health check passed (attempt $attempt)"
            consecutive_failures=0
            
            # If this is the final check and all is well, save as good commit
            if [ $attempt -eq $max_attempts ]; then
                save_good_commit
                update_rollback_status "healthy" "Deployment is healthy, monitoring complete"
                return 0
            fi
        else
            error "Deployment health check failed (attempt $attempt)"
            ((consecutive_failures++))
            
            if [ $consecutive_failures -ge $max_consecutive_failures ]; then
                error "Multiple consecutive health check failures detected"
                
                # Get last known good commit
                local last_good_commit=$(get_last_good_commit)
                
                if [ -n "$last_good_commit" ]; then
                    warn "Triggering automatic rollback to $last_good_commit"
                    
                    if execute_rollback "$last_good_commit" "Multiple health check failures"; then
                        success "Automatic rollback completed successfully"
                        return 0
                    else
                        error "Automatic rollback failed"
                        update_rollback_status "failed" "Automatic rollback failed"
                        return 1
                    fi
                else
                    error "No last known good commit available for rollback"
                    update_rollback_status "failed" "No rollback target available"
                    return 1
                fi
            fi
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            log "Waiting ${check_interval}s before next health check..."
            sleep $check_interval
        fi
        
        ((attempt++))
    done
    
    error "Maximum health check attempts reached"
    update_rollback_status "failed" "Maximum health check attempts reached"
    return 1
}

# Function to perform manual rollback
manual_rollback() {
    local target_commit=${1:-""}
    
    if [ -z "$target_commit" ]; then
        target_commit=$(get_last_good_commit)
        if [ -z "$target_commit" ]; then
            error "No target commit specified and no last known good commit available"
            return 1
        fi
        log "Using last known good commit: $target_commit"
    fi
    
    log "Performing manual rollback to $target_commit"
    
    if execute_rollback "$target_commit" "Manual rollback requested"; then
        success "Manual rollback completed successfully"
        return 0
    else
        error "Manual rollback failed"
        return 1
    fi
}

# Function to test rollback system
test_rollback_system() {
    log "Testing rollback system..."
    
    # Save current state
    local current_commit=$(git rev-parse HEAD)
    save_good_commit
    
    # Simulate a deployment failure scenario
    log "Simulating deployment failure scenario..."
    
    # Create a test commit that would "fail"
    echo "<!-- Test rollback scenario -->" >> test-rollback.html
    git add test-rollback.html
    git commit -m "Test: Simulate failed deployment for rollback testing"
    
    # Simulate health check failure by checking a non-existent URL
    DEPLOYMENT_URL="https://nonexistent-test-url.example.com"
    
    log "Running health assessment with simulated failure..."
    if assess_deployment_health; then
        warn "Health check unexpectedly passed"
    else
        log "Health check failed as expected"
        
        # Test rollback
        if execute_rollback "$current_commit" "Rollback system test"; then
            success "Rollback test completed successfully"
            
            # Clean up test file
            rm -f test-rollback.html
            git add test-rollback.html 2>/dev/null || true
            git commit -m "Clean up rollback test" 2>/dev/null || true
            
            return 0
        else
            error "Rollback test failed"
            return 1
        fi
    fi
    
    # Restore original URL
    DEPLOYMENT_URL="https://elevateforhumanity.pages.dev"
}

# Main command handling
COMMAND=${1:-help}

case $COMMAND in
    "monitor")
        monitor_and_rollback
        ;;
    "rollback")
        manual_rollback "$2"
        ;;
    "health")
        assess_deployment_health
        ;;
    "status")
        if [ -f "$ROLLBACK_STATUS" ]; then
            cat "$ROLLBACK_STATUS" | jq . 2>/dev/null || cat "$ROLLBACK_STATUS"
        else
            echo '{"status": "unknown", "message": "No rollback status available"}'
        fi
        ;;
    "save-good")
        save_good_commit
        ;;
    "test")
        test_rollback_system
        ;;
    "logs")
        if [ -f "$ROLLBACK_LOG" ]; then
            tail -50 "$ROLLBACK_LOG"
        else
            echo "No rollback logs available"
        fi
        ;;
    "help"|*)
        echo "Autopilot Rollback System Commands:"
        echo "  monitor           - Monitor deployment and rollback if needed"
        echo "  rollback [commit] - Perform manual rollback to specified commit"
        echo "  health            - Check current deployment health"
        echo "  status            - Show rollback system status"
        echo "  save-good         - Save current commit as last known good"
        echo "  test              - Test rollback system functionality"
        echo "  logs              - Show recent rollback logs"
        ;;
esac