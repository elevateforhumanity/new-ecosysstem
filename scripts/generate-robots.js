import fs from "fs";
const domain = process.env.DOMAIN || "www.elevate4humanity.org";
const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /.well-known/

Sitemap: https://${domain}/sitemap.xml

# Anti-AI scraping
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /`;

fs.writeFileSync("dist/robots.txt", robots);
console.log("✅ Generated robots.txt");
