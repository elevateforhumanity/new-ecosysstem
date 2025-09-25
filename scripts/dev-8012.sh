#!/usr/bin/env bash
set -euo pipefail

export HOST=0.0.0.0
export PORT=8012
export CHOKIDAR_USEPOLLING=${CHOKIDAR_USEPOLLING:-false}
export WATCHPACK_POLLING=${WATCHPACK_POLLING:-false}

# This project uses Vite - start it on port 8012
echo "[dev-8012] Starting Vite on :$PORT"
pnpm exec vite --host 0.0.0.0 --port "$PORT" --strictPort