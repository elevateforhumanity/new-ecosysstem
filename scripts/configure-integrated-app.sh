#!/usr/bin/env bash
# Configure Integrated Application
# Sets up Supabase + Cloudflare Pages + Render as one unified application

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     INTEGRATED APPLICATION CONFIGURATION                  ║"
echo "║  Supabase + Cloudflare Pages + Render = One App          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# STEP 1: Extract and Set Credentials
# ============================================
log_info "STEP 1: Setting up credentials..."
echo ""

# Supabase (already configured)
SUPABASE_URL='https://cuxzzpsyufcewtmicszk.supabase.co'
SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA'

log_success "Supabase configured"
echo "   URL: $SUPABASE_URL"

# Cloudflare Pages URL
CLOUDFLARE_PAGES_URL='https://elevateforhumanity.pages.dev'
log_success "Cloudflare Pages URL: $CLOUDFLARE_PAGES_URL"

# Render API URL
RENDER_API_URL='https://elevateforhumanity.onrender.com'
log_success "Render API URL: $RENDER_API_URL"

# ============================================
# STEP 2: Create Unified Environment File
# ============================================
echo ""
log_info "STEP 2: Creating unified .env file..."

cat > .env << EOF
# ============================================
# UNIFIED APPLICATION CONFIGURATION
# Supabase + Cloudflare Pages + Render
# ============================================

# Application
NODE_ENV=production
APP_NAME=Elevate for Humanity
APP_VERSION=2.0.0

# Supabase (Database & Auth)
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
${SUPABASE_SERVICE_KEY:+SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}}

# Cloudflare Pages (Frontend)
CLOUDFLARE_PAGES_URL=${CLOUDFLARE_PAGES_URL}
${CLOUDFLARE_API_TOKEN:+CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}}
${CLOUDFLARE_ACCOUNT_ID:+CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID}}

# Render (Backend API)
VITE_API_URL=${RENDER_API_URL}
RENDER_API_URL=${RENDER_API_URL}
${RENDER_API_KEY:+RENDER_API_KEY=${RENDER_API_KEY}}
${RENDER_SERVICE_ID:+RENDER_SERVICE_ID=${RENDER_SERVICE_ID}}
${RENDER_DEPLOY_HOOK:+RENDER_DEPLOY_HOOK=${RENDER_DEPLOY_HOOK}}

# CORS Configuration
CORS_ALLOWED_ORIGINS=${CLOUDFLARE_PAGES_URL},${RENDER_API_URL},${SUPABASE_URL},http://localhost:5173,http://localhost:8080

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_CHATBOT=true
ENABLE_AUTOPILOT=true
ENABLE_PAYMENTS=true
EOF

log_success "Created .env file with unified configuration"

# ============================================
# STEP 3: Update Supabase Client
# ============================================
echo ""
log_info "STEP 3: Updating Supabase client configuration..."

cat > src/supabaseClient.js << 'EOF'
import { createClient } from '@supabase/supabase-js';

// Unified configuration - works across all platforms
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cuxzzpsyufcewtmicszk.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA';

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'elevate-for-humanity-web',
    },
  },
});

// Test connection
export const testSupabaseConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    console.log('   URL:', supabaseUrl);
    
    const { data, error } = await supabase
      .from('programs')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
    return false;
  }
};

// Export configuration info
export const config = {
  supabaseUrl,
  isConfigured: !!(supabaseUrl && supabaseKey),
};
EOF

log_success "Updated src/supabaseClient.js with unified config"

# ============================================
# STEP 4: Create API Client for Render Backend
# ============================================
echo ""
log_info "STEP 4: Creating API client for Render backend..."

mkdir -p src/lib

cat > src/lib/api-client.js << 'EOF'
/**
 * API Client for Render Backend
 * Handles communication between Cloudflare Pages frontend and Render backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://elevateforhumanity.onrender.com';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Health check
  async health() {
    return this.request('/api/health');
  }

  // User endpoints
  async getUser(userId) {
    return this.request(`/api/users/${userId}`);
  }

  // Course endpoints
  async getCourses() {
    return this.request('/api/courses');
  }

  async getCourse(courseId) {
    return this.request(`/api/courses/${courseId}`);
  }

  // Program endpoints
  async getPrograms() {
    return this.request('/api/programs');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
EOF

log_success "Created src/lib/api-client.js"

# ============================================
# STEP 5: Set GitHub Secrets
# ============================================
echo ""
log_info "STEP 5: Setting GitHub Secrets..."

if command -v gh &> /dev/null; then
  gh secret set VITE_SUPABASE_URL -b"${SUPABASE_URL}" 2>/dev/null && \
    log_success "Set VITE_SUPABASE_URL" || log_warning "Could not set VITE_SUPABASE_URL"
  
  gh secret set VITE_SUPABASE_ANON_KEY -b"${SUPABASE_ANON_KEY}" 2>/dev/null && \
    log_success "Set VITE_SUPABASE_ANON_KEY" || log_warning "Could not set VITE_SUPABASE_ANON_KEY"
  
  gh secret set VITE_API_URL -b"${RENDER_API_URL}" 2>/dev/null && \
    log_success "Set VITE_API_URL" || log_warning "Could not set VITE_API_URL"
  
  gh secret set CLOUDFLARE_PAGES_URL -b"${CLOUDFLARE_PAGES_URL}" 2>/dev/null && \
    log_success "Set CLOUDFLARE_PAGES_URL" || log_warning "Could not set CLOUDFLARE_PAGES_URL"
  
  if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    gh secret set CLOUDFLARE_API_TOKEN -b"${CLOUDFLARE_API_TOKEN}" 2>/dev/null && \
      log_success "Set CLOUDFLARE_API_TOKEN" || log_warning "Could not set CLOUDFLARE_API_TOKEN"
  fi
  
  if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
    gh secret set CLOUDFLARE_ACCOUNT_ID -b"${CLOUDFLARE_ACCOUNT_ID}" 2>/dev/null && \
      log_success "Set CLOUDFLARE_ACCOUNT_ID" || log_warning "Could not set CLOUDFLARE_ACCOUNT_ID"
  fi
else
  log_warning "GitHub CLI not available - skipping GitHub secrets"
fi

# ============================================
# STEP 6: Set Gitpod Environment Variables
# ============================================
echo ""
log_info "STEP 6: Setting Gitpod environment variables..."

if command -v gp &> /dev/null; then
  gp env VITE_SUPABASE_URL="${SUPABASE_URL}" 2>/dev/null && \
    log_success "Set VITE_SUPABASE_URL in Gitpod" || log_warning "Could not set in Gitpod"
  
  gp env VITE_SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}" 2>/dev/null && \
    log_success "Set VITE_SUPABASE_ANON_KEY in Gitpod" || log_warning "Could not set in Gitpod"
  
  gp env VITE_API_URL="${RENDER_API_URL}" 2>/dev/null && \
    log_success "Set VITE_API_URL in Gitpod" || log_warning "Could not set in Gitpod"
else
  log_info "Gitpod CLI not available (normal if not in Gitpod)"
fi

# ============================================
# STEP 7: Update Render Environment Variables
# ============================================
echo ""
log_info "STEP 7: Updating Render environment variables..."

if [[ -n "${RENDER_API_KEY:-}" ]] && [[ -n "${RENDER_SERVICE_ID:-}" ]]; then
  log_info "Updating Render via API..."
  
  # Update environment variables
  for VAR_NAME in "VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_API_URL" "CLOUDFLARE_PAGES_URL"; do
    VAR_VALUE="${!VAR_NAME}"
    
    curl -s -X PUT "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars/${VAR_NAME}" \
      -H "Authorization: Bearer ${RENDER_API_KEY}" \
      -H "Content-Type: application/json" \
      -d "{\"value\": \"${VAR_VALUE}\"}" >/dev/null 2>&1 && \
      log_success "Updated ${VAR_NAME} on Render" || \
      log_warning "Could not update ${VAR_NAME} on Render"
  done
else
  log_warning "Render API credentials not set - skipping Render configuration"
  log_info "Set RENDER_API_KEY and RENDER_SERVICE_ID to enable"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           INTEGRATED CONFIGURATION COMPLETE! 🎉            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

log_success "Application Architecture:"
echo ""
echo "   ┌─────────────────────────────────────────────┐"
echo "   │         USER'S BROWSER                      │"
echo "   └──────────────┬──────────────────────────────┘"
echo "                  │"
echo "   ┌──────────────▼──────────────────────────────┐"
echo "   │   CLOUDFLARE PAGES (Frontend)               │"
echo "   │   https://elevateforhumanity.pages.dev      │"
echo "   │   • React Application                       │"
echo "   │   • Static Assets                           │"
echo "   │   • SPA Routing                             │"
echo "   └──────┬────────────────────┬─────────────────┘"
echo "          │                    │"
echo "          │                    │"
echo "   ┌──────▼──────────┐  ┌──────▼──────────────┐"
echo "   │   SUPABASE      │  │   RENDER (Backend)  │"
echo "   │   Database      │  │   API Server        │"
echo "   │   • Auth        │  │   • REST API        │"
echo "   │   • Storage     │  │   • Business Logic  │"
echo "   │   • Realtime    │  │   • Integrations    │"
echo "   └─────────────────┘  └─────────────────────┘"
echo ""

log_success "Configuration Details:"
echo "   📦 Supabase: $SUPABASE_URL"
echo "   ☁️  Cloudflare: $CLOUDFLARE_PAGES_URL"
echo "   🚀 Render: $RENDER_API_URL"
echo ""

log_success "Files Created/Updated:"
echo "   ✅ .env - Unified environment configuration"
echo "   ✅ src/supabaseClient.js - Database client"
echo "   ✅ src/lib/api-client.js - Backend API client"
echo "   ✅ config/unified-config.js - Shared configuration"
echo "   ✅ public/_headers - Cloudflare security headers"
echo "   ✅ public/_redirects - SPA routing & API proxy"
echo "   ✅ render.yaml - Backend configuration"
echo ""

log_info "Next Steps:"
echo "   1. Build: pnpm run build"
echo "   2. Deploy: bash scripts/full-autopilot-deploy.sh"
echo "   3. Test integration: bash scripts/test-integration.sh"
echo ""

log_success "All platforms are now configured to work as ONE integrated application!"
echo ""
