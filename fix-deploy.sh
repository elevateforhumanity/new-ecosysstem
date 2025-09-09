#!/usr/bin/env bash
set -euo pipefail

echo "== Deployment Fix Script =="

echo "1) Ensuring vite.config.ts base '/' and dist outDir"
# (Already ensured by applied patch)

cat <<'CFG' > vite.config.ts
import { defineConfig } from "vite";
export default defineConfig({
  base: '/',
  build: { outDir: 'dist', sourcemap: true, emptyOutDir: true }
});
CFG

echo "2) Writing vercel.json rewrites (SPA fallback)"
cat <<'VJSON' > vercel.json
{
  "version": 2,
  "builds": [
    { "src": "api/server.js", "use": "@vercel/node" },
    { "src": "dist/**/*", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/server.js" },
    { "src": "/(.*)", "dest": "/dist/index.html" }
  ]
}
VJSON

echo "3) Cleaning node_modules and dist"
rm -rf node_modules dist

echo "4) Installing dependencies"
npm install --no-audit --no-fund

echo "5) Building project"
npm run build

echo "6) Git commit & push (if repo initialized)"
if [ -d .git ]; then
  git add vite.config.ts vercel.json package-lock.json package.json || true
  git commit -m "chore: deployment fix (vite base + vercel rewrites)" || echo "No changes to commit"
  git push || echo "Git push skipped/failed"
else
  echo "Git repo not initialized; skipping commit/push"
fi

echo "Done."
