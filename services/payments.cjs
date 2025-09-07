/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

// Payments service with Stripe integration and simulated fallback
let stripe = null;
const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;

if (hasStripeKey) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (error) {
    console.warn('Stripe initialization failed, using simulated mode:', error.message);
  }
}

// Create payment intent - real Stripe integration or simulated response
async function createPaymentIntent(amount, programId, userId = 'demo-user') {
  // Validate inputs
  if (!amount || amount <= 0) {
    const err = new Error('Invalid amount');
    err.statusCode = 400;
    err.type = 'validation';
    throw err;
  }
  
  if (!programId) {
    const err = new Error('Program ID is required');
    err.statusCode = 400;
    err.type = 'validation';
    throw err;
  }

  // If Stripe is available and configured, create real payment intent
  if (stripe && hasStripeKey) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          programId,
          userId,
          service: 'efh-lms'
        },
        description: `Payment for program ${programId}`,
      });

      return {
        id: paymentIntent.id,
        amount: amount,
        currency: 'usd',
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        programId,
        userId,
        created: new Date().toISOString(),
        simulated: false
      };
    } catch (error) {
      console.warn('Stripe payment intent creation failed, falling back to simulation:', error.message);
    }
  }

  // Fallback to simulated payment intent
  const simulatedId = `pi_simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: simulatedId,
    amount: amount,
    currency: 'usd',
    status: 'requires_payment_method',
    client_secret: `${simulatedId}_secret_simulated`,
    programId,
    userId,
    created: new Date().toISOString(),
    simulated: true
  };
}

// Get payment status (for order tracking)
async function getPaymentStatus(paymentIntentId) {
  if (stripe && hasStripeKey && !paymentIntentId.includes('simulated')) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        simulated: false
      };
    } catch (error) {
      console.warn('Stripe payment retrieval failed:', error.message);
    }
  }

  // Simulated response for testing/development
  return {
    id: paymentIntentId,
    status: paymentIntentId.includes('simulated') ? 'requires_payment_method' : 'unknown',
    simulated: true
  };
}

// Get configuration info for clients
function getConfig() {
  return {
    hasStripeKey: hasStripeKey,
    mode: hasStripeKey && stripe ? 'live' : 'simulated',
    supportedCurrencies: ['usd'],
    minimumAmount: 1.00 // $1.00 minimum
  };
}

module.exports = {
  createPaymentIntent,
  getPaymentStatus,
  getConfig
};