# Production Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [x] All tests passing (42/42)
- [x] No console errors
- [x] Build succeeds
- [x] Linting passes
- [ ] Code review completed
- [ ] Security audit completed

### Configuration
- [ ] Production environment variables set
- [ ] Database migrations ready
- [ ] API keys configured
- [ ] Domain DNS configured
- [ ] SSL certificate active

### Performance
- [x] Bundle size optimized
- [x] Images optimized
- [x] Lazy loading implemented
- [ ] Lighthouse score > 90
- [ ] Load testing completed

### Security
- [x] Environment variables secured
- [x] RLS policies enabled
- [x] HTTPS enforced
- [x] Security headers set
- [ ] Penetration testing completed

---

## Step 1: Environment Variables

### Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your project: **elevateforhumanity**
3. Go to **Settings → Environment Variables**
4. Add the following variables:

#### Required Variables
```bash
# Supabase
VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Site Configuration
VITE_SITE_URL=https://elevateforhumanity.org
VITE_SITE_NAME=Elevate for Humanity
```

#### Optional Variables
```bash
# Analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX

# Error Tracking
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Social Media
VITE_FACEBOOK_APP_ID=your-app-id
VITE_LINKEDIN_COMPANY_ID=your-company-id
```

### Render (Backend)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select service: **efh-lms-backend**
3. Go to **Environment**
4. Add variables:

```bash
NODE_ENV=production
SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3001
```

---

## Step 2: Database Setup

### Apply Migrations

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run each migration in order:

```sql
-- Run these in order:
-- 001_initial_schema.sql
-- 002_lms_schema.sql
-- 003_lms_seed_data.sql
-- 004_agent_events.sql
-- 005_affiliate_system.sql
-- 006_files_and_payments.sql
-- 007_stripe_connect.sql
-- 008_payout_batches.sql
-- 009_ai_employee_tables.sql
-- 010_ai_generated_pages.sql
-- 011_api_tokens_table.sql
-- 012_hiring_automation.sql
```

### Verify Tables

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should return 30+ tables
```

### Enable RLS

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All tables should have rowsecurity = true
```

---

## Step 3: Deploy Frontend

### Automatic Deployment (Recommended)

Cloudflare Pages automatically deploys on push to main:

```bash
git add .
git commit -m "feat: production deployment"
git push origin main
```

### Manual Deployment

```bash
# Build locally
npm run build

# Deploy to Cloudflare
npm run cf:deploy

# Or use wrangler directly
npx wrangler pages deploy dist --project-name=elevateforhumanity
```

### Verify Deployment

```bash
# Check deployment status
curl -I https://elevateforhumanity.pages.dev

# Should return: HTTP/2 200
```

---

## Step 4: Deploy Backend

### Automatic Deployment

Render automatically deploys on push to main.

### Manual Deployment

```bash
# Trigger manual deploy
curl -X POST https://api.render.com/deploy/srv-xxxxx?key=xxxxx
```

### Verify Backend

```bash
# Check health endpoint
curl https://your-backend.onrender.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## Step 5: Configure Domain

### Cloudflare DNS

1. Go to **Cloudflare Dashboard → DNS**
2. Add/verify records:

```
Type    Name    Content                         Proxy
CNAME   @       elevateforhumanity.pages.dev    Yes
CNAME   www     elevateforhumanity.pages.dev    Yes
```

### SSL Certificate

1. Go to **SSL/TLS → Overview**
2. Set encryption mode: **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

---

## Step 6: Configure Monitoring

### Sentry Setup

1. Go to [Sentry.io](https://sentry.io)
2. Create new project: **elevateforhumanity**
3. Copy DSN
4. Add to Cloudflare environment variables:
   ```
   VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

### Google Analytics

1. Go to [Google Analytics](https://analytics.google.com)
2. Create property: **Elevate for Humanity**
3. Copy Measurement ID (G-XXXXXXXXXX)
4. Add to Cloudflare environment variables:
   ```
   VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```

### Uptime Monitoring

1. Sign up for [UptimeRobot](https://uptimerobot.com)
2. Add monitor:
   - **URL:** https://elevateforhumanity.org
   - **Type:** HTTPS
   - **Interval:** 5 minutes
3. Set up alerts (email, Slack)

---

## Step 7: SEO Configuration

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: **elevateforhumanity.org**
3. Verify ownership (DNS or HTML file)
4. Submit sitemap:
   ```
   https://elevateforhumanity.org/sitemap.xml
   ```

### Bing Webmaster Tools

1. Go to [Bing Webmaster](https://www.bing.com/webmasters)
2. Add site: **elevateforhumanity.org**
3. Verify ownership
4. Submit sitemap

---

## Step 8: Performance Testing

### Lighthouse Audit

```bash
# Run Lighthouse
npx lighthouse https://elevateforhumanity.org --view

# Target scores:
# Performance: 90+
# Accessibility: 100
# Best Practices: 95+
# SEO: 100
```

### Load Testing

```bash
# Install k6
brew install k6  # macOS
# or download from https://k6.io

# Run load test
k6 run load-test.js
```

### Core Web Vitals

1. Go to [PageSpeed Insights](https://pagespeed.web.dev/)
2. Enter: **https://elevateforhumanity.org**
3. Verify metrics:
   - **LCP:** < 2.5s
   - **FID:** < 100ms
   - **CLS:** < 0.1

---

## Step 9: Security Hardening

### Security Headers

Verify headers are set in `dist/_headers`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline';
```

### SSL Configuration

```bash
# Test SSL
curl -I https://elevateforhumanity.org

# Should show:
# strict-transport-security: max-age=31536000
```

### Database Security

```sql
-- Verify RLS is working
-- Try to access data without authentication
-- Should fail with permission denied
```

---

## Step 10: Post-Deployment Verification

### Smoke Tests

```bash
# Homepage loads
curl -I https://elevateforhumanity.org
# Expected: 200 OK

# Sitemap accessible
curl -I https://elevateforhumanity.org/sitemap.xml
# Expected: 200 OK

# Robots.txt accessible
curl -I https://elevateforhumanity.org/robots.txt
# Expected: 200 OK

# API health check
curl https://your-backend.onrender.com/health
# Expected: {"status":"ok"}
```

### User Acceptance Testing

- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Course catalog displays
- [ ] Enrollment flow works
- [ ] User authentication works
- [ ] Forms submit correctly
- [ ] Images load
- [ ] Videos play
- [ ] Mobile responsive
- [ ] Accessibility features work

### Analytics Verification

1. Visit site in incognito mode
2. Navigate through pages
3. Check Google Analytics Real-Time
4. Verify events are tracked

---

## Rollback Procedure

### If Deployment Fails

#### Frontend Rollback

```bash
# Cloudflare Pages
# 1. Go to Cloudflare Dashboard
# 2. Select project
# 3. Go to Deployments
# 4. Click "..." on previous deployment
# 5. Click "Rollback to this deployment"
```

#### Backend Rollback

```bash
# Render
# 1. Go to Render Dashboard
# 2. Select service
# 3. Go to Events
# 4. Click "Rollback" on previous deployment
```

#### Database Rollback

```sql
-- Run rollback SQL if needed
-- Example:
DROP TABLE IF EXISTS new_table CASCADE;
```

---

## Monitoring & Maintenance

### Daily Checks

- [ ] Check error rates in Sentry
- [ ] Review analytics in Google Analytics
- [ ] Check uptime status
- [ ] Review server logs

### Weekly Checks

- [ ] Review performance metrics
- [ ] Check for security updates
- [ ] Review user feedback
- [ ] Update dependencies

### Monthly Checks

- [ ] Security audit
- [ ] Performance optimization
- [ ] Database maintenance
- [ ] Backup verification

---

## Troubleshooting

### Common Issues

#### Site Not Loading

```bash
# Check DNS
dig elevateforhumanity.org

# Check SSL
openssl s_client -connect elevateforhumanity.org:443

# Check Cloudflare status
# Visit: https://www.cloudflarestatus.com/
```

#### Database Connection Errors

```bash
# Check Supabase status
# Visit: https://status.supabase.com/

# Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY
```

#### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## Support Contacts

### Emergency Contacts

- **Technical Lead:** tech@elevateforhumanity.org
- **DevOps:** devops@elevateforhumanity.org
- **Security:** security@elevateforhumanity.org

### Service Providers

- **Cloudflare Support:** https://support.cloudflare.com
- **Supabase Support:** https://supabase.com/support
- **Render Support:** https://render.com/support

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Backup created

### Deployment
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] DNS configured

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Monitoring configured
- [ ] Analytics working
- [ ] SEO configured
- [ ] Team notified

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Version:** 2.0.0  
**Status:** ⬜ Success ⬜ Failed ⬜ Rolled Back

---

*Last updated: 2025-10-15*
