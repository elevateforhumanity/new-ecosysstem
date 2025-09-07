/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/


// BNPL Webhook Handler for Stripe Events
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Webhook endpoint for BNPL payment events
router.post('/webhooks/bnpl', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_BNPL_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('BNPL Webhook received:', event.type);

    try {
        switch (event.type) {
            case 'invoice.payment_succeeded':
                await handleBNPLPaymentSucceeded(event.data.object);
                break;
                
            case 'invoice.payment_failed':
                await handleBNPLPaymentFailed(event.data.object);
                break;
                
            case 'customer.subscription.deleted':
                await handleBNPLSubscriptionCanceled(event.data.object);
                break;
                
            case 'customer.subscription.updated':
                await handleBNPLSubscriptionUpdated(event.data.object);
                break;
                
            default:
                console.log(`Unhandled BNPL event type: ${event.type}`);
        }

        res.json({received: true});
    } catch (error) {
        console.error('Error processing BNPL webhook:', error);
        res.status(500).json({error: 'Webhook processing failed'});
    }
});

async function handleBNPLPaymentSucceeded(invoice) {
    const subscriptionId = invoice.subscription;
    const amountPaid = invoice.amount_paid;
    const paymentDate = new Date(invoice.created * 1000);

    try {
        // Get subscription details
        const { data: bnplSub } = await supabase
            .from('bnpl_subscriptions')
            .select('*')
            .eq('subscription_id', subscriptionId)
            .single();

        if (!bnplSub) {
            console.error('BNPL subscription not found:', subscriptionId);
            return;
        }

        // Determine installment number
        const installmentNumber = bnplSub.installments_paid + 1;

        // Record the payment
        await supabase
            .from('bnpl_payments')
            .upsert({
                subscription_id: subscriptionId,
                payment_intent_id: invoice.payment_intent,
                installment_number: installmentNumber,
                amount: amountPaid / 100, // Convert from cents
                status: 'paid',
                due_date: paymentDate.toISOString().split('T')[0],
                paid_at: paymentDate.toISOString(),
                metadata: {
                    invoice_id: invoice.id,
                    stripe_customer_id: invoice.customer
                }
            });

        // Update subscription installments count
        const newInstallmentsPaid = installmentNumber;
        const updateData = {
            installments_paid: newInstallmentsPaid
        };

        // Mark as completed if all installments are paid
        if (newInstallmentsPaid >= bnplSub.installments_total) {
            updateData.status = 'completed';
            updateData.completed_at = new Date().toISOString();
            
            // Grant full program access
            await grantProgramAccess(bnplSub.customer_email, bnplSub.program_slug, 'bnpl_completed');
        }

        await supabase
            .from('bnpl_subscriptions')
            .update(updateData)
            .eq('subscription_id', subscriptionId);

        // Send payment confirmation email
        await sendBNPLPaymentConfirmation(bnplSub, installmentNumber, amountPaid / 100);

        console.log(`BNPL payment ${installmentNumber} recorded for subscription ${subscriptionId}`);

    } catch (error) {
        console.error('Error processing BNPL payment success:', error);
        throw error;
    }
}

async function handleBNPLPaymentFailed(invoice) {
    const subscriptionId = invoice.subscription;
    const attemptCount = invoice.attempt_count;

    try {
        const { data: bnplSub } = await supabase
            .from('bnpl_subscriptions')
            .select('*')
            .eq('subscription_id', subscriptionId)
            .single();

        if (!bnplSub) return;

        // Record failed payment attempt
        await supabase
            .from('bnpl_payments')
            .upsert({
                subscription_id: subscriptionId,
                installment_number: bnplSub.installments_paid + 1,
                amount: invoice.amount_due / 100,
                status: 'failed',
                due_date: new Date(invoice.created * 1000).toISOString().split('T')[0],
                metadata: {
                    invoice_id: invoice.id,
                    attempt_count: attemptCount,
                    failure_reason: invoice.failure_reason || 'payment_failed'
                }
            });

        // Send payment failure notification
        await sendBNPLPaymentFailure(bnplSub, attemptCount);

        console.log(`BNPL payment failed for subscription ${subscriptionId}, attempt ${attemptCount}`);

    } catch (error) {
        console.error('Error processing BNPL payment failure:', error);
    }
}

async function handleBNPLSubscriptionCanceled(subscription) {
    try {
        await supabase
            .from('bnpl_subscriptions')
            .update({
                status: 'canceled',
                canceled_at: new Date().toISOString(),
                cancellation_reason: 'stripe_subscription_canceled'
            })
            .eq('subscription_id', subscription.id);

        console.log(`BNPL subscription canceled: ${subscription.id}`);
    } catch (error) {
        console.error('Error processing BNPL subscription cancellation:', error);
    }
}

async function handleBNPLSubscriptionUpdated(subscription) {
    // Handle subscription updates (pause, resume, etc.)
    try {
        const updateData = {
            metadata: {
                stripe_status: subscription.status,
                updated_at: new Date().toISOString()
            }
        };

        await supabase
            .from('bnpl_subscriptions')
            .update(updateData)
            .eq('subscription_id', subscription.id);

    } catch (error) {
        console.error('Error processing BNPL subscription update:', error);
    }
}

async function grantProgramAccess(customerEmail, programSlug, paymentMethod) {
    // Grant access to the program in your LMS/enrollment system
    try {
        await supabase
            .from('enrollments')
            .upsert({
                user_email: customerEmail,
                program_slug: programSlug,
                status: 'active',
                payment_method: paymentMethod,
                enrolled_at: new Date().toISOString(),
                access_level: 'full'
            });

        console.log(`Program access granted: ${customerEmail} -> ${programSlug}`);
    } catch (error) {
        console.error('Error granting program access:', error);
    }
}

async function sendBNPLPaymentConfirmation(subscription, installmentNumber, amount) {
    // Integration point for email notifications
    console.log(`Payment confirmation: ${subscription.customer_email}, installment ${installmentNumber}, $${amount}`);
    
    // TODO: Integrate with your email service
    // Example: SendGrid, Mailgun, or custom email system
}

async function sendBNPLPaymentFailure(subscription, attemptCount) {
    // Integration point for failure notifications
    console.log(`Payment failure: ${subscription.customer_email}, attempt ${attemptCount}`);
    
    // TODO: Integrate with your email service for dunning management
}

module.exports = router;
