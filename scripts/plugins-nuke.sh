#!/usr/bin/env bash
set -euo pipefail
echo "💣 Nuke caches & rebuild deps"
pkill -f vite || true
rm -rf node_modules .vite .turbo dist npm-cache || true
npm cache verify || true
npm cache clean --force || true
if [ -f package-lock.json ]; then npm ci; else npm install; fi
npm rebuild esbuild || true
echo "🚀 Start dev"
npm run dev >/tmp/vite.log 2>&1 &
