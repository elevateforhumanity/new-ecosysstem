# Email Webhook Setup Guide

This guide shows you how to connect incoming emails to your AI employee system, enabling automatic lead triage, follow-ups, and task execution.

## Architecture

```
Incoming Email → Email Service → Cloudflare Worker → AI Planning → executeAction → Database
                                      ↓
                                 Workers AI
                              (Llama 3.1 8B)
```

## Option A: Postmark Inbound (Recommended)

**Pros:** Fast, reliable, built for webhooks, free tier available  
**Cons:** Requires custom domain/subdomain

### 1. Set Up Postmark

1. Create account at [postmarkapp.com](https://postmarkapp.com)
2. Go to **Servers** → **Inbound**
3. Add your domain (e.g., `inbox.yourdomain.com`)
4. Configure DNS records as shown:
   ```
   Type: MX
   Host: inbox.yourdomain.com
   Value: inbound.postmarkapp.com
   Priority: 10
   ```

### 2. Configure Webhook

1. In Postmark Inbound settings, set:
   - **Webhook URL:** `https://efh-agent.your-workers.dev/webhooks/inbound`
   - **Include raw email:** No (optional)
2. Copy the **Inbound webhook token** (for signature verification)

### 3. Set Worker Secret

```bash
cd workers/agent
wrangler secret put POSTMARK_INBOUND_TOKEN
# Paste your token when prompted
```

### 4. Test

Send an email to `anything@inbox.yourdomain.com` and check:
- Postmark Activity log shows delivery
- Worker logs show processing
- `agent_events` table has new entry

---

## Option B: Gmail Apps Script

**Pros:** Use existing Gmail account, no domain needed  
**Cons:** 5-minute polling delay, Gmail API quotas

### 1. Create Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Create new project: "EFH Email Forwarder"
3. Copy code from `docs/gmail-forwarder.gs`
4. Save project

### 2. Configure Script Properties

1. Click **Project Settings** (gear icon)
2. Add **Script Properties**:
   - `WEBHOOK_URL`: `https://efh-agent.your-workers.dev/webhooks/inbound`
   - `WEBHOOK_SECRET`: (optional) any random string

### 3. Set Up Trigger

Run the `setupTrigger()` function:
1. Click **Run** → Select `setupTrigger`
2. Authorize the script (first time only)
3. Verify trigger created: **Triggers** tab shows `processInbox` every 5 minutes

### 4. Update Worker to Accept Gmail Format

The worker already handles both Postmark and generic email formats. For Gmail, you may want to skip signature verification:

```javascript
// In ai-employee.js, update verifyPostmarkSignature:
async function verifyPostmarkSignature(request, env, bodyText) {
  const signature = request.headers.get('X-Postmark-Webhook-Signature');
  const gmailSecret = request.headers.get('X-Webhook-Secret');
  
  // Allow Gmail Apps Script with secret
  if (gmailSecret && env.GMAIL_WEBHOOK_SECRET) {
    return gmailSecret === env.GMAIL_WEBHOOK_SECRET;
  }
  
  // Postmark signature verification
  if (!signature || !env.POSTMARK_INBOUND_TOKEN) {
    return false;
  }
  
  // ... existing HMAC verification
}
```

Then set the secret:
```bash
wrangler secret put GMAIL_WEBHOOK_SECRET
```

### 5. Test

1. Send email to your Gmail address
2. Wait up to 5 minutes for trigger
3. Check Apps Script logs: **Executions** tab
4. Verify `agent_events` table updated

---

## Option C: Microsoft 365 / Outlook

**Pros:** Enterprise-grade, real-time push notifications  
**Cons:** More complex setup, requires Azure app registration

### 1. Register Azure App

1. Go to [Azure Portal](https://portal.azure.com)
2. **Azure Active Directory** → **App registrations** → **New registration**
3. Name: "EFH Email Webhook"
4. Redirect URI: `https://efh-agent.your-workers.dev/oauth/callback`
5. Copy **Application (client) ID** and **Directory (tenant) ID**

### 2. Create Client Secret

1. **Certificates & secrets** → **New client secret**
2. Copy the secret value (shown once)

### 3. Set API Permissions

1. **API permissions** → **Add permission** → **Microsoft Graph**
2. Add **Delegated permissions**:
   - `Mail.Read`
   - `Mail.ReadWrite`
3. **Grant admin consent**

### 4. Create Subscription

Use Microsoft Graph API to create a webhook subscription:

```bash
curl -X POST https://graph.microsoft.com/v1.0/subscriptions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "changeType": "created",
    "notificationUrl": "https://efh-agent.your-workers.dev/webhooks/outlook",
    "resource": "me/mailFolders('Inbox')/messages",
    "expirationDateTime": "2024-12-31T23:59:59Z",
    "clientState": "YOUR_RANDOM_SECRET"
  }'
```

### 5. Add Outlook Handler to Worker

```javascript
// In ai-employee.js, add route:
if (path === '/webhooks/outlook' && request.method === 'POST') {
  const notification = await request.json();
  
  // Verify clientState
  if (notification.value[0].clientState !== env.OUTLOOK_CLIENT_STATE) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Fetch the actual email using Graph API
  const messageId = notification.value[0].resourceData.id;
  const emailResponse = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${messageId}`,
    {
      headers: {
        'Authorization': `Bearer ${env.OUTLOOK_ACCESS_TOKEN}`
      }
    }
  );
  
  const email = await emailResponse.json();
  
  // Convert to standard format and process
  const standardEmail = {
    From: email.from.emailAddress.address,
    FromName: email.from.emailAddress.name,
    Subject: email.subject,
    TextBody: email.bodyPreview,
    HtmlBody: email.body.content,
  };
  
  return handlePostmarkInbound(env, standardEmail);
}
```

---

## Email Processing Flow

Once configured, here's what happens when an email arrives:

### 1. Email Received
```
To: support@inbox.yourdomain.com
From: john@example.com
Subject: I want to enroll in the Tax Prep program
Body: Hi, I'm interested in your tax preparation training...
```

### 2. AI Analyzes Email
The worker uses Workers AI (Llama 3.1 8B) to understand intent:
```json
{
  "action": "createLead",
  "params": {
    "email": "john@example.com",
    "name": "John",
    "source": "email",
    "notes": "Interested in Tax Prep program"
  }
}
```

### 3. Actions Executed
- Create lead in CRM (`leads` table)
- Send follow-up email (queued in `email_queue`)
- Log activity (`agent_events` table)

### 4. Follow-up Sent
```
To: john@example.com
Subject: Welcome to Elevate for Humanity!
Body: Hi John, thanks for your interest in our Tax Prep program...
```

---

## Available Actions

The AI can trigger these actions based on email content:

| Action | When Used | Example |
|--------|-----------|---------|
| `createLead` | New inquiry | "I'm interested in your programs" |
| `makeCheckout` | Ready to enroll | "I want to sign up" |
| `sendFollowupEmail` | Questions | "How much does it cost?" |
| `uploadIntakeDoc` | Attachments | Email with W-2, ID, etc. |
| `createAffiliate` | Affiliate inquiry | "I want to become an affiliate" |
| `scheduleTask` | Follow-up needed | "Call me next week" |

---

## Testing

### Test with curl

```bash
# Simulate Postmark webhook
curl -X POST https://efh-agent.your-workers.dev/webhooks/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "From": "test@example.com",
    "FromName": "Test User",
    "Subject": "Test enrollment inquiry",
    "TextBody": "I want to enroll in the Leadership program",
    "Attachments": []
  }'
```

### Check Logs

```bash
# Worker logs
wrangler tail

# Database logs
# Query agent_events table in Supabase
```

### Verify Actions

1. Check `leads` table for new entry
2. Check `email_queue` for queued follow-up
3. Check `agent_events` for activity log

---

## Troubleshooting

### Emails Not Processing

1. **Check webhook URL:** Ensure it's publicly accessible
2. **Verify secrets:** Run `wrangler secret list`
3. **Check logs:** Run `wrangler tail` while sending test email
4. **Test signature:** Temporarily disable verification for debugging

### AI Not Understanding Emails

1. **Check prompt:** Review system prompt in `planTask()` function
2. **Adjust temperature:** Lower = more consistent (currently 0.2)
3. **Add examples:** Include few-shot examples in prompt
4. **Fallback:** System creates lead + sends generic follow-up if AI fails

### Actions Failing

1. **Check Supabase:** Verify `executeAction` Edge Function is deployed
2. **Check secrets:** Ensure `SUPABASE_SERVICE_KEY` is set
3. **Check tables:** Verify all tables exist (run migrations)
4. **Check RLS:** Service role should bypass RLS policies

---

## Security Best Practices

1. **Always verify signatures:** Don't skip Postmark HMAC verification in production
2. **Use secrets:** Store all tokens in Wrangler secrets, never in code
3. **Rate limiting:** Add rate limiting to prevent abuse
4. **Sanitize input:** Validate email data before processing
5. **Monitor logs:** Set up alerts for failed actions

---

## Next Steps

1. **Deploy worker:** `wrangler deploy`
2. **Set up email service:** Choose Postmark, Gmail, or Outlook
3. **Configure secrets:** Set all required tokens
4. **Test thoroughly:** Send various email types
5. **Monitor activity:** Watch `agent_events` table
6. **Tune AI prompts:** Adjust based on real-world performance

---

## Cost Estimate

- **Postmark:** Free tier (100 emails/month), then $10/month (10k emails)
- **Workers AI:** Free tier (10k requests/day), then $0.01 per 1k requests
- **Cloudflare Workers:** Free tier (100k requests/day), then $0.50 per million
- **Supabase:** Free tier (500MB database), then $25/month

**Total for 1000 emails/month:** ~$0 (all within free tiers)
