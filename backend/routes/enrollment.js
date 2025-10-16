const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

// Middleware to verify JWT token
const authenticateToken = require('../middleware/auth');

/**
 * POST /api/enrollments/create-checkout-session
 * Create a Stripe checkout session for course enrollment
 */
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { programId, programName, price } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!programId || !programName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Program ID and name are required' 
      });
    }

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .eq('status', 'active')
      .single();

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'You are already enrolled in this program'
      });
    }

    // If program is free, create enrollment directly
    if (!price || price === 0) {
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          program_id: programId,
          program_name: programName,
          status: 'active',
          enrolled_at: new Date().toISOString(),
          payment_status: 'free'
        })
        .select()
        .single();

      if (enrollmentError) {
        throw enrollmentError;
      }

      return res.json({
        success: true,
        enrollment,
        message: 'Successfully enrolled in free program'
      });
    }

    // Create Stripe checkout session for paid programs
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: programName,
              description: `Enrollment in ${programName}`,
              metadata: {
                program_id: programId,
                user_id: userId
              }
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'https://elevateforhumanity.pages.dev'}/enrollment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://elevateforhumanity.pages.dev'}/enrollment/cancel`,
      customer_email: req.user.email,
      metadata: {
        user_id: userId,
        program_id: programId,
        program_name: programName
      }
    });

    // Store pending enrollment
    await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        program_id: programId,
        program_name: programName,
        status: 'pending',
        payment_status: 'pending',
        stripe_session_id: session.id,
        amount: price,
        created_at: new Date().toISOString()
      });

    res.json({
      success: true,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
});

/**
 * POST /api/enrollments/webhook
 * Handle Stripe webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
});

/**
 * GET /api/enrollments/my-enrollments
 * Get current user's enrollments
 */
router.get('/my-enrollments', authenticateToken, async (req, res) => {
  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', req.user.id)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      enrollments
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enrollments'
    });
  }
});

/**
 * GET /api/enrollments/verify/:sessionId
 * Verify enrollment after Stripe checkout
 */
router.get('/verify/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }

    // Get enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      enrollment,
      session
    });
  } catch (error) {
    console.error('Verify enrollment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify enrollment'
    });
  }
});

// Helper functions

async function handleCheckoutCompleted(session) {
  try {
    const { user_id, program_id, program_name } = session.metadata;

    // Update enrollment status
    const { error } = await supabase
      .from('enrollments')
      .update({
        status: 'active',
        payment_status: 'paid',
        enrolled_at: new Date().toISOString(),
        stripe_payment_intent: session.payment_intent,
        customer_email: session.customer_details?.email
      })
      .eq('stripe_session_id', session.id);

    if (error) {
      console.error('Enrollment update error:', error);
      return;
    }

    // TODO: Send confirmation email
    console.log(`Enrollment completed for user ${user_id} in program ${program_id}`);

    // TODO: Grant access to course materials
    // TODO: Notify instructors

  } catch (error) {
    console.error('Checkout completed handler error:', error);
  }
}

async function handleCheckoutExpired(session) {
  try {
    await supabase
      .from('enrollments')
      .update({
        status: 'expired',
        payment_status: 'expired'
      })
      .eq('stripe_session_id', session.id);

    console.log(`Checkout expired for session ${session.id}`);
  } catch (error) {
    console.error('Checkout expired handler error:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    // Find enrollment by payment intent
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('stripe_payment_intent', paymentIntent.id)
      .single();

    if (enrollment) {
      await supabase
        .from('enrollments')
        .update({
          status: 'failed',
          payment_status: 'failed'
        })
        .eq('id', enrollment.id);
    }

    console.log(`Payment failed for intent ${paymentIntent.id}`);
  } catch (error) {
    console.error('Payment failed handler error:', error);
  }
}

module.exports = router;
