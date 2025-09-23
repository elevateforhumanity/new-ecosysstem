#!/usr/bin/env node
/* Wix DNS pointing for www.elevateforhumanity.org (Cloudflare) */
const fs = require("fs");
const path = require("path");

const ENV = Object.fromEntries(
  (fs.existsSync(".env.autopilot") ? fs.readFileSync(".env.autopilot","utf8") : "")
    .split("\n").filter(Boolean).map(l => [l.slice(0,l.indexOf("=")), l.slice(l.indexOf("=")+1)])
);

const CF_API = "https://api.cloudflare.com/client/v4";
const CF_API_TOKEN = process.env.CF_API_TOKEN || ENV.CF_API_TOKEN;
const CF_ZONE_NAME = process.env.CF_ZONE_NAME || ENV.CF_ZONE_NAME || "elevateforhumanity.org";

// REQUIRED: pull these from Wix dashboard
const WIX_A_IP = process.env.WIX_A_IP || ENV.WIX_A_IP;                 // e.g. 23.236.62.147 (example)
const WIX_CNAME_TARGET = process.env.WIX_CNAME_TARGET || ENV.WIX_CNAME_TARGET; // e.g. www123.wixdns.net

if (!CF_API_TOKEN || !WIX_A_IP || !WIX_CNAME_TARGET) {
  console.error("Missing env: CF_API_TOKEN, WIX_A_IP, WIX_CNAME_TARGET are required.");
  console.error("");
  console.error("Get WIX_A_IP and WIX_CNAME_TARGET from your Wix dashboard:");
  console.error("1. Go to Wix Studio → Settings → Domains");
  console.error("2. Click 'Connect a domain you own'");
  console.error("3. Choose 'Via pointing'");
  console.error("4. Copy the A record IP and CNAME target");
  process.exit(1);
}

async function cf(path, opt={}) {
  const res = await fetch(CF_API+path, {
    ...opt,
    headers: { "Authorization": `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json", ...(opt.headers||{}) }
  });
  const j = await res.json();
  if (!j.success) throw new Error(JSON.stringify(j.errors||j, null, 2));
  return j;
}

async function getZoneId(name){
  const j = await cf(`/zones?name=${encodeURIComponent(name)}`);
  if (!j.result?.length) throw new Error(`Zone not found: ${name}`);
  return j.result[0].id;
}

async function upsert(zoneId, q, payload){
  const find = await cf(`/zones/${zoneId}/dns_records?${q}`);
  if (find.result?.length){
    const id = find.result[0].id;
    console.log(`Updating ${payload.type} ${payload.name} -> ${payload.content}`);
    await cf(`/zones/${zoneId}/dns_records/${id}`, {method:"PUT", body:JSON.stringify(payload)});
  } else {
    console.log(`Creating ${payload.type} ${payload.name} -> ${payload.content}`);
    await cf(`/zones/${zoneId}/dns_records`, {method:"POST", body:JSON.stringify(payload)});
  }
}

(async () => {
  console.log("🎨 Wix DNS Autopilot Starting...");
  console.log(`Zone: ${CF_ZONE_NAME}`);
  console.log(`Wix A IP: ${WIX_A_IP}`);
  console.log(`Wix CNAME Target: ${WIX_CNAME_TARGET}`);
  
  const zoneId = await getZoneId(CF_ZONE_NAME);

  // A @ -> WIX_A_IP (unproxied per Wix pointing)
  await upsert(
    zoneId,
    `type=A&name=${encodeURIComponent(CF_ZONE_NAME)}`,
    { type:"A", name: CF_ZONE_NAME, content: WIX_A_IP, proxied: false, ttl: 300 }
  );

  // CNAME www -> WIX_CNAME_TARGET (unproxied per Wix pointing)
  const hostWWW = `www.${CF_ZONE_NAME}`;
  await upsert(
    zoneId,
    `type=CNAME&name=${encodeURIComponent(hostWWW)}`,
    { type:"CNAME", name: hostWWW, content: WIX_CNAME_TARGET, proxied: false, ttl: 300 }
  );

  console.log("✅ Wix DNS pointing set for apex and www.");
  console.log("🔄 Now go to Wix and verify the domain connection.");
})().catch(e=>{ console.error("❌ Wix autopilot error:", e.message||e); process.exit(1); });