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


// Enhanced Payment Processing with Revenue Splits and Partner Notifications
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class PaymentProcessor {
  
  // Process payment with automatic 50/50 split
  async processPaymentWithSplit(paymentData) {
    const { program_slug, customer_email, customer_name, amount_cents, partner_connect_acc } = paymentData;
    
    try {
      // Calculate splits
      const platformAmount = Math.round(amount_cents * 0.5);
      const partnerAmount = amount_cents - platformAmount;
      
      console.log(`💰 Processing payment: $${amount_cents/100}`);
      console.log(`📊 Platform gets: $${platformAmount/100} (50%)`);
      console.log(`🤝 Partner gets: $${partnerAmount/100} (50%)`);
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount_cents,
        currency: 'usd',
        metadata: {
          program_slug,
          customer_email,
          customer_name,
          platform_amount_cents: platformAmount.toString(),
          partner_amount_cents: partnerAmount.toString(),
          partner_connect_acc,
          split_type: '50_50_platform_first'
        }
      });
      
      return {
        success: true,
        payment_intent: paymentIntent,
        platform_amount: platformAmount,
        partner_amount: partnerAmount
      };
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Process successful payment webhook
  async handleSuccessfulPayment(paymentIntent) {
    const metadata = paymentIntent.metadata;
    
    try {
      // Step 1: Platform gets paid (already happened via Stripe)
      console.log(`✅ Platform received: $${metadata.platform_amount_cents/100}`);
      
      // Step 2: Transfer to partner (if connect account exists)
      if (metadata.partner_connect_acc && metadata.partner_connect_acc !== '') {
        await this.transferToPartner({
          amount: parseInt(metadata.partner_amount_cents),
          connect_account: metadata.partner_connect_acc,
          program_slug: metadata.program_slug,
          customer_email: metadata.customer_email
        });
      }
      
      // Step 3: Notify partner with student details
      await this.notifyPartnerOfEnrollment({
        program_slug: metadata.program_slug,
        customer_email: metadata.customer_email,
        customer_name: metadata.customer_name,
        partner_amount: metadata.partner_amount_cents,
        payment_intent_id: paymentIntent.id
      });
      
      // Step 4: Send course access to student
      await this.sendCourseAccessToStudent({
        program_slug: metadata.program_slug,
        customer_email: metadata.customer_email,
        customer_name: metadata.customer_name
      });
      
    } catch (error) {
      console.error('Post-payment processing failed:', error);
    }
  }
  
  // Transfer funds to partner
  async transferToPartner({ amount, connect_account, program_slug, customer_email }) {
    try {
      const transfer = await stripe.transfers.create({
        amount: amount,
        currency: 'usd',
        destination: connect_account,
        metadata: {
          program_slug,
          customer_email,
          transfer_type: 'partner_revenue_split'
        }
      });
      
      console.log(`💸 Transferred $${amount/100} to partner: ${connect_account}`);
      return transfer;
      
    } catch (error) {
      console.error('Partner transfer failed:', error);
      throw error;
    }
  }
  
  // Notify partner of new enrollment
  async notifyPartnerOfEnrollment({ program_slug, customer_email, customer_name, partner_amount, payment_intent_id }) {
    const programs = require('./config/all-programs-with-stripe.json');
    const partners = require('./config/partners.json');
    
    const program = programs.find(p => p.slug === program_slug);
    const partner = partners.find(p => p.slug === program?.partner);
    
    if (!program || !partner) {
      console.error('Program or partner not found for notification');
      return;
    }
    
    const emailContent = `
      <h2>New Student Enrollment - Payment Processed</h2>
      
      <h3>Program Details:</h3>
      <ul>
        <li><strong>Program:</strong> ${program.name}</li>
        <li><strong>Student:</strong> ${customer_name}</li>
        <li><strong>Email:</strong> ${customer_email}</li>
        <li><strong>Payment ID:</strong> ${payment_intent_id}</li>
      </ul>
      
      <h3>Revenue Information:</h3>
      <ul>
        <li><strong>Your Share (50%):</strong> $${partner_amount/100}</li>
        <li><strong>Status:</strong> Funds transferred to your account</li>
      </ul>
      
      <h3>Next Steps:</h3>
      <p>Please provide course access to the student within 24 hours:</p>
      <ol>
        <li>Create student account in your LMS</li>
        <li>Send welcome email with login credentials</li>
        <li>Provide course materials and schedule</li>
      </ol>
      
      <p><strong>Student Contact:</strong> ${customer_email}</p>
      
      <hr>
      <p><small>This notification was sent automatically by the Elevate for Humanity partner system.</small></p>
    `;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: partner.supportEmail,
        subject: `New Enrollment: ${program.name} - ${customer_name}`,
        html: emailContent
      });
      
      console.log(`📧 Partner notification sent to: ${partner.supportEmail}`);
      
    } catch (error) {
      console.error('Failed to send partner notification:', error);
    }
  }
  
  // Send course access information to student
  async sendCourseAccessToStudent({ program_slug, customer_email, customer_name }) {
    const programs = require('./config/all-programs-with-stripe.json');
    const partners = require('./config/partners.json');
    
    const program = programs.find(p => p.slug === program_slug);
    const partner = partners.find(p => p.slug === program?.partner);
    
    if (!program || !partner) {
      console.error('Program or partner not found for student notification');
      return;
    }
    
    const emailContent = `
      <h2>Welcome to ${program.name}!</h2>
      
      <p>Dear ${customer_name},</p>
      
      <p>Thank you for enrolling in <strong>${program.name}</strong>. Your payment has been processed successfully.</p>
      
      <h3>Program Information:</h3>
      <ul>
        <li><strong>Program:</strong> ${program.name}</li>
        <li><strong>Provider:</strong> ${partner.name}</li>
        <li><strong>Duration:</strong> ${program.hours} hours</li>
        ${program.certification ? '<li><strong>Certification:</strong> Yes</li>' : ''}
      </ul>
      
      <h3>Next Steps:</h3>
      <p>Our training partner will contact you within 24 hours with:</p>
      <ol>
        <li>Course access credentials</li>
        <li>Training schedule and materials</li>
        <li>Technical requirements</li>
        <li>Support contact information</li>
      </ol>
      
      <h3>Support:</h3>
      <p>If you have any questions, please contact:</p>
      <ul>
        <li><strong>Training Partner:</strong> ${partner.supportEmail}</li>
        <li><strong>Platform Support:</strong> support@elevateforhumanity.org</li>
      </ul>
      
      <p>We're excited to support your professional development journey!</p>
      
      <p>Best regards,<br>
      The Elevate for Humanity Team</p>
      
      <hr>
      <p><small>This is an automated confirmation. Please save this email for your records.</small></p>
    `;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customer_email,
        subject: `Enrollment Confirmed: ${program.name}`,
        html: emailContent
      });
      
      console.log(`📧 Student confirmation sent to: ${customer_email}`);
      
    } catch (error) {
      console.error('Failed to send student confirmation:', error);
    }
  }
}

module.exports = PaymentProcessor;
