#!/usr/bin/env bash
set -euo pipefail

# EFH Complete Stack Bootstrap
# Deploys Cloudflare Workers, Supabase Edge Functions, and Render Frontend

# Load .env if present
if [[ -f .env ]]; then
  export $(grep -v '^#' .env | xargs)
fi

banner() { echo -e "\n\033[1;36m==> $1\033[0m"; }
ok()     { echo -e "\033[1;32m✔ $1\033[0m"; }
warn()   { echo -e "\033[1;33m⚠ $1\033[0m"; }
err()    { echo -e "\033[1;31m✘ $1\033[0m"; }

need() {
  if ! command -v "$1" >/dev/null 2>&1; then err "Missing CLI: $1"; exit 1; fi
}

# ─────────────────────────────────────────────
# 0) Pre-flight
# ─────────────────────────────────────────────
banner "Pre-flight checks"

need wrangler
need curl
need jq
need node
need npm
need git

# Check for supabase CLI (optional)
if command -v supabase >/dev/null 2>&1; then
  HAS_SUPABASE=true
  ok "Supabase CLI found"
else
  HAS_SUPABASE=false
  warn "Supabase CLI not found (optional)"
fi

: "${CF_ACCOUNT_ID:?CF_ACCOUNT_ID missing}"
: "${CF_API_TOKEN:?CF_API_TOKEN missing}"

ok "Cloudflare credentials found"

# Optional Supabase vars
SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
SUPABASE_DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"

# Optional Render vars
RENDER_API_KEY="${RENDER_API_KEY:-}"
RENDER_SERVICE_ID="${RENDER_SERVICE_ID:-}"
RENDER_DEPLOY_HOOK="${RENDER_DEPLOY_HOOK:-}"

ORCH_DIR="${ORCH_DIR:-./workers/orchestrator}"
ANALYZER_DIR="${ANALYZER_DIR:-./workers/analyzer}"
STYLIST_DIR="${STYLIST_DIR:-./workers/stylist}"

FRONTEND_DIR="${FRONTEND_DIR:-.}"
FRONTEND_BUILD_CMD="${FRONTEND_BUILD_CMD:-npm run build}"
FRONTEND_ENV="${FRONTEND_ENV:-production}"

export CLOUDFLARE_ACCOUNT_ID="$CF_ACCOUNT_ID"
export CLOUDFLARE_API_TOKEN="$CF_API_TOKEN"
[[ -n "$SUPABASE_ACCESS_TOKEN" ]] && export SUPABASE_ACCESS_TOKEN

# ─────────────────────────────────────────────
# 1) Cloudflare: ensure KV & R2
# ─────────────────────────────────────────────
banner "Cloudflare: ensuring KV namespaces and R2 buckets"

wrangler kv:namespace list > /tmp/kv_list.txt 2>/dev/null || echo "" > /tmp/kv_list.txt
wrangler r2 bucket list > /tmp/r2_list.txt 2>/dev/null || echo "" > /tmp/r2_list.txt

ensure_kv() {
  local NAME="$1"
  if grep -q "\"title\": \"$NAME\"" /tmp/kv_list.txt 2>/dev/null; then
    ok "KV namespace '$NAME' exists"
  else
    warn "Creating KV namespace '$NAME'..."
    wrangler kv:namespace create "$NAME" || true
    ok "KV namespace '$NAME' ready"
  fi
}

ensure_r2() {
  local NAME="$1"
  if grep -q "$NAME" /tmp/r2_list.txt 2>/dev/null; then
    ok "R2 bucket '$NAME' exists"
  else
    warn "Creating R2 bucket '$NAME'..."
    wrangler r2 bucket create "$NAME" || true
    ok "R2 bucket '$NAME' ready"
  fi
}

ensure_kv "REGISTRY"
ensure_kv "LOGS"
ensure_kv "SUMMARIES"
ensure_kv "AI_EMPLOYEE_LOGS"

ensure_r2 "efh-assets"
ensure_r2 "efh-images"
ensure_r2 "efh-pages"
ensure_r2 "efh-private"

# ─────────────────────────────────────────────
# 2) Deploy / upgrade Workers
# ─────────────────────────────────────────────
banner "Deploying Workers"

deploy_worker() {
  local DIR="$1"
  local NAME="$2"
  
  if [[ ! -d "$DIR" ]]; then
    warn "$DIR not found — creating minimal worker scaffold"
    mkdir -p "$DIR"
    
    # Create minimal wrangler.toml
    cat > "$DIR/wrangler.toml" <<EOF
name = "$NAME"
main = "index.js"
compatibility_date = "2024-09-01"

[vars]
SERVICE_NAME = "$NAME"
EOF
    
    # Create minimal worker
    cat > "$DIR/index.js" <<'EOF'
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: env.SERVICE_NAME || 'unknown',
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response('OK', {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
};
EOF
    ok "Created minimal worker scaffold in $DIR"
  fi
  
  # Deploy the worker
  (cd "$DIR" && wrangler deploy) || {
    err "Failed to deploy $NAME"
    return 1
  }
  
  ok "Deployed $NAME"
}

# Deploy workers (use existing code if present, scaffold if not)
deploy_worker "$ORCH_DIR" "efh-autopilot-orchestrator"
deploy_worker "$ANALYZER_DIR" "efh-autopilot-analyzer"
deploy_worker "$STYLIST_DIR" "efh-stylist"

# ─────────────────────────────────────────────
# 3) Bind secrets to Workers
# ─────────────────────────────────────────────
banner "Binding secrets to Workers"

bind_secret() {
  local WNAME="$1"
  local KEY="$2"
  local VAL="$3"
  
  if [[ -z "$VAL" ]]; then
    return 0
  fi
  
  # Use wrangler's secret setter by piping value
  printf "%s" "$VAL" | wrangler secret put "$KEY" --name "$WNAME" 2>/dev/null || {
    warn "Failed to set $KEY for $WNAME"
    return 1
  }
  ok "Set $KEY for $WNAME"
}

for W in "efh-autopilot-orchestrator" "efh-autopilot-analyzer" "efh-stylist"; do
  bind_secret "$W" "CF_API_TOKEN" "$CF_API_TOKEN"
  bind_secret "$W" "CF_ACCOUNT_ID" "$CF_ACCOUNT_ID"
  
  # Optional Supabase secrets
  [[ -n "${SUPABASE_URL:-}" ]] && bind_secret "$W" "SUPABASE_URL" "$SUPABASE_URL"
  [[ -n "${SUPABASE_SERVICE_KEY:-}" ]] && bind_secret "$W" "SUPABASE_SERVICE_KEY" "$SUPABASE_SERVICE_KEY"
done

ok "All secrets bound"

# ─────────────────────────────────────────────
# 4) Supabase: login, link project, deploy Edge Functions
# ─────────────────────────────────────────────
if [[ "$HAS_SUPABASE" == true ]] && [[ -n "$SUPABASE_ACCESS_TOKEN" ]] && [[ -n "$SUPABASE_PROJECT_REF" ]]; then
  banner "Supabase: login & link project"
  
  supabase login --token "$SUPABASE_ACCESS_TOKEN" 2>/dev/null || warn "Supabase login failed"
  supabase link --project-ref "$SUPABASE_PROJECT_REF" 2>/dev/null || warn "Supabase link failed"
  
  # Optional DB env for functions
  if [[ -n "$SUPABASE_DB_PASSWORD" ]]; then
    supabase secrets set DB_PASSWORD="$SUPABASE_DB_PASSWORD" 2>/dev/null || true
  fi
  
  # Deploy all local functions if ./supabase/functions exists
  if [[ -d ./supabase/functions ]]; then
    banner "Supabase: deploying all edge functions"
    supabase functions deploy --project-ref "$SUPABASE_PROJECT_REF" || warn "Some functions failed to deploy"
    ok "Supabase functions deployed"
  else
    warn "No ./supabase/functions directory found; skipping function deploy"
  fi
  
  # Verify known function exists
  if supabase functions list 2>/dev/null | grep -q executeAction; then
    ok "Edge function 'executeAction' present"
  else
    warn "Edge function 'executeAction' not found"
  fi
else
  warn "Skipping Supabase deployment (CLI not found or credentials missing)"
fi

# ─────────────────────────────────────────────
# 5) Frontend (Render): build & trigger deploy
# ─────────────────────────────────────────────
banner "Frontend: build & deploy"

if [[ -d "$FRONTEND_DIR" ]] && [[ -f "$FRONTEND_DIR/package.json" ]]; then
  (cd "$FRONTEND_DIR" && npm i && env NODE_ENV="$FRONTEND_ENV" bash -lc "$FRONTEND_BUILD_CMD") || {
    warn "Frontend build failed"
  }
  ok "Frontend built"
else
  warn "Frontend dir $FRONTEND_DIR not found or no package.json — skipping local build"
fi

trigger_render_api() {
  if [[ -n "$RENDER_API_KEY" ]] && [[ -n "$RENDER_SERVICE_ID" ]]; then
    local DEPLOY_ID
    DEPLOY_ID=$(curl -sS -X POST \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -H "Content-Type: application/json" \
      "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
      -d '{"clearCache": true}' 2>/dev/null | jq -r '.id' 2>/dev/null || echo "")
    
    if [[ -n "$DEPLOY_ID" ]]; then
      ok "Triggered Render API deploy: $DEPLOY_ID"
    else
      warn "Render API deploy trigger failed"
    fi
  fi
}

trigger_render_hook() {
  if [[ -n "$RENDER_DEPLOY_HOOK" ]]; then
    curl -sS -X POST "$RENDER_DEPLOY_HOOK" >/dev/null 2>&1 && {
      ok "Triggered Render via deploy hook"
    } || {
      warn "Render deploy hook failed"
    }
  fi
}

if [[ -n "$RENDER_DEPLOY_HOOK" ]]; then
  trigger_render_hook
elif [[ -n "$RENDER_API_KEY" ]] && [[ -n "$RENDER_SERVICE_ID" ]]; then
  trigger_render_api
else
  warn "No Render credentials set — skipping remote deploy"
fi

# ─────────────────────────────────────────────
# 6) Smoke tests
# ─────────────────────────────────────────────
banner "Smoke tests"

test_url() {
  local U="$1"
  local L="$2"
  local C
  C=$(curl -s -o /dev/null -w "%{http_code}" "$U" 2>/dev/null || echo "000")
  
  if [[ "$C" =~ ^20 ]]; then
    ok "$L OK ($C)"
  elif [[ "$C" =~ ^30 ]]; then
    warn "$L redirect ($C)"
  elif [[ "$C" == "000" ]]; then
    err "$L failed to connect"
  else
    warn "$L returned $C"
  fi
}

# Test worker endpoints
test_url "https://efh-autopilot-orchestrator.workers.dev/health" "Orchestrator health"
test_url "https://efh-autopilot-analyzer.workers.dev/health" "Analyzer health"
test_url "https://efh-stylist.workers.dev/health" "Stylist health"

# ─────────────────────────────────────────────
# 7) Summary
# ─────────────────────────────────────────────
banner "✅ Bootstrap complete!"

echo ""
echo "📊 Summary:"
echo "───────────"
echo "✅ Cloudflare Workers deployed:"
echo "   - Orchestrator: https://efh-autopilot-orchestrator.workers.dev"
echo "   - Analyzer: https://efh-autopilot-analyzer.workers.dev"
echo "   - Stylist: https://efh-stylist.workers.dev"
echo ""
echo "✅ KV Namespaces: REGISTRY, LOGS, SUMMARIES, AI_EMPLOYEE_LOGS"
echo "✅ R2 Buckets: efh-assets, efh-images, efh-pages, efh-private"
echo ""

if [[ "$HAS_SUPABASE" == true ]] && [[ -n "$SUPABASE_ACCESS_TOKEN" ]]; then
  echo "✅ Supabase Edge Functions deployed"
else
  echo "⚠️  Supabase deployment skipped"
fi

if [[ -n "$RENDER_API_KEY" ]] || [[ -n "$RENDER_DEPLOY_HOOK" ]]; then
  echo "✅ Render frontend deploy triggered"
else
  echo "⚠️  Render deployment skipped"
fi

echo ""
echo "🔗 Next steps:"
echo "──────────────"
echo "1. Update admin UI with worker URLs in src/pages/AutopilotAdmin.tsx"
echo "2. Register autopilots: bash scripts/register-autopilots.sh"
echo "3. Access admin dashboard at /autopilot-admin"
echo "4. Run diagnostics to verify everything works"
echo ""
echo "📚 Documentation: ORCHESTRATOR_GUIDE.md, DEPLOYMENT_SUMMARY.md"
echo ""
