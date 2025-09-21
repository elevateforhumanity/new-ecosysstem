import fs from "fs";
import path from "path";
const urls = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      const url = p.replace('dist/', '').replace('index.html', '').replace('.html', '') || '/';
      urls.push(`https://${process.env.DOMAIN || 'www.elevate4humanity.org'}${url === '/' ? '' : '/' + url}`);
    }
  }
}
walk('dist');
fs.writeFileSync('dist/all-urls.txt', urls.join('\n'));
console.log(`✅ Collected ${urls.length} URLs`);
