# Google Classroom Autopilot

Full **Google Classroom Autopilot** for Elevate for Humanity - automated course management, roster sync, assignment creation, and grading with Google Classroom API.

## Features

### Core Functionality
- ✅ **Domain-Wide Delegation** - Service account impersonation (recommended)
- ✅ **OAuth 2.0** - User authentication flow (alternative)
- ✅ **Task Queue** - Integrated with EFH Autopilot system
- ✅ **Auto-Sync Jobs** - Nightly roster sync, grade export, activity monitoring
- ✅ **GitHub Actions** - Automated task processing every 10 minutes

### Course Management
- ✅ Create, update, archive courses
- ✅ Manage course rosters (students, teachers)
- ✅ Post announcements
- ✅ Monitor course activity

### Assignment & Grading
- ✅ Create assignments with due dates
- ✅ Grade student submissions
- ✅ Export grades to Supabase
- ✅ Check for missing assignments

### Admin Tools
- ✅ **Admin UI Panel** - One-click task enqueueing
- ✅ **Instructor Interface** - Course creation form
- ✅ **Auto-Sync Scheduler** - Automated maintenance tasks
- ✅ **Audit Logs** - Complete task execution history

## Quick Setup

### 1. Enable the Classroom API

In Google Cloud Console: APIs & Services → **Enable** "Google Classroom API"

Create **OAuth 2.0 Client (Web/Installed)** and note:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- Redirect: `http://localhost:53682/callback` (matches the script)

### 2. Set Environment Variables

```bash
# Gitpod
gp env SUPABASE_URL=...
gp env SUPABASE_SERVICE_ROLE_KEY=...
gp env GOOGLE_OAUTH_CLIENT_ID=...
gp env GOOGLE_OAUTH_CLIENT_SECRET=...
gp env GOOGLE_OAUTH_REDIRECT=http://localhost:53682/callback

# Or create .env file
cp .env.example .env
# Edit .env with your values
```

### 3. Create Supabase Tables

Run the SQL in `sql/01_tokens.sql` to create `public.user_tokens`.

If you already have `tasks`/`audit_logs` from EFH Autopilot v1, you're good. If not, run `sql/02_tasks.sql`.

### 4. Install Dependencies

```bash
npm install
```

### 5. Authorize

```bash
# Start OAuth flow
npx tsx src/index.ts auth --email you@school.org

# Open printed URL, approve, copy the ?code=...
npx tsx src/index.ts auth:redeem --email you@school.org --code YOUR_CODE
```

### 6. Test

```bash
# List courses
npx tsx src/index.ts courses:list --email you@school.org
```

### 7. Run Autopilot

```bash
# Execute queued Classroom jobs
npx tsx src/index.ts autopilot:run --email you@school.org
```

## Queue Example Tasks

### Create an Assignment

```sql
INSERT INTO public.tasks(kind, payload, priority)
VALUES (
  'gc_create_coursework',
  jsonb_build_object(
    'courseId', '1234567890',
    'title', 'CNA Skills Lab #1',
    'description', 'Submit your skills checklist and reflection.',
    'dueDate', jsonb_build_object('year', 2025, 'month', 11, 'day', 5)
  ),
  3
);
```

### Invite a Student

```sql
INSERT INTO public.tasks(kind, payload, priority)
VALUES (
  'gc_invite_student',
  jsonb_build_object(
    'courseId', '1234567890',
    'email', 'student@example.com'
  ),
  2
);
```

## Auth Models

### User OAuth (Current)
- You sign in as the teacher/admin
- Each user has their own tokens
- Good for multi-tenant scenarios

### Service Account with Domain-Wide Delegation (Optional)
- Service account impersonates teachers
- Requires Google Workspace admin setup
- Better for automated workflows
- Contact support to switch to this model

## Security Notes

- Tokens are stored in Supabase `user_tokens`
- This table should **NOT** be exposed to public API
- Keep it reachable only by backend/service role
- Use Row Level Security (RLS) policies

## Auto-Sync Jobs

Automated tasks that run on schedule:

| Job | Schedule | Description |
|-----|----------|-------------|
| **Nightly Roster Sync** | 2 AM daily | Sync all course rosters with Supabase |
| **Missing Assignment Check** | 8 AM weekdays | Identify students with missing work |
| **Grade Export** | 3 AM daily | Export all grades to Supabase |
| **Activity Monitor** | Every 6 hours | Track course engagement metrics |
| **Deadline Reminders** | 9 AM daily | Send upcoming deadline notifications |
| **Progress Reports** | 10 AM Mondays | Generate weekly instructor reports |

### Managing Auto-Sync Jobs

```bash
# List all jobs and their schedules
npx tsx src/auto-sync-jobs.ts list

# Queue jobs that should run now
npx tsx src/auto-sync-jobs.ts queue
```

## Admin UI Components

### ClassroomAdminPanel

One-click task enqueueing interface for administrators.

**Location**: `src/components/classroom/admin/ClassroomAdminPanel.tsx`

**Features**:
- 📚 Create courses
- 👨‍🎓 Invite students
- 📝 Create assignments
- 📢 Post announcements
- 🔄 Sync rosters
- 📊 Export grades

**Usage**:
```tsx
import ClassroomAdminPanel from '@/components/classroom/admin/ClassroomAdminPanel';

function AdminPage() {
  return <ClassroomAdminPanel />;
}
```

### CourseCreationForm

Instructor interface for creating new courses.

**Location**: `src/components/classroom/instructor/CourseCreationForm.tsx`

**Features**:
- Course name, section, room
- Description and heading
- Course state (Active/Provisioned)
- Automatic task queueing

**Usage**:
```tsx
import CourseCreationForm from '@/components/classroom/instructor/CourseCreationForm';

function InstructorDashboard() {
  return <CourseCreationForm />;
}
```

## GitHub Actions Integration

Automated task processing runs every 10 minutes via GitHub Actions.

**Workflow**: `.github/workflows/classroom-autopilot.yml`

**What it does**:
1. Processes pending `gc_*` tasks from Supabase
2. Queues auto-sync jobs based on schedule
3. Logs results to audit_logs table

**Manual trigger**:
1. Go to GitHub Actions tab
2. Select "Google Classroom Autopilot"
3. Click "Run workflow"

## Task Types

| Task Kind | Description | Payload Fields |
|-----------|-------------|----------------|
| `gc_create_course` | Create new course | name, section, description, room |
| `gc_update_course` | Update course details | courseId, updates |
| `gc_invite_student` | Invite student to course | courseId, email |
| `gc_invite_teacher` | Invite teacher to course | courseId, email |
| `gc_create_coursework` | Create assignment | courseId, title, description, dueDate |
| `gc_grade_submission` | Grade submission | courseId, courseworkId, submissionId, grade |
| `gc_create_announcement` | Post announcement | courseId, text |
| `gc_sync_roster` | Sync course roster | courseId |
| `gc_export_grades` | Export course grades | courseId |
| `gc_sync_all_rosters` | Sync all rosters | (none) |
| `gc_check_missing_assignments` | Check missing work | (none) |
| `gc_export_all_grades` | Export all grades | (none) |
| `gc_monitor_activity` | Monitor activity | (none) |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
│              (Every 10 minutes + manual)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Google Classroom Autopilot                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Domain-Wide  │  │  Task Queue  │  │  Auto-Sync   │  │
│  │  Delegation  │  │   Processor  │  │    Jobs      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                      Supabase                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    tasks     │  │ audit_logs   │  │   courses    │  │
│  │   (queue)    │  │  (history)   │  │  (synced)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Google Classroom API                     │
│         (Courses, Rosters, Assignments, Grades)          │
└─────────────────────────────────────────────────────────┘
```

## Next Steps

1. ✅ **Domain-Wide Delegation** - See [DOMAIN_WIDE_DELEGATION_SETUP.md](./DOMAIN_WIDE_DELEGATION_SETUP.md)
2. ✅ **Auto-Sync Jobs** - Configured and ready to use
3. ✅ **Admin UI** - Components ready for integration
4. ⏳ **Pub/Sub Integration** - Real-time event processing (coming soon)
5. ⏳ **Student Dashboard** - Student view components (coming soon)

## Support

For questions or issues, contact: info@elevateforhumanity.org

## License

Proprietary - Elevate for Humanity © 2025
