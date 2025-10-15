#!/usr/bin/env bash
set -euo pipefail

# EFH Secrets Setup Script
# Sets all required secrets for Cloudflare Workers

echo "🔑 EFH Secrets Setup"
echo "===================="
echo ""

# Load .env if present
if [[ -f .env ]]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
  echo "✅ Loaded .env file"
else
  echo "❌ No .env file found"
  echo "   Copy .env.bootstrap.example to .env and fill in your values"
  exit 1
fi

# Check required variables
: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN not set in .env}"
: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID not set in .env}"

export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID

echo ""
echo "📋 Workers to configure:"
echo "  1. efh-autopilot-orchestrator"
echo "  2. efh-autopilot-analyzer"
echo "  3. efh-stylist"
echo ""

# Function to set a secret
set_secret() {
  local WORKER="$1"
  local KEY="$2"
  local VALUE="$3"
  
  if [[ -z "$VALUE" ]]; then
    echo "⚠️  Skipping $KEY for $WORKER (not set)"
    return 0
  fi
  
  echo "Setting $KEY for $WORKER..."
  printf "%s" "$VALUE" | wrangler secret put "$KEY" --name "$WORKER" 2>/dev/null || {
    echo "❌ Failed to set $KEY for $WORKER"
    return 1
  }
  echo "✅ Set $KEY for $WORKER"
}

# Set secrets for each worker
for WORKER in "efh-autopilot-orchestrator" "efh-autopilot-analyzer" "efh-stylist"; do
  echo ""
  echo "🔧 Configuring $WORKER"
  echo "─────────────────────────────────"
  
  # Required secrets
  set_secret "$WORKER" "CF_API_TOKEN" "$CLOUDFLARE_API_TOKEN"
  set_secret "$WORKER" "CF_ACCOUNT_ID" "$CLOUDFLARE_ACCOUNT_ID"
  
  # Optional Supabase secrets
  if [[ -n "${SUPABASE_URL:-}" ]]; then
    set_secret "$WORKER" "SUPABASE_URL" "$SUPABASE_URL"
  fi
  
  if [[ -n "${SUPABASE_SERVICE_KEY:-}" ]]; then
    set_secret "$WORKER" "SUPABASE_SERVICE_KEY" "$SUPABASE_SERVICE_KEY"
  fi
  
  if [[ -n "${VITE_SUPABASE_ANON_KEY:-}" ]]; then
    set_secret "$WORKER" "SUPABASE_ANON_KEY" "$VITE_SUPABASE_ANON_KEY"
  fi
  
  # Optional Stripe secrets
  if [[ -n "${STRIPE_SECRET_KEY:-}" ]]; then
    set_secret "$WORKER" "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
  fi
  
  # Optional Postmark secret
  if [[ -n "${POSTMARK_API_TOKEN:-}" ]]; then
    set_secret "$WORKER" "POSTMARK_API_TOKEN" "$POSTMARK_API_TOKEN"
  fi
  
  # Optional OpenAI secret
  if [[ -n "${OPENAI_API_KEY:-}" ]]; then
    set_secret "$WORKER" "OPENAI_API_KEY" "$OPENAI_API_KEY"
  fi
done

echo ""
echo "✅ All secrets configured!"
echo ""
echo "🔍 Verify secrets:"
echo "  wrangler secret list --name efh-autopilot-orchestrator"
echo "  wrangler secret list --name efh-autopilot-analyzer"
echo "  wrangler secret list --name efh-stylist"
echo ""
echo "🚀 Next steps:"
echo "  1. Deploy workers: bash scripts/efh-stack-bootstrap.sh"
echo "  2. Register autopilots: bash scripts/register-autopilots.sh"
echo "  3. Access admin UI: /autopilot-admin"
echo ""
