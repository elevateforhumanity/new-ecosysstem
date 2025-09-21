#!/usr/bin/env bash
set -euo pipefail
while true; do
  if ! pgrep -f "autopilot-loop.sh" >/dev/null; then
    echo "🛟 Autopilot not running — restarting…"
    nohup bash scripts/autopilot-loop.sh > .gp-logs/autopilot.out 2>&1 &
  fi
  if [ -n "${NETLIFY_SITE_ID:-}" ] && [ -n "${NETLIFY_AUTH_TOKEN:-}" ]; then
    STATUS=$(curl -fsSL -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
      "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys" | jq -r '.[0].state' || echo "unknown")
    if [ "$STATUS" != "ready" ]; then
      echo "❌ Bad deploy ($STATUS). Forcing rebuild…"
      nohup bash scripts/autopilot-loop.sh > .gp-logs/autopilot.out 2>&1 &
    fi
  fi
  sleep 60
done
