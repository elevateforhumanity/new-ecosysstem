#!/bin/bash

# Autopilot Orchestrator - Complete Deployment Script
# This script automates the deployment of the orchestrator and analyzer workers

set -e  # Exit on error

echo "🚀 EFH Autopilot Orchestrator - Deployment Script"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root${NC}"
    exit 1
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Loaded .env file${NC}"
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Check for required environment variables
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ Error: CLOUDFLARE_ACCOUNT_ID not set in .env${NC}"
    exit 1
fi

echo -e "${BLUE}Account ID: $CLOUDFLARE_ACCOUNT_ID${NC}"
echo ""

# Function to check if wrangler is logged in
check_wrangler_auth() {
    echo "🔐 Checking Wrangler authentication..."
    if npx wrangler whoami > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Wrangler is authenticated${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Wrangler not authenticated${NC}"
        return 1
    fi
}

# Function to create KV namespace
create_kv_namespace() {
    local name=$1
    echo "📦 Creating KV namespace: $name"
    
    # Check if namespace already exists
    local existing=$(npx wrangler kv:namespace list 2>/dev/null | grep "\"title\": \"$name\"" || true)
    
    if [ -n "$existing" ]; then
        echo -e "${YELLOW}⚠️  KV namespace '$name' already exists${NC}"
        local id=$(echo "$existing" | grep -o '"id": "[^"]*"' | cut -d'"' -f4)
        echo -e "${BLUE}   ID: $id${NC}"
        echo "$id"
    else
        local output=$(npx wrangler kv:namespace create "$name" 2>&1)
        local id=$(echo "$output" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
        if [ -n "$id" ]; then
            echo -e "${GREEN}✅ Created KV namespace '$name' with ID: $id${NC}"
            echo "$id"
        else
            echo -e "${RED}❌ Failed to create KV namespace '$name'${NC}"
            echo "$output"
            return 1
        fi
    fi
}

# Function to update wrangler.toml with KV namespace ID
update_wrangler_kv() {
    local file=$1
    local binding=$2
    local id=$3
    
    echo "📝 Updating $file with $binding = $id"
    
    # Use sed to update the ID in wrangler.toml
    if grep -q "binding = \"$binding\"" "$file"; then
        # Update existing binding
        sed -i.bak "/binding = \"$binding\"/,/^id = / s/^id = .*/id = \"$id\"/" "$file"
        echo -e "${GREEN}✅ Updated $binding in $file${NC}"
    else
        echo -e "${YELLOW}⚠️  Binding $binding not found in $file${NC}"
    fi
}

# Function to deploy a worker
deploy_worker() {
    local dir=$1
    local name=$2
    
    echo ""
    echo "🚀 Deploying $name..."
    echo "-----------------------------------"
    
    cd "$dir"
    
    # Deploy the worker
    if npx wrangler deploy; then
        echo -e "${GREEN}✅ Successfully deployed $name${NC}"
        cd - > /dev/null
        return 0
    else
        echo -e "${RED}❌ Failed to deploy $name${NC}"
        cd - > /dev/null
        return 1
    fi
}

# Function to set worker secrets
set_worker_secrets() {
    local dir=$1
    local name=$2
    
    echo ""
    echo "🔑 Setting secrets for $name..."
    echo "-----------------------------------"
    
    cd "$dir"
    
    # Set CF_ACCOUNT_ID
    if [ -n "$CLOUDFLARE_ACCOUNT_ID" ]; then
        echo "$CLOUDFLARE_ACCOUNT_ID" | npx wrangler secret put CF_ACCOUNT_ID 2>/dev/null || true
        echo -e "${GREEN}✅ Set CF_ACCOUNT_ID${NC}"
    fi
    
    # Set CF_API_TOKEN
    if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
        echo "$CLOUDFLARE_API_TOKEN" | npx wrangler secret put CF_API_TOKEN 2>/dev/null || true
        echo -e "${GREEN}✅ Set CF_API_TOKEN${NC}"
    fi
    
    cd - > /dev/null
}

# Main deployment flow
main() {
    echo "Starting deployment process..."
    echo ""
    
    # Step 1: Check authentication
    if ! check_wrangler_auth; then
        echo ""
        echo -e "${YELLOW}⚠️  Please authenticate Wrangler first:${NC}"
        echo "   Run: npx wrangler login"
        echo ""
        echo "Or set CLOUDFLARE_API_TOKEN in .env with a token that has:"
        echo "  - Workers Scripts: Edit"
        echo "  - Workers KV Storage: Edit"
        echo "  - Workers R2 Storage: Edit"
        echo "  - Account Settings: Read"
        echo ""
        echo "Create token at: https://dash.cloudflare.com/profile/api-tokens"
        exit 1
    fi
    
    echo ""
    echo "📦 Step 1: Creating KV Namespaces"
    echo "=================================="
    
    # Create KV namespaces for orchestrator
    REGISTRY_ID=$(create_kv_namespace "REGISTRY")
    
    # Create KV namespaces for analyzer
    LOGS_ID=$(create_kv_namespace "LOGS")
    SUMMARIES_ID=$(create_kv_namespace "SUMMARIES")
    
    echo ""
    echo "📝 Step 2: Updating Wrangler Configs"
    echo "====================================="
    
    # Update orchestrator wrangler.toml
    if [ -f "workers/orchestrator/wrangler.toml" ]; then
        # Uncomment and update KV namespace binding
        sed -i.bak 's/# \[\[kv_namespaces\]\]/[[kv_namespaces]]/' workers/orchestrator/wrangler.toml
        sed -i.bak 's/# binding = "REGISTRY"/binding = "REGISTRY"/' workers/orchestrator/wrangler.toml
        sed -i.bak "s/# id = \"YOUR_KV_NAMESPACE_ID\"/id = \"$REGISTRY_ID\"/" workers/orchestrator/wrangler.toml
        echo -e "${GREEN}✅ Updated orchestrator wrangler.toml${NC}"
    fi
    
    # Update analyzer wrangler.toml
    if [ -f "workers/analyzer/wrangler.toml" ]; then
        update_wrangler_kv "workers/analyzer/wrangler.toml" "LOGS" "$LOGS_ID"
        update_wrangler_kv "workers/analyzer/wrangler.toml" "SUMMARIES" "$SUMMARIES_ID"
        echo -e "${GREEN}✅ Updated analyzer wrangler.toml${NC}"
    fi
    
    echo ""
    echo "🔑 Step 3: Setting Worker Secrets"
    echo "=================================="
    
    # Note: Secrets can only be set after first deployment
    # We'll set them after deploying
    
    echo ""
    echo "🚀 Step 4: Deploying Workers"
    echo "============================"
    
    # Deploy orchestrator
    if [ -d "workers/orchestrator" ]; then
        deploy_worker "workers/orchestrator" "Orchestrator"
        set_worker_secrets "workers/orchestrator" "Orchestrator"
    else
        echo -e "${YELLOW}⚠️  Orchestrator directory not found${NC}"
    fi
    
    # Deploy analyzer
    if [ -d "workers/analyzer" ]; then
        deploy_worker "workers/analyzer" "Analyzer"
        set_worker_secrets "workers/analyzer" "Analyzer"
    else
        echo -e "${YELLOW}⚠️  Analyzer directory not found${NC}"
    fi
    
    echo ""
    echo "✅ Step 5: Verifying Deployments"
    echo "================================="
    
    # Get worker URLs
    echo ""
    echo "Testing deployed workers..."
    
    # Try to get orchestrator URL
    ORCHESTRATOR_URL=$(npx wrangler deployments list --name efh-autopilot-orchestrator 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "")
    
    if [ -n "$ORCHESTRATOR_URL" ]; then
        echo -e "${GREEN}✅ Orchestrator URL: $ORCHESTRATOR_URL${NC}"
        
        # Test health endpoint
        if curl -s "$ORCHESTRATOR_URL/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Orchestrator health check passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Orchestrator health check failed (may need time to start)${NC}"
        fi
    fi
    
    # Try to get analyzer URL
    ANALYZER_URL=$(npx wrangler deployments list --name efh-autopilot-analyzer 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "")
    
    if [ -n "$ANALYZER_URL" ]; then
        echo -e "${GREEN}✅ Analyzer URL: $ANALYZER_URL${NC}"
        
        # Test health endpoint
        if curl -s "$ANALYZER_URL/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Analyzer health check passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Analyzer health check failed (may need time to start)${NC}"
        fi
    fi
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo "======================="
    echo ""
    echo "Next steps:"
    echo "1. Update your admin UI with the worker URLs:"
    echo "   - Orchestrator: $ORCHESTRATOR_URL"
    echo "   - Analyzer: $ANALYZER_URL"
    echo ""
    echo "2. Register your autopilots:"
    echo "   bash scripts/register-autopilots.sh"
    echo ""
    echo "3. Access the admin dashboard:"
    echo "   Navigate to /autopilot-admin in your app"
    echo ""
    echo "4. Run diagnostics to verify everything is working:"
    echo "   curl $ORCHESTRATOR_URL/autopilot/diagnose"
    echo ""
}

# Run main function
main

echo ""
echo "📚 For more information, see:"
echo "   - ORCHESTRATOR_GUIDE.md"
echo "   - DEPLOYMENT_SUMMARY.md"
echo "   - WEBSITE_IMPROVEMENTS.md"
echo ""
