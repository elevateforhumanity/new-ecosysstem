# ✅ LMS → Google Classroom Autopilot Sync - COMPLETE

## What Was Built

### 1. Database Layer ✅
**File**: `sql/02_lms_sync.sql`

**Tables Created**:
- `lms_sync_queue` - Event staging with idempotency
- `lms_classroom_course_map` - Course ID mappings
- `lms_classroom_topic_map` - Topic ID mappings
- `lms_classroom_work_map` - Assignment ID mappings
- `lms_classroom_roster_map` - Student enrollment mappings
- `lms_sync_reconciliation` - Reconciliation tracking

**Functions Created**:
- `enqueue_lms_sync()` - Queue events for sync
- `get_next_sync_task()` - Get next pending task with lock
- `complete_sync_task()` - Mark task as completed
- `fail_sync_task()` - Mark task as failed with retry logic
- `get_or_create_course_mapping()` - Manage course mappings

**Views Created**:
- `v_lms_sync_status` - Queue status summary
- `v_lms_sync_failures` - Failed tasks to retry
- `v_lms_mapping_summary` - Mapping statistics

### 2. Webhook Endpoint ✅
**File**: `workers/lms-webhook/src/index.ts`

**Features**:
- Receives LMS webhook events
- Validates payload structure
- Optional signature verification
- Enqueues events to Supabase
- Returns 202 Accepted with queue ID
- CORS enabled
- Idempotency support

**Supported Events**:
- `course.upsert` - Create/update courses
- `topic.upsert` - Create/update topics
- `work.upsert` - Create/update assignments
- `roster.upsert` - Enroll/remove students

### 3. Sync Runner ✅
**File**: `google-classroom-autopilot/src/lms-sync.ts`

**Features**:
- Processes queued events
- Creates/updates Google Classroom objects
- Maintains ID mappings
- Automatic retry on failure
- Exponential backoff
- Comprehensive error logging

**Sync Operations**:
- Course sync (create/update)
- Topic sync (create/update)
- Coursework sync (create/update)
- Roster sync (enroll/remove students)

---

## Quick Start

### Step 1: Apply SQL Migration

```bash
psql -h db.cuxzzpsyufcewtmicszk.supabase.co -U postgres -d postgres \
  -f google-classroom-autopilot/sql/02_lms_sync.sql
```

### Step 2: Set Environment Variables

```bash
# Supabase
export SUPABASE_URL="https://cuxzzpsyufcewtmicszk.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Google Service Account (base64 encoded JSON)
export GOOGLE_SA_JSON_B64="base64_encoded_service_account_json"

# Google Workspace user to impersonate (domain-wide delegation)
export GOOGLE_IMPERSONATE_EMAIL="admin@yourdomain.com"

# Optional: Webhook signature verification
export WEBHOOK_SECRET="your_webhook_secret"
```

### Step 3: Deploy Webhook Worker

```bash
cd workers/lms-webhook
npm install
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put WEBHOOK_SECRET
wrangler deploy
```

### Step 4: Run Sync

```bash
# Manual run (process 10 tasks)
npx tsx google-classroom-autopilot/src/lms-sync.ts 10

# Or add to package.json and run:
npm run lms:sync
```

---

## Example Webhook Payloads

### Course Upsert

```bash
curl -X POST https://your-worker.workers.dev/lms/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "course.upsert",
    "source": "canvas",
    "data": {
      "id": "12345",
      "name": "Introduction to Programming",
      "code": "CS101",
      "description": "Learn the basics of programming",
      "description_heading": "Course Overview"
    }
  }'
```

### Topic Upsert

```bash
curl -X POST https://your-worker.workers.dev/lms/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "topic.upsert",
    "source": "canvas",
    "data": {
      "id": "topic-001",
      "course_id": "12345",
      "name": "Week 1: Variables and Data Types"
    }
  }'
```

### Assignment Upsert

```bash
curl -X POST https://your-worker.workers.dev/lms/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "work.upsert",
    "source": "canvas",
    "data": {
      "id": "assignment-001",
      "course_id": "12345",
      "topic_id": "topic-001",
      "title": "Homework 1: Hello World",
      "description": "Write your first program",
      "points_possible": 100,
      "due_date": "2025-10-20",
      "due_time": "23:59"
    }
  }'
```

### Student Enrollment

```bash
curl -X POST https://your-worker.workers.dev/lms/webhook \
  -H "Content-Type": "application/json" \
  -d '{
    "type": "roster.upsert",
    "source": "canvas",
    "data": {
      "course_id": "12345",
      "user_id": "student-001",
      "user_email": "student@school.edu",
      "role": "student",
      "action": "add"
    }
  }'
```

### Remove Student

```bash
curl -X POST https://your-worker.workers.dev/lms/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "roster.upsert",
    "source": "canvas",
    "data": {
      "course_id": "12345",
      "user_id": "student-001",
      "user_email": "student@school.edu",
      "action": "remove"
    }
  }'
```

---

## Monitoring

### Check Sync Status

```sql
-- View queue status
SELECT * FROM v_lms_sync_status;

-- View failed syncs
SELECT * FROM v_lms_sync_failures;

-- View mapping summary
SELECT * FROM v_lms_mapping_summary;
```

### Check Specific Course Mapping

```sql
SELECT 
  lms_course_id,
  classroom_course_id,
  last_synced_at,
  sync_status
FROM lms_classroom_course_map
WHERE lms_source = 'canvas'
  AND lms_course_id = '12345';
```

### View Recent Sync Activity

```sql
SELECT 
  event_type,
  event_source,
  status,
  created_at,
  processed_at,
  error_message
FROM lms_sync_queue
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## Scheduled Sync (GitHub Actions)

Create `.github/workflows/lms-sync.yml`:

```yaml
name: LMS Sync

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run LMS Sync
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          GOOGLE_SA_JSON_B64: ${{ secrets.GOOGLE_SA_JSON_B64 }}
          GOOGLE_IMPERSONATE_EMAIL: ${{ secrets.GOOGLE_IMPERSONATE_EMAIL }}
        run: npx tsx google-classroom-autopilot/src/lms-sync.ts 50
```

---

## Reconciliation (Nightly Job)

Add to package.json:

```json
{
  "scripts": {
    "lms:sync": "tsx google-classroom-autopilot/src/lms-sync.ts",
    "lms:reconcile": "tsx google-classroom-autopilot/src/lms-reconcile.ts"
  }
}
```

Run nightly:

```yaml
# .github/workflows/lms-reconcile.yml
name: LMS Reconciliation

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily

jobs:
  reconcile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lms:reconcile
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          GOOGLE_SA_JSON_B64: ${{ secrets.GOOGLE_SA_JSON_B64 }}
          GOOGLE_IMPERSONATE_EMAIL: ${{ secrets.GOOGLE_IMPERSONATE_EMAIL }}
```

---

## Features

### ✅ Idempotency
- Duplicate events are detected and skipped
- Safe to replay events
- Idempotency keys prevent double-processing

### ✅ Automatic Retry
- Failed tasks retry with exponential backoff
- Maximum 3 attempts per task
- Retry delays: 2min, 4min, 8min

### ✅ ID Mapping
- Maintains LMS ↔ Classroom ID mappings
- Enables updates to existing objects
- Tracks sync status and timestamps

### ✅ Error Handling
- Comprehensive error logging
- Failed tasks logged to `audit_logs`
- Detailed error messages and stack traces

### ✅ Monitoring
- Real-time queue status views
- Failed task tracking
- Mapping statistics
- Reconciliation history

---

## Next Steps

### Add Bi-Directional Sync

Pull grades/submissions from Classroom back to LMS:

```typescript
// google-classroom-autopilot/src/lms-sync-bidirectional.ts
async function syncGradesFromClassroom() {
  // Get submissions from Classroom
  // Update grades in LMS via API
  // Track sync status
}
```

### Add Drive Materials

Attach Google Drive files to assignments:

```typescript
async function attachDriveMaterials(courseworkId, driveFileId) {
  await classroom.courses.courseWork.addOnAttachments.create({
    courseId,
    itemId: courseworkId,
    requestBody: {
      driveFile: { id: driveFileId }
    }
  });
}
```

### Add Bulk Operations

Sync entire courses at once:

```typescript
async function bulkSyncCourse(lmsCourseId) {
  // Sync course
  // Sync all topics
  // Sync all assignments
  // Sync all students
}
```

---

## Troubleshooting

### Webhook not receiving events

1. Check Cloudflare Worker logs: `wrangler tail`
2. Verify webhook URL is correct
3. Check LMS webhook configuration
4. Test with curl

### Sync tasks stuck in "processing"

```sql
-- Reset stuck tasks
UPDATE lms_sync_queue
SET status = 'pending', attempts = 0
WHERE status = 'processing'
  AND processed_at < NOW() - INTERVAL '1 hour';
```

### Google API errors

1. Verify service account has domain-wide delegation
2. Check impersonation email is correct
3. Verify API scopes are enabled
4. Check Google Workspace admin console

### Mapping not found errors

1. Ensure parent objects are synced first (course before topics)
2. Check mapping tables for existing entries
3. Verify LMS IDs are correct

---

## Summary

✅ **Complete LMS → Google Classroom sync system**
- Database tables and functions
- Webhook endpoint (Cloudflare Worker)
- Sync runner with retry logic
- ID mapping and idempotency
- Monitoring views
- Example payloads
- GitHub Actions templates

**Ready to use!** Just apply the SQL migration, deploy the webhook, and start sending events.

---

**Files Created**:
1. `sql/02_lms_sync.sql` - Database schema
2. `workers/lms-webhook/src/index.ts` - Webhook handler
3. `workers/lms-webhook/wrangler.toml` - Worker config
4. `src/lms-sync.ts` - Sync runner
5. `LMS_SYNC_COMPLETE.md` - This documentation

**Next**: Deploy webhook and start syncing! 🚀
