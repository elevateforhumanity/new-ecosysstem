import fs from "fs";
import path from "path";
const PILOT = process.env.PILOT_ID || "";
const COPILOT = process.env.COPILOT_ID || "";
const CHAT = (process.env.CHAT_PROVIDER || "").toLowerCase();

let bad = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && p.endsWith(".html")) {
      const html = fs.readFileSync(p, "utf-8");
      const hasPilot = html.includes(`name="pilot-id"`) && html.includes(PILOT);
      const hasCo = html.includes(`name="copilot-id"`) && html.includes(COPILOT);
      let hasChat = false;
      if (CHAT === "crisp") hasChat = html.includes("client.crisp.chat");
      if (!hasPilot || !hasCo || !hasChat) {
        bad.push({ file: p, hasPilot, hasCo, hasChat });
      }
    }
  }
}

walk("dist");
if (bad.length) {
  console.error(`❌ ${bad.length} pages missing required injections`);
  process.exit(1);
}
console.log("✅ All pages contain PILOT, COPILOT, and chat");
