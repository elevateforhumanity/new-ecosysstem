#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# AUTOPILOT VITE HOST FIXER
# ===================================================================
# Automatically fixes Vite allowedHosts configuration for Gitpod/Codespaces
# ===================================================================

echo "🔧 Autopilot: Fixing Vite host configuration..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}→${NC} $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }

# Get current Gitpod/Codespaces URL
CURRENT_HOST=""
if [ -n "${GITPOD_WORKSPACE_URL:-}" ]; then
    # Extract host from Gitpod URL
    CURRENT_HOST=$(echo "$GITPOD_WORKSPACE_URL" | sed 's|https://||' | sed 's|/.*||')
    CURRENT_HOST="8012-$CURRENT_HOST"
elif [ -n "${CODESPACE_NAME:-}" ]; then
    # Codespaces format
    CURRENT_HOST="8012-$CODESPACE_NAME-$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN"
fi

log "Detected environment host: $CURRENT_HOST"

# Update vite.config.js with current host
if [ -f "vite.config.js" ]; then
    log "Updating vite.config.js with current host..."
    
    # Create backup
    cp vite.config.js vite.config.js.backup
    
    # Check if allowedHosts already exists
    if grep -q "allowedHosts" vite.config.js; then
        log "allowedHosts already configured, adding current host..."
        
        # Add current host to existing allowedHosts array
        if [ -n "$CURRENT_HOST" ]; then
            sed -i "/allowedHosts: \[/,/\]/s/\]/      '$CURRENT_HOST'\n    ]/" vite.config.js
        fi
    else
        log "Adding allowedHosts configuration..."
        
        # Add allowedHosts to server config
        sed -i '/server: {/,/},/c\
  server: {\
    host: '\''0.0.0.0'\'',\
    port: 8012,\
    strictPort: true,\
    allowedHosts: [\
      '\''localhost'\'',\
      '\''127.0.0.1'\'',\
      '\''0.0.0.0'\'',\
      '\''.gitpod.dev'\'',\
      '\''.gitpod.io'\'',\
      '\''.github.dev'\'',\
      '\''.codespaces.dev'\'''"$([ -n "$CURRENT_HOST" ] && echo ",\\
      '$CURRENT_HOST'")"'\
    ]\
  },' vite.config.js
    fi
    
    success "Vite configuration updated"
else
    log "vite.config.js not found, creating basic configuration..."
    
    cat > vite.config.js << EOF
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 8012,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '.gitpod.dev',
      '.gitpod.io',
      '.github.dev',
      '.codespaces.dev'$([ -n "$CURRENT_HOST" ] && echo ",
      '$CURRENT_HOST'")
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
EOF
    
    success "Created vite.config.js with host configuration"
fi

# Restart Vite dev server
log "Restarting Vite dev server..."

# Kill existing Vite processes
pkill -f "vite" 2>/dev/null || true
sleep 2

# Start Vite in background
nohup pnpm dev > /tmp/vite-dev.log 2>&1 &
VITE_PID=$!

log "Vite dev server started with PID $VITE_PID"

# Wait for server to start
sleep 5

# Test the server
if curl -s -f "http://localhost:8012" > /dev/null 2>&1; then
    success "Vite dev server is running successfully"
    
    if [ -n "$CURRENT_HOST" ]; then
        success "Server should now be accessible at: https://$CURRENT_HOST"
    fi
else
    log "Server starting... (may take a moment)"
fi

echo ""
echo "🎯 Autopilot fix complete!"
echo "📝 Log file: /tmp/vite-dev.log"
echo "🔍 Check server status: curl http://localhost:8012"