#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-8012}"
INTERVAL="${INTERVAL:-20}"     # seconds between checks
FAIL_LIMIT="${FAIL_LIMIT:-3}"  # how many consecutive fails before restart
LOG_DIR="${LOG_DIR:-.logs}"
mkdir -p "$LOG_DIR"
HC_LOG="$LOG_DIR/health-8012.log"

echo "[autopilot] monitoring port $PORT every ${INTERVAL}s (fail limit: ${FAIL_LIMIT})"
fails=0
while true; do
  ts="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  if scripts/healthcheck.sh >/dev/null 2>&1; then
    echo "[$ts] healthy" | tee -a "$HC_LOG"
    fails=0
  else
    fails=$((fails+1))
    echo "[$ts] unhealthy ($fails/$FAIL_LIMIT)" | tee -a "$HC_LOG"
    if [ "$fails" -ge "$FAIL_LIMIT" ]; then
      echo "[$ts] restarting dev process…" | tee -a "$HC_LOG"
      # Kill the process using the port
      PIDS=$(lsof -t -iTCP:${PORT} -sTCP:LISTEN 2>/dev/null || true)
      if [ -n "$PIDS" ]; then
        echo "[$ts] killing PIDs: $PIDS" | tee -a "$HC_LOG"
        kill -TERM $PIDS || true
        sleep 2
      fi
      # The watchdog will respawn it automatically
      fails=0
    fi
  fi
  sleep "$INTERVAL"
done