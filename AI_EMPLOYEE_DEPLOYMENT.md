# AI Employee System - Deployment Guide

## 🎯 Overview

The AI Employee system is an autonomous assistant that handles:
- **Email triage** - Automatically processes incoming emails
- **Lead management** - Creates and updates leads in CRM
- **Follow-up automation** - Sends templated emails
- **Task planning** - Uses Workers AI to plan multi-step workflows
- **Action execution** - Executes approved actions via Supabase Edge Functions

**Cost:** $0/month (uses Cloudflare Workers AI free tier)

---

## 📋 Prerequisites

1. **Cloudflare Account** with Workers AI enabled
2. **Supabase Project** with database access
3. **Email Service** (choose one):
   - Postmark (recommended)
   - Gmail with Apps Script
   - Resend
   - SendGrid

---

## 🚀 Deployment Steps

### Step 1: Apply Database Migration

Run migration `009_ai_employee_tables.sql` in your Supabase SQL Editor:

```bash
# Via Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of supabase/migrations/009_ai_employee_tables.sql
# 3. Run the migration

# Or via CLI (if linked):
supabase db push
```

This creates 4 new tables:
- `leads` - CRM for prospects
- `email_queue` - Outbound email queue
- `scheduled_tasks` - Follow-up task scheduler
- `ai_tasks` - AI employee activity log

### Step 2: Create KV Namespace

```bash
cd workers/agent

# Create KV namespace for activity logs
npx wrangler kv namespace create AI_EMPLOYEE_LOGS

# Copy the ID from output and update wrangler.toml:
# [[kv_namespaces]]
# binding = "AI_EMPLOYEE_LOGS"
# id = "YOUR_KV_NAMESPACE_ID"
```

### Step 3: Deploy Supabase Edge Function

```bash
cd supabase/functions

# Deploy executeAction with new actions
supabase functions deploy executeAction --project-ref YOUR_PROJECT_REF
```

### Step 4: Set Worker Secrets

```bash
cd workers/agent

# Required secrets
npx wrangler secret put SUPABASE_URL
# Enter: https://YOUR_PROJECT.supabase.co

npx wrangler secret put SUPABASE_SERVICE_KEY
# Enter: your service role key

npx wrangler secret put SUPABASE_ANON_KEY
# Enter: your anon key

npx wrangler secret put CF_ACCOUNT_ID
# Enter: your Cloudflare account ID

npx wrangler secret put CF_API_TOKEN
# Enter: your Cloudflare API token

# Email service (choose one)
npx wrangler secret put POSTMARK_INBOUND_TOKEN
# Enter: your Postmark inbound webhook token

npx wrangler secret put POSTMARK_SERVER_TOKEN
# Enter: your Postmark server token (for sending)

# OR for Resend
npx wrangler secret put RESEND_API_KEY

# OR for SendGrid
npx wrangler secret put SENDGRID_API_KEY

# Optional
npx wrangler secret put FROM_EMAIL
# Enter: support@yourdomain.com
```

### Step 5: Deploy Worker

```bash
cd workers/agent

# Deploy to Cloudflare
npx wrangler deploy ai-employee.js

# Note the deployed URL (e.g., https://efh-agent.your-subdomain.workers.dev)
```

### Step 6: Configure Email Webhook

#### Option A: Postmark (Recommended)

1. Go to [Postmark](https://postmarkapp.com) → Inbound
2. Add your domain (e.g., `inbox.yourdomain.com`)
3. Configure DNS MX record:
   ```
   Type: MX
   Host: inbox.yourdomain.com
   Value: inbound.postmarkapp.com
   Priority: 10
   ```
4. Set webhook URL: `https://efh-agent.your-subdomain.workers.dev/webhooks/inbound`
5. Copy inbound webhook token (already set in Step 4)

#### Option B: Gmail Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Create new project
3. Copy code from `docs/gmail-forwarder.gs`
4. Set script properties:
   - `WEBHOOK_URL`: `https://efh-agent.your-subdomain.workers.dev/webhooks/inbound`
   - `WEBHOOK_SECRET`: (any random string)
5. Run `setupTrigger()` function
6. Authorize the script

---

## 🧪 Testing

### Test Email Webhook

```bash
# Send test email via curl
curl -X POST https://efh-agent.your-subdomain.workers.dev/webhooks/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "From": "test@example.com",
    "FromName": "Test User",
    "Subject": "I want to enroll in the Leadership program",
    "TextBody": "Hi, I am interested in your Leadership Development program. Can you send me more information?",
    "Attachments": []
  }'
```

### Check Results

1. **Worker Logs:**
   ```bash
   npx wrangler tail
   ```

2. **Database:**
   ```sql
   -- Check leads table
   SELECT * FROM leads ORDER BY created_at DESC LIMIT 5;
   
   -- Check email queue
   SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;
   
   -- Check agent events
   SELECT * FROM agent_events ORDER BY created_at DESC LIMIT 5;
   ```

3. **API Endpoints:**
   ```bash
   # Health check
   curl https://efh-agent.your-subdomain.workers.dev/health
   
   # List available tools
   curl https://efh-agent.your-subdomain.workers.dev/tools
   
   # Get email templates
   curl https://efh-agent.your-subdomain.workers.dev/templates
   ```

---

## 📊 Available Tools

The AI employee can execute these actions:

| Tool | Description | Risk Level | Requires Approval |
|------|-------------|------------|-------------------|
| `createLead` | Create/update lead in CRM | Low | No |
| `updateLead` | Update lead status | Low | No |
| `scheduleTask` | Schedule follow-up task | Low | No |
| `sendFollowupEmail` | Send templated email | Low | No |
| `makeCheckout` | Create Stripe checkout link | Medium | No |
| `enrollStudent` | Enroll student in program | High | Yes |
| `uploadIntakeDoc` | Upload documents to R2 | High | Yes |
| `createAffiliate` | Create affiliate account | Medium | Yes |
| `getStats` | Get platform statistics | Low | No |
| `logAgentEvent` | Log activity | Low | No |

---

## 📧 Email Templates

12 pre-built templates available:

**Lead Nurturing:**
- `enrollment_inquiry` - Welcome email for new inquiries
- `payment_question` - Payment options and pricing
- `general` - Generic response template

**Enrollment & Onboarding:**
- `welcome` - Welcome enrolled students
- `enrollment_checkout` - Send checkout link

**Reminders & Follow-ups:**
- `reminder` - Payment or enrollment reminders
- `followup_no_response` - Re-engage cold leads

**Affiliate Program:**
- `affiliate_welcome` - Welcome new affiliates
- `affiliate_commission_earned` - Commission notifications

**Administrative:**
- `document_received` - Document upload confirmation
- `support_ticket` - Support ticket responses

---

## 🔧 Configuration

### Customize Email Templates

Edit `workers/agent/email-templates.js`:

```javascript
export const EMAIL_TEMPLATES = {
  custom_template: {
    subject: "Your Subject - {{variable}}",
    body: `Hi {{name}},
    
    Your custom message here.
    
    {{#if conditionalVar}}
    This shows if conditionalVar is truthy.
    {{/if}}
    
    Best regards,
    Your Team`
  }
};
```

### Add New Tools

Edit `workers/agent/tool-registry.js`:

```javascript
export const TOOL_REGISTRY = {
  myNewTool: {
    description: "What this tool does",
    category: "crm",
    riskLevel: "low",
    requiresApproval: false,
    parameters: {
      param1: { type: "string", required: true, description: "Param description" },
    },
    examples: [
      {
        input: "Example user request",
        output: { param1: "example value" }
      }
    ]
  }
};
```

Then add the action to `supabase/functions/executeAction/index.ts`.

---

## 📈 Monitoring

### View Activity Logs

```bash
# Worker logs
npx wrangler tail

# Database logs
SELECT 
  event_type,
  action_name,
  parameters->>'from' as from_email,
  parameters->>'subject' as subject,
  created_at
FROM agent_events
ORDER BY created_at DESC
LIMIT 20;
```

### Email Queue Status

```bash
# Check email queue stats
curl https://efh-agent.your-subdomain.workers.dev/email-stats

# Or via SQL
SELECT 
  status,
  COUNT(*) as count
FROM email_queue
GROUP BY status;
```

### AI Task Performance

```sql
SELECT 
  status,
  requires_approval,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_duration_seconds
FROM ai_tasks
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status, requires_approval;
```

---

## 🔒 Security Best Practices

1. **Always verify webhook signatures** - Don't skip HMAC verification in production
2. **Use secrets for all tokens** - Never hardcode credentials
3. **Enable RLS policies** - Restrict database access appropriately
4. **Monitor high-risk actions** - Review actions that require approval
5. **Rate limit webhooks** - Prevent abuse of email endpoint
6. **Sanitize email input** - Validate all incoming data
7. **Audit logs regularly** - Review agent_events table weekly

---

## 🐛 Troubleshooting

### Emails Not Processing

1. Check webhook URL is publicly accessible
2. Verify secrets are set: `npx wrangler secret list`
3. Check worker logs: `npx wrangler tail`
4. Test signature verification (temporarily disable for debugging)

### AI Not Understanding Emails

1. Review system prompt in `planTask()` function
2. Lower temperature for more consistent results (currently 0.3)
3. Add few-shot examples to the prompt
4. Check Workers AI quota: [Cloudflare Dashboard](https://dash.cloudflare.com)

### Actions Failing

1. Verify `executeAction` Edge Function is deployed
2. Check `SUPABASE_SERVICE_KEY` is set correctly
3. Verify all tables exist (run migration 009)
4. Check RLS policies allow service role access

### Email Sending Fails

1. Verify email provider API key is set
2. Check `FROM_EMAIL` is configured
3. Review email_queue table for error messages
4. Test email provider API directly

---

## 💰 Cost Breakdown

**Free Tier Usage:**
- Cloudflare Workers: 100k requests/day
- Workers AI: 10k requests/day
- Cloudflare KV: 100k reads/day, 1k writes/day
- Supabase: 500MB database, 2GB bandwidth

**Paid Services (if needed):**
- Postmark: $10/month (10k emails)
- Resend: $20/month (50k emails)
- SendGrid: $15/month (40k emails)

**Estimated Monthly Cost for 1000 emails:** $0 (within free tiers)

---

## 📚 Additional Resources

- [Email Webhook Setup Guide](docs/EMAIL_WEBHOOK_SETUP.md)
- [Gmail Forwarder Script](docs/gmail-forwarder.gs)
- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Postmark Inbound](https://postmarkapp.com/inbound)

---

## 🎉 Next Steps

1. **Test the system** - Send test emails and verify responses
2. **Customize templates** - Adjust email templates for your brand
3. **Add more tools** - Extend the tool registry with custom actions
4. **Monitor performance** - Set up alerts for failed actions
5. **Scale up** - Increase email volume as needed

The AI Employee is now ready to handle your leads, send follow-ups, and automate workflows! 🚀
