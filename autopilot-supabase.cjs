#!/usr/bin/env node
/* Creates Supabase custom-domain TXT validations + final CNAME (Cloudflare) */
const fs = require("fs");
const path = require("path");

const ENV = Object.fromEntries(
  (fs.existsSync(".env.autopilot") ? fs.readFileSync(".env.autopilot","utf8") : "")
    .split("\n").filter(Boolean).map(l => [l.slice(0,l.indexOf("=")), l.slice(l.indexOf("=")+1)])
);

const CF_API = "https://api.cloudflare.com/client/v4";
const CF_API_TOKEN = process.env.CF_API_TOKEN || ENV.CF_API_TOKEN;
const CF_ZONE_NAME = process.env.CF_ZONE_NAME || ENV.CF_ZONE_NAME || "elevateforhumanity.org";
const RECORDS_FILE = process.env.SUPABASE_RECORDS_FILE || "supabase-records.json";

if (!CF_API_TOKEN) { console.error("CF_API_TOKEN required"); process.exit(1); }
if (!fs.existsSync(RECORDS_FILE)) { 
  console.error(`Missing ${RECORDS_FILE}`);
  console.error("");
  console.error("Create supabase-records.json with records from Supabase:");
  console.error("1. In Supabase: supabase domains create --custom-hostname auth.elevateforhumanity.org");
  console.error("2. Copy the TXT and CNAME records to supabase-records.json");
  console.error("");
  console.error("Example supabase-records.json:");
  console.error(`{
  "host": "auth.elevateforhumanity.org",
  "txt": [
    {"name": "_supabase-challenge.auth", "value": "xxxxxxxxxxxxxxxx"},
    {"name": "_supabase-verification.auth", "value": "yyyyyyyyyyyyyyyy"}
  ],
  "cname": {"name": "auth", "target": "abcd.supabase.co"} 
}`);
  process.exit(1); 
}

const spec = JSON.parse(fs.readFileSync(RECORDS_FILE, "utf8"));

async function cf(path, opt={}) {
  const res = await fetch(CF_API+path, {
    ...opt,
    headers: { "Authorization": `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json", ...(opt.headers||{}) }
  });
  const j = await res.json();
  if (!j.success) throw new Error(JSON.stringify(j.errors||j, null, 2));
  return j;
}
async function zoneId(name){ const j = await cf(`/zones?name=${encodeURIComponent(name)}`); return j.result[0].id; }

async function upsertTXT(zoneId, name, value){
  const fqdn = name.endsWith(`.${CF_ZONE_NAME}`) ? name : `${name}.${CF_ZONE_NAME}`;
  const found = await cf(`/zones/${zoneId}/dns_records?type=TXT&name=${encodeURIComponent(fqdn)}`);
  const payload = { type:"TXT", name:fqdn, content:value, proxied:false, ttl:300 };
  if (found.result?.length){ 
    console.log(`Updating TXT ${fqdn} -> ${value}`);
    await cf(`/zones/${zoneId}/dns_records/${found.result[0].id}`, {method:"PUT", body:JSON.stringify(payload)});
  } else { 
    console.log(`Creating TXT ${fqdn} -> ${value}`);
    await cf(`/zones/${zoneId}/dns_records`, {method:"POST", body:JSON.stringify(payload)}); 
  }
}

async function upsertCNAME(zoneId, name, target){
  const fqdn = name.endsWith(`.${CF_ZONE_NAME}`) ? name : `${name}.${CF_ZONE_NAME}`;
  const found = await cf(`/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(fqdn)}`);
  const payload = { type:"CNAME", name:fqdn, content:target, proxied:false, ttl:300 };
  if (found.result?.length){ 
    console.log(`Updating CNAME ${fqdn} -> ${target}`);
    await cf(`/zones/${zoneId}/dns_records/${found.result[0].id}`, {method:"PUT", body:JSON.stringify(payload)});
  } else { 
    console.log(`Creating CNAME ${fqdn} -> ${target}`);
    await cf(`/zones/${zoneId}/dns_records`, {method:"POST", body:JSON.stringify(payload)}); 
  }
}

(async () => {
  console.log("🔐 Supabase DNS Autopilot Starting...");
  console.log(`Zone: ${CF_ZONE_NAME}`);
  console.log(`Host: ${spec.host || 'not specified'}`);
  
  const zid = await zoneId(CF_ZONE_NAME);

  // TXT validations
  for (const rec of (spec.txt||[])) {
    await upsertTXT(zid, rec.name, rec.value);
  }

  // Final CNAME
  if (spec.cname) {
    await upsertCNAME(zid, spec.cname.name, spec.cname.target);
  }

  console.log("✅ Supabase validation + CNAME records created (unproxied).");
  console.log("🔄 Go back to Supabase and click 'Verify' to complete setup.");
})().catch(e=>{ console.error("❌ Supabase autopilot error:", e.message||e); process.exit(1); });