import fs from "fs";
import path from "path";

const DIST = "dist";

// Security headers and watermarking
const BUILD_ID = process.env.BUILD_ID || Date.now().toString();
const SITE_HASH = process.env.SITE_HASH || Math.random().toString(36).substring(2, 15);

function generateWatermark() {
  return `EFH-WATERMARK: siteID=efh-main build=${BUILD_ID} hash=${SITE_HASH} timestamp=${new Date().toISOString()}`;
}

function generateCopyrightFooter() {
  return `
<footer class="efh-copyright" style="background: #f8f9fa; padding: 20px; margin-top: 40px; border-top: 1px solid #dee2e6; font-size: 14px; line-height: 1.5;">
  <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
    <p style="margin: 0 0 10px 0; font-weight: 600;">© ${new Date().getFullYear()} Elevate for Humanity. All rights reserved.</p>
    <p style="margin: 0 0 10px 0;">
      Licensed for workforce training & non-profit use. 
      Unauthorized duplication is prohibited.
    </p>
    <p style="margin: 0; font-size: 12px; color: #6c757d;">
      Content protected by digital watermarking. 
      <a href="https://elevateforhumanity.org/copyright" style="color: #2563eb;">Copyright Policy</a> | 
      <a href="https://elevateforhumanity.org/dmca" style="color: #2563eb;">DMCA</a>
    </p>
  </div>
</footer>`;
}

function generateCanonicalBacklink(currentPath) {
  const baseUrl = process.env.SITE_URL || "https://elevateforhumanity.org";
  const canonicalUrl = currentPath === 'index.html' ? baseUrl : `${baseUrl}/${currentPath.replace('.html', '')}`;
  
  return `
<!-- Canonical and backlink protection -->
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:url" content="${canonicalUrl}">
<meta name="twitter:url" content="${canonicalUrl}">
<meta name="source-site" content="elevateforhumanity.org">
<meta name="content-origin" content="${baseUrl}">`;
}

function generateInvisibleWatermark() {
  const watermark = generateWatermark();
  
  return `
<!-- Digital watermark (invisible) -->
<div style="display:none; position:absolute; left:-9999px; top:-9999px;" aria-hidden="true">
  ${watermark}
</div>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "publisher": {
    "@type": "Organization",
    "name": "Elevate for Humanity",
    "url": "https://elevateforhumanity.org"
  },
  "copyrightHolder": {
    "@type": "Organization", 
    "name": "Elevate for Humanity"
  },
  "license": "https://elevateforhumanity.org/copyright",
  "sourceOrganization": {
    "@type": "Organization",
    "name": "Elevate for Humanity",
    "url": "https://elevateforhumanity.org"
  }
}
</script>`;
}

function injectSecurityHeaders(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(DIST, filePath);
  
  // Add security meta tags to head
  const securityMeta = `
<!-- Security headers -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
<meta name="robots" content="noai, noscrape">
<meta name="googlebot" content="noarchive">`;
  
  // Add canonical and backlink protection
  const canonicalLinks = generateCanonicalBacklink(relativePath);
  
  // Add invisible watermark
  const watermark = generateInvisibleWatermark();
  
  // Add copyright footer
  const copyrightFooter = generateCopyrightFooter();
  
  // Inject into head
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${securityMeta}\n${canonicalLinks}\n${watermark}\n</head>`);
  }
  
  // Inject copyright footer before closing body
  if (html.includes('</body>')) {
    html = html.replace('</body>', `${copyrightFooter}\n</body>`);
  }
  
  fs.writeFileSync(filePath, html);
}

function updateNetlifyHeaders() {
  const headersContent = `
# Security headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://client.crisp.chat https://widget.intercom.io https://js.intercomcdn.com https://embed.tawk.to https://www.googletagmanager.com https://js.stripe.com; connect-src 'self' https://client.crisp.chat https://widget.intercom.io https://nexus-websocket-a.intercom.io https://nexus-long-polling.intercom.io https://embed.tawk.to https://*.tawk.to https://api.stripe.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; frame-src https://js.stripe.com https://client.crisp.chat https://intercom-sheets.com https://js.intercomcdn.com https://widget.intercom.io https://embed.tawk.to https://*.tawk.to https://www.youtube.com https://player.vimeo.com;
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  X-Robots-Tag: noai, noscrape

# Cache control
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css  
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: public, max-age=0, must-revalidate

# Anti-scraping
/api/*
  X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noscrape
`;

  fs.writeFileSync(path.join(DIST, '_headers'), headersContent);
  console.log("✅ Updated Netlify _headers file");
}

function createCopyrightPage() {
  const copyrightHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Copyright Policy - Elevate for Humanity</title>
  <meta name="description" content="Copyright and intellectual property policy for Elevate for Humanity content.">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #2563eb; }
    h2 { color: #1e40af; margin-top: 30px; }
    .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Copyright Policy</h1>
  
  <div class="highlight">
    <strong>Notice:</strong> All content on this website is protected by copyright and digital watermarking technology.
  </div>
  
  <h2>Copyright Ownership</h2>
  <p>All content, including but not limited to text, images, videos, graphics, logos, and software, on the Elevate for Humanity website is owned by or licensed to Elevate for Humanity and is protected by United States and international copyright laws.</p>
  
  <h2>Permitted Use</h2>
  <p>Content may be used for:</p>
  <ul>
    <li>Personal, non-commercial educational purposes</li>
    <li>Workforce development and training programs</li>
    <li>Non-profit educational initiatives</li>
    <li>Fair use as defined by copyright law</li>
  </ul>
  
  <h2>Prohibited Use</h2>
  <p>The following uses are strictly prohibited:</p>
  <ul>
    <li>Commercial use without written permission</li>
    <li>Redistribution or republication</li>
    <li>Removal of copyright notices or watermarks</li>
    <li>Creating derivative works without permission</li>
    <li>Automated scraping or data mining</li>
  </ul>
  
  <h2>Digital Watermarking</h2>
  <p>Our content is protected by digital watermarking technology that allows us to track unauthorized use. Watermarks are embedded invisibly and cannot be removed without degrading content quality.</p>
  
  <h2>DMCA Compliance</h2>
  <p>We respect intellectual property rights and comply with the Digital Millennium Copyright Act (DMCA). If you believe your copyrighted work has been used inappropriately, please contact us at <a href="mailto:copyright@elevateforhumanity.org">copyright@elevateforhumanity.org</a>.</p>
  
  <h2>Enforcement</h2>
  <p>We actively monitor for unauthorized use of our content and will pursue legal action when necessary. Violations may result in:</p>
  <ul>
    <li>Cease and desist notices</li>
    <li>DMCA takedown requests</li>
    <li>Legal action for damages</li>
    <li>Injunctive relief</li>
  </ul>
  
  <h2>Contact</h2>
  <p>For permission requests or copyright questions, contact:</p>
  <p>
    <strong>Elevate for Humanity</strong><br>
    Email: <a href="mailto:copyright@elevateforhumanity.org">copyright@elevateforhumanity.org</a><br>
    Subject: Copyright Permission Request
  </p>
  
  <p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>
</body>
</html>`;

  fs.writeFileSync(path.join(DIST, 'copyright.html'), copyrightHtml);
  console.log("✅ Created copyright policy page");
}

function createDMCAPage() {
  const dmcaHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DMCA Policy - Elevate for Humanity</title>
  <meta name="description" content="Digital Millennium Copyright Act (DMCA) policy and takedown procedures.">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #2563eb; }
    h2 { color: #1e40af; margin-top: 30px; }
    .contact-box { background: #f0f9ff; padding: 20px; border: 1px solid #0ea5e9; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>DMCA Policy</h1>
  
  <h2>Digital Millennium Copyright Act Compliance</h2>
  <p>Elevate for Humanity respects the intellectual property rights of others and expects users to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and will respond to valid takedown notices.</p>
  
  <h2>Filing a DMCA Takedown Notice</h2>
  <p>If you believe that content on our website infringes your copyright, you may submit a DMCA takedown notice. Your notice must include:</p>
  
  <ol>
    <li><strong>Identification of the copyrighted work</strong> that you claim has been infringed</li>
    <li><strong>Identification of the infringing material</strong> and its location on our website</li>
    <li><strong>Your contact information</strong> including name, address, phone number, and email</li>
    <li><strong>A statement of good faith belief</strong> that the use is not authorized</li>
    <li><strong>A statement of accuracy</strong> under penalty of perjury</li>
    <li><strong>Your physical or electronic signature</strong></li>
  </ol>
  
  <div class="contact-box">
    <h3>DMCA Agent Contact Information</h3>
    <p>
      <strong>Elevate for Humanity DMCA Agent</strong><br>
      Email: <a href="mailto:dmca@elevateforhumanity.org">dmca@elevateforhumanity.org</a><br>
      Subject: DMCA Takedown Notice<br>
      Phone: Available upon request
    </p>
  </div>
  
  <h2>Counter-Notification</h2>
  <p>If you believe your content was removed in error, you may file a counter-notification that includes:</p>
  
  <ol>
    <li>Identification of the removed material and its former location</li>
    <li>Your contact information</li>
    <li>A statement under penalty of perjury that the material was removed by mistake</li>
    <li>Consent to jurisdiction of federal court</li>
    <li>Your physical or electronic signature</li>
  </ol>
  
  <h2>Repeat Infringer Policy</h2>
  <p>We maintain a policy of terminating access for users who are repeat copyright infringers.</p>
  
  <h2>Response Time</h2>
  <p>We will respond to valid DMCA notices within 24-48 hours during business days. Emergency requests will be processed immediately.</p>
  
  <h2>False Claims</h2>
  <p>Submitting false DMCA claims may result in legal liability. Please ensure your claim is valid before submitting.</p>
  
  <p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>
</body>
</html>`;

  fs.writeFileSync(path.join(DIST, 'dmca.html'), dmcaHtml);
  console.log("✅ Created DMCA policy page");
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      injectSecurityHeaders(fullPath);
    }
  }
}

function generateSecurityReport() {
  const report = {
    timestamp: new Date().toISOString(),
    build_id: BUILD_ID,
    site_hash: SITE_HASH,
    watermark: generateWatermark(),
    security_features: [
      "Digital watermarking",
      "Copyright footer injection",
      "Canonical URL protection", 
      "Security headers",
      "Anti-scraping meta tags",
      "DMCA compliance pages"
    ],
    protected_pages: 0
  };
  
  // Count protected pages
  function countPages(dir) {
    if (!fs.existsSync(dir)) return;
    
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        countPages(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        report.protected_pages++;
      }
    }
  }
  
  countPages(DIST);
  
  fs.writeFileSync(path.join(DIST, 'security-report.json'), JSON.stringify(report, null, 2));
  console.log("📊 Generated security report");
}

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error("❌ dist/ directory not found");
    process.exit(1);
  }
  
  console.log("🛡️ Injecting security headers and protection...");
  
  // Inject security headers and watermarks into all HTML files
  walk(DIST);
  
  // Update Netlify headers
  updateNetlifyHeaders();
  
  // Create copyright and DMCA pages
  createCopyrightPage();
  createDMCAPage();
  
  // Generate security report
  generateSecurityReport();
  
  console.log("✅ Security injection complete");
}

main().catch(error => {
  console.error(`💥 Security injection failed: ${error.message}`);
  process.exit(1);
});