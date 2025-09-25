#!/usr/bin/env bash
set -euo pipefail

BASE_DEFAULT="https://8080--01997444-4456-7efa-9b1f-b5612db1de6d.us-east-1-01.gitpod.dev"
ALT_DEFAULT="https://9000--01997444-4456-7efa-9b1f-b5612db1de6d.us-east-1-01.gitpod.dev"

BASE="${BASE:-$BASE_DEFAULT}"
ALT_BASE="${ALT_BASE:-$ALT_DEFAULT}"
MAX_ROUNDS="${MAX_ROUNDS:-20}"
SLEEP_SECONDS="${SLEEP_SECONDS:-8}"
DRY_RUN="${DRY_RUN:-0}"

mkdir -p dist

round=1
while true; do
  echo "▶️  Autopilot round $round (BASE=$BASE ALT_BASE=$ALT_BASE)"
  node scripts/autopilot.mjs --base "$BASE" --alt-base "$ALT_BASE" ${DRY_RUN:+--dry-run} || code=$?; code=${code:-0}

  if [[ "${DRY_RUN}" == "1" ]]; then
    exit 0
  fi

  if [[ "$code" -eq 0 ]]; then
    echo "✅ Core pages responding. Embed ready: dist/durable-embed.html"
    exit 0
  fi

  if (( round >= MAX_ROUNDS )); then
    echo "⚠️  Reached MAX_ROUNDS=$MAX_ROUNDS. Latest embed/report are in dist/. Exiting with non-zero."
    exit "$code"
  fi

  echo "⏳ Not all core pages up yet (exit $code). Sleeping ${SLEEP_SECONDS}s..."
  sleep "$SLEEP_SECONDS"
  round=$((round+1))
done
