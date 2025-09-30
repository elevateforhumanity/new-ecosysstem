#!/usr/bin/env bash
set -euo pipefail
need() { test -n "${!1:-}" || { echo "Missing env: $1"; exit 1; }; }

# Required for Wrangler/Pages deploy
need CF_PAGES_PROJECT
# Optional but encouraged
: "${CF_ACCOUNT_ID:=}"
: "${CF_ZONE_NAME:=}"
: "${CF_API_TOKEN:=}"
if [ -n "${CF_API_TOKEN:-}" ]; then export CLOUDFLARE_API_TOKEN="$CF_API_TOKEN"; fi

echo "✔ Env: CF_PAGES_PROJECT=${CF_PAGES_PROJECT}"
[ -n "${CF_ACCOUNT_ID:-}" ] && echo "ℹ CF_ACCOUNT_ID=${CF_ACCOUNT_ID}" || true
[ -n "${CF_ZONE_NAME:-}" ] && echo "ℹ CF_ZONE_NAME=${CF_ZONE_NAME}" || true

exit 0
