#!/usr/bin/env bash
# Environment detection for autopilot

if [ -n "${GITPOD_WORKSPACE_ID:-}" ]; then
    echo "gitpod"
elif [ -n "${CODESPACE_NAME:-}" ]; then
    echo "codespaces"
elif [ -n "${NETLIFY:-}" ]; then
    echo "netlify"
elif [ -n "${CF_PAGES:-}" ]; then
    echo "cloudflare"
else
    echo "local"
fi
