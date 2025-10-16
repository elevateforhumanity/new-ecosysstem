#!/bin/bash
# Verify GitHub Secrets are configured correctly

echo "🔍 GITHUB SECRETS VERIFICATION"
echo "==============================="
echo ""

REPO="elevateforhumanity/fix2"

# Check if GH_TOKEN is set
if [ -z "$GH_TOKEN" ]; then
    echo "⚠️  GH_TOKEN not set - using GitHub CLI if available"
    echo ""
    
    # Try using gh CLI
    if command -v gh &> /dev/null; then
        if gh auth status 2>&1 | grep -q "Logged in"; then
            echo "✅ Using GitHub CLI authentication"
            echo ""
            
            echo "## Listing secrets..."
            gh secret list --repo "$REPO"
            
            echo ""
            echo "## Checking required secrets..."
            
            SECRETS=$(gh secret list --repo "$REPO" 2>&1)
            
            if echo "$SECRETS" | grep -q "CLOUDFLARE_API_TOKEN"; then
                echo "✅ CLOUDFLARE_API_TOKEN is set"
            else
                echo "❌ CLOUDFLARE_API_TOKEN is missing"
            fi
            
            if echo "$SECRETS" | grep -q "CLOUDFLARE_ACCOUNT_ID"; then
                echo "✅ CLOUDFLARE_ACCOUNT_ID is set"
            else
                echo "❌ CLOUDFLARE_ACCOUNT_ID is missing"
            fi
            
            if echo "$SECRETS" | grep -q "CLOUDFLARE_ZONE_ID"; then
                echo "✅ CLOUDFLARE_ZONE_ID is set"
            else
                echo "⚠️  CLOUDFLARE_ZONE_ID is missing (optional)"
            fi
            
            exit 0
        fi
    fi
    
    echo "To verify secrets, either:"
    echo "1. Set GH_TOKEN: export GH_TOKEN='your_token'"
    echo "2. Authenticate gh CLI: gh auth login"
    echo "3. Check manually: https://github.com/$REPO/settings/secrets/actions"
    echo ""
    exit 1
fi

echo "✅ GitHub token found"
echo ""

# Use GitHub API to list secrets
echo "## Fetching secrets from GitHub API..."
echo ""

RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" \
    "https://api.github.com/repos/$REPO/actions/secrets")

if echo "$RESPONSE" | grep -q "message.*Not Found"; then
    echo "❌ Repository not found or token lacks permissions"
    echo "   Make sure your token has 'repo' scope"
    exit 1
fi

if echo "$RESPONSE" | grep -q "message.*Bad credentials"; then
    echo "❌ Invalid GitHub token"
    echo "   Check your GH_TOKEN value"
    exit 1
fi

# Check each required secret
echo "## Checking required secrets..."
echo ""

FOUND_API_TOKEN=false
FOUND_ACCOUNT_ID=false
FOUND_ZONE_ID=false

if echo "$RESPONSE" | grep -q '"name":"CLOUDFLARE_API_TOKEN"'; then
    echo "✅ CLOUDFLARE_API_TOKEN is set"
    FOUND_API_TOKEN=true
else
    echo "❌ CLOUDFLARE_API_TOKEN is missing"
fi

if echo "$RESPONSE" | grep -q '"name":"CLOUDFLARE_ACCOUNT_ID"'; then
    echo "✅ CLOUDFLARE_ACCOUNT_ID is set"
    FOUND_ACCOUNT_ID=true
else
    echo "❌ CLOUDFLARE_ACCOUNT_ID is missing"
fi

if echo "$RESPONSE" | grep -q '"name":"CLOUDFLARE_ZONE_ID"'; then
    echo "✅ CLOUDFLARE_ZONE_ID is set"
    FOUND_ZONE_ID=true
else
    echo "⚠️  CLOUDFLARE_ZONE_ID is missing (optional - workflow will work without it)"
fi

echo ""
echo "## Summary"
echo "----------"

if [ "$FOUND_API_TOKEN" = true ] && [ "$FOUND_ACCOUNT_ID" = true ]; then
    echo "✅ All required secrets are configured!"
    echo ""
    echo "Auto-deploy is enabled. Test it with:"
    echo "  git commit --allow-empty -m 'test: Auto-deploy'"
    echo "  git push origin main"
    echo ""
    echo "Check workflow: https://github.com/$REPO/actions"
else
    echo "❌ Some required secrets are missing"
    echo ""
    echo "To set secrets, run:"
    echo "  GH_TOKEN='your_token' ./scripts/one-command-setup.sh"
    echo ""
    echo "Or set manually: https://github.com/$REPO/settings/secrets/actions"
fi

if [ "$FOUND_ZONE_ID" = false ]; then
    echo ""
    echo "Note: CLOUDFLARE_ZONE_ID is optional but recommended for cache purging"
fi
