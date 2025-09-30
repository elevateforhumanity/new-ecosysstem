#!/usr/bin/env bash
set -euo pipefail
need() { test -n "${!1:-}" || { echo "Missing env: $1"; exit 1; }; }
need CF_PAGES_PROJECT
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || [ -n "${CF_API_TOKEN:-}" ] || echo "⚠️ No token in env; deploys will fail."
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || export CLOUDFLARE_API_TOKEN="${CF_API_TOKEN:-}"
echo "✔ CF_PAGES_PROJECT=${CF_PAGES_PROJECT}"
