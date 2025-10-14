# LMS Identity Mapping & Auto-Unenroll

## Overview

This system provides two critical features for LMS → Google Classroom sync:

1. **Identity Mapping**: Map LMS user IDs to Google email addresses
2. **Auto-Unenroll**: Automatically remove inactive users with safety controls

## Features

### Identity Mapping
- CSV import for bulk identity mapping
- Resolve LMS user IDs to Google emails during sync
- Support for multiple LMS sources (Canvas, Moodle, Blackboard, etc.)
- Batch import with staging and validation
- Admin UI for easy management

### Auto-Unenroll
- Master switch to enable/disable
- Configurable grace period (days of inactivity)
- Protected domains and emails
- Dry-run mode for safe testing
- Automatic audit logging
- Preview candidates before enabling

## Quick Start

### 1. Run SQL Migration

```bash
psql -d your_db -f google-classroom-autopilot/sql/03_lms_identity_and_unenroll.sql
```

This creates:
- `lms_identity_map` - Identity mappings
- `lms_identity_import` - CSV import staging
- `lms_unenroll_policy` - Auto-unenroll configuration
- Functions for import, resolution, and unenroll
- Views for monitoring

### 2. Import Identity Mappings

**Option A: CLI Import**

Create a CSV file with format:
```csv
lms_source,lms_user_id,google_email,full_name
canvas,user123,student@school.edu,John Doe
moodle,456,jane@school.edu,Jane Smith
blackboard,789,bob@school.edu,Bob Johnson
```

Import:
```bash
cd google-classroom-autopilot
npx tsx src/identity-import.ts path/to/identities.csv
```

**Option B: Admin UI**

1. Navigate to Admin → Identity Mapping
2. Upload CSV file
3. Review pending batch
4. Click "Apply" to activate mappings

### 3. Configure Auto-Unenroll Policy

**Option A: SQL**

```sql
UPDATE lms_unenroll_policy SET
  auto_unenroll = FALSE,           -- Keep disabled initially
  grace_period_days = 7,            -- Days of inactivity
  protected_domains = ARRAY['school.edu', 'admin.org'],
  protected_emails = ARRAY['admin@school.edu'],
  dry_run_mode = TRUE;              -- Test mode
```

**Option B: Admin UI**

1. Navigate to Admin → Auto-Unenroll Policy
2. Configure settings:
   - Enable/disable auto-unenroll
   - Set grace period
   - Add protected domains/emails
   - Enable/disable dry-run mode
3. Click "Preview Candidates" to see who would be unenrolled
4. Save policy

### 4. Test in Dry-Run Mode

Run the sync with dry-run enabled:

```bash
cd google-classroom-autopilot
npm run lms:sync
```

Check audit logs for dry-run events:

```sql
SELECT * FROM audit_logs 
WHERE event_type = 'dry_unenroll'
ORDER BY created_at DESC
LIMIT 10;
```

### 5. Enable Live Mode

When comfortable with dry-run results:

```sql
UPDATE lms_unenroll_policy SET
  auto_unenroll = TRUE,
  dry_run_mode = FALSE;
```

Or use the Admin UI to toggle the switches.

## Identity Mapping

### How It Works

1. **CSV Upload**: Import mappings from your LMS export
2. **Staging**: Records stored in `lms_identity_import` with batch ID
3. **Validation**: Email format and required fields checked
4. **Application**: Batch applied to `lms_identity_map`
5. **Resolution**: During sync, LMS user IDs resolved to Google emails

### CSV Format

```csv
lms_source,lms_user_id,google_email,full_name
canvas,12345,student@school.edu,John Doe
canvas,67890,teacher@school.edu,Jane Smith
moodle,abc123,admin@school.edu,Bob Johnson
```

**Fields**:
- `lms_source`: LMS platform (canvas, moodle, blackboard, etc.)
- `lms_user_id`: User ID from LMS
- `google_email`: Google Workspace email
- `full_name`: (Optional) User's full name

### CLI Usage

```bash
# Import CSV
npx tsx src/identity-import.ts identities.csv

# Check summary
psql -d your_db -c "SELECT * FROM v_lms_identity_summary;"
```

### API Usage

```typescript
import { 
  importIdentityRecords, 
  applyIdentityImport,
  getIdentitySummary 
} from './identity-import';

// Import records
const records = [
  { lms_source: 'canvas', lms_user_id: '123', google_email: 'user@school.edu' }
];
const { batchId } = await importIdentityRecords(records);

// Apply batch
const result = await applyIdentityImport(batchId);
console.log(`Imported: ${result.imported}, Updated: ${result.updated}`);

// Get summary
const summary = await getIdentitySummary();
```

## Auto-Unenroll

### How It Works

1. **Policy Check**: System checks if auto-unenroll is enabled
2. **Grace Period**: Identifies users inactive beyond grace period
3. **Protection Check**: Excludes protected domains/emails
4. **Dry-Run**: Logs actions without executing (if enabled)
5. **Execution**: Updates enrollment status or removes from Classroom
6. **Audit**: All actions logged to `audit_logs`

### Policy Configuration

```sql
-- View current policy
SELECT * FROM lms_unenroll_policy;

-- Update policy
UPDATE lms_unenroll_policy SET
  auto_unenroll = TRUE,              -- Enable auto-unenroll
  grace_period_days = 14,            -- 14 days of inactivity
  protected_domains = ARRAY[
    'school.edu',                    -- Protect all @school.edu
    'admin.org'                      -- Protect all @admin.org
  ],
  protected_emails = ARRAY[
    'admin@school.edu',              -- Specific protected users
    'principal@school.edu'
  ],
  dry_run_mode = FALSE;              -- Live mode (use TRUE for testing)
```

### Preview Candidates

```sql
-- View users eligible for unenroll
SELECT * FROM v_unenroll_candidates
ORDER BY days_inactive DESC
LIMIT 20;

-- Count by LMS source
SELECT lms_source, COUNT(*) as candidate_count
FROM v_unenroll_candidates
GROUP BY lms_source;
```

### Manual Execution

```bash
# Run sync (includes auto-unenroll check)
npm run lms:sync

# Or run auto-unenroll separately
psql -d your_db -c "SELECT * FROM process_auto_unenroll();"
```

### Monitoring

```sql
-- View dry-run events
SELECT 
  created_at,
  details->>'google_email' as email,
  details->>'lms_source' as source,
  details->>'days_inactive' as days_inactive
FROM audit_logs
WHERE event_type = 'dry_unenroll'
ORDER BY created_at DESC
LIMIT 20;

-- View actual unenroll events
SELECT 
  created_at,
  details->>'google_email' as email,
  details->>'lms_source' as source,
  details->>'days_inactive' as days_inactive
FROM audit_logs
WHERE event_type = 'auto_unenroll'
ORDER BY created_at DESC
LIMIT 20;

-- View protected users
SELECT * FROM v_protected_users;
```

## Admin UI

### Identity Mapping Panel

**Location**: `/admin/identity-mapping`

**Features**:
- Upload CSV files
- View pending import batches
- Apply batches with one click
- View current mapping summary
- See total mappings and unique emails per LMS source

### Auto-Unenroll Policy Panel

**Location**: `/admin/unenroll-policy`

**Features**:
- Toggle auto-unenroll on/off
- Toggle dry-run mode
- Set grace period (days)
- Add/remove protected domains
- Add/remove protected emails
- Preview unenroll candidates
- View current policy status

## Integration with LMS Sync

### Roster Sync with Identity Resolution

When processing `roster.upsert` events:

1. If `user_email` is provided, use it directly
2. If only `user_id` is provided, resolve via identity map
3. If resolution fails, throw error (add to identity map first)
4. Check protection status before removal
5. Send invite if user not in Google Workspace domain

### Auto-Unenroll Execution

After processing sync queue:

1. Check if auto-unenroll is enabled
2. Get candidates based on grace period
3. Exclude protected users
4. If dry-run: log to audit_logs
5. If live: update status and remove from Classroom
6. Log all actions for audit trail

## Database Schema

### Tables

**lms_identity_map**
```sql
id                BIGSERIAL PRIMARY KEY
lms_source        TEXT NOT NULL
lms_user_id       TEXT NOT NULL
google_email      TEXT NOT NULL
full_name         TEXT
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
UNIQUE(lms_source, lms_user_id)
```

**lms_identity_import**
```sql
id                BIGSERIAL PRIMARY KEY
lms_source        TEXT NOT NULL
lms_user_id       TEXT NOT NULL
google_email      TEXT NOT NULL
full_name         TEXT
import_batch_id   UUID
imported_at       TIMESTAMPTZ
applied           BOOLEAN
applied_at        TIMESTAMPTZ
```

**lms_unenroll_policy**
```sql
id                    BIGSERIAL PRIMARY KEY
auto_unenroll         BOOLEAN DEFAULT FALSE
grace_period_days     INTEGER DEFAULT 7
protected_domains     TEXT[] DEFAULT ARRAY[]::TEXT[]
protected_emails      TEXT[] DEFAULT ARRAY[]::TEXT[]
dry_run_mode          BOOLEAN DEFAULT TRUE
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

### Functions

- `resolve_lms_identity(lms_source, lms_user_id, fallback_email)` - Resolve user ID to email
- `apply_identity_import(batch_id)` - Apply import batch
- `is_protected_from_unenroll(email)` - Check protection status
- `get_unenroll_candidates(lms_source)` - Get eligible users
- `process_auto_unenroll()` - Execute auto-unenroll

### Views

- `v_lms_identity_summary` - Mapping statistics by LMS source
- `v_unenroll_candidates` - Users eligible for unenroll
- `v_protected_users` - Users protected from unenroll

## Security

### Row Level Security (RLS)

All tables have RLS enabled:
- Service role: Full access
- Admins: Read access to policies and mappings
- Admins: Update access to policies

### Audit Trail

All actions logged to `audit_logs`:
- `identity_import_applied` - Import batch applied
- `dry_unenroll` - Dry-run unenroll event
- `auto_unenroll` - Actual unenroll event

## Best Practices

### Identity Mapping

1. **Export from LMS**: Use your LMS's user export feature
2. **Validate Emails**: Ensure all emails are valid Google Workspace accounts
3. **Test Import**: Start with small batch to verify format
4. **Regular Updates**: Re-import when users are added/changed
5. **Monitor Summary**: Check `v_lms_identity_summary` regularly

### Auto-Unenroll

1. **Start with Dry-Run**: Always test with `dry_run_mode = TRUE`
2. **Monitor Logs**: Check `audit_logs` for dry-run events
3. **Set Appropriate Grace Period**: 7-14 days recommended
4. **Protect Key Users**: Add admin/teacher domains to protected list
5. **Review Candidates**: Use preview feature before enabling
6. **Gradual Rollout**: Enable for one LMS source first
7. **Monitor After Enable**: Watch audit logs closely

### Troubleshooting

**Identity Resolution Fails**
```sql
-- Check if mapping exists
SELECT * FROM lms_identity_map
WHERE lms_source = 'canvas' AND lms_user_id = '12345';

-- Add missing mapping
INSERT INTO lms_identity_map (lms_source, lms_user_id, google_email)
VALUES ('canvas', '12345', 'user@school.edu');
```

**User Not Unenrolled**
```sql
-- Check if protected
SELECT is_protected_from_unenroll('user@school.edu');

-- Check grace period
SELECT * FROM v_unenroll_candidates
WHERE google_email = 'user@school.edu';

-- Check policy
SELECT * FROM lms_unenroll_policy;
```

**Dry-Run Not Logging**
```sql
-- Verify policy
SELECT auto_unenroll, dry_run_mode FROM lms_unenroll_policy;

-- Check candidates
SELECT COUNT(*) FROM v_unenroll_candidates;

-- Run manually
SELECT * FROM process_auto_unenroll();
```

## Examples

### Complete Workflow

```bash
# 1. Export users from LMS
# (Use your LMS's export feature)

# 2. Create CSV
cat > identities.csv << EOF
lms_source,lms_user_id,google_email,full_name
canvas,12345,john@school.edu,John Doe
canvas,67890,jane@school.edu,Jane Smith
EOF

# 3. Import identities
npx tsx src/identity-import.ts identities.csv

# 4. Configure policy (dry-run)
psql -d your_db << EOF
UPDATE lms_unenroll_policy SET
  auto_unenroll = TRUE,
  grace_period_days = 7,
  protected_domains = ARRAY['school.edu'],
  dry_run_mode = TRUE;
EOF

# 5. Run sync and check logs
npm run lms:sync

# 6. Review dry-run results
psql -d your_db -c "
SELECT 
  details->>'google_email' as email,
  details->>'days_inactive' as days
FROM audit_logs
WHERE event_type = 'dry_unenroll'
ORDER BY created_at DESC
LIMIT 10;
"

# 7. Enable live mode when ready
psql -d your_db -c "
UPDATE lms_unenroll_policy SET dry_run_mode = FALSE;
"
```

## Support

For issues or questions:
1. Check audit logs for error details
2. Review policy configuration
3. Verify identity mappings exist
4. Test with dry-run mode first
5. Contact support with audit log details

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-14  
**Status**: Production Ready ✅
