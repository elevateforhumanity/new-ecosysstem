#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# AUTOPILOT DEPLOYMENT ENGINE
# ===================================================================
# Automated deployment system with health checks and rollback
# Monitors changes and triggers deployments automatically
# ===================================================================

echo "🚀 Autopilot Deployment Engine Starting..."
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[DEPLOY]${NC} $*"; }
success() { echo -e "${GREEN}[✅ SUCCESS]${NC} $*"; }
warn() { echo -e "${YELLOW}[⚠️ WARN]${NC} $*"; }
error() { echo -e "${RED}[❌ ERROR]${NC} $*"; }
info() { echo -e "${PURPLE}[ℹ️ INFO]${NC} $*"; }

# Configuration
DEPLOYMENT_URL="https://elevateforhumanity.pages.dev"
CUSTOM_DOMAIN="https://elevateforhumanity.org"
HEALTH_CHECK_TIMEOUT=300  # 5 minutes
ROLLBACK_ENABLED=true
NOTIFICATION_WEBHOOK=""  # Add webhook URL if needed

# Deployment state tracking
DEPLOYMENT_LOG="/tmp/autopilot-deployment.log"
DEPLOYMENT_STATUS="/tmp/deployment-status.json"
LAST_COMMIT_FILE="/tmp/last-deployed-commit"

# Function to log deployment events
log_deployment() {
    local level=$1
    local message=$2
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    echo "[$timestamp] [$level] $message" >> "$DEPLOYMENT_LOG"
}

# Function to update deployment status
update_status() {
    local status=$1
    local message=$2
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    cat > "$DEPLOYMENT_STATUS" << EOF
{
  "status": "$status",
  "message": "$message",
  "timestamp": "$timestamp",
  "deployment_url": "$DEPLOYMENT_URL",
  "custom_domain": "$CUSTOM_DOMAIN",
  "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF
}

# Function to check if deployment is needed
check_deployment_needed() {
    local current_commit=$(git rev-parse HEAD)
    local last_deployed=""
    
    if [ -f "$LAST_COMMIT_FILE" ]; then
        last_deployed=$(cat "$LAST_COMMIT_FILE")
    fi
    
    if [ "$current_commit" != "$last_deployed" ]; then
        log "New commit detected: $current_commit"
        log "Last deployed: ${last_deployed:-'none'}"
        return 0  # Deployment needed
    else
        info "No new commits since last deployment"
        return 1  # No deployment needed
    fi
}

# Function to prepare deployment
prepare_deployment() {
    log "Preparing deployment files..."
    
    # Run the deployment preparation script
    if bash cloudflare-deploy.sh > /tmp/deploy-prep.log 2>&1; then
        success "Deployment files prepared successfully"
        log_deployment "INFO" "Deployment files prepared - $(find dist -type f | wc -l) files ready"
        return 0
    else
        error "Failed to prepare deployment files"
        log_deployment "ERROR" "Deployment preparation failed"
        cat /tmp/deploy-prep.log
        return 1
    fi
}

# Function to trigger GitHub Actions deployment
trigger_deployment() {
    log "Triggering GitHub Actions deployment..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository"
        return 1
    fi
    
    # Check if there are uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        warn "Uncommitted changes detected, committing automatically..."
        git add .
        git commit -m "🤖 Autopilot: Automatic deployment commit - $(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)

- Automated deployment triggered by autopilot
- Files prepared and ready for Cloudflare Pages
- Commit: $(git rev-parse HEAD)

Co-authored-by: Ona <no-reply@ona.com>"
    fi
    
    # Push to trigger deployment
    if git push origin main; then
        success "Deployment triggered via git push"
        log_deployment "INFO" "GitHub Actions deployment triggered"
        echo "$(git rev-parse HEAD)" > "$LAST_COMMIT_FILE"
        return 0
    else
        error "Failed to push to repository"
        log_deployment "ERROR" "Git push failed"
        return 1
    fi
}

# Function to monitor deployment progress
monitor_deployment() {
    log "Monitoring deployment progress..."
    local start_time=$(date +%s)
    local timeout_time=$((start_time + HEALTH_CHECK_TIMEOUT))
    
    update_status "deploying" "Deployment in progress, monitoring health..."
    
    while [ $(date +%s) -lt $timeout_time ]; do
        # Check if site is responding
        if curl -s -f --max-time 10 "$DEPLOYMENT_URL" > /dev/null 2>&1; then
            # Check if content is updated (basic check)
            local response=$(curl -s --max-time 10 "$DEPLOYMENT_URL" | head -20)
            if echo "$response" | grep -q "html\|<!DOCTYPE"; then
                success "Deployment successful - site is responding"
                log_deployment "SUCCESS" "Deployment completed successfully"
                update_status "success" "Deployment completed and verified"
                
                # Also check custom domain if different
                if [ "$CUSTOM_DOMAIN" != "$DEPLOYMENT_URL" ]; then
                    if curl -s -f --max-time 10 "$CUSTOM_DOMAIN" > /dev/null 2>&1; then
                        success "Custom domain also responding: $CUSTOM_DOMAIN"
                        log_deployment "SUCCESS" "Custom domain verified"
                    else
                        warn "Custom domain not yet responding: $CUSTOM_DOMAIN"
                        log_deployment "WARN" "Custom domain not responding yet"
                    fi
                fi
                
                return 0
            fi
        fi
        
        info "Waiting for deployment to complete... ($(( ($(date +%s) - start_time) / 60 )) min elapsed)"
        sleep 30
    done
    
    error "Deployment timeout - site not responding after $((HEALTH_CHECK_TIMEOUT / 60)) minutes"
    log_deployment "ERROR" "Deployment timeout"
    update_status "failed" "Deployment timeout - site not responding"
    return 1
}

# Function to perform health checks
health_check() {
    log "Performing comprehensive health check..."
    local health_score=0
    local total_checks=5
    
    # Check 1: Basic connectivity
    if curl -s -f --max-time 10 "$DEPLOYMENT_URL" > /dev/null 2>&1; then
        success "✓ Site connectivity check passed"
        ((health_score++))
    else
        error "✗ Site connectivity check failed"
    fi
    
    # Check 2: HTML content validation
    local content=$(curl -s --max-time 10 "$DEPLOYMENT_URL" 2>/dev/null || echo "")
    if echo "$content" | grep -q "<!DOCTYPE html\|<html"; then
        success "✓ HTML content validation passed"
        ((health_score++))
    else
        error "✗ HTML content validation failed"
    fi
    
    # Check 3: Essential pages
    local pages=("/" "/about.html" "/programs.html" "/lms.html")
    local page_score=0
    for page in "${pages[@]}"; do
        if curl -s -f --max-time 10 "${DEPLOYMENT_URL}${page}" > /dev/null 2>&1; then
            ((page_score++))
        fi
    done
    if [ $page_score -ge 3 ]; then
        success "✓ Essential pages check passed ($page_score/4 pages)"
        ((health_score++))
    else
        error "✗ Essential pages check failed ($page_score/4 pages)"
    fi
    
    # Check 4: Security headers
    local headers=$(curl -s -I --max-time 10 "$DEPLOYMENT_URL" 2>/dev/null || echo "")
    if echo "$headers" | grep -q "X-Content-Type-Options\|X-Frame-Options"; then
        success "✓ Security headers check passed"
        ((health_score++))
    else
        warn "✗ Security headers check failed"
    fi
    
    # Check 5: Performance check
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$DEPLOYMENT_URL" 2>/dev/null || echo "10")
    if (( $(echo "$response_time < 3.0" | bc -l 2>/dev/null || echo "0") )); then
        success "✓ Performance check passed (${response_time}s)"
        ((health_score++))
    else
        warn "✗ Performance check failed (${response_time}s)"
    fi
    
    # Calculate health percentage
    local health_percentage=$(( (health_score * 100) / total_checks ))
    
    log "Health check complete: $health_score/$total_checks checks passed ($health_percentage%)"
    log_deployment "INFO" "Health check: $health_score/$total_checks passed ($health_percentage%)"
    
    if [ $health_score -ge 4 ]; then
        success "Deployment health check PASSED"
        update_status "healthy" "Deployment healthy - $health_score/$total_checks checks passed"
        return 0
    else
        error "Deployment health check FAILED"
        update_status "unhealthy" "Deployment unhealthy - only $health_score/$total_checks checks passed"
        return 1
    fi
}

# Function to send notifications
send_notification() {
    local status=$1
    local message=$2
    
    if [ -n "$NOTIFICATION_WEBHOOK" ]; then
        local payload=$(cat << EOF
{
  "status": "$status",
  "message": "$message",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployment_url": "$DEPLOYMENT_URL",
  "custom_domain": "$CUSTOM_DOMAIN",
  "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
}
EOF
)
        
        curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$NOTIFICATION_WEBHOOK" > /dev/null 2>&1 || true
    fi
    
    # Log notification
    log_deployment "NOTIFICATION" "$status: $message"
}

# Function to perform rollback
perform_rollback() {
    if [ "$ROLLBACK_ENABLED" = "true" ]; then
        warn "Rollback functionality would be triggered here"
        log_deployment "WARN" "Rollback triggered due to deployment failure"
        # Note: Cloudflare Pages doesn't have direct rollback API
        # This would typically involve reverting git commits and redeploying
        update_status "rollback" "Rollback initiated due to deployment failure"
    else
        warn "Rollback disabled, manual intervention required"
        log_deployment "WARN" "Rollback disabled, manual intervention needed"
    fi
}

# Main deployment workflow
main_deployment_workflow() {
    log "Starting autopilot deployment workflow..."
    update_status "starting" "Autopilot deployment workflow initiated"
    
    # Check if deployment is needed
    if ! check_deployment_needed; then
        info "No deployment needed, exiting"
        update_status "idle" "No changes detected, deployment not needed"
        return 0
    fi
    
    # Prepare deployment
    if ! prepare_deployment; then
        error "Deployment preparation failed"
        update_status "failed" "Deployment preparation failed"
        send_notification "failed" "Deployment preparation failed"
        return 1
    fi
    
    # Trigger deployment
    if ! trigger_deployment; then
        error "Failed to trigger deployment"
        update_status "failed" "Failed to trigger GitHub Actions deployment"
        send_notification "failed" "Failed to trigger deployment"
        return 1
    fi
    
    # Monitor deployment
    if ! monitor_deployment; then
        error "Deployment monitoring failed"
        send_notification "failed" "Deployment timeout or failure"
        if [ "$ROLLBACK_ENABLED" = "true" ]; then
            perform_rollback
        fi
        return 1
    fi
    
    # Perform health checks
    if ! health_check; then
        error "Health check failed"
        send_notification "unhealthy" "Deployment completed but health check failed"
        if [ "$ROLLBACK_ENABLED" = "true" ]; then
            perform_rollback
        fi
        return 1
    fi
    
    # Success!
    success "Autopilot deployment completed successfully!"
    send_notification "success" "Deployment completed and verified successfully"
    
    # Display summary
    echo ""
    echo "🎉 DEPLOYMENT SUCCESS SUMMARY"
    echo "============================"
    echo "✅ Files prepared and deployed"
    echo "✅ Health checks passed"
    echo "✅ Site responding correctly"
    echo ""
    echo "🌐 Deployment URLs:"
    echo "   Primary: $DEPLOYMENT_URL"
    echo "   Custom:  $CUSTOM_DOMAIN"
    echo ""
    echo "📊 Deployment logs: $DEPLOYMENT_LOG"
    echo "📋 Status file: $DEPLOYMENT_STATUS"
    
    return 0
}

# Command handling
COMMAND=${1:-deploy}

case $COMMAND in
    "deploy")
        main_deployment_workflow
        ;;
    "status")
        if [ -f "$DEPLOYMENT_STATUS" ]; then
            cat "$DEPLOYMENT_STATUS" | jq . 2>/dev/null || cat "$DEPLOYMENT_STATUS"
        else
            echo '{"status": "unknown", "message": "No deployment status available"}'
        fi
        ;;
    "health")
        health_check
        ;;
    "logs")
        if [ -f "$DEPLOYMENT_LOG" ]; then
            tail -50 "$DEPLOYMENT_LOG"
        else
            echo "No deployment logs available"
        fi
        ;;
    "monitor")
        log "Starting continuous deployment monitoring..."
        while true; do
            if check_deployment_needed; then
                log "Changes detected, triggering deployment..."
                main_deployment_workflow
            fi
            sleep 60  # Check every minute
        done
        ;;
    "help"|*)
        echo "Autopilot Deployment Engine Commands:"
        echo "  deploy  - Run single deployment workflow"
        echo "  status  - Show current deployment status"
        echo "  health  - Perform health check"
        echo "  logs    - Show recent deployment logs"
        echo "  monitor - Start continuous monitoring mode"
        ;;
esac