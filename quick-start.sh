#!/bin/bash

# Quick Start Script for Dynamic Pages
# One-command setup for Durable embedding

echo "🚀 Quick Start - Dynamic Pages for Durable"
echo "=========================================="

# Navigate to project directory
cd /workspaces/new-ecosysstem

# Make main script executable
chmod +x start-dynamic-pages.sh

# Start development server on port 8080 (Durable-compatible)
echo "🔧 Starting server on port 8080..."
./start-dynamic-pages.sh dev 8080

echo ""
echo "✅ Quick start complete!"
echo "🌐 Your dynamic pages are now live and ready for Durable embedding"