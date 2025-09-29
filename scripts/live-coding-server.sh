#!/bin/bash

# Live Coding Server with Auto-Reload
# Elevate for Humanity - Real-time Development Experience
# 
# Features:
# - Hot reload on file changes
# - Live browser sync
# - Automatic compilation
# - Real-time preview updates
# - Auto-commit on save

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/logs/live-coding.log"
PID_FILE="$PROJECT_ROOT/logs/live-coding.pid"

# Server configuration
LIVE_SERVER_PORT=3000
VITE_PORT=5173
AUTOPILOT_PORT=8012
LIVERELOAD_PORT=35729

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Create necessary directories
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$PID_FILE")"

# Store PID
echo $$ > "$PID_FILE"

cd "$PROJECT_ROOT"

log "INFO" "🔥 Starting Live Coding Server..."
log "INFO" "📁 Project Root: $PROJECT_ROOT"
log "INFO" "🌐 Live Server Port: $LIVE_SERVER_PORT"
log "INFO" "⚡ Vite Port: $VITE_PORT"
log "INFO" "🤖 Autopilot Port: $AUTOPILOT_PORT"

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [[ -n "$pid" ]]; then
        log "INFO" "🔪 Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 2
    fi
}

# Function to setup file watching
setup_file_watching() {
    log "INFO" "👁️ Setting up file watching for live reload..."
    
    # Install nodemon if not present
    if ! command -v nodemon &> /dev/null; then
        log "INFO" "📦 Installing nodemon for file watching..."
        npm install -g nodemon
    fi
    
    # Create nodemon configuration
    cat > nodemon.json << 'EOF'
{
  "watch": [
    "*.html",
    "*.css", 
    "*.js",
    "*.json",
    "assets/",
    "css/",
    "js/",
    "images/",
    "security/"
  ],
  "ext": "html,css,js,json,md,yml,yaml",
  "ignore": [
    "node_modules/",
    ".git/",
    "dist/",
    "logs/",
    ".pnpm-store/"
  ],
  "delay": 1000,
  "verbose": true,
  "exec": "echo 'File changed - triggering reload...' && ./scripts/autopilot-auto-commit-deploy.sh --quick"
}
EOF
    
    log "SUCCESS" "✅ File watching configured"
}

# Function to start live server
start_live_server() {
    log "INFO" "🌐 Starting live server on port $LIVE_SERVER_PORT..."
    
    # Kill any existing process on the port
    kill_port $LIVE_SERVER_PORT
    
    # Create a simple live server script
    cat > live-server.js << 'EOF'
const express = require('express');
const path = require('path');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.LIVE_SERVER_PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Inject live reload script into HTML files
app.get('*.html', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    const fs = require('fs');
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Inject live reload script before closing body tag
        const liveReloadScript = `
<script>
(function() {
    const ws = new WebSocket('ws://localhost:${PORT}');
    ws.onmessage = function(event) {
        if (event.data === 'reload') {
            console.log('🔄 Live reload triggered');
            window.location.reload();
        }
    };
    ws.onopen = function() {
        console.log('🔥 Live reload connected');
    };
    ws.onerror = function() {
        console.log('❌ Live reload connection failed');
    };
})();
</script>`;
        
        if (content.includes('</body>')) {
            content = content.replace('</body>', liveReloadScript + '</body>');
        } else {
            content += liveReloadScript;
        }
        
        res.send(content);
    } else {
        res.status(404).send('File not found');
    }
});

// WebSocket connections for live reload
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('🔌 Client connected for live reload');
    
    ws.on('close', () => {
        clients.delete(ws);
        console.log('🔌 Client disconnected');
    });
});

// Function to broadcast reload to all clients
function broadcastReload() {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('reload');
        }
    });
}

// Watch for file changes
const watcher = chokidar.watch([
    '*.html',
    '*.css', 
    '*.js',
    'assets/**/*',
    'css/**/*',
    'js/**/*',
    'images/**/*'
], {
    ignored: /node_modules|\.git|dist|logs/,
    persistent: true,
    ignoreInitial: true
});

watcher.on('change', (path) => {
    console.log(`📝 File changed: ${path}`);
    setTimeout(() => {
        broadcastReload();
    }, 500); // Small delay to ensure file is fully written
});

server.listen(PORT, () => {
    console.log(`🔥 Live server running at http://localhost:${PORT}`);
    console.log(`👁️ Watching for file changes...`);
});
EOF
    
    # Install required dependencies if not present
    if [[ ! -f package.json ]] || ! npm list express &>/dev/null; then
        log "INFO" "📦 Installing live server dependencies..."
        npm install express chokidar ws --save-dev
    fi
    
    # Start the live server in background
    node live-server.js > "$LOG_FILE.live-server" 2>&1 &
    local live_server_pid=$!
    echo $live_server_pid > "$PID_FILE.live-server"
    
    log "SUCCESS" "✅ Live server started (PID: $live_server_pid)"
}

# Function to start Vite dev server
start_vite_server() {
    if [[ -f vite.config.js ]] || [[ -f vite.config.ts ]]; then
        log "INFO" "⚡ Starting Vite dev server on port $VITE_PORT..."
        
        kill_port $VITE_PORT
        
        # Start Vite in background
        npx vite --port $VITE_PORT --host 0.0.0.0 > "$LOG_FILE.vite" 2>&1 &
        local vite_pid=$!
        echo $vite_pid > "$PID_FILE.vite"
        
        log "SUCCESS" "✅ Vite server started (PID: $vite_pid)"
    else
        log "INFO" "ℹ️ No Vite configuration found, skipping Vite server"
    fi
}

# Function to start autopilot server
start_autopilot_server() {
    log "INFO" "🤖 Starting autopilot server on port $AUTOPILOT_PORT..."
    
    kill_port $AUTOPILOT_PORT
    
    # Start autopilot server
    if [[ -f scripts/dev-8012.sh ]]; then
        chmod +x scripts/dev-8012.sh
        ./scripts/dev-8012.sh > "$LOG_FILE.autopilot" 2>&1 &
        local autopilot_pid=$!
        echo $autopilot_pid > "$PID_FILE.autopilot"
        
        log "SUCCESS" "✅ Autopilot server started (PID: $autopilot_pid)"
    else
        log "WARNING" "⚠️ Autopilot server script not found"
    fi
}

# Function to start auto-commit system
start_auto_commit() {
    log "INFO" "🔄 Starting auto-commit and deploy system..."
    
    if [[ -f scripts/autopilot-auto-commit-deploy.sh ]]; then
        chmod +x scripts/autopilot-auto-commit-deploy.sh
        ./scripts/autopilot-auto-commit-deploy.sh > "$LOG_FILE.auto-commit" 2>&1 &
        local auto_commit_pid=$!
        echo $auto_commit_pid > "$PID_FILE.auto-commit"
        
        log "SUCCESS" "✅ Auto-commit system started (PID: $auto_commit_pid)"
    else
        log "WARNING" "⚠️ Auto-commit script not found"
    fi
}

# Function to display server status
show_server_status() {
    echo ""
    echo -e "${GREEN}🔥 LIVE CODING ENVIRONMENT ACTIVE${NC}"
    echo -e "${CYAN}=================================${NC}"
    echo ""
    echo -e "${BLUE}🌐 Live Server:${NC}      http://localhost:$LIVE_SERVER_PORT"
    echo -e "${BLUE}⚡ Vite Server:${NC}      http://localhost:$VITE_PORT"
    echo -e "${BLUE}🤖 Autopilot:${NC}       http://localhost:$AUTOPILOT_PORT"
    echo -e "${BLUE}🌍 Live Site:${NC}       https://elevateforhumanity.pages.dev"
    echo ""
    echo -e "${YELLOW}Features Active:${NC}"
    echo -e "  ✅ Hot reload on file changes"
    echo -e "  ✅ Auto-commit and deploy"
    echo -e "  ✅ Live browser sync"
    echo -e "  ✅ Real-time preview updates"
    echo -e "  ✅ Security protection systems"
    echo ""
    echo -e "${PURPLE}📝 Edit any file and see changes instantly!${NC}"
    echo ""
}

# Function to cleanup on exit
cleanup() {
    log "INFO" "🧹 Cleaning up live coding servers..."
    
    # Kill all server processes
    for pid_file in "$PID_FILE".*; do
        if [[ -f "$pid_file" ]]; then
            local pid=$(cat "$pid_file" 2>/dev/null || echo "")
            if [[ -n "$pid" ]]; then
                kill -9 "$pid" 2>/dev/null || true
            fi
            rm -f "$pid_file"
        fi
    done
    
    # Kill ports
    kill_port $LIVE_SERVER_PORT
    kill_port $VITE_PORT
    kill_port $AUTOPILOT_PORT
    
    # Cleanup temporary files
    rm -f live-server.js nodemon.json
    rm -f "$PID_FILE"
    
    log "INFO" "✅ Cleanup completed"
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Main function
main() {
    log "SUCCESS" "🚀 Initializing Live Coding Environment..."
    
    # Setup file watching
    setup_file_watching
    
    # Start all servers
    start_live_server
    sleep 2
    
    start_vite_server
    sleep 2
    
    start_autopilot_server
    sleep 2
    
    start_auto_commit
    sleep 2
    
    # Show status
    show_server_status
    
    # Keep the script running
    log "INFO" "🔄 Live coding environment running... Press Ctrl+C to stop"
    
    while true; do
        sleep 10
        
        # Health check - restart servers if they died
        if [[ -f "$PID_FILE.live-server" ]]; then
            local live_pid=$(cat "$PID_FILE.live-server")
            if ! kill -0 "$live_pid" 2>/dev/null; then
                log "WARNING" "⚠️ Live server died, restarting..."
                start_live_server
            fi
        fi
        
        if [[ -f "$PID_FILE.vite" ]]; then
            local vite_pid=$(cat "$PID_FILE.vite")
            if ! kill -0 "$vite_pid" 2>/dev/null; then
                log "WARNING" "⚠️ Vite server died, restarting..."
                start_vite_server
            fi
        fi
    done
}

# Start the main function
main "$@"