#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Setting up React development environment..."

# Install pnpm globally
npm install -g pnpm@9.7.0
corepack enable
corepack prepare pnpm@9.7.0 --activate

# Install dependencies
pnpm install

echo "✅ Setup complete!"
