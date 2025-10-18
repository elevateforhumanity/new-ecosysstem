# Stripe Payment Integration Setup

## Overview
Stripe payment integration is configured for program enrollments. Most programs are FREE, but paid options are supported.

## Frontend Setup ✅

### 1. Stripe Package Installed
```bash
pnpm add @stripe/stripe-js stripe
```

### 2. Components Created
- ✅ `src/components/payment/EnrollmentCheckout.jsx` - Checkout UI
- ✅ `src/pages/PaymentSuccess.tsx` - Success page
- ✅ `src/pages/PaymentCancelled.tsx` - Cancellation page
- ✅ `src/services/stripe.ts` - Stripe service functions

### 3. Routes Added
- `/payment/success` - After successful payment
- `/payment/cancelled` - After cancelled payment

## Backend Setup Required ⚠️

You need to create backend API endpoints to handle Stripe securely:

### Required Endpoints:

#### 1. Create Checkout Session
**Endpoint:** `POST /api/create-checkout-session`

**Request Body:**
```json
{
  "programId": "uuid",
  "programName": "Program Title",
  "price": 0,
  "successUrl": "https://yoursite.com/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://yoursite.com/payment/cancelled"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_..."
}
```

**Example Implementation (Node.js/Express):**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { programId, programName, price, successUrl, cancelUrl } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: programName,
              description: `Enrollment in ${programName}`,
            },
            unit_amount: price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        programId: programId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Webhook Handler (Important!)
**Endpoint:** `POST /api/stripe-webhook`

Handle Stripe events to create enrollments after successful payment:

```javascript
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Create enrollment in database
    await createEnrollment({
      userId: session.client_reference_id,
      programId: session.metadata.programId,
      paymentStatus: 'paid',
      stripeSessionId: session.id,
    });
  }

  res.json({received: true});
});
```

#### 3. Free Enrollment
**Endpoint:** `POST /api/enroll-free`

**Request Body:**
```json
{
  "programId": "uuid",
  "userId": "uuid"
}
```

**Response:**
```json
{
  "enrollmentId": "uuid",
  "status": "enrolled"
}
```

## Environment Variables

Add to your `.env` file:

```bash
# Frontend (.env)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Backend
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Getting Stripe Keys

1. **Sign up at:** https://dashboard.stripe.com/register
2. **Get test keys:** https://dashboard.stripe.com/test/apikeys
3. **Publishable key** (starts with `pk_test_`) → Frontend
4. **Secret key** (starts with `sk_test_`) → Backend (NEVER expose!)

## Testing

### Test Cards (Stripe Test Mode):
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

## Webhook Setup

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yoursite.com/api/stripe-webhook`
4. Select events: `checkout.session.completed`
5. Copy the webhook secret to your backend `.env`

## Database Schema

Add to your Supabase migrations:

```sql
-- Enrollments table
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid references programs(id) on delete set null,
  payment_status text not null default 'free', -- 'free', 'paid', 'pending'
  stripe_session_id text,
  enrolled_at timestamptz default now(),
  completed_at timestamptz
);

-- RLS policies
alter table enrollments enable row level security;

create policy "Users can view own enrollments"
  on enrollments for select
  using (auth.uid() = user_id);

create policy "System can create enrollments"
  on enrollments for insert
  with check (true);
```

## Current Status

✅ Frontend integration complete
✅ Payment UI components ready
✅ Success/cancel pages created
✅ Stripe service functions implemented
⚠️ Backend API endpoints needed
⚠️ Webhook handler needed
⚠️ Database schema needed

## Next Steps

1. Set up backend API (Node.js/Express recommended)
2. Add Stripe secret key to backend environment
3. Create checkout session endpoint
4. Set up webhook handler
5. Add database schema for enrollments
6. Test with Stripe test cards
7. Switch to live keys for production

## Support

- **Stripe Docs:** https://stripe.com/docs/payments/checkout
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Test Cards:** https://stripe.com/docs/testing
