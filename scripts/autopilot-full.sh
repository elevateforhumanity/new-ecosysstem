#!/usr/bin/env bash
# scripts/autopilot-full.sh
# Complete autopilot: content sync → SEO → deploy → cache purge → search engine ping

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${DOMAIN:-"elevate4humanity.org"}
DRY_RUN=${1:-""}
SKIP_DEPLOY=${SKIP_DEPLOY:-"false"}
SKIP_CACHE=${SKIP_CACHE:-"false"}

echo -e "${BLUE}🚀 Elevate4Humanity Complete Autopilot${NC}"
echo "========================================"
echo "Domain: $DOMAIN"
echo "Mode: $([ "$DRY_RUN" = "--dry-run" ] && echo "DRY RUN" || echo "LIVE")"
echo "Skip Deploy: $SKIP_DEPLOY"
echo "Skip Cache: $SKIP_CACHE"
echo ""

# Function to log with timestamp
log() {
  echo -e "[$(date '+%H:%M:%S')] $1"
}

# Function to handle errors
handle_error() {
  echo -e "${RED}❌ Error in step: $1${NC}"
  echo "Check logs above for details"
  
  # Send error notification if configured
  if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    curl -fsSL -X POST \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"❌ Autopilot failed at step: $1\"}" \
      "$SLACK_WEBHOOK_URL" || true
  fi
  
  exit 1
}

# Step 0: Gitpod optimization
log "${BLUE}🧹 Step 0: Gitpod optimization${NC}"

log "🧹 Cleaning Gitpod workspace..."
./scripts/gitpod-clean.sh || handle_error "Gitpod cleanup"

log "📊 Monitoring Gitpod resources..."
node scripts/gitpod-monitor.js || handle_error "Gitpod monitoring"

log "${GREEN}✅ Gitpod optimization complete${NC}"

# Step 1: Pre-flight checks
log "${BLUE}🔍 Step 1: Pre-flight checks${NC}"

# Check required environment variables
REQUIRED_VARS=(
  "WIX_API_KEY"
  "WIX_SITE_ID"
  "SUPABASE_URL"
  "SUPABASE_SERVICE_KEY"
  "NETLIFY_SITE_ID"
  "NETLIFY_AUTH_TOKEN"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo -e "${RED}❌ Missing required environment variable: $var${NC}"
    exit 1
  fi
done

log "${GREEN}✅ All required environment variables present${NC}"

# Test connections
log "🧪 Testing API connections..."

if ! npm run wix:test >/dev/null 2>&1; then
  handle_error "Wix API connection test"
fi

log "${GREEN}✅ Pre-flight checks passed${NC}"

# Step 2: Content synchronization
log "${BLUE}🔄 Step 2: Content synchronization${NC}"

if [ "$DRY_RUN" = "--dry-run" ]; then
  log "🧪 Running content sync in dry-run mode..."
  npm run content:sync -- --dry-run || handle_error "Content sync (dry-run)"
else
  log "📊 Syncing Supabase → Wix..."
  npm run content:sync || handle_error "Content sync"
  
  log "🔍 Auditing and fixing slugs..."
  npm run content:audit || handle_error "Slug audit"
fi

log "${GREEN}✅ Content synchronization complete${NC}"

# Step 3: SEO optimization
log "${BLUE}🔍 Step 3: SEO optimization${NC}"

log "🗺️ Generating sitemap..."
node scripts/seo-engine.js sitemap || handle_error "Sitemap generation"

log "🤖 Generating robots.txt..."
node scripts/seo-engine.js robots || handle_error "Robots.txt generation"

log "🔍 Creating verification files..."
node scripts/seo-engine.js verification || handle_error "Verification files"

log "📝 Generating meta tags..."
node scripts/seo-engine.js meta || handle_error "Meta tag generation"

log "📊 Injecting Google Analytics..."
node scripts/seo-engine.js ga4 || handle_error "GA4 injection"

log "🏗️ Generating structured data..."
node scripts/seo-engine.js structured-data || handle_error "Structured data"

log "${GREEN}✅ SEO optimization complete${NC}"

# Step 4: ID injection and chat integration
log "${BLUE}🆔 Step 4: ID injection and chat integration${NC}"

log "🔧 Injecting PILOT/COPILOT IDs and chat widget..."
node scripts/inject-ids-and-chat.js || handle_error "ID and chat injection"

log "✅ Verifying IDs and chat on all pages..."
node scripts/verify-ids-and-chat.js || handle_error "ID and chat verification"

log "${GREEN}✅ ID injection and chat integration complete${NC}"

# Step 5: Compliance and quality verification
log "${BLUE}📋 Step 5: Compliance and quality verification${NC}"

log "🏛️ Injecting compliance footer..."
node scripts/inject-compliance-footer.js || handle_error "Compliance footer injection"

log "📋 Checking compliance and accessibility..."
node scripts/check-compliance.js || handle_error "Compliance check"

log "🔗 Verifying links and buttons..."
node scripts/check-links.js || handle_error "Link verification"

log "💳 Verifying Stripe integration..."
node scripts/verify-stripe.js || handle_error "Stripe verification"

log "🤝 Verifying partner programs..."
node scripts/verify-partners.js || handle_error "Partner verification"

log "🏛️ Verifying state/federal programs..."
node scripts/verify-programs.js || handle_error "Program verification"

log "🧭 Verifying navigation and CTAs..."
node scripts/verify-navigation.js || handle_error "Navigation verification"

log "${GREEN}✅ Compliance and quality verification complete${NC}"

# Step 6: Deployment (if not skipped)
if [ "$SKIP_DEPLOY" != "true" ] && [ "$DRY_RUN" != "--dry-run" ]; then
  log "${BLUE}🚀 Step 6: Deployment${NC}"
  
  log "🔍 Running final quality gates..."
  npm run auto:performance || handle_error "Performance audit"
  npm run auto:a11y || handle_error "Accessibility check"
  npm run auto:links || handle_error "Link check"
  
  log "🚀 Deploying with quality gates..."
  npm run deploy:quality || handle_error "Deployment"
  
  log "⏳ Waiting for deployment to complete..."
  sleep 30
  
  log "${GREEN}✅ Deployment complete${NC}"
else
  log "${YELLOW}⏭️ Skipping deployment step${NC}"
fi

# Step 7: Sister sites and navigation
log "${BLUE}🔗 Step 7: Sister sites and navigation${NC}"

log "🏗️ Building sister site landing pages..."
node scripts/build-sister-landing-pages.js || handle_error "Sister site pages"

log "🧭 Injecting sister site navigation..."
node scripts/inject-sister-nav.js || handle_error "Sister site navigation"

log "${GREEN}✅ Sister sites and navigation complete${NC}"

# Step 8: Blog and content pages
log "${BLUE}📰 Step 8: Blog and content pages${NC}"

log "📝 Building blog pages..."
node scripts/build-blog.js || handle_error "Blog build"

log "${GREEN}✅ Blog and content pages complete${NC}"

# Step 9: Hero video generation
log "${BLUE}🎬 Step 9: Hero video generation${NC}"

if [ "$DRY_RUN" != "--dry-run" ]; then
  log "🎨 Generating professional hero video..."
  node scripts/make-hero-video.js || handle_error "Hero video generation"
  
  log "🔄 Replacing homepage hero video..."
  node scripts/replace-home-hero-video.js || handle_error "Hero video replacement"
  
  log "${GREEN}✅ Hero video generation complete${NC}"
else
  log "${YELLOW}🧪 Dry run: Skipping hero video generation${NC}"
fi

# Step 10: Content blocks and organization info
log "${BLUE}🏛️ Step 10: Content blocks and organization info${NC}"

log "📋 Injecting all pages index..."
node scripts/inject-all-pages-index.js || handle_error "All pages index"

log "📜 Injecting compliance block..."
node scripts/inject-compliance.js || handle_error "Compliance block"

log "💰 Injecting funders block..."
node scripts/inject-funders.js || handle_error "Funders block"

log "🏛️ Injecting nonprofit organization info..."
node scripts/inject-nonprofit.js || handle_error "Nonprofit block"

log "${GREEN}✅ Content blocks and organization info complete${NC}"

# Step 11: Asset optimization and lazy rendering
log "${BLUE}💾 Step 11: Asset optimization and lazy rendering${NC}"

log "📤 Offloading heavy assets to storage..."
node scripts/offload-assets.js || handle_error "Asset offloading"

log "⚡ Setting up lazy rendering..."
node scripts/lazy-render.js || handle_error "Lazy rendering setup"

log "${GREEN}✅ Asset optimization and lazy rendering complete${NC}"

# Step 12: Cache management (if not skipped)
if [ "$SKIP_CACHE" != "true" ] && [ "$DRY_RUN" != "--dry-run" ]; then
  log "${BLUE}🧹 Step 12: Cache management${NC}"
  log "${BLUE}🧹 Step 11: Cache management${NC}"
  
  log "🌩️ Purging Cloudflare cache..."
  node scripts/cache-purge.js cloudflare || handle_error "Cloudflare cache purge"
  
  log "🔄 Generating cache-busting manifest..."
  node scripts/cache-purge.js manifest || handle_error "Cache manifest"
  
  log "⏳ Waiting for cache propagation..."
  sleep 10
  
  log "🔍 Verifying cache purge..."
  node scripts/cache-purge.js verify || handle_error "Cache verification"
  
  log "${GREEN}✅ Cache management complete${NC}"
else
  log "${YELLOW}⏭️ Skipping cache management step${NC}"
fi

# Step 13: Search engine notification
log "${BLUE}📡 Step 13: Search engine notification${NC}"

if [ "$DRY_RUN" != "--dry-run" ]; then
  log "📡 Pinging search engines..."
  node scripts/seo-engine.js ping || handle_error "Search engine ping"
  
  log "${GREEN}✅ Search engines notified${NC}"
else
  log "${YELLOW}🧪 Dry run: Skipping search engine ping${NC}"
fi

# Step 8: Verification and reporting
log "${BLUE}📊 Step 8: Verification and reporting${NC}"

log "🔍 Verifying site accessibility..."
SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://www.$DOMAIN" || echo "000")

if [ "$SITE_STATUS" = "200" ]; then
  log "${GREEN}✅ Site is accessible (HTTP $SITE_STATUS)${NC}"
else
  log "${YELLOW}⚠️ Site returned HTTP $SITE_STATUS${NC}"
fi

log "🗺️ Verifying sitemap..."
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://www.$DOMAIN/sitemap.xml" || echo "000")

if [ "$SITEMAP_STATUS" = "200" ]; then
  log "${GREEN}✅ Sitemap is accessible (HTTP $SITEMAP_STATUS)${NC}"
else
  log "${YELLOW}⚠️ Sitemap returned HTTP $SITEMAP_STATUS${NC}"
fi

# Generate completion report
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
REPORT_FILE="autopilot-report-$(date +%Y%m%d-%H%M%S).txt"

cat > "$REPORT_FILE" << EOF
Elevate4Humanity Autopilot Completion Report
============================================

Execution Time: $TIMESTAMP
Domain: $DOMAIN
Mode: $([ "$DRY_RUN" = "--dry-run" ] && echo "DRY RUN" || echo "LIVE")

Steps Completed:
✅ Pre-flight checks
✅ Content synchronization
✅ SEO optimization
$([ "$SKIP_DEPLOY" != "true" ] && [ "$DRY_RUN" != "--dry-run" ] && echo "✅ Deployment" || echo "⏭️ Deployment (skipped)")
$([ "$DRY_RUN" != "--dry-run" ] && echo "✅ Hero video generation" || echo "⏭️ Hero video generation (dry run)")
$([ "$SKIP_CACHE" != "true" ] && [ "$DRY_RUN" != "--dry-run" ] && echo "✅ Cache management" || echo "⏭️ Cache management (skipped)")
$([ "$DRY_RUN" != "--dry-run" ] && echo "✅ Search engine notification" || echo "⏭️ Search engine notification (dry run)")
✅ Verification and reporting

Site Status: HTTP $SITE_STATUS
Sitemap Status: HTTP $SITEMAP_STATUS

URLs to verify:
- Homepage: https://www.$DOMAIN
- Programs: https://www.$DOMAIN/programs
- Sitemap: https://www.$DOMAIN/sitemap.xml
- Robots: https://www.$DOMAIN/robots.txt

Next Steps:
- Monitor site performance for 24 hours
- Check Google Search Console for indexing
- Verify analytics are tracking properly
- Review any error logs

EOF

log "📋 Report generated: $REPORT_FILE"

# Send success notification
if [ -n "${SLACK_WEBHOOK_URL:-}" ] && [ "$DRY_RUN" != "--dry-run" ]; then
  NOTIFICATION_TEXT="🎉 Autopilot completed successfully for $DOMAIN"
  if [ "$SKIP_DEPLOY" = "true" ]; then
    NOTIFICATION_TEXT="$NOTIFICATION_TEXT (deployment skipped)"
  fi
  
  curl -fsSL -X POST \
    -H "Content-Type: application/json" \
    -d "{\"text\":\"$NOTIFICATION_TEXT\",\"username\":\"Autopilot Bot\"}" \
    "$SLACK_WEBHOOK_URL" || true
fi

# Final summary
echo ""
echo -e "${GREEN}🎉 Autopilot execution complete!${NC}"
echo ""
echo "📋 Summary:"
echo "   Domain: https://www.$DOMAIN"
echo "   Mode: $([ "$DRY_RUN" = "--dry-run" ] && echo "DRY RUN" || echo "LIVE EXECUTION")"
echo "   Report: $REPORT_FILE"
echo ""
echo "🔗 Quick verification links:"
echo "   🏠 Homepage: https://www.$DOMAIN"
echo "   📚 Programs: https://www.$DOMAIN/programs"
echo "   🗺️ Sitemap: https://www.$DOMAIN/sitemap.xml"
echo "   🤖 Robots: https://www.$DOMAIN/robots.txt"
echo ""
echo "📊 Next steps:"
echo "   1. Monitor site performance"
echo "   2. Check Google Search Console"
echo "   3. Verify analytics tracking"
echo "   4. Review error logs"
echo ""

if [ "$DRY_RUN" = "--dry-run" ]; then
  echo -e "${BLUE}💡 To run live: ./scripts/autopilot-full.sh${NC}"
fi

echo -e "${GREEN}✨ All systems operational!${NC}"