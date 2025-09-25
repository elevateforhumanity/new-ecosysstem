#!/usr/bin/env node
/* Autopilot: checks all routes, generates Durable-safe embed + status report */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name, def=null) => {
  const i = args.findIndex(a => a === `--${name}`);
  if (i >= 0) return args[i+1];
  const flag = args.find(a => a.startsWith(`--${name}=`));
  if (flag) return flag.split("=")[1];
  return def;
};

const BASE = getArg("base", process.env.BASE || "https://8080--01997444-4456-7efa-9b1f-b5612db1de6d.us-east-1-01.gitpod.dev");
const ALT_BASE = getArg("alt-base", process.env.ALT_BASE || "https://9000--01997444-4456-7efa-9b1f-b5612db1de6d.us-east-1-01.gitpod.dev");
const DRY_RUN = args.includes("--dry-run");

const brand = {
  red:  "#D91D3C",
  blue: "#0F2B6C",
  gold: "#C9A227",
  white:"#FFFFFF"
};

const sections = [
  // Active Routes (App.jsx)
  { title: "Active Routes", items: [
    ["/", "Homepage"], ["/government", "Government"], ["/philanthropy", "Philanthropy"],
    ["/compliance", "Compliance"], ["/accessibility", "Accessibility"], ["/*", "Not Found (404)"]
  ]},
  // Durable Ecosystem
  { title: "Durable Ecosystem", items: [
    ["/durable","Durable Main"], ["/durable-ai","AI Builder"], ["/durable-templates","Templates"],
    ["/durable-features","Features"], ["/durable-pricing","Pricing"]
  ]},
  // Educational & Learning (15)
  { title: "Educational & Learning", items: [
    ["/programs","Programs"], ["/lms","LMS"], ["/hub","Hub"], ["/student","Student"],
    ["/student-dashboard","Student Dashboard"], ["/student-handbook","Student Handbook"],
    ["/course","Course"], ["/course-builder","Course Builder"], ["/courses","Course Catalog"],
    ["/course/1","Course Detail (example)"], ["/course-library","Course Library"], ["/assignment","Assignment"],
    ["/curriculum-upload","Curriculum Upload"], ["/quiz","Quiz"], ["/certificates","Certificates"]
  ]},
  // Business & Commerce (8)
  { title: "Business & Commerce", items: [
    ["/pay","Pay"], ["/donate","Donate"], ["/donate-page","Donate Page"], ["/partners","Partners"],
    ["/ecommerce","Ecommerce"], ["/ecosystem","Ecosystem"], ["/funding-impact","Funding Impact"],
    ["/clone-landing","Clone Landing"]
  ]},
  // User Management & Settings (12)
  { title: "User Management & Settings", items: [
    ["/account","Account"], ["/settings","Settings"], ["/profile","Profile"], ["/connect","Connect"],
    ["/about","About"], ["/login","Login"], ["/user-management","User Management"], ["/notifications","Notifications"],
    ["/accessibility-settings","Accessibility Settings"], ["/mobile-app","Mobile App"],
    ["/branding","Branding"], ["/support","Support"]
  ]},
  // Analytics & Admin (6)
  { title: "Analytics & Admin", items: [
    ["/analytics","Analytics"], ["/analytics-dashboard","Analytics Dashboard"], ["/admin","Admin Dashboard"],
    ["/instructor","Instructor"], ["/instructor-edit","Instructor Edit"], ["/instructor-new","Instructor New"]
  ]},
  // Integration & Tools (7)
  { title: "Integration & Tools", items: [
    ["/integrations","Integrations"], ["/community","Community"], ["/google-analytics-setup","Google Analytics Setup"],
    ["/google-site-verification","Google Site Verification"], ["/bing-site-verification","Bing Site Verification"],
    ["/sitemap","Sitemap"], ["/some-page","Some Page"]
  ]},
  // Legal & Policy (4)
  { title: "Legal & Policy", items: [
    ["/privacy-policy","Privacy Policy"], ["/terms-of-service","Terms of Service"],
    ["/refund-policy","Refund Policy"], ["/thank-you","Thank You"]
  ]},
  // Sister Sites (9)
  { title: "Sister Sites", items: [
    ["/mentorship","Mentorship"], ["/mentor-directory","Mentor Directory"], ["/mentor-signup","Mentor Signup"],
    ["/peer-support","Peer Support"], ["/volunteer","Volunteer"], ["/volunteer-opportunities","Volunteer Opportunities"],
    ["/volunteer-stories","Volunteer Stories"], ["/wellness","Wellness"], ["/wellness-resources","Wellness Resources"]
  ]},
];

const corePaths = [
  "/", "/government", "/programs", "/lms", "/hub", "/student",
  "/partners", "/about", "/connect", "/pay", "/donate"
];

const full = (base, p) => {
  if (p === "/*") return base.replace(/\/+$/,"") + "/404";
  return base.replace(/\/+$/,"") + p;
};

const timedFetch = async (url, ms=8000) => {
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "manual", cache: "no-store" });
    clearTimeout(t);
    return { ok: res.ok, status: res.status };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, status: 0 };
  }
};

const allItems = sections.flatMap(s => s.items);
const urls = allItems.map(([p]) => full(BASE, p));

// Check links
const results = [];
for (const [idx, [route, label]] of allItems.entries()) {
  const url = full(BASE, route);
  const r = await timedFetch(url);
  results.push({ route, label, url, ...r });
}

// Core OK?
const coreOk = await (async () => {
  const subs = await Promise.all(corePaths.map(async p => {
    const { ok, status } = await timedFetch(full(BASE, p));
    return { p, ok, status };
  }));
  // consider OK if homepage is ok and at least 6/11 are ok (dev servers sometimes lazy-load)
  const okCount = subs.reduce((a,b)=>a+(b.ok?1:0),0);
  const home = subs.find(x=>x.p==="/");
  return (home?.ok === true) && (okCount >= 6);
})();

// Report
const reportPath = path.join("dist","link-report.md");
const lines = [
  `# Link Report (BASE: ${BASE})`,
  ``,
  `| Route | URL | Status |`,
  `|---|---|---:|`,
  ...results.map(r => `| \`${r.route}\` | ${r.url} | ${r.status} |`),
  ``,
  `**Core check:** ${coreOk ? "OK ✅" : "NOT READY ⚠️"}`,
];
fs.writeFileSync(reportPath, lines.join("\n"), "utf8");

// Generate Durable-safe embed
const btn = (href, txt, style="primary") => {
  const baseStyle = "display:block;text-align:center;margin:0 0 8px 0;padding:12px 16px;border-radius:6px;text-decoration:none";
  if (style === "primary")  return `<a href="${href}" style="${baseStyle};background:${brand.red};color:#fff;font-weight:700">${txt}</a>`;
  if (style === "outline")  return `<a href="${href}" style="${baseStyle};border:1px solid ${brand.blue};color:${brand.blue};font-weight:700">${txt}</a>`;
  return `<a href="${href}" style="${baseStyle};border:1px solid #e5e7eb;color:#111111">${txt}</a>`;
};

const sectionBlock = (title, items) => {
  const links = items.map(([p,label]) =>
    `<a href="${full(BASE,p)}" style="display:block;padding:10px 12px;border:1px solid #e5e7eb;border-radius:6px;margin:0 0 8px 0;text-decoration:none;color:#111">${p} — ${label}</a>`
  ).join("\n");
  return `
    <div style="text-transform:uppercase;letter-spacing:.14em;font-size:12px;color:${brand.blue};font-weight:700;margin:16px 0 6px 0">${title}</div>
    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin-bottom:12px">
      ${links}
    </div>
  `;
};

const embed = `
<!-- EFH — ENTERPRISE HUB (Autopilot Output) • Single Column • R/W/B/Gold • Durable-safe -->
<div data-efh-embed="autopilot-v1" style="background:#ffffff;color:#111111;font-family:Inter,Arial,system-ui,sans-serif;margin:0;padding:0">
  <div style="max-width:960px;margin:0 auto;padding:18px">

    <!-- Header -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 12px 0">
      <tr>
        <td style="font-weight:900;letter-spacing:.3px;font-size:18px;color:${brand.blue}">ELEVATE FOR HUMANITY</td>
        <td align="right">
          <a href="${BASE}" style="display:inline-block;padding:10px 16px;border-radius:6px;background:${brand.red};color:#ffffff;text-decoration:none;font-weight:700">Apply Now</a>
        </td>
      </tr>
    </table>
    <div style="height:4px;width:100%;background:linear-gradient(90deg,${brand.red} 0 25%,#ffffff 25% 50%,${brand.blue} 50% 85%,${brand.gold} 85% 100%);border-radius:2px;margin:0 0 16px 0"></div>

    <!-- Environment Switch -->
    <div style="text-transform:uppercase;letter-spacing:.14em;font-size:12px;color:${brand.blue};font-weight:700;margin:0 0 8px 0">Environments</div>
    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin:0 0 16px 0">
      ${btn(BASE, "Gitpod 8080", "outline")}
      ${btn(ALT_BASE, "Gitpod 9000", "outline")}
    </div>

    <!-- Service Status -->
    <div style="border:1px solid ${coreOk ? brand.gold : brand.red};border-radius:10px;padding:12px;margin:0 0 16px 0;color:#444">
      <strong>Service Status:</strong> ${coreOk ? "Core pages responding ✅" : "Service unavailable — start dev server ⚠️"}
    </div>

    <!-- Router Sections -->
    ${sections.map(s => sectionBlock(s.title, s.items)).join("\n")}

    <!-- Footer Compliance -->
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid #e5e7eb;color:#444">
      DOE • DWD • DOL aligned programs. Equal Opportunity Is the Law. Veterans' Priority of Service. TTY 711.
    </div>
    <div style="margin-top:10px;color:#666;font-size:12px">© 2025 Elevate for Humanity. All rights reserved.</div>
  </div>
</div>
`;

fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync(path.join("dist","durable-embed.html"), embed, "utf8");

console.log("📄 Wrote dist/durable-embed.html");
console.log("📊 Wrote dist/link-report.md");
if (DRY_RUN) {
  console.log("✅ Dry-run complete.");
  process.exit(0);
}
process.exit(coreOk ? 0 : 2);