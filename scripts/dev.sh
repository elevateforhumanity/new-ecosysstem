#!/usr/bin/env bash
set -euo pipefail

# Derive public host for WS overlays (Gitpod preview)
GP_HOST="$(gp url 3000 2>/dev/null || echo "")"
VITE_PORT="${VITE_PORT:-5173}"
NEXT_PORT="${NEXT_PORT:-3000}"

# Universal "make it live" env (uses polling if needed)
export HOST=0.0.0.0
export BIND_ADDRESS=0.0.0.0
export CHOKIDAR_USEPOLLING=${CHOKIDAR_USEPOLLING:-true}
export WATCHPACK_POLLING=${WATCHPACK_POLLING:-true}
export NEXT_WEBPACK_USEPOLLING=${NEXT_WEBPACK_USEPOLLING:-1}
export FORCE_COLOR=1
export NEXT_TELEMETRY_DISABLED=1

# Vite overlay websocket location (prevents HMR disconnect)
if [ -n "$GP_HOST" ]; then
  export VITE_HMR_HOST="$(echo "$GP_HOST" | sed 's#https://##')"
  export VITE_HMR_PORT=443
  export VITE_HMR_PROTOCOL=wss
fi

# Detect framework and run with correct flags
if [ -f next.config.js ] || [ -f next.config.mjs ] || [ -d app ] || [ -d src/app ]; then
  echo "[dev] Next.js detected — starting on :$NEXT_PORT"
  # Next needs explicit hostname or HMR dies in containers
  if jq -e '.scripts.dev' package.json >/dev/null 2>&1; then
    # honor user script if present
    pnpm dev -- -p "$NEXT_PORT" --hostname 0.0.0.0 || npm run dev -- -p "$NEXT_PORT" --hostname 0.0.0.0
  else
    npx next dev -p "$NEXT_PORT" --hostname 0.0.0.0
  fi
elif [ -f vite.config.ts ] || [ -f vite.config.js ]; then
  echo "[dev] Vite detected — starting on :$VITE_PORT"
  # Vite HMR settings for Gitpod
  export VITE_HOST=0.0.0.0
  # If you use create-vite, this script just works:
  npx vite --port "$VITE_PORT" --host 0.0.0.0
elif [ -f package.json ]; then
  echo "[dev] Generic Node.js project — trying pnpm dev"
  pnpm dev || npm run dev || echo "No dev script found"
else
  echo "[dev] No framework detected — serving static files"
  python3 -m http.server 8080 --bind 0.0.0.0
fi