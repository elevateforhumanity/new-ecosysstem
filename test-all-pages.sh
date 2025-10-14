#!/bin/bash

BASE_URL="https://8080--0199bf65-f2f1-7175-b8bc-05eec2adf334.us-east-1-01.gitpod.dev/pages"

echo "Testing All Pages..."
echo "===================="
echo ""

# Test key pages
PAGES=(
  "kingdom-konnect.html"
  "urban-build-crew.html"
  "serene-comfort-care.html"
  "sister-sites.html"
  "partners.html"
  "hub.html"
  "programs.html"
  "lms.html"
  "student-dashboard.html"
  "connect.html"
  "compliance.html"
  "donate.html"
  "pay.html"
  "blog.html"
)

for page in "${PAGES[@]}"; do
  echo -n "Testing $page... "
  
  # Get HTTP status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$page")
  
  # Get content and check for errors
  content=$(curl -s "$BASE_URL/$page")
  
  if [ "$status" = "200" ]; then
    # Check for error messages
    if echo "$content" | grep -qi "loading\|couldn't load\|error\|not found"; then
      echo "⚠️  $status (Has loading/error messages)"
    else
      echo "✅ $status (Working)"
    fi
  else
    echo "❌ $status (Failed)"
  fi
done

echo ""
echo "Testing complete!"
