#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dist = path.join(process.cwd(), 'client', 'dist');
const budgetKB = parseInt(process.env.BUNDLE_BUDGET_KB || '800', 10); // adjustable

function walk(dir, list = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, list);
    else list.push({ file: full, size: stat.size });
  }
  return list;
}

if (!fs.existsSync(dist)) {
  console.error('[size-check] dist not found:', dist);
  process.exit(1);
}

const files = walk(dist).filter(f => /\.(js|css)$/.test(f.file));
const total = files.reduce((a,b)=>a+b.size,0);
const largest = files.slice().sort((a,b)=>b.size-a.size).slice(0,5);

console.log('[size-check] total bytes =', total, '(', Math.round(total/1024), 'KB ) budget =', budgetKB, 'KB');
console.log('[size-check] top 5 largest:');
for (const f of largest) console.log('-', f.file.replace(process.cwd(),'').slice(1), Math.round(f.size/1024),'KB');

if (total/1024 > budgetKB) {
  console.error(`[size-check] FAIL: bundle ${Math.round(total/1024)}KB exceeds budget ${budgetKB}KB`);
  process.exit(1);
}
console.log('[size-check] PASS within budget');
