#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
#  Fix2 Support Bundle Generator
#  Collects diagnostic information for troubleshooting Gitpod environment issues
# ──────────────────────────────────────────────────────────────────────────────

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BUNDLE_DIR="support-bundle-${TIMESTAMP}"
BUNDLE_FILE="support-bundle-${TIMESTAMP}.tar.gz"

echo "🔍 Generating support bundle..."
echo "Creating directory: ${BUNDLE_DIR}"

mkdir -p "${BUNDLE_DIR}"

# System Information
echo "📋 Collecting system information..."
{
  echo "=== System Information ==="
  echo "Date: $(date -u)"
  echo "Hostname: $(hostname)"
  echo "User: $(whoami)"
  echo "Working Directory: $(pwd)"
  echo ""
  
  echo "=== OS Information ==="
  cat /etc/os-release 2>/dev/null || echo "OS info not available"
  echo ""
  
  echo "=== Kernel ==="
  uname -a
  echo ""
  
  echo "=== CPU Info ==="
  lscpu 2>/dev/null || echo "CPU info not available"
  echo ""
  
  echo "=== Memory ==="
  free -h 2>/dev/null || echo "Memory info not available"
  echo ""
  
  echo "=== Disk Usage ==="
  df -h
  echo ""
} > "${BUNDLE_DIR}/system-info.txt"

# Environment Variables (sanitized)
echo "🔐 Collecting environment variables (sanitized)..."
{
  echo "=== Environment Variables (sensitive values redacted) ==="
  env | sort | sed -E 's/(KEY|TOKEN|SECRET|PASSWORD|PASS)=.*/\1=***REDACTED***/gi'
} > "${BUNDLE_DIR}/environment.txt"

# Gitpod CLI Information
echo "🚀 Collecting Gitpod information..."
{
  echo "=== Gitpod Version ==="
  gitpod version 2>&1 || echo "Gitpod CLI not available"
  echo ""
  
  echo "=== Gitpod Whoami ==="
  gitpod whoami 2>&1 || echo "Not logged in or CLI not available"
  echo ""
  
  echo "=== Gitpod Environment Info ==="
  gitpod environment get 2>&1 || echo "No active environment or CLI not available"
  echo ""
  
  echo "=== Gitpod Environment List ==="
  gitpod environment list 2>&1 || echo "Cannot list environments"
  echo ""
} > "${BUNDLE_DIR}/gitpod-info.txt"

# Git Information
echo "📦 Collecting Git information..."
{
  echo "=== Git Status ==="
  git status 2>&1 || echo "Not a git repository"
  echo ""
  
  echo "=== Git Remote ==="
  git remote -v 2>&1 || echo "No git remotes"
  echo ""
  
  echo "=== Git Branch ==="
  git branch -a 2>&1 || echo "No git branches"
  echo ""
  
  echo "=== Git Log (last 5) ==="
  git log --oneline -5 2>&1 || echo "No git history"
  echo ""
} > "${BUNDLE_DIR}/git-info.txt"

# Configuration Files
echo "📄 Collecting configuration files..."
for file in .gitpod.yml .devcontainer/devcontainer.json .vscode/settings.json .vscode/extensions.json package.json; do
  if [ -f "$file" ]; then
    cp "$file" "${BUNDLE_DIR}/$(basename $file)"
  fi
done

# Docker/Container Information
echo "🐳 Collecting container information..."
{
  echo "=== Docker Version ==="
  docker version 2>&1 || echo "Docker not available"
  echo ""
  
  echo "=== Docker Info ==="
  docker info 2>&1 || echo "Docker info not available"
  echo ""
  
  echo "=== Running Containers ==="
  docker ps 2>&1 || echo "Cannot list containers"
  echo ""
} > "${BUNDLE_DIR}/docker-info.txt"

# Node/NPM Information
echo "📦 Collecting Node.js information..."
{
  echo "=== Node Version ==="
  node --version 2>&1 || echo "Node not available"
  echo ""
  
  echo "=== NPM Version ==="
  npm --version 2>&1 || echo "NPM not available"
  echo ""
  
  echo "=== Installed Global Packages ==="
  npm list -g --depth=0 2>&1 || echo "Cannot list global packages"
  echo ""
} > "${BUNDLE_DIR}/node-info.txt"

# Process Information
echo "⚙️  Collecting process information..."
{
  echo "=== Running Processes ==="
  ps aux
  echo ""
  
  echo "=== Network Connections ==="
  netstat -tuln 2>/dev/null || ss -tuln 2>/dev/null || echo "Network info not available"
  echo ""
} > "${BUNDLE_DIR}/process-info.txt"

# Recent Logs (if available)
echo "📝 Collecting logs..."
{
  echo "=== Recent System Logs ==="
  journalctl --no-pager -n 100 2>&1 || echo "System logs not available"
  echo ""
} > "${BUNDLE_DIR}/logs.txt"

# Project Structure
echo "📁 Collecting project structure..."
{
  echo "=== Directory Tree ==="
  tree -L 3 -a -I '.git|node_modules' 2>/dev/null || find . -maxdepth 3 -not -path '*/\.git/*' -not -path '*/node_modules/*' 2>/dev/null || echo "Cannot generate tree"
} > "${BUNDLE_DIR}/project-structure.txt"

# Create tarball
echo "📦 Creating archive..."
tar -czf "${BUNDLE_FILE}" "${BUNDLE_DIR}"

# Cleanup
rm -rf "${BUNDLE_DIR}"

echo ""
echo "✅ Support bundle created: ${BUNDLE_FILE}"
echo "📊 Bundle size: $(du -h "${BUNDLE_FILE}" | cut -f1)"
echo ""
echo "You can now download this file and share it with support."
echo "To download: Right-click the file in VS Code Explorer and select 'Download'"
echo ""
