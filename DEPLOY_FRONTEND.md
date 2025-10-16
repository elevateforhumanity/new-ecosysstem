# Frontend Deployment Guide - Cloudflare Pages

## Overview

Deploy the React frontend to Cloudflare Pages (free tier, unlimited bandwidth).

**Current Status**: Frontend is ready to deploy with Stripe integration.

---

## Prerequisites

- ✅ GitHub account
- ✅ Cloudflare account (free)
- ⚠️ Supabase credentials (URL + anon key)
- ✅ Stripe publishable key (already configured)

---

## Step 1: Push Code to GitHub

```bash
# Commit all changes
git add -A
git commit -m "feat: add database schema, email service, and deployment prep"
git push origin main
```

---

## Step 2: Create Cloudflare Pages Project

### A. Go to Cloudflare Dashboard

1. Visit [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. Click **"Workers & Pages"** in left sidebar
3. Click **"Create application"**
4. Click **"Pages"** tab
5. Click **"Connect to Git"**

### B. Connect GitHub Repository

1. Click **"Connect GitHub"**
2. Authorize Cloudflare
3. Select repository: **`elevateforhumanity/fix2`**
4. Click **"Begin setup"**

### C. Configure Build Settings

**Project name**: `elevate-for-humanity` (or your choice)

**Production branch**: `main`

**Build settings**:
- **Framework preset**: `Vite`
- **Build command**: `cd frontend && npm install && npm run build`
- **Build output directory**: `frontend/dist`
- **Root directory**: `/` (leave empty)

**Environment variables** (click "Add variable"):

```bash
# Supabase (REQUIRED - get from Supabase dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe (ALREADY CONFIGURED)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RvqjzIRNf5vPH3ABuHQofarfuWw0PW5ww9eTwkj21A6VLJaLopuYbPdpAFCTU10O5uLgGHeCTBEcu9xeM8ErbFy004j2KPoSx

# Backend API (UPDATE AFTER BACKEND DEPLOYMENT)
VITE_API_URL=https://your-backend.onrender.com

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=your-sentry-dsn
```

### D. Deploy

1. Click **"Save and Deploy"**
2. Wait 2-5 minutes for build
3. Get your URL: `https://elevate-for-humanity.pages.dev`

---

## Step 3: Configure Custom Domain (Optional)

### A. Add Domain

1. In Cloudflare Pages project
2. Click **"Custom domains"** tab
3. Click **"Set up a custom domain"**
4. Enter: `elevateforhumanity.org` or `www.elevateforhumanity.org`

### B. DNS Configuration

Cloudflare will automatically configure DNS if domain is on Cloudflare.

If domain is elsewhere:
1. Add CNAME record: `www` → `elevate-for-humanity.pages.dev`
2. Or add A record: `@` → Cloudflare IP

---

## Step 4: Update Backend URL

After deploying backend (see DEPLOY_BACKEND.md):

1. Go to Cloudflare Pages project
2. Click **"Settings"** → **"Environment variables"**
3. Update `VITE_API_URL` to your backend URL
4. Click **"Save"**
5. Go to **"Deployments"** → **"Retry deployment"**

---

## Step 5: Verify Deployment

### A. Check Build Logs

1. Go to **"Deployments"** tab
2. Click latest deployment
3. Check logs for errors

### B. Test Website

Visit your URL and test:
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Courses page loads
- ✅ Login/signup works (after Supabase setup)
- ✅ Payment flow works (after backend + Stripe setup)

---

## Troubleshooting

### Build Fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**: Build command should use `--legacy-peer-deps`:
```bash
cd frontend && npm install --legacy-peer-deps && npm run build
```

**Error**: `Module not found`

**Solution**: Check that all imports use correct casing and paths.

### Environment Variables Not Working

**Issue**: Variables not available in build

**Solution**: 
1. Variables must start with `VITE_`
2. Redeploy after adding variables
3. Check **"Environment variables"** tab shows all vars

### 404 on Routes

**Issue**: Direct URLs return 404

**Solution**: Cloudflare Pages automatically handles SPA routing for Vite projects.

If still broken, add `_redirects` file:
```
/* /index.html 200
```

---

## Automatic Deployments

**Every push to `main` branch automatically deploys!**

To disable:
1. Go to **"Settings"** → **"Builds & deployments"**
2. Toggle **"Automatic deployments"** off

---

## Preview Deployments

**Every pull request gets a preview URL!**

Example: `https://abc123.elevate-for-humanity.pages.dev`

Great for testing before merging.

---

## Rollback

To rollback to previous version:

1. Go to **"Deployments"** tab
2. Find working deployment
3. Click **"..."** → **"Rollback to this deployment"**

---

## Performance

Cloudflare Pages includes:
- ✅ Global CDN (300+ locations)
- ✅ Automatic HTTPS
- ✅ HTTP/3 support
- ✅ Brotli compression
- ✅ Unlimited bandwidth (free tier!)

**Expected load time**: <1 second globally

---

## Cost

**Free tier includes**:
- Unlimited requests
- Unlimited bandwidth
- 500 builds/month
- 1 concurrent build

**Paid tier** ($20/month):
- 5,000 builds/month
- 5 concurrent builds
- Advanced features

**Recommendation**: Start with free tier

---

## Next Steps

After frontend deployment:

1. ✅ Deploy backend (see DEPLOY_BACKEND.md)
2. ✅ Update `VITE_API_URL` with backend URL
3. ✅ Set up Supabase database
4. ✅ Configure Stripe webhook
5. ✅ Test end-to-end payment flow

---

## Support

**Cloudflare Docs**: [https://developers.cloudflare.com/pages/](https://developers.cloudflare.com/pages/)

**Issues?** Check:
1. Build logs in Cloudflare dashboard
2. Browser console for errors
3. Network tab for API calls

---

## Quick Reference

**Dashboard**: [https://dash.cloudflare.com/](https://dash.cloudflare.com/)

**Your URL**: `https://elevate-for-humanity.pages.dev`

**Build Command**: `cd frontend && npm install --legacy-peer-deps && npm run build`

**Output Directory**: `frontend/dist`

**Environment Variables**: Must start with `VITE_`
