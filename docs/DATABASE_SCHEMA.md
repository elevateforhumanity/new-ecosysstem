# Database Schema

## Overview
This document describes the database schema for the Elevate for Humanity platform.

**Database Type:** PostgreSQL 15+  
**ORM:** Prisma / TypeORM

---

## Tables

### users
User accounts and profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| name | VARCHAR(255) | NOT NULL | Full name |
| bio | TEXT | NULL | User biography |
| avatar_url | VARCHAR(500) | NULL | Profile picture URL |
| role | ENUM | NOT NULL | user, instructor, admin |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |
| last_login | TIMESTAMP | NULL | Last login time |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_role` on `role`

---

### courses
Course information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique course identifier |
| title | VARCHAR(255) | NOT NULL | Course title |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly identifier |
| description | TEXT | NOT NULL | Course description |
| instructor_id | UUID | FOREIGN KEY → users(id) | Course instructor |
| category | VARCHAR(100) | NOT NULL | Course category |
| level | ENUM | NOT NULL | beginner, intermediate, advanced |
| price | INTEGER | NOT NULL | Price in cents |
| thumbnail_url | VARCHAR(500) | NULL | Course thumbnail |
| duration | INTEGER | NULL | Total duration in seconds |
| published | BOOLEAN | DEFAULT FALSE | Publication status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_courses_instructor` on `instructor_id`
- `idx_courses_category` on `category`
- `idx_courses_published` on `published`
- `idx_courses_slug` on `slug`

---

### lessons
Course lessons/modules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique lesson identifier |
| course_id | UUID | FOREIGN KEY → courses(id) | Parent course |
| title | VARCHAR(255) | NOT NULL | Lesson title |
| description | TEXT | NULL | Lesson description |
| content | TEXT | NULL | Lesson content (markdown) |
| video_url | VARCHAR(500) | NULL | Video URL |
| duration | INTEGER | NULL | Duration in seconds |
| order | INTEGER | NOT NULL | Display order |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_lessons_course` on `course_id`
- `idx_lessons_order` on `course_id, order`

---

### enrollments
User course enrollments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique enrollment identifier |
| user_id | UUID | FOREIGN KEY → users(id) | Enrolled user |
| course_id | UUID | FOREIGN KEY → courses(id) | Enrolled course |
| enrolled_at | TIMESTAMP | DEFAULT NOW() | Enrollment time |
| completed_at | TIMESTAMP | NULL | Completion time |
| progress | INTEGER | DEFAULT 0 | Progress percentage (0-100) |

**Indexes:**
- `idx_enrollments_user` on `user_id`
- `idx_enrollments_course` on `course_id`
- `idx_enrollments_unique` UNIQUE on `user_id, course_id`

---

### progress
Lesson completion tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique progress identifier |
| user_id | UUID | FOREIGN KEY → users(id) | User |
| lesson_id | UUID | FOREIGN KEY → lessons(id) | Lesson |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| completed_at | TIMESTAMP | NULL | Completion time |
| time_spent | INTEGER | DEFAULT 0 | Time spent in seconds |

**Indexes:**
- `idx_progress_user` on `user_id`
- `idx_progress_lesson` on `lesson_id`
- `idx_progress_unique` UNIQUE on `user_id, lesson_id`

---

### certificates
Course completion certificates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique certificate identifier |
| certificate_id | VARCHAR(50) | UNIQUE, NOT NULL | Public certificate ID |
| user_id | UUID | FOREIGN KEY → users(id) | Certificate recipient |
| course_id | UUID | FOREIGN KEY → courses(id) | Completed course |
| issued_at | TIMESTAMP | DEFAULT NOW() | Issue date |
| certificate_url | VARCHAR(500) | NULL | Certificate image URL |

**Indexes:**
- `idx_certificates_user` on `user_id`
- `idx_certificates_course` on `course_id`
- `idx_certificates_id` on `certificate_id`

---

### payments
Payment transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique payment identifier |
| user_id | UUID | FOREIGN KEY → users(id) | Paying user |
| course_id | UUID | FOREIGN KEY → courses(id) | Purchased course |
| amount | INTEGER | NOT NULL | Amount in cents |
| currency | VARCHAR(3) | DEFAULT 'USD' | Currency code |
| status | ENUM | NOT NULL | pending, succeeded, failed, refunded |
| stripe_payment_id | VARCHAR(255) | NULL | Stripe payment ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Payment time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_payments_user` on `user_id`
- `idx_payments_course` on `course_id`
- `idx_payments_status` on `status`
- `idx_payments_stripe` on `stripe_payment_id`

---

### notifications
User notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique notification identifier |
| user_id | UUID | FOREIGN KEY → users(id) | Recipient user |
| type | VARCHAR(50) | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_notifications_user` on `user_id`
- `idx_notifications_read` on `user_id, read`

---

### reviews
Course reviews and ratings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique review identifier |
| user_id | UUID | FOREIGN KEY → users(id) | Reviewer |
| course_id | UUID | FOREIGN KEY → courses(id) | Reviewed course |
| rating | INTEGER | NOT NULL, CHECK (1-5) | Rating (1-5 stars) |
| comment | TEXT | NULL | Review comment |
| created_at | TIMESTAMP | DEFAULT NOW() | Review time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_reviews_user` on `user_id`
- `idx_reviews_course` on `course_id`
- `idx_reviews_unique` UNIQUE on `user_id, course_id`

---

### assignments
Course assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique assignment identifier |
| course_id | UUID | FOREIGN KEY → courses(id) | Parent course |
| title | VARCHAR(255) | NOT NULL | Assignment title |
| description | TEXT | NOT NULL | Assignment description |
| due_date | TIMESTAMP | NULL | Due date |
| max_score | INTEGER | DEFAULT 100 | Maximum score |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_assignments_course` on `course_id`

---

### submissions
Assignment submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique submission identifier |
| assignment_id | UUID | FOREIGN KEY → assignments(id) | Assignment |
| user_id | UUID | FOREIGN KEY → users(id) | Submitting user |
| content | TEXT | NOT NULL | Submission content |
| file_url | VARCHAR(500) | NULL | Attached file URL |
| score | INTEGER | NULL | Graded score |
| feedback | TEXT | NULL | Instructor feedback |
| submitted_at | TIMESTAMP | DEFAULT NOW() | Submission time |
| graded_at | TIMESTAMP | NULL | Grading time |

**Indexes:**
- `idx_submissions_assignment` on `assignment_id`
- `idx_submissions_user` on `user_id`

---

### sessions
User sessions for authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique session identifier |
| user_id | UUID | FOREIGN KEY → users(id) | Session owner |
| token | VARCHAR(500) | UNIQUE, NOT NULL | Session token |
| expires_at | TIMESTAMP | NOT NULL | Expiration time |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| ip_address | VARCHAR(45) | NULL | Client IP address |
| user_agent | TEXT | NULL | Client user agent |

**Indexes:**
- `idx_sessions_user` on `user_id`
- `idx_sessions_token` on `token`
- `idx_sessions_expires` on `expires_at`

---

## Relationships

```
users (1) ──< (N) courses [instructor_id]
users (1) ──< (N) enrollments [user_id]
users (1) ──< (N) progress [user_id]
users (1) ──< (N) certificates [user_id]
users (1) ──< (N) payments [user_id]
users (1) ──< (N) notifications [user_id]
users (1) ──< (N) reviews [user_id]
users (1) ──< (N) submissions [user_id]
users (1) ──< (N) sessions [user_id]

courses (1) ──< (N) lessons [course_id]
courses (1) ──< (N) enrollments [course_id]
courses (1) ──< (N) certificates [course_id]
courses (1) ──< (N) payments [course_id]
courses (1) ──< (N) reviews [course_id]
courses (1) ──< (N) assignments [course_id]

lessons (1) ──< (N) progress [lesson_id]

assignments (1) ──< (N) submissions [assignment_id]
```

---

## Migrations

### Initial Schema
```sql
-- Create ENUM types
CREATE TYPE user_role AS ENUM ('user', 'instructor', 'admin');
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  role user_role NOT NULL DEFAULT 'user',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Additional tables follow similar pattern...
```

---

## Backup Strategy

- **Full backups:** Daily at 2:00 AM UTC
- **Incremental backups:** Every 6 hours
- **Retention:** 30 days for daily, 7 days for incremental
- **Storage:** AWS S3 with encryption

---

## Performance Considerations

1. **Indexes:** All foreign keys are indexed
2. **Partitioning:** Consider partitioning `notifications` and `sessions` by date
3. **Archiving:** Archive old `sessions` and `notifications` after 90 days
4. **Caching:** Use Redis for frequently accessed data (courses, user profiles)
5. **Read Replicas:** Use read replicas for analytics and reporting

---

## Security

1. **Encryption:** All sensitive data encrypted at rest
2. **Password Hashing:** bcrypt with salt rounds = 12
3. **Token Storage:** Session tokens hashed before storage
4. **PII Protection:** User data subject to GDPR/CCPA compliance
5. **Audit Logging:** All data modifications logged

---

**Schema Version:** 1.0.0  
**Last Updated:** January 2025
