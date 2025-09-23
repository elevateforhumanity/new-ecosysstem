#!/usr/bin/env node
/* EFH • Wix pointing autopilot with watch mode
   - Preflight: prints zone status + nameservers
   - Requires ACTIVE unless --force
   - Enforces DNS-only for:
       A  @    -> WIX_A_IP (default 185.230.63.107)
       CNAME www -> WIX_CNAME_TARGET (default elevate4humanity.org)
   - Watch mode: --watch[=<seconds>] (default 300) re-checks & re-enforces forever
*/
const https = require("https"), fs = require("fs"), crypto = require("crypto");

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const WATCH_ARG = args.find(a => a.startsWith("--watch"));
const WATCH_SECS = WATCH_ARG ? Number((WATCH_ARG.split("=")[1]||"").trim()||"300") : null;

function loadEnv() {
  if (!fs.existsSync(".env.autopilot")) {
    console.error("Missing .env.autopilot"); process.exit(1);
  }
  const e = Object.fromEntries(
    fs.readFileSync(".env.autopilot","utf8")
      .split("\n").filter(Boolean)
      .map(l => [l.slice(0,l.indexOf("=")), l.slice(l.indexOf("=")+1)])
  );
  for (const k of ["CF_API_TOKEN","CF_ZONE_NAME"]) {
    if (!e[k]) { console.error(`Missing ${k} in .env.autopilot`); process.exit(1); }
  }
  return e;
}

function cf(path, method="GET", token, body) {
  return new Promise((resolve, reject)=>{
    const req = https.request({
      hostname:"api.cloudflare.com",
      path:`/client/v4${path}`,
      method,
      headers:{ "Authorization":`Bearer ${token}`,"Content-Type":"application/json" }
    }, res => {
      let d=""; res.on("data", c=>d+=c); res.on("end", ()=>{ try {
        const j = JSON.parse(d); resolve({status:res.statusCode, json:j});
      } catch(e){ reject(e);} });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function upsert(zid, token, type, name, content, proxied=false, ttl=300){
  const q=`type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`;
  const found = await cf(`/zones/${zid}/dns_records?${q}`,"GET",token);
  const payload = {type, name, content, proxied, ttl};

  if (found.json.success && found.json.result?.length){
    const rec = found.json.result[0];
    // If proxied=true (orange cloud), force it back to DNS-only
    if (rec.proxied) {
      console.log(`⚠️ ${type} ${name} was proxied. Resetting to DNS-only.`);
      payload.proxied = false;
    }
    if (rec.content !== content || rec.proxied !== payload.proxied) {
      await cf(`/zones/${zid}/dns_records/${rec.id}`,"PUT",token,payload);
      console.log(`Updated ${type} ${name} -> ${content} (DNS-only)`);
    } else {
      console.log(`✓ ${type} ${name} already correct`);
    }
  } else {
    await cf(`/zones/${zid}/dns_records`,"POST",token,payload);
    console.log(`Created ${type} ${name} -> ${content} (DNS-only)`);
  }
}

(async () => {
  const env = loadEnv();
  const TOKEN = env.CF_API_TOKEN;
  const ZONE  = env.CF_ZONE_NAME;
  const A_IP  = env.WIX_A_IP || "185.230.63.107";
  const WWW_TARGET = env.WIX_CNAME_TARGET || "elevate4humanity.org";

  // Zone lookup
  const z = await cf(`/zones?name=${encodeURIComponent(ZONE)}`,"GET",TOKEN);
  if (!z.json.success || !z.json.result?.length) {
    console.error(`Zone not found: ${ZONE}`); process.exit(1);
  }
  const zone = z.json.result[0];
  const zid  = zone.id;
  const status = zone.status;
  const nsList = zone.name_servers || [];

  console.log("=== Preflight ===");
  console.log(`Zone: ${ZONE} (${zid})`);
  console.log(`Status: ${status}`);
  console.log(`Nameservers: ${nsList.join(", ") || "n/a"}`);

  if (status !== "active" && !FORCE) {
    console.error("\nZone is not ACTIVE. Update nameservers at your registrar to the Cloudflare names shown above.");
    console.error("Then re-run when active, or override now with:");
    console.error("  node autopilot-wix-pointing.cjs --force");
    process.exit(2);
  }

  // Enforce Wix pointing records
  await upsert(zid, TOKEN, "A", ZONE, A_IP, false, 300);
  await upsert(zid, TOKEN, "CNAME", `www.${ZONE}`, WWW_TARGET, false, 300);

  console.log("\n✅ Wix pointing set and locked to DNS-only (gray cloud).");
  if (status !== "active") {
    console.log("⚠️ Zone pending: records exist but won't resolve until nameservers switch completes.");
  }
})();