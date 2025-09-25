#!/usr/bin/env bash
set -euo pipefail
echo "Top CPU processes:"
ps -eo pid,pcpu,pmem,comm --sort=-pcpu | head
echo
echo "Killing stray node processes > 90% CPU (if any)..."
for pid in $(ps -eo pid,pcpu,comm | awk '$2>90 && $3=="node"{print $1}'); do
  kill -TERM "$pid" || true
done
echo "Free space:"
df -h | sed -n '1,5p'
echo "Mem:"
free -h