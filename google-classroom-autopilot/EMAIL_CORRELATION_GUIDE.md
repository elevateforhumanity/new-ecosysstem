# Email Correlation & Traceability Guide

Complete email traceability system linking emails to tasks, sync runs, and content.

## Why Correlation Matters

**Problem**: When an email bounces or a user complains, you need to know:
- Which autopilot task triggered it?
- Which sync run generated it?
- Which course/assignment is it related to?
- Are there other related emails?

**Solution**: Correlation tracking links every email to its source.

## Correlation Fields

### task_id
Links email to the autopilot task that triggered it.

**Example**: Grade notification email → `gc_grade_submission` task

**Use Cases**:
- Debug failed tasks
- Track task completion
- Measure task effectiveness

### sync_run_id
Links email to the nightly sync run that generated it.

**Example**: Missing assignments digest → Nightly sync run

**Use Cases**:
- Track sync run success
- Measure sync impact
- Debug sync issues

### content_id
Links email to specific content (course, coursework, student, etc.).

**Example**: Course announcement → `courseId`

**Use Cases**:
- Find all emails about a course
- Track student communications
- Content-specific analytics

### correlation_id
Groups related emails together (e.g., all emails from one digest run).

**Example**: Weekly digest → All student + guardian emails

**Use Cases**:
- Track batch operations
- Measure campaign effectiveness
- Group related communications

### parent_event_id
Links reply emails to original email (for threading).

**Example**: Follow-up email → Original notification

**Use Cases**:
- Track conversation threads
- Measure response rates
- Build email chains

## Usage Examples

### 1. Send Email with Task Correlation

```typescript
import { emailService } from './email-providers';

// When sending from a task
await emailService.send({
  to: ['student@example.com'],
  subject: 'Assignment Graded',
  html: '<p>Your assignment has been graded.</p>',
  taskId: task.id, // Link to task
  contentId: courseworkId, // Link to assignment
  tags: {
    type: 'grade_notification',
    student_id: studentId,
  },
});
```

### 2. Send Batch Emails with Correlation

```typescript
import { generateCorrelationId } from './email-correlation';

// Generate correlation ID for batch
const correlationId = generateCorrelationId('weekly_digest');

// Send multiple emails with same correlation ID
for (const student of students) {
  await emailService.send({
    to: [student.email],
    subject: 'Weekly Update',
    html: generateDigest(student),
    correlationId, // Group all emails together
    syncRunId: syncRun.id, // Link to sync run
    contentId: student.id,
  });
}
```

### 3. Send Follow-up Email

```typescript
// Get original email event
const originalEvent = await getEmailEvent(originalEventId);

// Send follow-up
await emailService.send({
  to: [originalEvent.recipient],
  subject: 'Re: ' + originalEvent.subject,
  html: '<p>Following up on...</p>',
  parentEventId: originalEvent.id, // Link to original
  correlationId: originalEvent.correlation_id, // Keep in same group
});
```

## Querying Correlated Emails

### Get All Emails for a Task

```typescript
import { getEmailsForTask, getTaskEmailStats } from './email-correlation';

const emails = await getEmailsForTask(taskId);
const stats = await getTaskEmailStats(taskId);

console.log(`Task sent ${stats.total} emails`);
console.log(`Delivery rate: ${stats.deliveryRate}%`);
console.log(`Open rate: ${stats.openRate}%`);
```

### Get All Emails for a Sync Run

```typescript
import { getEmailsForSyncRun, getSyncRunEmailStats } from './email-correlation';

const emails = await getEmailsForSyncRun(syncRunId);
const stats = await getSyncRunEmailStats(syncRunId);

console.log(`Sync run sent ${stats.total} emails`);
console.log(`${stats.bounced} bounced, ${stats.failed} failed`);
```

### Get All Emails for Content

```typescript
import { getEmailsForContent } from './email-correlation';

// Get all emails about a specific course
const emails = await getEmailsForContent(courseId);

console.log(`Course has ${emails.length} related emails`);
```

### Get Correlation Group

```typescript
import { getEmailsByCorrelation } from './email-correlation';

// Get all emails in a digest batch
const emails = await getEmailsByCorrelation(correlationId);

console.log(`Digest sent to ${emails.length} recipients`);
```

### Get Email Thread

```typescript
import { getEmailThread } from './email-correlation';

// Get entire conversation thread
const thread = await getEmailThread(eventId);

console.log(`Thread has ${thread.length} messages`);
thread.forEach(email => {
  console.log(`${email.created_at}: ${email.subject}`);
});
```

## SQL Queries

### Emails by Task

```sql
SELECT 
  recipient,
  subject,
  status,
  created_at,
  provider_message_id
FROM email_events
WHERE task_id = 'your-task-id'
ORDER BY created_at DESC;
```

### Task Email Statistics

```sql
SELECT 
  task_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'opened') as opened,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*), 2) as delivery_rate
FROM email_events
WHERE task_id IS NOT NULL
GROUP BY task_id;
```

### Sync Run Email Statistics

```sql
SELECT 
  sync_run_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'opened') as opened,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'opened') / NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0), 2) as open_rate
FROM email_events
WHERE sync_run_id IS NOT NULL
GROUP BY sync_run_id;
```

### Content Email History

```sql
SELECT 
  content_id,
  email_type,
  COUNT(*) as total,
  MAX(created_at) as last_sent
FROM email_events
WHERE content_id IS NOT NULL
GROUP BY content_id, email_type
ORDER BY last_sent DESC;
```

### Correlation Group Analysis

```sql
SELECT 
  correlation_id,
  COUNT(*) as total_emails,
  COUNT(DISTINCT recipient) as unique_recipients,
  MIN(created_at) as first_sent,
  MAX(created_at) as last_sent,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced
FROM email_events
WHERE correlation_id IS NOT NULL
GROUP BY correlation_id
ORDER BY first_sent DESC;
```

### Email Thread Reconstruction

```sql
WITH RECURSIVE thread AS (
  -- Start with root email
  SELECT *, 0 as depth
  FROM email_events
  WHERE id = 'your-event-id'
  
  UNION ALL
  
  -- Get all replies
  SELECT e.*, t.depth + 1
  FROM email_events e
  JOIN thread t ON e.parent_event_id = t.id
)
SELECT * FROM thread
ORDER BY depth, created_at;
```

## Admin UI Integration

### Show Task Emails

```tsx
import { getEmailsForTask } from '@/lib/email-correlation';

function TaskDetails({ taskId }) {
  const [emails, setEmails] = useState([]);
  
  useEffect(() => {
    getEmailsForTask(taskId).then(setEmails);
  }, [taskId]);
  
  return (
    <div>
      <h3>Emails Sent ({emails.length})</h3>
      <ul>
        {emails.map(email => (
          <li key={email.id}>
            {email.recipient} - {email.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Show Sync Run Emails

```tsx
import { getSyncRunEmailStats } from '@/lib/email-correlation';

function SyncRunStats({ syncRunId }) {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    getSyncRunEmailStats(syncRunId).then(setStats);
  }, [syncRunId]);
  
  if (!stats) return <div>Loading...</div>;
  
  return (
    <div>
      <h3>Email Statistics</h3>
      <p>Total: {stats.total}</p>
      <p>Delivered: {stats.delivered} ({stats.deliveryRate}%)</p>
      <p>Opened: {stats.opened} ({stats.openRate}%)</p>
      <p>Bounced: {stats.bounced}</p>
    </div>
  );
}
```

### Show Correlation Group

```tsx
import { getEmailsByCorrelation } from '@/lib/email-correlation';

function DigestReport({ correlationId }) {
  const [emails, setEmails] = useState([]);
  
  useEffect(() => {
    getEmailsByCorrelation(correlationId).then(setEmails);
  }, [correlationId]);
  
  const stats = {
    total: emails.length,
    delivered: emails.filter(e => e.status === 'delivered').length,
    opened: emails.filter(e => e.status === 'opened').length,
  };
  
  return (
    <div>
      <h3>Digest Report</h3>
      <p>Sent to {stats.total} recipients</p>
      <p>Delivered: {stats.delivered}</p>
      <p>Opened: {stats.opened}</p>
    </div>
  );
}
```

## Best Practices

### 1. Always Set Correlation ID for Batches

```typescript
// ✅ Good
const correlationId = generateCorrelationId('weekly_digest');
for (const student of students) {
  await emailService.send({
    ...emailData,
    correlationId,
  });
}

// ❌ Bad
for (const student of students) {
  await emailService.send({
    ...emailData,
    // No correlation ID - can't group emails
  });
}
```

### 2. Link to Tasks When Possible

```typescript
// ✅ Good
await emailService.send({
  ...emailData,
  taskId: task.id, // Can trace back to task
});

// ❌ Bad
await emailService.send({
  ...emailData,
  // No task ID - can't debug issues
});
```

### 3. Use Content ID for Filtering

```typescript
// ✅ Good
await emailService.send({
  ...emailData,
  contentId: courseId, // Can find all course emails
});

// ❌ Bad
await emailService.send({
  ...emailData,
  // No content ID - can't filter by course
});
```

### 4. Track Sync Runs

```typescript
// ✅ Good
const syncRun = await createSyncRun('courses');
// ... sync logic ...
await emailService.send({
  ...emailData,
  syncRunId: syncRun.id,
});

// ❌ Bad
await emailService.send({
  ...emailData,
  // No sync run ID - can't measure sync impact
});
```

## Troubleshooting

### Missing Correlation Data

**Problem**: Emails don't have correlation IDs

**Solution**: Update email sending code to include correlation fields

```typescript
// Add correlation tracking
await emailService.send({
  ...existingData,
  taskId: task?.id,
  syncRunId: syncRun?.id,
  contentId: courseId,
  correlationId: generateCorrelationId(),
});
```

### Can't Find Related Emails

**Problem**: Queries return no results

**Solution**: Check that correlation fields are being set

```sql
-- Check if fields are populated
SELECT 
  COUNT(*) as total,
  COUNT(task_id) as with_task,
  COUNT(sync_run_id) as with_sync,
  COUNT(content_id) as with_content,
  COUNT(correlation_id) as with_correlation
FROM email_events;
```

### Performance Issues

**Problem**: Queries are slow

**Solution**: Indexes are already created, but verify:

```sql
-- Check indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'email_events';
```

## CLI Tools

### Check Task Emails

```bash
npx tsx src/email-correlation.ts task <task-id>
```

### Check Sync Run Emails

```bash
npx tsx src/email-correlation.ts sync <sync-run-id>
```

### Check Content Emails

```bash
npx tsx src/email-correlation.ts content <content-id>
```

### Check Correlation Group

```bash
npx tsx src/email-correlation.ts correlation <correlation-id>
```

### Check Email Thread

```bash
npx tsx src/email-correlation.ts thread <event-id>
```

## Support

**Questions?** Contact: info@elevateforhumanity.org
