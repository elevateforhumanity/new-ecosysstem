import fs from "fs";
import path from "path";

const DIST = "dist";

const complianceFooter = `
<footer class="compliance-footer" style="background: #f8f9fa; padding: 20px; margin-top: 40px; border-top: 1px solid #dee2e6; font-size: 14px; line-height: 1.5;">
  <div style="max-width: 1200px; margin: 0 auto;">
    <p style="margin: 0 0 10px 0; font-weight: 600;">Equal Opportunity Is the Law</p>
    <p style="margin: 0 0 10px 0;">
      Auxiliary aids and services are available upon request to individuals with disabilities. 
      Language assistance services are free of charge. TTY via Relay 711. 
      Veterans' Priority of Service applies.
    </p>
    <p style="margin: 0; font-size: 12px; color: #6c757d;">
      This workforce product was funded by a grant awarded by the U.S. Department of Labor's Employment and Training Administration. 
      The product was created by the grantee and does not necessarily reflect the official position of the U.S. Department of Labor. 
      The Department of Labor makes no guarantees, warranties, or assurances of any kind, express or implied, with respect to such information, 
      including any information on linked sites and including, but not limited to, accuracy of the information or its completeness, 
      timeliness, usefulness, adequacy, continued availability, or ownership.
    </p>
  </div>
</footer>`;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.isFile() && p.endsWith(".html")) injectFooter(p);
  }
}

function injectFooter(file) {
  let html = fs.readFileSync(file, "utf-8");
  
  // Only inject if not already present
  if (!html.includes("Equal Opportunity Is the Law")) {
    if (html.includes("</body>")) {
      html = html.replace("</body>", `${complianceFooter}\n</body>`);
    } else {
      html += `\n${complianceFooter}\n`;
    }
    fs.writeFileSync(file, html);
  }
}

if (!fs.existsSync(DIST)) {
  throw new Error("dist/ not found — build first.");
}

walk(DIST);
console.log("✅ Injected compliance footer into all HTML pages");