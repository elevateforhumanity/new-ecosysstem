# 🚀 EFH Deployment Autopilot

API-first deployment automation for Elevate for Humanity LMS.

## What It Does

Automates deployment to:
- ✅ **Supabase** - Database setup and migrations
- ✅ **Render.com** - Backend API deployment
- ✅ **Cloudflare Pages** - Frontend deployment
- ✅ **Cloudflare DNS** - Domain configuration

## Quick Start

### 1. Install Dependencies

```bash
cd deploy-autopilot
npm install
```

### 2. Configure Credentials

```bash
cp .env.example .env
```

Edit `.env` and add your API tokens:

#### Cloudflare
1. Go to [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Use **"Edit Cloudflare Workers"** template
4. Add permissions: **Zone.DNS**, **Account.Cloudflare Pages**
5. Copy token to `CLOUDFLARE_API_TOKEN`

Get Account ID and Zone ID from your Cloudflare dashboard.

#### Render
1. Go to [https://dashboard.render.com/u/settings#api-keys](https://dashboard.render.com/u/settings#api-keys)
2. Click **"Create API Key"**
3. Copy to `RENDER_API_KEY`

#### Supabase
1. Go to [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Click **"Generate new token"**
3. Copy to `SUPABASE_ACCESS_TOKEN`

Your project ref and service key are already filled in.

### 3. Configure Tasks

Edit `tasks.yaml` to customize deployment steps.

**Current tasks:**
- Set up database (runs SQL schema)
- Deploy backend to Render
- Deploy frontend to Cloudflare Pages
- Purge cache

### 4. Run Deployment

**Dry run (preview):**
```bash
npm run dry
```

**Actual deployment:**
```bash
npm start
```

## Available Tasks

### Supabase

```yaml
# Run SQL query
- type: supabase.sql
  args:
    sql: "CREATE TABLE test (id bigint);"

# Run SQL file
- type: supabase.sql_file
  args:
    file: "../database/complete-lms-schema.sql"

# Create storage bucket
- type: supabase.create_bucket
  args:
    name: "course-files"
    public: false
```

### Render

```yaml
# List all services
- type: render.list

# Trigger deployment
- type: render.redeploy
  args:
    serviceId: "srv-xxxxx"
    clearCache: true

# Wait for deployment to complete
- type: render.wait_deploy
  args:
    serviceId: "srv-xxxxx"
    deployId: "dep-xxxxx"
```

### Cloudflare

```yaml
# Deploy Pages project
- type: cloudflare.deploy_pages
  args:
    projectName: "elevate-for-humanity"
    branch: "main"

# Purge cache
- type: cloudflare.purge

# Purge specific files
- type: cloudflare.purge
  args:
    files:
      - "https://example.com/style.css"

# Upsert DNS record
- type: cloudflare.dns_upsert
  args:
    type: "CNAME"
    name: "www"
    content: "elevate-for-humanity.pages.dev"
    proxied: true
```

## Error Handling

By default, autopilot stops on first error.

To continue on error:
```yaml
- type: some.task
  args:
    continueOnError: true
```

## Manual Steps Still Required

### First-Time Setup

These require manual UI interaction (one-time only):

1. **Create Render Service**
   - Go to [https://render.com/](https://render.com/)
   - Create web service
   - Connect GitHub repo
   - Get service ID for `tasks.yaml`

2. **Create Cloudflare Pages Project**
   - Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
   - Create Pages project
   - Connect GitHub repo
   - Project name goes in `tasks.yaml`

3. **Configure Stripe Webhook**
   - Go to [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint URL
   - Copy webhook secret to Render env vars

After initial setup, autopilot handles all redeployments!

## Advanced Usage

### Custom Task Files

```bash
npm start -- --config my-tasks.yaml
```

### Environment-Specific Configs

```bash
# Production
npm start -- --config tasks.prod.yaml

# Staging
npm start -- --config tasks.staging.yaml
```

### CI/CD Integration

Add to GitHub Actions:

```yaml
- name: Deploy
  run: |
    cd deploy-autopilot
    npm install
    npm start
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## Troubleshooting

### API Token Errors

- Verify tokens are not expired
- Check token permissions match required scopes
- Ensure no extra whitespace in `.env`

### Supabase SQL Errors

- Check SQL syntax
- Verify tables don't already exist
- Use `IF NOT EXISTS` clauses

### Render Deployment Fails

- Check service ID is correct
- Verify API key has correct permissions
- Check Render dashboard for build logs

### Cloudflare Errors

- Verify account ID and zone ID
- Check API token has required permissions
- Ensure project name matches exactly

## Security

- ✅ All credentials stored locally in `.env`
- ✅ No credentials sent to third parties
- ✅ API tokens can be revoked anytime
- ✅ Audit trail in provider dashboards

**Never commit `.env` to git!**

## Next Steps

1. Run `npm run dry` to preview
2. Run `npm start` to deploy
3. Check provider dashboards for status
4. Test your deployed application

## Support

- **Cloudflare API**: [https://developers.cloudflare.com/api/](https://developers.cloudflare.com/api/)
- **Render API**: [https://render.com/docs/api](https://render.com/docs/api)
- **Supabase API**: [https://supabase.com/docs/reference/api](https://supabase.com/docs/reference/api)
