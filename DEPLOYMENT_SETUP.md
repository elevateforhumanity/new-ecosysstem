# Cloudflare Pages Deployment Setup

This repository is configured for automatic deployment to Cloudflare Pages. Here's how to set it up and use it.

## Prerequisites

Before deployment, you need to configure these secrets in your GitHub repository:

### GitHub Repository Secrets

Go to **Settings → Secrets and variables → Actions** and add:

1. **`CLOUDFLARE_API_TOKEN`** - Token with Pages:Edit permission
2. **`CLOUDFLARE_ACCOUNT_ID`** - Your Cloudflare account UUID  
3. **`CLOUDFLARE_PAGES_PROJECT`** - Your Pages project name

### Optional: Codespaces Secrets

For local development in Codespaces, add the same secrets in **Settings → Codespaces → Secrets**.

## Deployment Methods

### Automatic Deployment

The workflow automatically deploys when you:
- Push to `main` branch
- Push to any `copilot/*` branch
- Manually trigger the workflow

### Manual Deployment

Use the deployment script:

```bash
# Run the complete deployment sequence
./scripts/deploy-cloudflare.sh
```

Or step by step:

```bash
# 1. Check environment
printenv CF_API_TOKEN CF_ACCOUNT_ID CF_ZONE_NAME CF_PAGES_PROJECT

# 2. Verify Wrangler
npm i -g wrangler
wrangler whoami

# 3. Build locally
npm ci
npm run build

# 4. Trigger deployment
git commit --allow-empty -m "chore: trigger deploy"
git push

# 5. Monitor (if gh CLI available)
gh run watch --exit-status
```

## Troubleshooting

If deployment fails, run the triage script:

```bash
./scripts/triage-deploy.sh
```

Or manually verify the secrets:

```bash
gh workflow run "Verify Cloudflare Secrets"
```

## Development Scripts

The autopilot installer has generated helpful scripts:

```bash
npm run dev           # Start Vite dev server
npm run dev:proxy     # Start proxy on port 9000
npm run dev:all       # Start both dev server and proxy
npm run plugins:fix   # Fix plugin issues automatically
npm run plugins:nuke  # Nuclear option: rebuild everything
```

## File Structure

- `.github/workflows/cloudflare-pages.yml` - Main deployment workflow
- `.github/workflows/verify-cloudflare.yml` - Secret verification
- `public/_headers` - Cloudflare Pages security headers
- `public/_redirects` - SPA fallback routing
- `scripts/deploy-cloudflare.sh` - Complete deployment script
- `scripts/triage-deploy.sh` - Debugging helper
- `scripts/autopilot-env.sh` - Environment validation

## Post-Deploy Checks

After successful deployment, your site will be available at:
`https://[PROJECT_NAME].pages.dev`

The deployment script automatically tests:
- Main page accessibility
- Static asset loading (favicon)
- Build output verification