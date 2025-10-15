# ⚡ QUICK START - Enable Auto-Deploy in 2 Minutes

## 🎯 Goal
Enable automatic Cloudflare Pages deployments on every push to main branch.

---

## ✅ Prerequisites
- You have admin access to the GitHub repository
- You can create a GitHub Personal Access Token

---

## 🚀 ONE-COMMAND SETUP

### Step 1: Create GitHub Token (1 minute)

1. **Go to:** https://github.com/settings/tokens/new

2. **Configure token:**
   - **Note:** `Cloudflare deployment secrets`
   - **Expiration:** `90 days` (or your preference)
   - **Scopes:** Check ✅ **`repo`** (Full control of private repositories)

3. **Click:** "Generate token"

4. **Copy the token** (starts with `ghp_...`)

### Step 2: Run Setup Script (30 seconds)

```bash
# Replace YOUR_TOKEN with the token you just copied
GH_TOKEN='ghp_YOUR_TOKEN_HERE' ./scripts/one-command-setup.sh
```

**That's it!** The script will:
- ✅ Set CLOUDFLARE_API_TOKEN
- ✅ Set CLOUDFLARE_ACCOUNT_ID  
- ✅ Set CLOUDFLARE_ZONE_ID (if available)
- ✅ Verify all secrets are configured

### Step 3: Test Auto-Deploy (30 seconds)

```bash
# Make a test commit
git commit --allow-empty -m "test: Verify auto-deploy"
git push origin main

# Check workflow status
# Go to: https://github.com/elevateforhumanity/fix2/actions
```

You should see the "Deploy to Cloudflare Pages" workflow running!

---

## 🔄 Alternative: Manual Setup (5 minutes)

If you prefer to set secrets manually:

### 1. Go to GitHub Secrets
```
https://github.com/elevateforhumanity/fix2/settings/secrets/actions
```

### 2. Add Three Secrets

Click "New repository secret" for each:

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: `Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS`

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: `6ba1d2a52a3fa230972960db307ac7c0`

**Secret 3:**
- Name: `CLOUDFLARE_ZONE_ID`
- Value: Get from https://dash.cloudflare.com/ (see below)

### 3. Get Zone ID

1. Go to: https://dash.cloudflare.com/
2. Click on your domain
3. Scroll down in Overview tab
4. Copy "Zone ID" from right sidebar
5. Paste as the value for CLOUDFLARE_ZONE_ID

---

## ✅ Verification

After setup, verify it's working:

### Check Secrets Are Set
```
https://github.com/elevateforhumanity/fix2/settings/secrets/actions
```

You should see:
- ✅ CLOUDFLARE_API_TOKEN
- ✅ CLOUDFLARE_ACCOUNT_ID
- ✅ CLOUDFLARE_ZONE_ID

### Test Deployment
```bash
git commit --allow-empty -m "test: Auto-deploy"
git push origin main
```

### Check Workflow
```
https://github.com/elevateforhumanity/fix2/actions
```

Look for:
- ✅ "Deploy to Cloudflare Pages" workflow
- ✅ Green checkmark (success)
- ✅ Deployment completed

### Verify Live Site
```
https://elevateforhumanity.pages.dev/
```

---

## 🎊 What Happens Now

Once configured:

**Every time you push to main:**
1. GitHub Actions automatically triggers
2. Builds your application
3. Deploys to Cloudflare Pages
4. Purges cache
5. Site is live with new changes

**No manual deployment needed!**

---

## 🔧 Troubleshooting

### "Failed to get repository public key"
- **Cause:** Token doesn't have `repo` scope
- **Fix:** Create new token with `repo` scope checked

### "PyNaCl not installed"
- **Cause:** Missing Python library
- **Fix:** Script will auto-install it, or run:
  ```bash
  pip3 install PyNaCl
  ```

### Workflow doesn't trigger
- **Cause:** Secrets not set or workflow disabled
- **Fix:** 
  1. Verify secrets at: https://github.com/elevateforhumanity/fix2/settings/secrets/actions
  2. Check workflows enabled at: https://github.com/elevateforhumanity/fix2/actions

### "Zone ID not found"
- **Cause:** No domain in Cloudflare or API token lacks permissions
- **Fix:** This is optional - workflow works without it
- **To add later:** Get from dashboard and add manually

---

## 📚 More Information

For detailed documentation, see:
- **GITHUB_SECRETS_GUIDE.md** - Complete secrets guide
- **SETUP_COMPLETE.md** - Overall system summary
- **CLOUDFLARE_CONFIGURATION_GUIDE.md** - Cloudflare setup

---

## 💡 Pro Tips

### Secure Your Token
- Don't commit tokens to code
- Use tokens with minimal required permissions
- Set expiration dates
- Rotate tokens periodically

### Monitor Deployments
- Watch GitHub Actions for build status
- Check Cloudflare Pages dashboard
- Set up notifications for failures

### Quick Commands
```bash
# Check workflow status
gh run list --repo elevateforhumanity/fix2

# View latest workflow
gh run view --repo elevateforhumanity/fix2

# Re-run failed workflow
gh run rerun <run-id> --repo elevateforhumanity/fix2
```

---

## ⏱️ Time Estimate

- **One-command setup:** 2 minutes
- **Manual setup:** 5 minutes
- **Testing:** 1 minute

**Total:** 3-6 minutes to full auto-deploy! 🚀

---

## 🎯 Summary

**Before:**
- Manual deployment with `wrangler pages deploy`
- Need to remember to deploy after changes
- Risk of forgetting to deploy

**After:**
- Automatic deployment on every push
- No manual intervention needed
- Always up-to-date

**Just run the one-command setup and you're done!**
