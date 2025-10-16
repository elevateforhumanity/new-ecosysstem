# Email Service Setup Guide

## Overview

The LMS uses transactional emails for:
- ✅ Enrollment confirmations
- ✅ Payment receipts
- ✅ Certificate notifications
- ✅ Course reminders
- ✅ Password resets

## Supported Providers

### Option 1: SendGrid (Recommended)
- **Cost**: Free tier (100 emails/day)
- **Paid**: $19.95/month (50k emails)
- **Pros**: Reliable, great deliverability, easy setup
- **Cons**: Requires domain verification

### Option 2: Resend
- **Cost**: Free tier (100 emails/day)
- **Paid**: $20/month (50k emails)
- **Pros**: Modern API, great DX, fast setup
- **Cons**: Newer service

## Setup Instructions

### SendGrid Setup

#### 1. Create Account
1. Go to [https://sendgrid.com/](https://sendgrid.com/)
2. Click **"Start for free"**
3. Complete signup

#### 2. Verify Sender Identity
1. Go to **Settings → Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Enter your email (e.g., `noreply@elevateforhumanity.org`)
4. Check your email and click verification link

#### 3. Create API Key
1. Go to **Settings → API Keys**
2. Click **"Create API Key"**
3. Name: `LMS Backend`
4. Permissions: **Full Access** (or Mail Send only)
5. Click **"Create & View"**
6. **Copy the API key** (you won't see it again!)

#### 4. Add to Backend .env
```bash
# Email Configuration
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=noreply@elevateforhumanity.org
```

#### 5. Test Email
```bash
cd backend
node -e "
const { sendEmail } = require('./services/email');
sendEmail({
  to: 'your-email@example.com',
  subject: 'Test Email',
  html: '<h1>It works!</h1>',
  text: 'It works!'
}).then(() => console.log('✅ Email sent!'));
"
```

---

### Resend Setup

#### 1. Create Account
1. Go to [https://resend.com/](https://resend.com/)
2. Click **"Get Started"**
3. Complete signup

#### 2. Get API Key
1. Go to **API Keys**
2. Click **"Create API Key"**
3. Name: `LMS Backend`
4. Permissions: **Sending access**
5. Click **"Create"**
6. **Copy the API key**

#### 3. Verify Domain (Optional but Recommended)
1. Go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `elevateforhumanity.org`)
4. Add DNS records to your domain provider
5. Wait for verification (usually 5-10 minutes)

#### 4. Add to Backend .env
```bash
# Email Configuration
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@elevateforhumanity.org
```

#### 5. Test Email
```bash
cd backend
node -e "
const { sendEmail } = require('./services/email');
sendEmail({
  to: 'your-email@example.com',
  subject: 'Test Email',
  html: '<h1>It works!</h1>',
  text: 'It works!'
}).then(() => console.log('✅ Email sent!'));
"
```

---

## Environment Variables

Add these to `backend/.env`:

```bash
# Email Service Configuration
EMAIL_PROVIDER=sendgrid          # or 'resend'
SENDGRID_API_KEY=SG.xxxxx       # if using SendGrid
RESEND_API_KEY=re_xxxxx         # if using Resend
EMAIL_FROM=noreply@elevateforhumanity.org

# Frontend URL (for email links)
FRONTEND_URL=https://elevateforhumanity.pages.dev
```

## Install Dependencies

```bash
cd backend

# For SendGrid
npm install @sendgrid/mail

# For Resend
npm install resend

# Or install both
npm install @sendgrid/mail resend
```

## Email Templates

The system includes pre-built templates for:

### 1. Enrollment Confirmation
Sent when a student enrolls in a course.

**Triggers**: After successful payment or free enrollment

**Includes**:
- Welcome message
- Course name
- Link to dashboard
- Enrollment date

### 2. Payment Receipt
Sent after successful payment.

**Triggers**: Stripe webhook `checkout.session.completed`

**Includes**:
- Amount paid
- Course name
- Receipt link
- Transaction date

### 3. Certificate Issued
Sent when student completes a course.

**Triggers**: When `progress_percentage` reaches 100%

**Includes**:
- Congratulations message
- Certificate download link
- Completion date
- Social sharing prompt

## Testing Emails

### Test Enrollment Email
```javascript
const { sendEnrollmentConfirmation } = require('./services/email');

sendEnrollmentConfirmation({
  to: 'student@example.com',
  studentName: 'John Doe',
  courseName: 'Web Development Bootcamp',
  enrollmentDate: new Date()
});
```

### Test Payment Receipt
```javascript
const { sendPaymentReceipt } = require('./services/email');

sendPaymentReceipt({
  to: 'student@example.com',
  studentName: 'John Doe',
  courseName: 'Web Development Bootcamp',
  amount: 99.00,
  currency: 'usd',
  receiptUrl: 'https://stripe.com/receipt/xxx',
  transactionDate: new Date()
});
```

### Test Certificate Email
```javascript
const { sendCertificateIssued } = require('./services/email');

sendCertificateIssued({
  to: 'student@example.com',
  studentName: 'John Doe',
  courseName: 'Web Development Bootcamp',
  certificateUrl: 'https://example.com/certificates/xxx.pdf',
  completionDate: new Date()
});
```

## Troubleshooting

### Emails Not Sending

1. **Check API Key**
   ```bash
   echo $SENDGRID_API_KEY  # or $RESEND_API_KEY
   ```

2. **Check Logs**
   - Look for email service errors in backend logs
   - Check provider dashboard for delivery status

3. **Verify Sender**
   - SendGrid: Sender must be verified
   - Resend: Domain verification improves deliverability

### Emails Going to Spam

1. **Verify Domain** (both providers)
   - Add SPF, DKIM, DMARC records
   - Follow provider's domain verification guide

2. **Use Professional Email**
   - Use `noreply@yourdomain.com`
   - Avoid free email providers (gmail, yahoo)

3. **Warm Up Sending**
   - Start with low volume
   - Gradually increase over days/weeks

### Rate Limits

**Free Tier Limits**:
- SendGrid: 100 emails/day
- Resend: 100 emails/day

**Solutions**:
- Upgrade to paid plan
- Batch emails
- Use email queuing

## Production Checklist

Before going live:

- [ ] Domain verified with email provider
- [ ] SPF/DKIM/DMARC records configured
- [ ] Test all email templates
- [ ] Set up email monitoring/alerts
- [ ] Configure unsubscribe links (if needed)
- [ ] Review email content for spam triggers
- [ ] Test on multiple email clients
- [ ] Set up email analytics

## Cost Comparison

### SendGrid
- **Free**: 100 emails/day
- **Essentials**: $19.95/month (50k emails)
- **Pro**: $89.95/month (100k emails)

### Resend
- **Free**: 100 emails/day, 3k emails/month
- **Pro**: $20/month (50k emails)
- **Business**: $85/month (100k emails)

### Recommendation

**For MVP/Testing**: Use free tier of either provider

**For Production**: 
- Small scale (<50k/month): Resend ($20/month)
- Medium scale (50k-100k/month): SendGrid Essentials ($19.95/month)
- Large scale (>100k/month): Compare pricing

## Next Steps

After email setup:

1. ✅ Test all email templates
2. ✅ Configure Stripe webhook to trigger emails
3. ✅ Set up email monitoring
4. ✅ Add unsubscribe functionality (if needed)
5. ✅ Monitor deliverability rates

## Support

**SendGrid**: [https://docs.sendgrid.com/](https://docs.sendgrid.com/)

**Resend**: [https://resend.com/docs](https://resend.com/docs)

**Issues?** Check backend logs and provider dashboards for detailed error messages.
