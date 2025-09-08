# DNS settings for Vercel deployment

A Record (apex domain):
- Name: @
- Type: A
- Value: 76.76.21.21

CNAME Record (www subdomain):
- Name: www
- Type: CNAME
- Value: cname.vercel-dns.com

Instructions:
1. Log in to your domain registrar (GoDaddy, Google Domains, Namecheap, etc.).
2. Add the above A and CNAME records to your DNS settings.
3. In your Vercel dashboard, add both elevateforhumanity.org and www.elevateforhumanity.org as domains for your project.
4. Complete any verification steps Vercel requests (TXT or CNAME record).
5. Wait for DNS propagation (usually 1–2 hours).
