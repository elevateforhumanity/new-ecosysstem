#!/usr/bin/env bash
set -e

echo "🔄 Starting autosave system (every 2 minutes)..."

while true; do
  # Check if there are any changes to commit
  if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Changes detected, auto-saving..."
    
    # Add all changes
    git add -A
    
    # Commit with timestamp
    git commit -m "autosave: $(date -u +'%Y-%m-%dT%H:%M:%SZ')" || true
    
    # Push to remote (ignore errors if no remote or network issues)
    git push origin HEAD 2>/dev/null || echo "⚠️  Push failed (network/remote issue)"
    
    echo "✅ Auto-save completed"
  else
    echo "✨ No changes to save"
  fi
  
  # Wait 2 minutes
  sleep 120
done