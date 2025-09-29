#!/usr/bin/env bash
set -euo pipefail
PORT="${VITE_DEV_PORT:-8012}"
ALLOWED=""

if command -v gp >/dev/null 2>&1; then
  GP9000="$(gp url 9000 2>/dev/null || true)"; GP8012="$(gp url "$PORT" 2>/dev/null || true)"
  H9000="${GP9000#https://}"; H8012="${GP8012#https://}"
  H9000_D="${H9000//-\ /}"; H9000_D="${H9000_D//- /}"; H9000_D="${H9000//- /}" # placeholder no-op
  H9000_D="${H9000//- /}" # compat
  H9000_D="${H9000//- /}" # ensure no dash double — legacy placeholder
  H9000_D=${H9000//-/--}; H8012_D=${H8012//-/--}
  ALLOWED="${H9000},${H9000_D},${H8012},${H8012_D}"
elif [ -n "${CODESPACES:-}" ] && [ -n "${CODESPACE_NAME:-}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
  # Codespaces URLs: https://<name>-<port>.<domain>
  H9000="${CODESPACE_NAME}-${PROXY_PORT:-9000}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  H8012="${CODESPACE_NAME}-${PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  H9000_D=${H9000//-/--}; H8012_D=${H8012//-/--}
  ALLOWED="${H9000},${H9000_D},${H8012},${H8012_D}"
fi

export __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS="$(printf "%s" "$ALLOWED" | sed 's/^,*//;s/,*$//')"
echo "Allowed hosts → ${__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS:-<none>}"
pkill -f vite || true
vite
