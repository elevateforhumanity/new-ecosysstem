# Manual Render Deployment Instructions

## Current Status
- ✅ All fixes committed and pushed to `copilot/fix-v-code-emviornment-issues` branch
- ⚠️ Render is still serving old build (title shows "frontend")
- ⏳ Render may not be configured to auto-deploy from this branch

## Option 1: Manual Deploy from Render Dashboard (RECOMMENDED)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find and click on the `elevateforhumanity` service
3. Click **"Manual Deploy"** button (top right)
4. Select branch: `copilot/fix-v-code-emviornment-issues`
5. Click **"Deploy"**
6. Wait 2-5 minutes for deployment to complete
7. Check logs for any errors

## Option 2: Configure Auto-Deploy Branch

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on `elevateforhumanity` service
3. Go to **Settings** tab
4. Find **"Branch"** setting
5. Change from `main` to `copilot/fix-v-code-emviornment-issues`
6. Click **"Save Changes"**
7. Render will automatically deploy on next push

## Option 3: Merge to Main Branch

If Render is configured to deploy from `main`:

1. **Create Pull Request**:
   - Go to: https://github.com/elevateforhumanity/fix2/compare/main...copilot:fix-v-code-emviornment-issues
   - Click "Create Pull Request"
   - Review changes
   - Merge PR

2. **Or Force Push** (if you have permissions):
   ```bash
   git checkout main
   git reset --hard copilot/fix-v-code-emviornment-issues
   git push origin main --force
   ```

## Option 4: Use Deploy Hook (If Available)

If you have a Render Deploy Hook URL:

```bash
# Replace with your actual deploy hook URL
curl -X POST "https://api.render.com/deploy/srv-xxxxx?key=xxxxx"
```

To get a deploy hook:
1. Render Dashboard → Service → Settings
2. Scroll to "Deploy Hook"
3. Click "Create Deploy Hook"
4. Copy the URL
5. Use it to trigger deployments

## Verify Deployment

After deployment completes, test:

```bash
# Should show proper title, not "frontend"
curl -s https://elevateforhumanity.onrender.com | grep -o "<title>.*</title>"

# Should return 200 for all routes
curl -I https://elevateforhumanity.onrender.com/programs
curl -I https://elevateforhumanity.onrender.com/lms
curl -I https://elevateforhumanity.onrender.com/hub
```

Expected result:
```html
<title>Elevate for Humanity - Workforce Development & Learning Platform</title>
```

## What's in the New Deployment

- ✅ Fixed compression dependency
- ✅ Fixed Node version requirement
- ✅ Fixed Express 5 routing
- ✅ Fixed wouter → react-router-dom migration
- ✅ Added VITE_SUPABASE_ANON_KEY
- ✅ Updated serve-static.cjs
- ✅ Proper SEO titles for all pages
- ✅ Route-specific HTML files
- ✅ All environment variables configured

## Troubleshooting

### Deployment Fails
- Check build logs in Render dashboard
- Verify environment variables are set
- Check for any missing dependencies

### Still Shows Old Build
- Clear browser cache
- Check deployment logs for completion
- Verify correct branch is deployed
- Check service status (should be "Live")

### 503 Error
- Service may be sleeping (free tier)
- Click "Resume" in dashboard
- Wait a few seconds for service to wake

---

**Last Updated**: 2025-10-16
**Branch**: copilot/fix-v-code-emviornment-issues
**Commit**: 6babcca4
