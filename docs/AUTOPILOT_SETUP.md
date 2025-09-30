# EFH Autopilot + Copilot Bootstrap Guide

This repository includes a comprehensive bootstrap script that sets up a **Gitpod-style autopilot + copilot stack** for GitHub Codespaces, complete with PM2 self-healing, Cloudflare deployment, and infrastructure management.

## Quick Start

```bash
# Run the bootstrap script
bash tools/setup_autopilot_codespace.sh

# Test the setup (optional)
bash tools/test_autopilot_setup.sh
```

## What the Bootstrap Script Creates

### 🤖 Autopilot Scripts
- `scripts/autopilot-env.sh` - Environment validation and setup
- `scripts/autopilot-guard.sh` - Self-healing service monitor

### ⚙️ PM2 Configuration  
- `pm2.config.cjs` - Process manager configuration for dev/preview services

### 🚀 CI/CD Workflows
- `.github/workflows/pages.yml` - Cloudflare Pages deployment (if not exists)
- `.github/workflows/infra.yml` - Terraform infrastructure management

### 🏗️ Infrastructure as Code
- `infra/providers.tf` - Cloudflare provider configuration
- `infra/variables.tf` - Terraform variables
- `infra/main.tf` - DNS and Pages project resources

### 🐳 Enhanced Devcontainer
- `.devcontainer/devcontainer.json` - Codespaces configuration with Node 20, Terraform, GitHub CLI

## Environment Variables

Set these as **Codespaces Secrets** (for local development) or **Actions Secrets** (for CI/CD):

### Required
- `CF_PAGES_PROJECT` - Your Cloudflare Pages project name

### Optional but Recommended  
- `CF_API_TOKEN` - Cloudflare API token with Pages and DNS permissions
- `CF_ACCOUNT_ID` - Cloudflare account ID
- `CF_ZONE_NAME` - Domain name (e.g., "elevateforhumanity.org")

## Usage Examples

### Local Development with Autopilot

```bash
# 1. Set environment variables (one-time setup)
export CF_PAGES_PROJECT="efh-site"
export CF_API_TOKEN="your-cloudflare-token"

# 2. Start managed services
pm2 start pm2.config.cjs --env development

# 3. Start the autopilot guard (monitors and restarts failed services)
pm2 start scripts/autopilot-guard.sh --name autopilot-guard

# 4. Save PM2 configuration for automatic restart
pm2 save

# 5. Check service status
pm2 status
```

### Direct Deployment

```bash
# Build and deploy from local environment
npm run build
wrangler pages deploy dist --project-name "$CF_PAGES_PROJECT"
```

### CI/CD Setup

1. Add repository secrets in GitHub:
   - `CF_API_TOKEN`
   - `CF_ACCOUNT_ID` 
   - `CF_PAGES_PROJECT`
   - `CF_ZONE_NAME`

2. Push to main branch to trigger deployment:
   ```bash
   git add -A
   git commit -m "feat: trigger autopilot deployment"
   git push origin main
   ```

## Service Management

The PM2 configuration manages these services:

- **dev** - Vite development server (port 5173)
- **preview** - Production preview server (port 3000)

### PM2 Commands

```bash
# View service status
pm2 status

# View logs
pm2 logs

# Restart a service
pm2 restart dev

# Stop all services
pm2 stop all

# Monitor services in real-time
pm2 monit
```

## Infrastructure Management

The Terraform configuration manages:

- Cloudflare Pages project
- DNS records (www CNAME)
- Zone configuration

### Terraform Commands

```bash
cd infra

# Initialize (one-time)
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply
```

## Customization

### Adding New Services

Edit `pm2.config.cjs` to add more services:

```javascript
{
  name: "api",
  script: "npm",
  args: "run api:start", 
  env: { PORT: "8080", NODE_ENV: "production" }
}
```

Update `scripts/autopilot-guard.sh` to monitor the new service:

```bash
SERVICES=(dev preview api)
```

### Custom Build Output

If your build outputs to a different directory than `dist`, update:

1. `.github/workflows/cloudflare-pages.yml` - Change the deploy directory
2. `infra/main.tf` - Update `destination_dir` in the Pages project

## Troubleshooting

### Environment Validation Fails

```bash
# Check required environment variables
scripts/autopilot-env.sh
```

### Build Fails

```bash
# Check dependencies and build
npm ci
npm run build
```

### PM2 Services Won't Start

```bash
# Check PM2 configuration syntax
node -c pm2.config.cjs

# View detailed logs
pm2 logs --lines 50
```

### Cloudflare Deploy Fails

```bash
# Verify authentication
wrangler whoami

# Check project name
wrangler pages project list
```

## Development Workflow

1. **Setup** - Run bootstrap script once per repository
2. **Code** - Make changes to your application
3. **Test** - Services auto-restart via autopilot guard
4. **Deploy** - Push to main branch for automatic deployment
5. **Monitor** - Use `pm2 status` and GitHub Actions to monitor

## Port Configuration

The devcontainer forwards these ports:

- `5173` - Vite dev server (auto-opens browser)
- `3000` - Preview server  
- `9200, 9300, 4100` - Reserved for future services

## Security Notes

- Never commit tokens or secrets to version control
- Use GitHub Codespaces Secrets for local development
- Use GitHub Actions Secrets for CI/CD
- Cloudflare API tokens should have minimal required permissions

## Support

- Test your setup: `bash tools/test_autopilot_setup.sh`
- Check PM2 status: `pm2 status`
- View logs: `pm2 logs`
- Monitor GitHub Actions in the repository's Actions tab