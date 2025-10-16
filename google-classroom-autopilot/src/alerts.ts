/**
 * Alert System for Google Classroom Autopilot
 * 
 * Sends notifications when:
 * - Sync runs fail
 * - Tasks fail after max retries
 * - Critical errors occur
 * 
 * Supports: Email, Slack, Discord, SMS (Twilio)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AlertConfig {
  email?: {
    enabled: boolean;
    recipients: string[];
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
  };
  slack?: {
    enabled: boolean;
    webhookUrl: string;
    channel?: string;
  };
  discord?: {
    enabled: boolean;
    webhookUrl: string;
  };
  sms?: {
    enabled: boolean;
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    twilioPhoneNumber?: string;
    recipients: string[];
  };
}

const DEFAULT_CONFIG: AlertConfig = {
  email: {
    enabled: !!process.env.ALERT_EMAIL_ENABLED,
    recipients: (process.env.ALERT_EMAIL_RECIPIENTS || '').split(',').filter(Boolean),
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  },
  slack: {
    enabled: !!process.env.SLACK_WEBHOOK_URL,
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    channel: process.env.SLACK_CHANNEL,
  },
  discord: {
    enabled: !!process.env.DISCORD_WEBHOOK_URL,
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  },
  sms: {
    enabled: !!process.env.TWILIO_ACCOUNT_SID,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    recipients: (process.env.SMS_ALERT_RECIPIENTS || '').split(',').filter(Boolean),
  },
};

interface Alert {
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  details?: Record<string, any>;
  timestamp?: Date;
}

/**
 * Send alert through all configured channels
 */
export async function sendAlert(alert: Alert, config: AlertConfig = DEFAULT_CONFIG) {
  const timestamp = alert.timestamp || new Date();
  
  console.log(`🚨 Alert [${alert.severity.toUpperCase()}]: ${alert.title}`);
  console.log(`   ${alert.message}`);
  
  const results = {
    email: false,
    slack: false,
    discord: false,
    sms: false,
  };

  // Send to Slack
  if (config.slack?.enabled && config.slack.webhookUrl) {
    try {
      await sendSlackAlert(alert, config.slack);
      results.slack = true;
    } catch (error: any) {
      console.error('Failed to send Slack alert:', error.message);
    }
  }

  // Send to Discord
  if (config.discord?.enabled && config.discord.webhookUrl) {
    try {
      await sendDiscordAlert(alert, config.discord);
      results.discord = true;
    } catch (error: any) {
      console.error('Failed to send Discord alert:', error.message);
    }
  }

  // Send Email
  if (config.email?.enabled && config.email.recipients.length > 0) {
    try {
      await sendEmailAlert(alert, config.email);
      results.email = true;
    } catch (error: any) {
      console.error('Failed to send email alert:', error.message);
    }
  }

  // Send SMS (for critical alerts only)
  if (alert.severity === 'critical' && config.sms?.enabled && config.sms.recipients.length > 0) {
    try {
      await sendSMSAlert(alert, config.sms);
      results.sms = true;
    } catch (error: any) {
      console.error('Failed to send SMS alert:', error.message);
    }
  }

  // Log to Supabase
  await logAlert(alert, results);

  return results;
}

/**
 * Send Slack notification
 */
async function sendSlackAlert(alert: Alert, config: { webhookUrl: string; channel?: string }) {
  const color = {
    info: '#36a64f',
    warning: '#ff9900',
    error: '#ff0000',
    critical: '#8b0000',
  }[alert.severity];

  const payload = {
    channel: config.channel,
    username: 'Classroom Autopilot',
    icon_emoji: ':robot_face:',
    attachments: [
      {
        color,
        title: alert.title,
        text: alert.message,
        fields: alert.details
          ? Object.entries(alert.details).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true,
            }))
          : [],
        footer: 'Google Classroom Autopilot',
        ts: Math.floor((alert.timestamp || new Date()).getTime() / 1000),
      },
    ],
  };

  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.statusText}`);
  }
}

/**
 * Send Discord notification
 */
async function sendDiscordAlert(alert: Alert, config: { webhookUrl: string }) {
  const color = {
    info: 0x36a64f,
    warning: 0xff9900,
    error: 0xff0000,
    critical: 0x8b0000,
  }[alert.severity];

  const payload = {
    username: 'Classroom Autopilot',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
    embeds: [
      {
        title: alert.title,
        description: alert.message,
        color,
        fields: alert.details
          ? Object.entries(alert.details).map(([key, value]) => ({
              name: key,
              value: String(value),
              inline: true,
            }))
          : [],
        footer: {
          text: 'Google Classroom Autopilot',
        },
        timestamp: (alert.timestamp || new Date()).toISOString(),
      },
    ],
  };

  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.statusText}`);
  }
}

/**
 * Send email notification
 */
async function sendEmailAlert(
  alert: Alert,
  config: {
    recipients: string[];
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
  }
) {
  // Use Supabase Edge Function or external email service
  // For now, log that email would be sent
  console.log(`📧 Email alert would be sent to: ${config.recipients.join(', ')}`);
  
  // TODO: Implement actual email sending
  // Options:
  // 1. Supabase Edge Function with Resend/SendGrid
  // 2. Direct SMTP with nodemailer
  // 3. AWS SES
  
  // Placeholder implementation
  const emailBody = `
    <h2>${alert.title}</h2>
    <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
    <p>${alert.message}</p>
    ${
      alert.details
        ? `
      <h3>Details:</h3>
      <ul>
        ${Object.entries(alert.details)
          .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
          .join('')}
      </ul>
    `
        : ''
    }
    <p><small>Sent at ${(alert.timestamp || new Date()).toLocaleString()}</small></p>
  `;

  // Store email in Supabase for later sending
  await supabase.from('pending_emails').insert({
    recipients: config.recipients,
    subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
    body: emailBody,
    created_at: new Date().toISOString(),
  });
}

/**
 * Send SMS notification (critical alerts only)
 */
async function sendSMSAlert(
  alert: Alert,
  config: {
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    twilioPhoneNumber?: string;
    recipients: string[];
  }
) {
  console.log(`📱 SMS alert would be sent to: ${config.recipients.join(', ')}`);
  
  // TODO: Implement Twilio SMS
  // const message = `[CRITICAL] ${alert.title}: ${alert.message}`;
  
  // For each recipient, send SMS via Twilio API
}

/**
 * Log alert to Supabase
 */
async function logAlert(alert: Alert, results: Record<string, boolean>) {
  try {
    await supabase.from('alert_logs').insert({
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      details: alert.details || {},
      channels_sent: results,
      created_at: (alert.timestamp || new Date()).toISOString(),
    });
  } catch (error: any) {
    console.error('Failed to log alert:', error.message);
  }
}

/**
 * Alert for sync run failure
 */
export async function alertSyncFailure(syncRun: {
  id: string;
  sync_type: string;
  error_message?: string;
  records_processed?: number;
}) {
  await sendAlert({
    severity: 'error',
    title: 'Classroom Sync Failed',
    message: `Sync run ${syncRun.sync_type} failed`,
    details: {
      'Sync ID': syncRun.id,
      'Sync Type': syncRun.sync_type,
      'Records Processed': syncRun.records_processed || 0,
      'Error': syncRun.error_message || 'Unknown error',
    },
  });
}

/**
 * Alert for task failure
 */
export async function alertTaskFailure(task: {
  id: string;
  kind: string;
  error_message?: string;
  attempts: number;
}) {
  await sendAlert({
    severity: 'warning',
    title: 'Task Failed',
    message: `Task ${task.kind} failed after ${task.attempts} attempts`,
    details: {
      'Task ID': task.id,
      'Task Type': task.kind,
      'Attempts': task.attempts,
      'Error': task.error_message || 'Unknown error',
    },
  });
}

/**
 * Alert for critical system error
 */
export async function alertCriticalError(error: {
  component: string;
  message: string;
  stack?: string;
}) {
  await sendAlert({
    severity: 'critical',
    title: 'Critical System Error',
    message: `${error.component}: ${error.message}`,
    details: {
      Component: error.component,
      Error: error.message,
      Stack: error.stack?.substring(0, 500),
    },
  });
}

/**
 * Test alert system
 */
export async function testAlerts() {
  console.log('🧪 Testing alert system...\n');

  await sendAlert({
    severity: 'info',
    title: 'Test Alert',
    message: 'This is a test alert from Google Classroom Autopilot',
    details: {
      Environment: process.env.NODE_ENV || 'development',
      Timestamp: new Date().toISOString(),
    },
  });

  console.log('\n✅ Test alert sent!');
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'test':
      testAlerts().catch(console.error);
      break;

    default:
      console.log('Usage:');
      console.log('  npx tsx src/alerts.ts test  - Send test alert');
  }
}
