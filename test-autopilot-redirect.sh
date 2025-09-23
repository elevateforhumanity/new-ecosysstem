#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-elevateforhumanity.org}"

echo "Testing redirect for https://${DOMAIN} ..."
# -I heads only; -L follows redirects
out=$(curl -sSIL "https://${DOMAIN}/" || true)

echo "----- RESPONSE -----"
echo "$out"
echo "--------------------"

# Extract final Location (if present)
final=$(echo "$out" | awk '/^Location:/ {print $2}' | tail -n1 | tr -d '\r')
if [ -n "$final" ]; then
  echo "Final Location: $final"
else
  echo "No Location header found. If you just created the rule, CDN propagation may take a minute."
fi