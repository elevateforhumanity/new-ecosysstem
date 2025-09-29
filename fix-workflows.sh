#!/bin/bash

# Fix all GitHub workflows to use proper Vite build process

WORKFLOWS=(
  ".github/workflows/cloudflare.yml"
  ".github/workflows/enterprise-deploy.yml"
  ".github/workflows/multitenant-deploy.yml"
  ".github/workflows/seo-deploy.yml"
  ".github/workflows/site-ci.yml"
)

for workflow in "${WORKFLOWS[@]}"; do
  if [ -f "$workflow" ]; then
    echo "Fixing $workflow..."
    
    # Replace the incorrect build process with proper Vite build
    sed -i '/mkdir -p dist/,/cp _redirects dist\/ 2>\/dev\/null || true/c\
          pnpm build\
          cp robots.txt dist/ 2>/dev/null || true\
          cp sitemap*.xml dist/ 2>/dev/null || true\
          cp _headers dist/ 2>/dev/null || true\
          cp _redirects dist/ 2>/dev/null || true' "$workflow"
    
    echo "Fixed $workflow"
  else
    echo "Warning: $workflow not found"
  fi
done

echo "All workflows fixed!"