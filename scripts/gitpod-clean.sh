#!/usr/bin/env bash
set -e

echo "🧹 Cleaning Gitpod workspace..."

# Remove node_modules caches
echo "  📦 Cleaning npm/yarn caches..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .cache 2>/dev/null || true
rm -rf dist/.cache 2>/dev/null || true
rm -rf .npm 2>/dev/null || true
rm -rf .yarn/cache 2>/dev/null || true

# Prune npm/yarn cache
npm cache clean --force 2>/dev/null || true
yarn cache clean 2>/dev/null || true

# Remove old build artifacts
echo "  🗑️  Removing build artifacts..."
find dist -type f -name "*.map" -delete 2>/dev/null || true
find dist -type f -name "*.tmp" -delete 2>/dev/null || true
find dist -type f -name "*.log" -delete 2>/dev/null || true
find . -type f -name "*.log" -not -path "./node_modules/*" -delete 2>/dev/null || true

# Clean temporary files
echo "  🧽 Cleaning temporary files..."
rm -rf /tmp/* 2>/dev/null || true
rm -rf .temp 2>/dev/null || true
rm -rf temp 2>/dev/null || true

# Remove old Git objects and reflog
echo "  🗂️  Optimizing Git repository..."
git reflog expire --expire=now --all 2>/dev/null || true
git gc --prune=now --aggressive 2>/dev/null || true

# Clean Docker if present
if command -v docker &> /dev/null; then
  echo "  🐳 Cleaning Docker..."
  docker system prune -f 2>/dev/null || true
fi

# Remove old backup files
echo "  📋 Removing backup files..."
find . -type f \( -name "*.bak" -o -name "*.backup" -o -name "*.old" \) -not -path "./node_modules/*" -delete 2>/dev/null || true

# Clean VS Code workspace cache
echo "  💻 Cleaning VS Code cache..."
rm -rf .vscode/.ropeproject 2>/dev/null || true
rm -rf .vscode/settings.json.bak 2>/dev/null || true

echo "✅ Gitpod workspace cleaned"

# Report space saved
if command -v du &> /dev/null; then
  echo "📊 Current workspace size: $(du -sh /workspace 2>/dev/null | cut -f1)"
fi