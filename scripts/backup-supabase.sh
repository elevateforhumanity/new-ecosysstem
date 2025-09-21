#!/usr/bin/env bash
# scripts/backup-supabase.sh
# Automated Supabase database backup with cloud storage

set -euo pipefail

: "${SUPABASE_DB_URL:?Missing SUPABASE_DB_URL environment variable}"

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DATE_ONLY=$(date +%Y-%m-%d)
BACKUP_FILE="${BACKUP_DIR}/elevate4humanity-${TIMESTAMP}.sql.gz"
LATEST_LINK="${BACKUP_DIR}/latest.sql.gz"

echo "💾 Starting Supabase backup..."
echo "   Database: ${SUPABASE_DB_URL%%@*}@***"
echo "   Backup file: $BACKUP_FILE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create database dump
echo "📦 Creating database dump..."
if command -v pg_dump >/dev/null 2>&1; then
  pg_dump "$SUPABASE_DB_URL" | gzip > "$BACKUP_FILE"
else
  echo "❌ pg_dump not found. Installing postgresql-client..."
  
  # Try to install pg_dump
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update && sudo apt-get install -y postgresql-client
  elif command -v brew >/dev/null 2>&1; then
    brew install postgresql
  else
    echo "❌ Cannot install postgresql-client. Please install manually."
    exit 1
  fi
  
  # Retry dump
  pg_dump "$SUPABASE_DB_URL" | gzip > "$BACKUP_FILE"
fi

# Verify backup was created
if [ ! -f "$BACKUP_FILE" ] || [ ! -s "$BACKUP_FILE" ]; then
  echo "❌ Backup file was not created or is empty"
  exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "✅ Database dump created: $BACKUP_SIZE"

# Create symlink to latest backup
ln -sf "$(basename "$BACKUP_FILE")" "$LATEST_LINK"
echo "🔗 Latest backup symlink updated"

# Upload to Cloudflare R2 (if configured)
if [ -n "${R2_ACCESS_KEY:-}" ] && [ -n "${R2_SECRET_KEY:-}" ] && [ -n "${R2_BUCKET:-}" ]; then
  echo "☁️ Uploading to Cloudflare R2..."
  
  # Install AWS CLI if not present (for R2 compatibility)
  if ! command -v aws >/dev/null 2>&1; then
    echo "📦 Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
  fi
  
  # Configure AWS CLI for R2
  export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY"
  export AWS_SECRET_ACCESS_KEY="$R2_SECRET_KEY"
  export AWS_DEFAULT_REGION="auto"
  
  # Upload to R2
  R2_ENDPOINT="${R2_ENDPOINT:-https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com}"
  R2_KEY="backups/supabase/${DATE_ONLY}/$(basename "$BACKUP_FILE")"
  
  aws s3 cp "$BACKUP_FILE" "s3://${R2_BUCKET}/${R2_KEY}" \
    --endpoint-url "$R2_ENDPOINT" \
    --no-verify-ssl
  
  echo "✅ Backup uploaded to R2: s3://${R2_BUCKET}/${R2_KEY}"
  
  # Also upload as latest
  aws s3 cp "$BACKUP_FILE" "s3://${R2_BUCKET}/backups/supabase/latest.sql.gz" \
    --endpoint-url "$R2_ENDPOINT" \
    --no-verify-ssl
  
  echo "✅ Latest backup updated in R2"
else
  echo "⚠️ R2 credentials not configured, backup stored locally only"
fi

# Upload to AWS S3 (alternative cloud storage)
if [ -n "${AWS_S3_BUCKET:-}" ] && [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "${AWS_SECRET_ACCESS_KEY:-}" ]; then
  echo "☁️ Uploading to AWS S3..."
  
  S3_KEY="backups/supabase/${DATE_ONLY}/$(basename "$BACKUP_FILE")"
  
  aws s3 cp "$BACKUP_FILE" "s3://${AWS_S3_BUCKET}/${S3_KEY}"
  aws s3 cp "$BACKUP_FILE" "s3://${AWS_S3_BUCKET}/backups/supabase/latest.sql.gz"
  
  echo "✅ Backup uploaded to S3: s3://${AWS_S3_BUCKET}/${S3_KEY}"
fi

# Cleanup old local backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "elevate4humanity-*.sql.gz" -mtime +7 -delete 2>/dev/null || true

REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "elevate4humanity-*.sql.gz" | wc -l)
echo "📊 Local backups retained: $REMAINING_BACKUPS"

# Generate backup report
cat > "${BACKUP_DIR}/backup-report-${DATE_ONLY}.txt" << EOF
Elevate4Humanity Supabase Backup Report
Date: $(date)
Backup File: $BACKUP_FILE
Size: $BACKUP_SIZE
Status: Success

Database: ${SUPABASE_DB_URL%%@*}@***
Local Path: $BACKUP_FILE
Cloud Storage: ${R2_BUCKET:-${AWS_S3_BUCKET:-"Not configured"}}

Local Backups: $REMAINING_BACKUPS files
Retention: 7 days
EOF

echo "📋 Backup report: ${BACKUP_DIR}/backup-report-${DATE_ONLY}.txt"

# Send notification (if configured)
if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
  curl -fsSL -X POST \
    -H "Content-Type: application/json" \
    -d "{\"text\":\"💾 Supabase backup completed successfully\\nFile: \`$(basename "$BACKUP_FILE")\`\\nSize: $BACKUP_SIZE\"}" \
    "$SLACK_WEBHOOK_URL" || true
  
  echo "📱 Slack notification sent"
fi

echo ""
echo "🎉 Backup completed successfully!"
echo ""
echo "📋 Summary:"
echo "   File: $BACKUP_FILE"
echo "   Size: $BACKUP_SIZE"
echo "   Cloud: ${R2_BUCKET:-${AWS_S3_BUCKET:-"Local only"}}"
echo ""
echo "🔧 Restore command:"
echo "   gunzip -c $BACKUP_FILE | psql \$SUPABASE_DB_URL"
echo ""
echo "📁 All backups:"
ls -lah "$BACKUP_DIR"/elevate4humanity-*.sql.gz 2>/dev/null || echo "   No backups found"