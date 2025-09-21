#!/usr/bin/env bash
set -e
if [ -z "$CF_API_TOKEN" ] || [ -z "$CF_ZONE_ID" ]; then
  echo "⚠️ Cloudflare credentials not set"
  exit 0
fi
echo "🌩️ Purging Cloudflare cache..."
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything": true}'
echo "✅ Cache purged"
