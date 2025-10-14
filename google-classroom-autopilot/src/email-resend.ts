/**
 * Email Resend System with Safety Checks
 * 
 * Safely resend failed/bounced emails with duplicate prevention
 */

import { createClient } from '@supabase/supabase-js';
import { emailService } from './email-providers';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ResendOptions {
  eventId: string;
  userId?: string; // User requesting the resend (for RBAC)
  force?: boolean; // Skip safety checks (admin only)
  minHoursSinceLastSend?: number; // Default: 12 hours (720 minutes)
  allowedStatuses?: string[]; // Default: ['failed', 'bounced']
}

interface ResendResult {
  success: boolean;
  message: string;
  recipient?: string;
  newEventId?: string;
  skipped?: boolean;
  reason?: string;
  error?: string;
}

/**
 * Check if email can be safely resent
 */
async function canResendEmail(
  recipient: string,
  emailType: string,
  minHours: number = 24
): Promise<{ canResend: boolean; reason?: string; lastSent?: Date }> {
  // Check for recent sends to same recipient with same type
  const { data: recentEmails } = await supabase
    .from('email_events')
    .select('*')
    .eq('recipient', recipient)
    .eq('email_type', emailType)
    .gte('created_at', new Date(Date.now() - minHours * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (recentEmails && recentEmails.length > 0) {
    const lastEmail = recentEmails[0];
    
    // Don't resend if last email was successful
    if (['delivered', 'opened', 'clicked'].includes(lastEmail.status)) {
      return {
        canResend: false,
        reason: `Email already ${lastEmail.status} within last ${minHours} hours`,
        lastSent: new Date(lastEmail.created_at),
      };
    }

    // Don't resend if already sent recently (even if failed)
    return {
      canResend: false,
      reason: `Email sent within last ${minHours} hours (status: ${lastEmail.status})`,
      lastSent: new Date(lastEmail.created_at),
    };
  }

  return { canResend: true };
}

/**
 * Check if recipient is on Do Not Contact list
 */
async function isRecipientBlocked(recipient: string): Promise<{ blocked: boolean; reason?: string }> {
  const { data } = await supabase
    .from('do_not_contact')
    .select('*')
    .eq('email', recipient.toLowerCase())
    .maybeSingle();

  if (!data) {
    return { blocked: false };
  }

  // Check if temporary block has expired
  if (data.expires_at && new Date(data.expires_at) <= new Date()) {
    return { blocked: false };
  }

  return { 
    blocked: true, 
    reason: `On Do Not Contact list (${data.reason})` 
  };
}

/**
 * Check if user has admin role
 */
async function isUserAdmin(userId?: string): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabase.rpc('is_admin', { p_user_id: userId });
  
  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return data === true;
}

/**
 * Resend a failed/bounced email with safety checks and RBAC
 */
export async function resendEmail(eventId: string, userId?: string): Promise<ResendResult> {
  // RBAC Check: Only admins can resend emails
  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    return {
      success: false,
      error: 'Only administrators can resend emails',
      message: 'Permission denied',
    };
  }

  // Get original email event
  const { data: originalEvent, error } = await supabase
    .from('email_events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error || !originalEvent) {
    return {
      success: false,
      error: 'Original email event not found',
      message: 'Email event not found',
    };
  }

  // Use database function for comprehensive checks
  const { data: canResendData, error: canResendError } = await supabase.rpc('can_resend_email', {
    p_event_id: eventId,
    p_user_id: userId,
  });

  if (canResendError) {
    return {
      success: false,
      error: `Error checking resend eligibility: ${canResendError.message}`,
      message: 'Failed to validate resend request',
    };
  }

  // canResendData is an array of rows with can_resend and reason columns
  const checkResult = canResendData?.[0];
  
  if (!checkResult?.can_resend) {
    return {
      success: false,
      skipped: true,
      reason: checkResult?.reason || 'Cannot resend email',
      message: checkResult?.reason || 'Email cannot be resent',
      recipient: originalEvent.recipient,
    };
  }

  // Get original email content
  // Note: We need to reconstruct the email from metadata or stored content
  // For now, we'll create a simple retry notification
  
  const subject = originalEvent.subject || 'Retry: Email Notification';
  const html = originalEvent.metadata?.html || `
    <p>This is a retry of a previous email that failed to deliver.</p>
    <p>If you continue to have issues, please contact support.</p>
  `;

  try {
    // Send the email
    const result = await emailService.send({
      to: [originalEvent.recipient],
      from: process.env.EMAIL_FROM || 'noreply@elevateforhumanity.org',
      subject: subject,
      html: html,
      tags: {
        type: originalEvent.email_type,
        resend: 'true',
        original_event_id: eventId,
      },
      // Preserve correlation
      taskId: originalEvent.task_id,
      syncRunId: originalEvent.sync_run_id,
      contentId: originalEvent.content_id,
      correlationId: originalEvent.correlation_id,
      parentEventId: eventId, // Link to original
    });

    if (result.success) {
      // Update original event with resend tracking
      await supabase
        .from('email_events')
        .update({
          resend_count: (originalEvent.resend_count || 0) + 1,
          last_resend_at: new Date().toISOString(),
          resend_by: userId,
        })
        .eq('id', eventId);

      // Log resend action
      await supabase.from('audit_logs').insert({
        action: 'email_resent',
        user_id: userId,
        details: {
          original_event_id: eventId,
          new_message_id: result.messageId,
          recipient: originalEvent.recipient,
          reason: 'manual_resend',
        },
      });

      return {
        success: true,
        message: 'Email resent successfully',
        recipient: originalEvent.recipient,
        newEventId: result.messageId,
      };
    } else {
      return {
        success: false,
        error: result.error,
        message: `Failed to resend: ${result.error}`,
        recipient: originalEvent.recipient,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: `Error resending email: ${error.message}`,
      recipient: originalEvent.recipient,
    };
  }
}

/**
 * Resend multiple emails in batch
 */
export async function resendEmailBatch(
  eventIds: string[],
  userId?: string
): Promise<{
  total: number;
  sent: number;
  skipped: number;
  failed: number;
  results: ResendResult[];
}> {
  const results: ResendResult[] = [];
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const eventId of eventIds) {
    const result = await resendEmail(eventId, userId);
    results.push(result);

    if (result.success) {
      sent++;
    } else if (result.skipped) {
      skipped++;
    } else {
      failed++;
    }

    // Rate limiting: wait 100ms between sends
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return {
    total: eventIds.length,
    sent,
    skipped,
    failed,
    results,
  };
}

/**
 * Resend all failed emails for a task
 */
export async function resendTaskEmails(
  taskId: string,
  userId?: string
): Promise<ReturnType<typeof resendEmailBatch>> {
  const { data: failedEmails } = await supabase
    .from('email_events')
    .select('id')
    .eq('task_id', taskId)
    .in('status', ['failed', 'bounced']);

  if (!failedEmails || failedEmails.length === 0) {
    return {
      total: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      results: [],
    };
  }

  const eventIds = failedEmails.map(e => e.id);
  return resendEmailBatch(eventIds, userId);
}

/**
 * Resend all failed emails for a sync run
 */
export async function resendSyncRunEmails(
  syncRunId: string,
  userId?: string
): Promise<ReturnType<typeof resendEmailBatch>> {
  const { data: failedEmails } = await supabase
    .from('email_events')
    .select('id')
    .eq('sync_run_id', syncRunId)
    .in('status', ['failed', 'bounced']);

  if (!failedEmails || failedEmails.length === 0) {
    return {
      total: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      results: [],
    };
  }

  const eventIds = failedEmails.map(e => e.id);
  return resendEmailBatch(eventIds, userId);
}

/**
 * Get resend recommendations
 */
export async function getResendRecommendations(): Promise<{
  failedEmails: number;
  bouncedEmails: number;
  blockedRecipients: number;
  recentFailures: any[];
}> {
  // Count failed emails in last 24 hours
  const { count: failedCount } = await supabase
    .from('email_events')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Count bounced emails in last 24 hours
  const { count: bouncedCount } = await supabase
    .from('email_events')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'bounced')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Count blocked recipients (Do Not Contact)
  const { count: blockedCount } = await supabase
    .from('do_not_contact')
    .select('*', { count: 'exact', head: true });

  // Get recent failures
  const { data: recentFailures } = await supabase
    .from('email_events')
    .select('*')
    .in('status', ['failed', 'bounced'])
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    failedEmails: failedCount || 0,
    bouncedEmails: bouncedCount || 0,
    blockedRecipients: blockedCount || 0,
    recentFailures: recentFailures || [],
  };
}

// CLI for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const id = process.argv[3];

  switch (command) {
    case 'resend':
      if (!id) {
        console.error('Usage: npx tsx src/email-resend.ts resend <event-id> [user-id]');
        process.exit(1);
      }
      resendEmail(id, process.argv[4]).then(result => {
        console.log('Result:', result);
      });
      break;

    case 'resend-task':
      if (!id) {
        console.error('Usage: npx tsx src/email-resend.ts resend-task <task-id>');
        process.exit(1);
      }
      resendTaskEmails(id).then(result => {
        console.log('Batch result:', result);
      });
      break;

    case 'resend-sync':
      if (!id) {
        console.error('Usage: npx tsx src/email-resend.ts resend-sync <sync-run-id>');
        process.exit(1);
      }
      resendSyncRunEmails(id).then(result => {
        console.log('Batch result:', result);
      });
      break;

    case 'recommendations':
      getResendRecommendations().then(recs => {
        console.log('Resend Recommendations:');
        console.log(`  Failed emails (24h): ${recs.failedEmails}`);
        console.log(`  Bounced emails (24h): ${recs.bouncedEmails}`);
        console.log(`  Blocked recipients (DNC): ${recs.blockedRecipients}`);
        console.log(`\nRecent failures:`);
        recs.recentFailures.forEach(f => {
          console.log(`  ${f.recipient} - ${f.subject} (${f.error_message})`);
        });
      });
      break;

    default:
      console.log('Usage:');
      console.log('  npx tsx src/email-resend.ts resend <event-id>');
      console.log('  npx tsx src/email-resend.ts resend-task <task-id>');
      console.log('  npx tsx src/email-resend.ts resend-sync <sync-run-id>');
      console.log('  npx tsx src/email-resend.ts recommendations');
  }
}
