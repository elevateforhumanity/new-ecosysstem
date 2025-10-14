# PostgreSQL Database Configuration

# Database (assuming managed Postgres like Supabase or AWS RDS)
# Note: This is for configuration only. The database itself should be created
# through your cloud provider's console or their Terraform provider.

# Create database roles
resource "postgresql_role" "app_user" {
  name     = "elevate_app"
  login    = true
  password = random_password.app_user_password.result
}

resource "postgresql_role" "readonly_user" {
  name     = "elevate_readonly"
  login    = true
  password = random_password.readonly_password.result
}

# Generate secure passwords
resource "random_password" "app_user_password" {
  length  = 32
  special = true
}

resource "random_password" "readonly_password" {
  length  = 32
  special = true
}

# Grant permissions
resource "postgresql_grant" "app_user_tables" {
  database    = "elevate_production"
  role        = postgresql_role.app_user.name
  schema      = "public"
  object_type = "table"
  privileges  = ["SELECT", "INSERT", "UPDATE", "DELETE"]
}

resource "postgresql_grant" "readonly_tables" {
  database    = "elevate_production"
  role        = postgresql_role.readonly_user.name
  schema      = "public"
  object_type = "table"
  privileges  = ["SELECT"]
}

# Enable required extensions
resource "postgresql_extension" "uuid_ossp" {
  name     = "uuid-ossp"
  database = "elevate_production"
}

resource "postgresql_extension" "pgcrypto" {
  name     = "pgcrypto"
  database = "elevate_production"
}

# Store credentials in AWS Secrets Manager or similar
resource "aws_secretsmanager_secret" "database_credentials" {
  name        = "elevate/production/database"
  description = "Database credentials for Elevate production"
  
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "database_credentials" {
  secret_id = aws_secretsmanager_secret.database_credentials.id
  secret_string = jsonencode({
    username = postgresql_role.app_user.name
    password = random_password.app_user_password.result
    host     = split("@", split("//", var.database_url)[1])[1]
    port     = 5432
    database = "elevate_production"
    url      = "postgresql://${postgresql_role.app_user.name}:${random_password.app_user_password.result}@${split("@", split("//", var.database_url)[1])[1]}:5432/elevate_production"
  })
}

# Outputs
output "app_user_name" {
  value       = postgresql_role.app_user.name
  description = "Application database user"
}

output "readonly_user_name" {
  value       = postgresql_role.readonly_user.name
  description = "Read-only database user"
}

output "database_secret_arn" {
  value       = aws_secretsmanager_secret.database_credentials.arn
  description = "ARN of the database credentials secret"
}
