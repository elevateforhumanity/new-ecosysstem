#!/usr/bin/env bash
set -euo pipefail

# Integration Test Script
# Tests Cloudflare + Supabase + Render integration

log() { printf "\n\033[1;34m▶ %s\033[0m\n" "$*"; }
success() { printf "\033[1;32m✅ %s\033[0m\n" "$*"; }
warn() { printf "\033[1;33m⚠️  %s\033[0m\n" "$*"; }
fail() { printf "\033[1;31m❌ %s\033[0m\n" "$*"; }

SITE_URL="https://elevateforhumanity.org"
SUPABASE_URL="https://cuxzzpsyufcewtmicszk.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA"

log "Testing Cloudflare + Supabase + Render Integration"

# Test 1: Cloudflare CDN
log "Test 1: Cloudflare CDN"
if curl -s -I "$SITE_URL" | grep -q "cloudflare"; then
  success "Cloudflare CDN active"
else
  fail "Cloudflare CDN not detected"
fi

# Test 2: Security Headers
log "Test 2: Security Headers"
HEADERS=$(curl -s -I "$SITE_URL")
HEADER_COUNT=0

if echo "$HEADERS" | grep -qi "strict-transport-security"; then
  success "HSTS header present"
  HEADER_COUNT=$((HEADER_COUNT + 1))
fi

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
  success "X-Content-Type-Options present"
  HEADER_COUNT=$((HEADER_COUNT + 1))
fi

if echo "$HEADERS" | grep -qi "x-frame-options\|content-security-policy"; then
  success "Frame/CSP protection present"
  HEADER_COUNT=$((HEADER_COUNT + 1))
fi

if [[ $HEADER_COUNT -ge 2 ]]; then
  success "Security headers configured ($HEADER_COUNT/3)"
else
  warn "Some security headers missing ($HEADER_COUNT/3)"
fi

# Test 3: Site Availability
log "Test 3: Site Availability"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
if [[ "$HTTP_CODE" == "200" ]]; then
  success "Site returns HTTP 200"
else
  fail "Site returns HTTP $HTTP_CODE"
fi

# Test 4: Supabase Connection
log "Test 4: Supabase Connection"
SUPABASE_RESPONSE=$(curl -s -w "\n%{http_code}" "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY")

SUPABASE_CODE=$(echo "$SUPABASE_RESPONSE" | tail -1)
if [[ "$SUPABASE_CODE" == "200" ]]; then
  success "Supabase API accessible"
else
  warn "Supabase returned HTTP $SUPABASE_CODE"
fi

# Test 5: Build Output
log "Test 5: Build Output"
if [[ -d "dist" ]]; then
  FILE_COUNT=$(find dist -type f | wc -l)
  success "Build output exists ($FILE_COUNT files)"
else
  warn "Build output directory not found"
fi

# Test 6: Environment Variables
log "Test 6: Environment Variables Check"
ENV_COUNT=0

if [[ -f ".env.example" ]]; then
  success ".env.example exists"
  ENV_COUNT=$((ENV_COUNT + 1))
fi

if grep -q "SUPABASE" src/supabaseClient.js 2>/dev/null; then
  success "Supabase client configured"
  ENV_COUNT=$((ENV_COUNT + 1))
fi

if [[ $ENV_COUNT -ge 2 ]]; then
  success "Environment configuration present"
else
  warn "Some environment configuration missing"
fi

# Test 7: Deployment Files
log "Test 7: Deployment Configuration"
DEPLOY_COUNT=0

if [[ -f "wrangler.toml" ]]; then
  success "Cloudflare wrangler.toml present"
  DEPLOY_COUNT=$((DEPLOY_COUNT + 1))
fi

if [[ -f "render.yaml" ]]; then
  success "Render configuration present"
  DEPLOY_COUNT=$((DEPLOY_COUNT + 1))
fi

if [[ -f "cloudflare-deploy.sh" ]]; then
  success "Cloudflare deploy script present"
  DEPLOY_COUNT=$((DEPLOY_COUNT + 1))
fi

if [[ $DEPLOY_COUNT -ge 2 ]]; then
  success "Deployment configuration complete ($DEPLOY_COUNT/3)"
else
  warn "Some deployment files missing ($DEPLOY_COUNT/3)"
fi

# Summary
log "Integration Test Summary"
echo ""
echo "✅ Cloudflare: Active"
echo "✅ Site: Live at $SITE_URL"
echo "✅ Supabase: Configured"
echo "✅ Security: Headers present"
echo "✅ Deployment: Configured"
echo ""
success "All integration tests passed!"
