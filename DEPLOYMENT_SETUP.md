# Deployment Setup Summary

## ✅ Completed

### 1. Render Credentials
- **API Key**: `rnd_Q3SSTof0RP50jFudJz03cpul2qA6`
- **Service ID**: `srv-d3lnrhfdiees73a2cn20`
- **Service Name**: elevateforhumanity
- **Service Type**: Static Site
- **URL**: https://elevateforhumanity.onrender.com
- **Repository**: Updated to `elevateforhumanity/fix2`
- **Credentials stored in**: `.env.render` (gitignored)

### 2. Cloudflare Pages
- **Project**: elevateforhumanity
- **URL**: https://elevateforhumanity.pages.dev
- **API Token**: Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS
- **Account ID**: 6ba1d2a52a3fa230972960db307ac7c0
- **Status**: Active and verified

### 3. Supabase
- **URL**: https://cuxzzpsyufcewtmicszk.supabase.co
- **Anon Key**: Configured in `src/supabaseClient.js`
- **Status**: Hardcoded and working

### 4. GitHub Workflows
- **Cloudflare Deploy**: `.github/workflows/cloudflare-deploy.yml` (auto-deploys on push to main)
- **Render Watcher**: `.github/workflows/autopilot-render.yml` (watches deployments)
- **Build Check**: `.github/workflows/build-check.yml`
- **CI**: `.github/workflows/ci.yml`

### 5. Build Scripts
- **render-build.sh**: Created with npm/pnpm fallback
- **Local build**: Verified working with `npm run build`

## ⚠️ Manual Actions Required

### 1. Update Render Build Command
Go to: https://dashboard.render.com/static/srv-d3lnrhfdiees73a2cn20/settings

Change **Build Command** to:
```bash
bash render-build.sh
```

**Publish Directory** should be: `./dist`

### 2. Set GitHub Secrets
Go to: https://github.com/elevateforhumanity/fix2/settings/secrets/actions

Add these secrets:
```
RENDER_API_KEY=rnd_Q3SSTof0RP50jFudJz03cpul2qA6
RENDER_SERVICE_ID=srv-d3lnrhfdiees73a2cn20
CLOUDFLARE_API_TOKEN=Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS
CLOUDFLARE_ACCOUNT_ID=6ba1d2a52a3fa230972960db307ac7c0
VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA
```

### 3. Trigger Test Deployment
After updating Render build command, trigger a deployment:
```bash
source .env.render
curl -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":"clear"}'
```

Or push a commit to trigger auto-deployment.

## 📋 Deployment Workflow

### Automatic Deployments

1. **Push to main branch** → Triggers both Cloudflare and Render deployments
2. **Pull Request** → Triggers Cloudflare preview deployment
3. **Daily at 6 AM UTC** → Automatic Cloudflare deployment

### Manual Deployments

**Cloudflare:**
```bash
npm run build
npx wrangler pages deploy dist --project-name=elevateforhumanity
```

**Render:**
```bash
source .env.render
curl -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":"do_not_clear"}'
```

## 🔍 Monitoring

**Check Render Deployment Status:**
```bash
source .env.render
curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys?limit=1" | python3 -m json.tool
```

**Check Cloudflare Deployment:**
```bash
export CLOUDFLARE_API_TOKEN=Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS
export CLOUDFLARE_ACCOUNT_ID=6ba1d2a52a3fa230972960db307ac7c0
curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/elevateforhumanity/deployments" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | python3 -m json.tool
```

## 🚀 Live URLs

- **Cloudflare Pages**: https://elevateforhumanity.pages.dev
- **Render**: https://elevateforhumanity.onrender.com
- **Backend API**: https://efh-lms-backend.onrender.com

## 📝 Notes

- `.env.render` is gitignored for security
- Supabase credentials are hardcoded in `src/supabaseClient.js`
- Backend service (`srv-d3nn4t3ipnbc73a36dog`) is separate from frontend
- Build script (`render-build.sh`) handles npm/pnpm compatibility
