# Backend Deployment Guide - Render.com

## Overview

Deploy the Express.js backend to Render.com (free tier available).

**Current Status**: Backend is ready with Stripe integration, email service, and database schema.

---

## Prerequisites

- ✅ GitHub account
- ✅ Render.com account (free)
- ⚠️ Supabase credentials (URL + service key)
- ⚠️ Stripe secret key (`sk_live_...`)
- ⚠️ Email service API key (SendGrid or Resend)

---

## Step 1: Create Render Account

1. Go to [https://render.com/](https://render.com/)
2. Click **"Get Started"**
3. Sign up with GitHub
4. Authorize Render

---

## Step 2: Create Web Service

### A. New Web Service

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Find and select: **`elevateforhumanity/fix2`**
4. Click **"Connect"**

### B. Configure Service

**Name**: `efh-lms-backend` (or your choice)

**Region**: Choose closest to your users (e.g., Oregon, Frankfurt)

**Branch**: `main`

**Root Directory**: `backend`

**Runtime**: `Node`

**Build Command**: `npm install`

**Start Command**: `npm start`

**Instance Type**: 
- **Free** (512 MB RAM, spins down after 15 min inactivity)
- **Starter** ($7/month, always on, 512 MB RAM)

**Recommendation**: Start with Free, upgrade to Starter when ready.

---

## Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

### Required Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://elevate-for-humanity.pages.dev

# Supabase (REQUIRED - get from Supabase dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# JWT Secret (generate new one)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Stripe (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Service (OPTIONAL - choose one)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=noreply@elevateforhumanity.org

# OR use Resend
# EMAIL_PROVIDER=resend
# RESEND_API_KEY=re_your_api_key_here
```

### Generate JWT Secret

Run this command locally:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use as `JWT_SECRET`.

---

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Get your URL: `https://efh-lms-backend.onrender.com`

---

## Step 5: Update Frontend

Update frontend to use backend URL:

### A. In Cloudflare Pages

1. Go to your Cloudflare Pages project
2. Click **"Settings"** → **"Environment variables"**
3. Update or add:
   ```bash
   VITE_API_URL=https://efh-lms-backend.onrender.com
   ```
4. Click **"Save"**
5. Go to **"Deployments"** → **"Retry deployment"**

### B. In Local Development

Update `frontend/.env`:
```bash
VITE_API_URL=https://efh-lms-backend.onrender.com
```

---

## Step 6: Configure Stripe Webhook

### A. Get Webhook URL

Your webhook endpoint: `https://efh-lms-backend.onrender.com/api/webhooks/stripe`

### B. Add to Stripe Dashboard

1. Go to [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://efh-lms-backend.onrender.com/api/webhooks/stripe`
4. **Events to send**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **"Add endpoint"**
6. Copy **"Signing secret"** (starts with `whsec_...`)

### C. Update Environment Variable

1. Go back to Render dashboard
2. Click **"Environment"** tab
3. Find `STRIPE_WEBHOOK_SECRET`
4. Update with the signing secret
5. Click **"Save Changes"**
6. Service will auto-redeploy

---

## Step 7: Verify Deployment

### A. Check Logs

1. Go to **"Logs"** tab in Render
2. Look for:
   ```
   ✅ Server running on port 10000
   ✅ Supabase connected
   ✅ Stripe initialized
   ```

### B. Test Health Endpoint

Visit: `https://efh-lms-backend.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-10-16T18:00:00.000Z"
}
```

### C. Test API Endpoints

```bash
# Test health
curl https://efh-lms-backend.onrender.com/health

# Test CORS
curl -H "Origin: https://elevate-for-humanity.pages.dev" \
     https://efh-lms-backend.onrender.com/health
```

---

## Troubleshooting

### Build Fails

**Error**: `npm ERR! code ENOENT`

**Solution**: Make sure **Root Directory** is set to `backend`

**Error**: `Module not found`

**Solution**: Check `backend/package.json` has all dependencies

### Service Won't Start

**Error**: `Application failed to respond`

**Solution**: 
1. Check logs for errors
2. Verify `PORT` env var is set to `10000`
3. Verify server listens on `process.env.PORT`

### Environment Variables Not Working

**Issue**: Variables not available

**Solution**:
1. Go to **"Environment"** tab
2. Verify all variables are set
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Free Tier Spin Down

**Issue**: First request takes 30+ seconds

**Solution**: This is normal for free tier. Options:
1. Upgrade to Starter ($7/month) for always-on
2. Use a cron job to ping every 10 minutes
3. Accept the delay (only affects first request)

---

## Monitoring

### A. View Logs

Real-time logs in Render dashboard:
1. Click **"Logs"** tab
2. See all console output
3. Filter by level (info, error, etc.)

### B. Metrics

Free tier includes:
- CPU usage
- Memory usage
- Request count
- Response times

View in **"Metrics"** tab

### C. Alerts

Set up email alerts:
1. Go to **"Settings"** → **"Notifications"**
2. Add email
3. Choose events (deploy failed, service down, etc.)

---

## Scaling

### Free Tier Limits
- 512 MB RAM
- Shared CPU
- Spins down after 15 min inactivity
- 750 hours/month (enough for 1 service)

### Starter Tier ($7/month)
- 512 MB RAM
- Shared CPU
- Always on (no spin down)
- Unlimited hours

### Standard Tier ($25/month)
- 2 GB RAM
- Dedicated CPU
- Always on
- Better performance

**Recommendation**: Start free, upgrade to Starter when you have paying customers.

---

## Custom Domain

### A. Add Domain

1. Go to **"Settings"** → **"Custom Domain"**
2. Click **"Add Custom Domain"**
3. Enter: `api.elevateforhumanity.org`

### B. DNS Configuration

Add CNAME record in your DNS:
```
api.elevateforhumanity.org → efh-lms-backend.onrender.com
```

### C. Update Frontend

Update `VITE_API_URL` to use custom domain:
```bash
VITE_API_URL=https://api.elevateforhumanity.org
```

---

## Automatic Deployments

**Every push to `main` branch automatically deploys!**

To disable:
1. Go to **"Settings"** → **"Build & Deploy"**
2. Toggle **"Auto-Deploy"** off

---

## Rollback

To rollback to previous version:

1. Go to **"Events"** tab
2. Find working deployment
3. Click **"Rollback to this deploy"**

---

## Alternative: Railway.app

If you prefer Railway over Render:

### Pros
- Simpler interface
- Better free tier (500 hours/month)
- Faster deployments

### Cons
- Requires credit card for free tier
- Less documentation

### Quick Setup

1. Go to [https://railway.app/](https://railway.app/)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose `elevateforhumanity/fix2`
5. Set **Root Directory**: `backend`
6. Add environment variables
7. Deploy!

---

## Cost Comparison

### Render.com
- **Free**: $0/month (with spin down)
- **Starter**: $7/month (always on)
- **Standard**: $25/month (better performance)

### Railway.app
- **Free**: $0/month (500 hours, ~$5 credit)
- **Hobby**: $5/month (500 hours + $5 credit)
- **Pro**: $20/month (unlimited)

### Recommendation
- **MVP/Testing**: Render Free or Railway Free
- **Production**: Render Starter ($7/month)
- **Scale**: Render Standard ($25/month)

---

## Security Checklist

Before going live:

- [ ] All environment variables set
- [ ] JWT_SECRET is strong and unique
- [ ] SUPABASE_SERVICE_KEY is secret (not exposed)
- [ ] STRIPE_SECRET_KEY is secret (not exposed)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled
- [ ] HTTPS enforced (automatic on Render)

---

## Next Steps

After backend deployment:

1. ✅ Update frontend `VITE_API_URL`
2. ✅ Configure Stripe webhook
3. ✅ Set up Supabase database
4. ✅ Test payment flow end-to-end
5. ✅ Set up monitoring/alerts
6. ✅ Add custom domain (optional)

---

## Support

**Render Docs**: [https://render.com/docs](https://render.com/docs)

**Railway Docs**: [https://docs.railway.app/](https://docs.railway.app/)

**Issues?** Check:
1. Logs in Render dashboard
2. Environment variables are set
3. Service is running (not sleeping)
4. CORS allows your frontend domain

---

## Quick Reference

**Dashboard**: [https://dashboard.render.com/](https://dashboard.render.com/)

**Your URL**: `https://efh-lms-backend.onrender.com`

**Health Check**: `https://efh-lms-backend.onrender.com/health`

**Webhook URL**: `https://efh-lms-backend.onrender.com/api/webhooks/stripe`

**Root Directory**: `backend`

**Start Command**: `npm start`
