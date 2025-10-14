# Email Resend with RBAC and Do Not Contact

## Overview

This feature adds role-based access control (RBAC) and Do Not Contact (DNC) list management to the email resend system. It ensures that only administrators can resend emails and prevents sending to blocked recipients.

## Features

### 1. Role-Based Access Control (RBAC)

- **Admin-Only Resend**: Only users with the `admin` role can resend failed/bounced emails
- **UI Guards**: Resend buttons are hidden for non-admin users
- **API Validation**: Backend validates admin status before processing resend requests
- **Audit Logging**: All resend attempts are logged with the admin user ID

### 2. Do Not Contact (DNC) List

- **Automatic Blocking**: Emails that hard bounce or generate spam complaints are automatically added to the DNC list
- **Manual Management**: Admins can manually add/remove emails from the DNC list
- **Reason Tracking**: Each DNC entry includes a reason (user request, hard bounce, spam complaint, admin block, legal requirement)
- **Temporary Blocks**: Support for time-limited blocks with expiration dates
- **Permanent Blocks**: Emails can be permanently blocked

### 3. Safety Checks

- **Cooldown Period**: Default 12-hour cooldown between resend attempts (configurable)
- **Maximum Attempts**: Maximum of 3 resend attempts per email
- **Status Validation**: Only failed or bounced emails can be resent
- **DNC Validation**: Emails on the DNC list cannot be resent
- **Idempotency**: Prevents duplicate resend requests

## Database Schema

### New Tables

#### `do_not_contact`
```sql
CREATE TABLE do_not_contact (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  reason TEXT CHECK (reason IN (
    'user_request',
    'hard_bounce',
    'spam_complaint',
    'admin_block',
    'legal_requirement'
  )),
  reason_details TEXT,
  added_by UUID REFERENCES auth.users(id),
  added_by_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

### Updated Tables

#### `email_events` (new columns)
- `blocked_by_dnc BOOLEAN` - TRUE if email was blocked by DNC list
- `resend_count INTEGER` - Number of times email has been resent
- `last_resend_at TIMESTAMPTZ` - Timestamp of last resend attempt
- `resend_by UUID` - Admin user who triggered the resend

## Database Functions

### `is_email_blocked(p_email TEXT)`
Check if an email address is on the Do Not Contact list.

```sql
SELECT is_email_blocked('user@example.com');
-- Returns: TRUE or FALSE
```

### `add_to_do_not_contact(p_email, p_reason, p_reason_details, p_expires_at)`
Add an email to the Do Not Contact list.

```sql
SELECT add_to_do_not_contact(
  'spam@example.com',
  'spam_complaint',
  'User marked email as spam',
  NULL  -- No expiration (permanent)
);
```

### `remove_from_do_not_contact(p_email TEXT)`
Remove an email from the Do Not Contact list.

```sql
SELECT remove_from_do_not_contact('user@example.com');
-- Returns: TRUE if removed, FALSE if not found
```

### `is_admin(p_user_id UUID)`
Check if a user has admin role.

```sql
SELECT is_admin('user-uuid-here');
-- Returns: TRUE or FALSE
```

### `can_resend_email(p_event_id UUID, p_user_id UUID)`
Check if an email can be resent with comprehensive validation.

```sql
SELECT * FROM can_resend_email('event-uuid', 'user-uuid');
-- Returns: { can_resend: BOOLEAN, reason: TEXT }
```

## Database Views

### `v_dnc_stats`
Statistics about the Do Not Contact list.

```sql
SELECT * FROM v_dnc_stats;
```

### `v_email_admin_dashboard`
Admin dashboard view with resend eligibility.

```sql
SELECT * FROM v_email_admin_dashboard
WHERE can_resend = TRUE
LIMIT 10;
```

## API Usage

### TypeScript/JavaScript

```typescript
import { resendEmail } from './google-classroom-autopilot/src/email-resend';

// Resend a single email
const result = await resendEmail(eventId, userId);

if (result.success) {
  console.log(`Email resent to ${result.recipient}`);
} else if (result.skipped) {
  console.log(`Skipped: ${result.reason}`);
} else {
  console.error(`Error: ${result.error}`);
}
```

### Response Format

```typescript
interface ResendResult {
  success: boolean;
  message: string;
  recipient?: string;
  newEventId?: string;
  skipped?: boolean;
  reason?: string;
  error?: string;
}
```

## UI Components

### EmailEventsPanel
Main admin panel for viewing email events with resend functionality.

**Features:**
- Real-time email event monitoring
- Status filtering and search
- DNC status indicators
- Resend buttons (admin only)
- Resend count tracking
- Alert messages for success/error

**Location:** `/src/components/classroom/admin/EmailEventsPanel.tsx`

### DoNotContactPanel
Admin panel for managing the Do Not Contact list.

**Features:**
- View all DNC entries
- Add emails to DNC list
- Remove emails from DNC list
- Filter by reason
- Temporary vs permanent blocks
- Statistics dashboard

**Location:** `/src/components/classroom/admin/DoNotContactPanel.tsx`

## Configuration

### Environment Variables

```bash
# Cooldown period in minutes (default: 720 = 12 hours)
EMAIL_RESEND_COOLDOWN_MIN=720
```

### Database Configuration

Set the cooldown in PostgreSQL:

```sql
ALTER DATABASE your_database SET app.email_resend_cooldown_min = '720';
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

**do_not_contact:**
- Service role: Full access
- Admins: Full access
- Users: Can view their own email status only

**email_events:**
- Service role: Full access
- Admins: Can view all events
- Users: No direct access (use views)

### Audit Logging

All resend attempts are logged to the `audit_logs` table:

```sql
{
  "action": "email_resent",
  "user_id": "admin-uuid",
  "details": {
    "original_event_id": "event-uuid",
    "new_message_id": "message-id",
    "recipient": "user@example.com",
    "reason": "manual_resend"
  }
}
```

## Automatic DNC Management

### Auto-Add Triggers

Emails are automatically added to the DNC list when:

1. **Hard Bounce**: Email bounces with permanent error
2. **Spam Complaint**: User marks email as spam

```sql
-- Trigger function
CREATE TRIGGER email_events_auto_dnc
  BEFORE UPDATE ON email_events
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_to_dnc();
```

## Testing

### Run Test Suite

```bash
# Apply migrations
psql -d your_database -f google-classroom-autopilot/sql/06_do_not_contact_and_rbac.sql

# Run tests
psql -d your_database -f google-classroom-autopilot/sql/test_rbac_dnc.sql
```

### Manual Testing

1. **Test Admin Access:**
   ```sql
   SELECT is_admin('your-user-id');
   ```

2. **Test DNC Blocking:**
   ```sql
   SELECT add_to_do_not_contact('test@example.com', 'admin_block', 'Testing');
   SELECT is_email_blocked('test@example.com');
   ```

3. **Test Resend Eligibility:**
   ```sql
   SELECT * FROM can_resend_email('event-id', 'user-id');
   ```

## Monitoring

### Key Metrics

```sql
-- DNC list size
SELECT COUNT(*) FROM do_not_contact;

-- Failed emails in last 24h
SELECT COUNT(*) FROM email_events
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '24 hours';

-- Emails blocked by DNC
SELECT COUNT(*) FROM email_events
WHERE blocked_by_dnc = TRUE;

-- Resend attempts
SELECT 
  COUNT(*) as total_resends,
  AVG(resend_count) as avg_attempts
FROM email_events
WHERE resend_count > 0;
```

### Dashboard Queries

```sql
-- Resend success rate
SELECT 
  COUNT(*) FILTER (WHERE resend_count > 0) as resent_emails,
  COUNT(*) FILTER (WHERE resend_count > 0 AND status = 'delivered') as successful_resends,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE resend_count > 0 AND status = 'delivered') / 
    NULLIF(COUNT(*) FILTER (WHERE resend_count > 0), 0),
    2
  ) as resend_success_rate
FROM email_events;
```

## Troubleshooting

### Common Issues

**Issue: Resend button not showing**
- Check if user has admin role: `SELECT is_admin('user-id')`
- Verify email status is 'failed' or 'bounced'
- Check if email is on DNC list

**Issue: "Cannot resend" error**
- Check cooldown period: Last resend must be >12 hours ago
- Check resend count: Maximum 3 attempts
- Check DNC status: Email must not be blocked

**Issue: Auto-DNC not working**
- Verify trigger is enabled: `\d email_events` in psql
- Check trigger function exists: `\df auto_add_to_dnc`
- Review error logs

### Debug Queries

```sql
-- Check resend eligibility details
SELECT 
  id,
  recipient,
  status,
  blocked_by_dnc,
  resend_count,
  last_resend_at,
  EXTRACT(EPOCH FROM (NOW() - last_resend_at))/3600 as hours_since_resend
FROM email_events
WHERE id = 'event-id';

-- Check DNC entry
SELECT * FROM do_not_contact WHERE email = 'user@example.com';

-- Check admin status
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE id = 'user-id';
```

## Migration Guide

### From Old System

1. **Apply SQL Migration:**
   ```bash
   psql -d your_database -f google-classroom-autopilot/sql/06_do_not_contact_and_rbac.sql
   ```

2. **Update Frontend:**
   - Replace old EmailEventsPanel with new version
   - Add DoNotContactPanel to admin routes
   - Update resendEmail function calls to include userId

3. **Update Backend:**
   - Update resendEmail API to use new signature
   - Add admin role checks
   - Update audit logging

4. **Test:**
   - Run test suite
   - Verify admin access
   - Test DNC blocking
   - Test resend functionality

## Best Practices

1. **Always check admin status** before showing resend UI
2. **Log all resend attempts** for audit trail
3. **Monitor DNC list growth** to identify issues
4. **Review failed emails regularly** to identify patterns
5. **Set appropriate cooldown periods** based on your use case
6. **Use temporary blocks** for testing or temporary issues
7. **Document DNC reasons** for compliance and debugging

## Compliance

### GDPR/Privacy

- Users can request to be added to DNC list (user_request reason)
- DNC list is permanent unless explicitly removed
- All email activity is logged for compliance
- Users can view their own DNC status

### CAN-SPAM

- Automatic DNC on spam complaints
- Permanent blocking of complainers
- Audit trail of all email activity

### Best Practices

- Honor unsubscribe requests immediately
- Add to DNC list on first complaint
- Never remove spam complaints from DNC
- Document legal requirements in reason_details

## Future Enhancements

- [ ] Bulk resend with rate limiting
- [ ] Scheduled resend attempts
- [ ] Email template versioning
- [ ] A/B testing for resends
- [ ] Machine learning for bounce prediction
- [ ] Integration with email validation services
- [ ] Webhook notifications for DNC additions
- [ ] Export DNC list for compliance
- [ ] Import DNC list from external sources
- [ ] DNC list synchronization across systems

## Support

For issues or questions:
1. Check this documentation
2. Review test suite results
3. Check database logs
4. Review audit logs
5. Contact system administrator

## License

This feature is part of the Elevate for Humanity platform.
