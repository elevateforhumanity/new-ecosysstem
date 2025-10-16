#!/usr/bin/env bash
# Simple breadcrumb addition

echo "Adding breadcrumbs..."

# Get Started
if [ -f "dist/get-started/index.html" ] && ! grep -q "BreadcrumbList" "dist/get-started/index.html"; then
  cat > /tmp/breadcrumb.json << 'EOF'
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://elevateforhumanity.pages.dev/"},{"@type":"ListItem","position":2,"name":"Get Started","item":"https://elevateforhumanity.pages.dev/get-started"}]}
</script>
EOF
  sed -i '/<\/head>/i\    '"$(cat /tmp/breadcrumb.json | tr '\n' ' ')" "dist/get-started/index.html"
  echo "✅ Added to get-started"
fi

echo "Done!"
