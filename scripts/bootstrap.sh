#!/usr/bin/env bash
set -euo pipefail
mkdir -p .gp-logs
echo "🚀 Starting EFH Autopilot (non-interactive)..."
pkill -f "autopilot-loop.sh" || true
pkill -f "watchdog.sh" || true
sleep 2
chmod +x scripts/*.sh || true
if ! node scripts/env-check.js; then
    echo "❌ Environment check failed. Please set required variables."
    exit 1
fi
nohup bash scripts/autopilot-loop.sh  > .gp-logs/autopilot.out 2>&1 &
nohup bash scripts/watchdog.sh        > .gp-logs/watchdog.out  2>&1 &
echo "✅ Autopilot & Watchdog running!"
echo "📜 Logs: .gp-logs/autopilot.out | .gp-logs/watchdog.out"
