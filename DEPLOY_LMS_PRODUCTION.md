# 🚀 LMS Production Deployment Guide

**Complete deployment guide for Cloudflare, Supabase, and Render**

---

## Prerequisites

- [ ] GitHub account with access to `elevateforhumanity/fix2`
- [ ] Cloudflare account
- [ ] Supabase account
- [ ] Render account
- [ ] Node.js 18+ installed locally

---

## Step 1: Deploy Database to Supabase (15 minutes)

### 1.1 Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in or create account
3. Click "New Project"
4. Fill in:
   - **Name:** `elevate-lms`
   - **Database Password:** (generate strong password)
   - **Region:** Choose closest to your users
5. Click "Create new project" (takes 2-3 minutes)

### 1.2 Run Database Migrations

Once project is ready:

1. Click **SQL Editor** in left sidebar
2. Click **New Query**
3. Run each migration in order:

#### Migration 1: Initial Schema
```sql
-- Copy and paste contents from: supabase/migrations/001_initial_schema.sql
-- Click "Run" button
```

#### Migration 2: LMS Schema
```sql
-- Copy and paste contents from: supabase/migrations/002_lms_schema.sql
-- Click "Run" button
```

#### Migration 3: LMS Seed Data
```sql
-- Copy and paste contents from: supabase/migrations/003_lms_seed_data.sql
-- Click "Run" button
```

#### Migration 4-12: Additional Features
Run remaining migrations in order:
- `004_agent_events.sql`
- `005_affiliate_system.sql`
- `006_files_and_payments.sql`
- `007_stripe_connect.sql`
- `008_payout_batches.sql`
- `009_ai_employee_tables.sql`
- `010_ai_generated_pages.sql`
- `011_api_tokens_table.sql`
- `012_hiring_automation.sql`

### 1.3 Get Supabase Credentials

1. Click **Settings** → **API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

### 1.4 Verify Database

1. Click **Table Editor** in sidebar
2. Verify these tables exist:
   - ✅ profiles
   - ✅ courses
   - ✅ modules
   - ✅ enrollments
   - ✅ module_progress
   - ✅ certificates
   - ✅ assignments
   - ✅ submissions

---

## Step 2: Deploy Backend to Render (10 minutes)

### 2.1 Create Render Service

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Sign in with GitHub
3. Click **New +** → **Web Service**
4. Connect repository: `elevateforhumanity/fix2`
5. Click **Connect**

### 2.2 Configure Service

Fill in these settings:

```
Name: efh-lms-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### 2.3 Add Environment Variables

Click **Advanced** → **Add Environment Variable**

Add these variables:

```bash
NODE_ENV=production

# Supabase (from Step 1.3)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret (generate new one)
JWT_SECRET=<run command below to generate>

# Frontend URL (will update after Cloudflare deploy)
FRONTEND_URL=https://elevateforhumanity.pages.dev
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.4 Deploy

1. Click **Create Web Service**
2. Wait 3-5 minutes for deployment
3. You'll get a URL like: `https://efh-lms-backend.onrender.com`

### 2.5 Test Backend

```bash
# Test health endpoint
curl https://efh-lms-backend.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"2025-10-15T19:00:00.000Z","database":"connected","version":"1.0.0"}

# Test courses endpoint
curl https://efh-lms-backend.onrender.com/api/v1/courses

# Expected response:
# {"success":true,"data":[...],"pagination":{...}}
```

---

## Step 3: Deploy Frontend to Cloudflare Pages (10 minutes)

### 3.1 Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 3.2 Create Cloudflare Pages Project

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** → **Create application**
3. Click **Pages** tab → **Connect to Git**
4. Select repository: `elevateforhumanity/fix2`
5. Click **Begin setup**

### 3.3 Configure Build Settings

```
Project name: elevateforhumanity
Production branch: main
Build command: npm run build
Build output directory: dist
```

### 3.4 Add Environment Variables

Click **Settings** → **Environment variables** → **Add variable**

```bash
# Supabase (from Step 1.3)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API (from Step 2.4)
VITE_API_URL=https://efh-lms-backend.onrender.com

# Analytics (optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### 3.5 Deploy

1. Click **Save and Deploy**
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://elevateforhumanity.pages.dev`

### 3.6 Update Backend CORS

Go back to Render dashboard:
1. Click your backend service
2. Go to **Environment**
3. Update `FRONTEND_URL` to your Cloudflare Pages URL
4. Click **Save Changes** (triggers redeploy)

---

## Step 4: Deploy Cloudflare Workers (Optional - 15 minutes)

### 4.1 Configure Wrangler

```bash
# Set Cloudflare credentials
wrangler login

# Verify account
wrangler whoami
```

### 4.2 Deploy Workers

```bash
# Deploy all 11 AI workers
cd workers/orchestrator && wrangler deploy
cd ../analyzer && wrangler deploy
cd ../agent && wrangler deploy
cd ../ai-chat && wrangler deploy
cd ../ai-copy && wrangler deploy
cd ../ai-doc-summarizer && wrangler deploy
cd ../ai-form-gen && wrangler deploy
cd ../deployer && wrangler deploy
cd ../lms-webhook && wrangler deploy
cd ../monitor && wrangler deploy
cd ../stylist && wrangler deploy
```

### 4.3 Set Worker Secrets

```bash
# For each worker that needs secrets
cd workers/orchestrator
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put JWT_SECRET
```

---

## Step 5: Verify Deployment (5 minutes)

### 5.1 Test Frontend

Visit: `https://elevateforhumanity.pages.dev`

Check these pages:
- ✅ Home page loads
- ✅ Programs page loads
- ✅ LMS page loads
- ✅ Login/signup works
- ✅ Course catalog displays

### 5.2 Test Backend API

```bash
# Health check
curl https://efh-lms-backend.onrender.com/health

# Get courses
curl https://efh-lms-backend.onrender.com/api/v1/courses

# Test authentication (should fail without token)
curl https://efh-lms-backend.onrender.com/api/v1/enrollments
# Expected: {"success":false,"error":"Authentication required"}
```

### 5.3 Test Database

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Open `courses` table
4. Verify 5 sample courses exist

### 5.4 Test End-to-End

1. Visit your Cloudflare Pages URL
2. Sign up for new account
3. Browse courses
4. Enroll in a course
5. Complete a module
6. Check progress updates
7. Verify certificate generation (if course completed)

---

## Step 6: Custom Domain (Optional - 10 minutes)

### 6.1 Add Domain to Cloudflare Pages

1. Go to Cloudflare Pages dashboard
2. Click your project → **Custom domains**
3. Click **Set up a custom domain**
4. Enter: `elevateforhumanity.org`
5. Follow DNS instructions

### 6.2 Update Environment Variables

Update these in both Render and Cloudflare:
- `FRONTEND_URL=https://elevateforhumanity.org`
- `SITE_URL=https://elevateforhumanity.org`

---

## Troubleshooting

### Backend won't start
```bash
# Check logs in Render dashboard
# Common issues:
# - Missing environment variables
# - Invalid JWT_SECRET (must be 32+ characters)
# - Wrong Supabase credentials
```

### Frontend build fails
```bash
# Check build logs in Cloudflare Pages
# Common issues:
# - Missing VITE_ prefixed env vars
# - Node version mismatch (use 20.x)
```

### Database connection fails
```bash
# Verify Supabase credentials
# Check if project is paused (free tier)
# Verify RLS policies are enabled
```

### CORS errors
```bash
# Ensure FRONTEND_URL in backend matches your Cloudflare Pages URL
# Check browser console for exact error
```

---

## Monitoring & Maintenance

### Health Checks

Set up monitoring with:
- **UptimeRobot:** Monitor backend health endpoint
- **Sentry:** Error tracking (already configured)
- **Cloudflare Analytics:** Traffic monitoring

### Database Backups

Supabase automatically backs up your database:
- **Free tier:** Daily backups (7 days retention)
- **Pro tier:** Point-in-time recovery

### Scaling

**Current capacity (Free tier):**
- Backend: 750 hours/month (always on)
- Database: 500MB storage, 2GB bandwidth
- Frontend: Unlimited requests

**When to upgrade:**
- Backend: >100 concurrent users → Upgrade to $7/month
- Database: >500MB data → Upgrade to $25/month
- Workers: >100k requests/day → Upgrade to $5/month

---

## Cost Summary

### Free Tier (0-100 users)
- Cloudflare Pages: $0
- Cloudflare Workers: $0
- Render Backend: $0
- Supabase: $0
- **Total: $0/month**

### Production (100-1000 users)
- Cloudflare Pages: $0
- Cloudflare Workers: $5
- Render Backend: $7
- Supabase: $25
- **Total: $37/month**

### Scale (1000-10000 users)
- Cloudflare Pages: $20
- Cloudflare Workers: $10
- Render Backend: $25
- Supabase: $25
- **Total: $80/month**

---

## Security Checklist

- [ ] JWT_SECRET is strong (64+ characters)
- [ ] SUPABASE_SERVICE_KEY is kept secret (not in frontend)
- [ ] RLS policies enabled on all tables
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (100 req/15min)
- [ ] Helmet security headers active
- [ ] HTTPS enforced on all endpoints
- [ ] Environment variables not committed to git

---

## Support

**Issues?**
- Check logs in Render/Cloudflare dashboards
- Review Supabase logs in dashboard
- Test API endpoints with curl
- Check browser console for errors

**Need help?**
- GitHub Issues: https://github.com/elevateforhumanity/fix2/issues
- Email: elevateforhumanity@gmail.com

---

**Deployment completed!** 🎉

Your LMS is now live at:
- **Frontend:** https://elevateforhumanity.pages.dev
- **Backend:** https://efh-lms-backend.onrender.com
- **Database:** Supabase (managed)

**Next steps:**
1. Set up custom domain
2. Configure email notifications
3. Add payment processing (Stripe)
4. Enable Google Classroom sync
5. Set up monitoring alerts
