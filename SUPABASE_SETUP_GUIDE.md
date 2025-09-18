# 🚀 Supabase Setup Guide for EFH Platform

## Step 1: Create Supabase Account (if you don't have one)

1. **Go to Supabase**: https://supabase.com
2. **Click "Start your project"**
3. **Sign up with GitHub** (recommended for easy integration)
4. **Create a new project**:
   - Project name: `elevate-for-humanity`
   - Database password: Choose a strong password (save it!)
   - Region: Choose closest to your users (US East for most US users)
5. **Wait 2-3 minutes** for project to be ready

## Step 2: Get Your Credentials

### 🔗 Finding Your Project URL and API Keys:

1. **Go to your Supabase project dashboard**
2. **Click "Settings"** in the left sidebar
3. **Click "API"** in the settings menu
4. **Copy these values**:

### 📋 Credentials You Need:

```bash
# Project URL (looks like this):
https://abcdefghijklmnop.supabase.co

# API Keys:
# 1. anon/public key (starts with "eyJ...")
# 2. service_role key (starts with "eyJ..." - keep secret!)
```

## Step 3: Create Your .env File

Create a `.env` file in your project root with these values:

```bash
# ===================================================================
# EFH Platform Environment Configuration
# ===================================================================

# === SUPABASE CONFIGURATION (REQUIRED) ===
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your_jwt_token_from_supabase_dashboard
SUPABASE_SERVICE_ROLE=your_jwt_token_from_supabase_dashboard

# Database URL (replace YOUR_PROJECT_ID and YOUR_DB_PASSWORD)
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres

# === DEVELOPMENT SETTINGS ===
NODE_ENV=development
LOG_LEVEL=info
JWT_SECRET=change_me_to_a_secure_random_value

# === OPTIONAL SERVICES (configure later) ===
# STRIPE_PUBLISHABLE_KEY=pk_test_your_key
# STRIPE_SECRET_KEY=sk_test_your_key
# SENDGRID_API_KEY=SG.your_api_key
# TWILIO_ACCOUNT_SID=AC_your_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# R2_ACCOUNT_ID=your_cloudflare_account_id
# R2_ACCESS_KEY_ID=your_r2_access_key
# R2_SECRET_ACCESS_KEY=your_r2_secret_key
# R2_BUCKET=elevate-pages
# GITHUB_TOKEN_REPO=your_github_token_with_workflow_scope
```

## Step 4: Test Your Configuration

After creating your `.env` file, run these commands:

```bash
# Check configuration
node config-manager.js

# Test Supabase connection
node supabase-connection-script.js

# Run complete system analysis
node setup-complete-system.js
```

## Step 5: Deploy Database Schema

Once your connection is working:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy the schema
supabase db push
```

## 🎯 What This Enables

Once configured, your system will be able to:

- ✅ **Generate 95,000+ pages** dynamically from database content
- ✅ **Store unlimited content** in Supabase PostgreSQL
- ✅ **Serve pages instantly** via Netlify Edge Functions
- ✅ **Auto-generate sitemaps** for all content
- ✅ **Scale infinitely** with serverless architecture

## 🔒 Security Notes

- **Never commit your `.env` file** to Git
- **Keep your service_role key secret** - it has admin access
- **Use anon key for client-side** applications
- **Use service_role key for server-side** operations only

## 🆘 Need Help?

If you run into issues:

1. **Check the Supabase dashboard** for project status
2. **Verify your API keys** are copied correctly
3. **Run the config manager** to diagnose issues:
   ```bash
   node config-manager.js
   ```

## 🚀 Next Steps

After Supabase is configured:

1. **Create Supabase Edge Functions** for page generation
2. **Populate database** with your 48MB of content
3. **Deploy to Netlify** with complete integration
4. **Activate automated sitemaps** via GitHub Actions

Your 95k+ page generation system will then be fully operational! 🎉