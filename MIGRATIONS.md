# Database Migrations Guide

This guide covers database setup, schema management, and migration procedures for the EFH ecosystem.

## Overview

The EFH ecosystem uses Prisma ORM for database management with support for:
- **Development**: SQLite (file-based, no setup required)
- **Production**: PostgreSQL (recommended for scaling)
- **Graceful Fallback**: In-memory data when database is unavailable

## Database Configuration

### SQLite (Development)
```bash
# No additional setup required
DATABASE_URL="file:./dev.db"
```

### PostgreSQL (Production)
```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
```

## Prisma Commands

### Initial Setup
```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init
```

### Development Workflow
```bash
# Create a new migration after schema changes
npx prisma migrate dev --name descriptive_name

# Reset database and apply all migrations
npx prisma migrate reset

# View current migration status
npx prisma migrate status
```

### Production Deployment
```bash
# Apply pending migrations to production database
npx prisma migrate deploy

# Generate Prisma client for production
npx prisma generate
```

## Schema Overview

The current schema includes:

### Core Entities
- **LmsOrganization**: Multi-tenant organization support
- **LmsUser**: User accounts with role-based access (ADMIN, INSTRUCTOR, STUDENT)
- **LmsCourse**: Course catalog with pricing and publishing status
- **LmsModule**: Course organization into modules
- **LmsLesson**: Individual lessons with content types (TEXT, VIDEO, QUIZ)

### Progress & Enrollment
- **LmsEnrollment**: User course enrollments with progress tracking
- **LmsCertificate**: Course completion certificates

### Commerce
- **LmsProduct**: Purchasable products and services
- **LmsOrder**: Order management with Stripe integration

### Partnership & Content
- **LmsPartner**: Partner organization management
- **LmsPage**: CMS-style page management

## Migration Best Practices

### Schema Changes
1. **Always create migrations for schema changes**
   ```bash
   # After editing prisma/schema.prisma
   npx prisma migrate dev --name add_user_preferences
   ```

2. **Test migrations on development data first**
   ```bash
   # Create test data
   npx prisma db seed
   
   # Apply migration
   npx prisma migrate dev
   ```

3. **Review generated SQL before production deployment**
   ```bash
   # Check migration files in prisma/migrations/
   cat prisma/migrations/*/migration.sql
   ```

### Data Seeding

Create a seed script for development data:
```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create sample courses
  await prisma.lmsCourse.create({
    data: {
      title: 'AI Fundamentals',
      slug: 'ai-fundamentals',
      price: 199700, // $1997 in cents
      published: true
    }
  });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
```

Run seeding:
```bash
npx prisma db seed
```

## Troubleshooting

### Common Issues

#### "Prisma Client not found"
```bash
npx prisma generate
```

#### "Migration failed"
```bash
# Check database connection
npx prisma db push --accept-data-loss

# Reset if needed
npx prisma migrate reset
```

#### "Schema drift detected"
```bash
# Generate migration to sync schema
npx prisma migrate dev --create-only
```

### Graceful Fallback

The application automatically falls back to in-memory data when:
- Database is not accessible
- Prisma client fails to initialize
- Migration errors occur

This ensures the application remains functional during database issues.

## Environment Variables

Required for database operations:
```bash
# Database connection
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Optional: Direct database URL for migrations
DIRECT_URL="postgresql://user:pass@host:5432/db"
```

## Backup and Recovery

### Creating Backups
```bash
# SQLite
cp dev.db backup-$(date +%Y%m%d).db

# PostgreSQL
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Restoring from Backup
```bash
# SQLite
cp backup-20250101.db dev.db

# PostgreSQL
psql $DATABASE_URL < backup-20250101.sql
```

## Monitoring Database Health

The application includes database connectivity monitoring:
- Health endpoint: `GET /api/healthz`
- Database status: Shows 'ok' when connected, 'degraded' when using fallback
- Connection pooling and retry logic for production resilience

For detailed implementation, see `services/lms-enhanced.cjs` for the database integration layer.