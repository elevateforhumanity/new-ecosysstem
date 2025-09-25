#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-8080}"
LOG_DIR="dist"
LOG_FILE="$LOG_DIR/dev.log"
BASE="http://localhost:$PORT"

mkdir -p "$LOG_DIR"

is_up() { curl -sIf --max-time 2 "$BASE" >/dev/null 2>&1; }

start_app() {
  echo "▶️  starting app on :$PORT ..."
  # prefer preview if build exists (faster + stable)
  if [ -d "dist" ] && [ -n "$(ls -A dist 2>/dev/null || true)" ]; then
    nohup npm run preview >>"$LOG_FILE" 2>&1 &
  else
    nohup npm run dev >>"$LOG_FILE" 2>&1 &
  fi
}

# Ensure something is listening; if not, start it
if ! is_up; then
  start_app
fi

# Wait until healthy (max ~30s)
for i in {1..30}; do
  if is_up; then
    echo "✅ dev server healthy at $BASE"
    exit 0
  fi
  sleep 1
done

echo "⚠️  dev server didn't become healthy; tail -n 100 $LOG_FILE"
exit 1