#!/bin/bash
# Setup GitHub Repository Secrets for Cloudflare Pages Deployment
# This script helps configure secrets needed for automatic deployments

echo "🔐 GITHUB REPOSITORY SECRETS SETUP"
echo "==================================="
echo ""

REPO="elevateforhumanity/fix2"
CLOUDFLARE_API_TOKEN="Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS"
CLOUDFLARE_ACCOUNT_ID="6ba1d2a52a3fa230972960db307ac7c0"

echo "Repository: $REPO"
echo ""

# Check if gh CLI is available and authenticated
if command -v gh &> /dev/null; then
    if gh auth status 2>&1 | grep -q "Logged in"; then
        echo "✅ GitHub CLI authenticated"
        echo ""
        
        echo "## Setting up secrets..."
        echo ""
        
        # Set CLOUDFLARE_API_TOKEN
        echo "Setting CLOUDFLARE_API_TOKEN..."
        echo "$CLOUDFLARE_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN --repo "$REPO" 2>&1
        
        # Set CLOUDFLARE_ACCOUNT_ID
        echo "Setting CLOUDFLARE_ACCOUNT_ID..."
        echo "$CLOUDFLARE_ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID --repo "$REPO" 2>&1
        
        # Get CLOUDFLARE_ZONE_ID
        echo ""
        echo "## CLOUDFLARE_ZONE_ID"
        echo "--------------------"
        echo "To get your Zone ID:"
        echo "1. Go to: https://dash.cloudflare.com/"
        echo "2. Click on your domain"
        echo "3. Scroll down in Overview tab"
        echo "4. Copy 'Zone ID' from right sidebar"
        echo ""
        read -p "Enter your CLOUDFLARE_ZONE_ID (or press Enter to skip): " ZONE_ID
        
        if [ -n "$ZONE_ID" ]; then
            echo "$ZONE_ID" | gh secret set CLOUDFLARE_ZONE_ID --repo "$REPO" 2>&1
            echo "✅ CLOUDFLARE_ZONE_ID set"
        else
            echo "⚠️  Skipped CLOUDFLARE_ZONE_ID (you can set it later)"
        fi
        
        echo ""
        echo "## Verifying secrets..."
        gh secret list --repo "$REPO"
        
        echo ""
        echo "✅ GitHub secrets configured!"
        
    else
        echo "❌ GitHub CLI not authenticated"
        echo ""
        echo "Please run: gh auth login"
        echo ""
        echo "Or use the manual method below."
    fi
else
    echo "❌ GitHub CLI not installed"
    echo ""
    echo "Please use the manual method below."
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "MANUAL METHOD: Configure Secrets via GitHub Web Interface"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Go to: https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "2. Click 'New repository secret' for each of the following:"
echo ""
echo "   Secret Name: CLOUDFLARE_API_TOKEN"
echo "   Value: $CLOUDFLARE_API_TOKEN"
echo ""
echo "   Secret Name: CLOUDFLARE_ACCOUNT_ID"
echo "   Value: $CLOUDFLARE_ACCOUNT_ID"
echo ""
echo "   Secret Name: CLOUDFLARE_ZONE_ID"
echo "   Value: [Get from Cloudflare Dashboard]"
echo ""
echo "3. To get CLOUDFLARE_ZONE_ID:"
echo "   - Go to: https://dash.cloudflare.com/"
echo "   - Click on your domain"
echo "   - Find 'Zone ID' in the right sidebar"
echo "   - Copy and paste as the secret value"
echo ""
echo "4. After adding all secrets, GitHub Actions will automatically"
echo "   deploy to Cloudflare Pages on every push to main branch"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "## VERIFICATION"
echo "---------------"
echo "After setting secrets, verify by:"
echo "1. Making a commit and pushing to main branch"
echo "2. Check: https://github.com/$REPO/actions"
echo "3. Look for 'Deploy to Cloudflare Pages' workflow"
echo "4. Verify it runs successfully"
echo ""

echo "## CURRENT WORKFLOW"
echo "-------------------"
echo "File: .github/workflows/cloudflare-deploy.yml"
echo "Triggers on: push to main branch"
echo "Deploys to: Cloudflare Pages (elevateforhumanity project)"
echo ""

echo "✅ Setup guide complete!"
