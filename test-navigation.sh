#!/bin/bash

BASE_URL="https://8080--0199bf65-f2f1-7175-b8bc-05eec2adf334.us-east-1-01.gitpod.dev"

echo "Testing Navigation Links..."
echo "=========================="
echo ""

# Test sister sites navigation
echo "Sister Sites Navigation:"
echo "------------------------"

PAGES=(
  "kingdom-konnect.html"
  "urban-build-crew.html"
  "serene-comfort-care.html"
  "sister-sites.html"
)

for page in "${PAGES[@]}"; do
  echo "Testing links in $page..."
  
  # Get all /pages/ links from the page
  links=$(curl -s "$BASE_URL/pages/$page" | grep -o 'href="/pages/[^"]*"' | sed 's/href="//;s/"$//' | sort -u)
  
  if [ -z "$links" ]; then
    echo "  ⚠️  No /pages/ links found"
  else
    for link in $links; do
      status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$link")
      if [ "$status" = "200" ]; then
        echo "  ✅ $link"
      else
        echo "  ❌ $link ($status)"
      fi
    done
  fi
  echo ""
done

echo "=========================="
echo "Navigation test complete!"
