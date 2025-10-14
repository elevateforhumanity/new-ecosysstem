#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="scripts/logs"; mkdir -p "$LOG_DIR"
VLOG="$LOG_DIR/vite.log"; ALOG="$LOG_DIR/api.log"; APLOG="$LOG_DIR/autopilot.log"

echo "🧭 Autopilot start @ $(date -Is)" | tee -a "$APLOG"

# Block regressions: strip any 'timeout ... dev'
grep -RniE '(^|[;&|])\s*timeout\s+.*(vite|npm\s+run\s+dev|pnpm\s+dev|yarn\s+dev)' . 2>/dev/null && {
  echo "❌ Removing timeout wrappers" | tee -a "$APLOG"
  sed -i -E 's/timeout\s+[0-9smhd:-]+\s+//g' .gitpod.yml 2>/dev/null || true
  sed -i -E 's/timeout\s+[0-9smhd:-]+\s+//g' package.json 2>/dev/null || true
  find scripts -maxdepth 1 -type f -name "*.sh" -print0 2>/dev/null | xargs -0 -I{} sed -i -E 's/timeout\s+[0-9smhd:-]+\s+//g' "{}" || true
} || true

# Launch Vite
if ! pgrep -f "vite" >/dev/null; then
  echo "▶️  Launching Vite…" | tee -a "$APLOG"
  nohup ./scripts/start-vite.sh >>"$VLOG" 2>&1 &
  sleep 3
fi

# Launch API
if ! pgrep -f "server/index.js" >/dev/null; then
  echo "▶️  Launching API…" | tee -a "$APLOG"
  nohup ./scripts/start-api.sh >>"$ALOG" 2>&1 &
  sleep 3
fi

# Monitor both; restart on impact
GP_HOST="${GITPOD_WORKSPACE_URL#https://}"
VITE="https://5173--${GP_HOST}"
API="https://3001--${GP_HOST}"

while true; do
  v_ok=0; a_ok=0

  # Vite health: /@vite/client should 200/ok in dev
  curl -fsS "$VITE/@vite/client" >/dev/null && v_ok=1 || v_ok=0
  if [ $v_ok -ne 1 ]; then
    echo "⚠️  Vite unhealthy @ $(date -Is) — restarting" | tee -a "$APLOG"
    pkill -f "vite" || true
    nohup ./scripts/start-vite.sh >>"$VLOG" 2>&1 &
    sleep 5
  fi

  # API health
  curl -fsS "$API/api/health" >/dev/null && a_ok=1 || a_ok=0
  if [ $a_ok -ne 1 ]; then
    echo "⚠️  API unhealthy @ $(date -Is) — restarting" | tee -a "$APLOG"
    pkill -f "server/index.js" || true
    nohup ./scripts/start-api.sh >>"$ALOG" 2>&1 &
    sleep 5
  fi

  sleep 10
done
