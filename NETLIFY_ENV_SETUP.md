# 🔐 NETLIFY ENVIRONMENT VARIABLES SETUP

## CRITICAL: Add these in Netlify Dashboard

Go to: Site Settings → Environment Variables

Add these variables:

### Required for Supabase Integration:
VITE_SUPABASE_URL=https://kkzbqkyuunahdxcfdfzv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_from_supabase_dashboard

### Optional:
VITE_APP_TITLE=Elevate for Humanity
VITE_API_BASE_URL=https://www.elevateforhumanity.org/api

## After adding these variables:
1. Trigger a new deployment
2. Your app will connect to Supabase properly
3. No secrets will be exposed in the build

## Security Notes:
- VITE_SUPABASE_ANON_KEY is safe to expose (designed for client-side)
- Never expose SUPABASE_SERVICE_ROLE_KEY in client-side code
- All sensitive keys should be in Netlify environment variables only