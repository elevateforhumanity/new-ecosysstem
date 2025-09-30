#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
"$DIR/autopilot-env.sh"

while true; do
  for svc in lms vizio marketing; do
    if ! pm2 status $svc | grep -q online; then
      echo "[$(date)] restarting $svc..."
      pm2 restart $svc || pm2 start "npm run $svc:start" --name $svc
    fi
  done
  sleep 15
done