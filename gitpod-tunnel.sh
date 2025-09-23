#!/usr/bin/env bash
set -euo pipefail
# Run this *inside* the Gitpod workspace where your app runs on PORT=8080 (or change below).

: "${CF_TUNNEL_NAME:=efh-gitpod}"
: "${CF_HOSTNAME:=studio.elevateforhumanity.org}"
: "${LOCAL_PORT:=8080}"

echo "🚇 Gitpod Tunnel Autopilot Starting..."
echo "Tunnel: $CF_TUNNEL_NAME"
echo "Hostname: $CF_HOSTNAME"
echo "Local Port: $LOCAL_PORT"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "📥 Installing cloudflared..."
  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
  chmod +x cloudflared && sudo mv cloudflared /usr/local/bin/
  echo "✅ cloudflared installed"
fi

echo "🔑 Login to Cloudflare (browser will open)..."
cloudflared tunnel login

echo "🚇 Creating tunnel: $CF_TUNNEL_NAME"
cloudflared tunnel create "$CF_TUNNEL_NAME" || echo "Tunnel may already exist"

TUNNEL_ID=$(cloudflared tunnel list | awk -v n="$CF_TUNNEL_NAME" '$0 ~ n {print $1; exit}')
if [ -z "$TUNNEL_ID" ]; then
  echo "❌ Failed to get tunnel ID"
  exit 1
fi
echo "✅ Tunnel ID: $TUNNEL_ID"

echo "🌐 Setting up DNS route..."
cloudflared tunnel route dns "$CF_TUNNEL_NAME" "$CF_HOSTNAME"

echo "⚙️ Creating tunnel config..."
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml <<EOF
tunnel: ${TUNNEL_ID}
credentials-file: /home/gitpod/.cloudflared/${TUNNEL_ID}.json
ingress:
  - hostname: ${CF_HOSTNAME}
    service: http://localhost:${LOCAL_PORT}
  - service: http_status:404
EOF

echo "✅ Tunnel configured!"
echo ""
echo "🚀 Starting tunnel... (keep this process running)"
echo "📍 Your app will be available at: https://${CF_HOSTNAME}"
echo ""
cloudflared tunnel run "${CF_TUNNEL_NAME}"