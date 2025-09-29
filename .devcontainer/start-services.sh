#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting development services..."

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    pnpm install
fi

echo "✅ Ready for development!"
echo "Run 'pnpm dev' to start the development server"
