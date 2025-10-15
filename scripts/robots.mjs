import { writeFileSync } from 'node:fs'

const SITE_URL = process.env.VITE_SITE_URL || 'https://elevateforhumanity.org';

const txt = `# Elevate for Humanity - Robots.txt
# Generated: ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /

# Disallow private/auth areas
Disallow: /api/
Disallow: /admin/
Disallow: /admin-console
Disallow: /_next/
Disallow: /private/

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Allow all major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /
`

writeFileSync('dist/robots.txt', txt)
console.log('✅ robots.txt generated')
