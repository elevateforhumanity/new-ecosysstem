#!/usr/bin/env bash
set -eo pipefail

if [[ -f .env ]]; then source .env; fi

: "${CF_ACCOUNT_ID:?CF_ACCOUNT_ID missing}"
: "${CF_API_TOKEN:?CF_API_TOKEN missing}"

echo "Setting secrets for AI workers..."

for WORKER in "ai-copy" "ai-chat" "ai-doc-summarizer" "ai-form-gen"; do
  echo "  Setting secrets for $WORKER..."
  
  # Set CF_ACCOUNT_ID
  printf "%s" "$CF_ACCOUNT_ID" | wrangler secret put CF_ACCOUNT_ID --name "$WORKER" 2>/dev/null || echo "    ⚠️  Failed to set CF_ACCOUNT_ID for $WORKER"
  
  # Set CF_API_TOKEN
  printf "%s" "$CF_API_TOKEN" | wrangler secret put CF_API_TOKEN --name "$WORKER" 2>/dev/null || echo "    ⚠️  Failed to set CF_API_TOKEN for $WORKER"
  
  echo "    ✅ Secrets set for $WORKER"
done

echo "✅ All AI worker secrets configured"
