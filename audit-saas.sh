#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
#  Elevate SaaS Audit (read-only)
#  Scans for: Next.js/Turbo monorepo, Cloudflare Workers/Queues, Supabase RLS,
#  Stripe billing/webhooks, Terraform IaC, CI (Actions/CodeQL/Dependabot),
#  Sentry/OTel, CSP & security headers, secrets hygiene, env examples, etc.
#  Outputs a markdown report: ./audit-report.md
# ──────────────────────────────────────────────────────────────────────────────

ROOT="$(pwd)"
OUT="$ROOT/audit-report.md"
PASS="✅"
WARN="⚠️"
FAIL="❌"
INFO="ℹ️"

found() { echo "$PASS $1"; }
warn()  { echo "$WARN $1"; }
fail()  { echo "$FAIL $1"; }
info()  { echo "$INFO  $1"; }

have_file() { [ -f "$1" ]; }
have_dir()  { [ -d "$1" ]; }
have_cmd()  { command -v "$1" >/dev/null 2>&1; }

md_escape() { sed 's/|/\\|/g'; }

# small helpers
json_has_key() {
  # $1 file, $2 key (top-level)
  local f="$1" key="$2"
  [ -f "$f" ] || return 1
  if have_cmd jq; then
    jq -e "has(\"$key\")" "$f" >/dev/null 2>&1
  else
    grep -q "\"$key\"" "$f"
  fi
}

pkg_has_dep() {
  # $1 package.json path, $2 dep name
  local f="$1" dep="$2"
  [ -f "$f" ] || return 1
  if have_cmd jq; then
    jq -e ".dependencies.\"$dep\" or .devDependencies.\"$dep\"" "$f" >/dev/null 2>&1
  else
    grep -q "\"$dep\"" "$f"
  fi
}

search_code() {
  # $1 pattern, $2 path
  rg --hidden --glob '!.git' -n "$1" "$2" 2>/dev/null || true
}

list_workflows() {
  [ -d ".github/workflows" ] && ls -1 .github/workflows || true
}

# find package roots
PKG_JSONS=()
while IFS= read -r -d '' f; do PKG_JSONS+=("$f"); done < <(find "$ROOT" -name package.json -maxdepth 3 -print0 2>/dev/null)

# candidate app dirs
APP_WEB=""
for pj in "${PKG_JSONS[@]}"; do
  dir="$(dirname "$pj")"
  if [ -d "$dir/app" ] || [ -d "$dir/pages" ]; then
    APP_WEB="$dir"
    break
  fi
done

# write header
cat > "$OUT" <<EOF
# Elevate SaaS Audit

_Generated: $(date -u +"%Y-%m-%d %H:%M UTC")_

This report compares your repository against a secure, boring SaaS baseline (Next.js + Supabase RLS + Cloudflare Workers/Queues + Stripe + Terraform + CI + CSP + Secrets).

---
EOF

section() {
  echo -e "\n## $1\n" >> "$OUT"
}

table_header() {
  echo -e "\n| Check | Status |\n|---|---|\n" >> "$OUT"
}

row() {
  # $1 label, $2 status icon + text
  printf "| %s | %s |\n" "$1" "$2" >> "$OUT"
}

# ──────────────────────────────────────────────────────────────────────────────
# Node/Package ecosystem
section "Node & Package Ecosystem"

table_header
NODE_VER="$(node -v 2>/dev/null || echo "not-found")"
NPM_VER="$(npm -v 2>/dev/null || echo "not-found")"
PNPM_VER="$(pnpm -v 2>/dev/null || echo "not-found")"
YARN_VER="$(yarn -v 2>/dev/null || echo "not-found")"

if [[ "$NODE_VER" == "not-found" ]]; then
  row "Node installed" "$(fail "Node not found")"
else
  row "Node installed" "$(found "Node $NODE_VER")"
fi
row "npm present" "$([ "$NPM_VER" = "not-found" ] && fail "no" || found "npm $NPM_VER")"
row "pnpm present" "$([ "$PNPM_VER" = "not-found" ] && warn "no" || found "pnpm $PNPM_VER")"
row "yarn present" "$([ "$YARN_VER" = "not-found" ] && info "no" || found "yarn $YARN_VER")"

# monorepo detection
if have_file "$ROOT/turbo.json" || have_file "$ROOT/turborepo.json"; then
  row "Turborepo" "$(found "turbo config present")"
else
  row "Turborepo" "$(warn "not found")"
fi

# ──────────────────────────────────────────────────────────────────────────────
# Frontend: Next.js baseline
section "Frontend (Next.js)"

table_header
if [ -n "$APP_WEB" ]; then
  row "Web app path" "$(found "$APP_WEB")"
  if have_file "$APP_WEB/next.config.js" || have_file "$APP_WEB/next.config.mjs"; then
    row "next.config" "$(found "present")"
  else
    row "next.config" "$(warn "missing")"
  fi
  if [ -d "$APP_WEB/app" ]; then
    row "App Router" "$(found "/app directory")"
  else
    row "App Router" "$(warn "no /app (using pages?)")"
  fi
  if pkg_has_dep "$APP_WEB/package.json" "next"; then
    row "next dependency" "$(found "present")"
  else
    row "next dependency" "$(fail "missing")"
  fi
  if pkg_has_dep "$APP_WEB/package.json" "tailwindcss"; then
    row "Tailwind" "$(found "present")"
  else
    row "Tailwind" "$(warn "missing")"
  fi
  if pkg_has_dep "$APP_WEB/package.json" "@sentry/nextjs"; then
    row "Sentry (frontend)" "$(found "@sentry/nextjs")"
  else
    row "Sentry (frontend)" "$(warn "not detected")"
  fi
else
  row "Web app" "$(fail "No Next.js app detected within 3 levels")"
fi

# Security headers / CSP
CSP_HITS="$(search_code 'Content-Security-Policy' "$APP_WEB")"
if [ -n "$CSP_HITS" ]; then
  row "CSP header" "$(found "policy references found")"
else
  row "CSP header" "$(warn "no explicit CSP found in code")"
fi

FRAMING_HITS="$(search_code "X-Frame-Options|frame-ancestors" "$APP_WEB")"
[ -n "$FRAMING_HITS" ] && row "Clickjacking protection" "$(found "headers present")" || row "Clickjacking protection" "$(warn "not detected")"

# ──────────────────────────────────────────────────────────────────────────────
# Backend/Edge: Cloudflare Workers & Queues
section "Edge & Background (Cloudflare Workers/Queues)"

table_header
if have_file "$ROOT/wrangler.toml"; then
  row "wrangler.toml" "$(found "present")"
  # queues
  if grep -qi '\[queues\]\|\[queues.consumers\]' "$ROOT/wrangler.toml"; then
    row "Cloudflare Queues" "$(found "configured in wrangler")"
  else
    row "Cloudflare Queues" "$(warn "not configured")"
  fi
  # cron
  if grep -qi '\[triggers\]\|\[crons\]' "$ROOT/wrangler.toml"; then
    row "Cron Triggers" "$(found "configured")"
  else
    row "Cron Triggers" "$(warn "none found")"
  fi
else
  row "wrangler.toml" "$(warn "missing (no Workers config at repo root)")"
fi

# Workers src
WORKERS_SRC="$(rg --hidden --glob '!.git' -l 'export default \{.*fetch' 2>/dev/null || true)"
[ -n "$WORKERS_SRC" ] && row "Workers code" "$(found "handler(s) detected")" || row "Workers code" "$(warn "not detected")"

# ──────────────────────────────────────────────────────────────────────────────
# Database: Supabase/Postgres & RLS
section "Database (Supabase/Postgres & RLS)"

table_header
SUPA_ENV_KEYS="$(rg -n --hidden --glob '!.git' 'SUPABASE_(URL|ANON_KEY|SERVICE_ROLE)' 2>/dev/null || true)"
[ -n "$SUPA_ENV_KEYS" ] && row "Supabase env keys referenced" "$(found "yes")" || row "Supabase env keys referenced" "$(warn "not found")"

PRISMA_SCHEMA=""
if have_file "$ROOT/prisma/schema.prisma"; then PRISMA_SCHEMA="$ROOT/prisma/schema.prisma";
elif have_file "$ROOT/packages/db/prisma/schema.prisma"; then PRISMA_SCHEMA="$ROOT/packages/db/prisma/schema.prisma"; fi

[ -n "$PRISMA_SCHEMA" ] && row "Prisma schema" "$(found "$PRISMA_SCHEMA")" || row "Prisma schema" "$(warn "not found")"

# very rough RLS detection by scanning migrations/sql
RLS_SIGNS="$(rg --hidden --glob '!.git' -n '(ENABLE ROW LEVEL SECURITY|CREATE POLICY|ALTER TABLE .* ENABLE RLS)' prisma migrations sql db 2>/dev/null || true)"
[ -n "$RLS_SIGNS" ] && row "RLS policies in repo" "$(found "found in SQL/migrations")" || row "RLS policies in repo" "$(warn "no RLS statements detected")"

TENANT_POLICY_SIGNS="$(rg -n --hidden --glob '!.git' "tenant_id.*auth.jwt" 2>/dev/null || true)"
[ -n "$TENANT_POLICY_SIGNS" ] && row "Tenant-aware policy pattern" "$(found "matches found")" || row "Tenant-aware policy pattern" "$(warn "no 'tenant_id = auth.jwt()' pattern detected")"

# ──────────────────────────────────────────────────────────────────────────────
# Billing: Stripe
section "Billing (Stripe)"

table_header
PKG_FOR_STRIPE=""
if [ -n "$APP_WEB" ] && pkg_has_dep "$APP_WEB/package.json" "stripe"; then PKG_FOR_STRIPE="$APP_WEB/package.json"; fi
if [ -z "$PKG_FOR_STRIPE" ]; then
  for pj in "${PKG_JSONS[@]}"; do
    if pkg_has_dep "$pj" "stripe"; then PKG_FOR_STRIPE="$pj"; break; fi
  done
fi

[ -n "$PKG_FOR_STRIPE" ] && row "stripe dependency" "$(found "present in $(dirname "$PKG_FOR_STRIPE")")" || row "stripe dependency" "$(warn "not detected")"

WEBHOOK_HITS="$(search_code '/api/stripe|stripe.webhooks|constructEvent' "$ROOT")"
[ -n "$WEBHOOK_HITS" ] && row "Stripe webhook handler" "$(found "endpoint logic present")" || row "Stripe webhook handler" "$(warn "not detected")"

IDEMPOTENCY_HITS="$(search_code 'Idempotency-Key|idempotency_key' "$ROOT")"
[ -n "$IDEMPOTENCY_HITS" ] && row "Idempotency on paid actions" "$(found "present")" || row "Idempotency on paid actions" "$(warn "not detected")"

# ──────────────────────────────────────────────────────────────────────────────
# Observability: Sentry / OTel
section "Observability (Sentry / OpenTelemetry)"

table_header
SENTRY_PKG=0
for pj in "${PKG_JSONS[@]}"; do
  if pkg_has_dep "$pj" "@sentry/nextjs" || pkg_has_dep "$pj" "@sentry/node" || pkg_has_dep "$pj" "@sentry/browser"; then SENTRY_PKG=1; break; fi
done
[ $SENTRY_PKG -eq 1 ] && row "Sentry packages" "$(found "present")" || row "Sentry packages" "$(warn "not detected")"

SENTRY_DSN_HITS="$(search_code 'SENTRY_DSN' "$ROOT")"
[ -n "$SENTRY_DSN_HITS" ] && row "SENTRY_DSN env use" "$(found "referenced")" || row "SENTRY_DSN env use" "$(warn "not referenced")"

OTEL_HITS="$(search_code 'OpenTelemetry|@opentelemetry/api|OTEL_' "$ROOT")"
[ -n "$OTEL_HITS" ] && row "OpenTelemetry traces" "$(found "detected")" || row "OpenTelemetry traces" "$(info "not detected")"

# ──────────────────────────────────────────────────────────────────────────────
# Infra as Code & CI/CD: Terraform, Actions, CodeQL, Dependabot
section "Infra as Code & CI/CD"

table_header
TF_DIR=""
for d in "$ROOT/infra/terraform" "$ROOT/terraform" "$ROOT/infra"; do
  if [ -d "$d" ] && rg -n 'terraform\W*{' "$d" >/dev/null 2>&1; then TF_DIR="$d"; break; fi
done
[ -n "$TF_DIR" ] && row "Terraform present" "$(found "$TF_DIR")" || row "Terraform present" "$(warn "not found")"

WF_LIST="$(list_workflows)"
if [ -n "$WF_LIST" ]; then
  row "GitHub Actions workflows" "$(found "$(echo "$WF_LIST" | wc -l) file(s)")"
  echo -e "\n<details><summary>Workflows</summary>\n\n\`\`\`\n$WF_LIST\n\`\`\`\n</details>\n" >> "$OUT"
else
  row "GitHub Actions workflows" "$(warn "none found")"
fi

if have_file ".github/dependabot.yml"; then
  row "Dependabot" "$(found "configured")"
else
  row "Dependabot" "$(warn "not configured")"
fi

CODEQL_PRESENT="$(rg -n 'codeql' .github/workflows 2>/dev/null || true)"
[ -n "$CODEQL_PRESENT" ] && row "CodeQL" "$(found "workflow present")" || row "CodeQL" "$(warn "not detected")"

# OIDC hint
OIDC_PRESENT="$(rg -n 'permissions:.*id-token:\s*write' .github/workflows 2>/dev/null || true)"
[ -n "$OIDC_PRESENT" ] && row "OIDC for deploys" "$(found "id-token: write detected")" || row "OIDC for deploys" "$(warn "not detected")"

# ──────────────────────────────────────────────────────────────────────────────
# Secrets hygiene & env examples
section "Secrets Hygiene & Env Examples"

table_header
if have_file ".env"; then
  row ".env at repo root" "$(warn "present (avoid committing)")"
else
  row ".env at repo root" "$(found "not present")"
fi

if rg --hidden --glob '!.git' -n 'SECRET|KEY|TOKEN|PASSWORD|PRIVATE_KEY' .env* 2>/dev/null | grep -q .; then
  row "Potential secrets in repo" "$(fail "secret-like strings found in env files")"
else
  row "Potential secrets in repo" "$(found "no obvious leaks in env files")"
fi

if have_file ".env.example" || have_file "apps/web/.env.example" || have_file "packages/*/.env.example"; then
  row ".env.example" "$(found "present")"
else
  row ".env.example" "$(warn "missing")"
fi

# ──────────────────────────────────────────────────────────────────────────────
# Marketing/App split & Hosting hints
section "Hosting & Routing Hints"

table_header
if have_file "render.yaml"; then
  row "Render config" "$(found "present")"
else
  row "Render config" "$(info "not detected")"
fi





if have_file "public/_headers"; then
  row "Headers file" "$(info "public/_headers present (possible CSP etc.)")"
fi

# ──────────────────────────────────────────────────────────────────────────────
# Summary & Guidance
section "Summary & Next Steps"

echo -e "Review the table(s) above. Items marked $WARN or $FAIL are your next moves. Focus first on:\n\n1. **RLS** (enable + policies per table)\n2. **Cloudflare WAF/rate limits**\n3. **Stripe webhooks** with idempotency\n4. **CI security** (CodeQL, Dependabot, OIDC deploys)\n5. **CSP & security headers** on Next.js\n" >> "$OUT"

echo -e "---\n\nGenerated by \`audit-saas.sh\`. This script is read-only and safe to commit to a tools/ folder if you want.\n" >> "$OUT"
