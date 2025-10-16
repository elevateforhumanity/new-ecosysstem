# Stripe Payment Integration - Setup Guide

## ✅ What's Been Created

### 1. Frontend Component
- **File**: `src/components/payment/EnrollmentCheckout.jsx`
- **Features**:
  - Beautiful checkout UI
  - Handles both FREE and PAID enrollments
  - Stripe Checkout integration
  - Loading states and error handling
  - Security badge

### 2. Backend API
- **File**: `backend/routes/enrollment.js`
- **Endpoints**:
  - `POST /api/enrollments/create-checkout-session` - Create Stripe session
  - `POST /api/enrollments/webhook` - Handle Stripe webhooks
  - `GET /api/enrollments/my-enrollments` - Get user's enrollments
  - `GET /api/enrollments/verify/:sessionId` - Verify payment

### 3. Database Schema
- **File**: `database/enrollments-schema.sql`
- **Tables**:
  - `enrollments` - Track student enrollments
  - `payment_history` - Track all payments
- **Features**:
  - Row Level Security (RLS)
  - Auto-update progress
  - Auto-create payment history
  - Indexes for performance

### 4. Authentication Middleware
- **File**: `backend/middleware/auth.js`
- **Features**:
  - JWT token verification
  - User lookup from Supabase
  - Secure route protection

---

## 🔧 SETUP INSTRUCTIONS

### Step 1: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Click "Developers" → "API keys"
3. Copy your keys:
   - **Publishable key**: `pk_test_...` (for frontend)
   - **Secret key**: `sk_test_...` (for backend)

### Step 2: Set Environment Variables

#### Frontend (.env)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

#### Backend (backend/.env or Render environment variables)
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://elevateforhumanity.pages.dev
```

### Step 3: Create Database Tables

1. Go to https://supabase.com/dashboard
2. Select your project: `cuxzzpsyufcewtmicszk`
3. Go to "SQL Editor"
4. Copy and paste the contents of `database/enrollments-schema.sql`
5. Click "Run"

This will create:
- `enrollments` table
- `payment_history` table
- All indexes and triggers
- Row Level Security policies

### Step 4: Set Up Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://efh-lms-backend.onrender.com/api/enrollments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add to backend environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 5: Install Stripe Package

#### Frontend
```bash
npm install @stripe/stripe-js
```

#### Backend
```bash
cd backend
npm install stripe
```

### Step 6: Update Backend Server

The enrollment routes are already added to `backend/server.js`. Just restart the backend:

```bash
cd backend
npm start
```

### Step 7: Test the Integration

#### Test FREE Enrollment:
```javascript
// In your React component
import EnrollmentCheckout from '@/components/payment/EnrollmentCheckout';

<EnrollmentCheckout
  program={{
    id: 'phlebotomy-101',
    title: 'Phlebotomy Technician',
    description: '8-10 week clinical training',
    price: 0, // FREE
    duration: '10 weeks',
    format: 'In-person',
    certification: 'Certified Phlebotomy Technician'
  }}
  onSuccess={() => console.log('Enrolled!')}
  onCancel={() => console.log('Cancelled')}
/>
```

#### Test PAID Enrollment:
```javascript
<EnrollmentCheckout
  program={{
    id: 'advanced-it-cert',
    title: 'Advanced IT Certification',
    description: 'CompTIA A+ and Network+',
    price: 299, // PAID
    duration: '12 weeks',
    format: 'Online',
    certification: 'CompTIA A+ & Network+'
  }}
  onSuccess={() => console.log('Payment successful!')}
  onCancel={() => console.log('Payment cancelled')}
/>
```

---

## 🧪 TESTING

### Test Mode (Use Test Cards)

Stripe provides test cards for testing:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Payment Declined:**
- Card: `4000 0000 0000 0002`

**Requires Authentication:**
- Card: `4000 0025 0000 3155`

### Test Workflow:

1. **FREE Enrollment**:
   - Click "Enroll Now - FREE"
   - Should create enrollment immediately
   - Check database: `SELECT * FROM enrollments WHERE payment_status = 'free'`

2. **PAID Enrollment**:
   - Click "Proceed to Payment"
   - Redirects to Stripe Checkout
   - Enter test card: `4242 4242 4242 4242`
   - Complete payment
   - Redirects to success page
   - Check database: `SELECT * FROM enrollments WHERE payment_status = 'paid'`

3. **Webhook Test**:
   - Use Stripe CLI: `stripe listen --forward-to localhost:3001/api/enrollments/webhook`
   - Make a test payment
   - Check logs for webhook events

---

## 📊 DATABASE QUERIES

### Check Enrollments:
```sql
SELECT 
  e.id,
  e.program_name,
  e.status,
  e.payment_status,
  e.amount,
  e.enrolled_at,
  p.email as user_email
FROM enrollments e
JOIN profiles p ON e.user_id = p.id
ORDER BY e.created_at DESC
LIMIT 10;
```

### Check Payment History:
```sql
SELECT 
  ph.id,
  ph.amount,
  ph.status,
  ph.description,
  ph.created_at,
  e.program_name
FROM payment_history ph
JOIN enrollments e ON ph.enrollment_id = e.id
ORDER BY ph.created_at DESC
LIMIT 10;
```

### Revenue Report:
```sql
SELECT 
  DATE(enrolled_at) as date,
  COUNT(*) as enrollments,
  SUM(amount) as revenue
FROM enrollments
WHERE payment_status = 'paid'
GROUP BY DATE(enrolled_at)
ORDER BY date DESC;
```

---

## 🚀 DEPLOYMENT

### Deploy Backend to Render:

1. Add environment variables in Render dashboard:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET`
   - `FRONTEND_URL`

2. Deploy:
```bash
git add -A
git commit -m "feat: add Stripe payment integration"
git push origin main
```

3. Render will auto-deploy

### Update Webhook URL:

After deployment, update Stripe webhook URL to:
```
https://efh-lms-backend.onrender.com/api/enrollments/webhook
```

---

## 💰 PRICING EXAMPLES

### FREE Programs (WIOA Funded):
```javascript
{
  id: 'phlebotomy-101',
  title: 'Phlebotomy Technician',
  price: 0, // FREE
  description: '100% FREE through WIOA funding'
}
```

### Paid Programs:
```javascript
{
  id: 'advanced-it',
  title: 'Advanced IT Certification Bundle',
  price: 299,
  description: 'CompTIA A+, Network+, and Security+'
}
```

### Premium Programs:
```javascript
{
  id: 'executive-mba',
  title: 'Executive MBA Program',
  price: 2999,
  description: '12-month executive MBA program'
}
```

---

## 🔒 SECURITY FEATURES

### ✅ Implemented:
- JWT authentication required
- Stripe webhook signature verification
- Row Level Security (RLS) in database
- HTTPS only (enforced by Cloudflare/Render)
- Rate limiting on API
- Input validation
- SQL injection protection (Supabase)

### ⚠️ Additional Recommendations:
- Enable Stripe Radar for fraud detection
- Set up email notifications for large transactions
- Implement refund policy
- Add transaction limits
- Monitor for suspicious activity

---

## 📧 EMAIL NOTIFICATIONS (TODO)

After payment, you should send:

1. **Enrollment Confirmation**
   - Welcome message
   - Course access instructions
   - Next steps

2. **Payment Receipt**
   - Transaction details
   - Invoice/receipt
   - Support contact

3. **Course Access**
   - Login credentials
   - Course materials link
   - Start date

**Recommended Services:**
- SendGrid (100 emails/day free)
- AWS SES ($0.10 per 1,000 emails)
- Resend (3,000 emails/month free)

---

## 📈 ANALYTICS & REPORTING

### Track These Metrics:

1. **Enrollment Metrics**:
   - Total enrollments
   - Free vs Paid ratio
   - Conversion rate
   - Average order value

2. **Revenue Metrics**:
   - Daily/Weekly/Monthly revenue
   - Revenue by program
   - Refund rate
   - Lifetime value per student

3. **Payment Metrics**:
   - Success rate
   - Failure reasons
   - Average transaction time
   - Payment method distribution

### Example Dashboard Query:
```sql
SELECT 
  COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_enrollments,
  COUNT(*) FILTER (WHERE payment_status = 'free') as free_enrollments,
  SUM(amount) FILTER (WHERE payment_status = 'paid') as total_revenue,
  AVG(amount) FILTER (WHERE payment_status = 'paid') as avg_order_value,
  COUNT(DISTINCT user_id) as unique_students
FROM enrollments
WHERE enrolled_at >= NOW() - INTERVAL '30 days';
```

---

## ✅ CHECKLIST

Before going live:

- [ ] Stripe account verified
- [ ] Test mode working
- [ ] Webhook configured and tested
- [ ] Database tables created
- [ ] Environment variables set
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Test cards working
- [ ] Real card tested (small amount)
- [ ] Email notifications set up
- [ ] Refund policy defined
- [ ] Terms of service updated
- [ ] Privacy policy updated
- [ ] Support email configured
- [ ] Analytics tracking enabled

---

## 🆘 TROUBLESHOOTING

### Issue: "Stripe is not defined"
**Solution**: Make sure you installed `@stripe/stripe-js` in frontend

### Issue: "Webhook signature verification failed"
**Solution**: Check that `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

### Issue: "Authentication required"
**Solution**: User must be logged in. Check JWT token in localStorage

### Issue: "Enrollment already exists"
**Solution**: User is already enrolled. Check database for existing enrollment

### Issue: "Payment succeeded but enrollment not updated"
**Solution**: Check webhook logs. Webhook might not be configured correctly

---

## 📞 SUPPORT

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com/
- **Test Cards**: https://stripe.com/docs/testing

---

## 🎉 YOU'RE READY!

Your Stripe payment integration is complete! You can now:
- Accept payments for courses
- Track enrollments
- Handle FREE and PAID programs
- Process refunds
- Generate reports

**Next Steps:**
1. Set up your Stripe account
2. Add environment variables
3. Create database tables
4. Test with test cards
5. Go live!

**Estimated Setup Time**: 30-60 minutes
