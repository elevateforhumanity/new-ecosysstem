/**
 * Email Service
 * Handles sending transactional emails via SMTP (Nodemailer), SendGrid, or Resend
 */

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp'; // 'smtp', 'sendgrid', or 'resend'

// Email templates
const TEMPLATES = {
  ENROLLMENT_CONFIRMATION: 'enrollment_confirmation',
  PAYMENT_RECEIPT: 'payment_receipt',
  COURSE_WELCOME: 'course_welcome',
  CERTIFICATE_ISSUED: 'certificate_issued',
  PASSWORD_RESET: 'password_reset',
  COURSE_REMINDER: 'course_reminder',
};

/**
 * Send email via SMTP (Nodemailer) - In-house solution
 */
async function sendWithSMTP(to, subject, html, text) {
  const nodemailer = require('nodemailer');

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} via SMTP`);
    console.log(`   Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ SMTP error:', error.message);
    throw error;
  }
}

/**
 * Send email via SendGrid
 */
async function sendWithSendGrid(to, subject, html, text) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to,
    from: process.env.EMAIL_FROM || 'noreply@elevateforhumanity.org',
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to} via SendGrid`);
    return { success: true };
  } catch (error) {
    console.error('❌ SendGrid error:', error.response?.body || error.message);
    throw error;
  }
}

/**
 * Send email via Resend
 */
async function sendWithResend(to, subject, html, text) {
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@elevateforhumanity.org',
      to,
      subject,
      html,
      text,
    });
    console.log(`✅ Email sent to ${to} via Resend`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Resend error:', error.message);
    throw error;
  }
}

/**
 * Main email sending function
 */
async function sendEmail({ to, subject, html, text }) {
  if (!to || !subject || !html) {
    throw new Error('Missing required email fields: to, subject, html');
  }

  // Check if email service is configured
  if (EMAIL_PROVIDER === 'smtp' && !process.env.SMTP_HOST) {
    console.warn('⚠️  SMTP not configured, skipping email');
    return { success: false, skipped: true };
  }

  if (EMAIL_PROVIDER === 'sendgrid' && !process.env.SENDGRID_API_KEY) {
    console.warn('⚠️  SENDGRID_API_KEY not configured, skipping email');
    return { success: false, skipped: true };
  }

  if (EMAIL_PROVIDER === 'resend' && !process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not configured, skipping email');
    return { success: false, skipped: true };
  }

  // Send via configured provider
  if (EMAIL_PROVIDER === 'smtp') {
    return sendWithSMTP(to, subject, html, text);
  } else if (EMAIL_PROVIDER === 'sendgrid') {
    return sendWithSendGrid(to, subject, html, text);
  } else if (EMAIL_PROVIDER === 'resend') {
    return sendWithResend(to, subject, html, text);
  } else {
    throw new Error(`Unknown email provider: ${EMAIL_PROVIDER}`);
  }
}

/**
 * Send enrollment confirmation email
 */
async function sendEnrollmentConfirmation({ to, studentName, courseName, enrollmentDate }) {
  const subject = `Welcome to ${courseName}!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Enrollment Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${studentName},</p>
          <p>Congratulations! You're now enrolled in <strong>${courseName}</strong>.</p>
          <p>Your learning journey begins now. Access your course dashboard to start learning.</p>
          <a href="${process.env.FRONTEND_URL || 'https://elevateforhumanity.pages.dev'}/dashboard" class="button">
            Go to Dashboard
          </a>
          <p><strong>Enrollment Details:</strong></p>
          <ul>
            <li>Course: ${courseName}</li>
            <li>Enrolled: ${new Date(enrollmentDate).toLocaleDateString()}</li>
          </ul>
          <p>If you have any questions, reply to this email or contact our support team.</p>
          <p>Happy learning!</p>
        </div>
        <div class="footer">
          <p>Elevate for Humanity</p>
          <p>Empowering communities through education</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hi ${studentName},
    
    Congratulations! You're now enrolled in ${courseName}.
    
    Your learning journey begins now. Visit ${process.env.FRONTEND_URL || 'https://elevateforhumanity.pages.dev'}/dashboard to start learning.
    
    Enrollment Details:
    - Course: ${courseName}
    - Enrolled: ${new Date(enrollmentDate).toLocaleDateString()}
    
    Happy learning!
    
    Elevate for Humanity
  `;

  return sendEmail({ to, subject, html, text });
}

/**
 * Send payment receipt email
 */
async function sendPaymentReceipt({ to, studentName, courseName, amount, currency, receiptUrl, transactionDate }) {
  const subject = `Payment Receipt - ${courseName}`;
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .receipt { background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Successful</h1>
        </div>
        <div class="content">
          <p>Hi ${studentName},</p>
          <p>Thank you for your payment! Your enrollment in <strong>${courseName}</strong> is now active.</p>
          
          <div class="receipt">
            <h3>Payment Receipt</h3>
            <p><strong>Amount Paid:</strong> ${formattedAmount}</p>
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Date:</strong> ${new Date(transactionDate).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> Card</p>
          </div>

          ${receiptUrl ? `<a href="${receiptUrl}" class="button">View Receipt</a>` : ''}
          
          <p>You can now access all course materials in your dashboard.</p>
          <a href="${process.env.FRONTEND_URL || 'https://elevateforhumanity.pages.dev'}/dashboard" class="button">
            Start Learning
          </a>
        </div>
        <div class="footer">
          <p>Elevate for Humanity</p>
          <p>Questions? Contact support@elevateforhumanity.org</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hi ${studentName},
    
    Thank you for your payment! Your enrollment in ${courseName} is now active.
    
    Payment Receipt:
    - Amount Paid: ${formattedAmount}
    - Course: ${courseName}
    - Date: ${new Date(transactionDate).toLocaleDateString()}
    
    ${receiptUrl ? `View Receipt: ${receiptUrl}` : ''}
    
    Start learning: ${process.env.FRONTEND_URL || 'https://elevateforhumanity.pages.dev'}/dashboard
    
    Elevate for Humanity
  `;

  return sendEmail({ to, subject, html, text });
}

/**
 * Send certificate issued email
 */
async function sendCertificateIssued({ to, studentName, courseName, certificateUrl, completionDate }) {
  const subject = `🎓 Certificate Issued - ${courseName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Congratulations!</h1>
        </div>
        <div class="content">
          <p>Hi ${studentName},</p>
          <p>Congratulations on completing <strong>${courseName}</strong>!</p>
          <p>Your certificate of completion is now available.</p>
          
          <a href="${certificateUrl}" class="button">Download Certificate</a>
          
          <p><strong>Completion Date:</strong> ${new Date(completionDate).toLocaleDateString()}</p>
          
          <p>Share your achievement on LinkedIn and other social platforms!</p>
          
          <p>Keep learning and growing with Elevate for Humanity.</p>
        </div>
        <div class="footer">
          <p>Elevate for Humanity</p>
          <p>Empowering communities through education</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hi ${studentName},
    
    Congratulations on completing ${courseName}!
    
    Your certificate of completion is now available.
    Download: ${certificateUrl}
    
    Completion Date: ${new Date(completionDate).toLocaleDateString()}
    
    Share your achievement and keep learning!
    
    Elevate for Humanity
  `;

  return sendEmail({ to, subject, html, text });
}

module.exports = {
  sendEmail,
  sendEnrollmentConfirmation,
  sendPaymentReceipt,
  sendCertificateIssued,
  TEMPLATES,
};
