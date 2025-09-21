#!/usr/bin/env bash
set -e
if [ -z "$NETLIFY_SITE_ID" ] || [ -z "$NETLIFY_AUTH_TOKEN" ]; then
  echo "⚠️ Netlify credentials not set"
  exit 0
fi
echo "🚀 Triggering Netlify deploy..."
curl -X POST -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/builds" \
  -d '{"clear_cache": true}' -H "Content-Type: application/json"
echo "✅ Deploy triggered"
