#!/bin/bash

# ============================================================================
# INSTALL ALL DEPENDENCIES
# ============================================================================

set -e

echo "📦 Installing all dependencies..."
echo "================================"
echo ""

# Backend
if [ -d "backend" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    echo "✅ Backend dependencies installed"
    cd ..
else
    echo "⚠️  Backend directory not found"
fi

echo ""

# Frontend
if [ -d "frontend" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    echo "✅ Frontend dependencies installed"
    cd ..
else
    echo "⚠️  Frontend directory not found"
fi

echo ""

# Workers
if [ -d "workers" ]; then
    echo "📦 Installing workers dependencies..."
    cd workers
    npm install
    echo "✅ Workers dependencies installed"
    cd ..
else
    echo "⚠️  Workers directory not found"
fi

echo ""
echo "================================"
echo "✅ All dependencies installed!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Fill in your API keys"
echo "3. Run: ./deploy-now.sh"
echo ""
