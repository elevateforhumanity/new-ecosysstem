# Cloudflare Pages Setup - Connect Repository

## Current Status

✅ **Code is ready** - All fixes committed and pushed to main
✅ **GitHub Actions configured** - Workflow ready to deploy
⚠️ **Needs Cloudflare connection** - Repository must be connected

## Option 1: GitHub Actions Auto-Deploy (RECOMMENDED)

Your repository already has GitHub Actions configured. Just need to add secrets:

### Step 1: Get Cloudflare Credentials

1. **Get API Token**:
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use template: "Edit Cloudflare Workers"
   - Or create custom token with permissions:
     - Account > Cloudflare Pages > Edit
   - Copy the token

2. **Get Account ID**:
   - Go to: https://dash.cloudflare.com
   - Click on any domain or go to Workers & Pages
   - Account ID is in the right sidebar or URL

### Step 2: Add GitHub Secrets

1. Go to: https://github.com/elevateforhumanity/fix2/settings/secrets/actions
2. Click "New repository secret"
3. Add these secrets:

```
Name: CLOUDFLARE_API_TOKEN
Value: [your-cloudflare-api-token]

Name: CLOUDFLARE_ACCOUNT_ID
Value: [your-cloudflare-account-id]

Name: VITE_SUPABASE_URL
Value: https://cuxzzpsyufcewtmicszk.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA
```

### Step 3: Trigger Deployment

Once secrets are added, deployment will happen automatically on every push to main.

To trigger now:
```bash
# Make a small change and push
git commit --allow-empty -m "trigger: deploy to cloudflare"
git push origin main
```

Or manually trigger in GitHub:
- Go to: https://github.com/elevateforhumanity/fix2/actions
- Click "Autopilot Deploy"
- Click "Run workflow"

## Option 2: Cloudflare Dashboard (Manual)

### Step 1: Connect Repository

1. Go to: https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Click **Create application**
4. Click **Pages** tab
5. Click **Connect to Git**
6. Select **GitHub**
7. Authorize Cloudflare to access your GitHub
8. Select repository: **elevateforhumanity/fix2**

### Step 2: Configure Build Settings

```
Production branch: main
Build command: pnpm run build
Build output directory: dist
Root directory: /
```

### Step 3: Add Environment Variables

In Cloudflare Pages project settings, add:

```
VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
```

### Step 4: Deploy

Click **Save and Deploy**

Your site will be live at:
- https://elevateforhumanity.pages.dev
- Or your custom domain if configured

## Option 3: Wrangler CLI (Local Deploy)

If you want to deploy from your local machine:

### Step 1: Login to Cloudflare

```bash
wrangler login
```

This will open a browser for authentication.

### Step 2: Create Project (First Time Only)

```bash
wrangler pages project create elevateforhumanity
```

### Step 3: Deploy

```bash
./DEPLOY_NOW.sh
```

Or manually:
```bash
pnpm run build
wrangler pages deploy dist --project-name=elevateforhumanity
```

## Verification

After deployment, verify:

1. **Site is live**: https://elevateforhumanity.pages.dev
2. **Check deployment logs**:
   - GitHub Actions: https://github.com/elevateforhumanity/fix2/actions
   - Cloudflare: https://dash.cloudflare.com → Pages → elevateforhumanity
3. **Test functionality**:
   - Homepage loads
   - Login works
   - Database queries work
   - No console errors

## Troubleshooting

### "Project not found" Error

The project doesn't exist yet. Create it:
- Option 1: Use Cloudflare Dashboard (Option 2 above)
- Option 2: Use `wrangler pages project create elevateforhumanity`

### "Authentication failed" Error

Your API token or account ID is incorrect:
1. Verify token has correct permissions
2. Check account ID is correct
3. Re-generate token if needed

### Build Fails

Check build logs in:
- GitHub Actions: https://github.com/elevateforhumanity/fix2/actions
- Cloudflare Dashboard: Deployments tab

Common issues:
- Missing environment variables
- Node version mismatch (use Node 20+)
- pnpm not available (Cloudflare auto-detects it)

## Next Steps After Deployment

1. ✅ Site is live
2. Configure custom domain (optional)
3. Set up SSL certificate (auto-provisioned)
4. Run database migrations: `supabase db push`
5. Test all features on live site
6. Set up monitoring (Sentry, analytics)

## Summary

**Recommended**: Use Option 1 (GitHub Actions) for automatic deployments on every push.

**Quick Start**:
1. Add GitHub secrets (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
2. Push to main or trigger workflow manually
3. Site deploys automatically to https://elevateforhumanity.pages.dev

**That's it!** Your site will auto-deploy on every push to main.
