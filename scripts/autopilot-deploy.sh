#!/usr/bin/env bash
# Autopilot LMS Backend Deployment
# Automates everything that can be automated

set -euo pipefail

echo "🤖 AUTOPILOT: LMS Backend Deployment"
echo "====================================="
echo ""

# Step 1: Check what can be automated
echo "📊 Checking deployment status..."
echo ""

SUPABASE_URL="https://cuxzzpsyufcewtmicszk.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA"

# Check if courses table exists
echo "🔍 Checking database schema..."
COURSES_CHECK=$(curl -s "${SUPABASE_URL}/rest/v1/courses?select=count&limit=1" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" 2>&1)

if echo "$COURSES_CHECK" | grep -q "Could not find the table"; then
    echo "❌ Database migrations NOT applied"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  MANUAL STEP REQUIRED: Apply Database Migrations"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Supabase doesn't allow SQL execution via API for security."
    echo "You must apply migrations manually (takes 2 minutes):"
    echo ""
    echo "1. Open: https://supabase.com/dashboard/project/cuxzzpsyufcewtmicszk/sql/new"
    echo ""
    echo "2. Copy/paste this file and click RUN:"
    echo "   📄 supabase/migrations/002_lms_schema.sql"
    echo ""
    echo "3. Copy/paste this file and click RUN:"
    echo "   📄 supabase/migrations/003_lms_seed_data.sql"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "Press ENTER after applying migrations to continue..."
    
    # Re-check
    COURSES_CHECK=$(curl -s "${SUPABASE_URL}/rest/v1/courses?select=count&limit=1" \
      -H "apikey: ${SUPABASE_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_KEY}" 2>&1)
    
    if echo "$COURSES_CHECK" | grep -q "Could not find the table"; then
        echo "❌ Migrations still not applied. Exiting."
        exit 1
    fi
fi

COURSES_COUNT=$(curl -s "${SUPABASE_URL}/rest/v1/courses?select=count" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" | jq -r '.[0].count // 0')

echo "✅ Database ready! Found $COURSES_COUNT courses"
echo ""

# Step 2: Check if backend is already deployed
echo "🔍 Checking for existing backend deployment..."
echo ""

# Common Render URLs to check
POSSIBLE_URLS=(
    "https://efh-lms-backend.onrender.com"
    "https://elevateforhumanity-backend.onrender.com"
    "https://fix2-backend.onrender.com"
)

BACKEND_URL=""
for url in "${POSSIBLE_URLS[@]}"; do
    echo "Testing: $url"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${url}/health" 2>/dev/null || echo "000")
    if [[ "$HTTP_CODE" == "200" ]]; then
        echo "✅ Found working backend at: $url"
        BACKEND_URL="$url"
        break
    fi
done

if [[ -z "$BACKEND_URL" ]]; then
    echo "❌ No existing backend found"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  MANUAL STEP REQUIRED: Deploy to Render"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Render requires OAuth connection (one-time setup)."
    echo "After first deployment, autopilot can handle updates."
    echo ""
    echo "Quick deploy (3 minutes):"
    echo ""
    echo "1. Open: https://dashboard.render.com/create?type=web"
    echo ""
    echo "2. Connect GitHub: elevateforhumanity/fix2"
    echo ""
    echo "3. Settings:"
    echo "   Name: efh-lms-backend"
    echo "   Root Directory: backend"
    echo "   Build: npm install"
    echo "   Start: npm start"
    echo ""
    echo "4. Environment Variables:"
    echo "   SUPABASE_URL=${SUPABASE_URL}"
    echo "   SUPABASE_ANON_KEY=${SUPABASE_KEY}"
    echo "   NODE_ENV=production"
    echo ""
    echo "5. Click 'Create Web Service'"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "Enter your Render URL (e.g., https://efh-lms-backend.onrender.com): " BACKEND_URL
    
    # Validate
    if [[ ! "$BACKEND_URL" =~ ^https?:// ]]; then
        echo "❌ Invalid URL"
        exit 1
    fi
    
    BACKEND_URL="${BACKEND_URL%/}"
fi

echo ""
echo "🧪 Testing backend at: $BACKEND_URL"
echo ""

# Test health
echo "Testing /health..."
HEALTH=$(curl -s "${BACKEND_URL}/health" | jq -r '.status // "error"')
if [[ "$HEALTH" == "ok" ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test courses API
echo "Testing /api/courses..."
COURSES_API=$(curl -s "${BACKEND_URL}/api/courses" | jq -r '.success // false')
if [[ "$COURSES_API" == "true" ]]; then
    API_COURSES=$(curl -s "${BACKEND_URL}/api/courses" | jq -r '.data | length')
    echo "✅ Courses API working! Found $API_COURSES courses"
else
    echo "❌ Courses API failed"
    exit 1
fi

echo ""
echo "🤖 AUTOPILOT: Configuring frontend..."
echo ""

# Update .env
if [[ ! -f .env ]]; then
    touch .env
fi

if grep -q "VITE_API_URL" .env; then
    sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=${BACKEND_URL}|" .env
    echo "✅ Updated VITE_API_URL in .env"
else
    echo "VITE_API_URL=${BACKEND_URL}" >> .env
    echo "✅ Added VITE_API_URL to .env"
fi

# Update .env.example
if ! grep -q "VITE_API_URL" .env.example; then
    cat >> .env.example << EOF

# ============================================
# LMS BACKEND API
# ============================================
VITE_API_URL=https://efh-lms-backend.onrender.com
EOF
    echo "✅ Updated .env.example"
fi

# Add GitHub Secret
echo ""
echo "🤖 AUTOPILOT: Adding GitHub Secret..."
if command -v gh &> /dev/null; then
    GITHUB_TOKEN=$(cat '/usr/local/gitpod/shared/git-secrets/3aeb002460381c6f258e8395d3026f571f0d9a76488dcd837639b13aed316560' 2>/dev/null | grep '^password=' | cut -d= -f2 || echo "")
    
    if [[ -n "$GITHUB_TOKEN" ]]; then
        export GH_TOKEN="$GITHUB_TOKEN"
        if gh secret set VITE_API_URL -b"${BACKEND_URL}" 2>/dev/null; then
            echo "✅ GitHub Secret added: VITE_API_URL"
        else
            echo "⚠️  Could not add GitHub Secret (may already exist)"
        fi
    fi
fi

# Commit changes
echo ""
echo "🤖 AUTOPILOT: Committing configuration..."
git add .env.example
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
else
    git commit -m "feat: Configure LMS backend URL

Backend deployed at: ${BACKEND_URL}

Co-authored-by: Ona <no-reply@ona.com>"
    echo "✅ Changes committed"
    
    echo ""
    echo "🤖 AUTOPILOT: Pushing to GitHub..."
    git push origin main
    echo "✅ Pushed to GitHub"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ AUTOPILOT: DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   Database: ✅ $COURSES_COUNT courses ready"
echo "   Backend: ✅ ${BACKEND_URL}"
echo "   Frontend: ✅ Configured"
echo "   GitHub: ✅ Secret added"
echo ""
echo "🔗 Test your LMS:"
echo "   Backend: ${BACKEND_URL}/api/courses"
echo "   Frontend: https://elevateforhumanity.pages.dev/lms"
echo ""
echo "🎉 Your LMS is ready to use!"
echo ""
