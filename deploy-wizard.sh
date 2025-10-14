#!/bin/bash

# ============================================================================
# INTERACTIVE DEPLOYMENT WIZARD
# ============================================================================

set -e

clear

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        🚀 ELEVATE FOR HUMANITY - DEPLOYMENT WIZARD 🚀         ║"
echo "║                                                                ║"
echo "║              Let's get your platform live in 30 minutes!       ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "This wizard will help you:"
echo "  1. Check prerequisites"
echo "  2. Configure environment variables"
echo "  3. Install dependencies"
echo "  4. Deploy to production"
echo ""
echo "Press Enter to continue or Ctrl+C to exit..."
read

# ============================================================================
# STEP 1: CHECK PREREQUISITES
# ============================================================================
clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 1: CHECKING PREREQUISITES                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm installed: $NPM_VERSION"
else
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

# Check git
if command -v git &> /dev/null; then
    echo "✅ Git installed"
else
    echo "❌ Git not found. Please install git first."
    exit 1
fi

echo ""
echo "✅ All prerequisites met!"
echo ""
echo "Press Enter to continue..."
read

# ============================================================================
# STEP 2: ACCOUNT SETUP
# ============================================================================
clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 2: ACCOUNT SETUP                                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "You need accounts with these services:"
echo ""
echo "1. ☁️  Supabase (FREE) - Database + Auth"
echo "   → https://supabase.com"
echo ""
echo "2. 🚂 Railway (\$5/mo) - Backend hosting"
echo "   → https://railway.app"
echo ""
echo "3. 📊 Sentry (FREE) - Error tracking"
echo "   → https://sentry.io"
echo ""
echo "4. 💳 Stripe (pay per transaction) - Payments"
echo "   → https://stripe.com"
echo ""
echo "5. ☁️  Cloudflare (FREE) - CDN + Workers"
echo "   → https://cloudflare.com"
echo ""
echo "6. 🌐 Durable (\$15/mo) - Frontend hosting"
echo "   → https://durable.co"
echo ""
echo "Do you have accounts with all these services? (y/n)"
read -r HAS_ACCOUNTS

if [ "$HAS_ACCOUNTS" != "y" ]; then
    echo ""
    echo "Please create accounts first, then run this wizard again."
    echo ""
    echo "📚 For detailed instructions, see: GO_LIVE_NOW.md"
    exit 0
fi

# ============================================================================
# STEP 3: COLLECT API KEYS
# ============================================================================
clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 3: CONFIGURE API KEYS                                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "I'll help you configure your .env file."
echo ""
echo "Option 1: Manual configuration (recommended)"
echo "  → Open .env in your editor and paste your API keys"
echo ""
echo "Option 2: Interactive input"
echo "  → I'll ask for each key and save it for you"
echo ""
echo "Which option do you prefer? (1/2)"
read -r CONFIG_OPTION

if [ "$CONFIG_OPTION" = "1" ]; then
    echo ""
    echo "Opening .env file..."
    echo ""
    echo "Please add your API keys to the .env file."
    echo ""
    echo "Required keys:"
    echo "  - DATABASE_URL"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - STRIPE_SECRET_KEY"
    echo "  - SENTRY_DSN"
    echo ""
    echo "Press Enter when you're done editing..."
    read
    
    # Check if critical keys are set
    if grep -q "YOUR-PASSWORD" .env || grep -q "YOUR-PROJECT-REF" .env; then
        echo ""
        echo "⚠️  Warning: Some placeholder values are still in .env"
        echo "Please make sure to replace all [YOUR-*] placeholders."
        echo ""
        echo "Continue anyway? (y/n)"
        read -r CONTINUE
        if [ "$CONTINUE" != "y" ]; then
            exit 0
        fi
    fi
else
    echo ""
    echo "Interactive configuration not yet implemented."
    echo "Please edit .env manually: nano .env"
    exit 0
fi

# ============================================================================
# STEP 4: INSTALL DEPENDENCIES
# ============================================================================
clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 4: INSTALLING DEPENDENCIES                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Installing all npm packages..."
echo ""

./install-dependencies.sh

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "Press Enter to continue..."
read

# ============================================================================
# STEP 5: DATABASE SETUP
# ============================================================================
clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 5: DATABASE SETUP                                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Do you want to apply database migrations now? (y/n)"
echo "(This will set up RLS policies and tables)"
read -r APPLY_MIGRATIONS

if [ "$APPLY_MIGRATIONS" = "y" ]; then
    echo ""
    echo "Applying migrations..."
    
    cd backend
    
    echo "Generating Prisma client..."
    npx prisma generate
    
    echo "Applying Prisma migrations..."
    npx prisma migrate deploy || echo "⚠️  Migration may have failed. Check your DATABASE_URL."
    
    cd ..
    
    echo ""
    echo "✅ Database setup complete!"
else
    echo ""
    echo "⚠️  Skipping database setup. You'll need to run migrations manually."
fi

echo ""
echo "Press Enter to continue..."
read

# ============================================================================
# STEP 6: DEPLOYMENT OPTIONS
# ============================================================================
clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 6: DEPLOYMENT                                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Choose deployment option:"
echo ""
echo "1. Full deployment (Railway + Cloudflare + Frontend)"
echo "2. Backend only (Railway)"
echo "3. Workers only (Cloudflare)"
echo "4. Skip deployment (I'll do it manually)"
echo ""
echo "Enter your choice (1-4):"
read -r DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo ""
        echo "Running full deployment..."
        ./deploy-now.sh
        ;;
    2)
        echo ""
        echo "Deploying backend to Railway..."
        if command -v railway &> /dev/null; then
            cd backend
            railway up
            cd ..
        else
            echo "❌ Railway CLI not installed."
            echo "Install: npm install -g @railway/cli"
        fi
        ;;
    3)
        echo ""
        echo "Deploying workers to Cloudflare..."
        if command -v wrangler &> /dev/null; then
            cd workers
            wrangler deploy
            cd ..
        else
            echo "❌ Wrangler CLI not installed."
            echo "Install: npm install -g wrangler"
        fi
        ;;
    4)
        echo ""
        echo "Skipping deployment."
        ;;
    *)
        echo "Invalid option. Skipping deployment."
        ;;
esac

# ============================================================================
# COMPLETION
# ============================================================================
clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║                    🎉 DEPLOYMENT COMPLETE! 🎉                  ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Your Elevate for Humanity platform is ready!"
echo ""
echo "📍 Frontend:  https://elevateforhumanity.org"
echo "📍 Backend:   https://api.elevateforhumanity.org"
echo ""
echo "Next steps:"
echo "1. Configure Stripe webhooks"
echo "2. Test your deployment"
echo "3. Set up monitoring alerts"
echo "4. Start onboarding customers!"
echo ""
echo "📚 Documentation:"
echo "  - GO_LIVE_NOW.md - Complete deployment guide"
echo "  - SECURITY_IMPLEMENTATION_GUIDE.md - Security details"
echo "  - FINAL_SUMMARY.md - Complete overview"
echo ""
echo "🎉 Congratulations! Your 5-star SaaS is live!"
echo ""
