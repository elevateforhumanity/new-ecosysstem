# SISTER SITE DOMAIN CONFIGURATION

## Domain Setup for selfishinc.org

### DNS Configuration
Add these DNS records to selfishinc.org:

```
Type: CNAME
Name: www
Value: elevateforhumanity.org

Type: A
Name: @
Value: [Your hosting IP]

Type: TXT
Name: @
Value: "v=spf1 include:_spf.google.com ~all"
```

### Netlify/Vercel Setup
1. Add custom domain: selfishinc.org
2. Add www.selfishinc.org
3. Enable SSL certificate
4. Set up redirects

### Cloudflare Setup (Recommended)
1. Add selfishinc.org to Cloudflare
2. Point DNS to main hosting
3. Enable SSL/TLS encryption
4. Set up page rules for redirects

## Redirect Configuration

### Main Site Redirects
```
# _redirects file
/programs/* https://elevateforhumanity.org/programs/:splat 301
/apply/* https://elevateforhumanity.org/apply/:splat 301
/student-portal/* https://elevateforhumanity.org/student-portal/:splat 301
```

### Sister Site Specific Pages
- / → selfishinc landing page
- /business → business programs
- /leadership → leadership training
- /strategy → business strategy
- /contact → contact form

## Implementation Steps

1. **Upload Landing Page**
   - Deploy selfishinc-landing.html as index.html
   - Ensure all assets are accessible

2. **Configure Domain**
   - Point selfishinc.org DNS to hosting
   - Set up SSL certificate
   - Test domain resolution

3. **Set Up Redirects**
   - Configure redirects to main site
   - Test all redirect paths
   - Ensure proper tracking

4. **Test Everything**
   - Verify site loads on selfishinc.org
   - Test all links and redirects
   - Check mobile responsiveness
   - Verify analytics tracking

## Monitoring
- Set up uptime monitoring
- Track conversion rates
- Monitor redirect performance
- Check SEO rankings