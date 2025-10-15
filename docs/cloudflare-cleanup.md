# Cloudflare Pages Deployment Cleanup

## Overview

This document describes the process for cleaning up old Cloudflare Pages deployments to reduce clutter and save storage space.

## Cleanup Script

Location: `scripts/cleanup-cloudflare-deployments.sh`

### Usage

```bash
# Basic usage (keeps latest 5 deployments)
AUTO_CONFIRM=true scripts/cleanup-cloudflare-deployments.sh

# Keep more deployments
AUTO_CONFIRM=true KEEP_COUNT=10 scripts/cleanup-cloudflare-deployments.sh

# Interactive mode (asks for confirmation)
scripts/cleanup-cloudflare-deployments.sh
```

### Environment Variables

- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token (default: from environment)
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID (default: from environment)
- `PROJECT` - Project name (default: elevateforhumanity)
- `KEEP_COUNT` - Number of recent deployments to keep (default: 5)
- `AUTO_CONFIRM` - Skip confirmation prompt (default: false)

## Manual Cleanup via API

If you need to delete specific deployments manually:

```bash
# List all deployments
curl -s -X GET \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT/deployments" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  | jq -r '.result | sort_by(.created_on) | reverse | .[] | "\(.id) - \(.created_on)"'

# Delete a specific deployment
curl -s -X DELETE \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT/deployments/$DEPLOYMENT_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

## Recent Cleanup Results

**Date:** 2025-10-15

**Before:**
- Total deployments: 19

**After:**
- Total deployments: 5
- Deleted: 14 old deployments
- Kept: Latest 5 deployments

**Remaining Deployments:**
- 838cf01b-1265-406c-8017-7b6c731c6992 (2025-10-15T00:19:45Z)
- 5119bc29-1ba4-4bfe-bee4-4c9195b65dca (2025-10-14T22:18:48Z)
- 3a4b7a1a-93fe-49ee-8b34-30ddf56a5e42 (2025-10-14T21:52:51Z)
- 7a245cb7-f64f-4813-a79f-90321ba3476b (2025-10-14T21:47:41Z)
- aee87b21-4fed-4595-8d13-bc5bf7dbb741 (2025-10-14T21:44:22Z)

## Best Practices

1. **Regular Cleanup:** Run cleanup monthly or when deployments exceed 15-20
2. **Keep Recent:** Always keep at least 3-5 recent deployments for rollback capability
3. **Production Safety:** The script only deletes old deployments, never the latest ones
4. **Rate Limiting:** The script includes delays between deletions to respect API limits

## Troubleshooting

### Wrangler CLI Issues

If `wrangler pages deployment delete` fails, use the API directly:

```bash
# The script automatically falls back to API calls if wrangler fails
# Or use the manual API commands above
```

### Authentication Errors

Ensure your API token has the following permissions:
- Account > Cloudflare Pages > Edit

### Rate Limiting

If you hit rate limits, increase the sleep delay in the script or run cleanup in smaller batches.
