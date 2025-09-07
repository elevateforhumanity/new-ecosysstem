# Production-Ready Elevate for Humanity Ecosystem

A complete multi-site ecosystem with unified architecture, comprehensive LMS, federal compliance endpoints, and production-ready deployment foundation.

## 🚀 Quick Start

### Development Setup

```bash
# Clone and install dependencies
git clone <repository>
cd new-ecosysstem
npm install

# Configure environment (copy and edit)
cp .env.example .env

# Start development server
npm run dev

# Or run the unified production server
node server/main.ts  # (requires build step)
```

### Production Deployment

```bash
# Install dependencies  
npm ci --production

# Set production environment variables
export NODE_ENV=production
export JWT_SECRET="your_very_secure_jwt_secret_minimum_64_characters_for_production"
export DATABASE_URL="postgresql://user:pass@host:5432/db"  # optional

# Build application
npm run build

# Start production server
npm start
```

# Production-Ready Elevate for Humanity Ecosystem

A complete multi-site ecosystem with unified architecture, comprehensive LMS, federal compliance endpoints, and production-ready deployment foundation.

## 🚀 Quick Start

### Development Setup

```bash
# Clone and install dependencies
git clone <repository>
cd new-ecosysstem
npm install

# Configure environment (copy and edit)
cp .env.example .env

# Start development server (frontend)
npm run dev

# Or run the unified production server
NODE_ENV=test JWT_SECRET=dev_secret_key_minimum_16_chars node server/main.js
```

### Production Deployment

```bash
# Install dependencies  
npm ci --omit=dev

# Set production environment variables
export NODE_ENV=production
export JWT_SECRET="your_very_secure_jwt_secret_minimum_64_characters_for_production"
export DATABASE_URL="postgresql://user:pass@host:5432/db"  # optional, falls back to SQLite

# Build application
npm run build

# Run production readiness checks
npm run check:prod

# Start production server
node server/main.js
```

## 🌐 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | development | Environment mode (development, test, production) |
| `JWT_SECRET` | Yes | - | JWT signing secret (min 16 chars, 64+ for production) |
| `DATABASE_URL` | No | - | PostgreSQL connection string (auto-falls back to SQLite) |
| `STRIPE_SECRET_KEY` | No | - | Stripe secret key (stub mode if not provided) |
| `STRIPE_PUBLIC_KEY` | No | - | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | No | - | Stripe webhook endpoint secret |
| `SUPABASE_URL` | No | - | Supabase project URL |
| `SUPABASE_ANON_KEY` | No | - | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | No | - | Supabase service role key |
| `LOG_LEVEL` | No | info | Logging level (debug, info, warn, error) |
| `PORT` | No | 5000 | Server port |

## 🏥 Health Endpoint Specification

### GET /api/healthz

Returns aggregated system health with service-level checks:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-07T12:00:00.000Z",
  "version": "1.0.0",
  "commit": "7a6ac82",
  "uptimeSeconds": 3600,
  "correlationId": "req-123",
  "responseTime": 15,
  "checks": {
    "app": {
      "status": "healthy",
      "uptime": 3600.5,
      "memory": { "rss": 45670400, "heapUsed": 23456789 },
      "pid": 12345
    },
    "database": {
      "status": "disabled|connected|error",
      "message": "Database status description"
    },
    "environment": {
      "status": "valid",
      "nodeEnv": "production",
      "hasJwtSecret": true,
      "hasDatabase": false,
      "hasStripe": true
    }
  },
  "services": {
    "api": { "status": "healthy", "timestamp": "2025-01-07T12:00:00.000Z" },
    "db": { "status": "disabled", "message": "Using in-memory stub" },
    "compliance": { 
      "status": "healthy", 
      "checks": ["DOE", "DWD", "DOL"],
      "description": "Federal compliance monitoring active" 
    },
    "lms": { 
      "status": "healthy", 
      "features": ["courses", "progress", "assessments"],
      "description": "Learning management system operational" 
    }
  }
}
```

## 📚 LMS API Specification

Complete Learning Management System with course catalog, progress tracking, and federal compliance integration.

### Core Endpoints

```bash
# Course Management
GET /api/lms/courses              # Get all published courses
GET /api/lms/courses/:id          # Get course by ID or slug
GET /api/lms/courses/:id/lessons  # Get lessons for specific course

# Progress Tracking (requires authentication)
POST /api/lms/progress           # Update lesson/course progress
```

### Data Models

**Course**
- `id` (string): Unique course identifier  
- `title` (string): Course display name
- `slug` (string): URL-friendly identifier
- `description` (string): Course description
- `price` (number): Price in cents
- `published` (boolean): Visibility status

**Lesson**
- `id` (string): Unique lesson identifier
- `courseId` (string): Parent course ID
- `title` (string): Lesson name
- `type` (enum): TEXT, VIDEO, QUIZ
- `content` (string): Lesson content
- `duration` (number): Duration in seconds
- `order` (number): Display order

**Progress**
- `userId` (string): User identifier
- `courseId` (string): Course identifier  
- `lessonId` (string): Lesson identifier
- `progress` (number): Completion percentage (0-100)
- `completed` (boolean): Completion status

### Database Integration

The LMS automatically switches between:
- **Production**: Prisma + PostgreSQL for full persistence
- **Development**: Prisma + SQLite for local development  
- **Fallback**: In-memory stub data when no database configured

## 📋 Compliance Check Glossary

Federal workforce development compliance monitoring with dynamic status tracking.

### Compliance Areas

| Area | Description | Status Types | Regulations |
|------|-------------|--------------|-------------|
| **DOE** | Department of Education | CERTIFIED, PENDING, EXPIRED | WIOA Title I, Adult Education |
| **DWD** | Department of Workforce Development | ACTIVE_COMPLIANCE, REVIEW_REQUIRED | State workforce programs |
| **DOL** | Department of Labor | CURRENT_REPORTING, PAST_DUE | Federal labor standards |

### Compliance Checks Registry

| Check ID | Name | Requirement | Criticality |
|----------|------|-------------|-------------|
| `wioa_eligibility` | WIOA Title I Adult Program Eligibility | WIOA Title I Adult Program Eligibility Standards | HIGH |
| `iep_compliance` | Individual Employment Plan Management | IEP Documentation and Progress Tracking | HIGH |
| `pirl_reporting` | PIRL Data Quality and Timeliness | PIRL Data Quality and Timeliness Standards | HIGH |
| `financial_compliance` | Federal Cost Principles Compliance | Federal Cost Principles (2 CFR 200) | HIGH |
| `equal_opportunity` | Equal Opportunity and Nondiscrimination | Equal Opportunity Provisions | HIGH |
| `data_security` | Data Security and Privacy Protection | PII Protection and Data Security Standards | HIGH |

### Status Meanings

- **PASS**: Check meets all requirements
- **FAIL**: Check does not meet requirements - immediate attention required
- **WARNING**: Check has minor issues - review recommended  
- **PENDING**: Check is being evaluated - status unknown

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] **Environment Variables**: All required variables set with production values
- [ ] **JWT Secret**: Minimum 64 characters, cryptographically secure
- [ ] **Database**: PostgreSQL configured (or SQLite fallback confirmed)
- [ ] **SSL/TLS**: HTTPS enabled with valid certificates
- [ ] **Domain**: DNS configured for all sister sites

### Security

- [ ] **Helmet Headers**: CSP, HSTS, X-Frame-Options configured
- [ ] **Rate Limiting**: API and general endpoints protected  
- [ ] **CORS**: Whitelist configured for sister sites
- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **Error Handling**: No sensitive data in error responses

### Monitoring

- [ ] **Health Checks**: /api/healthz endpoint monitored
- [ ] **Logging**: Structured logging configured with appropriate levels
- [ ] **Correlation IDs**: Request tracking implemented
- [ ] **Performance**: Response times monitored (<500ms target)

### Compliance

- [ ] **Federal Standards**: DOE/DWD/DOL compliance endpoints active
- [ ] **Data Protection**: PII handling procedures implemented  
- [ ] **Audit Trail**: All compliance actions logged
- [ ] **Reporting**: Automated compliance reporting configured

### Testing

- [ ] **Unit Tests**: >70% code coverage maintained
- [ ] **Integration Tests**: All API endpoints tested
- [ ] **Load Tests**: Performance validated under expected traffic
- [ ] **Smoke Tests**: Critical paths verified in production

## 🏗️ Architecture Overview

```
├── server/main.ts              # Production server entry point
├── server/routes/              # Modular API routes
│   ├── auth.ts                 # Authentication endpoints  
│   ├── users.ts                # User management
│   ├── lms.ts                  # Learning management system
│   ├── compliance.ts           # Federal compliance
│   ├── payments.ts             # Stripe payment processing
│   ├── branding.ts             # Brand configuration
│   ├── widgets.ts              # Embeddable widgets
│   └── health.ts               # System health checks
├── server/services/            # Business logic layer
│   ├── database.ts             # Prisma + stub fallback
│   ├── compliance.ts           # Compliance registry
│   ├── payment.ts              # Payment service wrapper
│   ├── branding.ts             # Brand configuration
│   └── widgets.ts              # Widget generation
├── server/middleware/          # Express middleware
│   └── auth.ts                 # JWT authentication
├── src/                        # Frontend application
├── prisma/                     # Database schema
└── .github/workflows/          # CI/CD pipelines
```

## 📖 Additional Documentation

- [MIGRATIONS.md](./MIGRATIONS.md) - Prisma database migration guide
- [COMPLIANCE.md](./COMPLIANCE.md) - Federal compliance detailed documentation
- [CHANGELOG.md](./CHANGELOG.md) - Version history and changes  
- [x] **JWT Secret Validation**: Minimum 16 characters enforced in env validation
- [ ] **HTTPS Proxy**: Configure reverse proxy with SSL termination
- [x] **Input Validation**: Request body size limits (10MB) and JSON parsing

### ✅ Database Requirements

- [x] **Prisma Integration**: Full schema with users, enrollments, courses, payments
- [x] **Database Migrations**: Migration workflow documented in MIGRATIONS.md
- [x] **Connection Health**: Database status monitoring in /api/healthz
- [x] **Graceful Fallbacks**: Auto-switch to in-memory stub when DB unavailable
- [ ] **Migration Execution**: Run `npx prisma migrate deploy` in production
- [x] **Connection Pooling**: Prisma client handles connection management

### ✅ API & Service Requirements  

- [x] **Unified Server Architecture**: Single entry point with modular routers
- [x] **Health Aggregation**: /api/healthz with app, database, environment checks
- [x] **LMS Endpoints**: Courses, lessons, progress tracking with authentication
- [x] **Compliance Endpoints**: DOE/DWD/DOL validation with structured responses
- [x] **Payment Integration**: Stripe with idempotency keys and stub fallback
- [x] **Error Handling**: Unified error envelope with correlation IDs
- [x] **Structured Logging**: Pino logger with appropriate levels

### ✅ Environment Configuration

- [x] **Environment Validation**: Zod schema with required variables  
- [x] **JWT_SECRET**: Secure secret key configured (64+ characters recommended)
- [ ] **Database URL**: PostgreSQL connection string (optional, graceful fallback)
- [ ] **Stripe Keys**: STRIPE_SECRET_KEY for payment processing (optional, stub fallback)
- [ ] **Supabase Config**: SUPABASE_URL and keys (optional for enhanced features)

### 🔄 CI/CD Pipeline

- [x] **GitHub Actions**: Comprehensive workflow with testing and security audit
- [x] **Multi-Node Testing**: Node 18.x and 20.x compatibility
- [x] **Security Audit**: npm audit on production builds
- [x] **Load Testing**: Basic k6 performance testing
- [x] **Build Artifacts**: Automated artifact creation and retention
- [x] **Environment Checks**: Production readiness validation

### 📚 Documentation

- [x] **README Production Section**: This checklist and deployment guide
- [x] **MIGRATIONS.md**: Complete Prisma workflow and troubleshooting
- [x] **COMPLIANCE.md**: Federal requirements and endpoint documentation
- [x] **API Documentation**: Inline documentation in route files
- [x] **Environment Variables**: Complete .env.example with secure defaults

### ⚡ Performance & Monitoring

- [x] **Compression**: Gzip compression for all responses
- [x] **Response Time Monitoring**: Health check includes timing
- [x] **Memory Usage**: Process memory reporting in health checks
- [x] **Correlation IDs**: Request tracing throughout application
- [ ] **Metrics Collection**: Prometheus/OTEL integration (Phase 2)
- [ ] **Log Aggregation**: Centralized logging setup (Phase 2)

## 🏗️ System Architecture

### Unified Server Structure

```
server/
├── main.ts              # Main server entry point
├── middleware/
│   └── auth.ts          # JWT authentication middleware
├── routes/              # Modular API routers
│   ├── auth.ts          # Authentication endpoints
│   ├── users.ts         # User management
│   ├── lms.ts           # Learning management system
│   ├── compliance.ts    # Federal compliance
│   ├── payments.ts      # Stripe integration
│   ├── branding.ts      # Brand assets and config
│   ├── widgets.ts       # Embeddable widgets  
│   └── navigation.ts    # Site navigation
└── services/
    └── database.ts      # Prisma/stub data abstraction
```

### Sister Sites Integration

- **Hub (www)**: Main landing page with navigation and SEO
- **Programs (programs.)**: Program catalog, funding info, and application intake  
- **LMS (lms.)**: Learning content delivery and course management
- **Connect (connect.)**: Community features, events, and resources
- **Pay (pay.)**: Centralized payment processing using Node.js and Stripe
- **Compliance**: Federal compliance monitoring and reporting

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Runtime environment |
| `JWT_SECRET` | **Yes** | - | JWT signing secret (64+ chars recommended) |
| `DATABASE_URL` | No | - | PostgreSQL connection (stub mode if missing) |
| `STRIPE_SECRET_KEY` | No | - | Stripe API key (stub mode if missing) |
| `SUPABASE_URL` | No | - | Supabase project URL |
| `SUPABASE_ANON_KEY` | No | - | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | No | - | Supabase service role key |
| `LOG_LEVEL` | No | `info` | Logging level (debug, info, warn, error) |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test test/unified-server.test.ts

# Run tests with coverage
npm run test -- --coverage

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📊 API Endpoints

### Core Endpoints

- `GET /api/healthz` - Aggregated health check
- `GET /api/lms/courses` - Course catalog
- `GET /api/compliance` - Federal compliance status
- `POST /api/payments/create-payment-intent` - Payment processing

### Legacy Compatibility

- `GET /api/stripe/config` → `GET /api/payments/config`
- `GET /api/sister-sites` → `GET /api/navigation/sister-sites`

See individual route files for complete API documentation.

## 🔒 Security Features

- **Helmet**: Security headers with CSP
- **Rate Limiting**: Protection against abuse
- **CORS**: Origin-based access control
- **Input Validation**: Request size and format limits
- **Structured Logging**: Security event tracking
- **Correlation IDs**: Request tracing and audit trail

## 🎯 Federal Compliance

This system meets requirements for:
- **DOE**: WIOA Title I Adult Program certification
- **DWD**: Workforce development alignment and reporting  
- **DOL**: Equal opportunity, financial compliance, PIRL reporting

See [COMPLIANCE.md](COMPLIANCE.md) for detailed documentation.

---

## Legacy Documentation (Pre-Production Hardening)

### Original Multi-Site Ecosystem Implementation

## 🏗️ System Architecture

### Sister Sites
- **Hub (www)**: Main landing page with navigation and SEO
- **Programs (programs.)**: Program catalog, funding info, and application intake  
- **LMS (lms.)**: Learning content delivery and course management
- **Connect (connect.)**: Community features, events, and resources
- **Pay (pay.)**: Centralized payment processing using Node.js and Stripe
- **Memory Service**: Powered by Supabase (no custom server needed)

### Data Sharing
All sites share user data through Supabase:
- User authentication (magic links, OAuth)
- Profile information (name, phone, address)
- User preferences (email settings, locale, accessibility)
- Course enrollments with status tracking
- Payment history and Stripe integration

## 📂 File Structure

```
├── account.html                    # Full account management page
├── demo-site.html                  # Example sister site implementation
├── pay-backend-integration.js      # Stripe → Supabase integration
├── setup-guide.md                 # Step-by-step setup instructions
└── shared/
    ├── account-drawer.html         # Embeddable account widget
    ├── supabase.js                # Shared Supabase client
    └── enrollment.js              # Enrollment helper functions
```

## 🚀 Implementation Status

### ✅ Completed Components
- Database schema design with security policies
- Account management page (full-page version)
- Account drawer widget (embeddable version)
- Shared authentication and user session management
- Enrollment tracking and display functions
- Payment integration template for existing Pay service
- Demo site showing complete integration

### ⏳ Manual Setup Required
- Create Supabase project and apply database schema
- Configure Supabase Auth for all sister site domains
- Update credential placeholders with real Supabase values
- Integrate Supabase code into existing Pay backend
- Test cross-site authentication and enrollment flow

## 🔧 Key Features

### Account Drawer Widget
- Floating "Account" button on any page
- Slide-out drawer with sign-in and profile management
- Shows live enrollment status across all sites
- Mobile responsive with proper accessibility
- **NEW**: Funding & voucher collection for checkout metadata

### Enrollment System
- Reuses existing Pay backend with minimal changes
- Adds `program_slug` metadata to Stripe checkout
- Automatic enrollment activation after payment
- Status tracking: pending → active → completed
- **NEW**: Automatic funding metadata injection (voucher ID, case manager, funding source, coupons)

### Funding & Voucher Support
- Local storage persistence for guest users
- Supabase sync for authenticated users
- Automatic injection into all enrollment checkouts
- Case manager and voucher ID tracking
- Support for WIOA, ETPL, WRG, and other funding sources
- Funding details recorded in payment metadata and notes

#### How It Works
1. User fills out funding info in Account Drawer (voucher ID, case manager, funding source, coupon)
2. System saves locally and syncs to Supabase if signed in
3. When `efhEnroll()` is called, funding data is automatically attached to Stripe metadata
4. Payment backend receives funding info in webhook and stores in database notes
5. Funding details appear in Stripe dashboard for billing/authorization support

### Shared Authentication
- Magic link email authentication
- Session persistence across sister sites
- Automatic user record creation and syncing
- Secure access with Row Level Security

## 🎯 Business Benefits

- **Unified User Experience**: Users see consistent data across all sites
- **Simplified Management**: One source of truth for all user data
- **Scalable Architecture**: Supabase handles infrastructure and security
- **Easy Integration**: Drop-in widgets require minimal code changes
- **Cost Effective**: Uses existing Pay service with hosted Supabase

## 📱 User Journey

1. **Discovery**: User visits any sister site
2. **Sign In**: Magic link authentication (works across all sites)
3. **Browse**: View programs, courses, community content
4. **Enroll**: Click enrollment button → Stripe checkout
5. **Payment**: Complete payment through existing Pay service
6. **Activation**: Enrollment automatically activated across all sites
7. **Learning**: Access content based on enrollment status

The system ensures seamless experience as users move between different parts of the ecosystem.

# Workspace (Plain Vite + TypeScript)

## Features
- Strict TypeScript
- ESLint + Prettier
- Vitest + coverage
- Environment validation (zod)
- API helper (fetch + timeout + error)
- Logging utility
- Size & production checks
- CI workflow + Dependabot

## Commands
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run check:prod

## Release
Increment version in package.json then:
npm run release:tag

## Environment
Copy .env.example to .env (optional). Validate via:
npm run env:check