#!/usr/bin/env bash
set -euo pipefail

### === CONFIG: EDIT THESE 3 LINES ===
AWS_S3_BUCKET="your-bucket-name-here"        # e.g., efh-site-prod
CLOUDFRONT_DISTRIBUTION_ID="DXXXXXXXXXXXXX"  # from your CloudFront console
SITE_URL="https://www.example.com"           # public URL used in sitemap

### Optional: Node version guard (keeps builds consistent)
REQUIRED_NODE_MAJOR=18
NODE_MAJOR=$(node -v | sed -E 's/^v([0-9]+).*/\1/')
if [[ "${NODE_MAJOR}" -ne "${REQUIRED_NODE_MAJOR}" ]]; then
  echo "⚠️  Node v${REQUIRED_NODE_MAJOR}.x recommended (you have $(node -v)). Continuing…"
fi

### 0) Pre-flight checks
command -v aws >/dev/null || { echo "❌ AWS CLI not found. Install & run: aws configure"; exit 1; }
aws sts get-caller-identity >/dev/null || { echo "❌ AWS not authenticated. Run: aws configure"; exit 1; }
command -v npm >/dev/null || { echo "❌ npm not found"; exit 1; }

### 1) Build (creates ./dist)
echo "🏗️  Building app…"
npm ci || npm i --legacy-peer-deps
npm run build

### 2) Ensure robots.txt + sitemap.xml exist inside dist/
mkdir -p dist
# robots.txt (idempotent)
cat > dist/robots.txt <<EOF
User-agent: *
Allow: /
Sitemap: ${SITE_URL%/}/sitemap.xml
EOF

# sitemap.xml (basic generator from .html files)
echo "🗺️  Generating sitemap.xml…"
SITEMAP_TMP="$(mktemp)"
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  # root index
  if [[ -f "dist/index.html" ]]; then
    echo "  <url><loc>${SITE_URL%/}/</loc></url>"
  fi
  # other html files
  # maps dist/about/index.html -> /about/
  # maps dist/page.html -> /page.html
  while IFS= read -r -d '' file; do
    # strip leading dist/
    path="${file#dist/}"
    url_path=""
    if [[ "${path}" == "index.html" ]]; then
      continue
    elif [[ "${path}" == */index.html ]]; then
      url_path="/${path%/index.html}/"
    else
      url_path="/${path}"
    fi
    echo "  <url><loc>${SITE_URL%/}${url_path}</loc></url>"
  done < <(find dist -type f -name '*.html' -print0)
  echo '</urlset>'
} > "${SITEMAP_TMP}"
mv "${SITEMAP_TMP}" dist/sitemap.xml

### 3) Create bucket if missing (safe if exists)
echo "🪣 Ensuring bucket s3://${AWS_S3_BUCKET} exists…"
aws s3api head-bucket --bucket "${AWS_S3_BUCKET}" 2>/dev/null || \
  aws s3 mb "s3://${AWS_S3_BUCKET}"

### 4) Upload with smart caching
echo "⬆️  Uploading HTML with no-cache…"
aws s3 sync dist "s3://${AWS_S3_BUCKET}" \
  --delete \
  --exclude "*" --include "*.html" --include "robots.txt" --include "sitemap.xml" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html; charset=utf-8"

echo "⬆️  Uploading assets with long cache…"
aws s3 sync dist "s3://${AWS_S3_BUCKET}" \
  --delete \
  --exclude "*.html" --exclude "robots.txt" --exclude "sitemap.xml" \
  --cache-control "public, max-age=31536000, immutable"

### 5) CloudFront cache bust
if [[ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]]; then
  echo "🧹 Creating CloudFront invalidation…"
  aws cloudfront create-invalidation \
    --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
    --paths "/*" > /dev/null
  echo "✅ Invalidation requested."
else
  echo "ℹ️  No CLOUDFRONT_DISTRIBUTION_ID set—skipping invalidation."
fi

### 6) Done
echo "🎉 Deploy complete: ${SITE_URL}"
