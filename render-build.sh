#!/usr/bin/env bash
# Render build script - handles pnpm installation if needed

set -e

echo "🔧 Render Build Script"
echo "======================"

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm not found, using npm instead..."
    npm install
    npm run build
else
    echo "📦 Using pnpm..."
    pnpm install --frozen-lockfile=false
    pnpm run build
fi

echo "✅ Build complete!"
