#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# AUTOPILOT INTEGRATION AUDIT SCRIPT
# ===================================================================
# Comprehensive audit of Gitpod, Codespaces, Cloudflare, and Netlify
# Identifies conflicts and overlapping configurations
# ===================================================================

echo "🔍 Autopilot: Integration Audit Starting..."
echo "==========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[AUDIT]${NC} $*"; }
success() { echo -e "${GREEN}[✅ OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[⚠️ WARN]${NC} $*"; }
error() { echo -e "${RED}[❌ ERROR]${NC} $*"; }
info() { echo -e "${PURPLE}[ℹ️ INFO]${NC} $*"; }

# Initialize audit results
AUDIT_RESULTS=()
CONFLICTS=()
RECOMMENDATIONS=()

# Function to add audit result
add_result() {
    local status=$1
    local component=$2
    local message=$3
    AUDIT_RESULTS+=("$status|$component|$message")
}

# Function to add conflict
add_conflict() {
    local conflict=$1
    CONFLICTS+=("$conflict")
}

# Function to add recommendation
add_recommendation() {
    local rec=$1
    RECOMMENDATIONS+=("$rec")
}

log "Auditing development environment configurations..."

# ===== GITPOD CONFIGURATION AUDIT =====
log "Checking Gitpod configuration..."

if [ -f ".gitpod.yml" ]; then
    success "Gitpod configuration found"
    
    # Check port configuration
    GITPOD_PORT=$(grep -o "port: [0-9]*" .gitpod.yml | head -1 | cut -d' ' -f2)
    if [ "$GITPOD_PORT" = "8012" ]; then
        success "Gitpod port 8012 configured correctly"
        add_result "✅" "Gitpod" "Port 8012 configured"
    else
        warn "Gitpod port mismatch: $GITPOD_PORT"
        add_result "⚠️" "Gitpod" "Port configuration needs review"
    fi
    
    # Check Node version in Dockerfile
    if [ -f ".gitpod.Dockerfile" ]; then
        GITPOD_NODE=$(grep "FROM.*node" .gitpod.Dockerfile | grep -o "node:[0-9]*" | cut -d':' -f2)
        if [ "$GITPOD_NODE" = "20" ]; then
            success "Gitpod Node.js 20 configured"
            add_result "✅" "Gitpod" "Node.js 20 configured"
        else
            warn "Gitpod Node version: $GITPOD_NODE (expected 20)"
            add_result "⚠️" "Gitpod" "Node version mismatch"
        fi
    fi
else
    error "Gitpod configuration missing"
    add_result "❌" "Gitpod" "Configuration file missing"
fi

# ===== CODESPACES CONFIGURATION AUDIT =====
log "Checking GitHub Codespaces configuration..."

if [ -f ".devcontainer/devcontainer.json" ]; then
    success "Codespaces devcontainer found"
    
    # Check Node version
    CODESPACES_NODE=$(grep -o '"version": "[0-9]*"' .devcontainer/devcontainer.json | grep -A1 -B1 "node" | grep version | cut -d'"' -f4)
    if [ "$CODESPACES_NODE" = "20" ]; then
        success "Codespaces Node.js 20 configured"
        add_result "✅" "Codespaces" "Node.js 20 configured"
    else
        warn "Codespaces Node version: $CODESPACES_NODE"
        add_result "⚠️" "Codespaces" "Node version check needed"
    fi
    
    # Check port forwarding
    if grep -q "8012" .devcontainer/devcontainer.json; then
        success "Codespaces port 8012 forwarded"
        add_result "✅" "Codespaces" "Port 8012 forwarded"
    else
        warn "Port 8012 not found in Codespaces config"
        add_result "⚠️" "Codespaces" "Port forwarding incomplete"
    fi
    
    # Check for resource allocation
    CODESPACES_CPU=$(grep -o '"cpus": [0-9]*' .devcontainer/devcontainer.json | cut -d':' -f2 | tr -d ' ')
    CODESPACES_MEM=$(grep -o '"memory": "[0-9]*gb"' .devcontainer/devcontainer.json | cut -d'"' -f4)
    
    if [ "$CODESPACES_CPU" = "8" ] && [ "$CODESPACES_MEM" = "16gb" ]; then
        success "Codespaces resources optimized (8 CPU, 16GB RAM)"
        add_result "✅" "Codespaces" "Resources optimized"
    else
        info "Codespaces resources: ${CODESPACES_CPU:-unknown} CPU, ${CODESPACES_MEM:-unknown} RAM"
        add_result "ℹ️" "Codespaces" "Resource allocation: $CODESPACES_CPU CPU, $CODESPACES_MEM RAM"
    fi
else
    error "Codespaces devcontainer missing"
    add_result "❌" "Codespaces" "Devcontainer configuration missing"
fi

# ===== PACKAGE.JSON VERSION CONFLICTS =====
log "Checking package.json Node version requirements..."

if [ -f "package.json" ]; then
    PKG_NODE=$(grep -o '"node": "[^"]*"' package.json | cut -d'"' -f4)
    CURRENT_NODE=$(node --version | cut -d'v' -f2)
    
    if [ "$PKG_NODE" = "20.11.1" ]; then
        if [[ "$CURRENT_NODE" == 20.* ]]; then
            success "Node version compatible ($CURRENT_NODE matches requirement $PKG_NODE)"
            add_result "✅" "Package" "Node version compatible"
        else
            warn "Node version mismatch: current $CURRENT_NODE, required $PKG_NODE"
            add_result "⚠️" "Package" "Node version mismatch"
            add_conflict "Node.js version: current v$CURRENT_NODE vs required v$PKG_NODE"
        fi
    fi
    
    # Check package manager
    PKG_MANAGER=$(grep -o '"packageManager": "[^"]*"' package.json | cut -d'"' -f4)
    if [ "$PKG_MANAGER" = "pnpm@9.7.0" ]; then
        success "Package manager specified: $PKG_MANAGER"
        add_result "✅" "Package" "Package manager specified"
    fi
else
    error "package.json not found"
    add_result "❌" "Package" "package.json missing"
fi

# ===== CLOUDFLARE CONFIGURATION AUDIT =====
log "Checking Cloudflare integration..."

if [ -f "autopilot-cloudflare-setup.json" ]; then
    success "Cloudflare configuration found"
    add_result "✅" "Cloudflare" "Configuration file present"
    
    # Check for API credentials (without exposing them)
    if grep -q "cloudflare_api_token" autopilot-cloudflare-setup.json; then
        warn "Cloudflare API token found in config file (security risk)"
        add_result "⚠️" "Cloudflare" "API credentials in config file"
        add_conflict "Cloudflare API credentials exposed in configuration file"
        add_recommendation "Move Cloudflare API credentials to environment variables"
    fi
    
    # Check GitHub workflow
    if [ -f ".github/workflows/cloudflare.yml" ]; then
        success "Cloudflare GitHub workflow found"
        add_result "✅" "Cloudflare" "GitHub workflow configured"
        
        if grep -q "apiToken:" .github/workflows/cloudflare.yml; then
            warn "API token hardcoded in GitHub workflow"
            add_result "⚠️" "Cloudflare" "API token in workflow"
            add_conflict "Cloudflare API token hardcoded in GitHub workflow"
            add_recommendation "Use GitHub secrets for Cloudflare API token"
        fi
    fi
else
    warn "Cloudflare configuration not found"
    add_result "⚠️" "Cloudflare" "Configuration missing"
fi

# ===== NETLIFY CONFIGURATION AUDIT =====
log "Checking Netlify integration..."

if [ -f "netlify.toml" ]; then
    success "Netlify configuration found"
    add_result "✅" "Netlify" "Configuration file present"
    
    # Check for conflicting deployment targets
    if [ -f ".github/workflows/cloudflare.yml" ] && [ -f "netlify.toml" ]; then
        warn "Both Cloudflare and Netlify configurations found"
        add_result "⚠️" "Deployment" "Multiple deployment targets"
        add_conflict "Both Cloudflare Pages and Netlify configured for deployment"
        add_recommendation "Choose single deployment target or configure for different environments"
    fi
    
    # Check Node version in netlify.toml
    NETLIFY_NODE=$(grep -o 'NODE_VERSION = "[0-9]*"' netlify.toml | cut -d'"' -f2)
    if [ "$NETLIFY_NODE" = "18" ]; then
        warn "Netlify using Node.js 18, but project requires 20"
        add_result "⚠️" "Netlify" "Node version mismatch"
        add_conflict "Netlify Node.js version (18) differs from project requirement (20)"
        add_recommendation "Update netlify.toml NODE_VERSION to 20"
    fi
else
    info "Netlify configuration not found"
    add_result "ℹ️" "Netlify" "Configuration not present"
fi

# ===== PORT CONFLICTS AUDIT =====
log "Checking for port conflicts..."

PORTS_USED=()
if grep -q "8012" .gitpod.yml 2>/dev/null; then
    PORTS_USED+=("8012:Gitpod")
fi
if grep -q "8012" .devcontainer/devcontainer.json 2>/dev/null; then
    PORTS_USED+=("8012:Codespaces")
fi
if grep -q "8012" package.json 2>/dev/null; then
    PORTS_USED+=("8012:Package.json")
fi
if grep -q "8012" netlify.toml 2>/dev/null; then
    PORTS_USED+=("8012:Netlify")
fi

if [ ${#PORTS_USED[@]} -gt 1 ]; then
    success "Port 8012 consistently used across configurations"
    add_result "✅" "Ports" "Consistent port usage"
else
    warn "Port configuration inconsistency detected"
    add_result "⚠️" "Ports" "Inconsistent configuration"
fi

# ===== VITE CONFIGURATION AUDIT =====
log "Checking Vite configuration..."

if [ -f "vite.config.js" ]; then
    success "Vite configuration found"
    
    if grep -q "allowedHosts.*all" vite.config.js; then
        success "Vite allowedHosts set to 'all' for Gitpod/Codespaces compatibility"
        add_result "✅" "Vite" "Host configuration optimized"
    else
        warn "Vite allowedHosts may need configuration for external access"
        add_result "⚠️" "Vite" "Host configuration needs review"
    fi
    
    if grep -q "port.*8012" vite.config.js; then
        success "Vite port 8012 configured"
        add_result "✅" "Vite" "Port configuration correct"
    fi
else
    error "Vite configuration missing"
    add_result "❌" "Vite" "Configuration file missing"
fi

# ===== GENERATE AUDIT REPORT =====
log "Generating comprehensive audit report..."

cat > /tmp/integration-audit-report.json << EOF
{
  "audit_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$([ -n "${GITPOD_WORKSPACE_ID:-}" ] && echo "Gitpod" || echo "Codespaces")",
  "node_version": "$(node --version)",
  "audit_results": [
$(printf '%s\n' "${AUDIT_RESULTS[@]}" | sed 's/|/","/g' | sed 's/^/    {"status":"/' | sed 's/$/"}/' | paste -sd ',' -)
  ],
  "conflicts_detected": [
$(printf '%s\n' "${CONFLICTS[@]}" | sed 's/^/    "/' | sed 's/$/"/' | paste -sd ',' -)
  ],
  "recommendations": [
$(printf '%s\n' "${RECOMMENDATIONS[@]}" | sed 's/^/    "/' | sed 's/$/"/' | paste -sd ',' -)
  ]
}
EOF

# ===== DISPLAY RESULTS =====
echo ""
echo "📊 INTEGRATION AUDIT RESULTS"
echo "============================"
echo ""

echo "🔧 Configuration Status:"
for result in "${AUDIT_RESULTS[@]}"; do
    IFS='|' read -r status component message <<< "$result"
    case $status in
        "✅") success "$component: $message" ;;
        "⚠️") warn "$component: $message" ;;
        "❌") error "$component: $message" ;;
        "ℹ️") info "$component: $message" ;;
    esac
done

echo ""
if [ ${#CONFLICTS[@]} -gt 0 ]; then
    echo "⚠️ CONFLICTS DETECTED:"
    for conflict in "${CONFLICTS[@]}"; do
        warn "$conflict"
    done
    echo ""
fi

if [ ${#RECOMMENDATIONS[@]} -gt 0 ]; then
    echo "💡 RECOMMENDATIONS:"
    for rec in "${RECOMMENDATIONS[@]}"; do
        info "$rec"
    done
    echo ""
fi

echo "📄 Full report saved to: /tmp/integration-audit-report.json"
echo ""
echo "🎯 AUDIT COMPLETE"

# Return appropriate exit code
if [ ${#CONFLICTS[@]} -gt 0 ]; then
    echo "⚠️ Conflicts detected - manual review recommended"
    exit 1
else
    echo "✅ No critical conflicts detected"
    exit 0
fi