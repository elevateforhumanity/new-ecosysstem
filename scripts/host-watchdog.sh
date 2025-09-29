#!/usr/bin/env bash
set -euo pipefail
PORT="${VITE_DEV_PORT:-8012}"
while true; do
  NEW=""
  if command -v gp >/dev/null 2>&1; then
    GP9000="$(gp url 9000 2>/dev/null || true)"; GP8012="$(gp url "$PORT" 2>/dev/null || true)"
    H9000="${GP9000#https://}"; H8012="${GP8012#https://}"
    H9000_D=${H9000//-/--}; H8012_D=${H8012//-/--}
    NEW="$H9000,$H9000_D,$H8012,$H8012_D"
  elif [ -n "${CODESPACES:-}" ] && [ -n "${CODESPACE_NAME:-}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
    H9000="${CODESPACE_NAME}-${PROXY_PORT:-9000}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    H8012="${CODESPACE_NAME}-${PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    H9000_D=${H9000//-/--}; H8012_D=${H8012//-/--}
    NEW="$H9000,$H9000_D,$H8012,$H8012_D"
  fi
  OLD="$(cat /tmp/allowed-hosts 2>/dev/null || echo '')"
  if [ -n "$NEW" ] && [ "$NEW" != "$OLD" ]; then
    echo "$NEW" > /tmp/allowed-hosts
    echo "🔄 Host changed → $NEW ; restarting Vite…"
    pkill -f vite || true
    __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS="$NEW" vite >/tmp/vite.log 2>&1 &
  fi
  sleep 15
done
