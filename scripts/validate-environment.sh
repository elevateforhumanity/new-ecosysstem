#!/usr/bin/env bash
set -euo pipefail

# Enhanced environment validation for dev autopilot
# Supports Codespaces, Gitpod, and local development

say(){ printf "\n\033[1;36m🔹 %s\033[0m\n" "$*"; }
ok(){  printf "\033[1;32m✅ %s\033[0m\n" "$*"; }
warn(){ printf "\033[1;33m⚠️  %s\033[0m\n" "$*"; }
err(){ printf "\033[1;31m❌ %s\033[0m\n" "$*"; }

say "Environment Validation"

# Detect environment
IS_CODESPACES=${CODESPACES:-false}
IS_GITPOD=${GITPOD_WORKSPACE_ID:+true}
IS_GITPOD=${IS_GITPOD:-false}
IS_LOCAL=$([[ "$IS_CODESPACES" == "false" && "$IS_GITPOD" == "false" ]] && echo true || echo false)

echo "Environment: Codespaces=$IS_CODESPACES, Gitpod=$IS_GITPOD, Local=$IS_LOCAL"

# Node version check
NODE_VERSION=$(node --version)
if [[ "$NODE_VERSION" =~ ^v18\. ]]; then
  ok "Node version: $NODE_VERSION"
else
  warn "Node version: $NODE_VERSION (recommended: 18.x)"
fi

# NPM version
NPM_VERSION=$(npm --version)
ok "NPM version: $NPM_VERSION"

# Package manager check
if [[ -f package-lock.json ]]; then
  ok "Package manager: npm (lockfile present)"
elif [[ -f yarn.lock ]]; then
  warn "Package manager: yarn (consider using npm for consistency)"
elif [[ -f pnpm-lock.yaml ]]; then
  warn "Package manager: pnpm (consider using npm for consistency)"
else
  warn "No lockfile found (run npm install to generate)"
fi

# Dependencies check
if [[ -d node_modules ]]; then
  ok "Dependencies: node_modules present"
else
  warn "Dependencies: node_modules missing (run npm install)"
fi

# Required files check
REQUIRED_FILES=(
  "package.json"
  "src/main.jsx"
  "src/App.jsx"
  "index.html"
  "vite.config.ts"
  "tailwind.config.js"
  "postcss.config.js"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$file" ]]; then
    ok "Required file: $file"
  else
    err "Missing file: $file"
  fi
done

# Scripts check
REQUIRED_SCRIPTS=(
  "scripts/dev-proxy.js"
  "scripts/dev-start.sh"
  "scripts/plugins-diagnose.cjs"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
  if [[ -f "$script" ]]; then
    ok "Autopilot script: $script"
  else
    warn "Missing autopilot script: $script"
  fi
done

# Port availability check
check_port() {
  local port=$1
  local name=$2
  if command -v lsof >/dev/null 2>&1; then
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
      warn "Port $port ($name): in use"
    else
      ok "Port $port ($name): available"
    fi
  else
    warn "Port $port ($name): cannot check (lsof not available)"
  fi
}

check_port 8012 "Vite dev server"
check_port 9000 "Dev proxy"
check_port 4400 "API server"

# Environment-specific checks
if [[ "$IS_CODESPACES" == "true" ]]; then
  ok "Codespaces: Port forwarding configured automatically"
  if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
    CODESPACES_8012="https://${CODESPACE_NAME}-8012.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    CODESPACES_9000="https://${CODESPACE_NAME}-9000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    ok "Codespaces URLs: $CODESPACES_8012 (dev), $CODESPACES_9000 (proxy)"
  fi
elif [[ "$IS_GITPOD" == "true" ]]; then
  ok "Gitpod: Workspace detected"
  if command -v gp >/dev/null 2>&1; then
    GP_8012=$(gp url 8012 2>/dev/null || echo "")
    GP_9000=$(gp url 9000 2>/dev/null || echo "")
    [[ -n "$GP_8012" ]] && ok "Gitpod dev URL: $GP_8012"
    [[ -n "$GP_9000" ]] && ok "Gitpod proxy URL: $GP_9000"
  else
    warn "Gitpod CLI not available"
  fi
else
  ok "Local development: Use localhost:8012 (dev), localhost:9000 (proxy)"
fi

# Build test
say "Testing build"
if npm run build >/tmp/build.log 2>&1; then
  ok "Build: successful"
else
  err "Build: failed (see /tmp/build.log)"
  tail -n 10 /tmp/build.log
fi

# Final recommendations
say "Recommendations"
echo "• Start development: npm run dev:all"
echo "• Direct dev server: npm run dev (port 8012)"
echo "• Proxy server: npm run dev:proxy (port 9000 → 8012)"
echo "• Fix plugins: npm run plugins:fix"
echo "• Nuclear reset: npm run plugins:nuke"

if [[ "$IS_CODESPACES" == "true" ]]; then
  echo "• Codespaces: Use forwarded ports in Ports tab"
elif [[ "$IS_GITPOD" == "true" ]]; then
  echo "• Gitpod: Share URL from 'gp url 9000'"
else
  echo "• Local: Access http://localhost:9000/"
fi

ok "Environment validation complete"