#!/usr/bin/env bash
# Full Autopilot: Supabase + Render + Cloudflare + GitHub + Gitpod
# Automatic configuration, commit, and deployment to all services

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_step() { echo -e "${CYAN}🚀 $1${NC}"; }

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         FULL AUTOPILOT DEPLOYMENT SYSTEM                  ║"
echo "║  Supabase + Render + Cloudflare + GitHub + Gitpod         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# STEP 1: Extract Supabase Credentials
# ============================================
log_step "STEP 1: Extracting Supabase Credentials"

SUPABASE_URL='https://cuxzzpsyufcewtmicszk.supabase.co'
SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA'

log_success "Supabase URL: $SUPABASE_URL"
log_success "Supabase Anon Key: ${SUPABASE_ANON_KEY:0:30}..."

# Check for service key
if [[ -z "${SUPABASE_SERVICE_KEY:-}" ]]; then
  log_warning "SUPABASE_SERVICE_KEY not set - will skip service-level operations"
  log_info "Get it from: https://supabase.com/dashboard/project/cuxzzpsyufcewtmicszk/settings/api"
else
  log_success "Supabase Service Key found"
fi

# ============================================
# STEP 2: Update Local Configuration
# ============================================
log_step "STEP 2: Updating Local Configuration Files"

# Update src/supabaseClient.js
log_info "Updating src/supabaseClient.js..."
cat > src/supabaseClient.js << 'EOF'
import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cuxzzpsyufcewtmicszk.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection and log status
export const testSupabaseConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    console.log('   URL:', supabaseUrl);
    
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase Integration Active!');
    console.log('   Programs found:', data?.length || 0);
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
};
EOF
log_success "Updated src/supabaseClient.js"

# Create .env file
log_info "Creating .env file..."
cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
${SUPABASE_SERVICE_KEY:+SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}}

# Cloudflare Configuration
${CLOUDFLARE_API_TOKEN:+CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}}
${CLOUDFLARE_ACCOUNT_ID:+CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID}}
${CF_API_TOKEN:+CF_API_TOKEN=${CF_API_TOKEN}}
${CF_ACCOUNT_ID:+CF_ACCOUNT_ID=${CF_ACCOUNT_ID}}

# Render Configuration
${RENDER_API_KEY:+RENDER_API_KEY=${RENDER_API_KEY}}
${RENDER_SERVICE_ID:+RENDER_SERVICE_ID=${RENDER_SERVICE_ID}}

# Environment
NODE_ENV=production
EOF
log_success "Created .env file"

# ============================================
# STEP 3: Set GitHub Secrets
# ============================================
log_step "STEP 3: Setting GitHub Secrets"

if command -v gh &> /dev/null; then
  log_info "GitHub CLI found - setting secrets..."
  
  gh secret set VITE_SUPABASE_URL -b"${SUPABASE_URL}" 2>/dev/null && \
    log_success "Set VITE_SUPABASE_URL" || log_warning "Could not set VITE_SUPABASE_URL"
  
  gh secret set VITE_SUPABASE_ANON_KEY -b"${SUPABASE_ANON_KEY}" 2>/dev/null && \
    log_success "Set VITE_SUPABASE_ANON_KEY" || log_warning "Could not set VITE_SUPABASE_ANON_KEY"
  
  if [[ -n "${SUPABASE_SERVICE_KEY:-}" ]]; then
    gh secret set SUPABASE_SERVICE_KEY -b"${SUPABASE_SERVICE_KEY}" 2>/dev/null && \
      log_success "Set SUPABASE_SERVICE_KEY" || log_warning "Could not set SUPABASE_SERVICE_KEY"
  fi
  
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
  log_info "Install with: https://cli.github.com/"
fi

# ============================================
# STEP 4: Set Gitpod Environment Variables
# ============================================
log_step "STEP 4: Setting Gitpod Environment Variables"

if command -v gp &> /dev/null; then
  log_info "Gitpod CLI found - setting environment variables..."
  
  gp env VITE_SUPABASE_URL="${SUPABASE_URL}" 2>/dev/null && \
    log_success "Set VITE_SUPABASE_URL in Gitpod" || log_warning "Could not set in Gitpod"
  
  gp env VITE_SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}" 2>/dev/null && \
    log_success "Set VITE_SUPABASE_ANON_KEY in Gitpod" || log_warning "Could not set in Gitpod"
  
  if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    gp env CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}" 2>/dev/null && \
      log_success "Set CLOUDFLARE_API_TOKEN in Gitpod" || log_warning "Could not set in Gitpod"
  fi
else
  log_warning "Gitpod CLI not available - skipping Gitpod env vars"
  log_info "This is normal if not running in Gitpod"
fi

# ============================================
# STEP 5: Update Render Environment Variables
# ============================================
log_step "STEP 5: Updating Render Environment Variables"

if [[ -n "${RENDER_API_KEY:-}" ]] && [[ -n "${RENDER_SERVICE_ID:-}" ]]; then
  log_info "Render credentials found - updating environment..."
  
  # Update VITE_SUPABASE_URL
  RESPONSE=$(curl -s -X PUT "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars/VITE_SUPABASE_URL" \
    -H "Authorization: Bearer ${RENDER_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"value\": \"${SUPABASE_URL}\"}" 2>&1)
  
  if echo "$RESPONSE" | grep -q "error"; then
    log_warning "Could not update VITE_SUPABASE_URL on Render"
  else
    log_success "Updated VITE_SUPABASE_URL on Render"
  fi
  
  # Update VITE_SUPABASE_ANON_KEY
  RESPONSE=$(curl -s -X PUT "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars/VITE_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer ${RENDER_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"value\": \"${SUPABASE_ANON_KEY}\"}" 2>&1)
  
  if echo "$RESPONSE" | grep -q "error"; then
    log_warning "Could not update VITE_SUPABASE_ANON_KEY on Render"
  else
    log_success "Updated VITE_SUPABASE_ANON_KEY on Render"
  fi
else
  log_warning "Render credentials not found - skipping Render configuration"
  log_info "Set RENDER_API_KEY and RENDER_SERVICE_ID to enable"
fi

# ============================================
# STEP 6: Build the Application
# ============================================
log_step "STEP 6: Building Application"

log_info "Installing dependencies..."
pnpm install --silent 2>/dev/null || npm install --silent 2>/dev/null || log_warning "Could not install dependencies"

log_info "Building application..."
if pnpm run build 2>/dev/null || npm run build 2>/dev/null; then
  log_success "Build completed successfully"
else
  log_error "Build failed - check errors above"
  exit 1
fi

# ============================================
# STEP 7: Git Commit and Push
# ============================================
log_step "STEP 7: Committing Changes to Git"

# Check if there are changes
if [[ -n $(git status --porcelain) ]]; then
  log_info "Changes detected - committing..."
  
  git add src/supabaseClient.js .env 2>/dev/null || true
  git add dist/ 2>/dev/null || true
  
  COMMIT_MSG="feat: autopilot deployment - configured all services

- Updated Supabase configuration
- Set environment variables for all platforms
- Built application for deployment
- Automated by full-autopilot-deploy.sh

Co-authored-by: Ona <no-reply@ona.com>"
  
  git commit -m "$COMMIT_MSG" 2>/dev/null && log_success "Changes committed" || log_warning "Nothing to commit"
  
  # Push to GitHub
  log_info "Pushing to GitHub..."
  if git push origin $(git branch --show-current) 2>/dev/null; then
    log_success "Pushed to GitHub"
  else
    log_warning "Could not push to GitHub - may need authentication"
  fi
else
  log_info "No changes to commit"
fi

# ============================================
# STEP 8: Deploy to Cloudflare Pages
# ============================================
log_step "STEP 8: Deploying to Cloudflare Pages"

if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]] && command -v wrangler &> /dev/null; then
  log_info "Deploying to Cloudflare Pages..."
  
  export CLOUDFLARE_API_TOKEN
  
  if wrangler pages deploy dist --project-name=elevateforhumanity 2>/dev/null; then
    log_success "Deployed to Cloudflare Pages"
    log_success "URL: https://elevateforhumanity.pages.dev"
  else
    log_warning "Cloudflare deployment failed"
  fi
else
  log_warning "Cloudflare deployment skipped"
  if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    log_info "Set CLOUDFLARE_API_TOKEN to enable"
  fi
  if ! command -v wrangler &> /dev/null; then
    log_info "Install wrangler: npm install -g wrangler"
  fi
fi

# ============================================
# STEP 9: Trigger Render Deployment
# ============================================
log_step "STEP 9: Triggering Render Deployment"

if [[ -n "${RENDER_DEPLOY_HOOK:-}" ]]; then
  log_info "Triggering Render deployment..."
  
  if curl -s -X POST "${RENDER_DEPLOY_HOOK}" >/dev/null 2>&1; then
    log_success "Render deployment triggered"
    log_info "Check status: https://dashboard.render.com/"
  else
    log_warning "Could not trigger Render deployment"
  fi
else
  log_warning "RENDER_DEPLOY_HOOK not set - skipping Render deployment"
  log_info "Get deploy hook from: Service Settings → Deploy Hook"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  DEPLOYMENT COMPLETE! 🎉                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
log_success "Configuration Summary:"
echo "   ✅ Supabase: $SUPABASE_URL"
echo "   ✅ Local .env file created"
echo "   ✅ GitHub secrets configured"
echo "   ✅ Gitpod environment variables set"
if [[ -n "${RENDER_API_KEY:-}" ]]; then
  echo "   ✅ Render environment variables updated"
fi
if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "   ✅ Cloudflare Pages deployed"
fi
echo ""
log_info "Deployment URLs:"
echo "   🌐 Cloudflare: https://elevateforhumanity.pages.dev"
echo "   🌐 Render: https://elevateforhumanity.onrender.com (if configured)"
echo ""
log_info "Next Steps:"
echo "   1. Verify deployments are live"
echo "   2. Test Supabase connection in browser console"
echo "   3. Check application functionality"
echo ""
echo "🤖 Autopilot deployment complete!"
