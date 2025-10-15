# Autopilot Orchestrator Guide

## 🎯 Overview

The Autopilot Orchestrator is the **master controller** for all AI systems in the EFH platform. It:

- ✅ Routes tasks to specialized autopilots
- ✅ Verifies capabilities and permissions
- ✅ Auto-creates missing infrastructure (KV, R2, Workers)
- ✅ Self-heals every 15 minutes via cron
- ✅ Provides unified API for all AI operations

**Cost:** $0/month (Cloudflare Workers free tier)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Autopilot Orchestrator                     │
│  (Master Controller - Routes & Manages All Autopilots)      │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────┐
             │              │              │              │
             ▼              ▼              ▼              ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ AI Employee│  │ AI Stylist │  │   Page     │  │  Payout    │
    │            │  │            │  │  Deployer  │  │   Batch    │
    │ • Email    │  │ • Pages    │  │ • Deploy   │  │ • Payouts  │
    │ • CRM      │  │ • Assets   │  │ • Publish  │  │ • Transfer │
    │ • Tasks    │  │ • Images   │  │            │  │            │
    └────────────┘  └────────────┘  └────────────┘  └────────────┘
```

---

## 📦 Components

### 1. Orchestrator Worker (`workers/orchestrator/orchestrator.js`)

**Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/autopilot/list` | GET | List all registered autopilots |
| `/autopilot/registry` | POST | Register/update an autopilot |
| `/autopilot/diagnose` | GET | Check token permissions and resources |
| `/autopilot/ensure-infra` | POST | Auto-create missing KV/R2/Workers |
| `/autopilot/plan` | POST | Route task to appropriate autopilot |
| `/health` | GET | Health check |

**Cron:** Runs every 15 minutes to ensure infrastructure health

### 2. Admin UI (`src/components/OrchestratorAdmin.tsx`)

React component for managing the orchestrator:
- View registered autopilots
- Run diagnostics
- Fix infrastructure
- Execute tasks manually
- Monitor results

### 3. Registration Script (`scripts/register-autopilots.sh`)

Bash script to register all existing autopilots with the orchestrator.

---

## 🚀 Deployment

### Step 1: Deploy Orchestrator Worker

```bash
cd workers/orchestrator

# Set secrets
export CLOUDFLARE_API_TOKEN=your_token_with_full_permissions
export CLOUDFLARE_ACCOUNT_ID=6ba1d2a52a3fa230972960db307ac7c0

npx wrangler secret put CF_API_TOKEN
# Paste your token

npx wrangler secret put CF_ACCOUNT_ID
# Paste: 6ba1d2a52a3fa230972960db307ac7c0

# Deploy
npx wrangler deploy orchestrator.js
```

### Step 2: Create KV Namespace (Optional)

The orchestrator can create this automatically, but you can do it manually:

```bash
npx wrangler kv namespace create REGISTRY

# Copy the ID and update wrangler.toml:
# [[kv_namespaces]]
# binding = "REGISTRY"
# id = "paste_id_here"

# Redeploy
npx wrangler deploy orchestrator.js
```

### Step 3: Register Autopilots

```bash
# Set orchestrator URL
export ORCHESTRATOR_URL=https://efh-autopilot-orchestrator.your-subdomain.workers.dev

# Run registration script
bash scripts/register-autopilots.sh
```

### Step 4: Verify Deployment

```bash
# Check health
curl https://efh-autopilot-orchestrator.your-subdomain.workers.dev/health

# List autopilots
curl https://efh-autopilot-orchestrator.your-subdomain.workers.dev/autopilot/list

# Run diagnostics
curl https://efh-autopilot-orchestrator.your-subdomain.workers.dev/autopilot/diagnose
```

---

## 🎯 Usage

### Register an Autopilot

```bash
curl -X POST https://efh-autopilot-orchestrator.your-subdomain.workers.dev/autopilot/registry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ai-employee",
    "endpoint": "https://efh-agent.your-subdomain.workers.dev",
    "capabilities": [
      "email.process",
      "crm.lead.create",
      "email.send"
    ],
    "needs": {
      "kvNamespaces": ["AI_EMPLOYEE_LOGS"],
      "r2Buckets": ["efh-private"]
    }
  }'
```

### Run a Task

```bash
curl -X POST https://efh-autopilot-orchestrator.your-subdomain.workers.dev/autopilot/plan \
  -H "Content-Type: application/json" \
  -d '{
    "task": "generate_page",
    "meta": {
      "pageType": "home",
      "description": "Welcome page for new students"
    }
  }'
```

### Auto-Fix Infrastructure

```bash
curl -X POST https://efh-autopilot-orchestrator.your-subdomain.workers.dev/autopilot/ensure-infra \
  -H "Content-Type: application/json" \
  -d '{
    "want": {
      "kvNamespaces": ["REGISTRY", "AI_EMPLOYEE_LOGS"],
      "r2Buckets": ["efh-assets", "efh-images", "efh-pages"]
    }
  }'
```

---

## 📋 Available Tasks

| Task | Capability | Autopilot | Description |
|------|------------|-----------|-------------|
| `generate_page` | `web.pages.generate` | AI Stylist | Generate branded page |
| `deploy_page` | `web.pages.deploy` | Page Deployer | Deploy page to R2 |
| `generate_asset` | `web.asset.generate` | AI Stylist | Generate marketing asset |
| `process_email` | `email.process` | AI Employee | Process incoming email |
| `create_lead` | `crm.lead.create` | AI Employee | Create CRM lead |
| `send_followup` | `email.send` | AI Employee | Send follow-up email |
| `make_checkout` | `payment.checkout.create` | AI Employee | Create Stripe checkout |
| `enroll_student` | `lms.enrollment.create` | AI Employee | Enroll student |
| `run_payout_batch` | `payouts.batch.run` | Payout Batch | Run affiliate payouts |
| `pay_affiliate_now` | `payouts.transfer.single` | Payout Batch | Single affiliate payout |

---

## 🔧 Autopilot Definition Schema

```typescript
interface Autopilot {
  name: string;                    // Unique identifier
  endpoint: string;                // Worker URL
  capabilities: string[];          // What it can do
  needs: {
    kvNamespaces?: string[];       // Required KV namespaces
    r2Buckets?: string[];          // Required R2 buckets
    workers?: Array<{              // Required Workers
      name: string;
      content: string;
    }>;
  };
}
```

**Example:**

```json
{
  "name": "ai-employee",
  "endpoint": "https://efh-agent.workers.dev",
  "capabilities": [
    "email.process",
    "crm.lead.create",
    "crm.lead.update",
    "email.send",
    "payment.checkout.create",
    "lms.enrollment.create",
    "files.intake.upload",
    "task.schedule"
  ],
  "needs": {
    "kvNamespaces": ["AI_EMPLOYEE_LOGS"],
    "r2Buckets": ["efh-private"]
  }
}
```

---

## 🩺 Self-Healing

The orchestrator automatically heals infrastructure every 15 minutes:

1. **Checks** if required KV namespaces exist
2. **Creates** missing namespaces via Cloudflare API
3. **Checks** if required R2 buckets exist
4. **Creates** missing buckets via Cloudflare API
5. **Logs** all actions taken

**Cron Schedule:** `*/15 * * * *` (every 15 minutes)

**Manual Trigger:**
```bash
curl -X POST https://efh-autopilot-orchestrator.your-subdomain.workers.dev/__scheduled
```

---

## 📊 Diagnostics

### Check System Health

```bash
curl https://efh-autopilot-orchestrator.your-subdomain.workers.dev/autopilot/diagnose
```

**Response:**
```json
{
  "token": {
    "id": "...",
    "status": "active"
  },
  "resources": {
    "kv": [
      { "id": "...", "title": "REGISTRY" },
      { "id": "...", "title": "AI_EMPLOYEE_LOGS" }
    ],
    "r2": [
      { "name": "efh-assets" },
      { "name": "efh-images" }
    ],
    "workers": [
      "efh-agent",
      "efh-ai-stylist",
      "efh-page-deployer"
    ]
  },
  "timestamp": "2024-10-15T13:00:00Z"
}
```

---

## 🎨 Admin UI

### Add to Your Dashboard

```tsx
import OrchestratorAdmin from './components/OrchestratorAdmin';

// In your router
<Route path="/admin/orchestrator" element={<OrchestratorAdmin />} />
```

### Features

- **View Autopilots:** See all registered autopilots and their capabilities
- **Run Diagnostics:** Check token permissions and resources
- **Fix Infrastructure:** One-click infrastructure healing
- **Execute Tasks:** Manually trigger any task
- **Live Results:** See JSON responses in real-time

---

## 🔒 Security

### Required API Token Permissions

Your Cloudflare API token must have:

- ✅ **Workers Scripts: Edit** - Deploy Workers
- ✅ **Workers KV Storage: Edit** - Create KV namespaces
- ✅ **Workers R2 Storage: Edit** - Create R2 buckets
- ✅ **Account Settings: Read** - Verify token/account

### Create Token

1. Go to [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Add KV and R2 permissions
5. Copy token and set as secret

---

## 📈 Monitoring

### View Autopilot Activity

```bash
# List all autopilots
curl https://efh-autopilot-orchestrator.your-subdomain.workers.dev/autopilot/list

# Check specific autopilot health
curl https://efh-agent.your-subdomain.workers.dev/health
curl https://efh-ai-stylist.your-subdomain.workers.dev/health
curl https://efh-page-deployer.your-subdomain.workers.dev/health
```

### Logs

```bash
# View orchestrator logs
npx wrangler tail efh-autopilot-orchestrator

# View specific autopilot logs
npx wrangler tail efh-agent
```

---

## 🐛 Troubleshooting

### "Authentication error [code: 10000]"

**Cause:** API token lacks required permissions

**Fix:** Update token with Workers Scripts:Edit, KV:Edit, R2:Edit permissions

### "No autopilot currently supports [capability]"

**Cause:** No autopilot registered with that capability

**Fix:** Register an autopilot with the required capability or add capability to existing autopilot

### "Infrastructure not ready"

**Cause:** Required KV/R2 resources don't exist

**Fix:** Run `/autopilot/ensure-infra` to auto-create resources

### "Failed to forward task"

**Cause:** Autopilot endpoint is unreachable

**Fix:** Verify autopilot is deployed and endpoint URL is correct

---

## 🎯 Best Practices

1. **Register all autopilots** after deployment
2. **Run diagnostics** before first use
3. **Monitor cron logs** for self-healing activity
4. **Use capabilities** to organize functionality
5. **Document custom tasks** in your autopilot code
6. **Test infrastructure healing** before production
7. **Keep token secure** - never commit to Git

---

## 🚀 Next Steps

### Immediate
1. Deploy orchestrator worker
2. Set API token secrets
3. Register existing autopilots
4. Run diagnostics
5. Test task routing

### Short-term
1. Add custom autopilots
2. Create new capabilities
3. Build monitoring dashboard
4. Set up alerts
5. Document workflows

### Long-term
1. Add AI log analyzer
2. Implement auto-scaling
3. Add performance metrics
4. Create capability marketplace
5. Build autopilot templates

---

## 📚 Resources

- **Cloudflare Workers:** https://developers.cloudflare.com/workers/
- **Workers AI:** https://developers.cloudflare.com/workers-ai/
- **KV Storage:** https://developers.cloudflare.com/kv/
- **R2 Storage:** https://developers.cloudflare.com/r2/
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/

---

## 🎉 Summary

The Autopilot Orchestrator provides:

- ✅ **Unified API** for all AI operations
- ✅ **Automatic routing** to specialized autopilots
- ✅ **Self-healing** infrastructure
- ✅ **Zero-cost** operation (free tier)
- ✅ **Easy management** via admin UI
- ✅ **Extensible** architecture for new autopilots

**All code is ready to deploy!** 🚀

Just need to create the API token with proper permissions and run the deployment commands.
