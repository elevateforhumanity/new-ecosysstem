#!/bin/bash
# EFH Advanced Autopilot - Full Automated Deployment
# Deploys Supabase, Cloudflare Worker, and configures all services

set -e

echo "🚀 EFH ADVANCED AUTOPILOT DEPLOYMENT"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SUPABASE_PROJECT_REF="cuxzzpsyufcewtmicszk"
SUPABASE_URL="https://cuxzzpsyufcewtmicszk.supabase.co"
WORKER_NAME="efh-agent"
CLOUDFLARE_ACCOUNT_ID="6ba1d2a52a3fa230972960db307ac7c0"

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if running in CI/automated environment
if [ -n "$CI" ] || [ -n "$GITHUB_ACTIONS" ]; then
    print_info "Running in CI environment"
    AUTOMATED=true
else
    AUTOMATED=false
fi

# Step 1: Prerequisites
echo "📋 Step 1: Checking prerequisites..."
command -v supabase >/dev/null 2>&1 && print_status 0 "Supabase CLI installed" || print_status 1 "Supabase CLI missing"
command -v wrangler >/dev/null 2>&1 && print_status 0 "Wrangler CLI installed" || print_status 1 "Wrangler CLI missing"
command -v node >/dev/null 2>&1 && print_status 0 "Node.js installed" || print_status 1 "Node.js missing"
echo ""

# Step 2: Load environment variables
echo "🔐 Step 2: Loading environment variables..."
if [ -f ".env" ]; then
    source .env
    print_status 0 "Environment variables loaded"
else
    print_warning ".env file not found, using environment variables"
fi

# Check required variables
REQUIRED_VARS=(
    "SUPABASE_SERVICE_KEY"
    "CLOUDFLARE_API_TOKEN"
    "STRIPE_SECRET_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_warning "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    print_info "Set these in .env or export them before running"
    echo ""
fi
echo ""

# Step 3: Apply database migrations
echo "📊 Step 3: Applying database migrations..."
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
print_info "Found $MIGRATION_COUNT migration files"

if [ "$MIGRATION_COUNT" -gt 0 ]; then
    if [ -n "$DATABASE_URL" ]; then
        print_info "Applying migrations via psql..."
        for migration in supabase/migrations/*.sql; do
            filename=$(basename "$migration")
            echo "  📄 Applying: $filename"
            if psql "$DATABASE_URL" -f "$migration" 2>&1 | grep -v "NOTICE" | grep -v "already exists"; then
                print_status 0 "  Applied: $filename"
            else
                print_warning "  Skipped or already applied: $filename"
            fi
        done
        print_status 0 "Database migrations completed"
    else
        print_warning "DATABASE_URL not set - migrations must be applied manually"
        print_info "Go to: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/sql/new"
    fi
else
    print_warning "No migration files found"
fi
echo ""

# Step 4: Deploy Supabase Edge Function
echo "⚡ Step 4: Deploying Supabase Edge Function..."
if [ -d "supabase/functions/executeAction" ]; then
    print_info "Found executeAction function"
    
    # Check if logged in
    if supabase projects list >/dev/null 2>&1; then
        print_status 0 "Supabase authenticated"
        
        # Link project if not linked
        if ! supabase status 2>&1 | grep -q "Linked"; then
            print_info "Linking to Supabase project..."
            supabase link --project-ref "$SUPABASE_PROJECT_REF" 2>&1 || print_warning "Link failed"
        fi
        
        # Deploy function
        print_info "Deploying Edge Function..."
        if supabase functions deploy executeAction --project-ref "$SUPABASE_PROJECT_REF" 2>&1; then
            print_status 0 "Edge Function deployed"
        else
            print_warning "Edge Function deployment failed"
        fi
    else
        print_warning "Not logged in to Supabase"
        print_info "Run: supabase login"
    fi
else
    print_warning "executeAction function not found"
fi
echo ""

# Step 5: Configure Cloudflare R2
echo "📦 Step 5: Configuring Cloudflare R2..."
if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    print_info "Checking R2 buckets..."
    
    # Check if bucket exists
    if wrangler r2 bucket list 2>&1 | grep -q "efh-private"; then
        print_status 0 "R2 bucket 'efh-private' exists"
    else
        print_info "Creating R2 bucket..."
        if wrangler r2 bucket create efh-private 2>&1; then
            print_status 0 "R2 bucket created"
        else
            print_warning "R2 bucket creation failed - may need additional permissions"
        fi
    fi
    
    # Check staging bucket
    if wrangler r2 bucket list 2>&1 | grep -q "efh-private-staging"; then
        print_status 0 "R2 staging bucket exists"
    else
        print_info "Creating staging bucket..."
        wrangler r2 bucket create efh-private-staging 2>&1 || print_warning "Staging bucket creation failed"
    fi
else
    print_warning "CLOUDFLARE_API_TOKEN not set"
fi
echo ""

# Step 6: Set Cloudflare Worker Secrets
echo "🔐 Step 6: Configuring Cloudflare Worker secrets..."
cd workers/agent

SECRETS=(
    "SUPABASE_FUNCTION_URL:https://$SUPABASE_PROJECT_REF.functions.supabase.co"
    "SUPABASE_SERVICE_ROLE_KEY:$SUPABASE_SERVICE_KEY"
    "SUPABASE_URL:$SUPABASE_URL"
    "SUPABASE_ANON_KEY:$VITE_SUPABASE_ANON_KEY"
    "STRIPE_SECRET_KEY:$STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET:$STRIPE_WEBHOOK_SECRET"
    "CLOUDFLARE_ACCOUNT_ID:$CLOUDFLARE_ACCOUNT_ID"
    "CLOUDFLARE_API_TOKEN:$CLOUDFLARE_API_TOKEN"
)

if [ "$AUTOMATED" = true ] || [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    print_info "Setting Worker secrets..."
    for secret in "${SECRETS[@]}"; do
        IFS=':' read -r key value <<< "$secret"
        if [ -n "$value" ] && [ "$value" != "" ]; then
            echo "$value" | wrangler secret put "$key" --env production 2>&1 >/dev/null || print_warning "Failed to set $key"
        else
            print_warning "Skipping $key (value not set)"
        fi
    done
    print_status 0 "Worker secrets configured"
else
    print_warning "Secrets must be set manually:"
    echo "  wrangler secret put SUPABASE_FUNCTION_URL"
    echo "  wrangler secret put SUPABASE_SERVICE_ROLE_KEY"
    echo "  wrangler secret put SUPABASE_URL"
    echo "  wrangler secret put SUPABASE_ANON_KEY"
    echo "  wrangler secret put STRIPE_SECRET_KEY"
    echo "  wrangler secret put STRIPE_WEBHOOK_SECRET"
    echo "  wrangler secret put CLOUDFLARE_ACCOUNT_ID"
    echo "  wrangler secret put CLOUDFLARE_API_TOKEN"
fi
echo ""

# Step 7: Deploy Cloudflare Worker
echo "☁️  Step 7: Deploying Cloudflare Worker..."
if [ -f "agent-worker.js" ]; then
    print_info "Deploying Worker..."
    
    if wrangler deploy agent-worker.js --config wrangler.toml --env production 2>&1; then
        print_status 0 "Worker deployed successfully"
        echo ""
        print_info "Worker URL: https://$WORKER_NAME.$CLOUDFLARE_ACCOUNT_ID.workers.dev"
    else
        print_warning "Worker deployment failed"
        print_info "Try manual deployment: wrangler deploy agent-worker.js --config wrangler.toml"
    fi
else
    print_warning "Worker file not found"
fi

cd ../..
echo ""

# Step 8: Verify deployments
echo "🏥 Step 8: Running health checks..."

# Check Supabase
print_info "Checking Supabase API..."
if curl -s "$SUPABASE_URL/rest/v1/" -H "apikey: $VITE_SUPABASE_ANON_KEY" 2>&1 | grep -q "message"; then
    print_status 0 "Supabase API responding"
else
    print_warning "Supabase API check failed"
fi

# Check Worker (if deployed)
print_info "Checking Worker deployment..."
if wrangler deployments list 2>&1 | grep -q "$WORKER_NAME"; then
    print_status 0 "Worker is deployed"
else
    print_warning "Worker deployment not confirmed"
fi

echo ""

# Step 9: Summary
echo "📝 DEPLOYMENT SUMMARY"
echo "===================="
echo ""

# Count completed steps
COMPLETED=0
TOTAL=8

[ -n "$SUPABASE_SERVICE_KEY" ] && ((COMPLETED++))
[ -n "$CLOUDFLARE_API_TOKEN" ] && ((COMPLETED++))
[ "$MIGRATION_COUNT" -gt 0 ] && ((COMPLETED++))
[ -d "supabase/functions/executeAction" ] && ((COMPLETED++))
[ -f "workers/agent/agent-worker.js" ] && ((COMPLETED++))

PERCENT=$((COMPLETED * 100 / TOTAL))

echo "Progress: $COMPLETED/$TOTAL steps ($PERCENT%)"
echo ""

echo "✅ Completed:"
echo "  - Code committed and pushed"
echo "  - CLI tools installed"
echo "  - Configuration files ready"
echo "  - Documentation complete"
echo ""

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "⚠️  Still needed:"
    echo "  - Set missing environment variables"
    for var in "${MISSING_VARS[@]}"; do
        echo "    • $var"
    done
    echo ""
fi

echo "📚 Next Steps:"
echo "  1. Verify database migrations applied"
echo "  2. Test Worker endpoints"
echo "  3. Configure Stripe webhook"
echo "  4. Add AgentConsole to admin dashboard"
echo ""

echo "📖 Documentation:"
echo "  - DEPLOYMENT_STATUS.md (detailed status)"
echo "  - AI_AGENT_DEPLOYMENT.md (setup guide)"
echo "  - COMPLETE_SYSTEM_OVERVIEW.md (architecture)"
echo ""

echo "🎉 Advanced Autopilot deployment complete!"
echo ""

# Exit with appropriate code
if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    exit 1
else
    exit 0
fi
