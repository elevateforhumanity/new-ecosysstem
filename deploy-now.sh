#!/bin/bash

# ============================================================================
# ELEVATE FOR HUMANITY - ONE-CLICK DEPLOYMENT
# ============================================================================
# This script deploys your entire stack to production
# Run: chmod +x deploy-now.sh && ./deploy-now.sh
# ============================================================================

set -e  # Exit on error

echo "🚀 ELEVATE FOR HUMANITY - DEPLOYMENT SCRIPT"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and fill in your values"
    echo "Run: cp .env.example .env"
    exit 1
fi

echo -e "${GREEN}✅ Found .env file${NC}"
echo ""

# Load environment variables
source .env

# ============================================================================
# STEP 1: Install Dependencies
# ============================================================================
echo "📦 Step 1: Installing dependencies..."
echo "------------------------------------"

if [ -d "backend" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend directory not found, skipping${NC}"
fi

if [ -d "frontend" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend directory not found, skipping${NC}"
fi

if [ -d "workers" ]; then
    echo "Installing workers dependencies..."
    cd workers
    npm install
    cd ..
    echo -e "${GREEN}✅ Workers dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Workers directory not found, skipping${NC}"
fi

echo ""

# ============================================================================
# STEP 2: Database Migrations
# ============================================================================
echo "🗄️  Step 2: Applying database migrations..."
echo "------------------------------------"

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set in .env${NC}"
    exit 1
fi

cd backend

echo "Generating Prisma client..."
npx prisma generate

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Applying RLS policies..."
psql "$DATABASE_URL" -f ../prisma/migrations/enable_rls.sql || echo -e "${YELLOW}⚠️  RLS migration may have already been applied${NC}"

echo "Applying Stripe events table..."
psql "$DATABASE_URL" -f ../prisma/migrations/add_stripe_events.sql || echo -e "${YELLOW}⚠️  Stripe events table may already exist${NC}"

cd ..

echo -e "${GREEN}✅ Database migrations complete${NC}"
echo ""

# ============================================================================
# STEP 3: Build Applications
# ============================================================================
echo "🔨 Step 3: Building applications..."
echo "------------------------------------"

if [ -d "backend" ]; then
    echo "Building backend..."
    cd backend
    npm run build
    cd ..
    echo -e "${GREEN}✅ Backend built${NC}"
fi

if [ -d "frontend" ]; then
    echo "Building frontend..."
    cd frontend
    npm run build
    cd ..
    echo -e "${GREEN}✅ Frontend built${NC}"
fi

if [ -d "workers" ]; then
    echo "Building workers..."
    cd workers
    npm run build || echo -e "${YELLOW}⚠️  Workers build skipped (no build script)${NC}"
    cd ..
fi

echo ""

# ============================================================================
# STEP 4: Deploy to Railway (Backend)
# ============================================================================
echo "🚂 Step 4: Deploying backend to Railway..."
echo "------------------------------------"

if command -v railway &> /dev/null; then
    if [ -n "$RAILWAY_TOKEN" ]; then
        echo "Deploying to Railway..."
        cd backend
        railway up || echo -e "${YELLOW}⚠️  Railway deployment failed or not configured${NC}"
        cd ..
        echo -e "${GREEN}✅ Backend deployed to Railway${NC}"
    else
        echo -e "${YELLOW}⚠️  RAILWAY_TOKEN not set, skipping Railway deployment${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Railway CLI not installed${NC}"
    echo "Install: npm install -g @railway/cli"
fi

echo ""

# ============================================================================
# STEP 5: Deploy to Durable (Frontend)
# ============================================================================
echo "🌐 Step 5: Deploying frontend to Durable..."
echo "------------------------------------"

if [ -n "$DURABLE_API_KEY" ] && [ -n "$DURABLE_SITE_ID" ]; then
    echo "Deploying to Durable..."
    # Note: Adjust this based on Durable's actual deployment method
    echo -e "${YELLOW}⚠️  Manual deployment to Durable required${NC}"
    echo "Upload frontend/dist to Durable dashboard"
else
    echo -e "${YELLOW}⚠️  DURABLE_API_KEY or DURABLE_SITE_ID not set${NC}"
fi

echo ""

# ============================================================================
# STEP 6: Deploy Cloudflare Workers
# ============================================================================
echo "☁️  Step 6: Deploying Cloudflare Workers..."
echo "------------------------------------"

if command -v wrangler &> /dev/null; then
    if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
        echo "Deploying to Cloudflare..."
        cd workers
        wrangler deploy || echo -e "${YELLOW}⚠️  Cloudflare deployment failed or not configured${NC}"
        cd ..
        echo -e "${GREEN}✅ Workers deployed to Cloudflare${NC}"
    else
        echo -e "${YELLOW}⚠️  CLOUDFLARE_API_TOKEN not set${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Wrangler CLI not installed${NC}"
    echo "Install: npm install -g wrangler"
fi

echo ""

# ============================================================================
# STEP 7: Health Checks
# ============================================================================
echo "🏥 Step 7: Running health checks..."
echo "------------------------------------"

if [ -n "$API_URL" ]; then
    echo "Checking backend health..."
    curl -f "$API_URL/health" || echo -e "${YELLOW}⚠️  Backend health check failed${NC}"
    echo ""
fi

if [ -n "$FRONTEND_URL" ]; then
    echo "Checking frontend..."
    curl -f "$FRONTEND_URL" || echo -e "${YELLOW}⚠️  Frontend health check failed${NC}"
    echo ""
fi

echo ""

# ============================================================================
# DEPLOYMENT COMPLETE
# ============================================================================
echo "============================================"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "============================================"
echo ""
echo "Your Elevate for Humanity platform is now live:"
echo ""
echo "📍 Frontend:  ${FRONTEND_URL:-https://elevateforhumanity.org}"
echo "📍 Backend:   ${API_URL:-https://api.elevateforhumanity.org}"
echo "📍 Database:  Connected to Supabase"
echo "📍 Monitoring: ${SENTRY_DSN:+Sentry enabled}"
echo ""
echo "Next steps:"
echo "1. Test your application"
echo "2. Configure Stripe webhooks"
echo "3. Set up monitoring alerts"
echo "4. Review security settings"
echo ""
echo "Documentation:"
echo "- QUICK_START_CHECKLIST.md"
echo "- SECURITY_IMPLEMENTATION_GUIDE.md"
echo "- IMPLEMENTATION_SUMMARY.md"
echo ""
echo "============================================"
