#!/usr/bin/env bash
# Quick Setup: Supabase + Render Integration
# This script fetches Supabase credentials and configures both local and Render environments

set -euo pipefail

echo "🚀 SUPABASE + RENDER AUTOPILOT SETUP"
echo "====================================="
echo ""

# Check if Supabase credentials are provided
if [[ -z "${SUPABASE_URL:-}" ]] || [[ -z "${SUPABASE_ANON_KEY:-}" ]]; then
  echo "❌ Missing Supabase credentials!"
  echo ""
  echo "Please provide Supabase credentials:"
  echo ""
  echo "Option 1: Set environment variables"
  echo "  export SUPABASE_URL='https://xxxxxxxxxxxxx.supabase.co'"
  echo "  export SUPABASE_ANON_KEY='eyJhbGci...'"
  echo "  export SUPABASE_SERVICE_KEY='eyJhbGci...'"
  echo ""
  echo "Option 2: Pass as arguments"
  echo "  bash $0 <SUPABASE_URL> <SUPABASE_ANON_KEY> <SUPABASE_SERVICE_KEY>"
  echo ""
  echo "📋 To get credentials:"
  echo "  1. Go to: https://supabase.com/dashboard"
  echo "  2. Select your project: cuxzzpsyufcewtmicszk"
  echo "  3. Settings → API → Copy the keys"
  echo ""
  exit 1
fi

# Allow passing credentials as arguments
if [[ $# -ge 2 ]]; then
  export SUPABASE_URL="$1"
  export SUPABASE_ANON_KEY="$2"
  if [[ $# -ge 3 ]]; then
    export SUPABASE_SERVICE_KEY="$3"
  fi
fi

# Check for Render credentials
echo "🔍 Checking for Render credentials..."
if [[ -z "${RENDER_API_KEY:-}" ]] || [[ -z "${RENDER_SERVICE_ID:-}" ]]; then
  echo "⚠️  Render credentials not found"
  echo ""
  echo "To enable Render integration, set:"
  echo "  export RENDER_API_KEY='rnd_xxxxxxxxxxxx'"
  echo "  export RENDER_SERVICE_ID='srv-xxxxxxxxxxxx'"
  echo "  export RENDER_DEPLOY_HOOK='https://api.render.com/deploy/srv-xxx'"
  echo ""
  echo "Get these from:"
  echo "  - API Key: https://dashboard.render.com/account/settings"
  echo "  - Service ID: In your service URL"
  echo "  - Deploy Hook: Service Settings → Deploy Hook"
  echo ""
  read -p "Continue without Render integration? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo "✅ Render credentials found"
  echo "   Service ID: ${RENDER_SERVICE_ID}"
fi

echo ""
echo "🚀 Running Supabase setup..."
echo ""

# Run the main setup script
bash scripts/setup-supabase.sh

echo ""
echo "✅ Setup complete!"
