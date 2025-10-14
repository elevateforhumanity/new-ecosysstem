# Email Resend Setup Guide

## Quick Start

Follow these steps to set up the email resend system with RBAC and Do Not Contact features.

## Prerequisites

- PostgreSQL database with Supabase
- Admin access to the database
- Node.js and npm installed
- Admin user account in the system

## Installation Steps

### 1. Apply Database Migrations

Run the SQL migrations in order:

```bash
# Navigate to SQL directory
cd google-classroom-autopilot/sql

# Apply the RBAC and DNC migration
psql -d your_database_name -f 06_do_not_contact_and_rbac.sql
```

**What this does:**
- Creates `do_not_contact` table
- Adds new columns to `email_events` table
- Creates helper functions (is_email_blocked, add_to_do_not_contact, etc.)
- Sets up RLS policies
- Creates admin dashboard views
- Adds auto-DNC trigger for bounces/complaints

### 2. Verify Migration

```bash
# Run the test suite
psql -d your_database_name -f test_rbac_dnc.sql
```

Expected output:
- ✅ All functions created successfully
- ✅ DNC table accessible
- ✅ Triggers working
- ✅ Views returning data

### 3. Configure Environment

Add to your `.env` file:

```bash
# Optional: Set cooldown period (default: 720 minutes = 12 hours)
EMAIL_RESEND_COOLDOWN_MIN=720
```

### 4. Set Up Admin User

Ensure your admin user has the correct role:

```sql
-- Update user metadata to set admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-admin@example.com';
```

Verify admin status:

```sql
SELECT is_admin(id) FROM auth.users WHERE email = 'your-admin@example.com';
-- Should return: TRUE
```

### 5. Build and Deploy Frontend

```bash
# Install dependencies (if not already done)
npm install

# Build the application
npm run build

# Start development server
npm run dev
```

### 6. Access Admin Panels

Navigate to:
- **Email Events:** `/admin/email-events` - View and resend emails
- **Do Not Contact:** `/admin/do-not-contact` - Manage blocked emails

## Verification Checklist

### Database

- [ ] `do_not_contact` table exists
- [ ] `email_events` has new columns (blocked_by_dnc, resend_count, etc.)
- [ ] Function `is_email_blocked` works
- [ ] Function `add_to_do_not_contact` works
- [ ] Function `can_resend_email` works
- [ ] Function `is_admin` works
- [ ] View `v_dnc_stats` returns data
- [ ] View `v_email_admin_dashboard` returns data
- [ ] Trigger `email_events_auto_dnc` is active

### Backend

- [ ] `resendEmail` function accepts userId parameter
- [ ] Admin check is performed before resend
- [ ] DNC check is performed before resend
- [ ] Resend count is incremented
- [ ] Audit logs are created

### Frontend

- [ ] EmailEventsPanel shows DNC indicators
- [ ] Resend buttons only visible to admins
- [ ] Resend count displayed
- [ ] Alert messages show success/error
- [ ] DoNotContactPanel accessible
- [ ] Can add/remove DNC entries

## Testing

### Test Admin Access

1. Log in as admin user
2. Navigate to Email Events panel
3. Verify "Resend" buttons are visible for failed/bounced emails
4. Log in as non-admin user
5. Verify "Admin only" message instead of buttons

### Test DNC Blocking

1. Add an email to DNC list:
   ```sql
   SELECT add_to_do_not_contact('test@example.com', 'admin_block', 'Testing');
   ```

2. Create a failed email for that address:
   ```sql
   INSERT INTO email_events (recipient, subject, email_type, provider, status)
   VALUES ('test@example.com', 'Test', 'test', 'resend', 'failed');
   ```

3. Try to resend - should show "Blocked (DNC)"

### Test Resend Functionality

1. Find a failed email in the panel
2. Click "Resend" button
3. Verify success message appears
4. Check that resend_count incremented
5. Verify new email event created

### Test Auto-DNC

1. Create a sent email:
   ```sql
   INSERT INTO email_events (recipient, subject, email_type, provider, status)
   VALUES ('bounce@example.com', 'Test', 'test', 'resend', 'sent');
   ```

2. Simulate a bounce:
   ```sql
   UPDATE email_events
   SET status = 'bounced', bounced_at = NOW()
   WHERE recipient = 'bounce@example.com';
   ```

3. Verify email added to DNC:
   ```sql
   SELECT * FROM do_not_contact WHERE email = 'bounce@example.com';
   ```

## Troubleshooting

### "Permission denied" errors

**Problem:** User cannot resend emails

**Solution:**
1. Check admin status: `SELECT is_admin('user-id')`
2. Update user role if needed (see step 4 above)
3. Verify RLS policies are enabled

### Resend button not showing

**Problem:** Button missing even for admin

**Solution:**
1. Check email status (must be 'failed' or 'bounced')
2. Verify not on DNC list
3. Check resend_count < 3
4. Check browser console for errors

### Auto-DNC not working

**Problem:** Bounced emails not added to DNC

**Solution:**
1. Verify trigger exists: `\d email_events`
2. Check trigger function: `\df auto_add_to_dnc`
3. Review PostgreSQL logs
4. Test trigger manually

### Build errors

**Problem:** TypeScript compilation errors

**Solution:**
1. Check import paths in EmailEventsPanel.tsx
2. Verify email-resend.ts exists
3. Run `npm install` to ensure dependencies
4. Clear build cache: `rm -rf dist && npm run build`

## Configuration Options

### Cooldown Period

Adjust the cooldown between resend attempts:

```sql
-- Set to 6 hours (360 minutes)
ALTER DATABASE your_database SET app.email_resend_cooldown_min = '360';

-- Set to 24 hours (1440 minutes)
ALTER DATABASE your_database SET app.email_resend_cooldown_min = '1440';
```

### Maximum Resend Attempts

Currently hardcoded to 3. To change, update the `can_resend_email` function:

```sql
-- Find this line in the function:
IF v_event.resend_count >= 3 THEN

-- Change to desired limit:
IF v_event.resend_count >= 5 THEN
```

### Auto-DNC Behavior

To disable auto-DNC for bounces (not recommended):

```sql
DROP TRIGGER IF EXISTS email_events_auto_dnc ON email_events;
```

To re-enable:

```sql
CREATE TRIGGER email_events_auto_dnc
  BEFORE UPDATE ON email_events
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_to_dnc();
```

## Monitoring

### Daily Checks

```sql
-- Check DNC list growth
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_entries
FROM do_not_contact
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Check resend activity
SELECT 
  DATE(last_resend_at) as date,
  COUNT(*) as resends
FROM email_events
WHERE last_resend_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(last_resend_at)
ORDER BY date DESC;

-- Check failed emails
SELECT COUNT(*) as failed_emails
FROM email_events
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '24 hours';
```

### Alerts

Set up alerts for:
- DNC list growing too fast (>100 per day)
- High failure rate (>10% of sends)
- Many resend attempts (>50 per day)
- Emails hitting max resend limit

## Maintenance

### Weekly Tasks

1. Review DNC list for false positives
2. Check resend success rates
3. Analyze failure patterns
4. Clean up old test data

### Monthly Tasks

1. Export DNC list for backup
2. Review and update cooldown settings
3. Analyze email deliverability trends
4. Update documentation

### Quarterly Tasks

1. Audit admin access
2. Review RLS policies
3. Performance optimization
4. Compliance review

## Support

If you encounter issues:

1. Check the logs: `tail -f /var/log/postgresql/postgresql.log`
2. Review audit logs: `SELECT * FROM audit_logs WHERE action = 'email_resent' ORDER BY created_at DESC LIMIT 10`
3. Test database functions manually
4. Check frontend console for errors
5. Verify environment variables

## Next Steps

After setup:

1. ✅ Test with real failed emails
2. ✅ Train admins on new features
3. ✅ Set up monitoring dashboards
4. ✅ Document your specific workflows
5. ✅ Schedule regular maintenance

## Additional Resources

- [Full Documentation](./EMAIL_RESEND_RBAC_DNC.md)
- [Test Suite](../google-classroom-autopilot/sql/test_rbac_dnc.sql)
- [SQL Migration](../google-classroom-autopilot/sql/06_do_not_contact_and_rbac.sql)

## Success Criteria

Your setup is complete when:

- ✅ Admin users can resend failed emails
- ✅ Non-admin users see "Admin only" message
- ✅ Bounced emails automatically added to DNC
- ✅ DNC list prevents resending
- ✅ Resend count tracked correctly
- ✅ Cooldown period enforced
- ✅ Maximum attempts enforced
- ✅ All actions logged for audit

Congratulations! Your email resend system with RBAC and DNC is now operational. 🎉
