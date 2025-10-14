#!/bin/bash

echo "🤖 Advanced Autopilot - Complete Setup Runner"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed"
    echo ""
    echo "Install it with:"
    echo "  Ubuntu/Debian: sudo apt install gh"
    echo "  macOS: brew install gh"
    echo "  Or visit: https://cli.github.com/"
    echo ""
    echo "After installing, run: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    print_error "Not authenticated with GitHub"
    echo ""
    echo "Run: gh auth login"
    echo "Then run this script again"
    exit 1
fi

print_success "GitHub CLI authenticated"
echo ""

# Step 1: Trigger Environment Variables Setup Workflow
print_info "Step 1: Triggering Environment Variables Setup workflow..."
echo ""

gh workflow run setup-environment-variables.yml -f platform=all

if [ $? -eq 0 ]; then
    print_success "Workflow triggered successfully"
    echo ""
    print_info "Waiting for workflow to complete (this may take 2-3 minutes)..."
    sleep 10
    
    # Wait for workflow to complete
    WORKFLOW_STATUS="in_progress"
    TIMEOUT=300  # 5 minutes timeout
    ELAPSED=0
    
    while [ "$WORKFLOW_STATUS" != "completed" ] && [ $ELAPSED -lt $TIMEOUT ]; do
        sleep 10
        ELAPSED=$((ELAPSED + 10))
        
        # Get latest workflow run status
        WORKFLOW_STATUS=$(gh run list --workflow=setup-environment-variables.yml --limit 1 --json status --jq '.[0].status')
        
        echo -n "."
    done
    echo ""
    
    if [ "$WORKFLOW_STATUS" = "completed" ]; then
        print_success "Workflow completed!"
    else
        print_warning "Workflow still running or timed out"
        print_info "Check status at: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
    fi
else
    print_error "Failed to trigger workflow"
    print_info "You can manually trigger it at:"
    echo "https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions/workflows/setup-environment-variables.yml"
    exit 1
fi

echo ""

# Step 2: Trigger Render Deployment Fix Workflow
print_info "Step 2: Triggering Render Deployment Fix workflow..."
echo ""

gh workflow run fix-render-deployment.yml

if [ $? -eq 0 ]; then
    print_success "Workflow triggered successfully"
    echo ""
    print_info "Waiting for workflow to complete (this may take 3-4 minutes)..."
    sleep 10
    
    # Wait for workflow to complete
    WORKFLOW_STATUS="in_progress"
    TIMEOUT=300
    ELAPSED=0
    
    while [ "$WORKFLOW_STATUS" != "completed" ] && [ $ELAPSED -lt $TIMEOUT ]; do
        sleep 10
        ELAPSED=$((ELAPSED + 10))
        
        WORKFLOW_STATUS=$(gh run list --workflow=fix-render-deployment.yml --limit 1 --json status --jq '.[0].status')
        
        echo -n "."
    done
    echo ""
    
    if [ "$WORKFLOW_STATUS" = "completed" ]; then
        print_success "Workflow completed!"
    else
        print_warning "Workflow still running or timed out"
        print_info "Check status at: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
    fi
else
    print_error "Failed to trigger workflow"
    exit 1
fi

echo ""

# Step 3: Pull latest changes
print_info "Step 3: Pulling latest changes from GitHub..."
echo ""

git pull

if [ $? -eq 0 ]; then
    print_success "Changes pulled successfully"
else
    print_error "Failed to pull changes"
    print_info "Try manually: git pull"
    exit 1
fi

echo ""

# Step 4: Display generated files
print_info "Step 4: Checking generated files..."
echo ""

FILES_TO_CHECK=(
    "ENVIRONMENT_SETUP_CHECKLIST.md"
    "GITHUB_SECRETS_SETUP.md"
    "setup-render-env.sh"
    "setup-supabase-config.sh"
    "RENDER_DEPLOYMENT_FIX.md"
    "deploy-to-render.sh"
    "RENDER_STATUS_REPORT.md"
)

MISSING_FILES=()

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_warning "$file not found (may still be generating)"
        MISSING_FILES+=("$file")
    fi
done

echo ""

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    print_warning "Some files are missing. Workflows may still be running."
    print_info "Wait a minute and run: git pull"
    echo ""
fi

# Step 5: Display master checklist
if [ -f "ENVIRONMENT_SETUP_CHECKLIST.md" ]; then
    echo ""
    print_info "Step 5: Displaying Master Checklist..."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat ENVIRONMENT_SETUP_CHECKLIST.md
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

# Step 6: Make scripts executable
print_info "Step 6: Making setup scripts executable..."
echo ""

if [ -f "setup-render-env.sh" ]; then
    chmod +x setup-render-env.sh
    print_success "setup-render-env.sh is executable"
fi

if [ -f "setup-supabase-config.sh" ]; then
    chmod +x setup-supabase-config.sh
    print_success "setup-supabase-config.sh is executable"
fi

if [ -f "deploy-to-render.sh" ]; then
    chmod +x deploy-to-render.sh
    print_success "deploy-to-render.sh is executable"
fi

echo ""

# Step 7: Summary and next steps
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Autopilot Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Run Render setup script:"
echo "   ${GREEN}./setup-render-env.sh${NC}"
echo ""
echo "2. Run Supabase setup script:"
echo "   ${GREEN}./setup-supabase-config.sh${NC}"
echo ""
echo "3. Follow the instructions in each script"
echo ""
echo "4. Read the deployment guide:"
echo "   ${GREEN}cat RENDER_DEPLOYMENT_FIX.md${NC}"
echo ""
echo "5. Deploy to Render:"
echo "   ${GREEN}./deploy-to-render.sh${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_info "📚 Documentation Created:"
echo "  - ENVIRONMENT_SETUP_CHECKLIST.md"
echo "  - GITHUB_SECRETS_SETUP.md"
echo "  - RENDER_DEPLOYMENT_FIX.md"
echo "  - RENDER_STATUS_REPORT.md"
echo ""
print_info "🔧 Scripts Created:"
echo "  - setup-render-env.sh"
echo "  - setup-supabase-config.sh"
echo "  - deploy-to-render.sh"
echo ""
print_success "All autopilot workflows completed successfully!"
echo ""
print_info "⏱️  Total setup time: ~10-15 minutes to complete all steps"
echo ""
