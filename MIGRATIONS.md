# Prisma Database Migrations Guide

## Overview

This project uses Prisma as the database ORM for managing users, enrollments, courses, and payments. The system gracefully falls back to in-memory stub data when no database is configured.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (optional - system works without it)
- Environment variables configured in `.env`

## Database Configuration

### Environment Variables

```bash
# Required for database functionality
DATABASE_URL="postgresql://user:password@localhost:5432/elevate_db"

# Optional - system works without these
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-key"
```

### Database Schema

The Prisma schema includes models for:
- **LmsOrganization**: Multi-tenant organization support
- **LmsUser**: User accounts with roles (ADMIN, INSTRUCTOR, STUDENT)
- **LmsCourse**: Course catalog with modules and lessons
- **LmsEnrollment**: Student enrollments and progress tracking
- **LmsOrder**: Payment and purchase history

## Migration Commands

### Initial Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations (creates tables)
npx prisma migrate deploy

# Seed database with sample data (development only)
npx prisma db seed
```

### Development Workflow

```bash
# Make changes to schema.prisma
# Then generate and apply migration
npx prisma migrate dev --name describe_your_changes

# Reset database (development only)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Production Deployment

```bash
# Generate client for production
npx prisma generate

# Apply migrations to production database
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

## Stub Mode (No Database)

When `DATABASE_URL` is not provided, the system automatically switches to stub mode:

- Uses in-memory data structures
- Perfect for development and testing
- No persistence between server restarts
- All API endpoints work identically

### Stub Data Location

Stub data is defined in `server/services/database.ts`:

```typescript
export const stubData = {
  courses: [...],
  lessons: [...],
  users: [],
  enrollments: [],
  progress: [],
};
```

## Health Checks

The system includes database health monitoring:

```bash
# Check overall system health including database
curl http://localhost:5000/api/healthz
```

Database status responses:
- `"connected"`: Database operational
- `"disabled"`: No DATABASE_URL provided, using stub mode
- `"error"`: Database configuration issue

## Best Practices

### Schema Changes

1. Always create migrations for schema changes
2. Test migrations on development database first
3. Backup production database before major migrations
4. Use descriptive migration names

### Environment Management

```bash
# Development
DATABASE_URL="postgresql://dev:dev@localhost:5432/elevate_dev"

# Testing  
DATABASE_URL="postgresql://test:test@localhost:5432/elevate_test"

# Production
DATABASE_URL="postgresql://prod:secure@db.example.com:5432/elevate_prod"
```

### Data Seeding

Create `prisma/seed.ts` for development data:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample organizations, users, courses
  await prisma.lmsOrganization.create({
    data: {
      name: 'Elevate for Humanity',
      slug: 'efh',
      // ... more data
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Troubleshooting

### Common Issues

**Migration fails with "relation already exists"**
```bash
npx prisma migrate resolve --applied MIGRATION_NAME
```

**Client out of sync with database**
```bash
npx prisma generate
```

**Connection refused**
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall and network connectivity

### Logs and Debugging

Enable Prisma query logging:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Database Reset (Development)

```bash
# Complete reset - deletes all data
npx prisma migrate reset

# Manual reset
DROP DATABASE elevate_dev;
CREATE DATABASE elevate_dev;
npx prisma migrate deploy
```

## Integration with Application

The database service (`server/services/database.ts`) provides:
- Automatic initialization
- Health check monitoring
- Graceful fallback to stub mode
- Connection management
- Error handling

All routes automatically use the appropriate data source (database or stub) based on configuration.