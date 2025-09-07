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

## 📋 Production Hardening Checklist

### ✅ Security Requirements

- [x] **Helmet Security Headers**: CSP, HSTS, X-Frame-Options configured
- [x] **Rate Limiting**: API and general endpoints protected (100/15min, 200/15min API)
- [x] **CORS Whitelist**: Sister sites and development origins configured
- [x] **Request ID Middleware**: Correlation tracking for all requests  
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