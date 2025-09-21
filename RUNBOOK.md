# Elevate4Humanity Autopilot Runbook 📋

**Emergency procedures, rollback commands, and operational playbook for the complete automation suite.**

## 🚨 Emergency Procedures

### Site Down - Immediate Response
```bash
# 1. Check site status
curl -I https://www.elevate4humanity.org

# 2. Check Netlify deploy status
npm run deploy:monitor

# 3. If needed, rollback to previous deployment
./scripts/blue-green-switch.sh $CURRENT_SITE_ID $PREVIOUS_SITE_ID

# 4. Check DNS resolution
nslookup www.elevate4humanity.org

# 5. Emergency contact
# - Slack: #alerts channel
# - Email: admin@elevate4humanity.org
```

### Database Issues
```bash
# 1. Check Supabase status
curl -I $SUPABASE_URL/rest/v1/

# 2. Restore from latest backup
gunzip -c backups/latest.sql.gz | psql $SUPABASE_DB_URL

# 3. Re-sync content to Wix
npm run content:sync

# 4. Verify site functionality
npm run auto:links
```

### SSL Certificate Problems
```bash
# 1. Check certificate status
openssl s_client -connect www.elevate4humanity.org:443 -servername www.elevate4humanity.org

# 2. Re-provision SSL
./scripts/cf-netlify-domain-autopilot.sh

# 3. Force SSL renewal (if using Let's Encrypt)
curl -X POST -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/ssl"
```

## 🔄 Rollback Procedures

### Content Rollback
```bash
# Rollback to specific backup
BACKUP_DATE="2024-01-15"
gunzip -c "backups/elevate4humanity-${BACKUP_DATE}.sql.gz" | psql $SUPABASE_DB_URL

# Re-sync to Wix
npm run content:sync --force

# Verify changes
npm run wix:delete -- --list
```

### Deployment Rollback
```bash
# Method 1: Blue/Green Switch
./scripts/blue-green-switch.sh $CURRENT_SITE_ID $PREVIOUS_SITE_ID

# Method 2: Revert to specific deploy
DEPLOY_ID="previous-deploy-id"
curl -X POST -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys/$DEPLOY_ID/restore"
```

### DNS Rollback
```bash
# Revert DNS to previous configuration
# (Manual process - check Cloudflare dashboard for previous settings)

# Emergency: Point to backup server
# Update CNAME records to point to backup.elevate4humanity.org
```

## 📅 Daily Operations

### Morning Checklist (9 AM)
```bash
# 1. Check overnight automation results
npm run autopilot:dry

# 2. Review backup status
ls -la backups/elevate4humanity-$(date +%Y-%m-%d)*.sql.gz

# 3. Check site performance and SEO
npm run auto:performance
npm run seo:all

# 4. Verify cache status
npm run cache:verify

# 5. Check search engine indexing
curl -s "https://www.elevate4humanity.org/sitemap.xml" | head -20

# 6. Review error logs
tail -f logs/automation.log

# 7. Verify content sync
npm run content:audit
```

### Weekly Maintenance (Sundays)
```bash
# 1. Full system health check
npm run autopilot:full

# 2. Clean up old backups
find backups/ -name "*.sql.gz" -mtime +30 -delete

# 3. Update dependencies
npm audit fix

# 4. SEO and search engine optimization
npm run seo:all
npm run seo:ping

# 5. Cache optimization
npm run cache:purge
npm run cache:verify

# 6. Review and rotate API keys (monthly)
# - Wix Admin API Key
# - Netlify Personal Access Token
# - Cloudflare API Token
# - Google Analytics/Search Console access

# 7. Performance optimization
npm run auto:performance
npm run optimize-images

# 8. Search engine verification
node scripts/seo-verification.js verify
```

## 🔧 Troubleshooting Guide

### "Wix API connection failed"
```bash
# Check API key validity
curl -H "Authorization: $WIX_API_KEY" \
     -H "wix-site-id: $WIX_SITE_ID" \
     "https://www.wixapis.com/cms/v1/data-collections"

# Common fixes:
# 1. Regenerate API key in Wix Dashboard
# 2. Verify site ID is correct
# 3. Check API key permissions (CMS read/write)
```

### "Programs collection not found"
```bash
# Create collection manually in Wix CMS with these fields:
# - title (Text, Required)
# - slug (Text, Required, Unique)
# - summary (Text)
# - content (Rich Text)
# - heroImage (Image)
# - ctaText (Text)
# - ctaUrl (URL)
# - embedHtml (Rich Text)

# Then test:
npm run wix:test
```

### "Dynamic pages not working"
```bash
# 1. Check dynamic page setup in Wix Editor
# 2. Verify URL pattern: /programs/{slug}
# 3. Ensure all fields are bound correctly
# 4. Test with sample program:
npm run wix:single -- test-program "Test Program"
```

### "Netlify deployment failed"
```bash
# Check build logs
curl -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys" | jq '.[0].error_message'

# Common fixes:
# 1. Check build command in netlify.toml
# 2. Verify environment variables
# 3. Check for build errors in logs
```

### "Cloudflare DNS not resolving"
```bash
# Check DNS records
curl -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records"

# Verify propagation
dig www.elevate4humanity.org @8.8.8.8

# Force DNS update
./scripts/cf-netlify-domain-autopilot.sh
```

### "Supabase sync errors"
```bash
# Check database connection
psql $SUPABASE_DB_URL -c "SELECT version();"

# Verify table structure
psql $SUPABASE_DB_URL -c "\d programs"

# Test sync with dry run
npm run content:sync -- --dry-run

# Fix common issues:
npm run content:audit  # Fix slugs
```

## 📊 Monitoring & Alerts

### Key Metrics to Monitor
- Site uptime (should be >99.9%)
- Page load time (should be <3 seconds)
- Lighthouse scores (Performance >90, SEO >90)
- API response times
- Database query performance
- SSL certificate expiry
- Backup success rate

### Alert Thresholds
```bash
# Site down for >2 minutes
# Page load time >5 seconds
# Lighthouse performance <80
# API errors >5% of requests
# Failed backups >1 day
# SSL expiry <30 days
```

### Slack Notifications Setup
```bash
# Set webhook URL
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Test notification
curl -X POST -H "Content-Type: application/json" \
  -d '{"text":"🧪 Test notification from autopilot"}' \
  $SLACK_WEBHOOK_URL
```

## 🔐 Security Procedures

### API Key Rotation (Monthly)
```bash
# 1. Generate new Wix API key
# 2. Update environment variable
# 3. Test connection
npm run wix:test

# 4. Revoke old key in Wix Dashboard
```

### Access Review (Quarterly)
- Review Netlify team members
- Audit Cloudflare user permissions
- Check Supabase database access
- Verify GitHub repository access

### Security Hardening
```bash
# Update Cloudflare security settings
npm run auto:security

# Check for vulnerabilities
npm audit

# Review firewall rules
curl -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/firewall/rules"
```

## 📈 Performance Optimization

### Regular Optimizations
```bash
# 1. Image optimization
npm run optimize-images

# 2. Bundle analysis
npm run build -- --analyze

# 3. Lighthouse audit
npm run auto:performance

# 4. Database query optimization
# Review slow queries in Supabase dashboard
```

### Scaling Considerations
- Monitor Netlify bandwidth usage
- Check Supabase database size
- Review Cloudflare request volume
- Consider CDN optimization for images

## 📞 Emergency Contacts

### Internal Team
- **Technical Lead**: [Your contact info]
- **DevOps**: [DevOps contact]
- **Content Manager**: [Content contact]

### External Services
- **Netlify Support**: support@netlify.com
- **Cloudflare Support**: [Enterprise support if applicable]
- **Supabase Support**: support@supabase.io

### Escalation Path
1. Check automated alerts
2. Run diagnostic commands
3. Attempt automated recovery
4. Contact technical lead
5. Escalate to service providers if needed

## 📝 Change Management

### Before Making Changes
```bash
# 1. Create backup
./scripts/backup-supabase.sh

# 2. Test in staging
npm run content:sync -- --dry-run

# 3. Document changes
# Update this runbook if procedures change
```

### After Changes
```bash
# 1. Verify functionality
npm run auto:all

# 2. Monitor for issues
# Check logs for 24 hours

# 3. Update documentation
# Commit changes to runbook
```

---

**🚨 Remember: When in doubt, create a backup first!**

For urgent issues outside business hours, use the emergency procedures above and document all actions taken for post-incident review.