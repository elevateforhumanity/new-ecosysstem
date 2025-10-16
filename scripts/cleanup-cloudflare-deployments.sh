#!/bin/bash
# Cleanup old Cloudflare Pages deployments
# Keeps only the latest N deployments to save space and reduce clutter

set -e

echo "🧹 CLOUDFLARE PAGES DEPLOYMENT CLEANUP"
echo "======================================="
echo ""

export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS}"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-6ba1d2a52a3fa230972960db307ac7c0}"
PROJECT="${PROJECT:-elevateforhumanity}"
KEEP_COUNT="${KEEP_COUNT:-5}"
AUTO_CONFIRM="${AUTO_CONFIRM:-false}"

echo "Project: $PROJECT"
echo "Keep: Latest $KEEP_COUNT deployments"
echo ""

# Get all deployments
echo "## Fetching deployments..."
DEPLOYMENTS=$(npx wrangler pages deployment list --project-name=$PROJECT 2>&1)

# Count total deployments
TOTAL=$(echo "$DEPLOYMENTS" | grep -c "│.*Production.*│" || echo "0")
echo "Total deployments: $TOTAL"
echo ""

# Calculate how many to delete
DELETE_COUNT=$((TOTAL - KEEP_COUNT))

if [ $DELETE_COUNT -le 0 ]; then
    echo "✅ Only $TOTAL deployments exist. No cleanup needed."
    echo "   (Configured to keep $KEEP_COUNT recent deployments)"
    exit 0
fi

echo "## Cleanup Plan"
echo "---------------"
echo "Keep: Latest $KEEP_COUNT deployments"
echo "Delete: $DELETE_COUNT old deployments"
echo ""

# Extract deployment IDs to delete (skip the first KEEP_COUNT)
DEPLOYMENT_IDS=$(echo "$DEPLOYMENTS" | grep "│.*Production.*│" | awk '{print $2}' | tail -n +$((KEEP_COUNT + 1)))

if [ -z "$DEPLOYMENT_IDS" ]; then
    echo "✅ No old deployments to delete"
    exit 0
fi

echo "## Deployments to delete:"
echo "$DEPLOYMENT_IDS" | head -10
if [ $(echo "$DEPLOYMENT_IDS" | wc -l) -gt 10 ]; then
    REMAINING=$(($(echo "$DEPLOYMENT_IDS" | wc -l) - 10))
    echo "... and $REMAINING more"
fi
echo ""

# Confirm deletion
if [ "$AUTO_CONFIRM" != "true" ]; then
    read -p "Delete these $DELETE_COUNT old deployments? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cleanup cancelled"
        echo ""
        echo "To auto-confirm, run:"
        echo "  AUTO_CONFIRM=true $0"
        exit 0
    fi
fi

echo ""
echo "## Deleting old deployments..."
echo ""

DELETED=0
FAILED=0

for ID in $DEPLOYMENT_IDS; do
    echo -n "Deleting $ID... "
    
    # Use wrangler to delete
    RESULT=$(npx wrangler pages deployment delete $ID --project-name=$PROJECT --yes 2>&1 || echo "FAILED")
    
    if echo "$RESULT" | grep -q "Successfully deleted\|deleted successfully"; then
        echo "✅"
        DELETED=$((DELETED + 1))
    else
        echo "❌"
        FAILED=$((FAILED + 1))
        # Show error if verbose
        if [ -n "$VERBOSE" ]; then
            echo "   Error: $RESULT"
        fi
    fi
    
    # Rate limit: wait between deletions
    sleep 0.5
done

echo ""
echo "## Cleanup Summary"
echo "------------------"
echo "✅ Deleted: $DELETED deployments"
if [ $FAILED -gt 0 ]; then
    echo "❌ Failed: $FAILED deployments"
fi
echo "📦 Kept: $KEEP_COUNT latest deployments"
echo ""

if [ $DELETED -gt 0 ]; then
    echo "✅ Cleanup complete!"
    echo ""
    echo "## Remaining deployments:"
    npx wrangler pages deployment list --project-name=$PROJECT 2>&1 | head -15
fi

echo ""
echo "💡 Tip: To keep more/fewer deployments, run:"
echo "   KEEP_COUNT=10 $0"
