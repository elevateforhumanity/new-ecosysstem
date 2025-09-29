#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# AUTOPILOT HEALTH VALIDATOR
# ===================================================================
# Comprehensive health checks and validation for deployments
# Validates functionality, performance, security, and content
# ===================================================================

echo "🏥 Autopilot Health Validator Starting..."
echo "========================================"

# Configuration
DEPLOYMENT_URL="https://elevateforhumanity.pages.dev"
CUSTOM_DOMAIN="https://elevateforhumanity.org"
HEALTH_REPORT="/tmp/autopilot-health-report.json"
TIMEOUT=30
MAX_RESPONSE_TIME=5.0
MIN_HEALTH_SCORE=80

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[HEALTH]${NC} $*"; }
success() { echo -e "${GREEN}[✅ PASS]${NC} $*"; }
warn() { echo -e "${YELLOW}[⚠️ WARN]${NC} $*"; }
error() { echo -e "${RED}[❌ FAIL]${NC} $*"; }
info() { echo -e "${PURPLE}[ℹ️ INFO]${NC} $*"; }

# Health check results
declare -A health_results
declare -a failed_checks
declare -a warning_checks
total_checks=0
passed_checks=0
warning_checks_count=0
failed_checks_count=0

# Function to record health check result
record_check() {
    local check_name=$1
    local status=$2
    local message=$3
    local details=${4:-""}
    
    health_results["$check_name"]="$status|$message|$details"
    ((total_checks++))
    
    case $status in
        "PASS")
            success "$check_name: $message"
            ((passed_checks++))
            ;;
        "WARN")
            warn "$check_name: $message"
            warning_checks+=("$check_name: $message")
            ((warning_checks_count++))
            ;;
        "FAIL")
            error "$check_name: $message"
            failed_checks+=("$check_name: $message")
            ((failed_checks_count++))
            ;;
    esac
}

# Function to check URL accessibility
check_url_accessibility() {
    local url=$1
    local name=$2
    
    log "Checking $name accessibility..."
    
    local start_time=$(date +%s.%N)
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
    local end_time=$(date +%s.%N)
    local response_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "999")
    
    if [ "$http_code" = "200" ]; then
        if (( $(echo "$response_time < $MAX_RESPONSE_TIME" | bc -l 2>/dev/null || echo "0") )); then
            record_check "${name}_accessibility" "PASS" "Accessible (${response_time}s)" "HTTP $http_code"
        else
            record_check "${name}_accessibility" "WARN" "Accessible but slow (${response_time}s)" "HTTP $http_code"
        fi
    elif [ "$http_code" = "000" ]; then
        record_check "${name}_accessibility" "FAIL" "Connection timeout or error" "No response"
    else
        record_check "${name}_accessibility" "FAIL" "HTTP error" "HTTP $http_code"
    fi
}

# Function to validate HTML content
validate_html_content() {
    local url=$1
    local name=$2
    
    log "Validating $name HTML content..."
    
    local content=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null || echo "")
    local content_length=${#content}
    
    if [ $content_length -eq 0 ]; then
        record_check "${name}_html" "FAIL" "No content received" "0 bytes"
        return
    fi
    
    # Check for valid HTML structure
    if echo "$content" | grep -q "<!DOCTYPE html\|<html"; then
        if echo "$content" | grep -q "<title.*>.*</title>"; then
            if echo "$content" | grep -q "<meta.*charset\|<meta.*viewport"; then
                record_check "${name}_html" "PASS" "Valid HTML structure" "${content_length} bytes"
            else
                record_check "${name}_html" "WARN" "HTML valid but missing meta tags" "${content_length} bytes"
            fi
        else
            record_check "${name}_html" "WARN" "HTML valid but missing title" "${content_length} bytes"
        fi
    else
        record_check "${name}_html" "FAIL" "Invalid HTML structure" "${content_length} bytes"
    fi
}

# Function to check security headers
check_security_headers() {
    local url=$1
    local name=$2
    
    log "Checking $name security headers..."
    
    local headers=$(curl -s -I --max-time $TIMEOUT "$url" 2>/dev/null || echo "")
    local security_score=0
    local total_security_checks=5
    local missing_headers=()
    
    # Check for essential security headers
    if echo "$headers" | grep -qi "x-content-type-options"; then
        ((security_score++))
    else
        missing_headers+=("X-Content-Type-Options")
    fi
    
    if echo "$headers" | grep -qi "x-frame-options\|content-security-policy.*frame-ancestors"; then
        ((security_score++))
    else
        missing_headers+=("X-Frame-Options")
    fi
    
    if echo "$headers" | grep -qi "strict-transport-security"; then
        ((security_score++))
    else
        missing_headers+=("Strict-Transport-Security")
    fi
    
    if echo "$headers" | grep -qi "content-security-policy"; then
        ((security_score++))
    else
        missing_headers+=("Content-Security-Policy")
    fi
    
    if echo "$headers" | grep -qi "referrer-policy"; then
        ((security_score++))
    else
        missing_headers+=("Referrer-Policy")
    fi
    
    local security_percentage=$(( (security_score * 100) / total_security_checks ))
    
    if [ $security_score -eq $total_security_checks ]; then
        record_check "${name}_security" "PASS" "All security headers present" "$security_score/$total_security_checks"
    elif [ $security_score -ge 3 ]; then
        record_check "${name}_security" "WARN" "Some security headers missing: ${missing_headers[*]}" "$security_score/$total_security_checks"
    else
        record_check "${name}_security" "FAIL" "Critical security headers missing: ${missing_headers[*]}" "$security_score/$total_security_checks"
    fi
}

# Function to check essential pages
check_essential_pages() {
    local base_url=$1
    local name=$2
    
    log "Checking $name essential pages..."
    
    local pages=("/" "/about.html" "/programs.html" "/lms.html" "/connect.html" "/apply.html")
    local accessible_pages=0
    local total_pages=${#pages[@]}
    local failed_pages=()
    
    for page in "${pages[@]}"; do
        local page_url="${base_url}${page}"
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$page_url" 2>/dev/null || echo "000")
        
        if [ "$http_code" = "200" ]; then
            ((accessible_pages++))
        else
            failed_pages+=("$page")
        fi
    done
    
    local accessibility_percentage=$(( (accessible_pages * 100) / total_pages ))
    
    if [ $accessible_pages -eq $total_pages ]; then
        record_check "${name}_pages" "PASS" "All essential pages accessible" "$accessible_pages/$total_pages"
    elif [ $accessible_pages -ge $((total_pages * 3 / 4)) ]; then
        record_check "${name}_pages" "WARN" "Most pages accessible, some failed: ${failed_pages[*]}" "$accessible_pages/$total_pages"
    else
        record_check "${name}_pages" "FAIL" "Many pages inaccessible: ${failed_pages[*]}" "$accessible_pages/$total_pages"
    fi
}

# Function to check performance metrics
check_performance() {
    local url=$1
    local name=$2
    
    log "Checking $name performance..."
    
    # Measure various performance metrics
    local metrics=$(curl -s -o /dev/null -w "time_total:%{time_total};time_connect:%{time_connect};time_starttransfer:%{time_starttransfer};size_download:%{size_download}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "time_total:999;time_connect:999;time_starttransfer:999;size_download:0")
    
    local time_total=$(echo "$metrics" | grep -o "time_total:[^;]*" | cut -d: -f2)
    local time_connect=$(echo "$metrics" | grep -o "time_connect:[^;]*" | cut -d: -f2)
    local time_starttransfer=$(echo "$metrics" | grep -o "time_starttransfer:[^;]*" | cut -d: -f2)
    local size_download=$(echo "$metrics" | grep -o "size_download:[^;]*" | cut -d: -f2)
    
    # Evaluate performance
    if (( $(echo "$time_total < 2.0" | bc -l 2>/dev/null || echo "0") )); then
        record_check "${name}_performance" "PASS" "Excellent performance (${time_total}s)" "Size: ${size_download} bytes"
    elif (( $(echo "$time_total < 5.0" | bc -l 2>/dev/null || echo "0") )); then
        record_check "${name}_performance" "WARN" "Acceptable performance (${time_total}s)" "Size: ${size_download} bytes"
    else
        record_check "${name}_performance" "FAIL" "Poor performance (${time_total}s)" "Size: ${size_download} bytes"
    fi
}

# Function to check SEO basics
check_seo_basics() {
    local url=$1
    local name=$2
    
    log "Checking $name SEO basics..."
    
    local content=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null || echo "")
    local seo_score=0
    local total_seo_checks=4
    local missing_elements=()
    
    # Check for title tag
    if echo "$content" | grep -q "<title.*>.*</title>"; then
        ((seo_score++))
    else
        missing_elements+=("title")
    fi
    
    # Check for meta description
    if echo "$content" | grep -q '<meta.*name="description"'; then
        ((seo_score++))
    else
        missing_elements+=("meta-description")
    fi
    
    # Check for viewport meta tag
    if echo "$content" | grep -q '<meta.*name="viewport"'; then
        ((seo_score++))
    else
        missing_elements+=("viewport")
    fi
    
    # Check for heading structure
    if echo "$content" | grep -q "<h1.*>.*</h1>"; then
        ((seo_score++))
    else
        missing_elements+=("h1-heading")
    fi
    
    if [ $seo_score -eq $total_seo_checks ]; then
        record_check "${name}_seo" "PASS" "All SEO basics present" "$seo_score/$total_seo_checks"
    elif [ $seo_score -ge 2 ]; then
        record_check "${name}_seo" "WARN" "Some SEO elements missing: ${missing_elements[*]}" "$seo_score/$total_seo_checks"
    else
        record_check "${name}_seo" "FAIL" "Critical SEO elements missing: ${missing_elements[*]}" "$seo_score/$total_seo_checks"
    fi
}

# Function to check SSL/TLS configuration
check_ssl_configuration() {
    local url=$1
    local name=$2
    
    log "Checking $name SSL/TLS configuration..."
    
    # Extract domain from URL
    local domain=$(echo "$url" | sed 's|https\?://||' | cut -d'/' -f1)
    
    # Check SSL certificate
    local ssl_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
    
    if [ -n "$ssl_info" ]; then
        # Check if certificate is valid (not expired)
        local not_after=$(echo "$ssl_info" | grep "notAfter" | cut -d= -f2)
        if [ -n "$not_after" ]; then
            record_check "${name}_ssl" "PASS" "Valid SSL certificate" "Expires: $not_after"
        else
            record_check "${name}_ssl" "WARN" "SSL certificate present but cannot verify expiry" "Certificate found"
        fi
    else
        record_check "${name}_ssl" "FAIL" "SSL certificate issues" "Cannot retrieve certificate"
    fi
}

# Function to generate health report
generate_health_report() {
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local health_percentage=$(( (passed_checks * 100) / total_checks ))
    local overall_status="HEALTHY"
    
    if [ $health_percentage -lt $MIN_HEALTH_SCORE ]; then
        overall_status="UNHEALTHY"
    elif [ $warning_checks_count -gt 0 ]; then
        overall_status="WARNING"
    fi
    
    cat > "$HEALTH_REPORT" << EOF
{
  "timestamp": "$timestamp",
  "overall_status": "$overall_status",
  "health_percentage": $health_percentage,
  "summary": {
    "total_checks": $total_checks,
    "passed_checks": $passed_checks,
    "warning_checks": $warning_checks_count,
    "failed_checks": $failed_checks_count
  },
  "urls_tested": {
    "deployment_url": "$DEPLOYMENT_URL",
    "custom_domain": "$CUSTOM_DOMAIN"
  },
  "detailed_results": {
$(for check in "${!health_results[@]}"; do
    IFS='|' read -r status message details <<< "${health_results[$check]}"
    echo "    \"$check\": {"
    echo "      \"status\": \"$status\","
    echo "      \"message\": \"$message\","
    echo "      \"details\": \"$details\""
    echo "    },"
done | sed '$ s/,$//')
  },
  "failed_checks": [
$(printf '%s\n' "${failed_checks[@]}" | sed 's/^/    "/' | sed 's/$/"/' | paste -sd ',' - || echo "")
  ],
  "warning_checks": [
$(printf '%s\n' "${warning_checks[@]}" | sed 's/^/    "/' | sed 's/$/"/' | paste -sd ',' - || echo "")
  ]
}
EOF
}

# Main health validation workflow
main_health_validation() {
    log "Starting comprehensive health validation..."
    
    # Test primary deployment URL
    check_url_accessibility "$DEPLOYMENT_URL" "primary"
    validate_html_content "$DEPLOYMENT_URL" "primary"
    check_security_headers "$DEPLOYMENT_URL" "primary"
    check_essential_pages "$DEPLOYMENT_URL" "primary"
    check_performance "$DEPLOYMENT_URL" "primary"
    check_seo_basics "$DEPLOYMENT_URL" "primary"
    check_ssl_configuration "$DEPLOYMENT_URL" "primary"
    
    # Test custom domain (if different)
    if [ "$CUSTOM_DOMAIN" != "$DEPLOYMENT_URL" ]; then
        check_url_accessibility "$CUSTOM_DOMAIN" "custom"
        validate_html_content "$CUSTOM_DOMAIN" "custom"
        check_security_headers "$CUSTOM_DOMAIN" "custom"
        check_essential_pages "$CUSTOM_DOMAIN" "custom"
        check_performance "$CUSTOM_DOMAIN" "custom"
        check_seo_basics "$CUSTOM_DOMAIN" "custom"
        check_ssl_configuration "$CUSTOM_DOMAIN" "custom"
    fi
    
    # Generate comprehensive report
    generate_health_report
    
    # Display summary
    local health_percentage=$(( (passed_checks * 100) / total_checks ))
    
    echo ""
    echo "🏥 HEALTH VALIDATION SUMMARY"
    echo "============================"
    echo "Overall Health: $health_percentage% ($passed_checks/$total_checks checks passed)"
    echo "Warnings: $warning_checks_count"
    echo "Failures: $failed_checks_count"
    echo ""
    
    if [ $failed_checks_count -gt 0 ]; then
        echo "❌ Failed Checks:"
        for check in "${failed_checks[@]}"; do
            echo "  - $check"
        done
        echo ""
    fi
    
    if [ $warning_checks_count -gt 0 ]; then
        echo "⚠️ Warning Checks:"
        for check in "${warning_checks[@]}"; do
            echo "  - $check"
        done
        echo ""
    fi
    
    echo "📄 Detailed report: $HEALTH_REPORT"
    
    # Return appropriate exit code
    if [ $health_percentage -ge $MIN_HEALTH_SCORE ] && [ $failed_checks_count -eq 0 ]; then
        success "Health validation PASSED"
        return 0
    else
        error "Health validation FAILED"
        return 1
    fi
}

# Command handling
COMMAND=${1:-validate}

case $COMMAND in
    "validate")
        main_health_validation
        ;;
    "report")
        if [ -f "$HEALTH_REPORT" ]; then
            cat "$HEALTH_REPORT" | jq . 2>/dev/null || cat "$HEALTH_REPORT"
        else
            echo '{"error": "No health report available"}'
        fi
        ;;
    "quick")
        log "Running quick health check..."
        check_url_accessibility "$DEPLOYMENT_URL" "primary"
        check_url_accessibility "$CUSTOM_DOMAIN" "custom"
        echo "Quick check complete: $passed_checks/$total_checks passed"
        ;;
    "help"|*)
        echo "Autopilot Health Validator Commands:"
        echo "  validate - Run comprehensive health validation"
        echo "  report   - Show latest health report"
        echo "  quick    - Run quick connectivity check"
        ;;
esac