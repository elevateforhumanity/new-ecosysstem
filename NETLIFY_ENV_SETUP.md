# 🔐 NETLIFY ENVIRONMENT VARIABLES SETUP

## CRITICAL: Add these in Netlify Dashboard

Go to: Site Settings → Environment Variables

Add these variables:

### Required for Supabase Integration:
VITE_SUPABASE_URL=https://kkzbqkyuunahdxcfdfzv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtremJxa3l1dW5haGR4Y2ZkZnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2ODQ3MzQsImV4cCI6MjA3MjI2MDczNH0.fZvYJMuC7v7y69PzpYQMe6isLA1Dui3EunF2aC2LCFU

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