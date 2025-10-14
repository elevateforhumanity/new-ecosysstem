#!/bin/bash

# Fix internal links in all HTML pages
# Convert root paths to /pages/ paths

echo "Fixing internal links in all pages..."

cd dist/pages

# Define link mappings
declare -A LINK_MAP=(
  ['href="/"']='href="/pages/hub.html"'
  ['href="/lms"']='href="/pages/lms.html"'
  ['href="/programs"']='href="/pages/programs.html"'
  ['href="/connect"']='href="/pages/connect.html"'
  ['href="/contact"']='href="/pages/connect.html"'
  ['href="/apply"']='href="/pages/connect.html"'
  ['href="/donate"']='href="/pages/donate.html"'
  ['href="/pay"']='href="/pages/pay.html"'
  ['href="/partners"']='href="/pages/partners.html"'
  ['href="/about"']='href="/pages/sister-sites.html"'
  ['href="/student"']='href="/pages/student-dashboard.html"'
  ['href="/students"']='href="/pages/student-dashboard.html"'
  ['href="/compliance"']='href="/pages/compliance.html"'
  ['href="/government-services"']='href="/pages/government-services.html"'
  ['href="/healthcare-services"']='href="/pages/healthcare-services.html"'
  ['href="/operational-agreements"']='href="/pages/operational-agreements.html"'
  ['href="/kingdom-konnect"']='href="/pages/kingdom-konnect.html"'
  ['href="/urban-build-crew"']='href="/pages/urban-build-crew.html"'
  ['href="/serene-comfort-care"']='href="/pages/serene-comfort-care.html"'
  ['href="/blog"']='href="/pages/blog.html"'
  ['href="/account"']='href="/pages/account.html"'
)

# Fix links in all HTML files
for file in *.html; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Apply all replacements
    for old_link in "${!LINK_MAP[@]}"; do
      new_link="${LINK_MAP[$old_link]}"
      sed -i "s|$old_link|$new_link|g" "$file"
    done
    
    # Remove backup if successful
    rm "$file.bak"
  fi
done

echo "✅ Link fixing complete!"
echo ""
echo "Testing a few pages..."
grep -h 'href="/pages/' kingdom-konnect.html urban-build-crew.html sister-sites.html | head -5
