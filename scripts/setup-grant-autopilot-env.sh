#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Setting up AI Grant Autopilot environment..."

# Check if efh-grant-autopilot exists
if [ ! -d "efh-grant-autopilot" ]; then
  echo "❌ efh-grant-autopilot directory not found"
  echo "Run: bash scripts/bootstrap-grant-autopilot.sh first"
  exit 1
fi

cd efh-grant-autopilot

# Create .env from existing credentials
cat > .env << 'EOF'
# ══════════════════════════════════════════════════════════
# AI GRANT AUTOPILOT - AUTO-CONFIGURED
# ══════════════════════════════════════════════════════════

# ── OpenAI ──────────────────────────────────────────────────
# TODO: Add your OpenAI API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=

# ── Supabase ────────────────────────────────────────────────
# Using existing Supabase project
SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-}

# ── Google Calendar ─────────────────────────────────────────
# Using existing Google Classroom service account
GOOGLE_SERVICE_ACCOUNT_JSON=${GOOGLE_SA_JSON_B64:-}
GOOGLE_CALENDAR_ID=primary

# ── Organization ────────────────────────────────────────────
APP_PORT=8787
ORG_DISPLAY_NAME="Elevate for Humanity"
ORG_EIN="00-0000000"
ORG_DOMAINS="elevateforhumanity.org,selfishinc.org,riseforwardfoundation.org"
DEFAULT_TIMEZONE="America/Indiana/Indianapolis"

# ── Features ────────────────────────────────────────────────
ENABLE_GRANTS_GOV=false
ENABLE_FOUNDATION_FEEDS=true

# ── Grants.gov (Optional) ───────────────────────────────────
GRANTS_GOV_API_KEY=
EOF

echo ""
echo "✅ Created efh-grant-autopilot/.env"
echo ""
echo "📋 Configuration Status:"
echo ""

# Check what's configured
if [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not found in environment"
  echo "   Add it with: gp env SUPABASE_SERVICE_ROLE_KEY=your_key"
else
  echo "✅ Supabase configured"
fi

if [ -z "${GOOGLE_SA_JSON_B64:-}" ]; then
  echo "⚠️  GOOGLE_SA_JSON_B64 not found in environment"
  echo "   This is your Google service account JSON (base64 encoded)"
  echo "   Add it with: gp env GOOGLE_SA_JSON_B64=your_json"
else
  echo "✅ Google service account configured"
fi

echo ""
echo "❌ OpenAI API key NOT configured (required)"
echo "   Get one from: https://platform.openai.com/api-keys"
echo "   Then edit efh-grant-autopilot/.env and add:"
echo "   OPENAI_API_KEY=sk-proj-..."
echo ""

echo "📝 Next steps:"
echo ""
echo "1. Get OpenAI API key:"
echo "   → https://platform.openai.com/api-keys"
echo "   → Edit efh-grant-autopilot/.env"
echo ""
echo "2. Create database tables:"
echo "   → Open Supabase SQL Editor"
echo "   → Run: cat efh-grant-autopilot/sql/schema.sql"
echo ""
echo "3. Start the service:"
echo "   cd efh-grant-autopilot"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "4. Seed your organization:"
echo "   curl -X POST http://localhost:8787/api/org/seed \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"name\":\"Elevate for Humanity\"}'"
echo ""
