# Terraform Infrastructure

This directory contains Terraform configuration for managing Elevate for Humanity infrastructure.

## Prerequisites

1. Install Terraform >= 1.0
2. Configure credentials:
   - Cloudflare API token
   - Vercel API token
   - AWS credentials (for state storage)
   - Database credentials

## Setup

1. **Initialize Terraform:**
   ```bash
   terraform init
   ```

2. **Create `terraform.tfvars`:**
   ```hcl
   # Durable (Frontend)
   durable_site_id           = "your-site-id"
   durable_api_key           = "your-api-key"
   
   # Cloudflare (CDN, Security, Workers)
   cloudflare_api_token      = "your-cloudflare-token"
   cloudflare_account_id     = "your-account-id"
   cloudflare_zone_id        = "your-zone-id"
   
   # Railway (Backend)
   railway_api_token         = "your-railway-token"
   railway_project_id        = "your-project-id"
   
   # Supabase (Database)
   database_url              = "postgresql://..."
   supabase_project_ref      = "your-project-ref"
   supabase_anon_key         = "your-anon-key"
   supabase_service_role_key = "your-service-role-key"
   
   # Stripe (Payments)
   stripe_secret_key         = "sk_live_..."
   stripe_webhook_secret     = "whsec_..."
   
   # Sentry (Monitoring)
   sentry_dsn                = "https://...@sentry.io/..."
   ```

3. **Plan changes:**
   ```bash
   terraform plan
   ```

4. **Apply changes:**
   ```bash
   terraform apply
   ```

## Resources Managed

### Durable (Frontend Hosting)
- Static site hosting for landing page and marketing site
- Custom domain configuration
- SSL/TLS certificates
- CDN distribution

### Cloudflare (CDN, Security, Workers)
- DNS management (points to Durable, Railway, Workers)
- Worker scripts (background jobs, edge functions)
- Worker routes
- KV namespaces (cache, sessions)
- R2 buckets (file uploads, course materials)
- Queues (email, analytics, webhooks)
- WAF rules (security, DDoS protection)
- Rate limiting (API protection)
- Page rules (caching strategies)

### Database
- PostgreSQL roles and permissions
- Database extensions
- Credentials stored in AWS Secrets Manager

### Railway
- Backend service deployment
- Redis cache service
- Environment variables
- Custom domain configuration
- Auto-deploy from GitHub

### Supabase
- PostgreSQL database with RLS
- Authentication
- Real-time subscriptions
- Storage buckets

## State Management

Terraform state is stored in S3 with encryption enabled. To use a different backend:

1. Update `backend` configuration in `main.tf`
2. Run `terraform init -migrate-state`

## Security Best Practices

1. **Never commit `terraform.tfvars`** - it contains secrets
2. **Use remote state** - enables team collaboration
3. **Enable state locking** - prevents concurrent modifications
4. **Rotate credentials regularly** - update in both Terraform and secrets manager
5. **Review plans carefully** - especially for production changes

## Disaster Recovery

To restore infrastructure from scratch:

1. Ensure state file is accessible
2. Run `terraform init`
3. Run `terraform plan` to verify
4. Run `terraform apply` to recreate resources

## Troubleshooting

### State Lock Issues
```bash
terraform force-unlock <lock-id>
```

### Import Existing Resources
```bash
terraform import cloudflare_worker_script.main <script-name>
```

### Refresh State
```bash
terraform refresh
```

## Cost Estimation

Use Infracost to estimate costs:
```bash
infracost breakdown --path .
```

## CI/CD Integration

Terraform is automatically applied via GitHub Actions on merge to main.
See `.github/workflows/terraform.yml` for details.
