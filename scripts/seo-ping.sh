#!/usr/bin/env bash
set -e
DOMAIN=${DOMAIN:-elevateforhumanity.org}
echo "📡 Pinging search engines..."
curl -s "https://www.google.com/ping?sitemap=https://$DOMAIN/sitemap.xml" || true
curl -s "https://www.bing.com/ping?sitemap=https://$DOMAIN/sitemap.xml" || true
echo "✅ Search engines pinged"
