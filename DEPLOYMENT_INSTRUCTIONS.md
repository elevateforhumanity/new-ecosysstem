# 🚀 Complete Deployment Instructions

## Current Status

✅ **All code is committed and ready**  
⚠️ **Deployment blocked by API token permissions**

---

## 🔑 The Issue

Your current Cloudflare API token (`Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS`) has **insufficient permissions** to:
- Deploy Workers
- Create KV namespaces
- Create R2 buckets

This is a security feature - the token needs explicit permissions for these operations.

---

## ✅ Solution: Create New API Token

### Step 1: Go to Cloudflare Dashboard

Visit: [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)

### Step 2: Create Token

1. Click **"Create Token"**
2. Use **"Edit Cloudflare Workers"** template
3. **Add these additional permissions:**
   - Account → Workers Scripts → **Edit**
   - Account → Workers KV Storage → **Edit**
   - Account → Workers R2 Storage → **Edit**
   - Account → Account Settings → **Read**

### Step 3: Configure Token

- **Account Resources:** Include → Your Account (Elevateforhumanity@gmail.com's Account)
- **Zone Resources:** All zones (or specific zones if preferred)
- **TTL:** Start now, no expiration (or set expiration date)

### Step 4: Copy Token

After clicking "Create Token", **copy the token immediately** - you won't see it again!

Example: `AbCdEf123456_YourNewTokenHere_789XyZ`

### Step 5: Update .env File

```bash
# Open .env file
nano .env

# Replace the old token with new one:
CLOUDFLARE_API_TOKEN=AbCdEf123456_YourNewTokenHere_789XyZ
CLOUDFLARE_ACCOUNT_ID=6ba1d2a52a3fa230972960db307ac7c0

# Save and exit (Ctrl+X, Y, Enter)
```

---

## 🚀 Automated Deployment

Once you have the new token, run the bootstrap script:

```bash
# Make sure you're in the project root
cd /workspaces/fix2

# Run the bootstrap script
bash scripts/efh-autopilot-bootstrap.sh
```

### What the Script Does

1. ✅ **Checks prerequisites** (Wrangler CLI, credentials)
2. ✅ **Detects existing resources** (KV, R2, Workers)
3. ✅ **Creates KV namespaces:**
   - REGISTRY (for orchestrator)
   - LOGS (for analyzer)
   - SUMMARIES (for analyzer)
   - AI_EMPLOYEE_LOGS (for autopilots)
4. ✅ **Creates R2 buckets:**
   - efh-assets
   - efh-images
   - efh-pages
   - efh-private
5. ✅ **Updates wrangler.toml files** with KV namespace IDs
6. ✅ **Deploys Workers:**
   - efh-autopilot-orchestrator
   - efh-autopilot-analyzer
7. ✅ **Sets worker secrets** (API tokens, account IDs)
8. ✅ **Validates endpoints** (health checks)
9. ✅ **Deploys Supabase Edge Functions** (if available)
10. ✅ **Builds frontend** (optional)

---

## 📋 Manual Deployment (Alternative)

If you prefer to deploy manually:

### 1. Create KV Namespaces

```bash
cd /workspaces/fix2

# Create namespaces
npx wrangler kv:namespace create REGISTRY
npx wrangler kv:namespace create LOGS
npx wrangler kv:namespace create SUMMARIES
npx wrangler kv:namespace create AI_EMPLOYEE_LOGS
```

Copy the IDs from the output and update the wrangler.toml files.

### 2. Create R2 Buckets

```bash
npx wrangler r2 bucket create efh-assets
npx wrangler r2 bucket create efh-images
npx wrangler r2 bucket create efh-pages
npx wrangler r2 bucket create efh-private
```

### 3. Update Wrangler Configs

Edit `workers/orchestrator/wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "REGISTRY"
id = "paste_registry_id_here"
```

Edit `workers/analyzer/wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "LOGS"
id = "paste_logs_id_here"

[[kv_namespaces]]
binding = "SUMMARIES"
id = "paste_summaries_id_here"
```

### 4. Deploy Orchestrator

```bash
cd workers/orchestrator

# Set secrets
echo "6ba1d2a52a3fa230972960db307ac7c0" | npx wrangler secret put CF_ACCOUNT_ID
echo "your_new_token_here" | npx wrangler secret put CF_API_TOKEN

# Deploy
npx wrangler deploy
```

### 5. Deploy Analyzer

```bash
cd workers/analyzer

# Set secrets
echo "6ba1d2a52a3fa230972960db307ac7c0" | npx wrangler secret put CF_ACCOUNT_ID
echo "your_new_token_here" | npx wrangler secret put CF_API_TOKEN

# Deploy
npx wrangler deploy
```

### 6. Verify Deployments

```bash
# Test orchestrator
curl https://efh-autopilot-orchestrator.YOUR_SUBDOMAIN.workers.dev/health

# Test analyzer
curl https://efh-autopilot-analyzer.YOUR_SUBDOMAIN.workers.dev/health
```

---

## 🔗 Update Admin UI URLs

After deployment, update the worker URLs in your admin UI:

Edit `src/pages/AutopilotAdmin.tsx`:

```typescript
// Update these lines (around line 95-96):
const ORCHESTRATOR_BASE = "https://efh-autopilot-orchestrator.YOUR_SUBDOMAIN.workers.dev";
const ANALYZER_BASE = "https://efh-autopilot-analyzer.YOUR_SUBDOMAIN.workers.dev";
```

Replace `YOUR_SUBDOMAIN` with your actual Cloudflare Workers subdomain.

---

## 📝 Register Autopilots

After deployment, register your autopilots:

```bash
# Update the script with your orchestrator URL
export ORCHESTRATOR_URL=https://efh-autopilot-orchestrator.YOUR_SUBDOMAIN.workers.dev

# Run registration
bash scripts/register-autopilots.sh
```

Or register manually via the admin UI at `/autopilot-admin`.

---

## ✅ Verification Checklist

After deployment, verify everything works:

- [ ] Orchestrator health check returns 200 OK
- [ ] Analyzer health check returns 200 OK
- [ ] Admin UI loads at `/autopilot-admin`
- [ ] Can view registered autopilots
- [ ] Diagnostics button works
- [ ] Can register new autopilots
- [ ] Can execute tasks
- [ ] Can view logs
- [ ] Can generate AI summaries
- [ ] Charts display correctly

---

## 🐛 Troubleshooting

### "Authentication error [code: 10000]"

**Problem:** API token lacks required permissions.

**Solution:** Create new token with all required permissions (see above).

### "Namespace not found"

**Problem:** KV namespace not created or not bound correctly.

**Solution:** 
1. Create namespace: `npx wrangler kv:namespace create REGISTRY`
2. Update wrangler.toml with the ID
3. Redeploy: `npx wrangler deploy`

### "Worker not found"

**Problem:** Worker not deployed or wrong URL.

**Solution:**
1. Deploy worker: `cd workers/orchestrator && npx wrangler deploy`
2. Check deployment: `npx wrangler deployments list`
3. Update URL in admin UI

### "CORS errors in admin UI"

**Problem:** Browser blocking requests.

**Solution:** Workers already include CORS headers. Check:
1. Worker URL is correct
2. Worker is deployed
3. Browser console for specific error

### "Failed to fetch"

**Problem:** Network issue or worker not responding.

**Solution:**
1. Test with curl: `curl https://your-worker.workers.dev/health`
2. Check Cloudflare dashboard for errors
3. View logs: `npx wrangler tail worker-name`

---

## 📊 Expected Results

After successful deployment:

### Orchestrator
- **URL:** `https://efh-autopilot-orchestrator.YOUR_SUBDOMAIN.workers.dev`
- **Endpoints:**
  - `/health` - Health check
  - `/autopilot/list` - List autopilots
  - `/autopilot/registry` - Register autopilot
  - `/autopilot/plan` - Execute task
  - `/autopilot/diagnose` - System diagnostics
  - `/autopilot/ensure-infra` - Heal infrastructure

### Analyzer
- **URL:** `https://efh-autopilot-analyzer.YOUR_SUBDOMAIN.workers.dev`
- **Endpoints:**
  - `/health` - Health check
  - `/logs/ingest` - Log events
  - `/logs/list` - Query logs
  - `/logs/summarize` - Generate AI summary
  - `/logs/summary` - Get daily summary
  - `/logs/stats` - Get trend statistics

### Admin UI
- **URL:** `https://yourdomain.com/autopilot-admin`
- **Features:**
  - View all autopilots
  - Run diagnostics
  - Heal infrastructure
  - Register autopilots
  - Execute tasks
  - View logs
  - Generate summaries
  - Analyze trends

---

## 💰 Cost

**Free Tier Limits:**
- Workers: 100,000 requests/day
- KV: 100,000 reads/day, 1,000 writes/day, 1 GB storage
- R2: 10 GB storage, 1 million Class A operations/month
- Workers AI: 10,000 requests/day

**Your setup should stay within free tier** unless you have very high traffic.

---

## 📚 Additional Resources

- **Orchestrator Guide:** `ORCHESTRATOR_GUIDE.md`
- **Deployment Summary:** `DEPLOYMENT_SUMMARY.md`
- **Website Improvements:** `WEBSITE_IMPROVEMENTS.md`
- **Cloudflare Docs:** https://developers.cloudflare.com/workers/

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review Cloudflare Workers logs: `npx wrangler tail`
3. Run diagnostics in admin UI
4. Check browser console for errors
5. Verify all environment variables are set

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Complete AI orchestration platform
- ✅ Self-healing infrastructure
- ✅ AI-powered log analysis
- ✅ Beautiful admin dashboard
- ✅ Zero-cost operation (free tier)

**Your AI autopilot system is ready to manage all operations!** 🚀

---

**Last Updated:** 2025-01-15  
**Version:** 1.0.0  
**Status:** Ready for deployment (pending API token)
