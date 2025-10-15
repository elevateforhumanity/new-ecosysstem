# 🤖 EFH AI Agent Deployment Guide

Your own **Emergent-style autopilot** living inside the EFH ecosystem.

## 🧠 What You Get

✅ **Natural language commands** - "Create a new Tax Prep Training program for $2500 tuition"  
✅ **Edge-fast performance** - Runs on Cloudflare Workers  
✅ **Government-compliant** - Full audit trail, no 3rd-party lock-in  
✅ **Secure execution** - Supabase Row-Level Security + JWT auth  
✅ **Full control** - You own the logic, data, and infrastructure  

---

## 📁 Architecture

```
Frontend (Admin Dashboard)
     ↓
Backend API Proxy (/api/agent)
     ↓
Cloudflare Worker (agent-worker.js)
     - Verifies JWT
     - Calls OpenAI GPT-4
     - Returns { action, params }
     ↓
Supabase Edge Function (executeAction)
     - Executes DB operations
     - Logs to agent_events
     ↓
Supabase Database + RLS
```

---

## 🚀 Quick Start

### 1️⃣ Deploy Database Migration

```bash
cd /workspaces/fix2

# Apply agent_events table
psql -h db.cuxzzpsyufcewtmicszk.supabase.co -U postgres -d postgres \
  -f supabase/migrations/004_agent_events.sql
```

Or via Supabase CLI:

```bash
supabase db push
```

### 2️⃣ Deploy Supabase Edge Function

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref cuxzzpsyufcewtmicszk

# Deploy function
supabase functions deploy executeAction
```

### 3️⃣ Deploy Cloudflare Worker

```bash
cd workers/agent

# Set secrets
npx wrangler secret put OPENAI_API_KEY
# Paste your OpenAI API key (sk-...)

npx wrangler secret put SUPABASE_FUNCTION_URL
# Paste: https://cuxzzpsyufcewtmicszk.functions.supabase.co

npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# Paste your Supabase service role key

npx wrangler secret put SUPABASE_URL
# Paste: https://cuxzzpsyufcewtmicszk.supabase.co

npx wrangler secret put SUPABASE_ANON_KEY
# Paste your Supabase anon key

# Deploy worker
npx wrangler deploy agent-worker.js --config wrangler.toml
```

### 4️⃣ Update Backend Environment

Add to your backend `.env`:

```bash
AGENT_WORKER_URL=https://efh-agent.your-subdomain.workers.dev
```

### 5️⃣ Add Agent Console to Admin Dashboard

```tsx
// In your admin dashboard page
import AgentConsole from '@/components/AgentConsole';

export default function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <AgentConsole />
    </div>
  );
}
```

---

## 🔐 Security Setup

### Set Admin Role

Only admins can use the agent:

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-admin@example.com';
```

### Verify RLS Policies

```sql
-- Check agent_events policies
SELECT * FROM pg_policies WHERE tablename = 'agent_events';
```

---

## 🧪 Testing

### Local Testing (with wrangler dev)

```bash
cd workers/agent

# Start local worker
npx wrangler dev agent-worker.js

# In another terminal, run tests
./test-agent.sh http://localhost:8787 your-jwt-token
```

### Production Testing

```bash
# Get your JWT token from browser localStorage
# Then test against production worker
./test-agent.sh https://efh-agent.your-subdomain.workers.dev your-jwt-token
```

### Manual Test via curl

```bash
curl -X POST https://efh-agent.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "Create a new Tax Prep Training program for $2500 tuition"
  }'
```

---

## 📋 Available Commands

### Program Management

```
"Create a new Tax Prep Training program for $2500 tuition"
"Update tuition for program abc-123 to $3000"
"Add a Medical Billing course with 160 hours"
```

### Student Enrollment

```
"Enroll student abc-123 in program xyz-789"
"Mark enrollment abc-123 as completed"
"Update enrollment xyz to 75% progress"
```

### Affiliate Management

```
"Add affiliate partner John Smith with email john@example.com"
"Process $500 payout to affiliate abc-123"
```

### Reports & Analytics

```
"Generate ETPL report"
"Show me the stats"
"Create compliance report"
```

---

## 🛠️ Customization

### Add New Actions

1. **Update command catalog** (`workers/agent/command-catalog.js`):

```javascript
export const COMMAND_CATALOG = {
  // ... existing actions
  
  myNewAction: {
    description: "Do something custom",
    params: {
      param1: { type: "string", required: true },
    },
    examples: ["Do my custom thing"],
  },
};
```

2. **Add handler in Edge Function** (`supabase/functions/executeAction/index.ts`):

```typescript
case "myNewAction": {
  // Your custom logic here
  const { data, error } = await supabase
    .from("my_table")
    .insert(params);
  
  if (error) throw error;
  message = `✅ Custom action completed`;
  break;
}
```

3. **Update system prompt** in `agent-worker.js` to include new action

---

## 📊 Monitoring

### View Agent Logs

```sql
-- Recent agent actions
SELECT * FROM agent_events
ORDER BY created_at DESC
LIMIT 50;

-- Failed actions
SELECT * FROM agent_events
WHERE success = false
ORDER BY created_at DESC;

-- Actions by type
SELECT action, COUNT(*) as count
FROM agent_events
GROUP BY action
ORDER BY count DESC;
```

### Cloudflare Worker Logs

```bash
npx wrangler tail efh-agent
```

### Supabase Function Logs

```bash
supabase functions logs executeAction
```

---

## 🐛 Troubleshooting

### "Unauthorized" Error

- Check JWT token is valid
- Verify user has admin role in profiles table
- Check Authorization header format: `Bearer <token>`

### "OpenAI API error"

- Verify OPENAI_API_KEY secret is set correctly
- Check OpenAI account has credits
- Ensure API key has correct permissions

### "Edge function failed"

- Check Supabase function is deployed: `supabase functions list`
- Verify SUPABASE_FUNCTION_URL is correct
- Check function logs: `supabase functions logs executeAction`

### "Unknown action"

- Verify action name matches command catalog
- Check OpenAI is returning valid JSON
- Review worker logs: `npx wrangler tail efh-agent`

---

## 💰 Cost Estimates

### OpenAI API

- GPT-4: ~$0.03 per request (input + output)
- 1000 commands/month = ~$30/month

### Cloudflare Workers

- Free tier: 100,000 requests/day
- Paid: $5/month for 10M requests

### Supabase Edge Functions

- Free tier: 500,000 invocations/month
- Paid: $10/month for 2M invocations

**Total**: ~$30-50/month for moderate usage

---

## 🔄 Updates & Maintenance

### Update Worker

```bash
cd workers/agent
npx wrangler deploy agent-worker.js --config wrangler.toml
```

### Update Edge Function

```bash
supabase functions deploy executeAction
```

### Update Database Schema

```bash
# Create new migration
supabase migration new add_new_feature

# Edit migration file, then push
supabase db push
```

---

## 📚 Files Reference

```
workers/agent/
├── agent-worker.js          # Cloudflare Worker (main entry)
├── command-catalog.js       # Available actions catalog
├── wrangler.toml           # Worker configuration
└── test-agent.sh           # Test script

supabase/
├── functions/
│   └── executeAction/
│       └── index.ts        # Edge Function (secure execution)
└── migrations/
    └── 004_agent_events.sql # Audit table

frontend/src/components/
└── AgentConsole.tsx        # React UI component

backend/
└── server.js               # API proxy endpoint
```

---

## 🎯 Next Steps

1. ✅ Deploy all components (database, edge function, worker)
2. ✅ Set up secrets and environment variables
3. ✅ Test with sample commands
4. ✅ Add AgentConsole to admin dashboard
5. ✅ Train your team on available commands
6. 🚀 Start automating your workflows!

---

## 🆘 Support

- **Documentation**: This file
- **Command Catalog**: `workers/agent/command-catalog.js`
- **Test Script**: `workers/agent/test-agent.sh`
- **Logs**: Cloudflare dashboard + Supabase dashboard

---

**🎉 You now have your own Emergent-style AI agent!**

No 3rd-party lock-in. Full compliance. Complete control.
