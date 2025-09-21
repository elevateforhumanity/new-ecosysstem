#!/usr/bin/env bash
set -e
while true; do
  node scripts/autopilot-run.js && break
  echo "⏳ Critical failure. Retrying in 120s…"
  sleep 120
done
echo "🎉 Live deploy complete"
