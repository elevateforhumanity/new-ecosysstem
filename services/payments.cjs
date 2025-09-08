const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe = null;

// Initialize Stripe if key is available
if (stripeKey) {
  try { 
    stripe = require('stripe')(stripeKey, { 
      apiVersion: '2023-10-16',
      timeout: 10000, // 10 second timeout
      maxNetworkRetries: 3
    }); 
  } catch (err) { 
    console.warn('Stripe initialization failed:', err.message);
    stripe = null; 
  }
}

// Supported program IDs and their pricing
const SUPPORTED_PROGRAMS = {
  'ai-fundamentals': { name: 'AI Fundamentals', price: 199700 }, // $1997
  'data-science-bootcamp': { name: 'Data Science Bootcamp', price: 495000 }, // $4950
  'advanced-ai-specialization': { name: 'Advanced AI Specialization', price: 749500 } // $7495
};

function validatePaymentRequest({ amount, programId, userId }) {
  const errors = [];
  
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  
  if (!programId || typeof programId !== 'string') {
    errors.push('Program ID is required');
  } else if (!SUPPORTED_PROGRAMS[programId]) {
    errors.push(`Unsupported program ID: ${programId}`);
  } else if (SUPPORTED_PROGRAMS[programId].price !== amount) {
    errors.push(`Amount mismatch for program ${programId}. Expected: ${SUPPORTED_PROGRAMS[programId].price}, got: ${amount}`);
  }
  
  if (userId && typeof userId !== 'string') {
    errors.push('User ID must be a string');
  }
  
  return errors;
}

async function createPaymentIntent({ amount, programId, userId, requestId }) {
  // Validate request
  const validationErrors = validatePaymentRequest({ amount, programId, userId });
  if (validationErrors.length > 0) {
    const error = new Error(`Validation failed: ${validationErrors.join(', ')}`);
    error.statusCode = 400;
    error.type = 'validation';
    throw error;
  }

  const program = SUPPORTED_PROGRAMS[programId];
  
  // Return simulation if Stripe not available
  if (!stripe) {
    return {
      simulated: true,
      clientSecret: `simulated_secret_${Date.now()}`,
      paymentIntentId: `pi_simulated_${requestId || 'unknown'}`,
      amount,
      programId,
      programName: program.name,
      status: 'requires_payment_method'
    };
  }
  
  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { 
        programId, 
        programName: program.name,
        userId: userId || 'anonymous',
        requestId: requestId || 'unknown'
      },
      description: `Payment for ${program.name}`
    }, { 
      idempotencyKey: requestId || `${programId}_${userId || 'anon'}_${Date.now()}`
    });
    
    return {
      simulated: false,
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: intent.amount,
      programId,
      programName: program.name,
      status: intent.status
    };
  } catch (stripeError) {
    const error = new Error(`Payment processing failed: ${stripeError.message}`);
    error.statusCode = 502;
    error.type = 'payment_provider_error';
    error.originalError = stripeError;
    throw error;
  }
}

function getPaymentStatus() {
  return {
    provider: stripe ? 'stripe' : 'simulation',
    available: !!stripe,
    supportedPrograms: Object.keys(SUPPORTED_PROGRAMS)
  };
}

module.exports = { 
  createPaymentIntent, 
  getPaymentStatus,
  SUPPORTED_PROGRAMS 
};
