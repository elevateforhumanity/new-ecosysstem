# Infrastructure & System Architecture

## Overview

This document outlines the technical infrastructure, system architecture, deployment strategies, and integration points for all platform systems.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Infrastructure Components](#infrastructure-components)
3. [Security Infrastructure](#security-infrastructure)
4. [Deployment & CI/CD](#deployment--cicd)
5. [Monitoring & Observability](#monitoring--observability)
6. [Disaster Recovery & Business Continuity](#disaster-recovery--business-continuity)
7. [Scalability & Performance](#scalability--performance)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CDN / WAF Layer                          │
│              (Cloudflare / AWS CloudFront)                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Load Balancer Layer                        │
│              (Application Load Balancer)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │   API Server │  │  Background  │      │
│  │  (Next.js)   │  │   (Node.js)  │  │   Workers    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │   S3/Blob    │      │
│  │  (Supabase)  │  │    Cache     │  │   Storage    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              External Integrations                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Indiana    │  │     VITA     │  │   Payment    │      │
│  │   Connect    │  │     Site     │  │   Gateway    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### **Frontend**
- **Framework**: Next.js 14+ (React 18+)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context / Zustand
- **Forms**: React Hook Form + Zod validation
- **Accessibility**: Radix UI primitives, ARIA attributes

#### **Backend**
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js / Next.js API Routes
- **Language**: TypeScript
- **ORM**: Prisma
- **Authentication**: NextAuth.js / Supabase Auth
- **API**: RESTful + GraphQL (optional)

#### **Database**
- **Primary**: PostgreSQL 15+ (Supabase)
- **Cache**: Redis 7+
- **Search**: PostgreSQL Full-Text Search / Elasticsearch
- **File Storage**: AWS S3 / Azure Blob Storage

#### **Infrastructure**
- **Hosting**: AWS / Azure / Google Cloud
- **CDN**: Cloudflare
- **DNS**: Cloudflare DNS
- **SSL/TLS**: Cloudflare SSL / Let's Encrypt
- **Container**: Docker
- **Orchestration**: Kubernetes (optional for scale)

---

## Infrastructure Components

### Web Application (Next.js)

#### **Features**
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- API Routes
- Image optimization
- Automatic code splitting

#### **Configuration**
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],
}
```

### Database (PostgreSQL + Supabase)

#### **Schema Design**
- Row Level Security (RLS) enabled
- Tenant isolation via `tenant_id`
- Audit columns: `created_at`, `updated_at`, `created_by`, `updated_by`
- Soft deletes: `deleted_at`
- Indexes on foreign keys and frequently queried columns

#### **Connection Pooling**
- PgBouncer for connection pooling
- Max connections: 100
- Pool mode: Transaction
- Connection timeout: 30 seconds

#### **Backup Strategy**
- Automated daily backups
- Point-in-time recovery (PITR)
- Backup retention: 30 days
- Cross-region replication

### Caching Layer (Redis)

#### **Use Cases**
- Session storage
- API response caching
- Rate limiting
- Job queues (Bull/BullMQ)
- Real-time features (pub/sub)

#### **Configuration**
- Persistence: RDB + AOF
- Eviction policy: allkeys-lru
- Max memory: 2GB
- Cluster mode for high availability

### File Storage (S3/Blob)

#### **Storage Structure**
```
/uploads
  /documents
    /students/{student_id}/{document_id}.pdf
    /staff/{staff_id}/{document_id}.pdf
  /images
    /profiles/{user_id}/avatar.jpg
    /logos/{org_id}/logo.png
  /exports
    /reports/{report_id}.xlsx
    /transcripts/{student_id}.pdf
```

#### **Security**
- Pre-signed URLs for uploads/downloads
- Encryption at rest (AES-256)
- Versioning enabled
- Lifecycle policies (archive after 90 days)
- Access logging

---

## Security Infrastructure

### Network Security

#### **Web Application Firewall (WAF)**
- **Provider**: Cloudflare WAF
- **Rules**:
  - OWASP Top 10 protection
  - SQL injection prevention
  - XSS protection
  - Rate limiting (100 req/min per IP)
  - Bot protection
  - DDoS mitigation

#### **SSL/TLS Configuration**
- **Protocol**: TLS 1.3 (minimum TLS 1.2)
- **Cipher Suites**: Strong ciphers only
- **HSTS**: Enabled (max-age=31536000)
- **Certificate**: Wildcard SSL from trusted CA
- **OCSP Stapling**: Enabled

### Application Security

#### **Authentication**
- Multi-factor authentication (MFA) required
- OAuth 2.0 / OpenID Connect
- JWT tokens (short-lived: 15 minutes)
- Refresh tokens (7 days)
- Password hashing: bcrypt (cost factor: 12)

#### **Authorization**
- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)
- Row Level Security (RLS) in database
- API key authentication for integrations

#### **Input Validation**
- Server-side validation (Zod schemas)
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitization, CSP)
- CSRF protection (tokens)
- File upload validation (type, size, content)

### Content Security Policy (CSP)

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.example.com https://www.google-analytics.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

---

## Deployment & CI/CD

### Continuous Integration

#### **GitHub Actions Workflow**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        run: npm run deploy
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

### Deployment Strategy

#### **Environments**
1. **Development**: Feature branches, auto-deploy
2. **Staging**: Develop branch, auto-deploy
3. **Production**: Main branch, manual approval

#### **Deployment Process**
1. Code review and approval
2. Automated tests pass
3. Security scan pass
4. Build and deploy to staging
5. Smoke tests on staging
6. Manual approval for production
7. Blue-green deployment to production
8. Health checks and monitoring
9. Rollback capability (instant)

### Infrastructure as Code (IaC)

#### **Terraform Configuration**
```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  backend "s3" {
    bucket = "terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source = "./modules/vpc"
  environment = "production"
}

module "database" {
  source = "./modules/database"
  vpc_id = module.vpc.vpc_id
}

module "application" {
  source = "./modules/application"
  vpc_id = module.vpc.vpc_id
  db_endpoint = module.database.endpoint
}
```

---

## Monitoring & Observability

### Application Performance Monitoring (APM)

#### **Tools**
- **Sentry**: Error tracking and performance monitoring
- **New Relic / Datadog**: Full-stack observability
- **Google Analytics**: Web vitals and performance

#### **Metrics Tracked**
- Response time (p50, p95, p99)
- Error rate
- Throughput (requests per second)
- Database query performance
- API endpoint performance
- Core Web Vitals (LCP, FID, CLS)

### Logging

#### **Centralized Logging**
- **Tool**: CloudWatch / Datadog / ELK Stack
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Structured Logging**: JSON format
- **Retention**: 90 days (application), 7 years (audit)

#### **Log Categories**
- Application logs
- Access logs
- Error logs
- Audit logs
- Security logs

### Alerting

#### **Alert Channels**
- Email
- Slack
- PagerDuty (critical alerts)
- SMS (critical alerts)

#### **Alert Rules**
- Error rate > 1%
- Response time > 2 seconds (p95)
- Uptime < 99.9%
- Database connections > 80%
- Disk usage > 80%
- Failed login attempts > 10 in 5 minutes
- SSL certificate expiring in 30 days

---

## Disaster Recovery & Business Continuity

### Backup Strategy

#### **Database Backups**
- **Frequency**: Daily automated backups
- **Retention**: 30 days
- **Type**: Full backup + incremental
- **Storage**: Cross-region replication
- **Testing**: Monthly restore tests

#### **File Storage Backups**
- **Frequency**: Continuous (versioning enabled)
- **Retention**: 90 days
- **Type**: Incremental
- **Storage**: Cross-region replication

#### **Configuration Backups**
- Infrastructure as Code (version controlled)
- Environment variables (encrypted in secrets manager)
- Database schemas (version controlled migrations)

### Disaster Recovery Plan

#### **Recovery Objectives**
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour
- **Availability Target**: 99.9% uptime

#### **Failover Procedures**
1. Detect outage (automated monitoring)
2. Assess impact and severity
3. Activate DR team
4. Switch to backup region/infrastructure
5. Restore from latest backup
6. Verify system functionality
7. Communicate with stakeholders
8. Post-incident review

### Business Continuity

#### **Critical Systems**
1. Enrollment system
2. Student portal
3. Payment processing
4. Communication systems
5. Data access and reporting

#### **Contingency Plans**
- Manual processes documented
- Alternative communication channels
- Offline access to critical data
- Vendor contact information
- Escalation procedures

---

## Scalability & Performance

### Horizontal Scaling

#### **Auto-Scaling Configuration**
- **Metric**: CPU utilization > 70%
- **Min Instances**: 2
- **Max Instances**: 10
- **Scale-up**: Add 2 instances
- **Scale-down**: Remove 1 instance
- **Cooldown**: 5 minutes

### Performance Optimization

#### **Frontend Optimization**
- Code splitting and lazy loading
- Image optimization (WebP, AVIF)
- CDN for static assets
- Browser caching (1 year for static assets)
- Compression (Brotli, Gzip)
- Preloading critical resources

#### **Backend Optimization**
- Database query optimization (indexes, query plans)
- API response caching (Redis)
- Connection pooling
- Async processing for heavy tasks
- Rate limiting to prevent abuse

#### **Database Optimization**
- Proper indexing strategy
- Query optimization
- Read replicas for reporting
- Partitioning for large tables
- Materialized views for complex queries

### Load Testing

#### **Tools**
- Apache JMeter
- k6
- Artillery

#### **Test Scenarios**
- Normal load: 100 concurrent users
- Peak load: 500 concurrent users
- Stress test: 1000+ concurrent users
- Endurance test: 24-hour sustained load

---

## Document Control

- **Version**: 1.0
- **Last Updated**: October 10, 2025
- **Next Review**: January 10, 2026
- **Owner**: Infrastructure Team
- **Classification**: Internal Use

---

*This infrastructure documentation is reviewed quarterly and updated as systems evolve.*
