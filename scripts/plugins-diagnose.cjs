#!/usr/bin/env node
const { execSync } = require('node:child_process')
const { existsSync, readFileSync, writeFileSync } = require('node:fs')
const APPLY = process.argv.includes('--apply')
const sh = c => { try { return execSync(c, {stdio: 'pipe', encoding: 'utf8'}).trim() } catch { return '' } }

console.log('🔎 Fast plugins check')
if (APPLY) {
  // Fast dependency repair
  if (existsSync('package-lock.json')) {
    console.log('📦 Fast npm ci...')
    sh('npm ci --prefer-offline --no-audit --progress=false')
  } else {
    console.log('📦 Fast npm install...')
    sh('npm install --prefer-offline --no-audit --progress=false')
  }
  
  // Quick react plugin check
  const vc = ['vite.config.ts','vite.config.js'].find(existsSync)
  if (vc) {
    let s = readFileSync(vc, 'utf8')
    if (s.includes('@vitejs/plugin-react') && /plugins:\s*\[/.test(s) && !/plugins:\s*\[\s*react\(\)/.test(s)) {
      s = s.replace(/plugins:\s*\[(.*?)\]/s, (m, i) => {
        const a = i.split(',').map(x => x.trim()).filter(Boolean)
        const idx = a.findIndex(x => x.startsWith('react(') || x === 'react()')
        if (idx > 0) { const [r] = a.splice(idx, 1); a.unshift(r) }
        return `plugins: [${a.join(', ')}]`
      })
      writeFileSync(vc, s)
      console.log('🔧 Fixed React plugin order')
    }
  }
}
console.log('✅ Fast plugins check done')
