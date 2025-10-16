#!/bin/bash
# Setup Cloudflare Pages Environment Variables
# This script helps configure environment variables in Cloudflare Pages

echo "🔧 CLOUDFLARE PAGES ENVIRONMENT VARIABLE SETUP"
echo "==============================================="
echo ""

export CLOUDFLARE_API_TOKEN="Vr7RBd1RDQUSbly2jqjU2hvbC1SBk_1iDuSNIYOS"
export CLOUDFLARE_ACCOUNT_ID="6ba1d2a52a3fa230972960db307ac7c0"

echo "Project: elevateforhumanity"
echo "Account ID: $CLOUDFLARE_ACCOUNT_ID"
echo ""

echo "## RECOMMENDED ENVIRONMENT VARIABLES"
echo "------------------------------------"
echo ""
echo "These should be set in the Cloudflare Pages dashboard:"
echo "https://dash.cloudflare.com/$CLOUDFLARE_ACCOUNT_ID/pages/view/elevateforhumanity/settings/environment-variables"
echo ""

echo "### Production Environment:"
echo "NODE_ENV=production"
echo ""

echo "### Optional (if using these services):"
echo "VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co"
echo "VITE_SUPABASE_ANON_KEY=your-anon-key"
echo "GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX"
echo "STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXX"
echo ""

echo "## HOW TO SET ENVIRONMENT VARIABLES"
echo "------------------------------------"
echo "1. Go to the URL above"
echo "2. Click 'Add variable'"
echo "3. Enter variable name and value"
echo "4. Select environment (Production/Preview)"
echo "5. Click 'Save'"
echo ""

echo "## CURRENT CONFIGURATION"
echo "------------------------"
echo "✅ Build output directory: dist"
echo "✅ Build command: npm run build"
echo "✅ Node version: 20 (recommended)"
echo ""

echo "Note: Environment variables set in the dashboard are available"
echo "during build time and runtime for your Pages application."
