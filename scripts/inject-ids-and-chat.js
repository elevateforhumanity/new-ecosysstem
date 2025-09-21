import fs from "fs";
import path from "path";
const PILOT = process.env.PILOT_ID || "";
const COPILOT = process.env.COPILOT_ID || "";
const CHAT = (process.env.CHAT_PROVIDER || "").toLowerCase();
const CHAT_ID = process.env.CHAT_ID || "";

function chatSnippet() {
  if (!CHAT || !CHAT_ID) return "";
  if (CHAT === "crisp") {
    return `<script type="text/javascript">
window.$crisp=[];window.CRISP_WEBSITE_ID="${CHAT_ID}";
(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
</script>`;
  }
  return "";
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.isFile() && p.endsWith(".html")) {
      let html = fs.readFileSync(p, "utf-8");
      if (PILOT && !html.includes('name="pilot-id"')) {
        html = html.replace("</head>", `  <meta name="pilot-id" content="${PILOT}">\n</head>`);
      }
      if (COPILOT && !html.includes('name="copilot-id"')) {
        html = html.replace("</head>", `  <meta name="copilot-id" content="${COPILOT}">\n</head>`);
      }
      const chat = chatSnippet();
      if (chat && !html.includes(chat.split("\n")[1]?.trim())) {
        html = html.replace("</body>", `${chat}\n</body>`);
      }
      fs.writeFileSync(p, html);
    }
  }
}

walk("dist");
console.log("✅ Injected PILOT/COPILOT meta + Chat snippet");
