#!/bin/bash

# Smoke tests for deployed application
# Usage: ./scripts/smoke-test.sh [URL]

URL=${1:-http://localhost:8080}
FAILED=0

echo "🔍 Running smoke tests against: $URL"
echo ""

# Test function
test_route() {
    local route=$1
    local expected_status=${2:-200}
    local full_url="${URL}${route}"
    
    echo -n "Testing ${route}... "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$full_url")
    
    if [ "$status" -eq "$expected_status" ]; then
        echo "✅ OK ($status)"
    else
        echo "❌ FAIL (expected $expected_status, got $status)"
        FAILED=$((FAILED + 1))
    fi
}

# Critical routes
echo "Testing critical routes:"
test_route "/"
test_route "/login"
test_route "/account"
test_route "/courses"
test_route "/support"

echo ""
echo "Testing new pages:"
test_route "/profile"
test_route "/settings"
test_route "/partners"
test_route "/student-handbook"
test_route "/certificates"

echo ""
echo "Testing legal pages:"
test_route "/privacy-policy"
test_route "/terms-of-service"
test_route "/refund-policy"

echo ""
echo "Testing verification pages:"
test_route "/forgot-password"
test_route "/reset-password"
test_route "/verify-email"
test_route "/verify-certificate"

echo ""
echo "Testing 404 handling:"
test_route "/non-existent-page" 200  # SPA returns 200 with client-side 404

echo ""
if [ $FAILED -eq 0 ]; then
    echo "✅ All smoke tests passed!"
    exit 0
else
    echo "❌ $FAILED test(s) failed"
    exit 1
fi
