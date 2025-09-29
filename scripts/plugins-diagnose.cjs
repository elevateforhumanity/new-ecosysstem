#!/usr/bin/env node
const { execSync } = require('node:child_process')
const { existsSync, readFileSync, writeFileSync } = require('node:fs')
const APPLY = process.argv.includes('--apply') || process.argv.includes('--guard')
const sh = (c)=>{ try{ return execSync(c,{stdio:'pipe',encoding:'utf8'}).trim() }catch(e){ return (e.stdout||'').toString().trim() } }
const have=(m)=>{ try{ require.resolve(m,{paths:[process.cwd()]}); return true } catch{ return false } }
console.log('🔎 Plugins Autopilot start')
sh('npm config set save-exact true')
const ls = sh('npm ls --depth=0 --json || true'); if (ls.includes('"missing": true') || ls.includes('extraneous') || ls.includes('invalid')) console.log('⚠️  Tree inconsistent')
if (APPLY) { if (existsSync('package-lock.json')) console.log(sh('npm ci --prefer-offline || npm ci')); else console.log(sh('npm install --prefer-offline || npm install')) } else console.log('ℹ️  Would repair deps (npm ci/install)')
if (have('esbuild') && APPLY) console.log(sh('npm rebuild esbuild || (npm remove esbuild && npm add -D esbuild)'))
if (APPLY) console.log(sh('npm install --legacy-peer-deps --no-audit || true'))
const vc = ['vite.config.ts','vite.config.js'].find(existsSync); if (vc) { let s=readFileSync(vc,'utf8'); if (s.includes('@vitejs/plugin-react') && /plugins:\s*\[/.test(s) && !/plugins:\s*\[\s*react\(\)/.test(s)){ s=s.replace(/plugins:\s*\[(.*?)\]/s,(m,i)=>{const a=i.split(',').map(x=>x.trim()).filter(Boolean);const idx=a.findIndex(x=>x.startsWith('react(')||x==='react()'); if(idx>0){const [r]=a.splice(idx,1);a.unshift(r)} return `plugins: [${a.join(', ')}]`}); writeFileSync(vc,s) } }
if (APPLY){ sh('pkill -f vite || true'); sh('npm run dev >/tmp/vite.log 2>&1 &') }
console.log('✅ Plugins Autopilot done')
