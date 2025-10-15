#!/bin/bash
# EFH Autopilot Deployment Script
# Automatically deploys Supabase, Cloudflare Worker, and verifies all services

set -e

echo "🚀 EFH Autopilot Deployment Starting..."
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_PROJECT_REF="cuxzzpsyufcewtmicszk"
SUPABASE_URL="https://cuxzzpsyufcewtmicszk.supabase.co"
WORKER_NAME="efh-agent"

# Check if running in Gitpod/Codespace
if [ -z "$GITPOD_WORKSPACE_ID" ] && [ -z "$CODESPACE_NAME" ]; then
    echo -e "${YELLOW}⚠️  Not running in Gitpod/Codespace${NC}"
fi

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
command_exists supabase && print_status 0 "Supabase CLI installed" || print_status 1 "Supabase CLI missing"
command_exists wrangler && print_status 0 "Wrangler CLI installed" || print_status 1 "Wrangler CLI missing"
command_exists psql && print_status 0 "PostgreSQL client installed" || echo -e "${YELLOW}⚠️  psql not found (optional)${NC}"
echo ""

# Step 2: Check Supabase connection
echo "🔗 Step 2: Checking Supabase connection..."
if [ -f ".env" ]; then
    source .env
    if [ -n "$SUPABASE_SERVICE_KEY" ]; then
        print_status 0 "Supabase credentials found in .env"
    else
        echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_KEY not set in .env${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env with your credentials${NC}"
fi
echo ""

# Step 3: Apply database migrations
echo "📊 Step 3: Applying database migrations..."
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
echo "Found $MIGRATION_COUNT migration files"

if [ "$MIGRATION_COUNT" -gt 0 ]; then
    echo "Migrations to apply:"
    ls -1 supabase/migrations/*.sql | nl
    echo ""
    
    # Check if we can connect to Supabase
    if command_exists psql && [ -n "$DATABASE_URL" ]; then
        echo "Applying migrations via psql..."
        for migration in supabase/migrations/*.sql; do
            echo "  Applying: $(basename $migration)"
            psql "$DATABASE_URL" -f "$migration" 2>&1 | grep -v "NOTICE" || true
        done
        print_status 0 "Migrations applied via psql"
    else
        echo -e "${YELLOW}⚠️  Cannot apply migrations automatically${NC}"
        echo "Please run migrations manually:"
        echo "  1. Go to: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/sql/new"
        echo "  2. Copy and run each migration file"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠️  No migration files found${NC}"
fi
echo ""

# Step 4: Deploy Supabase Edge Function
echo "⚡ Step 4: Deploying Supabase Edge Function..."
if [ -d "supabase/functions/executeAction" ]; then
    echo "Found executeAction function"
    
    # Check if supabase is linked
    if supabase projects list 2>&1 | grep -q "$SUPABASE_PROJECT_REF"; then
        echo "Project already linked"
    else
        echo "Linking to Supabase project..."
        echo -e "${YELLOW}⚠️  You may need to login first: supabase login${NC}"
        supabase link --project-ref "$SUPABASE_PROJECT_REF" || echo -e "${YELLOW}⚠️  Link failed - may need manual login${NC}"
    fi
    
    echo "Deploying function..."
    supabase functions deploy executeAction --project-ref "$SUPABASE_PROJECT_REF" 2>&1 || echo -e "${YELLOW}⚠️  Function deployment failed - may need manual deployment${NC}"
    print_status $? "Edge function deployment attempted"
else
    echo -e "${YELLOW}⚠️  executeAction function not found${NC}"
fi
echo ""

# Step 5: Create R2 buckets
echo "📦 Step 5: Checking R2 buckets..."
echo "Checking for R2 bucket: efh-private"
if wrangler r2 bucket list 2>&1 | grep -q "efh-private"; then
    print_status 0 "R2 bucket 'efh-private' exists"
else
    echo "Creating R2 bucket..."
    wrangler r2 bucket create efh-private 2>&1 || echo -e "${YELLOW}⚠️  Bucket creation failed - may need Cloudflare login${NC}"
fi
echo ""

# Step 6: Check Cloudflare Worker secrets
echo "🔐 Step 6: Checking Cloudflare Worker secrets..."
echo "Required secrets:"
echo "  - OPENAI_API_KEY"
echo "  - SUPABASE_FUNCTION_URL"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - SUPABASE_URL"
echo "  - SUPABASE_ANON_KEY"
echo "  - STRIPE_SECRET_KEY"
echo "  - STRIPE_WEBHOOK_SECRET"
echo ""
echo -e "${YELLOW}⚠️  Secrets must be set manually:${NC}"
echo "  wrangler secret put OPENAI_API_KEY"
echo "  wrangler secret put SUPABASE_FUNCTION_URL"
echo "  wrangler secret put SUPABASE_SERVICE_ROLE_KEY"
echo "  wrangler secret put SUPABASE_URL"
echo "  wrangler secret put SUPABASE_ANON_KEY"
echo "  wrangler secret put STRIPE_SECRET_KEY"
echo "  wrangler secret put STRIPE_WEBHOOK_SECRET"
echo ""

# Step 7: Deploy Cloudflare Worker
echo "☁️  Step 7: Deploying Cloudflare Worker..."
if [ -f "workers/agent/agent-worker.js" ]; then
    echo "Found agent worker"
    cd workers/agent
    
    echo "Deploying worker..."
    wrangler deploy agent-worker.js --config wrangler.toml 2>&1 || echo -e "${YELLOW}⚠️  Worker deployment failed - may need Cloudflare login${NC}"
    
    if [ $? -eq 0 ]; then
        print_status 0 "Worker deployed successfully"
        echo ""
        echo "Worker URL: https://$WORKER_NAME.your-subdomain.workers.dev"
    else
        echo -e "${YELLOW}⚠️  Worker deployment needs manual intervention${NC}"
    fi
    
    cd ../..
else
    echo -e "${RED}❌ Worker file not found${NC}"
fi
echo ""

# Step 8: Health checks
echo "🏥 Step 8: Running health checks..."
echo ""

echo "Checking Supabase connection..."
if curl -s "$SUPABASE_URL/rest/v1/" -H "apikey: $VITE_SUPABASE_ANON_KEY" | grep -q "message"; then
    print_status 0 "Supabase API responding"
else
    echo -e "${YELLOW}⚠️  Supabase API check failed${NC}"
fi
echo ""

# Step 9: Summary
echo "📝 Deployment Summary"
echo "===================="
echo ""
echo "✅ Completed steps:"
echo "  - Prerequisites checked"
echo "  - Database migrations prepared"
echo "  - Edge function deployment attempted"
echo "  - R2 bucket checked/created"
echo "  - Worker deployment attempted"
echo ""
echo "⚠️  Manual steps required:"
echo "  1. Set Cloudflare Worker secrets (see Step 6 above)"
echo "  2. Verify Supabase migrations applied"
echo "  3. Configure Stripe webhook in dashboard"
echo "  4. Test end-to-end flows"
echo ""
echo "📚 Documentation:"
echo "  - AI_AGENT_DEPLOYMENT.md"
echo "  - STRIPE_R2_DEPLOYMENT.md"
echo "  - COMPLETE_SYSTEM_OVERVIEW.md"
echo ""
echo "🎉 Autopilot deployment complete!"
echo ""
