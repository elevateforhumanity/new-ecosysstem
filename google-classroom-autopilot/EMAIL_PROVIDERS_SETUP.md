# Email Providers Setup Guide

The Google Classroom Autopilot supports multiple email providers. Choose the one that best fits your needs.

## Supported Providers

| Provider | Best For | Pricing | Setup Time |
|----------|----------|---------|------------|
| **Resend** | Modern apps, great DX | Free: 3k/month, $20/100k | 5 min |
| **Postmark** | Transactional emails | $15/10k emails | 10 min |
| **AWS SES** | High volume, AWS users | $0.10/1k emails | 15 min |
| **SMTP** | Any provider, fallback | Varies | 5 min |

## 1. Resend (Recommended)

**Why Resend?**
- Modern API
- Excellent deliverability
- Great developer experience
- Generous free tier (3,000 emails/month)
- Built-in analytics

### Setup Steps

1. **Sign up**: [resend.com](https://resend.com)

2. **Verify your domain**:
   ```
   Go to Domains → Add Domain
   Add DNS records:
   - TXT record for verification
   - DKIM records for authentication
   ```

3. **Create API key**:
   ```
   Go to API Keys → Create API Key
   Copy the key (starts with re_...)
   ```

4. **Set environment variables**:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

5. **Test**:
   ```bash
   cd google-classroom-autopilot
   npx tsx -e "
   import { emailService } from './src/email-providers';
   await emailService.send({
     to: ['your-email@example.com'],
     from: 'noreply@yourdomain.com',
     subject: 'Test Email',
     html: '<h1>It works!</h1>',
   });
   "
   ```

### Resend Features
- ✅ Email analytics
- ✅ Webhook events
- ✅ Email templates
- ✅ Batch sending
- ✅ Scheduled sending

## 2. Postmark

**Why Postmark?**
- Excellent deliverability (99%+)
- Fast delivery (< 1 second)
- Detailed analytics
- Great for transactional emails

### Setup Steps

1. **Sign up**: [postmarkapp.com](https://postmarkapp.com)

2. **Verify sender signature**:
   ```
   Go to Sender Signatures → Add Sender Signature
   Enter your email domain
   Add DNS records (DKIM, Return-Path)
   ```

3. **Create server**:
   ```
   Go to Servers → Create Server
   Name it "Classroom Autopilot"
   Copy the Server API Token
   ```

4. **Set environment variables**:
   ```bash
   POSTMARK_SERVER_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

5. **Test**:
   ```bash
   curl -X POST "https://api.postmarkapp.com/email" \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -H "X-Postmark-Server-Token: YOUR_TOKEN" \
     -d '{
       "From": "noreply@yourdomain.com",
       "To": "your-email@example.com",
       "Subject": "Test",
       "HtmlBody": "<h1>It works!</h1>"
     }'
   ```

### Postmark Features
- ✅ Bounce tracking
- ✅ Spam complaint tracking
- ✅ Open/click tracking
- ✅ Message streams
- ✅ Webhooks

## 3. AWS SES

**Why AWS SES?**
- Extremely low cost ($0.10 per 1,000 emails)
- Highly scalable
- Integrates with AWS ecosystem
- Good for high volume

### Setup Steps

1. **Sign up for AWS**: [aws.amazon.com](https://aws.amazon.com)

2. **Verify domain in SES**:
   ```
   Go to SES Console → Verified Identities
   Click "Create Identity" → Domain
   Add DNS records (DKIM, MAIL FROM)
   ```

3. **Request production access**:
   ```
   By default, SES is in sandbox mode (limited to verified emails)
   Go to Account Dashboard → Request Production Access
   Fill out the form (usually approved in 24 hours)
   ```

4. **Create IAM user**:
   ```
   Go to IAM → Users → Create User
   Attach policy: AmazonSESFullAccess
   Create access key
   ```

5. **Set environment variables**:
   ```bash
   AWS_SES_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxx
   AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

6. **Install AWS SDK**:
   ```bash
   npm install @aws-sdk/client-ses
   ```

7. **Update provider** (in `src/email-providers.ts`):
   ```typescript
   // Uncomment and implement AWS SES sending
   import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
   ```

### AWS SES Features
- ✅ Extremely scalable
- ✅ Low cost
- ✅ Bounce/complaint handling
- ✅ Configuration sets
- ✅ Dedicated IPs (optional)

## 4. SMTP (Fallback)

**Why SMTP?**
- Works with any email provider
- Simple setup
- Good fallback option

### Setup Steps

1. **Get SMTP credentials** from your email provider:

   **Gmail**:
   ```
   1. Enable 2FA on your Google account
   2. Go to Security → App Passwords
   3. Generate app password
   4. Use: smtp.gmail.com:587
   ```

   **Outlook**:
   ```
   Use: smtp-mail.outlook.com:587
   Username: your-email@outlook.com
   Password: your-password
   ```

   **SendGrid**:
   ```
   Use: smtp.sendgrid.net:587
   Username: apikey
   Password: your-sendgrid-api-key
   ```

2. **Set environment variables**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

3. **Install nodemailer** (if using SMTP):
   ```bash
   npm install nodemailer @types/nodemailer
   ```

4. **Update provider** (in `src/email-providers.ts`):
   ```typescript
   // Uncomment and implement SMTP sending
   import nodemailer from 'nodemailer';
   ```

## Provider Selection Priority

The system automatically selects a provider in this order:

1. **Resend** (if `RESEND_API_KEY` is set)
2. **Postmark** (if `POSTMARK_SERVER_TOKEN` is set)
3. **AWS SES** (if AWS credentials are set)
4. **SMTP** (if SMTP credentials are set)

## Comparison

| Feature | Resend | Postmark | AWS SES | SMTP |
|---------|--------|----------|---------|------|
| **Free Tier** | 3k/month | 100/month | 62k/month* | Varies |
| **Cost** | $20/100k | $15/10k | $0.10/1k | Varies |
| **Setup Time** | 5 min | 10 min | 15 min | 5 min |
| **Deliverability** | Excellent | Excellent | Good | Varies |
| **Analytics** | ✅ | ✅ | ✅ | ❌ |
| **Webhooks** | ✅ | ✅ | ✅ | ❌ |
| **Templates** | ✅ | ✅ | ❌ | ❌ |
| **Batch Sending** | ✅ | ✅ | ✅ | ✅ |

*AWS SES free tier: 62,000 emails/month when sending from EC2

## Recommendations

### For Startups/Small Schools
**Use Resend**
- Free tier covers most needs
- Easy setup
- Great developer experience

### For Medium Schools
**Use Postmark**
- Excellent deliverability
- Detailed analytics
- Reasonable pricing

### For Large Districts
**Use AWS SES**
- Lowest cost at scale
- Highly reliable
- Integrates with AWS infrastructure

### For Quick Setup
**Use SMTP with Gmail**
- Works immediately
- No signup required
- Good for testing

## Testing Your Setup

### 1. Test Email Sending

```bash
cd google-classroom-autopilot

# Test with your provider
npx tsx -e "
import { emailService } from './src/email-providers';

const result = await emailService.send({
  to: ['your-email@example.com'],
  from: process.env.EMAIL_FROM,
  subject: 'Test Email from Classroom Autopilot',
  html: '<h1>Success!</h1><p>Your email provider is working correctly.</p>',
});

console.log('Result:', result);
"
```

### 2. Test Missing Assignments Email

```bash
# Send test digest
npx tsx src/missing-assignments-email.ts
```

### 3. Test Alerts

```bash
# Send test alert
npx tsx src/alerts.ts test
```

## Troubleshooting

### Emails Not Sending

**Check**:
1. Environment variables are set correctly
2. API key/credentials are valid
3. Domain is verified (for Resend/Postmark/SES)
4. Not in sandbox mode (for SES)
5. Rate limits not exceeded

**Debug**:
```bash
# Enable debug logging
DEBUG=email npx tsx src/missing-assignments-email.ts
```

### Emails Going to Spam

**Solutions**:
1. Verify your domain (add DKIM, SPF, DMARC records)
2. Use a dedicated sending domain
3. Warm up your IP (gradually increase volume)
4. Monitor bounce/complaint rates
5. Use a reputable provider (Resend, Postmark)

### Rate Limits

**Resend**: 10 requests/second  
**Postmark**: 300 emails/minute  
**AWS SES**: 14 emails/second (default)  
**SMTP**: Varies by provider

**Solution**: Implement rate limiting or batch sending

## Best Practices

### 1. Use Separate Domains
```
Transactional: noreply@mail.yourdomain.com
Marketing: news@mail.yourdomain.com
```

### 2. Monitor Metrics
- Open rates
- Click rates
- Bounce rates
- Complaint rates

### 3. Handle Bounces
```typescript
// Implement bounce handling
if (result.error?.includes('bounce')) {
  await markEmailAsInvalid(email);
}
```

### 4. Respect Opt-Outs
```typescript
// Always check preferences
const shouldSend = await shouldSendToGuardian(email);
if (!shouldSend) return;
```

### 5. Test Before Production
```bash
# Send to test email first
EMAIL_FROM=test@yourdomain.com \
ALERTS_TO=your-email@example.com \
npx tsx src/missing-assignments-email.ts
```

## Support

**Questions?** Contact: info@elevateforhumanity.org

**Provider Issues?**
- Resend: support@resend.com
- Postmark: support@postmarkapp.com
- AWS SES: AWS Support Console
