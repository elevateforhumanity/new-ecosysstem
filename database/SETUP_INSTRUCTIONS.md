# Database Setup Instructions

## Overview

This directory contains SQL schemas for the Elevate for Humanity LMS platform. Follow these steps to set up your Supabase database.

## Files

- `complete-lms-schema.sql` - Complete database schema with all tables
- `enrollments-schema.sql` - Original enrollments and payment tables (included in complete schema)

## Setup Steps

### 1. Access Supabase SQL Editor

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### 2. Run the Complete Schema

Copy and paste the contents of `complete-lms-schema.sql` into the SQL editor and click **"Run"**.

This will create:

#### Core Tables
- ✅ `profiles` - User profiles and account info
- ✅ `courses` - Course catalog
- ✅ `modules` - Course sections/modules
- ✅ `lessons` - Individual lessons
- ✅ `enrollments` - Student enrollments
- ✅ `lesson_progress` - Lesson completion tracking
- ✅ `payment_history` - Payment transactions
- ✅ `certificates` - Course completion certificates
- ✅ `course_reviews` - Student reviews and ratings

#### Automatic Features
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for auto-updates
- ✅ Functions for progress tracking
- ✅ Automatic enrollment progress calculation
- ✅ Automatic course rating updates
- ✅ Payment history creation

### 3. Verify Tables

Run this query to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see:
- certificates
- course_reviews
- courses
- enrollments
- lesson_progress
- lessons
- modules
- payment_history
- profiles

### 4. Check RLS Policies

Verify Row Level Security is enabled:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

### 5. Test with Sample Data (Optional)

Create a test course:

```sql
-- Insert a test course
INSERT INTO courses (
  slug,
  title,
  description,
  price,
  is_free,
  level,
  status
) VALUES (
  'test-course',
  'Test Course',
  'This is a test course',
  99.00,
  false,
  'beginner',
  'published'
);

-- Verify
SELECT * FROM courses WHERE slug = 'test-course';
```

## Database Schema Overview

### User Flow

1. **User Signs Up** → Profile created in `profiles` table
2. **User Browses Courses** → Views `courses` table
3. **User Enrolls** → Record created in `enrollments` table
4. **Payment Processed** → Record created in `payment_history` table
5. **User Takes Lessons** → Progress tracked in `lesson_progress` table
6. **Course Completed** → Certificate created in `certificates` table
7. **User Leaves Review** → Review added to `course_reviews` table

### Key Relationships

```
profiles (users)
  ↓
enrollments ← payment_history
  ↓
lesson_progress → lessons → modules → courses
  ↓
certificates
```

## Environment Variables Needed

After setting up the database, you'll need these Supabase credentials:

### Backend (.env)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Where to Find These:

1. Go to your Supabase project
2. Click **"Settings"** → **"API"**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY` (⚠️ Keep secret!)

## Security Notes

### Row Level Security (RLS)

All tables have RLS enabled with these policies:

- **Students** can only view/edit their own data
- **Instructors** can manage their own courses
- **Admins** can view/edit everything
- **Public** can view published courses and reviews

### Important Security Rules

1. ✅ Never expose `SUPABASE_SERVICE_KEY` in frontend
2. ✅ Use `SUPABASE_ANON_KEY` for frontend
3. ✅ Use `SUPABASE_SERVICE_KEY` only in backend
4. ✅ All user actions are validated by RLS policies
5. ✅ Payment data is protected by user-specific policies

## Troubleshooting

### Error: "relation already exists"

If you see this error, some tables already exist. You can either:

1. **Drop existing tables** (⚠️ This deletes all data):
```sql
DROP TABLE IF EXISTS course_reviews CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS payment_history CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

2. **Or skip to the next step** if tables are already set up correctly

### Error: "permission denied"

Make sure you're running the SQL as the project owner or have sufficient permissions.

### Tables Created But Empty

This is normal! Tables are created empty. Data will be added when:
- Users sign up (profiles)
- Admins create courses (courses, modules, lessons)
- Students enroll (enrollments)
- Payments are processed (payment_history)

## Next Steps

After database setup:

1. ✅ Add Supabase credentials to `.env` files
2. ✅ Set up Stripe webhook (needs secret key)
3. ✅ Configure email service (SendGrid/Resend)
4. ✅ Create your first course in the admin panel
5. ✅ Test enrollment flow

## Support

If you encounter issues:

1. Check Supabase logs: **Dashboard → Logs**
2. Verify RLS policies are correct
3. Test with Supabase SQL editor
4. Check that all environment variables are set

## Schema Version

- **Version**: 1.0.0
- **Last Updated**: October 16, 2025
- **Compatible With**: Supabase PostgreSQL 15+
