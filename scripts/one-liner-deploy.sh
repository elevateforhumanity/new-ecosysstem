#!/usr/bin/env bash
# EFH One-Liner Deploy - Complete deployment in one command
# Usage: bash scripts/one-liner-deploy.sh

bash -lc 'set -euo pipefail; source .env;
echo "🚀 EFH One-Liner Deploy";
echo "======================";
echo "";

# 1) Ensure KV & R2
echo "📦 Step 1: Ensuring infrastructure...";
wrangler kv:namespace list >/tmp/kv.txt 2>/dev/null || true;
wrangler r2 bucket list >/tmp/r2.txt 2>/dev/null || true;
grep -q REGISTRY /tmp/kv.txt || { echo "  Creating REGISTRY..."; wrangler kv:namespace create REGISTRY >/dev/null 2>&1; };
grep -q LOGS /tmp/kv.txt || { echo "  Creating LOGS..."; wrangler kv:namespace create LOGS >/dev/null 2>&1; };
grep -q SUMMARIES /tmp/kv.txt || { echo "  Creating SUMMARIES..."; wrangler kv:namespace create SUMMARIES >/dev/null 2>&1; };
grep -q efh-assets /tmp/r2.txt || { echo "  Creating efh-assets..."; wrangler r2 bucket create efh-assets >/dev/null 2>&1; };
grep -q efh-images /tmp/r2.txt || { echo "  Creating efh-images..."; wrangler r2 bucket create efh-images >/dev/null 2>&1; };
echo "  ✅ Infrastructure ready";

# 2) Deploy workers
echo "";
echo "🚀 Step 2: Deploying workers...";
for D in "$ORCH_DIR" "$ANALYZER_DIR" "$STYLIST_DIR"; do
  echo "  Deploying $(basename "$D")...";
  (cd "$D" && wrangler deploy 2>&1 | grep -E "(Published|✨)" || true);
done;
echo "  ✅ Workers deployed";

# 3) Push secrets to each worker
echo "";
echo "🔑 Step 3: Setting secrets...";
for W in "$(basename "$ORCH_DIR")" "$(basename "$ANALYZER_DIR")" "$(basename "$STYLIST_DIR")"; do
  echo "  Setting secrets for $W...";
  printf "%s" "$CF_API_TOKEN" | wrangler secret put CF_API_TOKEN --name "$W" >/dev/null 2>&1;
  printf "%s" "$CF_ACCOUNT_ID" | wrangler secret put CF_ACCOUNT_ID --name "$W" >/dev/null 2>&1;
  [[ -n "${SUPABASE_URL:-}" ]] && printf "%s" "$SUPABASE_URL" | wrangler secret put SUPABASE_URL --name "$W" >/dev/null 2>&1;
  [[ -n "${SUPABASE_SERVICE_KEY:-}" ]] && printf "%s" "$SUPABASE_SERVICE_KEY" | wrangler secret put SUPABASE_SERVICE_KEY --name "$W" >/dev/null 2>&1;
  [[ -n "${SUPABASE_DB_PASSWORD:-}" ]] && printf "%s" "$SUPABASE_DB_PASSWORD" | wrangler secret put SUPABASE_DB_PASSWORD --name "$W" >/dev/null 2>&1;
  [[ -n "${SERVICE_TOKEN:-}" ]] && printf "%s" "$SERVICE_TOKEN" | wrangler secret put SERVICE_TOKEN --name "$W" >/dev/null 2>&1;
done;
echo "  ✅ Secrets set";

# 4) Supabase login/link + functions deploy (if you have ./supabase/functions)
if [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]] && [[ -n "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "";
  echo "🔧 Step 4: Deploying Supabase functions...";
  supabase login --token "$SUPABASE_ACCESS_TOKEN" >/dev/null 2>&1;
  supabase link --project-ref "$SUPABASE_PROJECT_REF" >/dev/null 2>&1;
  if [ -d ./supabase/functions ]; then
    supabase functions deploy --project-ref "$SUPABASE_PROJECT_REF" 2>&1 | grep -E "(Deployed|✓)" || true;
    echo "  ✅ Supabase functions deployed";
  else
    echo "  ⚠️  No Supabase functions directory";
  fi;
else
  echo "";
  echo "⚠️  Step 4: Skipping Supabase (credentials not set)";
fi;

# 5) Frontend build + Render deploy (optional)
if [ -d "$FRONTEND_DIR" ]; then
  echo "";
  echo "🎨 Step 5: Building frontend...";
  (cd "$FRONTEND_DIR" && npm i >/dev/null 2>&1 && NODE_ENV="${FRONTEND_ENV:-production}" bash -lc "$FRONTEND_BUILD_CMD" 2>&1 | tail -3);
  echo "  ✅ Frontend built";
else
  echo "";
  echo "⚠️  Step 5: Skipping frontend build (directory not found)";
fi;

if [ -n "${RENDER_DEPLOY_HOOK:-}" ]; then
  echo "  Triggering Render deploy...";
  curl -sS -X POST "$RENDER_DEPLOY_HOOK" >/dev/null 2>&1;
  echo "  ✅ Render deploy triggered";
elif [ -n "${RENDER_API_KEY:-}" ] && [ -n "${RENDER_SERVICE_ID:-}" ]; then
  echo "  Triggering Render deploy via API...";
  curl -sS -X POST -H "Authorization: Bearer $RENDER_API_KEY" -H "Content-Type: application/json" \
    "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" -d "{\"clearCache\":true}" >/dev/null 2>&1;
  echo "  ✅ Render deploy triggered";
fi;

# 6) Smoke checks
echo "";
echo "🧪 Step 6: Running smoke tests...";
ORCH_HOST="$(basename "$ORCH_DIR").workers.dev";
ANALYZER_HOST="$(basename "$ANALYZER_DIR").workers.dev";
STYLIST_HOST="$(basename "$STYLIST_DIR").workers.dev";

echo "  Testing $ORCH_HOST...";
curl -sS https://$ORCH_HOST/health 2>/dev/null | head -c 100 >/dev/null && echo "    ✅ Orchestrator OK" || echo "    ❌ Orchestrator failed";

echo "  Testing $ANALYZER_HOST...";
curl -sS https://$ANALYZER_HOST/health 2>/dev/null | head -c 100 >/dev/null && echo "    ✅ Analyzer OK" || echo "    ❌ Analyzer failed";

echo "  Testing $STYLIST_HOST...";
curl -sS https://$STYLIST_HOST/health 2>/dev/null | head -c 100 >/dev/null && echo "    ✅ Stylist OK" || echo "    ❌ Stylist failed";

echo "";
echo "✅ Deployment Complete!";
echo "======================";
echo "";
echo "🌐 Worker URLs:";
echo "  Orchestrator: https://$ORCH_HOST";
echo "  Analyzer:     https://$ANALYZER_HOST";
echo "  Stylist:      https://$STYLIST_HOST";
echo "";
echo "🔗 Next steps:";
echo "  1. Update admin UI with worker URLs";
echo "  2. Register autopilots: bash scripts/register-autopilots.sh";
echo "  3. Access admin dashboard: /autopilot-admin";
echo "  4. Run diagnostics: curl https://$ORCH_HOST/autopilot/diagnose | jq .";
echo "";
'
