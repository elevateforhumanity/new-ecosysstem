#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# CODESPACES ECOSYSTEM SETUP SCRIPT
# ===================================================================
# Automatically sets up the complete multi-repository ecosystem
# ===================================================================

echo "🚀 Setting up Codespaces Ecosystem..."
echo "===================================="

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

# Install global tools
log "Installing global development tools..."
npm install -g pnpm@9.7.0 http-server concurrently pm2 || true
corepack enable || true
corepack prepare pnpm@9.7.0 --activate || true

# Setup workspace structure
log "Setting up workspace structure..."
cd /workspaces

# Install dependencies for main ecosystem
if [ -d "new-ecosysstem" ]; then
    log "Installing dependencies for main ecosystem..."
    cd new-ecosysstem
    pnpm install --frozen-lockfile || pnpm install || npm install
    cd ..
fi

# Create ecosystem configuration
log "Creating ecosystem configuration..."
cat > /workspaces/ecosystem-config.json << 'EOF'
{
  "ecosystem": {
    "name": "Elevate for Humanity Ecosystem",
    "repositories": [
      {
        "name": "new-ecosysstem",
        "type": "main",
        "port": 8080,
        "dev_port": 8012,
        "path": "/workspaces/new-ecosysstem",
        "start_command": "pnpm dev",
        "build_command": "pnpm build"
      }
    ],
    "services": {
      "main": {
        "port": 8080,
        "health_check": "/health"
      },
      "autopilot": {
        "port": 8012,
        "health_check": "/"
      }
    }
  }
}
EOF

# Create multi-repository management script
log "Creating multi-repository management script..."
cat > /workspaces/manage-ecosystem.sh << 'EOF'
#!/usr/bin/env bash
set -euo pipefail

COMMAND=${1:-help}

case $COMMAND in
  "clone")
    echo "🔄 Cloning additional repositories..."
    # Add your repository URLs here
    # git clone https://github.com/elevateforhumanity/repo-name
    ;;
  "install")
    echo "📦 Installing dependencies across ecosystem..."
    for dir in /workspaces/*/; do
      if [ -f "$dir/package.json" ]; then
        echo "Installing in $(basename "$dir")..."
        cd "$dir" && (pnpm install || npm install) && cd ..
      fi
    done
    ;;
  "start")
    echo "🚀 Starting all services..."
    pm2 start ecosystem.config.js || echo "PM2 config not found, starting manually..."
    ;;
  "stop")
    echo "🛑 Stopping all services..."
    pm2 stop all || true
    ;;
  "status")
    echo "📊 Ecosystem status..."
    pm2 status || echo "PM2 not running"
    ;;
  "help"|*)
    echo "Ecosystem Management Commands:"
    echo "  clone   - Clone additional repositories"
    echo "  install - Install dependencies across all repos"
    echo "  start   - Start all services"
    echo "  stop    - Stop all services"
    echo "  status  - Show service status"
    ;;
esac
EOF

chmod +x /workspaces/manage-ecosystem.sh

# Create PM2 ecosystem configuration
log "Creating PM2 ecosystem configuration..."
cat > /workspaces/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'main-ecosystem',
      cwd: '/workspaces/new-ecosysstem',
      script: 'pnpm',
      args: 'dev',
      env: {
        NODE_ENV: 'development',
        PORT: 8012
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOF

# Setup GitHub CLI for multi-repo management
log "Configuring GitHub CLI..."
if command -v gh &> /dev/null; then
    gh config set git_protocol https
    gh config set editor code
fi

# Create workspace shortcuts
log "Creating workspace shortcuts..."
cat > /workspaces/.bashrc_ecosystem << 'EOF'
# Ecosystem shortcuts
alias ecosystem='bash /workspaces/manage-ecosystem.sh'
alias repos='ls -la /workspaces/'
alias main='cd /workspaces/new-ecosysstem'
alias logs='pm2 logs'
alias restart='pm2 restart all'

# Quick navigation
export ECOSYSTEM_ROOT="/workspaces"
export MAIN_REPO="/workspaces/new-ecosysstem"

# Add to PATH
export PATH="$PATH:/workspaces/new-ecosysstem/scripts"

echo "🎯 Ecosystem shortcuts loaded!"
echo "Commands: ecosystem, repos, main, logs, restart"
EOF

# Source the shortcuts
echo "source /workspaces/.bashrc_ecosystem" >> ~/.bashrc

success "Ecosystem setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'ecosystem clone' to add more repositories"
echo "2. Run 'ecosystem install' to install all dependencies"
echo "3. Run 'ecosystem start' to start all services"
echo "4. Use 'ecosystem status' to monitor services"
echo ""
echo "🔧 Available commands:"
echo "- ecosystem: Manage the entire ecosystem"
echo "- repos: List all repositories"
echo "- main: Navigate to main repository"
echo ""