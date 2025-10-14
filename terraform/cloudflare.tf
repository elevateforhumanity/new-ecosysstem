# Cloudflare Workers and Infrastructure

# Worker Script
resource "cloudflare_worker_script" "main" {
  account_id = var.cloudflare_account_id
  name       = "elevateforhumanity-worker"
  content    = file("../workers/dist/index.js")
  
  plain_text_binding {
    name = "ENVIRONMENT"
    text = "production"
  }
  
  secret_text_binding {
    name = "SUPABASE_URL"
    text = "https://${var.supabase_project_ref}.supabase.co"
  }
  
  secret_text_binding {
    name = "STRIPE_SECRET_KEY"
    text = var.stripe_secret_key
  }
  
  secret_text_binding {
    name = "SENTRY_DSN"
    text = var.sentry_dsn
  }
  
  kv_namespace_binding {
    name         = "CACHE"
    namespace_id = cloudflare_workers_kv_namespace.cache.id
  }
  
  kv_namespace_binding {
    name         = "SESSIONS"
    namespace_id = cloudflare_workers_kv_namespace.sessions.id
  }
  
  r2_bucket_binding {
    name        = "UPLOADS"
    bucket_name = cloudflare_r2_bucket.uploads.name
  }
  
  queue_binding {
    binding = "EMAIL_QUEUE"
    queue   = cloudflare_queue.email.name
  }
  
  queue_binding {
    binding = "ANALYTICS_QUEUE"
    queue   = cloudflare_queue.analytics.name
  }
  
  queue_binding {
    binding = "WEBHOOK_QUEUE"
    queue   = cloudflare_queue.webhook.name
  }
}

# Worker Routes
resource "cloudflare_worker_route" "main" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "elevateforhumanity.org/*"
  script_name = cloudflare_worker_script.main.name
}

resource "cloudflare_worker_route" "www" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "www.elevateforhumanity.org/*"
  script_name = cloudflare_worker_script.main.name
}

# KV Namespaces
resource "cloudflare_workers_kv_namespace" "cache" {
  account_id = var.cloudflare_account_id
  title      = "elevate-cache"
}

resource "cloudflare_workers_kv_namespace" "sessions" {
  account_id = var.cloudflare_account_id
  title      = "elevate-sessions"
}

# R2 Bucket for file uploads
resource "cloudflare_r2_bucket" "uploads" {
  account_id = var.cloudflare_account_id
  name       = "elevate-uploads"
  location   = "WNAM" # Western North America
}

# Queues
resource "cloudflare_queue" "email" {
  account_id = var.cloudflare_account_id
  name       = "email-queue"
}

resource "cloudflare_queue" "analytics" {
  account_id = var.cloudflare_account_id
  name       = "analytics-queue"
}

resource "cloudflare_queue" "webhook" {
  account_id = var.cloudflare_account_id
  name       = "webhook-queue"
}

# WAF Rules
resource "cloudflare_ruleset" "waf" {
  zone_id     = var.cloudflare_zone_id
  name        = "Elevate WAF Rules"
  description = "Custom WAF rules for Elevate for Humanity"
  kind        = "zone"
  phase       = "http_request_firewall_custom"
  
  rules {
    action = "block"
    expression = "(http.request.uri.path contains \"/admin\" and not ip.src in {1.2.3.4})"
    description = "Block admin access from unauthorized IPs"
  }
  
  rules {
    action = "challenge"
    expression = "(cf.threat_score gt 10)"
    description = "Challenge suspicious traffic"
  }
  
  rules {
    action = "block"
    expression = "(http.request.method eq \"POST\" and rate(5m) gt 100)"
    description = "Rate limit POST requests"
  }
}

# Rate Limiting
resource "cloudflare_rate_limit" "api" {
  zone_id = var.cloudflare_zone_id
  
  threshold = 100
  period    = 60
  
  match {
    request {
      url_pattern = "elevateforhumanity.org/api/*"
    }
  }
  
  action {
    mode    = "challenge"
    timeout = 86400
  }
}

resource "cloudflare_rate_limit" "auth" {
  zone_id = var.cloudflare_zone_id
  
  threshold = 5
  period    = 300
  
  match {
    request {
      url_pattern = "elevateforhumanity.org/api/auth/*"
    }
  }
  
  action {
    mode    = "ban"
    timeout = 3600
  }
}

# DNS Records
# Root domain points to Durable
resource "cloudflare_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  value   = "durable.co" # Durable's CNAME target
  type    = "CNAME"
  proxied = true
  comment = "Durable frontend hosting"
}

# WWW subdomain points to Durable
resource "cloudflare_record" "www" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  value   = "durable.co" # Durable's CNAME target
  type    = "CNAME"
  proxied = true
  comment = "Durable frontend hosting"
}

# API subdomain points to Railway backend
resource "cloudflare_record" "api" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  value   = railway_custom_domain.backend.domain
  type    = "CNAME"
  proxied = true
  comment = "Railway backend API"
}

# Workers subdomain for Cloudflare Workers
resource "cloudflare_record" "workers" {
  zone_id = var.cloudflare_zone_id
  name    = "workers"
  value   = "elevateforhumanity.org"
  type    = "CNAME"
  proxied = true
  comment = "Cloudflare Workers for background jobs"
}

# Uploads subdomain for R2 public access
resource "cloudflare_record" "uploads" {
  zone_id = var.cloudflare_zone_id
  name    = "uploads"
  value   = "elevateforhumanity.org"
  type    = "CNAME"
  proxied = true
  comment = "Cloudflare R2 public uploads"
}

# Page Rules
resource "cloudflare_page_rule" "cache_static" {
  zone_id  = var.cloudflare_zone_id
  target   = "elevateforhumanity.org/assets/*"
  priority = 1
  
  actions {
    cache_level         = "cache_everything"
    edge_cache_ttl      = 31536000
    browser_cache_ttl   = 31536000
  }
}

resource "cloudflare_page_rule" "no_cache_api" {
  zone_id  = var.cloudflare_zone_id
  target   = "elevateforhumanity.org/api/*"
  priority = 2
  
  actions {
    cache_level = "bypass"
  }
}
