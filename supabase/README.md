# Supabase Setup for Elevate for Humanity

## Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Save your project URL and anon key

### 2. Run Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Seed database (optional)
supabase db reset --db-url "your-database-url"
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

## Database Schema

### Tables
- **profiles** - User profiles (extends auth.users)
- **programs** - Training programs catalog
- **courses** - Courses within programs
- **lessons** - Individual lessons
- **enrollments** - User program enrollments
- **lesson_progress** - Track user progress
- **certificates** - Issued certificates

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Public read access for published content

## Authentication

Supabase Auth is configured for:
- Email/password signup
- Magic link authentication
- OAuth providers (Google, GitHub - configure in Supabase dashboard)

## Storage

Configure Supabase Storage buckets for:
- **certificates** - PDF certificates
- **course-materials** - Videos, documents
- **user-uploads** - Student submissions

## Realtime (Optional)

Enable realtime subscriptions for:
- Live progress updates
- Chat/messaging features
- Notifications

## Local Development

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# View local dashboard
# http://localhost:54323
```

## Production Deployment

1. Run migrations on production database
2. Configure production environment variables
3. Set up proper CORS in Supabase dashboard
4. Configure auth redirect URLs
5. Set up storage buckets and policies

## Useful Commands

```bash
# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts

# Create new migration
supabase migration new migration_name

# Reset database
supabase db reset

# View logs
supabase logs
```
