import { statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const LIMIT_KB = 300; // adjust
const dist = "dist/assets";
let overs = [];
try {
  for (const f of readdirSync(dist)) {
    const full = join(dist, f);
    const st = statSync(full);
    if (st.isFile() && st.size > LIMIT_KB * 1024) {
      overs.push({ file: f, kb: Math.round(st.size / 1024) });
    }
  }
} catch {
  console.log("No dist assets yet.");
  process.exit(0);
}

if (overs.length) {
  console.log("⚠ Large bundles detected (kb):");
  overs.forEach(o => console.log(`  ${o.file} ~${o.kb}KB`));
  process.exit(0); // non-fatal, change to 1 to enforce hard limit
} else {
  console.log("Asset sizes OK (<= " + LIMIT_KB + "KB).");
}