# Alert System Setup Guide

The Google Classroom Autopilot includes a comprehensive alert system that notifies you when things go wrong.

## Alert Types

### 1. Sync Failure Alerts
Triggered when a nightly sync run fails.

**Severity**: Error  
**Channels**: Email, Slack, Discord

### 2. Task Failure Alerts
Triggered when a task fails after maximum retry attempts.

**Severity**: Warning  
**Channels**: Email, Slack, Discord

### 3. Critical System Errors
Triggered for critical system failures.

**Severity**: Critical  
**Channels**: Email, Slack, Discord, SMS

## Supported Channels

### Email (SMTP)

**Setup**:
1. Get SMTP credentials from your email provider
2. For Gmail: Use [App Passwords](https://support.google.com/accounts/answer/185833)
3. Set environment variables:

```bash
ALERT_EMAIL_ENABLED=true
ALERT_EMAIL_RECIPIENTS=admin@school.org,tech@school.org
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Providers**:
- Gmail: `smtp.gmail.com:587`
- Outlook: `smtp-mail.outlook.com:587`
- SendGrid: `smtp.sendgrid.net:587`
- AWS SES: `email-smtp.us-east-1.amazonaws.com:587`

### Slack

**Setup**:
1. Go to [Slack API](https://api.slack.com/apps)
2. Create new app → "From scratch"
3. Enable "Incoming Webhooks"
4. Add webhook to workspace
5. Copy webhook URL
6. Set environment variables:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#classroom-alerts
```

**Test**:
```bash
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test alert from Classroom Autopilot"}'
```

### Discord

**Setup**:
1. Open Discord server settings
2. Go to Integrations → Webhooks
3. Click "New Webhook"
4. Name it "Classroom Autopilot"
5. Select channel
6. Copy webhook URL
7. Set environment variable:

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
```

**Test**:
```bash
curl -X POST $DISCORD_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"content":"Test alert from Classroom Autopilot"}'
```

### SMS (Twilio) - Critical Alerts Only

**Setup**:
1. Sign up for [Twilio](https://www.twilio.com)
2. Get a phone number
3. Copy Account SID and Auth Token
4. Set environment variables:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+15555551234
SMS_ALERT_RECIPIENTS=+15555555678,+15555555679
```

**Note**: SMS alerts are only sent for **critical** severity alerts to avoid spam.

## Testing Alerts

### Test All Channels

```bash
cd google-classroom-autopilot
npx tsx src/alerts.ts test
```

This sends a test alert through all configured channels.

### Test Specific Alert Types

```typescript
import { alertSyncFailure, alertTaskFailure, alertCriticalError } from './src/alerts';

// Test sync failure alert
await alertSyncFailure({
  id: 'test-123',
  sync_type: 'courses',
  error_message: 'Test error',
  records_processed: 0,
});

// Test task failure alert
await alertTaskFailure({
  id: 'task-456',
  kind: 'gc_create_course',
  error_message: 'Test error',
  attempts: 3,
});

// Test critical error alert
await alertCriticalError({
  component: 'Sync Worker',
  message: 'Test critical error',
  stack: 'Error stack trace...',
});
```

## Alert Configuration

### Severity Levels

| Severity | Description | Channels | Example |
|----------|-------------|----------|---------|
| **info** | Informational | Email, Slack, Discord | Sync completed successfully |
| **warning** | Non-critical issue | Email, Slack, Discord | Task failed (will retry) |
| **error** | Significant problem | Email, Slack, Discord | Sync run failed |
| **critical** | System failure | Email, Slack, Discord, SMS | Database connection lost |

### Customizing Alert Behavior

Edit `src/alerts.ts` to customize:

```typescript
// Only send SMS for specific errors
if (alert.severity === 'critical' && alert.title.includes('Database')) {
  await sendSMSAlert(alert, config.sms);
}

// Add custom channels
if (config.pagerduty?.enabled) {
  await sendPagerDutyAlert(alert, config.pagerduty);
}

// Filter alerts
if (alert.title.includes('Expected Error')) {
  return; // Don't send alert
}
```

## Integration with Sync System

Alerts are automatically triggered by the sync system:

```typescript
// In src/sync.ts
try {
  await syncCourses();
} catch (error) {
  await alertSyncFailure({
    id: syncRun.id,
    sync_type: 'courses',
    error_message: error.message,
    records_processed: 0,
  });
  throw error;
}
```

## Alert Logs

All alerts are logged to Supabase `alert_logs` table:

```sql
-- View recent alerts
SELECT * FROM alert_logs 
ORDER BY created_at DESC 
LIMIT 50;

-- Count alerts by severity
SELECT severity, COUNT(*) 
FROM alert_logs 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY severity;

-- Find failed channels
SELECT 
  severity,
  title,
  channels_sent->>'email' as email_sent,
  channels_sent->>'slack' as slack_sent,
  channels_sent->>'discord' as discord_sent
FROM alert_logs
WHERE created_at > NOW() - INTERVAL '1 day';
```

## Best Practices

### 1. Start with Email + Slack
- Email for permanent record
- Slack for real-time notifications

### 2. Use Separate Channels for Different Severities
```bash
# Info/Warning → #classroom-logs
# Error/Critical → #classroom-alerts
```

### 3. Set Up Alert Routing
```typescript
const config = {
  slack: {
    enabled: true,
    webhookUrl: alert.severity === 'critical' 
      ? process.env.SLACK_CRITICAL_WEBHOOK 
      : process.env.SLACK_GENERAL_WEBHOOK,
  },
};
```

### 4. Implement Alert Throttling
Prevent alert spam:

```typescript
// Only send if last alert was > 5 minutes ago
const lastAlert = await getLastAlert(alert.title);
if (lastAlert && Date.now() - lastAlert.created_at < 5 * 60 * 1000) {
  console.log('Throttling alert:', alert.title);
  return;
}
```

### 5. Monitor Alert System Health
```sql
-- Check if alerts are being sent
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_alerts,
  SUM(CASE WHEN channels_sent->>'slack' = 'true' THEN 1 ELSE 0 END) as slack_sent,
  SUM(CASE WHEN channels_sent->>'email' = 'true' THEN 1 ELSE 0 END) as email_sent
FROM alert_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Troubleshooting

### Alerts Not Sending

**Check**:
1. Environment variables are set correctly
2. Webhook URLs are valid
3. Network connectivity
4. Rate limits (Slack: 1 message/second)

**Debug**:
```bash
# Enable debug logging
DEBUG=alerts npx tsx src/alerts.ts test
```

### Email Alerts Failing

**Common Issues**:
- Wrong SMTP credentials
- App password not enabled (Gmail)
- Firewall blocking port 587
- Rate limits exceeded

**Test SMTP**:
```bash
# Test SMTP connection
npx tsx -e "
import nodemailer from 'nodemailer';
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
await transport.verify();
console.log('SMTP connection successful');
"
```

### Slack Alerts Not Appearing

**Check**:
- Webhook URL is correct
- Channel exists and bot has access
- Message format is valid
- Rate limits not exceeded

### Discord Alerts Not Appearing

**Check**:
- Webhook URL is correct
- Webhook not deleted
- Server permissions
- Embed size limits (< 6000 characters)

## Support

Questions? Contact: info@elevateforhumanity.org

## Next Steps

1. ✅ Set up at least one alert channel (Email or Slack recommended)
2. ✅ Test alerts with `npx tsx src/alerts.ts test`
3. ✅ Monitor alert logs in Supabase
4. ✅ Adjust alert thresholds as needed
5. ✅ Set up on-call rotation for critical alerts
