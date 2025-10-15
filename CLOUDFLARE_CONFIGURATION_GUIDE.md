# 🔧 CLOUDFLARE PAGES CONFIGURATION GUIDE

## Current Status

✅ **Project:** elevateforhumanity  
✅ **Latest Deployment:** Working (commit a1f814a)  
✅ **SSG Build:** Successfully deployed  
✅ **All Routes:** Serving unique content  

---

## Required Configuration in Cloudflare Dashboard

### 1. Build & Deployment Settings

**Navigate to:**
```
https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/pages/view/elevateforhumanity/settings/builds
```

**Configure:**

| Setting | Value |
|---------|-------|
| **Framework preset** | None (or Vite) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (leave blank) |
| **Install command** | `npm ci` |

**Environment Variables (Build):**
- `NODE_ENV` = `production`
- `NODE_VERSION` = `20`

---

### 2. GitHub Integration

**Navigate to:**
```
https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/pages/view/elevateforhumanity/settings/builds
```

**Verify:**
- ✅ GitHub repository connected: `elevateforhumanity/fix2`
- ✅ Production branch: `main`
- ✅ Auto-deploy enabled for production branch
- ✅ Preview deployments enabled for pull requests

**If not connected:**
1. Click "Connect to Git"
2. Authorize GitHub
3. Select repository: `elevateforhumanity/fix2`
4. Select branch: `main`

---

### 3. Environment Variables (Runtime)

**Navigate to:**
```
https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/pages/view/elevateforhumanity/settings/environment-variables
```

**Add these variables for Production:**

```
NODE_ENV=production
```

**Optional (if using these services):**
```
VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXX
```

---

### 4. Custom Domains (Optional)

**Navigate to:**
```
https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/pages/view/elevateforhumanity/settings/domains
```

**Current domain:**
- `elevateforhumanity.pages.dev` (Cloudflare Pages subdomain)

**To add custom domain:**
1. Click "Set up a custom domain"
2. Enter your domain (e.g., `elevateforhumanity.org`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (automatic)

---

### 5. Functions & Redirects

**Current configuration:**
- `_headers` file: ✅ Configured (security headers)
- `_redirects` file: ✅ Configured (SPA routing)

**Files in repository:**
```
public/_headers    - Security headers (CSP, HSTS, etc.)
public/_redirects  - SPA fallback routing
```

**No changes needed** - these are working correctly.

---

### 6. Build Caching

**Navigate to:**
```
https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/pages/view/elevateforhumanity/settings/builds
```

**Recommended:**
- ✅ Enable build caching (speeds up builds)
- ✅ Cache `node_modules` directory

---

### 7. Preview Deployments

**Current status:**
- ✅ Preview deployments enabled
- ✅ Each commit gets unique URL (e.g., `838cf01b.elevateforhumanity.pages.dev`)

**Settings:**
- Enable preview deployments for: **All branches**
- Enable preview deployments for: **Pull requests**

---

### 8. Deployment Notifications

**Navigate to:**
```
https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/pages/view/elevateforhumanity/settings/notifications
```

**Recommended:**
- ✅ Enable email notifications for failed deployments
- ✅ Enable Slack/Discord webhooks (optional)

---

## GitHub Actions Configuration

**File:** `.github/workflows/cloudflare-deploy.yml`

**Required GitHub Secrets:**

Navigate to:
```
https://github.com/elevateforhumanity/fix2/settings/secrets/actions
```

**Add these secrets:**

| Secret Name | Value | Where to Get |
|-------------|-------|--------------|
| `CLOUDFLARE_API_TOKEN` | `Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS` | Already have |
| `CLOUDFLARE_ACCOUNT_ID` | `6ba1d2a52a3fa230972960db307ac7c0` | Already have |
| `CLOUDFLARE_ZONE_ID` | Get from Cloudflare | Dashboard → Domain → Zone ID |

**To get Zone ID:**
1. Go to Cloudflare Dashboard
2. Click on your domain
3. Scroll down in Overview tab
4. Copy "Zone ID" from right sidebar

---

## Verification Checklist

After configuring everything, verify:

### Build Configuration
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Node version: 20
- [ ] Environment variables set

### GitHub Integration
- [ ] Repository connected
- [ ] Auto-deploy enabled
- [ ] GitHub secrets configured

### Deployments
- [ ] Latest commit deployed successfully
- [ ] All routes serve unique content
- [ ] Preview deployments working

### Testing
```bash
# Test production
curl -s "https://elevateforhumanity.pages.dev/lms/" | grep "Learning Management System"

# Test preview (use latest commit hash)
curl -s "https://838cf01b.elevateforhumanity.pages.dev/lms/" | grep "Learning Management System"
```

---

## Troubleshooting

### Build Fails
1. Check build logs in Cloudflare dashboard
2. Verify `npm run build` works locally
3. Check Node version matches (20)
4. Verify all dependencies in `package.json`

### GitHub Actions Fails
1. Check workflow runs: https://github.com/elevateforhumanity/fix2/actions
2. Verify secrets are configured
3. Check API token permissions
4. Re-run failed workflow

### Content Not Updating
1. Check latest deployment in Cloudflare
2. Verify commit was deployed
3. Clear browser cache
4. Check Cloudflare cache (purge if needed)

---

## Current Deployment Info

**Latest Successful Deployment:**
- Commit: `a1f814a`
- URL: https://838cf01b.elevateforhumanity.pages.dev
- Status: ✅ Live and working
- Deployed: 11 minutes ago (via wrangler CLI)

**Production URL:**
- https://elevateforhumanity.pages.dev
- Status: ✅ Updated with SSG build
- All routes serving unique content

---

## Next Steps

1. **Configure GitHub Secrets** (if not already done)
   - Add `CLOUDFLARE_ZONE_ID` to GitHub secrets
   - This will enable automatic deployments via GitHub Actions

2. **Verify Build Settings in Dashboard**
   - Ensure build command and output directory are correct
   - This ensures future commits auto-deploy correctly

3. **Set Up Custom Domain** (optional)
   - Add your custom domain in Cloudflare Pages
   - Configure DNS records
   - SSL certificate will be provisioned automatically

4. **Monitor Deployments**
   - Check GitHub Actions for each push
   - Verify deployments succeed
   - Test preview URLs before production

---

## Support Links

- **Cloudflare Dashboard:** https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0
- **Pages Project:** https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/pages/view/elevateforhumanity
- **GitHub Repository:** https://github.com/elevateforhumanity/fix2
- **GitHub Actions:** https://github.com/elevateforhumanity/fix2/actions

---

## Summary

✅ **SSG Build:** Successfully deployed  
✅ **All Routes:** Working with unique content  
✅ **Cloudflare Pages:** Configured and operational  
⚠️ **GitHub Actions:** Needs secrets configured for auto-deploy  
⚠️ **Build Settings:** Should be verified in dashboard  

**The site is live and working. Configuration in dashboard will enable automatic deployments for future commits.**
