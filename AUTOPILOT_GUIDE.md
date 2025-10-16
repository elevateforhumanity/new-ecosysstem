# 🤖 Full Autopilot Deployment Guide

Complete automation for Supabase + Render + Cloudflare + GitHub + Gitpod with automatic commits and deployments.

## 🚀 Quick Start (Easiest)

Run the interactive wizard:

```bash
bash autopilot-start.sh
```

This will:
1. ✅ Use existing Supabase credentials (already configured)
2. ✅ Ask for optional Render credentials
3. ✅ Ask for optional Cloudflare credentials
4. ✅ Configure all services automatically
5. ✅ Build and deploy your application
6. ✅ Commit changes to Git
7. ✅ Push to GitHub (triggers auto-deploy)

## 📋 What You Need

### Required (Already Configured!)
- ✅ **Supabase**: Already set up with URL and keys

### Optional Services

#### Render (for backend hosting)
Get from [Render Dashboard](https://dashboard.render.com/):
- `RENDER_API_KEY` - Account Settings → API Keys
- `RENDER_SERVICE_ID` - From service URL: `srv-xxxxx`
- `RENDER_DEPLOY_HOOK` - Service Settings → Deploy Hook

#### Cloudflare (for frontend hosting)
Get from [Cloudflare Dashboard](https://dash.cloudflare.com/):
- `CLOUDFLARE_API_TOKEN` - Profile → API Tokens
- `CLOUDFLARE_ACCOUNT_ID` - Account ID from dashboard

## 🎯 Deployment Options

### Option 1: Interactive Wizard (Recommended)
```bash
bash autopilot-start.sh
```
Guides you through setup with prompts.

### Option 2: Full Autopilot (All Services)
```bash
# Set all credentials
export SUPABASE_URL='https://cuxzzpsyufcewtmicszk.supabase.co'
export SUPABASE_ANON_KEY='your-anon-key'
export RENDER_API_KEY='rnd_xxxxx'
export RENDER_SERVICE_ID='srv-xxxxx'
export RENDER_DEPLOY_HOOK='https://api.render.com/deploy/srv-xxx'
export CLOUDFLARE_API_TOKEN='your-token'
export CLOUDFLARE_ACCOUNT_ID='your-account-id'

# Run full deployment
bash scripts/full-autopilot-deploy.sh
```

### Option 3: GitHub Actions (Automatic on Push)
Just push to GitHub - automatic deployment happens via GitHub Actions!

```bash
git add .
git commit -m "feat: my changes"
git push origin main
```

GitHub Actions will:
1. Build your application
2. Deploy to Cloudflare Pages
3. Trigger Render deployment
4. All automatically!

## 🔄 Automatic Deployment Flow

```
┌─────────────────┐
│  Make Changes   │
│   in Gitpod     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Run Autopilot  │
│  or Push to Git │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Autopilot Does Everything:         │
│  1. Updates Supabase config         │
│  2. Creates .env files              │
│  3. Sets GitHub secrets             │
│  4. Sets Gitpod env vars            │
│  5. Updates Render env vars         │
│  6. Builds application              │
│  7. Commits to Git                  │
│  8. Pushes to GitHub                │
│  9. Deploys to Cloudflare           │
│  10. Triggers Render deploy         │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Live on Web!   │
│  🌐 🎉          │
└─────────────────┘
```

## 📦 What Gets Configured

### Local Environment
- ✅ `src/supabaseClient.js` - Updated to use env vars
- ✅ `.env` - Created with all credentials
- ✅ `dist/` - Built application ready for deployment

### GitHub
- ✅ Secrets set for CI/CD
- ✅ Actions workflow enabled
- ✅ Auto-deploy on push

### Gitpod
- ✅ Environment variables persisted
- ✅ Available in all workspaces
- ✅ Automatic setup on workspace start

### Render
- ✅ Environment variables updated via API
- ✅ Deployment triggered automatically
- ✅ Live at: https://elevateforhumanity.onrender.com

### Cloudflare Pages
- ✅ Deployed via Wrangler
- ✅ Live at: https://elevateforhumanity.pages.dev
- ✅ Auto-deploy on GitHub push

## 🔐 Security Best Practices

### ✅ DO:
- Use environment variables for all secrets
- Keep `.env` in `.gitignore` (already configured)
- Rotate API keys regularly
- Use different keys for dev/prod
- Enable Row Level Security in Supabase

### ❌ DON'T:
- Commit `.env` to Git
- Share API keys in public channels
- Use production keys in development
- Hardcode credentials in source code

## 🛠️ Manual Configuration (If Needed)

### GitHub Secrets
If `gh` CLI not available, manually add at:
[https://github.com/elevateforhumanity/fix2/settings/secrets/actions](https://github.com/elevateforhumanity/fix2/settings/secrets/actions)

Required secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `CLOUDFLARE_API_TOKEN` (optional)
- `CLOUDFLARE_ACCOUNT_ID` (optional)
- `RENDER_DEPLOY_HOOK` (optional)

### Gitpod Variables
If `gp` CLI not available, manually add at:
[https://gitpod.io/user/variables](https://gitpod.io/user/variables)

Scope: `elevateforhumanity/*`

### Render Environment
Manually add at:
[https://dashboard.render.com/](https://dashboard.render.com/) → Your Service → Environment

## 🐛 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
pnpm clean:all
pnpm install
pnpm build
```

### GitHub Push Fails
```bash
# Check authentication
gh auth status

# Re-authenticate if needed
gh auth login
```

### Cloudflare Deploy Fails
```bash
# Check wrangler installation
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Verify token
echo $CLOUDFLARE_API_TOKEN
```

### Render Deploy Not Triggered
```bash
# Manually trigger
curl -X POST "$RENDER_DEPLOY_HOOK"

# Or use Render dashboard
# https://dashboard.render.com/ → Manual Deploy
```

## 📊 Monitoring Deployments

### GitHub Actions
View workflow runs:
[https://github.com/elevateforhumanity/fix2/actions](https://github.com/elevateforhumanity/fix2/actions)

### Cloudflare Pages
View deployments:
[https://dash.cloudflare.com/](https://dash.cloudflare.com/) → Pages → elevateforhumanity

### Render
View deployments:
[https://dashboard.render.com/](https://dashboard.render.com/) → Your Service → Events

## 🎓 Advanced Usage

### Custom Deployment Script
Create your own automation:

```bash
#!/bin/bash
# my-custom-deploy.sh

# Source the full autopilot
source scripts/full-autopilot-deploy.sh

# Add custom steps
echo "Running custom post-deploy tasks..."
# Your custom logic here
```

### Scheduled Deployments
Add to `.github/workflows/autopilot-deploy.yml`:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
```

### Multi-Environment Deployments
```bash
# Deploy to staging
export CLOUDFLARE_PROJECT_NAME=elevateforhumanity-staging
bash scripts/full-autopilot-deploy.sh

# Deploy to production
export CLOUDFLARE_PROJECT_NAME=elevateforhumanity
bash scripts/full-autopilot-deploy.sh
```

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Render Docs](https://render.com/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Gitpod Docs](https://www.gitpod.io/docs)

## 🆘 Support

If you encounter issues:

1. Check the logs in the terminal
2. Review the troubleshooting section above
3. Check service status pages:
   - [GitHub Status](https://www.githubstatus.com/)
   - [Cloudflare Status](https://www.cloudflarestatus.com/)
   - [Render Status](https://status.render.com/)

## 🎉 Success!

Once deployed, your application is live at:
- 🌐 **Cloudflare Pages**: https://elevateforhumanity.pages.dev
- 🌐 **Render**: https://elevateforhumanity.onrender.com

Every push to GitHub automatically deploys to both platforms!

---

**Made with 🤖 by Autopilot System**
