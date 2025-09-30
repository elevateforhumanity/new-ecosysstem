#!/usr/bin/env bash
set -euo pipefail

echo "▶ EFH Autopilot+Copilot bootstrap for Codespaces…"

# --- helpers ---
need_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "Installing $1…"; return 1; }; }
ensure_dir() { mkdir -p "$1"; }

ROOT_DIR="$(pwd)"

# --- Node 20 (required by your deps like react-router 7.x) ---
if [ -s "$HOME/.nvm/nvm.sh" ]; then . "$HOME/.nvm/nvm.sh"; fi
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -c2-3)" -lt 20 ]; then
  echo "Installing Node 20…"
  if command -v nvm >/dev/null 2>&1; then
    nvm install 20 >/dev/null
    nvm use 20 >/dev/null
  else
    echo "nvm not found; install nvm or use a Node 20 environment."
    exit 1
  fi
fi
echo "Node: $(node -v)"

# --- Global tools: PM2 + Wrangler ---
npm i -g pm2 wrangler >/dev/null 2>&1 || true
export PATH="$(npm bin -g):$PATH"
echo "PM2: $(pm2 -v || echo 'missing')"
echo "Wrangler: $(wrangler --version || echo 'missing')"

# --- Git identity + disable GPG signing (fix 'Author is invalid') ---
git config --global user.name "${GIT_USER_NAME:-Elizabeth L Greene}" || true
git config --global user.email "${GIT_USER_EMAIL:-topacesolutions@gmail.com}" || true
git config --global commit.gpgsign false || true
git config --global tag.gpgsign false || true

# --- Project folders ---
ensure_dir scripts
ensure_dir .github/workflows
ensure_dir infra
ensure_dir .devcontainer

# --- .gitignore hardening for local env files ---
if [ ! -f .gitignore ] || ! grep -qE '(^|/)\.env(\.local)?$' .gitignore; then
  {
    echo ".env"
    echo ".env.local"
    echo ".wrangler"
  } >> .gitignore
fi

# --- Autopilot ENV check script ---
cat > scripts/autopilot-env.sh <<'EOSH'
#!/usr/bin/env bash
set -euo pipefail
need() { test -n "${!1:-}" || { echo "Missing env: $1"; exit 1; }; }

# Required for Wrangler/Pages deploy
need CF_PAGES_PROJECT
# Optional but encouraged
: "${CF_ACCOUNT_ID:=}"
: "${CF_ZONE_NAME:=}"
: "${CF_API_TOKEN:=}"
if [ -n "${CF_API_TOKEN:-}" ]; then export CLOUDFLARE_API_TOKEN="$CF_API_TOKEN"; fi

echo "✔ Env: CF_PAGES_PROJECT=${CF_PAGES_PROJECT}"
[ -n "${CF_ACCOUNT_ID:-}" ] && echo "ℹ CF_ACCOUNT_ID=${CF_ACCOUNT_ID}"
[ -n "${CF_ZONE_NAME:-}" ] && echo "ℹ CF_ZONE_NAME=${CF_ZONE_NAME}"
EOSH
chmod +x scripts/autopilot-env.sh

# --- Autopilot guard (self-heal services) ---
cat > scripts/autopilot-guard.sh <<'EOSH'
#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
"$DIR/autopilot-env.sh" || true

# services you want PM2 to watch
SERVICES=(lms vizio marketing)

while true; do
  for svc in "${SERVICES[@]}"; do
    if ! pm2 status "$svc" | grep -q online; then
      echo "[$(date)] restarting $svc…"
      pm2 restart "$svc" || pm2 start "npm run $svc:start" --name "$svc" || true
    fi
  done
  sleep 15
done
EOSH
chmod +x scripts/autopilot-guard.sh

# --- PM2 ecosystem (edit ports/commands if your scripts differ) ---
cat > pm2.config.cjs <<'EOC'
/** PM2 config: adjust scripts to match package.json */
module.exports = {
  apps: [
    {
      name: "lms",
      script: "npm",
      args: "run lms:start",
      env: { PORT: "9200", NODE_ENV: "production" }
    },
    {
      name: "vizio",
      script: "npm",
      args: "run vizio:start",
      env: { PORT: "9300", NODE_ENV: "production" }
    },
    {
      name: "marketing",
      script: "npm",
      args: "run marketing:start",
      env: { PORT: "4100", NODE_ENV: "production" }
    }
  ]
};
EOC

# --- Cloudflare Pages GitHub Actions workflow ---
cat > .github/workflows/pages.yml <<'YAML'
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:
permissions:
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npm run build
      - name: Publish with Wrangler
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: pages deploy dist --project-name="${{ secrets.CF_PAGES_PROJECT }}"
YAML

# --- Optional: Terraform starter for Cloudflare ---
cat > infra/providers.tf <<'HCL'
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}
provider "cloudflare" {
  api_token = var.cf_api_token
}
HCL

cat > infra/variables.tf <<'HCL'
variable "cf_api_token" { type = string }
variable "zone_name"    { type = string }
HCL

cat > infra/main.tf <<'HCL'
data "cloudflare_zone" "zone" { name = var.zone_name }

resource "cloudflare_record" "www_cname" {
  zone_id = data.cloudflare_zone.zone.id
  name    = "www"
  type    = "CNAME"
  value   = "${cloudflare_pages_project.site.name}.pages.dev"
  proxied = true
}

resource "cloudflare_pages_project" "site" {
  account_id        = data.cloudflare_zone.zone.account_id
  name              = "efh-site"     # change to your actual project name
  production_branch = "main"
  build_config {
    build_command   = "npm run build"
    destination_dir = "dist"
  }
}
HCL

# --- Devcontainer to speed Codespaces ---
cat > .devcontainer/devcontainer.json <<'JSON'
{
  "name": "EFH Codespace",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/terraform:1": {}
  },
  "postCreateCommand": "npm i -g pm2 wrangler"
}
JSON

# --- Friendly summary & next steps ---
cat <<'MSG'

✅ Files created/updated:
- scripts/autopilot-env.sh
- scripts/autopilot-guard.sh
- pm2.config.cjs
- .github/workflows/pages.yml
- infra/{providers.tf,variables.tf,main.tf}
- .devcontainer/devcontainer.json
- .gitignore (ensures .env/.env.local ignored)

NEXT:
1) Export env for this shell (temporary) OR add Codespaces secrets:
   export CF_PAGES_PROJECT="your-pages-project"
   export CF_ACCOUNT_ID="accid"
   export CF_ZONE_NAME="elevateforhumanity.org"
   export CF_API_TOKEN="token"; export CLOUDFLARE_API_TOKEN="$CF_API_TOKEN"

2) Build & (optionally) deploy:
   npm ci
   npm run build
   wrangler whoami
   wrangler pages deploy dist --project-name "$CF_PAGES_PROJECT"

3) Start autopilot:
   pm2 start pm2.config.cjs --env production
   pm2 start scripts/autopilot-guard.sh --name autopilot-guard
   pm2 save
   pm2 status

4) Trigger CI:
   git add -A
   git commit --allow-empty -m "ci: Pages deploy"
   git push origin main

(For CI, add repo secrets: CF_API_TOKEN, CF_ACCOUNT_ID, CF_ZONE_NAME, CF_PAGES_PROJECT)

MSG
