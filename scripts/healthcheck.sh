#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-8012}"
PATHS=("/api/health" "/" )
TIMEOUT=3

# try HTTP first
for p in "${PATHS[@]}"; do
  if curl -fsS --max-time "$TIMEOUT" "http://127.0.0.1:${PORT}${p}" >/dev/null 2>&1; then
    echo "ok:http:${p}"
    exit 0
  fi
done

# fall back to TCP port check
if nc -z 127.0.0.1 "$PORT" >/dev/null 2>&1; then
  echo "ok:tcp"
  exit 0
fi

echo "fail"
exit 1