#!/usr/bin/env node

/**
 * Stripe Backend Integration for EFH Platform Sales
 * Handles high-value license purchases and digital products
 */

const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY_HERE'); // Replace with your secret key
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Product configurations
const PRODUCTS = {
  license: {
    starter: {
      name: 'EFH Starter License',
      price: 250000000, // $2.5M in cents
      description: 'Basic platform access with core features'
    },
    professional: {
      name: 'EFH Professional License',
      price: 1500000000, // $15M in cents
      description: 'Full platform with advanced AI capabilities'
    },
    enterprise: {
      name: 'EFH Enterprise License',
      price: 5000000000, // $50M in cents
      description: 'Complete ownership with full customization'
    }
  },
  digital: {
    workbooks: {
      name: 'Digital Workbook Collection',
      price: 5000000, // $50K in cents
      description: 'Complete curriculum workbooks and materials'
    },
    modules: {
      name: 'Training Modules Package',
      price: 10000000, // $100K in cents
      description: 'Pre-built training modules for all industries'
    },
    'ai-data': {
      name: 'AI Training Data Package',
      price: 50000000, // $500K in cents
      description: 'Proprietary AI models and training datasets'
    }
  }
};

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { product_type, tier, product, amount } = req.body;
    
    let productConfig;
    if (product_type === 'license') {
      productConfig = PRODUCTS.license[tier];
    } else if (product_type === 'digital') {
      productConfig = PRODUCTS.digital[product];
    }
    
    if (!productConfig) {
      return res.status(400).json({ error: 'Invalid product configuration' });
    }
    
    // For high-value transactions, use custom flow
    if (amount >= 1000000) { // $10K+
      return res.json({
        redirect_to_sales: true,
        message: 'High-value transaction requires sales team approval',
        contact_email: 'sales@elevateforhumanity.org'
      });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'bank_transfer'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productConfig.name,
              description: productConfig.description,
              metadata: {
                product_type: product_type,
                tier: tier || product,
                platform_value: '3150000000' // $3.15B
              }
            },
            unit_amount: productConfig.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/demo-landing-protected.html`,
      metadata: {
        product_type: product_type,
        tier: tier || product,
        customer_type: 'enterprise'
      },
      // For high-value items, require additional verification
      payment_intent_data: {
        metadata: {
          product_type: product_type,
          tier: tier || product,
          verification_required: amount >= 100000 ? 'true' : 'false'
        }
      }
    });
    
    // Log the transaction attempt
    console.log(`Checkout session created: ${session.id} for ${productConfig.name}`);
    
    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle successful payments
app.post('/api/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_YOUR_WEBHOOK_SECRET');
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`Payment successful for session: ${session.id}`);
      
      // Send confirmation email
      sendPurchaseConfirmation(session);
      
      // Log to analytics
      logPurchaseAnalytics(session);
      
      // Provision access (for digital products)
      if (session.metadata.product_type === 'digital') {
        provisionDigitalProduct(session);
      }
      
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`Payment intent succeeded: ${paymentIntent.id}`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({received: true});
});

// Analytics endpoint
app.post('/api/analytics', (req, res) => {
  const { event, parameters, timestamp, page, user_agent, referrer } = req.body;
  
  // Log analytics data
  console.log('Analytics Event:', {
    event,
    parameters,
    timestamp,
    page,
    user_agent: user_agent?.substring(0, 100), // Truncate for storage
    referrer
  });
  
  // In production, save to database or send to analytics service
  // Example: saveToDatabase(analyticsData);
  
  res.json({ status: 'recorded' });
});

// Success page
app.get('/success', async (req, res) => {
  const { session_id } = req.query;
  
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Successful - EFH Platform</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .container { background: white; color: #333; padding: 40px; border-radius: 20px; max-width: 600px; margin: 0 auto; }
          .success-icon { font-size: 4rem; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Purchase Successful!</h1>
          <p>Thank you for your purchase of <strong>${session.metadata.tier}</strong></p>
          <p>Session ID: ${session_id}</p>
          <p>Our team will contact you within 24 hours to complete the licensing process.</p>
          <p><strong>Next Steps:</strong></p>
          <ul style="text-align: left;">
            <li>Check your email for purchase confirmation</li>
            <li>Our licensing team will reach out for onboarding</li>
            <li>Access credentials will be provided</li>
            <li>Technical support will be available</li>
          </ul>
          <a href="/demo-landing-protected.html" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; margin-top: 20px;">Return to Platform</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Error retrieving session');
  }
});

// Helper functions
function sendPurchaseConfirmation(session) {
  // In production, integrate with email service (SendGrid, etc.)
  console.log(`Sending confirmation email for purchase: ${session.id}`);
  
  // Example email content
  const emailData = {
    to: session.customer_details?.email,
    subject: `EFH Platform Purchase Confirmation - ${session.metadata.tier}`,
    body: `
      Thank you for purchasing the EFH ${session.metadata.tier} license.
      
      Purchase Details:
      - Product: ${session.metadata.tier}
      - Amount: $${(session.amount_total / 100).toLocaleString()}
      - Session ID: ${session.id}
      
      Our licensing team will contact you within 24 hours.
      
      Best regards,
      EFH Licensing Team
    `
  };
  
  // Send email (implement with your email service)
  // emailService.send(emailData);
}

function logPurchaseAnalytics(session) {
  const analyticsData = {
    event: 'purchase_completed',
    session_id: session.id,
    product_type: session.metadata.product_type,
    tier: session.metadata.tier,
    amount: session.amount_total,
    currency: session.currency,
    timestamp: new Date().toISOString()
  };
  
  console.log('Purchase Analytics:', analyticsData);
  
  // In production, send to analytics service
  // analytics.track(analyticsData);
}

function provisionDigitalProduct(session) {
  console.log(`Provisioning digital product: ${session.metadata.tier}`);
  
  // In production, this would:
  // 1. Create user account
  // 2. Grant access to digital products
  // 3. Send download links
  // 4. Set up user permissions
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 EFH Stripe server running on port ${PORT}`);
  console.log(`💰 Ready to process $3.15B platform sales`);
});

module.exports = app;