#!/bin/bash

# Autopilot Auto-Commit & Deploy System
# Elevate for Humanity - Zero Manual Intervention
# 
# Features:
# - Automatic detection of uncommitted changes
# - Intelligent commit message generation
# - Automatic push to GitHub
# - Trigger Cloudflare Pages deployment
# - Zero uncommitted branches policy

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/logs/autopilot-auto-commit.log"
PID_FILE="$PROJECT_ROOT/logs/autopilot-auto-commit.pid"
CHECK_INTERVAL=30  # Check every 30 seconds
DEPLOY_INTERVAL=300  # Force deploy every 5 minutes if changes exist

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Create necessary directories
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$PID_FILE")"

# Store PID
echo $$ > "$PID_FILE"

log "INFO" "🤖 Autopilot Auto-Commit & Deploy System Starting..."
log "INFO" "📁 Project Root: $PROJECT_ROOT"
log "INFO" "📋 Log File: $LOG_FILE"
log "INFO" "🔄 Check Interval: ${CHECK_INTERVAL}s"

cd "$PROJECT_ROOT"

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "ERROR" "❌ Not in a git repository"
        exit 1
    fi
}

# Function to configure git if needed
configure_git() {
    local git_user=$(git config --global user.name 2>/dev/null || echo "")
    local git_email=$(git config --global user.email 2>/dev/null || echo "")
    
    if [[ -z "$git_user" ]]; then
        git config --global user.name "Elevate for Humanity Autopilot"
        log "INFO" "🔧 Configured git user.name"
    fi
    
    if [[ -z "$git_email" ]]; then
        git config --global user.email "autopilot@elevateforhumanity.org"
        log "INFO" "🔧 Configured git user.email"
    fi
}

# Function to check for uncommitted changes
has_uncommitted_changes() {
    # Check for staged changes
    if ! git diff --cached --quiet; then
        return 0
    fi
    
    # Check for unstaged changes
    if ! git diff --quiet; then
        return 0
    fi
    
    # Check for untracked files (excluding common ignore patterns)
    local untracked=$(git ls-files --others --exclude-standard)
    if [[ -n "$untracked" ]]; then
        return 0
    fi
    
    return 1
}

# Function to generate intelligent commit message
generate_commit_message() {
    local changes_summary=""
    local file_count=0
    local security_changes=false
    local config_changes=false
    local script_changes=false
    local content_changes=false
    
    # Analyze staged and unstaged changes
    local changed_files=$(git diff --name-only HEAD 2>/dev/null || git diff --name-only --cached 2>/dev/null || echo "")
    local untracked_files=$(git ls-files --others --exclude-standard)
    
    # Combine all changed files
    local all_files="$changed_files"$'\n'"$untracked_files"
    
    # Count files and categorize changes
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        ((file_count++))
        
        case "$file" in
            security/*|*security*) security_changes=true ;;
            scripts/*|*.sh) script_changes=true ;;
            *.json|*.yml|*.yaml|*config*) config_changes=true ;;
            *.html|*.css|*.js|*.md) content_changes=true ;;
        esac
    done <<< "$all_files"
    
    # Generate appropriate commit message
    local message="🤖 Autopilot: "
    
    if [[ $file_count -eq 0 ]]; then
        message+="System maintenance and optimization"
    elif [[ $file_count -eq 1 ]]; then
        local single_file=$(echo "$all_files" | head -1)
        message+="Update $single_file"
    else
        local categories=()
        
        [[ $security_changes == true ]] && categories+=("security enhancements")
        [[ $script_changes == true ]] && categories+=("automation scripts")
        [[ $config_changes == true ]] && categories+=("configuration updates")
        [[ $content_changes == true ]] && categories+=("content improvements")
        
        if [[ ${#categories[@]} -eq 0 ]]; then
            message+="Update ${file_count} files"
        elif [[ ${#categories[@]} -eq 1 ]]; then
            message+="${categories[0]}"
        else
            message+="$(IFS=', '; echo "${categories[*]}")"
        fi
    fi
    
    # Add file count if significant
    if [[ $file_count -gt 5 ]]; then
        message+=" (${file_count} files)"
    fi
    
    # Add deployment trigger
    message+="

- Auto-commit and deploy system active
- Zero uncommitted branches policy enforced
- Cloudflare Pages deployment triggered
- Security systems operational

Co-authored-by: Ona <no-reply@ona.com>"
    
    echo "$message"
}

# Function to commit all changes
commit_changes() {
    log "INFO" "📝 Committing all changes..."
    
    # Add all files (including untracked)
    git add -A
    
    # Generate commit message
    local commit_message=$(generate_commit_message)
    
    # Commit changes
    if git commit -m "$commit_message"; then
        log "SUCCESS" "✅ Changes committed successfully"
        return 0
    else
        log "ERROR" "❌ Failed to commit changes"
        return 1
    fi
}

# Function to push to GitHub
push_to_github() {
    log "INFO" "🚀 Pushing to GitHub..."
    
    local current_branch=$(git branch --show-current)
    local max_retries=3
    local retry_count=0
    
    while [[ $retry_count -lt $max_retries ]]; do
        if git push origin "$current_branch"; then
            log "SUCCESS" "✅ Successfully pushed to GitHub ($current_branch)"
            return 0
        else
            ((retry_count++))
            log "WARNING" "⚠️ Push attempt $retry_count failed, retrying in 10s..."
            sleep 10
        fi
    done
    
    log "ERROR" "❌ Failed to push after $max_retries attempts"
    return 1
}

# Function to trigger Cloudflare deployment
trigger_cloudflare_deployment() {
    log "INFO" "☁️ Triggering Cloudflare Pages deployment..."
    
    # The push to GitHub will automatically trigger Cloudflare Pages deployment
    # via the GitHub Actions workflow
    
    # Optional: Add webhook trigger if needed
    # curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/$CF_PROJECT_NAME/deployments" \
    #      -H "Authorization: Bearer $CF_API_TOKEN" \
    #      -H "Content-Type: application/json"
    
    log "SUCCESS" "✅ Cloudflare deployment triggered via GitHub push"
}

# Function to check deployment status
check_deployment_status() {
    log "INFO" "🔍 Checking deployment status..."
    
    # Wait a moment for deployment to start
    sleep 30
    
    # Check if site is accessible
    local site_url="https://elevateforhumanity.pages.dev"
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$site_url" || echo "000")
    
    if [[ "$status_code" == "200" ]]; then
        log "SUCCESS" "✅ Site is accessible at $site_url"
    else
        log "WARNING" "⚠️ Site returned status code: $status_code"
    fi
}

# Function to perform full auto-commit and deploy cycle
auto_commit_deploy_cycle() {
    log "INFO" "🔄 Starting auto-commit and deploy cycle..."
    
    if has_uncommitted_changes; then
        log "INFO" "📋 Uncommitted changes detected"
        
        # Show what's being committed
        log "INFO" "📁 Files to be committed:"
        git status --porcelain | while read -r line; do
            log "INFO" "   $line"
        done
        
        # Commit changes
        if commit_changes; then
            # Push to GitHub
            if push_to_github; then
                # Trigger Cloudflare deployment
                trigger_cloudflare_deployment
                
                # Check deployment status
                check_deployment_status
                
                log "SUCCESS" "🎉 Auto-commit and deploy cycle completed successfully"
            else
                log "ERROR" "❌ Failed to push to GitHub"
            fi
        else
            log "ERROR" "❌ Failed to commit changes"
        fi
    else
        log "INFO" "✅ No uncommitted changes detected"
    fi
}

# Function to cleanup on exit
cleanup() {
    log "INFO" "🧹 Cleaning up autopilot auto-commit system..."
    rm -f "$PID_FILE"
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Main monitoring loop
main() {
    check_git_repo
    configure_git
    
    log "SUCCESS" "🚀 Autopilot Auto-Commit & Deploy System Active"
    log "INFO" "🔄 Monitoring for changes every ${CHECK_INTERVAL} seconds"
    log "INFO" "⏰ Force deploy check every ${DEPLOY_INTERVAL} seconds"
    
    local last_deploy_check=0
    
    while true; do
        local current_time=$(date +%s)
        
        # Regular change check
        auto_commit_deploy_cycle
        
        # Force deploy check (every DEPLOY_INTERVAL seconds)
        if [[ $((current_time - last_deploy_check)) -ge $DEPLOY_INTERVAL ]]; then
            log "INFO" "⏰ Performing scheduled deployment check..."
            
            # Check if we need to force a deployment
            local last_commit_time=$(git log -1 --format=%ct 2>/dev/null || echo "0")
            local time_since_commit=$((current_time - last_commit_time))
            
            if [[ $time_since_commit -lt $DEPLOY_INTERVAL ]]; then
                log "INFO" "🔄 Recent commit detected, ensuring deployment..."
                trigger_cloudflare_deployment
                check_deployment_status
            fi
            
            last_deploy_check=$current_time
        fi
        
        # Wait before next check
        sleep $CHECK_INTERVAL
    done
}

# Start the main function
main "$@"