#!/bin/bash

# ============================================================================
# ENVIRONMENT CONFIGURATION HELPER
# ============================================================================

echo "🔧 ELEVATE FOR HUMANITY - ENVIRONMENT CONFIGURATION"
echo "===================================================="
echo ""
echo "This script will help you configure your .env file."
echo "You'll need API keys from:"
echo "  - Supabase (database)"
echo "  - Railway (backend hosting)"
echo "  - Sentry (error tracking)"
echo "  - Stripe (payments)"
echo "  - Cloudflare (CDN/Workers)"
echo "  - Durable (frontend hosting)"
echo ""
echo "Press Enter to continue or Ctrl+C to exit..."
read

# Generate secrets
echo "🔐 Generating secure secrets..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo "✅ Generated JWT_SECRET"
echo "✅ Generated ENCRYPTION_KEY"
echo "✅ Generated SESSION_SECRET"
echo ""

# Update .env file with generated secrets
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env

echo "✅ Secrets added to .env file"
echo ""

echo "📋 NEXT STEPS:"
echo "=============="
echo ""
echo "1. Open .env file and add your API keys:"
echo "   nano .env"
echo ""
echo "2. Required keys to add:"
echo "   - DATABASE_URL (from Supabase)"
echo "   - SUPABASE_URL (from Supabase)"
echo "   - SUPABASE_ANON_KEY (from Supabase)"
echo "   - SUPABASE_SERVICE_ROLE_KEY (from Supabase)"
echo "   - STRIPE_SECRET_KEY (from Stripe)"
echo "   - SENTRY_DSN (from Sentry)"
echo "   - RAILWAY_TOKEN (from Railway)"
echo "   - CLOUDFLARE_API_TOKEN (from Cloudflare)"
echo "   - DURABLE_API_KEY (from Durable)"
echo ""
echo "3. After adding keys, run:"
echo "   ./deploy-now.sh"
echo ""
echo "📚 For detailed instructions, see: GO_LIVE_NOW.md"
echo ""
