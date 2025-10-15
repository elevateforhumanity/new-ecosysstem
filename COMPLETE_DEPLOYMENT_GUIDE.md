# 🚀 Complete Deployment Guide - Milady CIMA + OJT System

## Overview

This guide covers deploying the complete apprenticeship management system with:
- ✅ Milady CIMA RTI tracking
- ✅ OJT timesheet management with QR codes
- ✅ Mentor approval workflow with email notifications
- ✅ Token-based security with 24h expiry
- ✅ Audit logging
- ✅ RAPIDS/DOL reporting
- ✅ Automated nightly cleanup

---

## Prerequisites

- Supabase project
- Cloudflare account
- Domain with email configured (for MailChannels)
- Node.js 18+ and npm/pnpm

---

## Step 1: Database Setup (15 minutes)

### Run Migrations

Open Supabase SQL Editor and run in order:

1. `supabase/migrations/014_milady_cima_integration.sql`
2. `supabase/migrations/015_exec_sql_rpc.sql`
3. `supabase/migrations/016_ojt_enhancements.sql`

### Verify Installation

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'apprentices', 'rti_providers', 'rti_enrollments', 'rti_sessions', 'rti_totals',
  'mentors', 'ojt_sessions', 'ojt_totals', 'ojt_sign_tokens', 'ojt_sign_audit',
  'rti_import_logs'
);
-- Should return 11 rows

-- Check functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'exec_sql', 'recalc_rti_totals', 'recalc_ojt_totals',
  'generate_sign_token', 'verify_sign_token',
  'purge_expired_sign_tokens', 'mark_stale_unsigned_entries'
);
-- Should return 7 rows

-- Check Milady CIMA provider exists
SELECT * FROM rti_providers WHERE name = 'Milady CIMA';
-- Should return 1 row
```

---

## Step 2: Cloudflare Worker Setup (20 minutes)

### Install Dependencies

```bash
cd workers/cima-importer
npm install
```

### Set Secrets

```bash
# Required secrets
wrangler secret put SUPABASE_URL
# Enter: https://your-project.supabase.co

wrangler secret put SUPABASE_SERVICE_KEY
# Enter: eyJhbGc... (from Supabase Settings > API > service_role)

wrangler secret put SUPABASE_JWT_SECRET
# Enter: your-jwt-secret (from Supabase Settings > API > JWT Secret)

# Email configuration (required for notifications)
wrangler secret put MAIL_FROM
# Enter: no-reply@yourdomain.com

wrangler secret put MAIL_FROM_NAME
# Enter: Elevate Apprenticeship

# Optional secrets
wrangler secret put MAIL_BCC
# Enter: ops@yourdomain.com (optional, for monitoring)

wrangler secret put SIGN_SECRET
# Enter: random-secret-string (for token generation)

wrangler secret put FRONTEND_URL
# Enter: https://elevateforhumanity.org
```

### Deploy Worker

```bash
# Deploy to production
npm run deploy:prod

# Test deployment
curl https://cima-importer-prod.your-subdomain.workers.dev
# Should return: {"ok":true,"service":"cima-importer","version":"1.0.0",...}
```

---

## Step 3: Frontend Setup (10 minutes)

### Configure Environment

Add to `.env`:
```
VITE_CIMA_WORKER_URL=https://cima-importer-prod.your-subdomain.workers.dev
VITE_API_URL=http://localhost:3001
```

### Build and Deploy

```bash
# Install dependencies (if needed)
npm install

# Build
npm run build

# Deploy (your existing process)
```

---

## Step 4: Email Configuration (10 minutes)

### Configure MailChannels

1. **Add SPF Record:**
```
v=spf1 include:relay.mailchannels.net ~all
```

2. **Add DKIM Record:**
Follow MailChannels documentation to generate DKIM keys

3. **Test Email:**
```bash
curl -X POST https://your-worker.workers.dev/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

---

## Step 5: Create Test Data (10 minutes)

### Create Test Mentor

```sql
INSERT INTO mentors (full_name, email, license_number, active)
VALUES ('John Mentor', 'mentor@example.com', 'LIC-12345', true)
RETURNING id;
```

### Create Test Apprentice

```sql
-- First, create auth user in Supabase Auth UI
-- Then link to apprentice:

INSERT INTO apprentices (
  user_id,
  first_name,
  last_name,
  email,
  sponsor_program_id,
  start_date,
  expected_end,
  status
) VALUES (
  'user-uuid-from-auth',
  'Jane',
  'Apprentice',
  'apprentice@example.com',
  'RAID-TEST-001',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  'active'
) RETURNING id;
```

### Link to CIMA

```sql
INSERT INTO rti_enrollments (
  apprentice_id,
  provider_id,
  provider_user_id,
  course_code
) VALUES (
  'apprentice-id-from-above',
  (SELECT id FROM rti_providers WHERE name = 'Milady CIMA'),
  'apprentice@example.com',
  'BARBER-TEST-2025'
);
```

---

## Step 6: Test Complete Workflow (20 minutes)

### Test 1: CIMA CSV Import

Create test CSV file named `test-cima.csv`:
```
Email,LessonId,LessonTitle,StartTime,EndTime,Minutes
apprentice@example.com,L001,Sanitation,2025-01-15 09:00:00,2025-01-15 10:30:00,90
apprentice@example.com,L002,Hair Cutting,2025-01-15 11:00:00,2025-01-15 13:00:00,120
```

Import via Worker:
```bash
curl -X POST https://your-worker.workers.dev/cima/import \
  -H "Content-Type: text/csv" \
  --data-binary @test-cima.csv
```

Expected response: `{"ok":true,"imported":2,"hours_added":3.5,...}`

### Test 2: Verify RTI Hours

```sql
SELECT 
  a.first_name,
  a.last_name,
  t.hours_total,
  t.sessions_count
FROM apprentices a
JOIN rti_totals t ON t.apprentice_id = a.id
WHERE a.email = 'apprentice@example.com';
```

Expected: 3.5 hours, 2 sessions

### Test 3: OJT Timesheet Submission

1. Log in as apprentice
2. Go to `/ojt/timesheet`
3. Submit timesheet:
   - Date: Today
   - Hours: 8
   - Mentor: Select test mentor
   - Description: "Practiced hair cutting"
   - Skills: "Hair cutting, sanitation"
4. Click Submit
5. Should see QR code

### Test 4: Mentor Signature

**Option A: Via QR Code**
1. Scan QR code with phone
2. Opens mentor sign page
3. Review details
4. Click "Approve & Sign"
5. Should see success message

**Option B: Via Portal**
1. Log in as mentor
2. Go to `/mentor/portal`
3. See pending timesheet
4. Click "Approve"
5. Should see success

### Test 5: Verify Email Sent

Check apprentice's email for:
- Subject: "Timesheet Approved – Mentor Signature Received"
- Contains timesheet details
- Has link to view progress

### Test 6: Verify OJT Hours Updated

```sql
SELECT 
  a.first_name,
  a.last_name,
  t.hours_total,
  t.sessions_count
FROM apprentices a
JOIN ojt_totals t ON t.apprentice_id = a.id
WHERE a.email = 'apprentice@example.com';
```

Expected: 8.0 hours, 1 session

### Test 7: Check Audit Log

```sql
SELECT 
  ts.id,
  a.mentor_email,
  a.ip,
  a.signed_at
FROM ojt_sign_audit a
JOIN ojt_sessions ts ON ts.id = a.timesheet_id
ORDER BY a.signed_at DESC
LIMIT 5;
```

Should show the signature with IP and timestamp

### Test 8: RAPIDS Export

```bash
curl "https://your-worker.workers.dev/rapids/export?since=2025-01-01&format=csv" \
  -o rapids-export.csv
```

Open `rapids-export.csv` - should include test apprentice with RTI and OJT hours

### Test 9: OJT Export

```bash
# Get JWT token from frontend
TOKEN="your-jwt-token"

curl "https://your-worker.workers.dev/ojt/export?start=2025-01-01&end=2025-12-31" \
  -H "Authorization: Bearer $TOKEN" \
  -o ojt-export.csv
```

Open `ojt-export.csv` - should include all OJT timesheets

### Test 10: Nightly Cleanup

```bash
# Manually trigger cron
curl -X POST https://your-worker.workers.dev/__scheduled

# Check logs
wrangler tail --name cima-importer-prod
```

Should see: "Purged X expired sign tokens" and "Marked Y stale unsigned entries"

---

## Step 7: Production Configuration

### Configure Cron Schedule

The worker is already configured to run nightly at 3:15 AM UTC:
- Imports CSVs from R2 (if configured)
- Purges expired sign tokens
- Marks stale unsigned entries

### Configure R2 Auto-Import (Optional)

1. Create R2 bucket: `efh-assets`
2. Create folders:
   - `cima-exports/` - Drop CSVs here
   - `cima-imported/` - Processed CSVs move here
3. Upload CSVs to `cima-exports/`
4. Cron will auto-import nightly

### Monitor Worker

```bash
# View logs
wrangler tail --name cima-importer-prod

# View deployments
wrangler deployments list --name cima-importer-prod
```

Go to Cloudflare Dashboard > Workers > cima-importer-prod > Metrics for detailed analytics

---

## Step 8: User Training

### For Admins

**Weekly Tasks:**
1. Export CSV from Milady CIMA
2. Upload to `/admin/rti`
3. Review import results
4. Check for students behind schedule

**Monthly Tasks:**
1. Generate RAPIDS export
2. Review completion status
3. Submit to DOL

### For Mentors

**Daily Tasks:**
1. Check `/mentor/portal` for pending timesheets
2. Review and approve/reject
3. Provide feedback if rejecting

**Tips:**
- Scan QR codes for quick approval
- Check email for notifications
- Contact admin if issues

### For Apprentices

**Daily Tasks:**
1. Submit OJT timesheet at end of day
2. Include detailed description
3. List skills practiced
4. Wait for mentor approval

**Weekly Tasks:**
1. Check `/student/progress`
2. Review RTI and OJT hours
3. Download record if needed

---

## Troubleshooting

### Import Fails

**Problem:** "Provider not found"

Solution:
```sql
INSERT INTO rti_providers (name, active) VALUES ('Milady CIMA', true);
```

**Problem:** "No rows imported"

Solutions:
- Check CSV format (Email, Minutes columns required)
- Verify email matches `rti_enrollments.provider_user_id`
- Check for case sensitivity

### Email Not Sending

**Problem:** No emails received

Solutions:
1. Check `MAIL_FROM` secret is set
2. Verify SPF/DKIM records
3. Check worker logs: `wrangler tail`
4. Test MailChannels directly

**Problem:** Emails go to spam

Solutions:
- Add DKIM record
- Verify SPF record
- Use proper from address

### Token Expired

**Problem:** "Invalid or expired token"

Solutions:
- Tokens expire after 24 hours
- Generate new token
- Check system time is correct

### Hours Not Updating

**Problem:** Timesheet approved but hours don't show

Solution:
```sql
-- Manually recalculate
SELECT recalc_ojt_totals((SELECT id FROM apprentices WHERE email = 'student@example.com'));
```

---

## Monitoring & Maintenance

### Daily Checks

- [ ] Check worker logs for errors
- [ ] Verify emails are sending
- [ ] Review pending timesheets

### Weekly Checks

- [ ] Import CIMA CSV
- [ ] Review import logs
- [ ] Check for stale unsigned entries
- [ ] Verify student progress

### Monthly Checks

- [ ] Generate RAPIDS export
- [ ] Review completion status
- [ ] Check audit logs
- [ ] Update documentation

---

## Security Checklist

- [ ] All secrets set in Cloudflare
- [ ] RLS policies enabled in Supabase
- [ ] JWT verification working
- [ ] Token expiry enforced (24h)
- [ ] Audit logging enabled
- [ ] Email notifications working
- [ ] HTTPS only
- [ ] SPF/DKIM configured

---

## Support

**Issues?**
- Check logs: `wrangler tail --name cima-importer-prod`
- Review audit logs in database
- Check email configuration
- Verify secrets are set

**Questions?**
- GitHub: https://github.com/elevateforhumanity/fix2
- Email: support@elevateforhumanity.org

---

## Summary

You now have a complete, production-ready apprenticeship management system with:

✅ **RTI Tracking** - Milady CIMA integration with auto-import  
✅ **OJT Tracking** - Mobile timesheets with mentor approval  
✅ **Security** - Token-based auth with 24h expiry  
✅ **Audit** - Complete logging of all signatures  
✅ **Notifications** - Email alerts for apprentices  
✅ **Reporting** - RAPIDS/DOL exports  
✅ **Automation** - Nightly cleanup and imports  

**Total Implementation:**
- 16 database tables
- 7 SQL functions
- 700+ lines of Worker code
- 5 frontend pages
- Complete documentation

**Status:** 🎉 Production Ready!

---

**Last Updated:** January 15, 2025  
**Version:** 1.0.0
