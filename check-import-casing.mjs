import fs from 'fs'
import path from 'path'

const ROOT = path.resolve('src')
const exts = new Set(['.tsx','.ts','.jsx','.js'])
const issues = []

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p)
    else if (exts.has(path.extname(p))) scanFile(p)
  }
}

function scanFile(file) {
  const src = fs.readFileSync(file, 'utf8')
  const re = /from\s+['"](\.\/[^'"]+|\.{2}\/[^'"]+)['"]/g
  let m
  while ((m = re.exec(src))) {
    const rel = m[1]
    const full = path.resolve(path.dirname(file), rel)
    const parent = path.dirname(full)
    if (!fs.existsSync(parent)) continue
    const base = path.basename(full)
    const entries = new Set(fs.readdirSync(parent))
    if (![...entries].includes(base)) {
      const match = [...entries].find(e => e.toLowerCase() === base.toLowerCase())
      if (match) issues.push({ file, import: rel, onDisk: match })
    }
  }
}

walk(ROOT)
if (issues.length) {
  console.log('⚠️  Case-mismatch imports found:\n')
  for (const i of issues) {
    console.log(`- ${i.file}\n  imports: ${i.import}\n  disk has: ${i.onDisk}\n`)
  }
  process.exit(2)
} else {
  console.log('✅ No case-mismatch imports detected.')
}
