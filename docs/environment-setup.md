# Environment Configuration Guide

This guide covers the complete environment setup for the Elevate for Humanity ecosystem across all platforms.

## Overview

The ecosystem consists of multiple integrated platforms:
- **Netlify**: Frontend hosting and serverless functions
- **Supabase**: Backend database and Edge Functions
- **GitHub Actions**: CI/CD automation
- **Cloudflare R2**: Asset storage and CDN
- **External APIs**: Payment, email, and AI services

## Environment Files

### Local Development
- `.env.local` - Local development overrides
- `.env.development` - Development environment defaults

### Staging Environment
- `.env.staging` - Staging environment configuration

### Production Environment
- `.env.production` - Production environment configuration

## Platform-Specific Configuration

### 1. Netlify Configuration

#### Required Environment Variables
```bash
# Netlify Site Configuration
NETLIFY_SITE_ID=your_netlify_site_id
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_BUILD_HOOK=your_netlify_build_hook_url

# For staging
NETLIFY_STAGING_SITE_ID=your_staging_netlify_site_id
```

#### Setup Steps
1. Create Netlify sites for production and staging
2. Generate personal access token in Netlify dashboard
3. Configure build hooks for automated deployments
4. Set environment variables in Netlify dashboard

### 2. Supabase Configuration

#### Required Environment Variables
```bash
# Supabase Project Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_PROJECT_REF=your_project_ref
```

#### Setup Steps
1. Create Supabase projects for production and staging
2. Run database migrations using `schema.sql`
3. Configure Row Level Security (RLS) policies
4. Deploy Edge Functions from `supabase/functions/`
5. Generate and configure API keys

### 3. GitHub Actions Secrets

#### Required Secrets
```bash
# Netlify
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
NETLIFY_STAGING_SITE_ID
NETLIFY_BUILD_HOOK

# Supabase
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_REF
SUPABASE_ACCESS_TOKEN

# External Services
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SENDGRID_API_KEY
INDEXNOW_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY

# Monitoring
SENTRY_DSN

# Storage
CLOUDFLARE_R2_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
```

#### Setup Steps
1. Go to GitHub repository Settings > Secrets and variables > Actions
2. Add all required secrets
3. Configure environment protection rules for production
4. Test workflows with staging environment first

### 4. Cloudflare R2 Configuration

#### Required Environment Variables
```bash
# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=elevate-assets
```

#### Setup Steps
1. Create Cloudflare account and enable R2
2. Create buckets for production and staging
3. Generate R2 API tokens with appropriate permissions
4. Configure CORS policies for web access

## Service-Specific Configuration

### Payment Processing (Stripe)

#### Production
```bash
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Staging/Test
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Email Services (SendGrid)

```bash
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=noreply@elevateforhumanity.org
SENDGRID_FROM_NAME=Elevate for Humanity
```

### AI Services

```bash
# OpenAI
OPENAI_API_KEY=sk-your_openai_key

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
```

### Analytics & Monitoring

```bash
# Google Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX

# Hotjar
HOTJAR_ID=your_hotjar_id

# Sentry
SENTRY_DSN=https://your_sentry_dsn
```

## Security Best Practices

### 1. Key Rotation
- Rotate API keys every 90 days
- Use different keys for staging and production
- Monitor key usage and access logs

### 2. Access Control
- Use least privilege principle
- Implement IP restrictions where possible
- Enable 2FA for all service accounts

### 3. Environment Isolation
- Never use production keys in staging
- Separate databases and storage buckets
- Use different domains for staging

### 4. Secret Management
- Never commit secrets to version control
- Use GitHub Secrets for CI/CD
- Implement secret scanning

## Validation Scripts

### Environment Validation
```bash
# Run environment validation
node scripts/validate-environment.js

# Check specific environment
NODE_ENV=production node scripts/validate-environment.js
```

### Connection Testing
```bash
# Test all service connections
npm run test:connections

# Test specific service
npm run test:supabase
npm run test:netlify
npm run test:stripe
```

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Errors
- Verify project URL and API keys
- Check RLS policies
- Ensure database is accessible

#### 2. Netlify Deployment Failures
- Check build logs
- Verify environment variables
- Ensure functions are properly configured

#### 3. Payment Processing Issues
- Verify Stripe webhook endpoints
- Check API key permissions
- Test with Stripe CLI

#### 4. Email Delivery Problems
- Verify SendGrid API key
- Check sender authentication
- Monitor delivery statistics

### Debug Commands

```bash
# Check environment variables
npm run env:check

# Test API connections
npm run test:apis

# Validate configuration
npm run validate:config

# Check deployment status
npm run status:deployment
```

## Monitoring & Alerts

### Health Checks
- Automated health checks run hourly
- Performance monitoring via Lighthouse
- Security header validation
- API endpoint availability

### Alerting
- GitHub Actions workflow failures
- Supabase connection issues
- Payment processing errors
- Performance degradation

## Backup & Recovery

### Database Backups
- Automated daily backups via Supabase
- Point-in-time recovery available
- Cross-region backup replication

### Configuration Backups
- Environment configurations stored in secure vault
- Infrastructure as Code (IaC) for reproducibility
- Disaster recovery procedures documented

## Support

For environment setup assistance:
1. Check this documentation first
2. Review GitHub Issues for known problems
3. Contact the development team
4. Create detailed issue reports with logs

---

**Last Updated:** $(date)
**Version:** 1.0.0