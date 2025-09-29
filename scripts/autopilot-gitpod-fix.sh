#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# AUTOPILOT GITPOD HOST FIX
# ===================================================================
# Comprehensive fix for Gitpod host blocking issues
# ===================================================================

echo "🚀 Autopilot: Comprehensive Gitpod Host Fix"
echo "==========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}→${NC} $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }
warn() { echo -e "${YELLOW}⚠️${NC} $*"; }
error() { echo -e "${RED}❌${NC} $*"; }

# Kill all existing processes
log "Stopping all existing services..."
pkill -f "vite" 2>/dev/null || true
pkill -f "pnpm.*dev" 2>/dev/null || true
pkill -f "node.*dev" 2>/dev/null || true
sleep 3

# Update vite.config.js with comprehensive host allowance
log "Updating Vite configuration for Gitpod compatibility..."

cat > vite.config.js << 'EOF'
/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    // Generates dist/stats.html on build (treemap visualization)
    visualizer({ filename: "dist/stats.html", gzipSize: true, brotliSize: true, template: "treemap" })
  ],
  base: '/',
  server: {
    host: true,
    port: 8012,
    strictPort: false,
    allowedHosts: 'all',
    hmr: {
      clientPort: 8012
    }
  },
  preview: {
    host: true,
    port: 8080,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
EOF

success "Vite configuration updated with Gitpod compatibility"

# Create a simple HTTP server as fallback
log "Creating fallback HTTP server..."

cat > simple-server.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve index.html for all routes (SPA)
  let filePath = path.join(__dirname, 'index.html');
  
  if (req.url !== '/' && req.url !== '/index.html') {
    // Try to serve static file first
    const staticPath = path.join(__dirname, req.url);
    if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
      filePath = staticPath;
    }
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }[ext] || 'text/plain';

    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('File not found');
  }
});

const PORT = process.env.PORT || 8012;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Accessible via Gitpod URL`);
});
EOF

# Try starting Vite first
log "Starting Vite development server..."
timeout 15 pnpm dev > /tmp/vite-start.log 2>&1 &
VITE_PID=$!

sleep 8

# Check if Vite is working
if curl -s -f "http://localhost:8012" > /dev/null 2>&1; then
    success "Vite server started successfully"
    
    # Test external access
    sleep 2
    if curl -s "https://8012--01999541-5193-736a-aec2-cfebece0ef39.us-east-1-01.gitpod.dev" | grep -q "html\|<!DOCTYPE\|<title"; then
        success "External access working!"
        echo ""
        echo "🎯 SUCCESS: Your site is accessible at:"
        echo "https://8012--01999541-5193-736a-aec2-cfebece0ef39.us-east-1-01.gitpod.dev"
    else
        warn "Vite running locally but external access blocked, trying fallback..."
        kill $VITE_PID 2>/dev/null || true
        sleep 2
        
        # Start simple server
        log "Starting fallback HTTP server..."
        node simple-server.js > /tmp/simple-server.log 2>&1 &
        SIMPLE_PID=$!
        
        sleep 3
        if curl -s "https://8012--01999541-5193-736a-aec2-cfebece0ef39.us-east-1-01.gitpod.dev" | grep -q "html\|<!DOCTYPE\|<title"; then
            success "Fallback server working!"
            echo ""
            echo "🎯 SUCCESS: Your site is accessible at:"
            echo "https://8012--01999541-5193-736a-aec2-cfebece0ef39.us-east-1-01.gitpod.dev"
        else
            error "Both Vite and fallback server failed external access"
        fi
    fi
else
    warn "Vite failed to start, trying fallback server..."
    
    # Start simple server
    log "Starting fallback HTTP server..."
    node simple-server.js > /tmp/simple-server.log 2>&1 &
    SIMPLE_PID=$!
    
    sleep 3
    if curl -s -f "http://localhost:8012" > /dev/null 2>&1; then
        success "Fallback server started successfully"
        
        if curl -s "https://8012--01999541-5193-736a-aec2-cfebece0ef39.us-east-1-01.gitpod.dev" | grep -q "html\|<!DOCTYPE\|<title"; then
            success "External access working with fallback server!"
            echo ""
            echo "🎯 SUCCESS: Your site is accessible at:"
            echo "https://8012--01999541-5193-736a-aec2-cfebece0ef39.us-east-1-01.gitpod.dev"
        else
            error "Fallback server running but external access still blocked"
        fi
    else
        error "Both Vite and fallback server failed to start"
    fi
fi

echo ""
echo "📊 Status Summary:"
echo "=================="
echo "Local server: $(curl -s -f http://localhost:8012 > /dev/null && echo "✅ Running" || echo "❌ Failed")"
echo "External access: $(curl -s https://8012--01999541-5193-736a-aec2-cfebece0ef39.us-east-1-01.gitpod.dev | grep -q "html\|<!DOCTYPE\|<title" && echo "✅ Working" || echo "❌ Blocked")"
echo ""
echo "📝 Logs:"
echo "Vite: /tmp/vite-start.log"
echo "Simple server: /tmp/simple-server.log"