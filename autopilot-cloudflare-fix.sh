#!/usr/bin/env bash
set -euo pipefail

echo "=== Elevate Autopilot • Cloudflare DNS Fix ==="

# --- Input vars (interactive, with defaults) ---
read -p "Cloudflare API Token: " CF_API_TOKEN
: "${CF_API_TOKEN:?CF_API_TOKEN is required}"

read -p "Zone name (default: elevateforhumanity.org): " CF_ZONE_NAME
CF_ZONE_NAME=${CF_ZONE_NAME:-elevateforhumanity.org}

read -p "Apex A-record IP (default: 192.0.2.1 *test IP*): " APEX_IP
APEX_IP=${APEX_IP:-192.0.2.1}

read -p "Redirect destination (default: https://elevate4humanity.org): " REDIRECT_TO
REDIRECT_TO=${REDIRECT_TO:-https://elevate4humanity.org}

# Create a local env file (git-ignored recommended)
ENV_FILE=".env.autopilot"
cat > "$ENV_FILE" <<EOF
CF_API_TOKEN=${CF_API_TOKEN}
CF_ZONE_NAME=${CF_ZONE_NAME}
APEX_IP=${APEX_IP}
REDIRECT_TO=${REDIRECT_TO}
EOF

echo "Wrote $ENV_FILE"
echo "Testing token & listing zone…"

# Quick smoke test for token/zone
resp=$(curl -sS -H "Authorization: Bearer ${CF_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/zones?name=${CF_ZONE_NAME}")
ok=$(echo "$resp" | jq -r '.success')
if [ "$ok" != "true" ]; then
  echo "❌ Token or request failed. Raw: $resp"
  exit 1
fi

count=$(echo "$resp" | jq -r '.result | length')
if [ "$count" -eq 0 ]; then
  echo "❌ Zone not found: ${CF_ZONE_NAME} (check that the token has Zone:Zone:Read and is scoped to this zone)."
  exit 1
fi

echo "✅ Token + zone lookup OK."

# Run the Node fixer
if command -v node >/dev/null 2>&1; then
  echo "Running Node fixer…"
  node fix-autopilot-cloudflare.cjs
else
  echo "❌ Node not found. Please install Node 18+ and re-run."
  exit 1
fi

echo "=== Done. Suggest running ./test-autopilot-redirect.sh to verify. ==="