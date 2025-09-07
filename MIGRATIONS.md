# Prisma Database Migrations Guide

## Overview

This project uses Prisma as the database ORM with intelligent fallback support:
- **Production**: PostgreSQL with full persistence
- **Development**: SQLite for local development
- **Fallback**: In-memory stub data when no database configured

The system automatically detects database availability and switches modes seamlessly.

## Prerequisites

- Node.js 18+
- Database (PostgreSQL for production, SQLite for development)
- Environment variables configured in `.env`

## Database Configuration

### Environment Variables

```bash
# Production PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/elevate_db"

# Development SQLite (alternative)
DATABASE_URL="file:./dev.db"

# Optional Supabase integration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"  
SUPABASE_SERVICE_KEY="your-service-key"
```

### Automatic Database Detection

The system automatically:
1. Checks for `DATABASE_URL` environment variable
2. Initializes Prisma client if available
3. Falls back to in-memory stub data if not
4. Logs the chosen mode for transparency

```typescript
// Database service automatically handles fallback
const db = getDatabase(); // Returns PrismaClient or null
if (db) {
  // Use Prisma for real data
  courses = await db.lmsCourse.findMany();
} else {
  // Use stub data
  courses = stubData.courses;
}
```

## Database Schema

### Core Models

#### LmsOrganization
Multi-tenant organization support for enterprise deployments.

```prisma
model LmsOrganization {
  id        String  @id @default(cuid())
  name      String
  slug      String  @unique
  domain    String? @unique
  users     LmsUser[]
  courses   LmsCourse[]
  products  LmsProduct[]
  partners  LmsPartner[]
  createdAt DateTime @default(now())
}
```

#### LmsUser
User accounts with role-based access control.

```prisma
model LmsUser {
  id        String  @id @default(cuid())
  email     String  @unique
  name      String?
  password  String             // bcrypt hash
  role      Role    @default(STUDENT)
  orgId     String?
  org       LmsOrganization? @relation(fields: [orgId], references: [id])
  enrollments LmsEnrollment[]
  orders    LmsOrder[]
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  INSTRUCTOR  
  STUDENT
}
```

#### LmsCourse
Course catalog with hierarchical content structure.

```prisma
model LmsCourse {
  id        String  @id @default(cuid())
  orgId     String?
  org       LmsOrganization? @relation(fields: [orgId], references: [id])
  title     String
  slug      String  @unique
  price     Int     @default(0) // cents
  modules   LmsModule[]
  lessons   LmsLesson[]
  enrollments LmsEnrollment[]
  published Boolean @default(false)
  createdAt DateTime @default(now())
}
```

#### LmsModule
Course modules for organizing lessons.

```prisma
model LmsModule {
  id        String  @id @default(cuid())
  courseId  String
  course    LmsCourse @relation(fields: [courseId], references: [id], onDelete: Cascade)
  title     String
  order     Int     @default(0)
  lessons   LmsLesson[]
  createdAt DateTime @default(now())
}
```

#### LmsLesson  
Individual lessons with content and progress tracking.

```prisma
model LmsLesson {
  id        String  @id @default(cuid())
  courseId  String
  course    LmsCourse @relation(fields: [courseId], references: [id], onDelete: Cascade)
  moduleId  String?
  module    LmsModule? @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  title     String
  type      LessonType @default(TEXT)
  content   String?
  duration  Int? // seconds
  order     Int   @default(0)
  createdAt DateTime @default(now())
}

enum LessonType {
  TEXT
  VIDEO
  QUIZ
}
```

#### LmsEnrollment
Student enrollments and progress tracking.

```prisma
model LmsEnrollment {
  id        String  @id @default(cuid())
  userId    String
  user      LmsUser   @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId  String
  course    LmsCourse @relation(fields: [courseId], references: [id], onDelete: Cascade)
  progress  Float  @default(0)
  status    EnrollStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, courseId])
}

enum EnrollStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}
```

## Migration Workflow

### Development Setup (SQLite)

```bash
# Set SQLite database URL
echo 'DATABASE_URL="file:./dev.db"' >> .env

# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# View database in Prisma Studio
npx prisma studio
```

### Production Setup (PostgreSQL)

```bash
# Set PostgreSQL database URL
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# Generate Prisma client
npx prisma generate

# Deploy migrations to production
npx prisma migrate deploy

# Verify deployment
npx prisma db pull
```

### Migration Commands Reference

#### Development

```bash
# Create new migration
npx prisma migrate dev --name add_new_feature

# Reset database (development only)
npx prisma migrate reset

# Prototype schema changes
npx prisma db push
```

#### Production

```bash
# Deploy migrations to production
npx prisma migrate deploy

# Check migration status  
npx prisma migrate status

# Resolve migration issues
npx prisma migrate resolve --applied migration_name
```

#### General

```bash
# Generate Prisma client after schema changes
npx prisma generate

# View database schema
npx prisma db pull

# Browse data in web interface
npx prisma studio

# Format schema file
npx prisma format
```

## Database Providers

### SQLite (Development)

**Advantages:**
- No setup required
- Fast local development
- File-based storage
- Built into Node.js

**Configuration:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**URL Format:**
```bash
DATABASE_URL="file:./dev.db"
```

### PostgreSQL (Production)

**Advantages:**
- Full SQL features
- Excellent performance
- ACID compliance
- Production-ready

**Configuration:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**URL Format:**
```bash
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

## Troubleshooting

### Common Issues

#### 1. Migration Failed

```bash
# Check migration status
npx prisma migrate status

# If migration partially applied, mark as resolved
npx prisma migrate resolve --applied migration_name

# Reset development database
npx prisma migrate reset
```

#### 2. Schema Drift

```bash
# Pull current database schema
npx prisma db pull

# Check for differences
git diff prisma/schema.prisma

# Create migration to match
npx prisma migrate dev --name fix_schema_drift
```

#### 3. Connection Issues

```bash
# Test connection
npx prisma db pull

# Check DATABASE_URL format
echo $DATABASE_URL

# Verify database exists and credentials are correct
```

#### 4. Client Generation Issues

```bash
# Clear generated client
rm -rf node_modules/.prisma

# Regenerate client
npx prisma generate

# Restart TypeScript server if using VS Code
```

### Environment-Specific Issues

#### Development (SQLite)

```bash
# Permission issues
chmod 664 dev.db
chmod 775 .

# Database locked
rm dev.db-journal
```

#### Production (PostgreSQL)

```bash
# Connection pool exhausted  
# Increase connection limit or check for connection leaks

# Migration timeout
# Run migrations during low traffic periods

# Schema permissions
# Ensure database user has CREATE/ALTER privileges
```

## Best Practices

### Migration Strategy

1. **Always backup production** before applying migrations
2. **Test migrations** in staging environment first
3. **Use descriptive names** for migration files
4. **Review generated SQL** before applying to production
5. **Plan for rollbacks** when making breaking changes

### Schema Design

1. **Use consistent naming** conventions (camelCase for Prisma)
2. **Add indexes** for frequently queried fields
3. **Use appropriate types** for better performance
4. **Consider relationships** carefully to avoid N+1 queries
5. **Document complex fields** with comments

### Data Management

1. **Seed important data** through migrations
2. **Use transactions** for multi-step operations
3. **Validate data integrity** after migrations
4. **Monitor query performance** in production
5. **Plan for data archival** in growing systems

## Integration with Application

### Service Layer Integration

```typescript
// Database service handles Prisma + fallback
import { getDatabase, stubData } from './services/database.js';

async function getCourses() {
  const db = getDatabase();
  
  if (db) {
    // Use Prisma for real data
    return await db.lmsCourse.findMany({
      where: { published: true },
      include: { modules: true }
    });
  } else {
    // Use stub data
    return stubData.courses.filter(c => c.published);
  }
}
```

### Health Check Integration

The health endpoint automatically reports database status:

```json
{
  "checks": {
    "database": {
      "status": "connected|disabled|error",
      "message": "Database status description"
    }
  }
}
```

### Development vs Production

- **Development**: Uses SQLite by default, automatically creates schema
- **Production**: Requires PostgreSQL setup, runs migrations on deploy
- **Testing**: Can use in-memory SQLite or stub data
- **CI/CD**: Migrations run automatically in deployment pipeline

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