#!/usr/bin/env bash
# Usage: scripts/watchdog.sh "<command>"
set -euo pipefail
CMD="$1"
LOG_DIR="${LOG_DIR:-.logs}"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/server-8012.log"

echo "[watchdog] supervising: $CMD"
attempt=0
while true; do
  attempt=$((attempt+1))
  ts="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  echo -e "\n[watchdog][$ts] start attempt #$attempt\n" | tee -a "$LOG_FILE"
  bash -lc "$CMD" 2>&1 | tee -a "$LOG_FILE"
  code="${PIPESTATUS[0]}"
  echo "[watchdog] process exited with code $code" | tee -a "$LOG_FILE"
  # Exponential backoff up to 10s
  sleep $((attempt<5 ? attempt*2 : 10))
done
