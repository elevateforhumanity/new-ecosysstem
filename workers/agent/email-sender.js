/**
 * Email Sender Service
 * 
 * Processes the email_queue table and sends emails via Postmark, Resend, or SendGrid
 * Can be triggered via cron or manually
 */

import { renderEmail } from './email-templates.js';

/**
 * Send email via Postmark
 */
async function sendViaPostmark(env, email) {
  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': env.POSTMARK_SERVER_TOKEN,
    },
    body: JSON.stringify({
      From: env.FROM_EMAIL || 'support@elevateforhumanity.org',
      To: email.to_email,
      Subject: email.subject,
      TextBody: email.body,
      MessageStream: 'outbound',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Postmark error: ${error}`);
  }

  return await response.json();
}

/**
 * Send email via Resend
 */
async function sendViaResend(env, email) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL || 'support@elevateforhumanity.org',
      to: [email.to_email],
      subject: email.subject,
      text: email.body,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend error: ${error}`);
  }

  return await response.json();
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(env, email) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: email.to_email }],
      }],
      from: {
        email: env.FROM_EMAIL || 'support@elevateforhumanity.org',
      },
      subject: email.subject,
      content: [{
        type: 'text/plain',
        value: email.body,
      }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }

  return { success: true };
}

/**
 * Send a single email
 */
export async function sendEmail(env, email) {
  // Choose provider based on available credentials
  if (env.POSTMARK_SERVER_TOKEN) {
    return await sendViaPostmark(env, email);
  } else if (env.RESEND_API_KEY) {
    return await sendViaResend(env, email);
  } else if (env.SENDGRID_API_KEY) {
    return await sendViaSendGrid(env, email);
  } else {
    throw new Error('No email provider configured');
  }
}

/**
 * Process email queue
 * Fetches pending emails from Supabase and sends them
 */
export async function processEmailQueue(env, limit = 10) {
  // Fetch pending emails from Supabase
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/email_queue?status=eq.pending&limit=${limit}&order=created_at.asc`,
    {
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch email queue');
  }

  const emails = await response.json();
  const results = [];

  for (const email of emails) {
    try {
      // Render template if template_name is provided
      let subject = email.subject;
      let body = email.body;

      if (email.template_name && email.template_variables) {
        const rendered = renderEmail(email.template_name, email.template_variables);
        subject = rendered.subject;
        body = rendered.body;
      }

      // Send email
      const result = await sendEmail(env, {
        to_email: email.to_email,
        subject,
        body,
      });

      // Update status to 'sent'
      await fetch(
        `${env.SUPABASE_URL}/rest/v1/email_queue?id=eq.${email.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            status: 'sent',
            sent_at: new Date().toISOString(),
          }),
        }
      );

      results.push({
        id: email.id,
        to: email.to_email,
        status: 'sent',
      });
    } catch (error) {
      // Update status to 'failed'
      await fetch(
        `${env.SUPABASE_URL}/rest/v1/email_queue?id=eq.${email.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            status: 'failed',
            error_message: error.message,
          }),
        }
      );

      results.push({
        id: email.id,
        to: email.to_email,
        status: 'failed',
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Get email queue stats
 */
export async function getEmailQueueStats(env) {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/email_queue?select=status`,
    {
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch email queue stats');
  }

  const emails = await response.json();
  
  const stats = {
    total: emails.length,
    pending: emails.filter(e => e.status === 'pending').length,
    sent: emails.filter(e => e.status === 'sent').length,
    failed: emails.filter(e => e.status === 'failed').length,
  };

  return stats;
}
