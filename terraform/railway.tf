# Railway Infrastructure Configuration

# Railway Project
resource "railway_project" "main" {
  name        = "elevate-for-humanity"
  description = "Elevate for Humanity - Education Platform"
}

# Backend Service
resource "railway_service" "backend" {
  project_id = railway_project.main.id
  name       = "backend-api"
  
  source {
    repo = "elevateforhumanity/Elevate-sitemap"
    branch = "main"
    root_directory = "/backend"
  }
  
  # Environment variables
  variables = {
    NODE_ENV                    = "production"
    PORT                        = "3000"
    DATABASE_URL                = var.database_url
    SUPABASE_URL                = "https://${var.supabase_project_ref}.supabase.co"
    SUPABASE_ANON_KEY           = var.supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY   = var.supabase_service_role_key
    STRIPE_SECRET_KEY           = var.stripe_secret_key
    STRIPE_WEBHOOK_SECRET       = var.stripe_webhook_secret
    SENTRY_DSN                  = var.sentry_dsn
    REDIS_URL                   = railway_service.redis.connection_url
    FRONTEND_URL                = "https://elevateforhumanity.org"
    CORS_ORIGIN                 = "https://elevateforhumanity.org,https://www.elevateforhumanity.org"
  }
  
  # Health check
  health_check {
    path     = "/api/health"
    interval = 30
    timeout  = 10
  }
  
  # Auto-deploy on push
  auto_deploy = true
  
  # Restart policy
  restart_policy = "on-failure"
}

# Redis Service for caching and sessions
resource "railway_service" "redis" {
  project_id = railway_project.main.id
  name       = "redis-cache"
  
  # Use Railway's Redis template
  template = "redis"
  
  variables = {
    REDIS_PASSWORD = random_password.redis_password.result
  }
}

# Generate Redis password
resource "random_password" "redis_password" {
  length  = 32
  special = false
}

# Custom domain for backend
resource "railway_custom_domain" "backend" {
  service_id = railway_service.backend.id
  domain     = "api.elevateforhumanity.org"
}

# Variables for Railway
variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook secret"
  type        = string
  sensitive   = true
}

# Outputs
output "backend_url" {
  value       = railway_custom_domain.backend.domain
  description = "Backend API URL"
}

output "redis_connection_url" {
  value       = railway_service.redis.connection_url
  description = "Redis connection URL"
  sensitive   = true
}

output "railway_project_id" {
  value       = railway_project.main.id
  description = "Railway project ID"
}
