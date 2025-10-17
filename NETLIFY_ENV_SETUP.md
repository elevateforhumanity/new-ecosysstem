# Netlify Environment Variables Setup

## Quick Setup

1. Go to your Netlify dashboard: [https://app.netlify.com/](https://app.netlify.com/)
2. Select your site (elevateforhumanity)
3. Click **Site settings** in the top navigation
4. Click **Environment variables** in the left sidebar
5. Click **Add a variable** button

## Required Variables

Add these two variables:

### Variable 1: VITE_SUPABASE_URL
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://cuxzzpsyufcewtmicszk.supabase.co`
- **Scopes**: Select "All" or "Production"

### Variable 2: VITE_SUPABASE_ANON_KEY
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA`
- **Scopes**: Select "All" or "Production"

## Trigger Redeploy

After adding the variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**

This will rebuild your site with the environment variables properly set.

## Verify

Once deployed, check the build logs. You should see:
```
✅ All required environment variables are set
```

Instead of the warning about using fallback values.

## Alternative: Using Netlify CLI

You can also set environment variables using the Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to your site
netlify link

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://cuxzzpsyufcewtmicszk.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA"

# Trigger deploy
netlify deploy --prod
```

## Note

The site will still work without these environment variables set (it uses hardcoded fallbacks), but it's best practice to set them properly in your deployment platform for security and maintainability.
