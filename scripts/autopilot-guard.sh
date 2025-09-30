#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
"$DIR/autopilot-env.sh" || true
SERVICES=(lms vizio marketing)
while true; do
  for svc in "${SERVICES[@]}"; do
    if ! pm2 status "$svc" | grep -q online; then
      echo "[$(date)] restarting $svc…"
      pm2 restart "$svc" || pm2 start "npm run $svc:start" --name "$svc" || true
    fi
  done
  sleep 15
done
