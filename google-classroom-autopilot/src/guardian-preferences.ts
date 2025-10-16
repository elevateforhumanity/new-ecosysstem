/**
 * Guardian Email Preferences & Opt-Out System
 * 
 * Allows guardians to:
 * - Opt out of weekly digests
 * - Opt out of all emails
 * - Set email frequency preferences
 * - Manage notification types
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface GuardianPreferences {
  guardian_email: string;
  student_id?: string;
  opted_out: boolean;
  opted_out_at?: Date;
  email_frequency: 'weekly' | 'daily' | 'never';
  notification_types: {
    missing_assignments: boolean;
    grade_updates: boolean;
    course_announcements: boolean;
    attendance_alerts: boolean;
  };
  unsubscribe_token: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Generate secure unsubscribe token
 */
export function generateUnsubscribeToken(email: string, studentId?: string): string {
  const data = `${email}:${studentId || 'all'}:${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Get or create guardian preferences
 */
export async function getGuardianPreferences(
  email: string,
  studentId?: string
): Promise<GuardianPreferences | null> {
  const query = supabase
    .from('guardian_preferences')
    .select('*')
    .eq('guardian_email', email);

  if (studentId) {
    query.eq('student_id', studentId);
  } else {
    query.is('student_id', null);
  }

  const { data, error } = await query.single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found, which is ok
    console.error('Error fetching guardian preferences:', error);
    return null;
  }

  if (!data) {
    // Create default preferences
    return await createGuardianPreferences(email, studentId);
  }

  return data;
}

/**
 * Create default guardian preferences
 */
export async function createGuardianPreferences(
  email: string,
  studentId?: string
): Promise<GuardianPreferences> {
  const preferences: Partial<GuardianPreferences> = {
    guardian_email: email,
    student_id: studentId,
    opted_out: false,
    email_frequency: 'weekly',
    notification_types: {
      missing_assignments: true,
      grade_updates: true,
      course_announcements: true,
      attendance_alerts: true,
    },
    unsubscribe_token: generateUnsubscribeToken(email, studentId),
  };

  const { data, error } = await supabase
    .from('guardian_preferences')
    .insert(preferences)
    .select()
    .single();

  if (error) {
    console.error('Error creating guardian preferences:', error);
    throw error;
  }

  return data;
}

/**
 * Check if guardian should receive emails
 */
export async function shouldSendToGuardian(
  email: string,
  studentId?: string,
  notificationType: keyof GuardianPreferences['notification_types'] = 'missing_assignments'
): Promise<boolean> {
  const prefs = await getGuardianPreferences(email, studentId);

  if (!prefs) {
    // No preferences = send (opt-in by default)
    return true;
  }

  // Check if opted out
  if (prefs.opted_out) {
    return false;
  }

  // Check if email frequency allows sending
  if (prefs.email_frequency === 'never') {
    return false;
  }

  // Check if specific notification type is enabled
  if (!prefs.notification_types[notificationType]) {
    return false;
  }

  return true;
}

/**
 * Opt out guardian from emails
 */
export async function optOutGuardian(
  email: string,
  studentId?: string,
  token?: string
): Promise<{ success: boolean; message: string }> {
  // Verify token if provided
  if (token) {
    const prefs = await getGuardianPreferences(email, studentId);
    if (!prefs || prefs.unsubscribe_token !== token) {
      return {
        success: false,
        message: 'Invalid unsubscribe token',
      };
    }
  }

  const query = supabase
    .from('guardian_preferences')
    .update({
      opted_out: true,
      opted_out_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('guardian_email', email);

  if (studentId) {
    query.eq('student_id', studentId);
  }

  const { error } = await query;

  if (error) {
    console.error('Error opting out guardian:', error);
    return {
      success: false,
      message: 'Failed to opt out',
    };
  }

  return {
    success: true,
    message: 'Successfully opted out of emails',
  };
}

/**
 * Opt in guardian to emails
 */
export async function optInGuardian(
  email: string,
  studentId?: string
): Promise<{ success: boolean; message: string }> {
  const query = supabase
    .from('guardian_preferences')
    .update({
      opted_out: false,
      opted_out_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('guardian_email', email);

  if (studentId) {
    query.eq('student_id', studentId);
  }

  const { error } = await query;

  if (error) {
    console.error('Error opting in guardian:', error);
    return {
      success: false,
      message: 'Failed to opt in',
    };
  }

  return {
    success: true,
    message: 'Successfully opted in to emails',
  };
}

/**
 * Update guardian preferences
 */
export async function updateGuardianPreferences(
  email: string,
  studentId: string | undefined,
  updates: Partial<GuardianPreferences>
): Promise<{ success: boolean; message: string }> {
  const query = supabase
    .from('guardian_preferences')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('guardian_email', email);

  if (studentId) {
    query.eq('student_id', studentId);
  }

  const { error } = await query;

  if (error) {
    console.error('Error updating guardian preferences:', error);
    return {
      success: false,
      message: 'Failed to update preferences',
    };
  }

  return {
    success: true,
    message: 'Preferences updated successfully',
  };
}

/**
 * Get unsubscribe URL
 */
export function getUnsubscribeUrl(email: string, studentId?: string, token?: string): string {
  const baseUrl = process.env.APP_URL || 'https://elevateforhumanity.org';
  const params = new URLSearchParams({
    email,
    ...(studentId && { student: studentId }),
    ...(token && { token }),
  });
  return `${baseUrl}/unsubscribe?${params.toString()}`;
}

/**
 * Get preferences management URL
 */
export function getPreferencesUrl(email: string, studentId?: string, token?: string): string {
  const baseUrl = process.env.APP_URL || 'https://elevateforhumanity.org';
  const params = new URLSearchParams({
    email,
    ...(studentId && { student: studentId }),
    ...(token && { token }),
  });
  return `${baseUrl}/email-preferences?${params.toString()}`;
}

/**
 * Filter guardian emails based on preferences
 */
export async function filterGuardianEmails(
  guardianEmails: Array<{ email: string; studentId?: string }>,
  notificationType: keyof GuardianPreferences['notification_types'] = 'missing_assignments'
): Promise<string[]> {
  const filtered: string[] = [];

  for (const guardian of guardianEmails) {
    const shouldSend = await shouldSendToGuardian(
      guardian.email,
      guardian.studentId,
      notificationType
    );

    if (shouldSend) {
      filtered.push(guardian.email);
    } else {
      console.log(`⏭️  Skipping ${guardian.email} (opted out or preferences)`);
    }
  }

  return filtered;
}

/**
 * Add unsubscribe footer to email HTML
 */
export function addUnsubscribeFooter(
  html: string,
  email: string,
  studentId?: string,
  token?: string
): string {
  const unsubscribeUrl = getUnsubscribeUrl(email, studentId, token);
  const preferencesUrl = getPreferencesUrl(email, studentId, token);

  const footer = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
      <p>You're receiving this email because you're listed as a guardian for a student at Elevate for Humanity.</p>
      <p>
        <a href="${preferencesUrl}" style="color: #4285f4; text-decoration: none;">Manage Email Preferences</a>
        |
        <a href="${unsubscribeUrl}" style="color: #666; text-decoration: none;">Unsubscribe</a>
      </p>
      <p style="margin-top: 10px;">
        Elevate for Humanity<br>
        <a href="mailto:info@elevateforhumanity.org" style="color: #666;">info@elevateforhumanity.org</a>
      </p>
    </div>
  `;

  // Insert footer before closing body tag
  return html.replace('</body>', `${footer}</body>`);
}

// CLI for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const email = process.argv[3];
  const studentId = process.argv[4];

  switch (command) {
    case 'check':
      if (!email) {
        console.error('Usage: npx tsx src/guardian-preferences.ts check <email> [studentId]');
        process.exit(1);
      }
      shouldSendToGuardian(email, studentId).then(should => {
        console.log(`Should send to ${email}:`, should);
      });
      break;

    case 'opt-out':
      if (!email) {
        console.error('Usage: npx tsx src/guardian-preferences.ts opt-out <email> [studentId]');
        process.exit(1);
      }
      optOutGuardian(email, studentId).then(result => {
        console.log(result.message);
      });
      break;

    case 'opt-in':
      if (!email) {
        console.error('Usage: npx tsx src/guardian-preferences.ts opt-in <email> [studentId]');
        process.exit(1);
      }
      optInGuardian(email, studentId).then(result => {
        console.log(result.message);
      });
      break;

    default:
      console.log('Usage:');
      console.log('  npx tsx src/guardian-preferences.ts check <email> [studentId]');
      console.log('  npx tsx src/guardian-preferences.ts opt-out <email> [studentId]');
      console.log('  npx tsx src/guardian-preferences.ts opt-in <email> [studentId]');
  }
}
