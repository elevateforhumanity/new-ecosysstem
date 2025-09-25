#!/usr/bin/env node
/* Strict Autopilot: uses config file, validates 100% route availability */
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

const CONFIG_PATH = getArg("config", "config/efh.autopilot.json");
const STRICT = args.includes("--strict");

const die = (msg) => {
  console.error(`❌ ${msg}`);
  process.exit(1);
};

// Load config
let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
} catch (e) {
  die(`Failed to load config from ${CONFIG_PATH}: ${e.message}`);
}

const { base, brand, images, landing_pages, social, allowImageHosts } = config;

console.log(`🚀 Strict Autopilot starting...`);
console.log(`📍 Base: ${base}`);
console.log(`🔒 Strict mode: ${STRICT ? "YES" : "NO"}`);
console.log(`🖼️  Images: ${images.useImages ? "YES" : "NO (text-only)"}`);

// Check routes
const checkRoute = async (path) => {
  try {
    const url = base + path;
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    return { path, status: response.status, ok: response.ok };
  } catch (e) {
    return { path, status: 0, ok: false, error: e.message };
  }
};

console.log(`\n🔍 Checking ${landing_pages.length} landing routes...`);

let ok = 0;
const results = [];

for (const page of landing_pages) {
  const result = await checkRoute(page.path);
  results.push(result);
  
  if (result.ok) {
    ok++;
    console.log(`✅ ${page.path.padEnd(12)} → ${result.status}`);
  } else {
    console.log(`❌ ${page.path.padEnd(12)} → ${result.status} ${result.error || ''}`);
  }
}

console.log(`\n📊 Results: ${ok}/${landing_pages.length} routes healthy`);

// Strict validation
if (STRICT && ok < landing_pages.length) {
  die(`All landing routes must be live (${ok}/${landing_pages.length}).`);
}

// Generate embed HTML
const generateEmbed = () => {
  const primaryRoutes = landing_pages.slice(0, 3);
  const exploreRoutes = landing_pages.slice(3, 9);
  
  return `<!-- EFH — FINAL LANDING (strict, no stock images) -->
<div style="background:#fff;color:#111;font-family:Inter,Arial,sans-serif;margin:0;padding:0">
  <div style="max-width:960px;margin:0 auto;padding:18px">
    <div style="margin:0 0 12px">
      <div style="font-weight:900;letter-spacing:.3px;font-size:18px;color:${brand.blue};display:inline-block">ELEVATE FOR HUMANITY</div>
      <div style="float:right">
        <a href="${base}/programs" style="display:inline-block;padding:10px 16px;border-radius:6px;background:${brand.red};color:#fff;text-decoration:none;font-weight:700">Apply Now</a>
      </div><div style="clear:both"></div>
    </div>
    <div style="height:4px;background:linear-gradient(90deg,${brand.red} 0 25%,#fff 25% 50%,${brand.blue} 50% 85%,${brand.gold} 85% 100%);border-radius:2px;margin:0 0 16px"></div>

    <h1 style="font-size:30px;line-height:1.25;margin:0 0 8px">Government Contractor & Private Career School</h1>
    <p style="margin:0 0 14px;color:#444">DOE • DWD • DOL aligned training, compliance, and enterprise solutions. Employer pipelines and funding pathways.</p>
    ${primaryRoutes.map(route => 
      `<a href="${base}${route.path}" style="display:block;text-align:center;margin:0 0 10px;padding:12px 16px;border-radius:6px;${route.path === '/government' ? `background:${brand.blue};color:#fff` : `border:1px solid ${brand.blue};color:${brand.blue}`};text-decoration:none;font-weight:700">${route.label}</a>`
    ).join('\n    ')}

    <div style="text-transform:uppercase;letter-spacing:.14em;font-size:12px;color:${brand.blue};font-weight:700;margin:8px 0 6px">Explore</div>
    <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin:0 0 16px">
      ${exploreRoutes.map(route => 
        `<a href="${base}${route.path}" style="display:block;padding:10px 12px;border:1px solid #e5e7eb;border-radius:6px;margin:0 0 8px;color:#111;text-decoration:none">${route.label}</a>`
      ).join('\n      ')}
    </div>

    <div style="text-transform:uppercase;letter-spacing:.14em;font-size:12px;color:${brand.blue};font-weight:700;margin:8px 0 6px">Social & Blog</div>
    <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin:0 0 16px">
      <a href="${base}${social.blog}" style="display:block;padding:10px 12px;border:1px solid ${brand.gold};border-radius:6px;margin:0 0 8px;color:#8A6E12;text-decoration:none">Blog</a>
      <a href="${social.x}" style="display:block;padding:10px 12px;border:1px solid #e5e7eb;border-radius:6px;margin:0 0 8px;color:#111;text-decoration:none">X (Twitter)</a>
      <a href="${social.linkedin}" style="display:block;padding:10px 12px;border:1px solid #e5e7eb;border-radius:6px;margin:0;color:#111;text-decoration:none">LinkedIn</a>
    </div>

    <div style="margin-top:16px;padding-top:12px;border-top:1px solid #e5e7eb;color:#444">
      Equal Opportunity Is the Law — Veterans' Priority of Service. Auxiliary aids/services upon request. TTY 711.
    </div>
    <div style="margin-top:8px;color:#666;font-size:12px">© 2025 Elevate for Humanity. All rights reserved.</div>
  </div>
</div>`;
};

// Write outputs
const outputDir = "dist";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const embedHTML = generateEmbed();
fs.writeFileSync(path.join(outputDir, "durable-landing.html"), embedHTML);

const report = {
  timestamp: new Date().toISOString(),
  config: CONFIG_PATH,
  base,
  strict: STRICT,
  routes_checked: landing_pages.length,
  routes_healthy: ok,
  success_rate: `${Math.round((ok / landing_pages.length) * 100)}%`,
  results
};

fs.writeFileSync(path.join(outputDir, "autopilot-report.json"), JSON.stringify(report, null, 2));

console.log(`\n✅ Generated:`);
console.log(`   📄 ${outputDir}/durable-landing.html (paste into Durable)`);
console.log(`   📊 ${outputDir}/autopilot-report.json`);

if (STRICT && ok === landing_pages.length) {
  console.log(`\n🎯 STRICT MODE PASSED: All ${landing_pages.length} routes are healthy!`);
} else if (!STRICT) {
  console.log(`\n✨ Completed (non-strict mode)`);
}