# 💳 Stripe + 📁 R2 Integration Deployment Guide

Complete guide to deploy payment processing and secure file storage for EFH.

---

## 🎯 What This Adds

### Stripe Integration
- ✅ **Checkout Sessions** - Enroll students, accept donations, affiliate signups
- ✅ **Webhooks** - Auto-process payments, create enrollments, approve commissions
- ✅ **Commission Tracking** - Auto-calculate affiliate commissions from client payments

### Cloudflare R2 Integration
- ✅ **Secure File Upload** - W-9s, IDs, intake forms, tax returns
- ✅ **Access Control** - JWT-based auth, RLS policies
- ✅ **Audit Trail** - All uploads logged to database

---

## 📋 Prerequisites

1. **Stripe Account** - [stripe.com](https://stripe.com)
2. **Cloudflare Account** - Already have (for Workers)
3. **Supabase Database** - Already configured
4. **OpenAI API Key** - Already configured

---

## 🚀 Step-by-Step Deployment

### 1️⃣ Create Stripe Account & Get Keys

```bash
# Go to: https://dashboard.stripe.com/apikeys

# Copy these keys:
# - Secret key (sk_test_... for testing, sk_live_... for production)
# - Publishable key (pk_test_... or pk_live_...)
```

### 2️⃣ Create Stripe Webhook

```bash
# Go to: https://dashboard.stripe.com/webhooks

# Click "Add endpoint"
# URL: https://efh-agent.your-subdomain.workers.dev/webhooks/stripe
# Events to listen for:
#   - checkout.session.completed
#   - payment_intent.succeeded

# Copy the webhook signing secret (whsec_...)
```

### 3️⃣ Create R2 Bucket

```bash
# Create bucket via Cloudflare dashboard or CLI
npx wrangler r2 bucket create efh-private

# For staging
npx wrangler r2 bucket create efh-private-staging
```

### 4️⃣ Deploy Database Migrations

```bash
cd /workspaces/fix2

# Apply migrations
psql -h db.cuxzzpsyufcewtmicszk.supabase.co -U postgres -d postgres \
  -f supabase/migrations/005_affiliate_system.sql

psql -h db.cuxzzpsyufcewtmicszk.supabase.co -U postgres -d postgres \
  -f supabase/migrations/006_files_and_payments.sql
```

Or via Supabase CLI:

```bash
supabase db push
```

### 5️⃣ Set Cloudflare Worker Secrets

```bash
cd workers/agent

# OpenAI (already set)
npx wrangler secret put OPENAI_API_KEY
# Paste: sk-...

# Supabase (already set)
npx wrangler secret put SUPABASE_FUNCTION_URL
# Paste: https://cuxzzpsyufcewtmicszk.functions.supabase.co

npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# Paste: your service role key

npx wrangler secret put SUPABASE_URL
# Paste: https://cuxzzpsyufcewtmicszk.supabase.co

npx wrangler secret put SUPABASE_ANON_KEY
# Paste: your anon key

# NEW: Stripe
npx wrangler secret put STRIPE_SECRET_KEY
# Paste: sk_test_... (or sk_live_... for production)

npx wrangler secret put STRIPE_WEBHOOK_SECRET
# Paste: whsec_...
```

### 6️⃣ Deploy Worker

```bash
cd workers/agent

# Deploy with R2 bucket binding
npx wrangler deploy agent-worker.js --config wrangler.toml
```

### 7️⃣ Deploy Supabase Edge Function

```bash
# Already deployed, but redeploy to get new handlers
supabase functions deploy executeAction
```

### 8️⃣ Test Stripe Integration

```bash
# Use Stripe test cards: https://stripe.com/docs/testing

# Test card numbers:
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
# Requires auth: 4000 0025 0000 3155
```

---

## 🧪 Testing

### Test Enrollment Checkout

```typescript
import { createEnrollmentCheckout } from '@/lib/stripe';

await createEnrollmentCheckout({
  userId: 'user-uuid',
  courseId: 'course-uuid',
  amount: 2500, // $2500
  courseName: 'Tax Prep Training',
});
```

### Test File Upload

```tsx
import FileUpload from '@/components/FileUpload';

<FileUpload
  ownerId="user-uuid"
  purpose="w9"
  onSuccess={(key, size) => console.log('Uploaded:', key, size)}
/>
```

### Test Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local worker
stripe listen --forward-to http://localhost:8787/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

---

## 📊 Usage Examples

### 1. Enroll Student with Payment

```typescript
// In your enrollment page
import { createEnrollmentCheckout } from '@/lib/stripe';

async function handleEnroll() {
  await createEnrollmentCheckout({
    userId: currentUser.id,
    courseId: selectedCourse.id,
    amount: selectedCourse.tuition,
    courseName: selectedCourse.title,
  });
  // User is redirected to Stripe Checkout
  // On success, webhook creates enrollment automatically
}
```

### 2. Accept Donation

```typescript
import { createDonationCheckout } from '@/lib/stripe';

async function handleDonate(amount: number) {
  await createDonationCheckout({
    userId: currentUser?.id,
    amount: amount,
  });
}
```

### 3. Affiliate Signup with Fee

```typescript
import { createAffiliateCheckout } from '@/lib/stripe';

async function handleAffiliateSignup(tier: 'standard' | 'gold' | 'platinum') {
  const fees = { standard: 0, gold: 99, platinum: 299 };
  
  await createAffiliateCheckout({
    userId: currentUser.id,
    tier: tier,
    amount: fees[tier],
  });
}
```

### 4. Upload W-9 Form

```tsx
<FileUpload
  ownerId={affiliateUserId}
  purpose="w9"
  accept=".pdf,.jpg,.png"
  maxSizeMB={5}
  onSuccess={(key) => {
    // Update affiliate record with W9 file key
    updateAffiliate({ w9_file_id: key });
  }}
/>
```

### 5. Auto-Commission from Client Payment

When creating a Stripe payment for a client referred by an affiliate:

```typescript
// Include metadata in payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 60000, // $600
  currency: 'usd',
  metadata: {
    referral_id: 'referral-uuid',
    commission_percent: '30',
  },
});

// Webhook will auto-create commission: $180 (30% of $600)
```

---

## 🔐 Security Checklist

### Stripe
- ✅ Use test keys in development
- ✅ Verify webhook signatures (STRIPE_WEBHOOK_SECRET)
- ✅ Never expose secret keys in frontend
- ✅ Use HTTPS for all webhook endpoints

### R2 Files
- ✅ Verify JWT before upload/download
- ✅ Check user permissions via RLS
- ✅ Validate file types and sizes
- ✅ Use unique, non-guessable keys
- ✅ Log all file operations

### Database
- ✅ RLS policies on files, donations, commissions
- ✅ Service role only for worker operations
- ✅ Audit trail in agent_events table

---

## 💰 Cost Estimates

### Stripe
- **Transaction Fee:** 2.9% + $0.30 per successful charge
- **No monthly fee** for standard account
- Example: $2500 enrollment = $72.80 + $0.30 = $73.10 fee

### Cloudflare R2
- **Storage:** $0.015/GB/month
- **Class A Operations:** $4.50/million (uploads)
- **Class B Operations:** $0.36/million (downloads)
- **No egress fees** (unlike S3)
- Example: 1000 files (10GB) = $0.15/month

### Total Monthly Cost
- Stripe: Variable (based on volume)
- R2: ~$1-5/month for typical usage
- OpenAI: ~$30-50/month (already counted)
- **Total New Cost:** ~$1-5/month + Stripe fees

---

## 📁 File Structure

```
workers/agent/
├── agent-worker.js          # Main worker (now with Stripe + R2)
├── wrangler.toml           # Updated with R2 bucket binding
└── commands.json           # Command catalog

supabase/
├── functions/
│   └── executeAction/
│       └── index.ts        # Updated with Stripe handlers
└── migrations/
    ├── 005_affiliate_system.sql
    └── 006_files_and_payments.sql

frontend/src/
├── components/
│   ├── AgentConsole.tsx
│   └── FileUpload.tsx      # NEW: File upload component
└── lib/
    └── stripe.ts           # NEW: Stripe helpers
```

---

## 🔄 Webhook Flow

```
1. User completes Stripe Checkout
   ↓
2. Stripe sends webhook to /webhooks/stripe
   ↓
3. Worker verifies signature
   ↓
4. Worker calls Supabase Edge Function
   ↓
5. Edge Function creates enrollment/donation/affiliate
   ↓
6. Database updated, user notified
```

---

## 🐛 Troubleshooting

### "Webhook signature verification failed"
- Check STRIPE_WEBHOOK_SECRET is set correctly
- Ensure webhook endpoint URL matches Stripe dashboard
- Use `stripe listen` for local testing

### "File upload failed"
- Check R2 bucket exists and is bound in wrangler.toml
- Verify JWT token is valid
- Check file size doesn't exceed limit

### "Checkout creation failed"
- Verify STRIPE_SECRET_KEY is set
- Check line items format (amount in cents)
- Ensure success/cancel URLs are valid

### "Commission not created"
- Check payment_intent has metadata: referral_id, commission_percent
- Verify referral exists in database
- Check webhook is receiving payment_intent.succeeded events

---

## 📚 Related Documentation

- [Stripe API Docs](https://stripe.com/docs/api)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [AI Agent Deployment](./AI_AGENT_DEPLOYMENT.md)
- [Agent Commands Reference](./AGENT_COMMANDS_REFERENCE.md)

---

## 🎉 What You Can Do Now

### For Students
- ✅ Enroll in courses with credit card
- ✅ Upload intake documents securely
- ✅ Make donations

### For Affiliates
- ✅ Sign up with paid tiers
- ✅ Upload W-9 forms
- ✅ Earn auto-calculated commissions

### For Admins
- ✅ Process payments automatically
- ✅ Track all file uploads
- ✅ Manage commissions and payouts
- ✅ Full audit trail

---

**🚀 Your platform now has enterprise-grade payment processing and secure file storage!**

No 3rd-party lock-in. Full compliance. Complete control.
