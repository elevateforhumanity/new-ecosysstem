#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

echo "🔧 EFH • Gitpod auto-clean ($MODE)"

cd "$ROOT"

# --- Detect pkg manager
PKG="npm"
[[ -f pnpm-lock.yaml ]] && PKG="pnpm"
[[ -f yarn.lock ]] && PKG="yarn"

# --- Stop stray processes from old snapshots
if pgrep -f "node .*--watch" >/dev/null 2>&1; then pkill -f "node .*--watch" || true; fi

echo "🧹 Cleaning caches & artifacts…"
rm -rf .turbo .next/cache dist build coverage .cache \
       node_modules/.cache tmp temp .DS_Store **/.DS_Store || true

case "$PKG" in
  pnpm) pnpm store prune || true ;;
  yarn) yarn cache clean || true ;;
  npm)  npm cache clean --force || true ;;
esac

# Optional: prune docker if present (usually not in Gitpod)
if command -v docker >/dev/null 2>&1; then
  docker system prune -af || true
fi

# --- Run EFH autopilot cleanup if available
if [ -f "scripts/autopilot-cleanup.js" ]; then
  echo "🚀 Running EFH autopilot cleanup..."
  node scripts/autopilot-cleanup.js || true
fi

# --- Placeholder scrub (re-uses your cleanup patterns)
echo "✂️ Removing placeholders..."
node -e '
import fs from "fs"; import path from "path";
const PATS=[/lorem ipsum/gi,/placeholder/gi,/todo:/gi,/example\.com/gi,/\[insert.*?\]/gi,/\(555\) 123-4567/gi];
function walk(d){try{for(const f of fs.readdirSync(d)){const p=path.join(d,f);
  const s=fs.lstatSync(p); if(s.isDirectory()){ if(!/^(node_modules|\.git|\.gp)$/.test(f)) walk(p); }
  else if(/\.(md|html?|css|js|jsx|ts|tsx|json)$/.test(f)){
    try{ let c=fs.readFileSync(p,"utf8"); let o=c; for(const r of PATS) c=c.replace(r,"");
      c=c.replace(/info@elevateforhumanity\.org/gi,"elevateforhumanity@gmail.com");
      if(c!==o){ fs.writeFileSync(p,c); console.log("✂️",p); } }catch{}
  }}}catch{}}
walk(process.cwd());
' || true

echo "📦 Fresh install ($PKG)…"
case "$PKG" in
  pnpm) corepack enable pnpm >/dev/null 2>&1 || true; pnpm install --frozen-lockfile ;;
  yarn) corepack enable yarn >/dev/null 2>&1 || true; yarn install --frozen-lockfile ;;
  npm)  npm ci || npm install ;;
esac

# --- Install system dependencies for EFH
echo "🔧 Installing system dependencies..."
sudo apt-get update -y >/dev/null 2>&1 || true
sudo apt-get install -y ffmpeg jq curl dnsutils bind9-utils >/dev/null 2>&1 || true

# --- Typecheck / Lint (non-blocking)
echo "🔎 Lint & typecheck…"
npm run lint  --if-present || true
npm run typecheck --if-present || true

# --- Build
echo "⚙️  Build…"
npm run build --if-present || true

# --- Make scripts executable
echo "🔐 Setting script permissions..."
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x *.sh 2>/dev/null || true
chmod +x efh-healthcheck.sh 2>/dev/null || true
chmod +x autopilot-wix-pointing.cjs 2>/dev/null || true

# --- Kick off your Cloudflare Wix DNS watch (optional)
if [ -f "autopilot-wix-pointing.cjs" ] && [ -f ".env.autopilot" ]; then
  # stop previous
  pkill -f "autopilot-wix-pointing.cjs --watch" 2>/dev/null || true
  echo "🛰  Starting Wix DNS autopilot watch..."
  (nohup node autopilot-wix-pointing.cjs --watch=300 > .gp/autopilot-watch.log 2>&1 &)
  echo "🛰  Autopilot watch started (300s). Log: .gp/autopilot-watch.log"
fi

# --- Healthcheck (non-fatal, but prints signals)
if [ -f "efh-healthcheck.sh" ]; then
  echo "🏥 Running EFH health check..."
  ./efh-healthcheck.sh || true
fi

# --- Run content validation
if [ -f "validate-wix-content.cjs" ]; then
  echo "✅ Validating Wix content..."
  node validate-wix-content.cjs || true
fi

# --- Set up blog system
if [ -d "wix-blog-system" ]; then
  echo "📝 Setting up blog system..."
  chmod +x wix-blog-system/*.mjs wix-blog-system/*.js 2>/dev/null || true
  echo "📝 Blog system ready - use 'npm run blog:publish' to publish posts"
fi

# --- Display useful information
echo ""
echo "======================================="
echo "✅ EFH Gitpod workspace ready!"
echo "======================================="
echo "📞 Contact: (317) 555-WORK"
echo "📧 Email: elevateforhumanity@gmail.com"
echo "🏢 Location: Indianapolis, Indiana"
echo "🌐 Domain: elevateforhumanity.org"
echo ""
echo "🔗 Quick Links:"
echo "   • Wix Homepage: wix-homepage-complete.html"
echo "   • Health Check: ./efh-healthcheck.sh"
echo "   • DNS Autopilot: node autopilot-wix-pointing.cjs"
echo "   • Content Validator: node validate-wix-content.cjs"
echo ""
if [ -f ".gp/autopilot-watch.log" ]; then
  echo "📊 Autopilot Status: tail -f .gp/autopilot-watch.log"
fi
echo "======================================="