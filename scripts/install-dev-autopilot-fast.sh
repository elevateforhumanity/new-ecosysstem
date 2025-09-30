#!/usr/bin/env bash
set -euo pipefail

say(){ printf "\n\033[1;36m🔹 %s\033[0m\n" "$*"; }
ok(){  printf "\033[1;32m✅ %s\033[0m\n" "$*"; }
warn(){ printf "\033[1;33m⚠️  %s\033[0m\n" "$*"; }

# Optimized detection
IS_GITPOD=${GITPOD_WORKSPACE_ID:+1}
IS_CODESPACES=${CODESPACES:+1}
PORT_VITE=${VITE_DEV_PORT:-8012}
PORT_PROXY=${PROXY_PORT:-9000}

say "Fast autopilot setup"
mkdir -p scripts .github/workflows public

# 1) Optimized proxy generation
say "Writing optimized proxy"
if grep -q '"type"[[:space:]]*:[[:space:]]*"module"' package.json 2>/dev/null; then
  cat > scripts/dev-proxy.js <<'JS'
import httpProxy from 'http-proxy'
import http from 'http'
const TARGET = `http://127.0.0.1:${process.env.VITE_DEV_PORT || 8012}`
const PORT = process.env.PROXY_PORT || 9000
const proxy = httpProxy.createProxyServer({ target: TARGET, ws: true, changeOrigin: true, timeout: 30000 })
proxy.on('proxyReq', (pReq) => pReq.setHeader('Host', 'localhost'))
proxy.on('error', (e, req, res) => { console.error(`❌ ${e.message}`); if (res && !res.headersSent) res.writeHead(502).end(`Proxy error: ${e.message}`) })
const server = http.createServer((req, res)=>proxy.web(req,res))
server.on('upgrade',(req,socket,head)=>proxy.ws(req,socket,head))
server.listen(PORT,'0.0.0.0',()=>console.log(`🚀 Proxy http://localhost:${PORT} → ${TARGET}`))
JS
else
  cat > scripts/dev-proxy.js <<'JS'
const httpProxy = require('http-proxy')
const http = require('http')
const TARGET = `http://127.0.0.1:${process.env.VITE_DEV_PORT || 8012}`
const PORT = process.env.PROXY_PORT || 9000
const proxy = httpProxy.createProxyServer({ target: TARGET, ws: true, changeOrigin: true, timeout: 30000 })
proxy.on('proxyReq', (pReq) => pReq.setHeader('Host', 'localhost'))
proxy.on('error', (e, req, res) => { console.error(`❌ ${e.message}`); if (res && !res.headersSent) res.writeHead(502).end(`Proxy error: ${e.message}`) })
const server = http.createServer((req, res)=>proxy.web(req,res))
server.on('upgrade',(req,socket,head)=>proxy.ws(req,socket,head))
server.listen(PORT,'0.0.0.0',()=>console.log(`🚀 Proxy http://localhost:${PORT} → ${TARGET}`))
JS
fi
ok "Fast proxy ready"

# 2) Optimized Vite start script
say "Writing optimized Vite start"
cat > scripts/dev-start.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
PORT="${VITE_DEV_PORT:-8012}"
ALLOWED=""

# Fast environment detection
if command -v gp >/dev/null 2>&1; then
  GP9000="$(gp url 9000 2>/dev/null || true)"; GP8012="$(gp url "$PORT" 2>/dev/null || true)"
  H9000="${GP9000#https://}"; H8012="${GP8012#https://}"
  H9000_D=${H9000//-/--}; H8012_D=${H8012//-/--}
  ALLOWED="${H9000},${H9000_D},${H8012},${H8012_D}"
elif [ -n "${CODESPACES:-}" ] && [ -n "${CODESPACE_NAME:-}" ]; then
  H9000="${CODESPACE_NAME}-${PROXY_PORT:-9000}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  H8012="${CODESPACE_NAME}-${PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  H9000_D=${H9000//-/--}; H8012_D=${H8012//-/--}
  ALLOWED="${H9000},${H9000_D},${H8012},${H8012_D}"
fi

export __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS="$(printf "%s" "$ALLOWED" | sed 's/^,*//;s/,*$//')"
echo "Allowed hosts → ${__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS:-<auto>}"
pkill -f vite || true
exec vite
SH
chmod +x scripts/dev-start.sh
ok "Optimized Vite start ready"

# 3) Lightweight plugins diagnostics
say "Writing fast plugins autopilot"
cat > scripts/plugins-diagnose.cjs <<'JS'
#!/usr/bin/env node
const { execSync } = require('node:child_process')
const { existsSync, readFileSync, writeFileSync } = require('node:fs')
const APPLY = process.argv.includes('--apply')
const sh = c => { try { return execSync(c, {stdio: 'pipe', encoding: 'utf8'}).trim() } catch { return '' } }

console.log('🔎 Fast plugins check')
if (APPLY) {
  // Fast dependency repair
  if (existsSync('package-lock.json')) {
    console.log('📦 Fast npm ci...')
    sh('npm ci --prefer-offline --no-audit --progress=false')
  } else {
    console.log('📦 Fast npm install...')
    sh('npm install --prefer-offline --no-audit --progress=false')
  }
  
  // Quick react plugin check
  const vc = ['vite.config.ts','vite.config.js'].find(existsSync)
  if (vc) {
    let s = readFileSync(vc, 'utf8')
    if (s.includes('@vitejs/plugin-react') && /plugins:\s*\[/.test(s) && !/plugins:\s*\[\s*react\(\)/.test(s)) {
      s = s.replace(/plugins:\s*\[(.*?)\]/s, (m, i) => {
        const a = i.split(',').map(x => x.trim()).filter(Boolean)
        const idx = a.findIndex(x => x.startsWith('react(') || x === 'react()')
        if (idx > 0) { const [r] = a.splice(idx, 1); a.unshift(r) }
        return `plugins: [${a.join(', ')}]`
      })
      writeFileSync(vc, s)
      console.log('🔧 Fixed React plugin order')
    }
  }
}
console.log('✅ Fast plugins check done')
JS
chmod +x scripts/plugins-diagnose.cjs
ok "Fast plugins autopilot ready"

# 4) Streamlined package.json update
say "Updating package.json (fast mode)"
if command -v jq >/dev/null 2>&1; then
  cp package.json package.json.bak
  jq '.scripts = (.scripts // {}) + {
        "dev":"bash scripts/dev-start.sh",
        "dev:proxy":"node scripts/dev-proxy.js", 
        "dev:all":"npm-run-all -p dev dev:proxy",
        "plugins:fix":"node scripts/plugins-diagnose.cjs --apply"
      }' package.json > package.tmp && mv package.tmp package.json
  ok "package.json updated (backup saved)"
else
  npm pkg set scripts.dev="bash scripts/dev-start.sh" 2>/dev/null || true
  npm pkg set scripts.dev:proxy="node scripts/dev-proxy.js" 2>/dev/null || true  
  npm pkg set scripts.dev:all="npm-run-all -p dev dev:proxy" 2>/dev/null || true
  npm pkg set scripts.plugins:fix="node scripts/plugins-diagnose.cjs --apply" 2>/dev/null || true
  ok "package.json scripts added"
fi

# 5) Fast dependency install (parallel)
say "Installing core dev deps (fast)"
npm i -D http-proxy npm-run-all @vitejs/plugin-react --prefer-offline --no-audit --progress=false >/dev/null 2>&1 || true

ok "⚡ Fast autopilot installed! Try: npm run dev:all"

# Performance tips
cat <<'TIPS'

🚀 Speed Tips:
- Use npm ci instead of npm install when possible
- Cache node_modules in CI with actions/cache@v4  
- Use --prefer-offline and --no-audit for faster installs
- Run npm run plugins:fix if build issues occur

TIPS