/**
 * Payment Service
 * Handles payment processing, subscriptions, and transactions
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata,
        automatic_payment_methods: { enabled: true }
      });
      return paymentIntent;
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw error;
    }
  }

  async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });
      return subscription;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    }
  }

  async processRefund(paymentIntentId, amount = null) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined
      });
      return refund;
    } catch (error) {
      console.error('Refund processing failed:', error);
      throw error;
    }
  }

  async getTransactionHistory(customerId, limit = 10) {
    try {
      const charges = await stripe.charges.list({
        customer: customerId,
        limit
      });
      return charges.data;
    } catch (error) {
      console.error('Transaction history retrieval failed:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
