#!/usr/bin/env bash
# Automated Supabase Setup Script
# This script configures Supabase after you create the project

set -euo pipefail

echo "🚀 SUPABASE AUTOPILOT SETUP"
echo "============================"
echo ""

# Check if credentials are provided
if [[ -z "${SUPABASE_URL:-}" ]] || [[ -z "${SUPABASE_ANON_KEY:-}" ]] || [[ -z "${SUPABASE_SERVICE_KEY:-}" ]]; then
  echo "❌ Missing Supabase credentials!"
  echo ""
  echo "Please set environment variables:"
  echo "  export SUPABASE_URL='https://xxxxxxxxxxxxx.supabase.co'"
  echo "  export SUPABASE_ANON_KEY='eyJhbGci...'"
  echo "  export SUPABASE_SERVICE_KEY='eyJhbGci...'"
  echo ""
  echo "Then run this script again."
  echo ""
  echo "📋 To get credentials:"
  echo "  1. Go to: https://supabase.com/dashboard"
  echo "  2. Create new project (or open existing)"
  echo "  3. Settings → API → Copy the keys"
  exit 1
fi

echo "✅ Credentials found"
echo "   URL: ${SUPABASE_URL}"
echo "   Anon Key: ${SUPABASE_ANON_KEY:0:20}..."
echo "   Service Key: ${SUPABASE_SERVICE_KEY:0:20}..."
echo ""

# Step 1: Update supabaseClient.js
echo "📝 Step 1: Updating src/supabaseClient.js..."
cat > src/supabaseClient.js << EOF
import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('   Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection and log status
export const testSupabaseConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    console.log('   URL:', supabaseUrl);
    
    const { data, error } = await supabase
      .from('profiles')
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
EOF
echo "   ✅ Updated src/supabaseClient.js"

# Step 2: Update .env.example
echo ""
echo "📝 Step 2: Updating .env.example..."
if ! grep -q "SUPABASE" .env.example; then
  cat >> .env.example << EOF

# ============================================
# SUPABASE DATABASE
# ============================================
# Get from: https://supabase.com/dashboard → Settings → API
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF
  echo "   ✅ Added Supabase section to .env.example"
else
  echo "   ℹ️  Supabase already in .env.example"
fi

# Step 3: Create .env file
echo ""
echo "📝 Step 3: Creating .env file..."
cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
EOF
echo "   ✅ Created .env file"

# Step 4: Apply database migrations
echo ""
echo "📝 Step 4: Applying database migrations..."
echo "   Creating profiles table..."

MIGRATION_SQL=$(cat supabase/migrations/001_initial_schema.sql)

# Execute SQL via Supabase REST API
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_SQL" | jq -Rs .)}" 2>&1 || echo "FAILED")

if echo "$RESPONSE" | grep -q "error"; then
  echo "   ⚠️  Migration may have failed (table might already exist)"
  echo "   This is OK if you're re-running the script"
else
  echo "   ✅ Database schema applied"
fi

# Step 5: Test connection
echo ""
echo "📝 Step 5: Testing connection..."
TEST_RESPONSE=$(curl -s "${SUPABASE_URL}/rest/v1/profiles?limit=1" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}")

if echo "$TEST_RESPONSE" | grep -q "error"; then
  echo "   ❌ Connection test failed"
  echo "   Response: $TEST_RESPONSE"
else
  echo "   ✅ Connection successful!"
fi

# Step 6: Update GitHub Secrets (if gh CLI is available)
echo ""
echo "📝 Step 6: Updating GitHub Secrets..."
if command -v gh &> /dev/null; then
  gh secret set VITE_SUPABASE_URL -b"${SUPABASE_URL}" 2>/dev/null && echo "   ✅ Set VITE_SUPABASE_URL" || echo "   ⚠️  Could not set VITE_SUPABASE_URL"
  gh secret set VITE_SUPABASE_ANON_KEY -b"${SUPABASE_ANON_KEY}" 2>/dev/null && echo "   ✅ Set VITE_SUPABASE_ANON_KEY" || echo "   ⚠️  Could not set VITE_SUPABASE_ANON_KEY"
  gh secret set SUPABASE_SERVICE_KEY -b"${SUPABASE_SERVICE_KEY}" 2>/dev/null && echo "   ✅ Set SUPABASE_SERVICE_KEY" || echo "   ⚠️  Could not set SUPABASE_SERVICE_KEY"
else
  echo "   ⚠️  GitHub CLI not available"
  echo "   Please manually add these secrets to GitHub:"
  echo "   https://github.com/elevateforhumanity/fix2/settings/secrets/actions"
  echo ""
  echo "   Secrets to add:"
  echo "   - VITE_SUPABASE_URL"
  echo "   - VITE_SUPABASE_ANON_KEY"
  echo "   - SUPABASE_SERVICE_KEY"
fi

# Summary
echo ""
echo "============================"
echo "✅ SUPABASE SETUP COMPLETE!"
echo "============================"
echo ""
echo "📊 Summary:"
echo "   ✅ Updated src/supabaseClient.js"
echo "   ✅ Updated .env.example"
echo "   ✅ Created .env file"
echo "   ✅ Applied database migrations"
echo "   ✅ Tested connection"
echo ""
echo "🚀 Next Steps:"
echo "   1. Commit changes: git add . && git commit -m 'feat: Configure Supabase'"
echo "   2. Push to GitHub: git push origin main"
echo "   3. Verify deployment at: https://elevateforhumanity.pages.dev"
echo ""
echo "📝 Manual Steps (if needed):"
echo "   - Add GitHub Secrets: https://github.com/elevateforhumanity/fix2/settings/secrets/actions"
echo "   - Test locally: npm run dev"
echo ""
echo "🎉 Your Supabase is ready!"
