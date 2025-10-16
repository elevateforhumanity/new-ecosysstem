#!/usr/bin/env bash
set -Eeuo pipefail

# ──────────────────────────────────────────────────────────────────────────────
# Gitpod Cloudflare bootstrap
# Configures Wrangler with API token for Pages/Workers deployment
# ──────────────────────────────────────────────────────────────────────────────

echo "🔧 Setting up Cloudflare Wrangler..."

# Check if token is set
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  cat <<'EOF'
❌ CLOUDFLARE_API_TOKEN not set.

To configure:
1. Get token: https://dash.cloudflare.com/profile/api-tokens
2. Create token with "Edit Cloudflare Workers" template
3. Set in Gitpod:
   gp env CLOUDFLARE_API_TOKEN=your_token_here
   gp env CLOUDFLARE_ACCOUNT_ID=your_account_id
4. Restart workspace

EOF
  exit 1
fi

# Install wrangler if not present
if ! command -v wrangler &> /dev/null; then
  echo "📦 Installing Wrangler globally..."
  npm i -g wrangler@latest
fi

# Create wrangler config directory
mkdir -p ~/.wrangler/config

# Configure wrangler with token
cat > ~/.wrangler/config/default.toml <<EOF
account_id = "${CLOUDFLARE_ACCOUNT_ID:-}"
api_token  = "${CLOUDFLARE_API_TOKEN}"
EOF

chmod 600 ~/.wrangler/config/default.toml

echo "✅ Cloudflare Wrangler configured"
echo "   Version: $(wrangler --version 2>/dev/null || echo 'unknown')"
echo "   Account: ${CLOUDFLARE_ACCOUNT_ID:-not set}"

# Verify authentication
echo "🔎 Verifying Cloudflare authentication..."
if wrangler whoami 2>/dev/null; then
  echo "✅ Authentication successful"
else
  echo "⚠️  Warning: Could not verify authentication"
  echo "   Token may be invalid or expired"
fi

echo "🎉 Cloudflare is ready for deployment"
echo ""
echo "Deploy commands:"
echo "  pnpm run build && wrangler pages deploy dist --project-name=elevateforhumanity"
echo "  OR: pnpm run cf:deploy"
