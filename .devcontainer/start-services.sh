#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# CODESPACES SERVICE STARTUP SCRIPT
# ===================================================================
# Automatically starts all ecosystem services on container start
# ===================================================================

echo "🚀 Starting Ecosystem Services..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}→${NC} $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }
warn() { echo -e "${YELLOW}⚠️${NC} $*"; }
error() { echo -e "${RED}❌${NC} $*"; }

# Ensure we're using pnpm
log "Setting up package manager..."
corepack enable || true
corepack prepare pnpm@9.7.0 --activate || true

# Navigate to main ecosystem
cd /workspaces/new-ecosysstem

# Clean up any conflicting lockfiles
log "Cleaning up package manager conflicts..."
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    log "Removed npm lockfile to use pnpm"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    log "Installing dependencies..."
    pnpm install --frozen-lockfile || pnpm install
fi

# Start autopilot service in background
log "Starting autopilot service..."
if [ -f "scripts/autopilot.sh" ]; then
    chmod +x scripts/autopilot.sh scripts/dev-8012.sh scripts/watchdog.sh scripts/healthcheck.sh 2>/dev/null || true
    nohup bash scripts/autopilot.sh > /tmp/autopilot.log 2>&1 &
    success "Autopilot service started"
else
    warn "Autopilot scripts not found, skipping"
fi

# Create ecosystem status endpoint
log "Creating ecosystem status endpoint..."
cat > /tmp/ecosystem-status.json << EOF
{
  "ecosystem": "Elevate for Humanity",
  "status": "running",
  "services": {
    "main": {
      "port": 8080,
      "status": "starting"
    },
    "autopilot": {
      "port": 8012,
      "status": "running"
    }
  },
  "repositories": [
    {
      "name": "new-ecosysstem",
      "path": "/workspaces/new-ecosysstem",
      "status": "active"
    }
  ],
  "last_updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# Setup VS Code workspace for multi-repo
log "Configuring VS Code workspace..."
cat > /workspaces/ecosystem.code-workspace << EOF
{
  "folders": [
    {
      "name": "🎯 Main Ecosystem",
      "path": "./new-ecosysstem"
    }
  ],
  "settings": {
    "git.defaultCloneDirectory": "/workspaces",
    "terminal.integrated.cwd": "/workspaces/new-ecosysstem",
    "npm.packageManager": "pnpm",
    "typescript.preferences.includePackageJsonAutoImports": "auto"
  },
  "extensions": {
    "recommendations": [
      "esbenp.prettier-vscode",
      "ms-vscode.vscode-typescript-next",
      "GitHub.copilot",
      "GitHub.copilot-chat"
    ]
  }
}
EOF

# Create quick access script
log "Creating quick access commands..."
cat > /workspaces/quick-start.sh << 'EOF'
#!/usr/bin/env bash
echo "🎯 Elevate for Humanity Ecosystem"
echo "================================"
echo ""
echo "📁 Available repositories:"
ls -la /workspaces/ | grep "^d" | grep -v "\.$" | awk '{print "   " $9}'
echo ""
echo "🚀 Quick commands:"
echo "   cd /workspaces/new-ecosysstem  # Main ecosystem"
echo "   pnpm dev                       # Start development server"
echo "   pnpm build                     # Build for production"
echo "   ecosystem status               # Check service status"
echo ""
echo "🌐 Ports:"
echo "   8080 - Main site"
echo "   8012 - Autopilot service"
echo "   3000 - Development server"
echo ""
EOF

chmod +x /workspaces/quick-start.sh

# Add to shell profile
echo "alias quickstart='/workspaces/quick-start.sh'" >> ~/.bashrc
echo "alias ecosystem='bash /workspaces/manage-ecosystem.sh'" >> ~/.bashrc

success "Services startup complete!"
echo ""
echo "🎯 Ecosystem is ready!"
echo "Run 'quickstart' for available commands"
echo "Run 'ecosystem status' to check services"
echo ""