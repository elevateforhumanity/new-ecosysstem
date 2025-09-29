#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# AUTOPILOT NOTIFICATION SYSTEM
# ===================================================================
# Comprehensive notification and status tracking for deployments
# Supports multiple notification channels and status dashboards
# ===================================================================

echo "📢 Autopilot Notification System Starting..."
echo "==========================================="

# Configuration
NOTIFICATION_LOG="/tmp/autopilot-notifications.log"
STATUS_DASHBOARD="/tmp/deployment-dashboard.json"
NOTIFICATION_CONFIG="/tmp/notification-config.json"
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
    echo "$msg" >> "$NOTIFICATION_LOG"
}

success() { 
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $*"
    echo -e "${GREEN}$msg${NC}"
    echo "$msg" >> "$NOTIFICATION_LOG"
}

warn() { 
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ $*"
    echo -e "${YELLOW}$msg${NC}"
    echo "$msg" >> "$NOTIFICATION_LOG"
}

error() { 
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $*"
    echo -e "${RED}$msg${NC}"
    echo "$msg" >> "$NOTIFICATION_LOG"
}

# Function to initialize notification configuration
init_notification_config() {
    if [ ! -f "$NOTIFICATION_CONFIG" ]; then
        log "Creating notification configuration..."
        
        cat > "$NOTIFICATION_CONFIG" << 'EOF'
{
  "channels": {
    "console": {
      "enabled": true,
      "level": "info"
    },
    "file": {
      "enabled": true,
      "level": "debug",
      "path": "/tmp/autopilot-notifications.log"
    },
    "webhook": {
      "enabled": false,
      "level": "warning",
      "url": "",
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "email": {
      "enabled": false,
      "level": "error",
      "smtp_server": "",
      "from": "",
      "to": []
    }
  },
  "events": {
    "deployment_started": true,
    "deployment_completed": true,
    "deployment_failed": true,
    "health_check_passed": false,
    "health_check_failed": true,
    "rollback_triggered": true,
    "rollback_completed": true,
    "performance_warning": true,
    "security_warning": true
  }
}
EOF
        success "Notification configuration created"
    fi
}

# Function to send console notification
send_console_notification() {
    local level=$1
    local title=$2
    local message=$3
    local details=${4:-""}
    
    case $level in
        "success")
            success "$title: $message"
            ;;
        "warning")
            warn "$title: $message"
            ;;
        "error")
            error "$title: $message"
            ;;
        *)
            log "$title: $message"
            ;;
    esac
    
    if [ -n "$details" ]; then
        echo "  Details: $details"
    fi
}

# Function to send webhook notification
send_webhook_notification() {
    local webhook_url=$1
    local level=$2
    local title=$3
    local message=$4
    local details=${5:-""}
    
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    local branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    
    local payload=$(cat << EOF
{
  "timestamp": "$timestamp",
  "level": "$level",
  "title": "$title",
  "message": "$message",
  "details": "$details",
  "deployment": {
    "url": "$DEPLOYMENT_URL",
    "custom_domain": "$CUSTOM_DOMAIN",
    "commit": "$commit",
    "branch": "$branch"
  },
  "source": "autopilot-notification-system"
}
EOF
)
    
    if curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$webhook_url" > /dev/null 2>&1; then
        log "Webhook notification sent successfully"
    else
        warn "Failed to send webhook notification"
    fi
}

# Function to send notification
send_notification() {
    local event_type=$1
    local level=$2
    local title=$3
    local message=$4
    local details=${5:-""}
    
    # Load configuration
    if [ ! -f "$NOTIFICATION_CONFIG" ]; then
        init_notification_config
    fi
    
    local config=$(cat "$NOTIFICATION_CONFIG")
    
    # Check if event is enabled
    local event_enabled=$(echo "$config" | jq -r ".events.${event_type} // false" 2>/dev/null || echo "true")
    if [ "$event_enabled" != "true" ]; then
        return 0
    fi
    
    # Console notification
    local console_enabled=$(echo "$config" | jq -r ".channels.console.enabled // true" 2>/dev/null || echo "true")
    if [ "$console_enabled" = "true" ]; then
        send_console_notification "$level" "$title" "$message" "$details"
    fi
    
    # Webhook notification
    local webhook_enabled=$(echo "$config" | jq -r ".channels.webhook.enabled // false" 2>/dev/null || echo "false")
    local webhook_url=$(echo "$config" | jq -r ".channels.webhook.url // \"\"" 2>/dev/null || echo "")
    
    if [ "$webhook_enabled" = "true" ] && [ -n "$webhook_url" ]; then
        send_webhook_notification "$webhook_url" "$level" "$title" "$message" "$details"
    fi
    
    # Log notification
    local notification_entry="[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $event_type: $title - $message"
    echo "$notification_entry" >> "$NOTIFICATION_LOG"
}

# Function to update deployment dashboard
update_dashboard() {
    local status=$1
    local message=$2
    local additional_data=${3:-"{}"}
    
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    local branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    
    # Get deployment statistics
    local total_files=0
    local deployment_size="0"
    if [ -d "dist" ]; then
        total_files=$(find dist -type f | wc -l)
        deployment_size=$(du -sh dist 2>/dev/null | cut -f1 || echo "0")
    fi
    
    # Get recent deployment history
    local deployment_history="[]"
    if [ -f "/tmp/deployment-history.json" ]; then
        deployment_history=$(cat "/tmp/deployment-history.json" 2>/dev/null || echo "[]")
    fi
    
    # Create dashboard data
    cat > "$STATUS_DASHBOARD" << EOF
{
  "status": "$status",
  "message": "$message",
  "timestamp": "$timestamp",
  "deployment": {
    "url": "$DEPLOYMENT_URL",
    "custom_domain": "$CUSTOM_DOMAIN",
    "commit": "$commit",
    "branch": "$branch",
    "files": $total_files,
    "size": "$deployment_size"
  },
  "health": {
    "last_check": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "status": "unknown",
    "response_time": "0",
    "uptime": "unknown"
  },
  "statistics": {
    "total_deployments": $(grep -c "deployment_completed" "$NOTIFICATION_LOG" 2>/dev/null || echo "0"),
    "failed_deployments": $(grep -c "deployment_failed" "$NOTIFICATION_LOG" 2>/dev/null || echo "0"),
    "rollbacks": $(grep -c "rollback_triggered" "$NOTIFICATION_LOG" 2>/dev/null || echo "0"),
    "last_deployment": "$timestamp"
  },
  "recent_events": $(tail -10 "$NOTIFICATION_LOG" 2>/dev/null | jq -R . | jq -s . || echo "[]"),
  "additional_data": $additional_data
}
EOF
    
    log "Dashboard updated with status: $status"
}

# Function to check and update health status
update_health_status() {
    log "Updating health status..."
    
    local health_status="unknown"
    local response_time="0"
    local uptime_status="unknown"
    
    # Check primary URL
    local start_time=$(date +%s.%N)
    if curl -s -f --max-time 30 "$DEPLOYMENT_URL" > /dev/null 2>&1; then
        local end_time=$(date +%s.%N)
        response_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
        health_status="healthy"
        uptime_status="up"
    else
        health_status="unhealthy"
        uptime_status="down"
    fi
    
    # Update dashboard with health info
    local health_data=$(cat << EOF
{
  "health_check_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "primary_url_status": "$health_status",
  "response_time": "$response_time",
  "uptime_status": "$uptime_status"
}
EOF
)
    
    # Read current dashboard and update health section
    if [ -f "$STATUS_DASHBOARD" ]; then
        local current_dashboard=$(cat "$STATUS_DASHBOARD")
        local updated_dashboard=$(echo "$current_dashboard" | jq ".health = $health_data" 2>/dev/null || echo "$current_dashboard")
        echo "$updated_dashboard" > "$STATUS_DASHBOARD"
    fi
    
    log "Health status updated: $health_status (${response_time}s)"
}

# Function to generate status report
generate_status_report() {
    log "Generating comprehensive status report..."
    
    local report_file="/tmp/autopilot-status-report.html"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S UTC')
    
    # Get dashboard data
    local dashboard_data="{}"
    if [ -f "$STATUS_DASHBOARD" ]; then
        dashboard_data=$(cat "$STATUS_DASHBOARD")
    fi
    
    # Generate HTML report
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autopilot Deployment Status</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status-card { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
        .status-healthy { border-left-color: #28a745; }
        .status-warning { border-left-color: #ffc107; }
        .status-error { border-left-color: #dc3545; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .metric { text-align: center; padding: 10px; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; }
        .log-entry { font-family: monospace; font-size: 12px; padding: 5px; background: #f8f9fa; margin: 2px 0; }
        .timestamp { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Autopilot Deployment Status</h1>
            <p>Generated: $timestamp</p>
        </div>
        
        <div class="status-card status-healthy">
            <h3>Current Deployment Status</h3>
            <p><strong>Primary URL:</strong> <a href="$DEPLOYMENT_URL" target="_blank">$DEPLOYMENT_URL</a></p>
            <p><strong>Custom Domain:</strong> <a href="$CUSTOM_DOMAIN" target="_blank">$CUSTOM_DOMAIN</a></p>
            <p><strong>Status:</strong> $(echo "$dashboard_data" | jq -r '.status // "unknown"')</p>
            <p><strong>Last Update:</strong> $(echo "$dashboard_data" | jq -r '.timestamp // "unknown"')</p>
        </div>
        
        <div class="grid">
            <div class="metric">
                <div class="metric-value">$(echo "$dashboard_data" | jq -r '.statistics.total_deployments // "0"')</div>
                <div class="metric-label">Total Deployments</div>
            </div>
            <div class="metric">
                <div class="metric-value">$(echo "$dashboard_data" | jq -r '.statistics.failed_deployments // "0"')</div>
                <div class="metric-label">Failed Deployments</div>
            </div>
            <div class="metric">
                <div class="metric-value">$(echo "$dashboard_data" | jq -r '.statistics.rollbacks // "0"')</div>
                <div class="metric-label">Rollbacks</div>
            </div>
            <div class="metric">
                <div class="metric-value">$(echo "$dashboard_data" | jq -r '.deployment.files // "0"')</div>
                <div class="metric-label">Files Deployed</div>
            </div>
        </div>
        
        <div class="status-card">
            <h3>Health Status</h3>
            <p><strong>Response Time:</strong> $(echo "$dashboard_data" | jq -r '.health.response_time // "unknown"')s</p>
            <p><strong>Last Health Check:</strong> $(echo "$dashboard_data" | jq -r '.health.last_check // "unknown"')</p>
            <p><strong>Uptime Status:</strong> $(echo "$dashboard_data" | jq -r '.health.uptime // "unknown"')</p>
        </div>
        
        <div class="status-card">
            <h3>Recent Events</h3>
            <div style="max-height: 300px; overflow-y: auto;">
$(tail -20 "$NOTIFICATION_LOG" 2>/dev/null | while read line; do
    echo "                <div class=\"log-entry\">$line</div>"
done || echo "                <div class=\"log-entry\">No recent events</div>")
            </div>
        </div>
        
        <div class="status-card">
            <h3>Quick Actions</h3>
            <p>🔍 <strong>Health Check:</strong> <code>bash scripts/autopilot-health-validator.sh</code></p>
            <p>🚀 <strong>Deploy:</strong> <code>bash scripts/autopilot-deployment-engine.sh deploy</code></p>
            <p>🔄 <strong>Rollback:</strong> <code>bash scripts/autopilot-rollback-system.sh rollback</code></p>
            <p>📊 <strong>Monitor:</strong> <code>bash scripts/autopilot-monitor-daemon.sh</code></p>
        </div>
    </div>
</body>
</html>
EOF
    
    success "Status report generated: $report_file"
    echo "$report_file"
}

# Function to send deployment notifications
notify_deployment_event() {
    local event=$1
    local status=$2
    local details=${3:-""}
    
    case $event in
        "started")
            send_notification "deployment_started" "info" "Deployment Started" "Deployment process initiated" "$details"
            update_dashboard "deploying" "Deployment in progress"
            ;;
        "completed")
            send_notification "deployment_completed" "success" "Deployment Completed" "Deployment finished successfully" "$details"
            update_dashboard "deployed" "Deployment completed successfully"
            ;;
        "failed")
            send_notification "deployment_failed" "error" "Deployment Failed" "Deployment encountered errors" "$details"
            update_dashboard "failed" "Deployment failed"
            ;;
        "health_check_passed")
            send_notification "health_check_passed" "success" "Health Check Passed" "All health checks passed" "$details"
            ;;
        "health_check_failed")
            send_notification "health_check_failed" "warning" "Health Check Failed" "Some health checks failed" "$details"
            ;;
        "rollback_triggered")
            send_notification "rollback_triggered" "warning" "Rollback Triggered" "Automatic rollback initiated" "$details"
            update_dashboard "rolling_back" "Rollback in progress"
            ;;
        "rollback_completed")
            send_notification "rollback_completed" "info" "Rollback Completed" "Rollback finished successfully" "$details"
            update_dashboard "rolled_back" "Rollback completed"
            ;;
    esac
}

# Main command handling
COMMAND=${1:-help}

case $COMMAND in
    "init")
        init_notification_config
        update_dashboard "initialized" "Notification system initialized"
        ;;
    "notify")
        notify_deployment_event "$2" "$3" "$4"
        ;;
    "dashboard")
        update_dashboard "$2" "$3" "$4"
        ;;
    "health")
        update_health_status
        ;;
    "report")
        generate_status_report
        ;;
    "status")
        if [ -f "$STATUS_DASHBOARD" ]; then
            cat "$STATUS_DASHBOARD" | jq . 2>/dev/null || cat "$STATUS_DASHBOARD"
        else
            echo '{"status": "unknown", "message": "No status data available"}'
        fi
        ;;
    "logs")
        if [ -f "$NOTIFICATION_LOG" ]; then
            tail -50 "$NOTIFICATION_LOG"
        else
            echo "No notification logs available"
        fi
        ;;
    "test")
        log "Testing notification system..."
        notify_deployment_event "started" "info" "Test deployment"
        sleep 2
        notify_deployment_event "completed" "success" "Test completed successfully"
        update_health_status
        success "Notification system test completed"
        ;;
    "help"|*)
        echo "Autopilot Notification System Commands:"
        echo "  init                           - Initialize notification configuration"
        echo "  notify <event> <status> [msg]  - Send notification for event"
        echo "  dashboard <status> <message>   - Update deployment dashboard"
        echo "  health                         - Update health status"
        echo "  report                         - Generate HTML status report"
        echo "  status                         - Show current status"
        echo "  logs                           - Show recent notification logs"
        echo "  test                           - Test notification system"
        echo ""
        echo "Events: started, completed, failed, health_check_passed, health_check_failed, rollback_triggered, rollback_completed"
        ;;
esac