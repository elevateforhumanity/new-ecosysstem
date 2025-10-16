-- Test Script for RBAC and Do Not Contact Features
-- Run this after applying 06_do_not_contact_and_rbac.sql

-- ============================================================================
-- 1. Test Do Not Contact Functions
-- ============================================================================

-- Test: Check if email is blocked (should return FALSE for new email)
SELECT is_email_blocked('test@example.com') as is_blocked;

-- Test: Add email to DNC list
SELECT add_to_do_not_contact(
  'spam@example.com',
  'spam_complaint',
  'User marked our email as spam'
) as dnc_id;

-- Test: Check if email is now blocked (should return TRUE)
SELECT is_email_blocked('spam@example.com') as is_blocked;

-- Test: Add temporary block (expires in 1 hour)
SELECT add_to_do_not_contact(
  'temp@example.com',
  'admin_block',
  'Temporary block for testing',
  NOW() + INTERVAL '1 hour'
) as dnc_id;

-- Test: View all DNC entries
SELECT 
  email,
  reason,
  reason_details,
  added_by_email,
  created_at,
  expires_at,
  CASE 
    WHEN expires_at IS NULL THEN 'Permanent'
    WHEN expires_at > NOW() THEN 'Active (expires ' || expires_at::text || ')'
    ELSE 'Expired'
  END as status
FROM do_not_contact
ORDER BY created_at DESC;

-- Test: View DNC statistics
SELECT * FROM v_dnc_stats;

-- ============================================================================
-- 2. Test Admin Role Checking
-- ============================================================================

-- Test: Check if current user is admin (replace with actual user ID)
-- SELECT is_admin('your-user-id-here') as is_admin;

-- Test: Check if NULL user is admin (should return FALSE)
SELECT is_admin(NULL) as is_admin;

-- ============================================================================
-- 3. Test Email Resend Eligibility
-- ============================================================================

-- First, create a test failed email event
INSERT INTO email_events (
  recipient,
  subject,
  email_type,
  provider,
  status,
  error_message,
  sent_at,
  failed_at
) VALUES (
  'failed@example.com',
  'Test Failed Email',
  'test',
  'resend',
  'failed',
  'Test error message',
  NOW(),
  NOW()
) RETURNING id;

-- Save the returned ID and use it below (replace 'event-id-here')

-- Test: Check if email can be resent (replace with actual event ID and user ID)
-- SELECT * FROM can_resend_email('event-id-here', 'user-id-here');

-- Test: Check resend eligibility for blocked email
INSERT INTO email_events (
  recipient,
  subject,
  email_type,
  provider,
  status,
  error_message,
  sent_at,
  failed_at
) VALUES (
  'spam@example.com',  -- This is on DNC list
  'Test Blocked Email',
  'test',
  'resend',
  'failed',
  'Test error message',
  NOW(),
  NOW()
) RETURNING id;

-- Test: Check if blocked email can be resent (should return FALSE with DNC reason)
-- SELECT * FROM can_resend_email('blocked-event-id-here', 'user-id-here');

-- ============================================================================
-- 4. Test Auto-DNC Trigger
-- ============================================================================

-- Create a test email that will bounce
INSERT INTO email_events (
  recipient,
  subject,
  email_type,
  provider,
  status,
  sent_at
) VALUES (
  'bounce-test@example.com',
  'Test Bounce Email',
  'test',
  'resend',
  'sent',
  NOW()
) RETURNING id;

-- Simulate a bounce by updating status
UPDATE email_events 
SET 
  status = 'bounced',
  bounced_at = NOW(),
  error_message = 'Mailbox does not exist'
WHERE recipient = 'bounce-test@example.com';

-- Check if email was auto-added to DNC
SELECT 
  email,
  reason,
  reason_details
FROM do_not_contact
WHERE email = 'bounce-test@example.com';

-- Check if event was marked as blocked
SELECT 
  recipient,
  status,
  blocked_by_dnc
FROM email_events
WHERE recipient = 'bounce-test@example.com';

-- ============================================================================
-- 5. Test Admin Dashboard View
-- ============================================================================

-- View emails that can be resent
SELECT 
  recipient,
  subject,
  status,
  blocked_by_dnc,
  resend_count,
  can_resend,
  dnc_reason
FROM v_email_admin_dashboard
WHERE status IN ('failed', 'bounced')
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 6. Test Resend Tracking
-- ============================================================================

-- Simulate a resend by updating counters
UPDATE email_events
SET 
  resend_count = 1,
  last_resend_at = NOW()
WHERE recipient = 'failed@example.com';

-- Check updated event
SELECT 
  recipient,
  status,
  resend_count,
  last_resend_at,
  blocked_by_dnc
FROM email_events
WHERE recipient = 'failed@example.com';

-- ============================================================================
-- 7. Test Cooldown Period
-- ============================================================================

-- Try to check resend eligibility immediately after resend (should fail due to cooldown)
-- SELECT * FROM can_resend_email('event-id-with-recent-resend', 'user-id-here');

-- ============================================================================
-- 8. Test Maximum Resend Attempts
-- ============================================================================

-- Simulate 3 resend attempts
UPDATE email_events
SET resend_count = 3
WHERE recipient = 'failed@example.com';

-- Check if can still resend (should return FALSE - max attempts reached)
-- SELECT * FROM can_resend_email('event-id-with-3-resends', 'user-id-here');

-- ============================================================================
-- 9. Cleanup Test Data
-- ============================================================================

-- Remove test DNC entries
DELETE FROM do_not_contact WHERE email IN (
  'spam@example.com',
  'temp@example.com',
  'bounce-test@example.com'
);

-- Remove test email events
DELETE FROM email_events WHERE email_type = 'test';

-- Verify cleanup
SELECT COUNT(*) as remaining_test_dnc FROM do_not_contact WHERE reason_details LIKE '%test%';
SELECT COUNT(*) as remaining_test_events FROM email_events WHERE email_type = 'test';

-- ============================================================================
-- 10. Summary Report
-- ============================================================================

SELECT 
  'Total DNC Entries' as metric,
  COUNT(*)::text as value
FROM do_not_contact

UNION ALL

SELECT 
  'Failed Emails (Last 24h)',
  COUNT(*)::text
FROM email_events
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'Bounced Emails (Last 24h)',
  COUNT(*)::text
FROM email_events
WHERE status = 'bounced'
  AND created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'Emails Blocked by DNC',
  COUNT(*)::text
FROM email_events
WHERE blocked_by_dnc = TRUE

UNION ALL

SELECT 
  'Emails Resent (>0 attempts)',
  COUNT(*)::text
FROM email_events
WHERE resend_count > 0;

-- ============================================================================
-- Expected Results Summary
-- ============================================================================

/*
EXPECTED RESULTS:

1. is_email_blocked('test@example.com') -> FALSE
2. is_email_blocked('spam@example.com') -> TRUE (after adding to DNC)
3. Auto-DNC trigger should add bounced emails to DNC list
4. can_resend_email should return FALSE for:
   - Non-admin users
   - Emails on DNC list
   - Emails within cooldown period
   - Emails with 3+ resend attempts
   - Emails with status other than 'failed' or 'bounced'
5. can_resend_email should return TRUE for:
   - Admin users
   - Failed/bounced emails not on DNC
   - Emails outside cooldown period
   - Emails with <3 resend attempts

SECURITY CHECKS:
- Only admins can call resend functions
- RLS policies prevent non-admins from modifying DNC list
- All resend attempts are logged with user_id
- DNC list is automatically updated on bounces/complaints
*/
