#!/usr/bin/env bash
# Quick Start Autopilot - Interactive Setup

set -euo pipefail

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           AUTOPILOT QUICK START WIZARD 🤖                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if credentials are already set
CREDS_SET=0
if [[ -n "${SUPABASE_URL:-}" ]] && [[ -n "${SUPABASE_ANON_KEY:-}" ]]; then
  CREDS_SET=1
fi

if [[ $CREDS_SET -eq 0 ]]; then
  echo "📋 Supabase credentials are already configured in the code!"
  echo "   URL: https://cuxzzpsyufcewtmicszk.supabase.co"
  echo ""
  echo "✅ Using existing Supabase configuration"
  echo ""
  
  export SUPABASE_URL='https://cuxzzpsyufcewtmicszk.supabase.co'
  export SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA'
fi

# Ask about optional services
echo "🔧 Optional Service Configuration"
echo ""

# Render
echo "📦 Render Configuration (optional)"
read -p "Do you have Render API credentials? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  read -p "Enter RENDER_API_KEY: " RENDER_API_KEY
  read -p "Enter RENDER_SERVICE_ID: " RENDER_SERVICE_ID
  read -p "Enter RENDER_DEPLOY_HOOK (optional): " RENDER_DEPLOY_HOOK
  
  export RENDER_API_KEY
  export RENDER_SERVICE_ID
  export RENDER_DEPLOY_HOOK
  
  echo "✅ Render credentials set"
else
  echo "⏭️  Skipping Render configuration"
fi

echo ""

# Cloudflare
echo "☁️  Cloudflare Configuration (optional)"
read -p "Do you have Cloudflare API credentials? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  read -p "Enter CLOUDFLARE_API_TOKEN: " CLOUDFLARE_API_TOKEN
  read -p "Enter CLOUDFLARE_ACCOUNT_ID: " CLOUDFLARE_ACCOUNT_ID
  
  export CLOUDFLARE_API_TOKEN
  export CLOUDFLARE_ACCOUNT_ID
  export CF_API_TOKEN="$CLOUDFLARE_API_TOKEN"
  export CF_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID"
  
  echo "✅ Cloudflare credentials set"
else
  echo "⏭️  Skipping Cloudflare configuration"
fi

echo ""
echo "🚀 Starting Full Autopilot Deployment..."
echo ""

# Run the full autopilot script
bash scripts/full-autopilot-deploy.sh

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    SETUP COMPLETE! 🎉                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 What was configured:"
echo "   ✅ Supabase connection"
echo "   ✅ Local environment files"
echo "   ✅ GitHub secrets (if gh CLI available)"
echo "   ✅ Gitpod environment variables"
if [[ -n "${RENDER_API_KEY:-}" ]]; then
  echo "   ✅ Render deployment"
fi
if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "   ✅ Cloudflare Pages deployment"
fi
echo ""
echo "🌐 Your application is deployed!"
echo ""
echo "📚 Next Steps:"
echo "   • Test locally: pnpm dev"
echo "   • View deployments:"
echo "     - Cloudflare: https://elevateforhumanity.pages.dev"
echo "     - Render: https://elevateforhumanity.onrender.com"
echo "   • Make changes and push - GitHub Actions will auto-deploy!"
echo ""
