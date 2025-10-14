terraform {
  required_version = ">= 1.0"
  
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    railway = {
      source  = "terraform-community-providers/railway"
      version = "~> 0.2"
    }
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.21"
    }
  }
  
  # Store state in Terraform Cloud or S3
  backend "s3" {
    bucket = "elevate-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
    # Uncomment for state locking
    # dynamodb_table = "terraform-state-lock"
    encrypt = true
  }
}

# Variables
variable "durable_site_id" {
  description = "Durable site ID"
  type        = string
}

variable "durable_api_key" {
  description = "Durable API key"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for elevateforhumanity.org"
  type        = string
}

variable "railway_api_token" {
  description = "Railway API token"
  type        = string
  sensitive   = true
}

variable "railway_project_id" {
  description = "Railway project ID"
  type        = string
}

variable "database_url" {
  description = "PostgreSQL database URL"
  type        = string
  sensitive   = true
}

variable "supabase_project_ref" {
  description = "Supabase project reference"
  type        = string
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
}

variable "sentry_dsn" {
  description = "Sentry DSN"
  type        = string
  sensitive   = true
}

# Providers
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "railway" {
  token = var.railway_api_token
}

provider "postgresql" {
  host     = split("@", split("//", var.database_url)[1])[1]
  port     = 5432
  database = "postgres"
  username = split(":", split("//", var.database_url)[1])[0]
  password = split("@", split(":", split("//", var.database_url)[1])[1])[0]
  sslmode  = "require"
}

# Outputs
output "durable_frontend_url" {
  value       = "https://elevateforhumanity.org"
  description = "Durable frontend URL"
}

output "cloudflare_worker_url" {
  value       = "https://workers.elevateforhumanity.org"
  description = "Cloudflare Worker URL"
}

output "railway_backend_url" {
  value       = "https://api.elevateforhumanity.org"
  description = "Railway backend API URL"
}

output "supabase_url" {
  value       = "https://${var.supabase_project_ref}.supabase.co"
  description = "Supabase project URL"
}

output "stack_summary" {
  value = <<-EOT
    ============================================
    ELEVATE FOR HUMANITY - INFRASTRUCTURE
    ============================================
    Frontend:  Durable (https://elevateforhumanity.org)
    Backend:   Railway (https://api.elevateforhumanity.org)
    Database:  Supabase PostgreSQL with RLS
    CDN/WAF:   Cloudflare
    Workers:   Cloudflare Workers & Queues
    Storage:   Cloudflare R2
    Cache:     Redis on Railway
    ============================================
  EOT
  description = "Complete stack summary"
}
