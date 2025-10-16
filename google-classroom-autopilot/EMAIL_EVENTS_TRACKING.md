# Email Events Tracking System

Complete email tracking with provider message IDs, delivery status, opens, clicks, and bounces.

## Features

✅ **Provider Message ID Tracking** - Track emails across providers  
✅ **Status Updates** - Queued → Sent → Delivered → Opened → Clicked  
✅ **Bounce/Complaint Handling** - Automatic suppression  
✅ **Real-time Webhooks** - Instant status updates  
✅ **Admin Dashboard** - Visual monitoring  
✅ **Analytics** - Delivery rates, open rates, click rates  

## Architecture

```
Email Send
    ↓
Log to email_events (status: queued)
    ↓
Send via Provider (Resend/Postmark/SES)
    ↓
Update with provider_message_id (status: sent)
    ↓
Provider Webhook → Update status
    ↓
Admin Dashboard shows real-time status
```

## Database Schema

### email_events Table

```sql
CREATE TABLE email_events (
  id UUID PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT,
  provider TEXT NOT NULL,
  provider_message_id TEXT,
  status TEXT DEFAULT 'queued',
  queued_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  error_code TEXT,
  metadata JSONB,
  task_id UUID,
  student_id TEXT,
  guardian_email TEXT
);
```

### Status Flow

```
queued → sent → delivered → opened → clicked
                    ↓
                 bounced
                    ↓
                complained
                    ↓
                 failed
```

## Setup

### 1. Run SQL Schema

```bash
# In Supabase SQL Editor
cat sql/05_email_events.sql
```

### 2. Configure Webhooks

#### Resend

1. Go to [Resend Dashboard](https://resend.com/webhooks)
2. Click "Add Webhook"
3. URL: `https://your-domain.com/api/webhooks/resend`
4. Events: Select all (sent, delivered, opened, clicked, bounced, complained)
5. Copy webhook secret
6. Set environment variable:
   ```bash
   RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

#### Postmark

1. Go to [Postmark Webhooks](https://account.postmarkapp.com/servers/YOUR_SERVER/webhooks)
2. Click "Add Webhook"
3. URL: `https://your-domain.com/api/webhooks/postmark`
4. Events: Delivery, Open, Click, Bounce, Spam Complaint
5. No secret needed (Postmark uses IP whitelist)

#### AWS SES (via SNS)

1. Create SNS Topic:
   ```bash
   aws sns create-topic --name ses-email-events
   ```

2. Subscribe your endpoint:
   ```bash
   aws sns subscribe \
     --topic-arn arn:aws:sns:us-east-1:ACCOUNT:ses-email-events \
     --protocol https \
     --notification-endpoint https://your-domain.com/api/webhooks/ses
   ```

3. Configure SES to publish to SNS:
   ```bash
   aws ses put-configuration-set-event-destination \
     --configuration-set-name default \
     --event-destination Name=sns,Enabled=true,SNSDestination={TopicARN=arn:aws:sns:us-east-1:ACCOUNT:ses-email-events}
   ```

### 3. Set Up Webhook Endpoints

#### Option A: Express/Node.js

```typescript
import express from 'express';
import { webhookHandlers } from './src/email-webhooks';

const app = express();
app.use(express.json());

// Resend webhook
app.post('/api/webhooks/resend', webhookHandlers.resend);

// Postmark webhook
app.post('/api/webhooks/postmark', webhookHandlers.postmark);

// AWS SES webhook (via SNS)
app.post('/api/webhooks/ses', webhookHandlers.ses);

app.listen(3000);
```

#### Option B: Cloudflare Worker

```typescript
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/webhooks/resend') {
      const payload = await request.json();
      const signature = request.headers.get('resend-signature') || '';
      const result = await handleEmailWebhook('resend', payload, signature);
      return Response.json(result, { status: result.success ? 200 : 400 });
    }
    
    // Similar for postmark and ses...
    
    return new Response('Not Found', { status: 404 });
  }
};
```

#### Option C: Supabase Edge Function

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleEmailWebhook } from './email-webhooks.ts';

serve(async (req) => {
  const url = new URL(req.url);
  const provider = url.pathname.split('/').pop() as 'resend' | 'postmark' | 'ses';
  
  const payload = await req.json();
  const signature = req.headers.get('resend-signature') || '';
  
  const result = await handleEmailWebhook(provider, payload, signature);
  
  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## Admin Dashboard

### Access

Navigate to: `/admin/email-events`

### Features

**Stats Cards**:
- Total sent
- Delivery rate
- Open rate
- Click rate

**Filters**:
- Status (all, sent, delivered, opened, bounced, etc.)
- Search by recipient or subject

**Real-time Updates**:
- Automatically refreshes when new events occur
- Shows provider message IDs
- Displays error messages for failures

### Component

```tsx
import EmailEventsPanel from '@/components/classroom/admin/EmailEventsPanel';

function AdminDashboard() {
  return (
    <div>
      <EmailEventsPanel />
    </div>
  );
}
```

## Querying Email Events

### Recent Events

```sql
SELECT * FROM v_recent_email_events
ORDER BY created_at DESC
LIMIT 50;
```

### Email Stats

```sql
SELECT * FROM v_email_stats
WHERE date > CURRENT_DATE - INTERVAL '7 days';
```

### Bounced Emails

```sql
SELECT recipient, subject, error_message, bounced_at
FROM email_events
WHERE status = 'bounced'
ORDER BY bounced_at DESC;
```

### Delivery Rate by Provider

```sql
SELECT 
  provider,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*), 2) as delivery_rate
FROM email_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY provider;
```

### Emails Not Delivered

```sql
SELECT recipient, subject, provider, created_at, error_message
FROM email_events
WHERE status IN ('queued', 'sent')
  AND created_at < NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## Monitoring & Alerts

### Set Up Alerts for Bounces

```sql
-- Create a function to alert on high bounce rate
CREATE OR REPLACE FUNCTION check_bounce_rate()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_bounce_rate NUMERIC;
BEGIN
  SELECT 
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'bounced') / COUNT(*), 2)
  INTO v_bounce_rate
  FROM email_events
  WHERE created_at > NOW() - INTERVAL '1 hour';
  
  IF v_bounce_rate > 5 THEN
    -- Trigger alert
    INSERT INTO alert_logs (severity, title, message, details)
    VALUES (
      'warning',
      'High Bounce Rate',
      'Email bounce rate is ' || v_bounce_rate || '%',
      jsonb_build_object('bounce_rate', v_bounce_rate)
    );
  END IF;
END;
$$;
```

### Schedule Bounce Rate Check

```sql
-- Run every hour via pg_cron or external scheduler
SELECT check_bounce_rate();
```

## Best Practices

### 1. Monitor Delivery Rates

**Target**: > 95% delivery rate

**Action if below**:
- Check domain reputation
- Review email content for spam triggers
- Verify DNS records (SPF, DKIM, DMARC)

### 2. Handle Bounces

**Hard Bounces** (permanent):
- Remove from mailing list
- Mark email as invalid

**Soft Bounces** (temporary):
- Retry up to 3 times
- If still bouncing, treat as hard bounce

```sql
-- Mark bounced emails as invalid
UPDATE classroom_students
SET email_valid = false
WHERE email IN (
  SELECT recipient
  FROM email_events
  WHERE status = 'bounced'
    AND error_code IN ('hard_bounce', 'invalid_email')
);
```

### 3. Respect Complaints

**Spam Complaints**:
- Immediately suppress email
- Add to suppression list
- Review email content

```sql
-- Add complained emails to suppression list
INSERT INTO email_suppressions (email, reason, suppressed_at)
SELECT recipient, 'spam_complaint', complained_at
FROM email_events
WHERE status = 'complained'
ON CONFLICT (email) DO NOTHING;
```

### 4. Track Engagement

**Low Open Rates** (< 20%):
- Improve subject lines
- Send at better times
- Segment audience

**Low Click Rates** (< 2%):
- Improve call-to-action
- Make content more relevant
- A/B test different approaches

## Troubleshooting

### Webhooks Not Working

**Check**:
1. Webhook URL is publicly accessible
2. SSL certificate is valid
3. Endpoint returns 200 status
4. Webhook secret is correct (for Resend)

**Debug**:
```bash
# Test webhook locally
curl -X POST http://localhost:3000/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{"type":"email.delivered","data":{"email_id":"test-123"}}'
```

### Events Not Updating

**Check**:
1. `update_email_event_status` function exists
2. Provider message ID matches
3. Webhook is being received
4. No database errors in logs

**Debug**:
```sql
-- Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'update_email_event_status';

-- Manually update an event
SELECT update_email_event_status('test-message-id', 'delivered', NULL, NULL);
```

### Missing Provider Message IDs

**Cause**: Email sent before tracking was implemented

**Solution**: Provider message IDs are only available for new emails

## Performance

### Indexes

All necessary indexes are created automatically:
- `recipient` - Fast lookups by email
- `provider_message_id` - Webhook matching
- `status` - Filter by status
- `created_at` - Time-based queries

### Cleanup Old Events

```sql
-- Delete events older than 90 days
DELETE FROM email_events
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Archive Old Events

```sql
-- Move to archive table
INSERT INTO email_events_archive
SELECT * FROM email_events
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM email_events
WHERE created_at < NOW() - INTERVAL '90 days';
```

## Support

**Questions?** Contact: info@elevateforhumanity.org

**Provider Documentation**:
- [Resend Webhooks](https://resend.com/docs/dashboard/webhooks/introduction)
- [Postmark Webhooks](https://postmarkapp.com/developer/webhooks/webhooks-overview)
- [AWS SES Events](https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity.html)
