# 🚀 Cloudflare Pages Deployment Guide

## Overview

This project is configured for deployment exclusively to Cloudflare Pages, providing:
- Fast global CDN
- Automatic HTTPS
- Custom domain support
- GitHub integration
- Environment variables support

## Automatic Deployment

### GitHub Actions (Recommended)

Every push to the `main` branch automatically triggers deployment:

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

2. **Push to main branch:**
   ```bash
   git push origin main
   ```

3. **Monitor deployment:**
   - Check GitHub Actions tab for deployment status
   - Visit https://elevateforhumanity.pages.dev once complete

### Manual Deployment

Use the deployment script for manual deployments:

```bash
# Prepare and deploy
bash cloudflare-deploy.sh

# Or use Wrangler CLI directly
npx wrangler pages publish dist
```

## Configuration

### Environment Variables

Required secrets in GitHub repository settings:
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Custom Domain

The site is configured for:
- **Primary:** https://elevateforhumanity.org
- **Pages URL:** https://elevateforhumanity.pages.dev

### Build Settings

- **Build command:** Handled by GitHub Actions
- **Output directory:** `dist`
- **Node.js version:** 20
- **Package manager:** pnpm

## Files Included in Deployment

The deployment includes:
- All HTML files
- Assets (CSS, JS, images, icons)
- Configuration files (_headers, _redirects, robots.txt)
- Sitemap files
- Manifest and favicon

## Security Features

- Security headers configured in `_headers`
- Content Security Policy (CSP)
- HTTPS redirect
- Cache optimization

## Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs
2. Verify Cloudflare API token is valid
3. Ensure all required files are committed

### Site Not Loading
1. Check Cloudflare Pages dashboard
2. Verify DNS settings for custom domain
3. Check browser console for errors

### Build Issues
1. Run `bash cloudflare-deploy.sh` locally
2. Check for missing files in `dist` directory
3. Verify all dependencies are installed

## Support

For deployment issues:
1. Check Cloudflare Pages documentation
2. Review GitHub Actions workflow logs
3. Verify all environment variables are set correctly
