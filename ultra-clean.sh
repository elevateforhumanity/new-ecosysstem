#!/bin/bash

echo "🧹 ULTRA CLEAN - REACT APP ONLY"
echo "==============================="

# Keep only these essential files and directories
KEEP_ITEMS=(
  ".git"
  ".github"
  ".gitignore"
  ".devcontainer"
  "node_modules"
  "src"
  "dist"
  "public"
  "package.json"
  "pnpm-lock.yaml"
  "vite.config.js"
  "index.html"
  ".npmrc"
  ".nvmrc"
  ".eslintrc.cjs"
  ".prettierrc.json"
  "tsconfig.json"
)

echo "🗑️  Removing everything except React app essentials..."

# Move to temp directory and back to avoid issues
cd /workspaces/new-ecosysstem

# Remove everything not in keep list
for item in *; do
  KEEP=false
  for keep_item in "${KEEP_ITEMS[@]}"; do
    if [[ "$item" == "$keep_item" ]]; then
      KEEP=true
      break
    fi
  done
  
  if [ "$KEEP" = false ]; then
    echo "🗑️  Removing: $item"
    rm -rf "$item"
  fi
done

# Also remove hidden files not in keep list
for item in .*; do
  if [[ "$item" == "." || "$item" == ".." ]]; then
    continue
  fi
  
  KEEP=false
  for keep_item in "${KEEP_ITEMS[@]}"; do
    if [[ "$item" == "$keep_item" ]]; then
      KEEP=true
      break
    fi
  done
  
  if [ "$KEEP" = false ]; then
    echo "🗑️  Removing hidden: $item"
    rm -rf "$item"
  fi
done

echo ""
echo "📋 Final directory contents:"
ls -la

echo ""
echo "✅ ULTRA CLEAN COMPLETE"
echo "======================="
echo "🎯 ONLY REACT APP FILES REMAIN"