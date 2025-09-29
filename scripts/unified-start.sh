#!/usr/bin/env bash
set -euo pipefail

# Unified startup script for all environments
ENVIRONMENT=$(bash scripts/detect-environment.sh)

echo "🚀 Starting in $ENVIRONMENT environment..."

case $ENVIRONMENT in
    "gitpod")
        echo "🟢 Gitpod environment detected"
        pnpm dev --host 0.0.0.0 --port 8012
        ;;
    "codespaces")
        echo "🔵 Codespaces environment detected"
        pnpm dev --host 0.0.0.0 --port 8012
        ;;
    "cloudflare")
        echo "🟠 Cloudflare environment detected"
        pnpm build
        ;;
    "cloudflare")
        echo "🟡 Cloudflare environment detected"
        pnpm build
        ;;
    "local")
        echo "🏠 Local environment detected"
        pnpm dev
        ;;
    *)
        echo "❓ Unknown environment, using default"
        pnpm dev
        ;;
esac
