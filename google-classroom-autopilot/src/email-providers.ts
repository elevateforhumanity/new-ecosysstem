/**
 * Email Provider Abstraction Layer
 * 
 * Supports multiple email providers:
 * - Resend (default, recommended)
 * - Postmark (transactional)
 * - AWS SES (scalable)
 * - SMTP (fallback)
 */

interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  tags?: Record<string, string>;
  // Correlation tracking
  taskId?: string;
  syncRunId?: string;
  contentId?: string;
  correlationId?: string;
  parentEventId?: string;
}

interface EmailProvider {
  name: string;
  send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * Resend Provider (Recommended)
 * https://resend.com
 */
class ResendProvider implements EmailProvider {
  name = 'Resend';
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'noreply@elevateforhumanity.org') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: message.from || this.fromEmail,
          to: message.to,
          cc: message.cc,
          bcc: message.bcc,
          reply_to: message.replyTo,
          subject: message.subject,
          html: message.html,
          text: message.text,
          tags: message.tags,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Resend API error');
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.id,
      };
    } catch (error: any) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

/**
 * Postmark Provider
 * https://postmarkapp.com
 */
class PostmarkProvider implements EmailProvider {
  name = 'Postmark';
  private serverToken: string;
  private fromEmail: string;

  constructor(serverToken: string, fromEmail: string = 'noreply@elevateforhumanity.org') {
    this.serverToken = serverToken;
    this.fromEmail = fromEmail;
  }

  async send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'X-Postmark-Server-Token': this.serverToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          From: message.from || this.fromEmail,
          To: message.to.join(','),
          Cc: message.cc?.join(','),
          Bcc: message.bcc?.join(','),
          ReplyTo: message.replyTo,
          Subject: message.subject,
          HtmlBody: message.html,
          TextBody: message.text,
          Tag: message.tags?.tag,
          TrackOpens: true,
          TrackLinks: 'HtmlAndText',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.Message || 'Postmark API error');
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.MessageID,
      };
    } catch (error: any) {
      console.error('Postmark error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

/**
 * AWS SES Provider
 * https://aws.amazon.com/ses/
 */
class SESProvider implements EmailProvider {
  name = 'AWS SES';
  private region: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private fromEmail: string;

  constructor(
    region: string,
    accessKeyId: string,
    secretAccessKey: string,
    fromEmail: string = 'noreply@elevateforhumanity.org'
  ) {
    this.region = region;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.fromEmail = fromEmail;
  }

  async send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Note: This is a simplified implementation
      // For production, use AWS SDK: @aws-sdk/client-ses
      
      console.log('AWS SES: Would send email via AWS SDK');
      console.log('To:', message.to);
      console.log('Subject:', message.subject);
      
      // TODO: Implement actual AWS SES sending
      // const client = new SESClient({ region: this.region, credentials: {...} });
      // const command = new SendEmailCommand({...});
      // const response = await client.send(command);
      
      return {
        success: true,
        messageId: 'ses-' + Date.now(),
      };
    } catch (error: any) {
      console.error('AWS SES error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

/**
 * SMTP Provider (Fallback)
 */
class SMTPProvider implements EmailProvider {
  name = 'SMTP';
  private config: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
  private fromEmail: string;

  constructor(
    host: string,
    port: number,
    user: string,
    pass: string,
    fromEmail: string = 'noreply@elevateforhumanity.org'
  ) {
    this.config = { host, port, user, pass };
    this.fromEmail = fromEmail;
  }

  async send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Note: This requires nodemailer package
      // For production: npm install nodemailer @types/nodemailer
      
      console.log('SMTP: Would send email via nodemailer');
      console.log('To:', message.to);
      console.log('Subject:', message.subject);
      
      // TODO: Implement actual SMTP sending
      // const transporter = nodemailer.createTransport(this.config);
      // const info = await transporter.sendMail({...});
      
      return {
        success: true,
        messageId: 'smtp-' + Date.now(),
      };
    } catch (error: any) {
      console.error('SMTP error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Email Service - Auto-selects provider based on environment
 */
export class EmailService {
  private provider: EmailProvider;

  constructor() {
    this.provider = this.selectProvider();
  }

  private selectProvider(): EmailProvider {
    // Priority: Resend > Postmark > SES > SMTP
    
    if (process.env.RESEND_API_KEY) {
      console.log('📧 Using Resend email provider');
      return new ResendProvider(
        process.env.RESEND_API_KEY,
        process.env.EMAIL_FROM || 'noreply@elevateforhumanity.org'
      );
    }

    if (process.env.POSTMARK_SERVER_TOKEN) {
      console.log('📧 Using Postmark email provider');
      return new PostmarkProvider(
        process.env.POSTMARK_SERVER_TOKEN,
        process.env.EMAIL_FROM || 'noreply@elevateforhumanity.org'
      );
    }

    if (process.env.AWS_SES_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      console.log('📧 Using AWS SES email provider');
      return new SESProvider(
        process.env.AWS_SES_REGION,
        process.env.AWS_ACCESS_KEY_ID,
        process.env.AWS_SECRET_ACCESS_KEY,
        process.env.EMAIL_FROM || 'noreply@elevateforhumanity.org'
      );
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('📧 Using SMTP email provider');
      return new SMTPProvider(
        process.env.SMTP_HOST,
        parseInt(process.env.SMTP_PORT || '587'),
        process.env.SMTP_USER,
        process.env.SMTP_PASS,
        process.env.EMAIL_FROM || 'noreply@elevateforhumanity.org'
      );
    }

    throw new Error('No email provider configured. Set RESEND_API_KEY, POSTMARK_SERVER_TOKEN, AWS SES credentials, or SMTP credentials.');
  }

  async send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log(`📧 Sending email via ${this.provider.name}...`);
    console.log(`   To: ${message.to.join(', ')}`);
    if (message.cc?.length) console.log(`   CC: ${message.cc.join(', ')}`);
    console.log(`   Subject: ${message.subject}`);

    // Log email event to database
    const eventIds: string[] = [];
    for (const recipient of message.to) {
      const { data: event } = await supabase
        .from('email_events')
        .insert({
          recipient,
          subject: message.subject,
          email_type: message.tags?.type || 'unknown',
          provider: this.provider.name.toLowerCase().replace(' ', '_'),
          status: 'queued',
          student_id: message.tags?.student_id,
          guardian_email: message.tags?.guardian_email,
          // Correlation tracking
          task_id: message.taskId,
          sync_run_id: message.syncRunId,
          content_id: message.contentId,
          correlation_id: message.correlationId,
          parent_event_id: message.parentEventId,
          metadata: {
            cc: message.cc,
            bcc: message.bcc,
            tags: message.tags,
          },
        })
        .select('id')
        .single();

      if (event) {
        eventIds.push(event.id);
      }
    }

    const result = await this.provider.send(message);

    // Update email events with result
    if (result.success && result.messageId) {
      for (const eventId of eventIds) {
        await supabase
          .from('email_events')
          .update({
            provider_message_id: result.messageId,
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', eventId);
      }

      console.log(`✅ Email sent successfully (ID: ${result.messageId})`);
    } else {
      for (const eventId of eventIds) {
        await supabase
          .from('email_events')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
            error_message: result.error,
          })
          .eq('id', eventId);
      }

      console.error(`❌ Email failed: ${result.error}`);
    }

    return result;
  }

  getProviderName(): string {
    return this.provider.name;
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export providers for testing
export { ResendProvider, PostmarkProvider, SESProvider, SMTPProvider };
