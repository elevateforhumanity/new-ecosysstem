import fs from "fs";
import { execSync } from "child_process";

const cfg = JSON.parse(fs.readFileSync("autopilot.config.json", "utf-8"));
const CKPT = "dist/.autopilot-checkpoints.json";
fs.mkdirSync("dist", { recursive: true });
if (!fs.existsSync(CKPT)) fs.writeFileSync(CKPT, "{}");
const state = JSON.parse(fs.readFileSync(CKPT, "utf-8"));

const sleep = s => new Promise(r => setTimeout(r, s * 1000));
function run(cmd, label) {
  console.log(`▶ ${label}: ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

const steps = {
  build: () => run("npm run build", "Build site"),
  collect_urls: () => run("node scripts/collect-urls.js", "Collect URLs"),
  sitemaps: () => run("node scripts/generate-sitemaps.js", "Generate sitemap"),
  ids_chat_injection: () => {
    run("node scripts/inject-ids-and-chat.js", "Inject IDs + Chat");
    run("node scripts/verify-ids-and-chat.js", "Verify IDs + Chat");
  },
  robots: () => run("node scripts/generate-robots.js", "Generate robots.txt"),
  deploy: () => run("./scripts/netlify-deploy.sh", "Deploy to Netlify"),
  purge: () => run("./scripts/cf-purge.sh", "Purge Cloudflare"),
  seo_ping: () => run("./scripts/seo-ping.sh", "SEO ping")
};

async function runStep(name) {
  const already = state[name];
  if (already?.done) { 
    console.log(`✓ Skipping ${name} (checkpoint)`); 
    return true; 
  }

  let ok = false;
  for (let attempt = 1; attempt <= cfg.max_retries; attempt++) {
    try {
      steps[name]();
      ok = true;
      break;
    } catch (e) {
      console.warn(`⚠ ${name} attempt ${attempt} failed: ${e.message}`);
      if (attempt < cfg.max_retries) await sleep(cfg.retry_backoff_secs * attempt);
    }
  }

  state[name] = { done: ok, ts: Date.now() };
  fs.writeFileSync(CKPT, JSON.stringify(state, null, 2));

  if (!ok) {
    const isCritical = cfg.critical_steps.includes(name);
    if (isCritical) {
      console.error(`✖ Critical step failed: ${name}`);
      return false;
    } else {
      console.warn(`! Non-critical step failed: ${name}`);
      return true;
    }
  }
  return true;
}

async function main() {
  const order = [
    "build", "collect_urls", "sitemaps", "ids_chat_injection", 
    "robots", "deploy", "purge", "seo_ping"
  ];

  let hardFail = false;
  for (const step of order) {
    const ok = await runStep(step);
    if (!ok) hardFail = true;
  }

  if (hardFail && !cfg.force_deploy_on_warning) {
    console.error("🚫 Autopilot halted: critical steps failed.");
    process.exit(1);
  }
  console.log("✅ Autopilot finished.");
}
main();
