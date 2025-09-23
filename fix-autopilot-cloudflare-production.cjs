#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Elevate Autopilot • Cloudflare DNS + Redirects
 * - Verifies token & zone
 * - Creates/updates:
 *   - A @ -> APEX_IP
 *   - CNAME www -> apex
 *   - Redirect: https://elevateforhumanity.org => REDIRECT_TO (301)
 *
 * Requirements:
 *   - Node 18+ (built-in fetch)
 *   - .env.autopilot file created by autopilot-cloudflare-fix.sh
 *
 * Notes:
 *   - 192.0.2.1 is a TEST IP. Replace with your real origin for production.
 */

const fs = require("fs");
const path = require("path");

// --- load env ---
const ENV_PATH = path.resolve(process.cwd(), ".env.autopilot");
if (!fs.existsSync(ENV_PATH)) {
  console.error("Missing .env.autopilot. Run ./autopilot-cloudflare-fix.sh first.");
  process.exit(1);
}
const env = Object.fromEntries(
  fs.readFileSync(ENV_PATH, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    })
);

const CF_API_TOKEN = env.CF_API_TOKEN;
const CF_ZONE_NAME = env.CF_ZONE_NAME || "elevateforhumanity.org";
const APEX_IP = env.APEX_IP || "192.0.2.1"; // replace with real origin for production
const REDIRECT_TO = env.REDIRECT_TO || "https://elevate4humanity.org";
const CF_API = "https://api.cloudflare.com/client/v4";

if (!CF_API_TOKEN) {
  console.error("CF_API_TOKEN missing in .env.autopilot");
  process.exit(1);
}

// --- helpers ---
async function cfFetch(path, opts = {}) {
  const res = await fetch(`${CF_API}${path}`, {
    ...opts,
    headers: {
      "Authorization": `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });
  const json = await res.json();
  if (!json.success) {
    const msg = JSON.stringify(json.errors || json, null, 2);
    throw new Error(`Cloudflare API error for ${path}: ${msg}`);
  }
  return json;
}

async function getZoneByName(name) {
  const data = await cfFetch(`/zones?name=${encodeURIComponent(name)}`);
  if (!data.result?.length) throw new Error(`Zone not found: ${name}`);
  return data.result[0]; // assume exact match
}

async function upsertARecord(zoneId, name, content, proxied = true, ttl = 120) {
  // name "@" means apex (zone name)
  const dnsName = name === "@" ? CF_ZONE_NAME : `${name}.${CF_ZONE_NAME}`;

  const existing = await cfFetch(`/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(dnsName)}`);
  const payload = { type: "A", name: dnsName, content, proxied, ttl };

  if (existing.result?.length) {
    // update the first one (idempotent update)
    const id = existing.result[0].id;
    console.log(`Updating A ${dnsName} -> ${content}`);
    await cfFetch(`/zones/${zoneId}/dns_records/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  } else {
    console.log(`Creating A ${dnsName} -> ${content}`);
    await cfFetch(`/zones/${zoneId}/dns_records`, { method: "POST", body: JSON.stringify(payload) });
  }
}

async function upsertCNAME(zoneId, name, target, proxied = true, ttl = 120) {
  // e.g., name "www" => www.zone
  const dnsName = `${name}.${CF_ZONE_NAME}`;

  const existing = await cfFetch(`/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(dnsName)}`);
  const payload = { type: "CNAME", name: dnsName, content: target, proxied, ttl };

  if (existing.result?.length) {
    const id = existing.result[0].id;
    console.log(`Updating CNAME ${dnsName} -> ${target}`);
    await cfFetch(`/zones/${zoneId}/dns_records/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  } else {
    console.log(`Creating CNAME ${dnsName} -> ${target}`);
    await cfFetch(`/zones/${zoneId}/dns_records`, { method: "POST", body: JSON.stringify(payload) });
  }
}

/**
 * Upsert a **zone-level redirect rule** (Rulesets API).
 * - Phase: http_request_redirect
 * - Action: redirect (status 301)
 * - Expression: http.host eq "<apex>"
 * This redirects both http/https requests at the apex.
 */
async function upsertRedirectRuleset(zoneId, apexHost, destination) {
  // 1) Get rulesets for this phase
  const phase = "http_request_redirect";
  const list = await cfFetch(`/zones/${zoneId}/rulesets?phase=${phase}`);
  let ruleset = list.result?.[0];

  const rule = {
    expression: `http.host eq "${apexHost}"`,
    description: `Autopilot: redirect ${apexHost} -> ${destination}`,
    action: "redirect",
    action_parameters: {
      from_value: {
        status_code: 301,
        url: destination,
        preserve_query_string: true
      }
    },
    enabled: true
  };

  if (!ruleset) {
    // create a ruleset with our single rule
    console.log(`Creating redirect ruleset for phase '${phase}'`);
    const createRes = await cfFetch(`/zones/${zoneId}/rulesets`, {
      method: "POST",
      body: JSON.stringify({
        name: "Autopilot Redirects",
        description: "Managed by Elevate Autopilot",
        kind: "zone",
        phase,
        rules: [rule]
      })
    });
    ruleset = createRes.result;
  } else {
    // upsert (replace or append our rule by description match)
    const existingIdx = ruleset.rules.findIndex(r =>
      (r.description || "").startsWith("Autopilot: redirect")
    );
    if (existingIdx >= 0) {
      console.log("Updating existing redirect rule…");
      ruleset.rules[existingIdx] = rule;
    } else {
      console.log("Adding redirect rule…");
      ruleset.rules.push(rule);
    }

    // update ruleset
    await cfFetch(`/zones/${zoneId}/rulesets/${ruleset.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: ruleset.name || "Autopilot Redirects",
        description: "Managed by Elevate Autopilot",
        kind: "zone",
        phase,
        rules: ruleset.rules
      })
    });
  }

  console.log(`✅ Redirect set: ${apexHost} → ${destination} (301)`);
}

(async () => {
  try {
    console.log("== Autopilot start ==");
    console.log(`Zone: ${CF_ZONE_NAME}`);

    // 1) Resolve zone
    const zone = await getZoneByName(CF_ZONE_NAME);
    const zoneId = zone.id;
    console.log(`Found zoneId: ${zoneId}`);

    // 2) Token smoke test by listing DNS records
    await cfFetch(`/zones/${zoneId}/dns_records?per_page=1`);
    console.log("✅ Token + Zone DNS read OK");

    // 3) Upsert DNS
    await upsertARecord(zoneId, "@", APEX_IP, true, 120); // proxied=true
    await upsertCNAME(zoneId, "www", CF_ZONE_NAME, true, 120);

    // 4) Redirect apex -> REDIRECT_TO (301)
    await upsertRedirectRuleset(zoneId, CF_ZONE_NAME, REDIRECT_TO);

    console.log("== Autopilot complete ==");
  } catch (err) {
    console.error("❌ Autopilot error:");
    console.error(err?.message || err);
    process.exit(1);
  }
})();