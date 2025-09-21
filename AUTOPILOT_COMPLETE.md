# 🚀 EFH Autopilot System v2.0

**Complete non-interactive automation system for Elevate for Humanity's 97k+ page ecosystem.**

## 🎯 Overview

The EFH Autopilot is a comprehensive, self-healing automation system that:

- ✅ **Builds and deploys** your entire site automatically
- 🆔 **Injects PILOT/COPILOT IDs** and chat widgets on every page
- 🛡️ **Enforces security** with watermarking and copyright protection
- 📊 **Generates sitemaps** and optimizes SEO
- 🔍 **Monitors quality** with accessibility, link, and compliance checks
- 🕵️ **Detects duplication** and generates DMCA takedown notices
- 📱 **Sends notifications** via Slack and email
- 🔄 **Self-heals** with automatic retries and watchdog monitoring

## 🚀 Quick Start

### Option 1: One-Command Setup

```bash
# Run this in your repo root to set up everything
bash scripts/efh-autopilot-quickstart.sh
```

### Option 2: Manual Setup

1. **Set Environment Variables** (in Gitpod or your environment):

```bash
# Required
export DOMAIN="www.elevate4humanity.org"
export NETLIFY_SITE_ID="your-site-id"
export NETLIFY_AUTH_TOKEN="your-token"
export CF_API_TOKEN="your-cloudflare-token"
export CF_ZONE_ID="your-zone-id"
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_KEY="your-service-key"
export PILOT_ID="pp-xxxxxxxxxxxxxxxx"
export COPILOT_ID="cp-xxxxxxxxxxxxxxxx"
export CHAT_PROVIDER="crisp"  # or "intercom" or "tawk"
export CHAT_ID="your-chat-id"

# Optional but recommended
export SLACK_WEBHOOK_URL="your-slack-webhook"
export STRIPE_SECRET_KEY="sk_live_..."
export BING_API_KEY="your-bing-key"
export GOOGLE_API_KEY="your-google-key"
export R2_BUCKET="efh-builds"
export R2_ENDPOINT="your-r2-endpoint"
```

2. **Install Dependencies**:

```bash
npm install
```

3. **Start Autopilot**:

```bash
bash scripts/bootstrap.sh
```

## 📁 System Architecture

```
scripts/
├── autopilot-run.js           # Main orchestrator with retries & checkpoints
├── autopilot-loop.sh          # Continuous operation wrapper
├── watchdog.sh                # Process monitoring & auto-restart
├── bootstrap.sh               # Startup script
├── env-check.js               # Environment validation
├── inject-ids-and-chat.js     # PILOT/COPILOT ID & chat injection
├── verify-ids-and-chat.js     # Verification of injected content
├── inject-security-headers.js # Security headers & watermarking
├── detect-duplication.js      # Content duplication monitoring
├── detect-orphaned-pages.js   # Find unlinked pages
├── check-deploy.js            # Netlify deploy health checks
├── notification-system.js     # Slack/email notifications
├── gitpod-clean.sh            # Workspace cleanup
├── gitpod-monitor.js          # Resource monitoring
├── offload-assets.js          # Asset optimization
└── lazy-render.js             # Lazy page rendering

config/
├── autopilot.config.json      # Main configuration
├── .gitpod.yml                # Gitpod auto-start
└── .gitpod.Dockerfile         # Container setup
```

## ⚙️ Configuration

### autopilot.config.json

```json
{
  "max_retries": 5,
  "retry_backoff_secs": 30,
  "critical_steps": [
    "build",
    "collect_urls", 
    "sitemaps",
    "ids_chat_injection",
    "qa_accessibility",
    "qa_links",
    "deploy",
    "purge",
    "seo_ping"
  ],
  "non_critical_steps": [
    "wix_sync",
    "hero_video",
    "security_injection",
    "duplication_check"
  ],
  "force_deploy_on_warning": false,
  "notification": {
    "enabled": true,
    "slack_webhook": "",
    "email_enabled": false
  }
}
```

## 🔄 Workflow Steps

### Critical Steps (Must Pass)
1. **Build** - Compile and generate site
2. **Collect URLs** - Scan all generated pages
3. **Sitemaps** - Generate XML sitemaps
4. **IDs & Chat Injection** - Add PILOT/COPILOT IDs and chat widgets
5. **QA Accessibility** - Check WCAG compliance
6. **QA Links** - Verify all links work
7. **Deploy** - Push to Netlify
8. **Purge** - Clear Cloudflare cache
9. **SEO Ping** - Notify search engines

### Non-Critical Steps (Warnings Only)
- **Wix Sync** - Synchronize CMS content
- **Hero Video** - Generate promotional videos
- **Security Injection** - Add watermarks and copyright
- **Duplication Check** - Scan for content theft

## 🛡️ Security Features

### Digital Watermarking
Every page gets invisible watermarks:
```html
<div style="display:none">
  EFH-WATERMARK: siteID=efh-main build=123456 hash=abc123
</div>
```

### Copyright Protection
- Automatic copyright footers
- DMCA policy pages
- Canonical URL protection
- Anti-scraping headers

### Security Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Content-Security-Policy: [comprehensive policy]
X-Robots-Tag: noai, noscrape
```

## 🕵️ Content Protection

### Duplication Detection
- Searches Bing/Google for watermarked content
- Identifies unauthorized copies
- Generates DMCA takedown notices automatically

### DMCA Automation
```bash
# Check for duplications
node scripts/detect-duplication.js

# Generated notices saved to:
dist/dmca-notices/dmca-domain-com-timestamp.txt
```

## 📊 Monitoring & Notifications

### Slack Notifications
- ✅ Autopilot success/failure
- 🚨 Deploy health alerts
- 🛡️ Security incidents
- 🕵️ Content duplication detected
- 📊 Daily reports

### Health Monitoring
- CPU, memory, disk usage
- Deploy status verification
- Link health checks
- Resource optimization

## 🔧 Manual Operations

### Start/Stop Autopilot
```bash
# Start
bash scripts/bootstrap.sh

# Stop
pkill -f autopilot-loop.sh
pkill -f watchdog.sh

# Check status
tail -f .gp-logs/autopilot.out
```

### Individual Steps
```bash
# Run specific verification
node scripts/verify-ids-and-chat.js
node scripts/check-compliance.js
node scripts/verify-programs.js

# Manual deployment
bash scripts/netlify-deploy.sh
bash scripts/cf-purge.sh
bash scripts/seo-ping.sh
```

### Cleanup & Optimization
```bash
# Clean workspace
bash scripts/gitpod-clean.sh

# Monitor resources
node scripts/gitpod-monitor.js

# Offload large assets
node scripts/offload-assets.js
```

## 📈 Performance Optimization

### Gitpod Optimization
- Automatic cleanup of temp files
- Memory and disk monitoring
- Asset offloading to R2/S3
- Lazy rendering for 97k+ pages

### Build Optimization
- Checkpoint system prevents re-running completed steps
- Progressive backoff on retries
- Parallel processing where possible
- Smart caching strategies

## 🚨 Troubleshooting

### Common Issues

**Environment Variables Missing**
```bash
node scripts/env-check.js
# Shows missing required variables
```

**Deploy Failures**
```bash
# Check deploy status
node scripts/check-deploy.js

# View logs
tail -f .gp-logs/autopilot.out
```

**High Resource Usage**
```bash
# Clean workspace
bash scripts/gitpod-clean.sh

# Check resource usage
node scripts/gitpod-monitor.js
```

### Debug Mode
```bash
# Run with verbose logging
DEBUG=1 node scripts/autopilot-run.js

# Dry run mode
bash scripts/autopilot-loop.sh --dry-run
```

## 📋 Maintenance

### Daily Tasks (Automated)
- ✅ Content sync from Supabase/Wix
- ✅ Security scan and watermark verification
- ✅ Duplication detection
- ✅ Performance monitoring
- ✅ Daily report generation

### Weekly Tasks
- Review DMCA notices generated
- Check resource usage trends
- Update security policies
- Verify backup systems

### Monthly Tasks
- Review and update environment variables
- Security audit
- Performance optimization review
- Update dependencies

## 🔗 Integration Points

### External Services
- **Netlify** - Hosting and deployment
- **Cloudflare** - CDN and security
- **Supabase** - Database and content
- **Wix** - CMS integration
- **Stripe** - Payment processing
- **Slack** - Notifications
- **Search Engines** - SEO pings

### APIs Used
- Netlify Deploy API
- Cloudflare Cache API
- Bing Search API
- Google Custom Search API
- Supabase REST API
- Wix Headless API

## 📊 Metrics & Reporting

### Autopilot Metrics
- Success rate percentage
- Average build time
- Step completion rates
- Error frequency

### Security Metrics
- Pages protected with watermarks
- Duplication incidents detected
- DMCA notices generated
- Security headers compliance

### Performance Metrics
- Site load times
- Resource usage trends
- Cache hit rates
- SEO ranking changes

## 🎯 Best Practices

### Environment Management
- Use Gitpod environment variables
- Never commit secrets to git
- Rotate API keys regularly
- Monitor usage quotas

### Content Management
- Keep watermarks updated
- Review copyright policies
- Monitor for unauthorized use
- Maintain DMCA compliance

### System Maintenance
- Monitor logs regularly
- Keep dependencies updated
- Test backup procedures
- Document configuration changes

## 🆘 Support

### Getting Help
1. Check logs in `.gp-logs/`
2. Run environment check: `node scripts/env-check.js`
3. Review configuration in `autopilot.config.json`
4. Check Slack notifications for alerts

### Emergency Procedures
```bash
# Emergency stop
pkill -f autopilot

# Emergency cleanup
bash scripts/gitpod-clean.sh

# Emergency deploy
bash scripts/netlify-deploy.sh
bash scripts/cf-purge.sh
```

---

## 🎉 Success!

Your Autopilot system is now:
- ✅ Building and deploying automatically
- 🛡️ Protecting content with watermarks
- 📊 Monitoring quality and performance
- 🔄 Self-healing with retries and watchdog
- 📱 Sending notifications on status changes

**The system runs continuously in Gitpod and requires no manual intervention.**

For questions or issues, check the logs or contact the development team.