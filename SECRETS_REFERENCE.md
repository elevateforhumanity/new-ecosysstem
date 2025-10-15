# 🔑 Secrets Reference Guide

Complete guide for managing secrets across all EFH Autopilot workers.

---

## 📋 Quick Start

### One-Command Setup

```bash
# 1. Configure environment
cp .env.bootstrap.example .env
nano .env  # Fill in your values

# 2. Run quick deploy (sets secrets + deploys)
bash scripts/quick-deploy.sh
```

---

## 🔐 Required Secrets

These secrets are **required** for all workers to function:

### CF_API_TOKEN
- **Description:** Cloudflare API token with Workers, KV, and R2 permissions
- **Where to get:** [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- **Permissions needed:**
  - Account → Workers Scripts → Edit
  - Account → Workers KV Storage → Edit
  - Account → Workers R2 Storage → Edit
  - Account → Account Settings → Read
- **Used by:** All workers (orchestrator, analyzer, stylist)

### CF_ACCOUNT_ID
- **Description:** Your Cloudflare account ID
- **Where to get:** Cloudflare Dashboard → Account ID (in URL or sidebar)
- **Format:** 32-character hex string
- **Used by:** All workers (orchestrator, analyzer, stylist)

---

## 🔧 Optional Secrets

### Supabase Integration

#### SUPABASE_URL
- **Description:** Your Supabase project URL
- **Where to get:** Supabase Dashboard → Settings → API
- **Format:** `https://your-project.supabase.co`
- **Used by:** Workers that need to access Supabase database or Edge Functions

#### SUPABASE_SERVICE_KEY
- **Description:** Supabase service role key (full access)
- **Where to get:** Supabase Dashboard → Settings → API → service_role key
- **Security:** Keep this secret! It bypasses Row Level Security
- **Used by:** Workers that need admin access to Supabase

#### SUPABASE_DB_PASSWORD
- **Description:** Database password for direct connections
- **Where to get:** Supabase Dashboard → Settings → Database
- **Used by:** Edge Functions that need direct database access

### Worker-Specific

#### SERVICE_TOKEN
- **Description:** Internal token for worker-to-worker authentication
- **Format:** Any secure random string
- **Generate:** `openssl rand -hex 32`
- **Used by:** All workers for inter-worker communication

#### SITE_TITLE
- **Description:** Branding for generated pages
- **Default:** "Elevate For Humanity"
- **Used by:** Stylist worker only

### Third-Party Services

#### STRIPE_SECRET_KEY
- **Description:** Stripe API secret key for payments
- **Where to get:** Stripe Dashboard → Developers → API Keys
- **Format:** `sk_live_...` or `sk_test_...`
- **Used by:** Workers handling payments

#### POSTMARK_API_TOKEN
- **Description:** Postmark API token for sending emails
- **Where to get:** Postmark → Servers → API Tokens
- **Used by:** Workers sending transactional emails

#### OPENAI_API_KEY
- **Description:** OpenAI API key for AI features
- **Where to get:** OpenAI Platform → API Keys
- **Format:** `sk-...`
- **Used by:** Workers using OpenAI models

---

## 🚀 Setting Secrets

### Method 1: Quick Deploy Script (Recommended)

```bash
# Sets all secrets and deploys in one command
bash scripts/quick-deploy.sh
```

### Method 2: Setup Secrets Script

```bash
# Only sets secrets, doesn't deploy
bash scripts/setup-secrets.sh
```

### Method 3: Manual Commands

#### Set Environment Variables

```bash
# Required
export CF_ACCOUNT_ID="your_account_id_here"
export CF_API_TOKEN="your_api_token_here"

# Optional Supabase
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your_service_key_here"
export SUPABASE_DB_PASSWORD="your_db_password_here"

# Optional branding
export SITE_TITLE="Elevate For Humanity"

# Optional service token
export SERVICE_TOKEN="your_internal_token_here"
```

#### Push to All Workers (Loop)

```bash
for W in efh-autopilot-orchestrator efh-autopilot-analyzer efh-stylist; do
  echo "🔑 Setting secrets on $W"
  printf "%s" "$CF_API_TOKEN"         | wrangler secret put CF_API_TOKEN         --name "$W"
  printf "%s" "$CF_ACCOUNT_ID"        | wrangler secret put CF_ACCOUNT_ID        --name "$W"
  printf "%s" "$SUPABASE_URL"         | wrangler secret put SUPABASE_URL         --name "$W"
  printf "%s" "$SUPABASE_SERVICE_KEY" | wrangler secret put SUPABASE_SERVICE_KEY --name "$W"
  printf "%s" "$SUPABASE_DB_PASSWORD" | wrangler secret put SUPABASE_DB_PASSWORD --name "$W"
  printf "%s" "$SERVICE_TOKEN"        | wrangler secret put SERVICE_TOKEN        --name "$W"
done
```

#### Push to Individual Worker

```bash
# Orchestrator
printf "%s" "$CF_API_TOKEN" | wrangler secret put CF_API_TOKEN --name efh-autopilot-orchestrator
printf "%s" "$CF_ACCOUNT_ID" | wrangler secret put CF_ACCOUNT_ID --name efh-autopilot-orchestrator

# Analyzer
printf "%s" "$CF_API_TOKEN" | wrangler secret put CF_API_TOKEN --name efh-autopilot-analyzer
printf "%s" "$CF_ACCOUNT_ID" | wrangler secret put CF_ACCOUNT_ID --name efh-autopilot-analyzer

# Stylist
printf "%s" "$CF_API_TOKEN" | wrangler secret put CF_API_TOKEN --name efh-stylist
printf "%s" "$CF_ACCOUNT_ID" | wrangler secret put CF_ACCOUNT_ID --name efh-stylist
printf "%s" "$SITE_TITLE" | wrangler secret put SITE_TITLE --name efh-stylist
```

---

## 🔍 Verifying Secrets

### List Secrets for a Worker

```bash
# Orchestrator
wrangler secret list --name efh-autopilot-orchestrator

# Analyzer
wrangler secret list --name efh-autopilot-analyzer

# Stylist
wrangler secret list --name efh-stylist
```

**Note:** This only shows secret names, not values (for security).

### Test Worker with Secrets

```bash
# Test orchestrator (uses CF_API_TOKEN)
curl https://efh-autopilot-orchestrator.workers.dev/autopilot/diagnose

# Should return JSON with token info and resources
```

---

## 🔄 Updating Secrets

### Update a Single Secret

```bash
# Update CF_API_TOKEN for orchestrator
printf "%s" "new_token_value" | wrangler secret put CF_API_TOKEN --name efh-autopilot-orchestrator
```

### Update All Secrets

```bash
# Update .env file with new values
nano .env

# Re-run quick deploy
bash scripts/quick-deploy.sh
```

---

## 🗑️ Deleting Secrets

### Delete a Secret

```bash
# Delete from orchestrator
wrangler secret delete CF_API_TOKEN --name efh-autopilot-orchestrator

# Delete from all workers
for W in efh-autopilot-orchestrator efh-autopilot-analyzer efh-stylist; do
  wrangler secret delete SECRET_NAME --name "$W"
done
```

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets

- ✅ Use `.env` file (already in `.gitignore`)
- ✅ Use Wrangler secrets (encrypted at rest)
- ❌ Never commit secrets to Git
- ❌ Never put secrets in `wrangler.toml` `[vars]` section

### 2. Use Restricted Tokens

- ✅ Create tokens with minimal required permissions
- ✅ Use separate tokens for different environments
- ❌ Don't use Global API Key
- ❌ Don't share tokens across projects

### 3. Rotate Regularly

- ✅ Rotate API tokens every 90 days
- ✅ Rotate service tokens monthly
- ✅ Update secrets immediately if compromised
- ❌ Don't use the same token forever

### 4. Monitor Usage

- ✅ Check Cloudflare audit logs
- ✅ Monitor for unusual API activity
- ✅ Set up alerts for failed authentications
- ❌ Don't ignore security warnings

### 5. Secure Storage

- ✅ Use password manager for local secrets
- ✅ Use environment variables in CI/CD
- ✅ Encrypt `.env` file if storing in cloud
- ❌ Don't store secrets in plain text files

---

## 🎯 Secrets by Worker

### Orchestrator (efh-autopilot-orchestrator)

**Required:**
- `CF_API_TOKEN` - For Cloudflare API calls (infra provisioning)
- `CF_ACCOUNT_ID` - For Cloudflare API calls

**Optional:**
- `SUPABASE_URL` - If calling Supabase Edge Functions
- `SUPABASE_SERVICE_KEY` - If accessing Supabase database
- `SERVICE_TOKEN` - For worker-to-worker auth

**Purpose:** Manages autopilot registry, routes tasks, provisions infrastructure

### Analyzer (efh-autopilot-analyzer)

**Required:**
- `CF_API_TOKEN` - For Workers AI (summaries)
- `CF_ACCOUNT_ID` - For Workers AI

**Optional:**
- `SUPABASE_URL` - If storing summaries in Supabase
- `SUPABASE_SERVICE_KEY` - If accessing Supabase database
- `SERVICE_TOKEN` - For worker-to-worker auth

**Purpose:** Collects logs, generates AI summaries, provides analytics

### Stylist (efh-stylist)

**Required:**
- `CF_API_TOKEN` - For R2 access (storing generated pages)
- `CF_ACCOUNT_ID` - For R2 access

**Optional:**
- `SUPABASE_URL` - If fetching content from Supabase
- `SUPABASE_SERVICE_KEY` - If accessing Supabase database
- `SERVICE_TOKEN` - For worker-to-worker auth
- `SITE_TITLE` - Branding for generated pages

**Purpose:** Generates styled pages and assets

---

## 🐛 Troubleshooting

### "Authentication error [code: 10000]"

**Problem:** Invalid or missing API token.

**Solution:**
1. Verify token in `.env` is correct
2. Check token has required permissions
3. Ensure token is not expired
4. Re-set secret: `printf "%s" "$CF_API_TOKEN" | wrangler secret put CF_API_TOKEN --name worker-name`

### "Secret not found"

**Problem:** Secret not set for worker.

**Solution:**
1. List secrets: `wrangler secret list --name worker-name`
2. Set missing secret: `printf "%s" "value" | wrangler secret put SECRET_NAME --name worker-name`

### "Worker returns 500 error"

**Problem:** Worker can't access required secret.

**Solution:**
1. Check worker logs: `wrangler tail worker-name`
2. Verify secret is set: `wrangler secret list --name worker-name`
3. Re-deploy worker: `cd workers/worker-name && wrangler deploy`

### "Empty secret value"

**Problem:** Secret was set with empty value.

**Solution:**
1. Delete secret: `wrangler secret delete SECRET_NAME --name worker-name`
2. Set with correct value: `printf "%s" "correct_value" | wrangler secret put SECRET_NAME --name worker-name`

---

## 📚 Additional Resources

- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/commands/#secret)
- [API Token Permissions](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Security Best Practices](https://developers.cloudflare.com/workers/platform/security/)

---

## 🎓 Quick Reference

### Common Commands

```bash
# List all secrets for a worker
wrangler secret list --name worker-name

# Set a secret
printf "%s" "value" | wrangler secret put SECRET_NAME --name worker-name

# Delete a secret
wrangler secret delete SECRET_NAME --name worker-name

# View worker logs (to debug secret issues)
wrangler tail worker-name

# Deploy after updating secrets
cd workers/worker-name && wrangler deploy
```

### Environment Variables

```bash
# Load from .env
export $(grep -v '^#' .env | xargs)

# Check if set
echo $CF_API_TOKEN

# Unset if needed
unset CF_API_TOKEN
```

---

**Last Updated:** January 15, 2025  
**Version:** 1.0.0
