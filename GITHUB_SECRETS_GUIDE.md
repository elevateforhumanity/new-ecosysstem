# 🔐 GITHUB SECRETS CONFIGURATION GUIDE

## Overview

This guide helps you configure GitHub repository secrets needed for automatic Cloudflare Pages deployments.

---

## Required Secrets

Your GitHub Actions workflow (`.github/workflows/cloudflare-deploy.yml`) requires these secrets:

| Secret Name | Value | Status | Purpose |
|-------------|-------|--------|---------|
| `CLOUDFLARE_API_TOKEN` | `Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS` | ✅ Available | Deploy to Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | `6ba1d2a52a3fa230972960db307ac7c0` | ✅ Available | Identify Cloudflare account |
| `CLOUDFLARE_ZONE_ID` | Get from dashboard | ⚠️ Needed | Purge cache after deployment |
| `GITHUB_TOKEN` | Auto-provided | ✅ Automatic | GitHub Actions authentication |

---

## Step-by-Step Setup

### Method 1: Using GitHub Web Interface (Recommended)

**1. Navigate to Repository Secrets:**
```
https://github.com/elevateforhumanity/fix2/settings/secrets/actions
```

**2. Add CLOUDFLARE_API_TOKEN:**
- Click "New repository secret"
- Name: `CLOUDFLARE_API_TOKEN`
- Value: `Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS`
- Click "Add secret"

**3. Add CLOUDFLARE_ACCOUNT_ID:**
- Click "New repository secret"
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: `6ba1d2a52a3fa230972960db307ac7c0`
- Click "Add secret"

**4. Add CLOUDFLARE_ZONE_ID:**
- Click "New repository secret"
- Name: `CLOUDFLARE_ZONE_ID`
- Value: [See "Getting Zone ID" section below]
- Click "Add secret"

---

### Method 2: Using GitHub CLI

If you have GitHub CLI installed and authenticated:

```bash
# Run the setup script
./scripts/setup-github-secrets.sh

# Or manually:
gh secret set CLOUDFLARE_API_TOKEN --repo elevateforhumanity/fix2 < <(echo "Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS")
gh secret set CLOUDFLARE_ACCOUNT_ID --repo elevateforhumanity/fix2 < <(echo "6ba1d2a52a3fa230972960db307ac7c0")
gh secret set CLOUDFLARE_ZONE_ID --repo elevateforhumanity/fix2 < <(echo "YOUR_ZONE_ID")
```

---

## Getting CLOUDFLARE_ZONE_ID

### Option 1: From Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/
2. Click on your domain (e.g., `elevateforhumanity.org`)
3. Scroll down in the **Overview** tab
4. Look for **"Zone ID"** in the right sidebar
5. Copy the 32-character hex string
6. Example format: `1234567890abcdef1234567890abcdef`

### Option 2: Using the Helper Script

```bash
./scripts/get-cloudflare-zone-id.sh
```

This will attempt to fetch your Zone ID via the Cloudflare API.

### Option 3: Using Cloudflare API Directly

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.result[] | {name, id}'
```

---

## Verification

### Check Secrets Are Set

**Via GitHub Web:**
1. Go to: https://github.com/elevateforhumanity/fix2/settings/secrets/actions
2. You should see:
   - ✅ CLOUDFLARE_API_TOKEN
   - ✅ CLOUDFLARE_ACCOUNT_ID
   - ✅ CLOUDFLARE_ZONE_ID

**Via GitHub CLI:**
```bash
gh secret list --repo elevateforhumanity/fix2
```

### Test the Workflow

1. Make a small change and commit:
   ```bash
   git commit --allow-empty -m "test: Trigger GitHub Actions workflow"
   git push origin main
   ```

2. Check workflow status:
   ```
   https://github.com/elevateforhumanity/fix2/actions
   ```

3. Look for "Deploy to Cloudflare Pages" workflow
4. Verify it runs successfully (green checkmark)

---

## What Each Secret Does

### CLOUDFLARE_API_TOKEN
- **Purpose:** Authenticates with Cloudflare API
- **Used for:** Deploying to Cloudflare Pages
- **Permissions needed:** Cloudflare Pages (Edit)
- **Current value:** Already configured in `.env.example`

### CLOUDFLARE_ACCOUNT_ID
- **Purpose:** Identifies your Cloudflare account
- **Used for:** Targeting the correct account for deployment
- **Format:** 32-character hex string
- **Current value:** `6ba1d2a52a3fa230972960db307ac7c0`

### CLOUDFLARE_ZONE_ID
- **Purpose:** Identifies your domain/zone
- **Used for:** Purging cache after deployment
- **Format:** 32-character hex string
- **Optional:** Workflow will work without it, but cache won't be purged

### GITHUB_TOKEN
- **Purpose:** Authenticates GitHub Actions
- **Used for:** Accessing repository, creating deployments
- **Automatic:** Provided by GitHub Actions automatically
- **No setup needed**

---

## Troubleshooting

### "Secret not found" Error

**Problem:** Workflow fails with "secret not found"

**Solution:**
1. Verify secret name matches exactly (case-sensitive)
2. Check secret is set at repository level (not organization)
3. Ensure you have admin access to the repository

### "Invalid API token" Error

**Problem:** Cloudflare API rejects the token

**Solution:**
1. Verify token is copied correctly (no extra spaces)
2. Check token hasn't expired
3. Verify token has correct permissions:
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Check "Cloudflare Pages" permission is enabled

### Workflow Doesn't Trigger

**Problem:** Pushing to main doesn't trigger deployment

**Solution:**
1. Check workflow file exists: `.github/workflows/cloudflare-deploy.yml`
2. Verify workflow is enabled:
   - Go to: https://github.com/elevateforhumanity/fix2/actions
   - Check if workflows are enabled
3. Ensure you're pushing to `main` branch (not `master`)

### Cache Not Purging

**Problem:** Old content still visible after deployment

**Solution:**
1. Add `CLOUDFLARE_ZONE_ID` secret (if missing)
2. Verify Zone ID is correct
3. Check API token has "Cache Purge" permission
4. Manually purge cache:
   ```bash
   curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'
   ```

---

## Current Workflow Configuration

**File:** `.github/workflows/cloudflare-deploy.yml`

**Triggers:**
- Push to `main` branch
- Push to `master` branch
- Pull requests to `main`/`master`
- Daily at 6:00 AM UTC (scheduled)

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. Run compliance checks
5. Build application (`npm run build`)
6. Deploy to Cloudflare Pages
7. Update sitemap
8. Purge Cloudflare cache
9. Notify on success

---

## Security Best Practices

### ✅ Do:
- Keep secrets in GitHub Secrets (never commit to code)
- Use repository secrets (not environment secrets for this use case)
- Rotate API tokens periodically
- Use tokens with minimal required permissions

### ❌ Don't:
- Commit secrets to `.env` files
- Share secrets in public channels
- Use personal API tokens (use service tokens)
- Give tokens more permissions than needed

---

## Quick Reference

**Repository Secrets URL:**
```
https://github.com/elevateforhumanity/fix2/settings/secrets/actions
```

**GitHub Actions URL:**
```
https://github.com/elevateforhumanity/fix2/actions
```

**Cloudflare Dashboard:**
```
https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0
```

**Cloudflare Pages Project:**
```
https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/pages/view/elevateforhumanity
```

---

## Helper Scripts

We've created scripts to help with setup:

1. **`scripts/setup-github-secrets.sh`**
   - Interactive setup for GitHub secrets
   - Attempts to use GitHub CLI if available
   - Falls back to manual instructions

2. **`scripts/get-cloudflare-zone-id.sh`**
   - Fetches Zone ID from Cloudflare API
   - Provides manual lookup instructions
   - Shows where to add the secret

Run them with:
```bash
./scripts/setup-github-secrets.sh
./scripts/get-cloudflare-zone-id.sh
```

---

## Summary

✅ **CLOUDFLARE_API_TOKEN:** Available (from `.env.example`)  
✅ **CLOUDFLARE_ACCOUNT_ID:** Available (from `.env.example`)  
⚠️ **CLOUDFLARE_ZONE_ID:** Needs to be obtained from dashboard  
✅ **GITHUB_TOKEN:** Automatically provided  

**Next Steps:**
1. Add the three secrets to GitHub repository
2. Get Zone ID from Cloudflare dashboard
3. Test by pushing a commit
4. Verify workflow runs successfully

Once configured, every push to `main` will automatically deploy to Cloudflare Pages!
