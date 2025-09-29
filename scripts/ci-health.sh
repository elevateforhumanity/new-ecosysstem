#!/usr/bin/env bash
set -euo pipefail
API_PORT="${API_PORT:-4400}"; VITE_PORT="${VITE_DEV_PORT:-8012}"; PROXY_PORT="${PROXY_PORT:-9000}"
ROOT_PATH="${ROOT_CHECK_PATH:-/}"; API_PATH="${API_CHECK_PATH:-/api/courses}"
curl_retry(){ local u="$1" code="$2" t=30; for i in $(seq 1 $t); do c=$(curl -fsS -o /dev/null -w "%{http_code}" "$u" || true); [ "$c" = "$code" ] && { echo "✅ $u → $c"; return 0; } ; echo "…($i/$t) $u → $c"; sleep 1; done; echo "❌ $u ! $code"; return 1; }
(node server.js &) >/dev/null 2>&1 || true
(vite --host 0.0.0.0 --port "$VITE_PORT" &) >/dev/null 2>&1 || true
(node scripts/dev-proxy.js &) >/dev/null 2>&1 || true
sleep 3
curl_retry "http://localhost:${API_PORT}/health" 200
curl_retry "http://localhost:${API_PORT}${API_PATH}" 200
curl_retry "http://localhost:${VITE_PORT}${ROOT_PATH}" 200
curl_retry "http://localhost:${VITE_PORT}${API_PATH}" 200
curl_retry "http://localhost:${PROXY_PORT}${ROOT_PATH}" 200
curl_retry "http://localhost:${PROXY_PORT}${API_PATH}" 200
echo "🎉 CI health passed"
