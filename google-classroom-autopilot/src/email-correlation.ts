/**
 * Email Correlation Tracking
 * 
 * Links emails to tasks, sync runs, and content for complete traceability
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Generate unique correlation ID
 */
export function generateCorrelationId(prefix: string = 'email'): string {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Get all emails for a task
 */
export async function getEmailsForTask(taskId: string) {
  const { data, error } = await supabase
    .from('email_events')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching emails for task:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all emails for a sync run
 */
export async function getEmailsForSyncRun(syncRunId: string) {
  const { data, error } = await supabase
    .from('email_events')
    .select('*')
    .eq('sync_run_id', syncRunId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching emails for sync run:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all emails for a content item (course, coursework, etc.)
 */
export async function getEmailsForContent(contentId: string) {
  const { data, error } = await supabase
    .from('email_events')
    .select('*')
    .eq('content_id', contentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching emails for content:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all emails in a correlation group
 */
export async function getEmailsByCorrelation(correlationId: string) {
  const { data, error } = await supabase
    .from('email_events')
    .select('*')
    .eq('correlation_id', correlationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching emails by correlation:', error);
    return [];
  }

  return data || [];
}

/**
 * Get email thread (parent and all children)
 */
export async function getEmailThread(eventId: string) {
  // Get the root email
  const { data: rootEmail } = await supabase
    .from('email_events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (!rootEmail) return [];

  // If this email has a parent, get the root
  let root = rootEmail;
  if (rootEmail.parent_event_id) {
    const { data: parentEmail } = await supabase
      .from('email_events')
      .select('*')
      .eq('id', rootEmail.parent_event_id)
      .single();

    if (parentEmail) {
      root = parentEmail;
    }
  }

  // Get all emails in the thread
  const { data: thread } = await supabase
    .from('email_events')
    .select('*')
    .or(`id.eq.${root.id},parent_event_id.eq.${root.id}`)
    .order('created_at', { ascending: true });

  return thread || [];
}

/**
 * Get email statistics for a task
 */
export async function getTaskEmailStats(taskId: string) {
  const { data } = await supabase
    .from('email_events')
    .select('status')
    .eq('task_id', taskId);

  if (!data) return null;

  const stats = {
    total: data.length,
    queued: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    complained: 0,
    failed: 0,
  };

  data.forEach(event => {
    if (event.status in stats) {
      stats[event.status as keyof typeof stats]++;
    }
  });

  return stats;
}

/**
 * Get email statistics for a sync run
 */
export async function getSyncRunEmailStats(syncRunId: string) {
  const { data } = await supabase
    .from('email_events')
    .select('status')
    .eq('sync_run_id', syncRunId);

  if (!data) return null;

  const stats = {
    total: data.length,
    queued: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    complained: 0,
    failed: 0,
    deliveryRate: 0,
    openRate: 0,
  };

  data.forEach(event => {
    if (event.status in stats) {
      stats[event.status as keyof typeof stats]++;
    }
  });

  if (stats.total > 0) {
    stats.deliveryRate = Math.round((stats.delivered / stats.total) * 100);
    stats.openRate = stats.delivered > 0 ? Math.round((stats.opened / stats.delivered) * 100) : 0;
  }

  return stats;
}

/**
 * Link email to task
 */
export async function linkEmailToTask(eventId: string, taskId: string) {
  const { error } = await supabase
    .from('email_events')
    .update({ task_id: taskId })
    .eq('id', eventId);

  if (error) {
    console.error('Error linking email to task:', error);
    return false;
  }

  return true;
}

/**
 * Link email to sync run
 */
export async function linkEmailToSyncRun(eventId: string, syncRunId: string) {
  const { error } = await supabase
    .from('email_events')
    .update({ sync_run_id: syncRunId })
    .eq('id', eventId);

  if (error) {
    console.error('Error linking email to sync run:', error);
    return false;
  }

  return true;
}

/**
 * Link email to content
 */
export async function linkEmailToContent(eventId: string, contentId: string) {
  const { error } = await supabase
    .from('email_events')
    .update({ content_id: contentId })
    .eq('id', eventId);

  if (error) {
    console.error('Error linking email to content:', error);
    return false;
  }

  return true;
}

/**
 * Create email correlation group
 */
export async function createEmailCorrelation(eventIds: string[], correlationId?: string) {
  const id = correlationId || generateCorrelationId();

  const { error } = await supabase
    .from('email_events')
    .update({ correlation_id: id })
    .in('id', eventIds);

  if (error) {
    console.error('Error creating email correlation:', error);
    return null;
  }

  return id;
}

/**
 * Get email delivery timeline for a task
 */
export async function getTaskEmailTimeline(taskId: string) {
  const { data } = await supabase
    .from('email_events')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (!data) return [];

  return data.map(event => ({
    timestamp: event.created_at,
    recipient: event.recipient,
    status: event.status,
    provider: event.provider,
    messageId: event.provider_message_id,
    error: event.error_message,
  }));
}

/**
 * Find related emails (same student, same type, recent)
 */
export async function findRelatedEmails(
  studentId: string,
  emailType: string,
  daysBack: number = 7
) {
  const { data } = await supabase
    .from('email_events')
    .select('*')
    .eq('student_id', studentId)
    .eq('email_type', emailType)
    .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  return data || [];
}

// CLI for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const id = process.argv[3];

  switch (command) {
    case 'task':
      if (!id) {
        console.error('Usage: npx tsx src/email-correlation.ts task <task-id>');
        process.exit(1);
      }
      Promise.all([getEmailsForTask(id), getTaskEmailStats(id)]).then(([emails, stats]) => {
        console.log('Emails:', emails.length);
        console.log('Stats:', stats);
      });
      break;

    case 'sync':
      if (!id) {
        console.error('Usage: npx tsx src/email-correlation.ts sync <sync-run-id>');
        process.exit(1);
      }
      Promise.all([getEmailsForSyncRun(id), getSyncRunEmailStats(id)]).then(([emails, stats]) => {
        console.log('Emails:', emails.length);
        console.log('Stats:', stats);
      });
      break;

    case 'content':
      if (!id) {
        console.error('Usage: npx tsx src/email-correlation.ts content <content-id>');
        process.exit(1);
      }
      getEmailsForContent(id).then(emails => {
        console.log('Emails:', emails.length);
        emails.forEach(e => {
          console.log(`  ${e.recipient} - ${e.status} - ${e.created_at}`);
        });
      });
      break;

    case 'correlation':
      if (!id) {
        console.error('Usage: npx tsx src/email-correlation.ts correlation <correlation-id>');
        process.exit(1);
      }
      getEmailsByCorrelation(id).then(emails => {
        console.log('Emails in correlation group:', emails.length);
        emails.forEach(e => {
          console.log(`  ${e.recipient} - ${e.status} - ${e.created_at}`);
        });
      });
      break;

    case 'thread':
      if (!id) {
        console.error('Usage: npx tsx src/email-correlation.ts thread <event-id>');
        process.exit(1);
      }
      getEmailThread(id).then(thread => {
        console.log('Email thread:', thread.length, 'messages');
        thread.forEach(e => {
          console.log(`  ${e.created_at} - ${e.recipient} - ${e.status}`);
        });
      });
      break;

    default:
      console.log('Usage:');
      console.log('  npx tsx src/email-correlation.ts task <task-id>');
      console.log('  npx tsx src/email-correlation.ts sync <sync-run-id>');
      console.log('  npx tsx src/email-correlation.ts content <content-id>');
      console.log('  npx tsx src/email-correlation.ts correlation <correlation-id>');
      console.log('  npx tsx src/email-correlation.ts thread <event-id>');
  }
}
