# 🔧 Render Build Errors - Fix Guide

**Repository**: Appears to be `new-ecosysstem` or similar ecosystem repo  
**Issue**: TypeScript compilation errors during Render build

---

## 🚨 Errors Found

### 1. Missing `pg` Dependency
```
error TS2307: Cannot find module 'pg' or its corresponding type declarations.
```

### 2. Prisma Schema Issues
```
Property 'lmsOrder' does not exist on type 'PrismaClient'
Property 'lmsEnrollment' does not exist on type 'PrismaClient'
Property 'lmsUser' does not exist on type 'PrismaClient'
Property 'lmsCourse' does not exist on type 'PrismaClient'
Property 'lmsModule' does not exist on type 'PrismaClient'
Property 'lmsLesson' does not exist on type 'PrismaClient'
Property 'lmsProduct' does not exist on type 'PrismaClient'
Property 'lmsPage' does not exist on type 'PrismaClient'
Property 'lmsOrganization' does not exist on type 'PrismaClient'
```

### 3. Stripe API Version Mismatch
```
Type '"2024-12-18.acacia"' is not assignable to type '"2023-10-16"'
```

### 4. Sentry Configuration Errors
```
error TS2349: This expression is not callable
error TS2339: Property 'replace' does not exist on type 'QueryParams'
```

---

## ✅ Quick Fixes

### Fix 1: Install Missing Dependencies

Add to `package.json`:
```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "@types/pg": "^8.10.9"
  }
}
```

Or run:
```bash
npm install pg @types/pg
```

### Fix 2: Update Prisma Schema

Your Prisma schema is missing LMS models. Add to `prisma/schema.prisma`:

```prisma
model lmsOrganization {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  users     lmsUser[]
}

model lmsUser {
  id             String          @id @default(cuid())
  email          String          @unique
  name           String
  organizationId String
  organization   lmsOrganization @relation(fields: [organizationId], references: [id])
  enrollments    lmsEnrollment[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

model lmsCourse {
  id          String        @id @default(cuid())
  title       String
  description String?
  modules     lmsModule[]
  enrollments lmsEnrollment[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model lmsModule {
  id        String      @id @default(cuid())
  title     String
  courseId  String
  course    lmsCourse   @relation(fields: [courseId], references: [id])
  lessons   lmsLesson[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model lmsLesson {
  id        String    @id @default(cuid())
  title     String
  content   String?
  moduleId  String
  module    lmsModule @relation(fields: [moduleId], references: [id])
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model lmsEnrollment {
  id        String    @id @default(cuid())
  userId    String
  user      lmsUser   @relation(fields: [userId], references: [id])
  courseId  String
  course    lmsCourse @relation(fields: [courseId], references: [id])
  status    String    @default("active")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model lmsOrder {
  id        String   @id @default(cuid())
  amount    Int
  status    String   @default("pending")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model lmsProduct {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model lmsPage {
  id        String   @id @default(cuid())
  title     String
  content   String?
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Then run:
```bash
npx prisma generate
npx prisma db push
```

### Fix 3: Update Stripe API Version

In `src/routes/stripe-webhook.ts`, change:
```typescript
// FROM:
apiVersion: '2024-12-18.acacia'

// TO:
apiVersion: '2023-10-16'
```

Or update your Stripe types:
```bash
npm install stripe@latest
```

### Fix 4: Fix Sentry Configuration

In `src/config/sentry.ts`, update the problematic code:

```typescript
// Line 47-48 - Fix the includes/replace issue
beforeSend(event, hint) {
  if (event.request?.query_string) {
    const queryString = event.request.query_string;
    // Ensure queryString is a string before calling includes/replace
    if (typeof queryString === 'string') {
      if (queryString.includes('password') || queryString.includes('token')) {
        event.request.query_string = queryString.replace(/password=[^&]*/g, 'password=***')
                                                 .replace(/token=[^&]*/g, 'token=***');
      }
    }
  }
  return event;
}

// Line 91 - Export with proper type
export const sentryErrorHandler: any = Sentry.Handlers.errorHandler();
```

---

## 🚀 Complete Fix Process

### Step 1: Update package.json
```bash
cd /path/to/your/repo
npm install pg @types/pg stripe@latest
```

### Step 2: Update Prisma Schema
```bash
# Add the models above to prisma/schema.prisma
npx prisma generate
npx prisma db push
```

### Step 3: Fix TypeScript Errors
- Update Sentry config (see Fix 4 above)
- Update Stripe API version (see Fix 3 above)

### Step 4: Commit Changes
```bash
git add .
git commit -m "Fix build errors: add pg dependency, update Prisma schema, fix Sentry config"
git push
```

### Step 5: Render Will Auto-Deploy
- Render detects the push
- Rebuilds with fixes
- Should deploy successfully

---

## 🔍 If Still Failing

### Check Build Logs
1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for specific error messages

### Common Issues

**Issue**: Prisma client not generated
```bash
# Add to Render build command:
npm install && npx prisma generate && npm run build
```

**Issue**: Database connection fails
```bash
# Ensure DATABASE_URL is set in Render environment variables
# Format: postgresql://user:password@host:port/database
```

**Issue**: TypeScript strict mode errors
```json
// In tsconfig.json, temporarily disable strict checks:
{
  "compilerOptions": {
    "strict": false,
    "skipLibCheck": true
  }
}
```

---

## 📋 Render Build Command

Update your Render service build command to:
```bash
npm install && npx prisma generate && npm run build
```

Update start command to:
```bash
npm start
```

---

## 🎯 Which Repository Is This?

Based on the errors, this appears to be:
- ✅ **new-ecosysstem** (JavaScript/TypeScript app)
- ❌ NOT fix2 (documentation repo)

**fix2 is working fine** - it's just static documentation with no build errors.

---

## 💡 Recommendation

**For fix2 (documentation):**
- ✅ Already deployed successfully
- ✅ No build errors
- ✅ Static site works perfectly

**For new-ecosysstem (this repo with errors):**
1. Apply fixes above
2. Test locally first: `npm run build`
3. Commit and push
4. Let Render rebuild

---

## 📞 Need Help?

If errors persist after applying these fixes:
1. Share the full build log from Render
2. Share your package.json
3. Share your prisma/schema.prisma
4. Call: (317) 314-3757

---

**Quick Summary:**
- Install `pg` dependency
- Add missing Prisma models
- Fix Stripe API version
- Fix Sentry config
- Commit and push
- Render will auto-deploy

---

*This is for a different repository than fix2. The fix2 documentation site should deploy without any issues.*
