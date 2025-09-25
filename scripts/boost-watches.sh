#!/usr/bin/env bash
set -euo pipefail

# Try to apply sysctl (best effort)
if command -v sudo >/dev/null 2>&1; then
  sudo sysctl -p || true
fi

# Fallbacks via /proc for current user session
if [ -w /proc/sys/fs/inotify/max_user_watches ]; then
  echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches >/dev/null || true
fi
if [ -w /proc/sys/fs/inotify/max_user_instances ]; then
  echo 1024 | sudo tee /proc/sys/fs/inotify/max_user_instances >/dev/null || true
fi

echo "[OK] Inotify boosted: watches=$(cat /proc/sys/fs/inotify/max_user_watches) instances=$(cat /proc/sys/fs/inotify/max_user_instances)"