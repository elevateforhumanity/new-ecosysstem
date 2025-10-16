# Render + Supabase Autopilot Setup

This guide explains how to automatically configure Supabase credentials in both your local environment and Render deployment.

## Quick Start

### 1. Get Your Supabase Credentials

Visit your Supabase project:
- URL: [https://supabase.com/dashboard/project/cuxzzpsyufcewtmicszk](https://supabase.com/dashboard/project/cuxzzpsyufcewtmicszk)
- Go to: **Settings → API**
- Copy:
  - Project URL
  - `anon` `public` key
  - `service_role` `secret` key

### 2. Get Your Render Credentials

Visit Render dashboard:
- **API Key**: [https://dashboard.render.com/account/settings](https://dashboard.render.com/account/settings)
  - Click "Generate New Key"
  - Copy the key (starts with `rnd_`)
  
- **Service ID**: 
  - Go to your service: [https://dashboard.render.com/](https://dashboard.render.com/)
  - Service ID is in the URL: `https://dashboard.render.com/web/srv-xxxxx`
  - Copy the `srv-xxxxx` part

- **Deploy Hook** (optional):
  - In your service, go to **Settings → Deploy Hook**
  - Click "Create Deploy Hook"
  - Copy the URL

### 3. Run the Autopilot Setup

```bash
# Set Supabase credentials
export SUPABASE_URL='https://cuxzzpsyufcewtmicszk.supabase.co'
export SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
export SUPABASE_SERVICE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

# Set Render credentials
export RENDER_API_KEY='rnd_xxxxxxxxxxxx'
export RENDER_SERVICE_ID='srv-xxxxxxxxxxxx'
export RENDER_DEPLOY_HOOK='https://api.render.com/deploy/srv-xxx'

# Run the setup
bash scripts/setup-supabase-with-render.sh
```

## What the Script Does

### Local Environment
1. ✅ Updates `src/supabaseClient.js` to use environment variables
2. ✅ Creates `.env` file with your credentials
3. ✅ Updates `.env.example` template
4. ✅ Tests Supabase connection
5. ✅ Sets GitHub Secrets (if `gh` CLI available)

### Render Environment
6. ✅ Updates `VITE_SUPABASE_URL` on Render
7. ✅ Updates `VITE_SUPABASE_ANON_KEY` on Render
8. ✅ Updates `SUPABASE_SERVICE_KEY` on Render
9. ✅ Triggers automatic deployment (if deploy hook provided)

## Manual Render Setup (Alternative)

If you prefer to set environment variables manually:

1. Go to your Render service dashboard
2. Navigate to **Environment** tab
3. Add these variables:
   - `VITE_SUPABASE_URL` = `https://cuxzzpsyufcewtmicszk.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = Your anon key
   - `SUPABASE_SERVICE_KEY` = Your service role key
4. Click **Save Changes**
5. Render will automatically redeploy

## Render API Reference

The script uses Render's REST API to update environment variables:

```bash
# Update environment variable
curl -X PUT "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars/VARIABLE_NAME" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"value": "variable_value"}'

# Trigger deployment
curl -X POST "${RENDER_DEPLOY_HOOK}"
```

## Troubleshooting

### "Could not update environment variable on Render"

**Possible causes:**
- Invalid API key
- Wrong service ID
- API key doesn't have permission for the service

**Solution:**
1. Verify your API key at [https://dashboard.render.com/account/settings](https://dashboard.render.com/account/settings)
2. Check service ID in your service URL
3. Ensure API key has access to the service

### "Deployment not triggered"

**Possible causes:**
- No deploy hook configured
- Invalid deploy hook URL

**Solution:**
1. Create deploy hook in Render: Service Settings → Deploy Hook
2. Set `RENDER_DEPLOY_HOOK` environment variable
3. Or manually trigger deployment in Render dashboard

### Environment variables not taking effect

**Solution:**
- Render caches environment variables during build
- After updating, trigger a new deployment
- Check the deployment logs to verify variables are set

## Security Notes

⚠️ **Never commit credentials to Git**
- `.env` is in `.gitignore`
- Use environment variables or secrets management
- Rotate keys if accidentally exposed

✅ **Best practices:**
- Use different keys for development and production
- Regularly rotate API keys
- Use Render's secret management for sensitive values
- Enable Row Level Security (RLS) in Supabase

## Next Steps

After setup:
1. Commit changes: `git add . && git commit -m "feat: Configure Supabase with environment variables"`
2. Push to GitHub: `git push origin main`
3. Verify deployment on Render
4. Test the application: Check Supabase connection in browser console

## Support

- Render Docs: [https://render.com/docs](https://render.com/docs)
- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Render API: [https://api-docs.render.com/](https://api-docs.render.com/)
