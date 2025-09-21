const required = [
  "DOMAIN",
  "NETLIFY_SITE_ID","NETLIFY_AUTH_TOKEN",
  "CF_API_TOKEN","CF_ZONE_ID",
  "SUPABASE_URL","SUPABASE_SERVICE_KEY",
  "PILOT_ID","COPILOT_ID",
  "CHAT_PROVIDER","CHAT_ID"
];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error("❌ Missing required env vars:\n  " + missing.join("\n  "));
  process.exit(1);
}
console.log("✅ Env check passed");
