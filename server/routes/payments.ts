/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import express from 'express';
import { loadEnv } from '../../src/env.js';
import { logger } from '../../src/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';

const router = express.Router();

// Initialize Stripe if key is available
let stripe: Stripe | null = null;

try {
  const env = loadEnv();
  if (env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
    logger.info('Stripe client initialized');
  } else {
    logger.info('STRIPE_SECRET_KEY not provided, running in stub mode');
  }
} catch (error: any) {
  logger.error({ err: error }, 'Failed to initialize Stripe');
}

// GET /api/payments/config - Payment configuration
router.get('/config', (req: express.Request, res: express.Response) => {
  const correlationId = req.headers['x-request-id'] as string;

  const configResponse = {
    timestamp: new Date().toISOString(),
    correlationId,
    
    programs: [
      {
        id: 'ai-fundamentals',
        title: 'AI Fundamentals',
        price: 1997,
        currency: 'usd',
        description: 'Learn the basics of artificial intelligence',
      },
      {
        id: 'data-science-bootcamp',
        title: 'Data Science Bootcamp',
        price: 2997,
        currency: 'usd',
        description: 'Comprehensive data science training',
      },
      {
        id: 'machine-learning-advanced',
        title: 'Advanced Machine Learning',
        price: 3997,
        currency: 'usd',
        description: 'Advanced ML techniques and applications',
      },
    ],
    
    fundingOptions: {
      wioa: {
        name: 'WIOA (Workforce Innovation and Opportunity Act)',
        description: 'Federal workforce development funding',
        eligibilityRequired: true,
        coveragePercentage: 100,
      },
      wrg: {
        name: 'Workforce Ready Grant',
        description: 'State-specific workforce grants',
        eligibilityRequired: true,
        coveragePercentage: 80,
      },
      selfPay: {
        name: 'Self-Pay',
        description: 'Direct payment options',
        eligibilityRequired: false,
        paymentMethods: ['card', 'ach', 'paypal'],
      },
    },
    
    stripeEnabled: !!stripe,
  };

  logger.info({ correlationId }, 'Payment config requested');
  res.json(configResponse);
});

// POST /api/payments/create-payment-intent - Create payment intent
router.post('/create-payment-intent', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { amount, program_id, user_id, currency = 'usd' } = req.body;
    const correlationId = req.headers['x-request-id'] as string;

    // Validation
    if (!amount || !program_id) {
      return res.status(400).json({
        error: 'amount and program_id are required',
        type: 'VALIDATION_ERROR',
        correlationId,
        timestamp: new Date().toISOString(),
      });
    }

    if (typeof amount !== 'number' || amount < 50) {
      return res.status(400).json({
        error: 'amount must be a number >= 50 cents',
        type: 'VALIDATION_ERROR',
        correlationId,
        timestamp: new Date().toISOString(),
      });
    }

    // Generate idempotency key
    const idempotencyKey = `${program_id}_${user_id || 'anonymous'}_${Date.now()}`;

    if (stripe) {
      // Real Stripe integration
      logger.info({ correlationId, amount, program_id, user_id }, 'Creating Stripe payment intent');

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          program_id,
          user_id: user_id || 'anonymous',
          correlation_id: correlationId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      }, {
        idempotencyKey,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        timestamp: new Date().toISOString(),
        correlationId,
      });
    } else {
      // Stub mode - return mock response
      logger.info({ correlationId, amount, program_id }, 'Creating stub payment intent');

      const mockPaymentIntentId = `pi_stub_${randomUUID().replace(/-/g, '').substring(0, 24)}`;
      const mockClientSecret = `${mockPaymentIntentId}_secret_${randomUUID().replace(/-/g, '').substring(0, 16)}`;

      res.json({
        clientSecret: mockClientSecret,
        paymentIntentId: mockPaymentIntentId,
        timestamp: new Date().toISOString(),
        correlationId,
        warning: 'This is a stub response. STRIPE_SECRET_KEY not configured.',
      });
    }
  } catch (error: any) {
    if (error.type === 'StripeCardError') {
      res.status(400).json({
        error: error.message,
        type: 'PAYMENT_ERROR',
        correlationId: req.headers['x-request-id'] as string,
        timestamp: new Date().toISOString(),
      });
    } else {
      next(error);
    }
  }
});

// GET /api/stripe/config - Legacy endpoint (alias for /config)
router.get('/stripe/config', (req, res) => {
  req.url = '/config';
  router.handle(req, res);
});

// POST /api/stripe/create-payment-intent - Legacy endpoint (alias)
router.post('/stripe/create-payment-intent', (req, res, next) => {
  req.url = '/create-payment-intent';
  router.handle(req, res, next);
});

export default router;