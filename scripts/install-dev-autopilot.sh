#!/usr/bin/env bash
set -euo pipefail

say(){ printf "\n\033[1;36m🔹 %s\033[0m\n" "$*"; }
ok(){  printf "\033[1;32m✅ %s\033[0m\n" "$*"; }
warn(){ printf "\033[1;33m⚠️  %s\033[0m\n" "$*"; }
err(){ printf "\033[1;31m❌ %s\033[0m\n" "$*"; }

# Detect environments
HAVE_GP=$(command -v gp >/dev/null 2>&1 && echo 1 || echo 0)
IS_GITPOD=${GITPOD_WORKSPACE_ID:+1}
IS_CODESPACES=${CODESPACES:+1}
PORT_VITE=${VITE_DEV_PORT:-8012}
PORT_PROXY=${PROXY_PORT:-9000}

say "Preparing folders"
mkdir -p scripts .github/workflows public

# 1) Dev proxy on :9000 → :8012 (ESM/CJS autodetect)
say "Writing proxy (auto ESM/CJS)"
if grep -q '"type"[[:space:]]*:[[:space:]]*"module"' package.json 2>/dev/null; then
  cat > scripts/dev-proxy.js <<'JS'
// ESM proxy (requires "type":"module")
import httpProxy from 'http-proxy'
import http from 'http'
const TARGET = 'http://127.0.0.1:8012'
const PORT = 9000
console.log(`🔄 Starting dev proxy on ${PORT} → ${TARGET}`)
const proxy = httpProxy.createProxyServer({ target: TARGET, ws: true, changeOrigin: true, timeout: 30000, proxyTimeout: 30000 })
proxy.on('proxyReq', (pReq, req) => { pReq.setHeader('Host', 'localhost'); console.log(`📡 ${req.method} ${req.url}`) })
proxy.on('proxyRes', (pRes, req) => console.log(`✅ ${pRes.statusCode} ${req.url}`))
proxy.on('error', (e, req, res) => { console.error(`❌ Proxy error: ${e.message}`); if (res && !res.headersSent){ res.writeHead(502,{'Content-Type':'text/plain'}); res.end(`Proxy error: ${e.message}\nTarget: ${TARGET}`) }})
const server = http.createServer((req, res)=>proxy.web(req,res))
server.on('upgrade',(req,socket,head)=>proxy.ws(req,socket,head))
server.listen(PORT,'0.0.0.0',()=>console.log(`🚀 Proxy http://localhost:${PORT} → ${TARGET}`))
JS
else
  cat > scripts/dev-proxy.js <<'JS'
// CJS proxy (works without "type":"module")
const httpProxy = require('http-proxy')
const http = require('http')
const TARGET = 'http://127.0.0.1:8012'
const PORT = 9000
console.log(`🔄 Starting dev proxy on ${PORT} → ${TARGET}`)
const proxy = httpProxy.createProxyServer({ target: TARGET, ws: true, changeOrigin: true, timeout: 30000, proxyTimeout: 30000 })
proxy.on('proxyReq', (pReq, req) => { pReq.setHeader('Host', 'localhost'); console.log(`📡 ${req.method} ${req.url}`) })
proxy.on('proxyRes', (pRes, req) => console.log(`✅ ${pRes.statusCode} ${req.url}`))
proxy.on('error', (e, req, res) => { console.error(`❌ Proxy error: ${e.message}`); if (res && !res.headersSent){ res.writeHead(502,{'Content-Type':'text/plain'}); res.end(`Proxy error: ${e.message}\nTarget: ${TARGET}`) }})
const server = http.createServer((req, res)=>proxy.web(req,res))
server.on('upgrade',(req,socket,head)=>proxy.ws(req,socket,head))
server.listen(PORT,'0.0.0.0',()=>console.log(`🚀 Proxy http://localhost:${PORT} → ${TARGET}`))
JS
fi
ok "Proxy ready: scripts/dev-proxy.js"

# 2) Vite start script with Gitpod/Codespaces host auto-allow
say "Writing dynamic Vite start"
cat > scripts/dev-start.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
PORT="${VITE_DEV_PORT:-8012}"
ALLOWED=""

if command -v gp >/dev/null 2>&1; then
  GP9000="$(gp url 9000 2>/dev/null || true)"; GP8012="$(gp url "$PORT" 2>/dev/null || true)"
  H9000="${GP9000#https://}"; H8012="${GP8012#https://}"
  H9000_D="${H9000//-\ /}"; H9000_D="${H9000_D//- /}"; H9000_D="${H9000//- /}" # placeholder no-op
  H9000_D="${H9000//- /}" # compat
  H9000_D="${H9000//- /}" # ensure no dash double — legacy placeholder
  H9000_D=${H9000//-/--}; H8012_D=${H8012//-/--}
  ALLOWED="${H9000},${H9000_D},${H8012},${H8012_D}"
elif [ -n "${CODESPACES:-}" ] && [ -n "${CODESPACE_NAME:-}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
  # Codespaces URLs: https://<name>-<port>.<domain>
  H9000="${CODESPACE_NAME}-${PROXY_PORT:-9000}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  H8012="${CODESPACE_NAME}-${PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  H9000_D=${H9000//-/--}; H8012_D=${H8012//-/--}
  ALLOWED="${H9000},${H9000_D},${H8012},${H8012_D}"
fi

export __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS="$(printf "%s" "$ALLOWED" | sed 's/^,*//;s/,*$//')"
echo "Allowed hosts → ${__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS:-<none>}"
pkill -f vite || true
vite
SH
chmod +x scripts/dev-start.sh
ok "Vite start ready: scripts/dev-start.sh"

# 3) Host watchdog (Gitpod/Codespaces) — optional background helper
say "Writing host watchdog"
cat > scripts/host-watchdog.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
PORT="${VITE_DEV_PORT:-8012}"
while true; do
  NEW=""
  if command -v gp >/dev/null 2>&1; then
    GP9000="$(gp url 9000 2>/dev/null || true)"; GP8012="$(gp url "$PORT" 2>/dev/null || true)"
    H9000="${GP9000#https://}"; H8012="${GP8012#https://}"
    H9000_D=${H9000//-/--}; H8012_D=${H8012//-/--}
    NEW="$H9000,$H9000_D,$H8012,$H8012_D"
  elif [ -n "${CODESPACES:-}" ] && [ -n "${CODESPACE_NAME:-}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
    H9000="${CODESPACE_NAME}-${PROXY_PORT:-9000}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    H8012="${CODESPACE_NAME}-${PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    H9000_D=${H9000//-/--}; H8012_D=${H8012//-/--}
    NEW="$H9000,$H9000_D,$H8012,$H8012_D"
  fi
  OLD="$(cat /tmp/allowed-hosts 2>/dev/null || echo '')"
  if [ -n "$NEW" ] && [ "$NEW" != "$OLD" ]; then
    echo "$NEW" > /tmp/allowed-hosts
    echo "🔄 Host changed → $NEW ; restarting Vite…"
    pkill -f vite || true
    __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS="$NEW" vite >/tmp/vite.log 2>&1 &
  fi
  sleep 15
done
SH
chmod +x scripts/host-watchdog.sh
ok "Watchdog ready: scripts/host-watchdog.sh"

# 4) Plugins Autopilot + Nuke
say "Writing plugins autopilot"
cat > scripts/plugins-diagnose.cjs <<'JS'
#!/usr/bin/env node
const { execSync } = require('node:child_process')
const { existsSync, readFileSync, writeFileSync } = require('node:fs')
const APPLY = process.argv.includes('--apply') || process.argv.includes('--guard')
const sh = (c)=>{ try{ return execSync(c,{stdio:'pipe',encoding:'utf8'}).trim() }catch(e){ return (e.stdout||'').toString().trim() } }
const have=(m)=>{ try{ require.resolve(m,{paths:[process.cwd()]}); return true } catch{ return false } }
console.log('🔎 Plugins Autopilot start')
sh('npm config set save-exact true')
const ls = sh('npm ls --depth=0 --json || true'); if (ls.includes('"missing": true') || ls.includes('extraneous') || ls.includes('invalid')) console.log('⚠️  Tree inconsistent')
if (APPLY) { if (existsSync('package-lock.json')) console.log(sh('npm ci --prefer-offline || npm ci')); else console.log(sh('npm install --prefer-offline || npm install')) } else console.log('ℹ️  Would repair deps (npm ci/install)')
if (have('esbuild') && APPLY) console.log(sh('npm rebuild esbuild || (npm remove esbuild && npm add -D esbuild)'))
if (APPLY) console.log(sh('npm install --legacy-peer-deps --no-audit || true'))
const vc = ['vite.config.ts','vite.config.js'].find(existsSync); if (vc) { let s=readFileSync(vc,'utf8'); if (s.includes('@vitejs/plugin-react') && /plugins:\s*\[/.test(s) && !/plugins:\s*\[\s*react\(\)/.test(s)){ s=s.replace(/plugins:\s*\[(.*?)\]/s,(m,i)=>{const a=i.split(',').map(x=>x.trim()).filter(Boolean);const idx=a.findIndex(x=>x.startsWith('react(')||x==='react()'); if(idx>0){const [r]=a.splice(idx,1);a.unshift(r)} return `plugins: [${a.join(', ')}]`}); writeFileSync(vc,s) } }
if (APPLY){ sh('pkill -f vite || true'); sh('npm run dev >/tmp/vite.log 2>&1 &') }
console.log('✅ Plugins Autopilot done')
JS
chmod +x scripts/plugins-diagnose.cjs

cat > scripts/plugins-nuke.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
echo "💣 Nuke caches & rebuild deps"
pkill -f vite || true
rm -rf node_modules .vite .turbo dist npm-cache || true
npm cache verify || true
npm cache clean --force || true
if [ -f package-lock.json ]; then npm ci; else npm install; fi
npm rebuild esbuild || true
echo "🚀 Start dev"
npm run dev >/tmp/vite.log 2>&1 &
SH
chmod +x scripts/plugins-nuke.sh
ok "Plugins autopilot ready"

# 5) CI health (non-destructive)
say "Writing CI health scripts/workflow"
cat > scripts/ci-health.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
API_PORT="${API_PORT:-4400}"; VITE_PORT="${VITE_DEV_PORT:-8012}"; PROXY_PORT="${PROXY_PORT:-9000}"
ROOT_PATH="${ROOT_CHECK_PATH:-/}"; API_PATH="${API_CHECK_PATH:-/api/courses}"
curl_retry(){ local u="$1" code="$2" t=30; for i in $(seq 1 $t); do c=$(curl -fsS -o /dev/null -w "%{http_code}" "$u" || true); [ "$c" = "$code" ] && { echo "✅ $u → $c"; return 0; } ; echo "…($i/$t) $u → $c"; sleep 1; done; echo "❌ $u ! $code"; return 1; }
(node server.js &) >/dev/null 2>&1 || true
(vite --host 0.0.0.0 --port "$VITE_PORT" &) >/dev/null 2>&1 || true
(node scripts/dev-proxy.js &) >/dev/null 2>&1 || true
sleep 3
curl_retry "http://localhost:${API_PORT}/health" 200
curl_retry "http://localhost:${API_PORT}${API_PATH}" 200
curl_retry "http://localhost:${VITE_PORT}${ROOT_PATH}" 200
curl_retry "http://localhost:${VITE_PORT}${API_PATH}" 200
curl_retry "http://localhost:${PROXY_PORT}${ROOT_PATH}" 200
curl_retry "http://localhost:${PROXY_PORT}${API_PATH}" 200
echo "🎉 CI health passed"
SH
chmod +x scripts/ci-health.sh

if [ ! -f .github/workflows/preview-health.yml ]; then
cat > .github/workflows/preview-health.yml <<'YML'
name: Preview Health (Port 9000)
on:
  pull_request:
  push:
    branches: [ main ]
jobs:
  health:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18, cache: npm }
      - run: npm ci || npm install
      - run: npm i -D http-proxy
      - name: Run health checks
        env:
          API_PORT: 4400
          VITE_DEV_PORT: 8012
          PROXY_PORT: 9000
          ROOT_CHECK_PATH: /
          API_CHECK_PATH: /api/courses
        run: |
          nohup node server.js >/dev/null 2>&1 &  || true
          nohup vite --host 0.0.0.0 --port $VITE_DEV_PORT >/dev/null 2>&1 &  || true
          nohup node scripts/dev-proxy.js >/dev/null 2>&1 &  || true
          ./scripts/ci-health.sh
YML
ok "CI workflow added: .github/workflows/preview-health.yml"
else
  warn "CI workflow exists: .github/workflows/preview-health.yml (skipped)"
fi

# 6) Optional Gitpod config (do not overwrite if present)
if [ ! -f .gitpod.yml ]; then
  say "Writing .gitpod.yml"
  cat > .gitpod.yml <<'YML'
workspaceClass: large
ports:
  - port: 9000
    visibility: public
    onOpen: open-preview
  - port: 8012
    visibility: private
    onOpen: ignore
  - port: 4400
    visibility: private
    onOpen: ignore
tasks:
  - name: Setup & Start
    init: |
      corepack enable || true
      corepack prepare pnpm@9.7.0 --activate || true
      pnpm install --frozen-lockfile || pnpm install || npm ci || npm install
      npm i -g pm2 || true
      chmod +x scripts/dev-start.sh || true
      chmod +x scripts/host-watchdog.sh || true
    command: |
      gp ports visibility 9000 public || true
      gp ports visibility 8012 private || true
      pm2 start ecosystem.config.cjs --only api || pm2 start server.js --name api || true
      pm2 start --name host-watchdog bash -- -c "bash scripts/host-watchdog.sh" || true
      pm2 save || true
      npm run dev:all
YML
  ok ".gitpod.yml created"
else
  warn ".gitpod.yml exists (skipped)"
fi

# 7) Vite config (create if missing; do not overwrite)
say "Ensuring vite.config.*"
if [ ! -f vite.config.ts ] && [ ! -f vite.config.js ]; then
  cat > vite.config.ts <<'TS'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_DEV_PORT || 8012),
    strictPort: true,
    cors: true,
    proxy: {
      '/api':   { target: 'http://127.0.0.1:4400', changeOrigin: true, secure: false, ws: true },
      '/health':{ target: 'http://127.0.0.1:4400', changeOrigin: true, secure: false }
    }
  },
  preview: { host: '0.0.0.0', port: 4173 }
})
TS
  ok "vite.config.ts created"
else
  warn "vite.config.* exists; not modified"
fi

# 8) Do NOT overwrite existing public/_redirects (Cloudflare Pages config already present)
if [ -f public/_redirects ]; then
  warn "public/_redirects exists (Cloudflare Pages) — not overwriting"
else
  cat > public/_redirects <<'R'
/*         /index.html  200
R
  ok "public/_redirects created (SPA fallback)"
fi

# 9) package.json scripts (safe augment)
say "Updating package.json (scripts)"
if command -v jq >/dev/null 2>&1; then
  cp package.json package.json.bak
  jq '.scripts = (.scripts // {}) + {
        "dev":"bash scripts/dev-start.sh",
        "dev:proxy":"node scripts/dev-proxy.js",
        "dev:all":"npm-run-all -p dev dev:proxy",
        "plugins:fix":"node scripts/plugins-diagnose.cjs --apply",
        "plugins:nuke":"bash scripts/plugins-nuke.sh"
      }' package.json > package.tmp && mv package.tmp package.json
  ok "package.json updated (backup: package.json.bak)"
else
  warn "jq not found — set scripts via npm"
  npm pkg set scripts.dev="bash scripts/dev-start.sh" || true
  npm pkg set scripts.dev:proxy="node scripts/dev-proxy.js" || true
  npm pkg set scripts.dev:all="npm-run-all -p dev dev:proxy" || true
  npm pkg set scripts.plugins:fix="node scripts/plugins-diagnose.cjs --apply" || true
  npm pkg set scripts.plugins:nuke="bash scripts/plugins-nuke.sh" || true
fi

say "Ensuring dev deps"
npm i -D http-proxy npm-run-all @vitejs/plugin-react >/dev/null 2>&1 || true

ok "All autopilots installed. Try: npm run dev:all"
