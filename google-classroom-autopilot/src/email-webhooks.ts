/**
 * Email Provider Webhook Handlers
 * 
 * Handles webhooks from email providers to update email event status:
 * - Resend
 * - Postmark
 * - AWS SES (via SNS)
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Update email event status in database
 */
async function updateEmailEventStatus(
  providerMessageId: string,
  status: string,
  errorMessage?: string,
  errorCode?: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_email_event_status', {
    p_provider_message_id: providerMessageId,
    p_status: status,
    p_error_message: errorMessage || null,
    p_error_code: errorCode || null,
  });

  if (error) {
    console.error('Error updating email event:', error);
    return false;
  }

  return true;
}

/**
 * Resend Webhook Handler
 * https://resend.com/docs/dashboard/webhooks/event-types
 */
export async function handleResendWebhook(payload: any, signature: string): Promise<boolean> {
  // Verify webhook signature
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (webhookSecret) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid Resend webhook signature');
      return false;
    }
  }

  const { type, data } = payload;
  const messageId = data.email_id;

  let status: string;
  let errorMessage: string | undefined;

  switch (type) {
    case 'email.sent':
      status = 'sent';
      break;
    case 'email.delivered':
      status = 'delivered';
      break;
    case 'email.opened':
      status = 'opened';
      break;
    case 'email.clicked':
      status = 'clicked';
      break;
    case 'email.bounced':
      status = 'bounced';
      errorMessage = data.bounce?.message;
      break;
    case 'email.complained':
      status = 'complained';
      break;
    case 'email.delivery_delayed':
      // Don't update status, just log
      console.log('Email delivery delayed:', messageId);
      return true;
    default:
      console.log('Unknown Resend webhook type:', type);
      return true;
  }

  return await updateEmailEventStatus(messageId, status, errorMessage);
}

/**
 * Postmark Webhook Handler
 * https://postmarkapp.com/developer/webhooks/webhooks-overview
 */
export async function handlePostmarkWebhook(payload: any): Promise<boolean> {
  const { RecordType, MessageID, Email, Bounce, Complaint } = payload;

  let status: string;
  let errorMessage: string | undefined;
  let errorCode: string | undefined;

  switch (RecordType) {
    case 'Delivery':
      status = 'delivered';
      break;
    case 'Open':
      status = 'opened';
      break;
    case 'Click':
      status = 'clicked';
      break;
    case 'Bounce':
      status = 'bounced';
      errorMessage = Bounce?.Description;
      errorCode = Bounce?.Type;
      break;
    case 'SpamComplaint':
      status = 'complained';
      errorMessage = Complaint?.ComplaintFeedbackType;
      break;
    default:
      console.log('Unknown Postmark webhook type:', RecordType);
      return true;
  }

  return await updateEmailEventStatus(MessageID, status, errorMessage, errorCode);
}

/**
 * AWS SES Webhook Handler (via SNS)
 * https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns.html
 */
export async function handleSESWebhook(payload: any): Promise<boolean> {
  // SNS sends notifications in a specific format
  const message = typeof payload.Message === 'string' ? JSON.parse(payload.Message) : payload.Message;
  
  const { eventType, mail, bounce, complaint, delivery, open, click } = message;
  const messageId = mail?.messageId;

  if (!messageId) {
    console.error('No message ID in SES webhook');
    return false;
  }

  let status: string;
  let errorMessage: string | undefined;
  let errorCode: string | undefined;

  switch (eventType) {
    case 'Send':
      status = 'sent';
      break;
    case 'Delivery':
      status = 'delivered';
      break;
    case 'Open':
      status = 'opened';
      break;
    case 'Click':
      status = 'clicked';
      break;
    case 'Bounce':
      status = 'bounced';
      errorMessage = bounce?.bouncedRecipients?.[0]?.diagnosticCode;
      errorCode = bounce?.bounceType;
      break;
    case 'Complaint':
      status = 'complained';
      errorMessage = complaint?.complaintFeedbackType;
      break;
    case 'Reject':
      status = 'failed';
      errorMessage = 'Email rejected by SES';
      break;
    default:
      console.log('Unknown SES webhook type:', eventType);
      return true;
  }

  return await updateEmailEventStatus(messageId, status, errorMessage, errorCode);
}

/**
 * Generic webhook handler - routes to appropriate provider
 */
export async function handleEmailWebhook(
  provider: 'resend' | 'postmark' | 'ses',
  payload: any,
  signature?: string
): Promise<{ success: boolean; message: string }> {
  try {
    let result: boolean;

    switch (provider) {
      case 'resend':
        result = await handleResendWebhook(payload, signature || '');
        break;
      case 'postmark':
        result = await handlePostmarkWebhook(payload);
        break;
      case 'ses':
        result = await handleSESWebhook(payload);
        break;
      default:
        return {
          success: false,
          message: `Unknown provider: ${provider}`,
        };
    }

    return {
      success: result,
      message: result ? 'Webhook processed successfully' : 'Failed to process webhook',
    };
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// Express/Cloudflare Worker example handlers
export const webhookHandlers = {
  /**
   * Express middleware for Resend webhooks
   */
  resend: async (req: any, res: any) => {
    const signature = req.headers['resend-signature'] || '';
    const result = await handleEmailWebhook('resend', req.body, signature);
    res.status(result.success ? 200 : 400).json(result);
  },

  /**
   * Express middleware for Postmark webhooks
   */
  postmark: async (req: any, res: any) => {
    const result = await handleEmailWebhook('postmark', req.body);
    res.status(result.success ? 200 : 400).json(result);
  },

  /**
   * Express middleware for AWS SES webhooks (via SNS)
   */
  ses: async (req: any, res: any) => {
    // Handle SNS subscription confirmation
    if (req.body.Type === 'SubscriptionConfirmation') {
      const subscribeUrl = req.body.SubscribeURL;
      console.log('SNS Subscription confirmation:', subscribeUrl);
      // In production, automatically confirm by fetching the URL
      res.status(200).json({ message: 'Subscription confirmation received' });
      return;
    }

    const result = await handleEmailWebhook('ses', req.body);
    res.status(result.success ? 200 : 400).json(result);
  },
};

// CLI for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const provider = process.argv[2] as 'resend' | 'postmark' | 'ses';
  const testPayload = process.argv[3];

  if (!provider || !testPayload) {
    console.log('Usage: npx tsx src/email-webhooks.ts <provider> <json-payload>');
    console.log('Example: npx tsx src/email-webhooks.ts resend \'{"type":"email.delivered","data":{"email_id":"123"}}\'');
    process.exit(1);
  }

  const payload = JSON.parse(testPayload);
  handleEmailWebhook(provider, payload)
    .then(result => {
      console.log('Result:', result);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
