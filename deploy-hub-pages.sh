#!/bin/bash

# Deploy Hub Pages Script
# This script creates a deployment-ready directory for hub pages

set -e

echo "🚀 Deploying Hub Pages..."

# Create deployment directory
mkdir -p hub-pages

# Copy hub page files
echo "📄 Copying hub page files..."
cp student-hub.html hub-pages/
cp business-hub.html hub-pages/
cp community-hub.html hub-pages/
cp educator-hub.html hub-pages/

# Create index.html for hub pages subdomain
cat > hub-pages/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elevate for Humanity - Hub Pages</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <meta name="description" content="Access specialized hub pages for students, businesses, community members, and educators at Elevate for Humanity.">
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-16">
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Elevate for Humanity Hub Pages</h1>
            <p class="text-xl text-gray-600">Choose your specialized hub below</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <a href="/student-hub.html" class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 text-center">
                <div class="text-4xl mb-4">🎓</div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Student Hub</h2>
                <p class="text-gray-600">Access courses, track progress, and connect with opportunities</p>
            </a>
            
            <a href="/business-hub.html" class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 text-center">
                <div class="text-4xl mb-4">💼</div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Business Hub</h2>
                <p class="text-gray-600">Partner with us to build a skilled workforce</p>
            </a>
            
            <a href="/community-hub.html" class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 text-center">
                <div class="text-4xl mb-4">🤝</div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Community Hub</h2>
                <p class="text-gray-600">Connect with learners and share experiences</p>
            </a>
            
            <a href="/educator-hub.html" class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 text-center">
                <div class="text-4xl mb-4">👨‍🏫</div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Educator Hub</h2>
                <p class="text-gray-600">Access LMS and curriculum resources</p>
            </a>
        </div>
        
        <div class="text-center mt-12">
            <a href="https://elevateforhumanity.org" class="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300">
                Return to Main Site
            </a>
        </div>
    </div>
</body>
</html>
EOF

# Create _redirects file for Netlify
cat > hub-pages/_redirects << 'EOF'
/student-hub /student-hub.html 200
/business-hub /business-hub.html 200
/community-hub /community-hub.html 200
/educator-hub /educator-hub.html 200
/* https://elevateforhumanity.org/:splat 301
EOF

# Create robots.txt
cat > hub-pages/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://hubs.elevateforhumanity.org/sitemap.xml
EOF

# Create sitemap.xml
cat > hub-pages/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hubs.elevateforhumanity.org/</loc>
    <lastmod>2025-09-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://hubs.elevateforhumanity.org/student-hub.html</loc>
    <lastmod>2025-09-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://hubs.elevateforhumanity.org/business-hub.html</loc>
    <lastmod>2025-09-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://hubs.elevateforhumanity.org/community-hub.html</loc>
    <lastmod>2025-09-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://hubs.elevateforhumanity.org/educator-hub.html</loc>
    <lastmod>2025-09-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
EOF

echo "✅ Hub pages deployment directory created successfully!"
echo "📁 Files created in hub-pages/ directory:"
ls -la hub-pages/

echo ""
echo "🌐 Next steps:"
echo "1. Deploy hub-pages/ directory to GitHub Pages or Netlify"
echo "2. Configure DNS: hubs.elevateforhumanity.org → deployment URL"
echo "3. Update main site redirects to point to hubs.elevateforhumanity.org"
echo ""
echo "🔗 Hub page URLs will be:"
echo "   https://hubs.elevateforhumanity.org/student-hub.html"
echo "   https://hubs.elevateforhumanity.org/business-hub.html"
echo "   https://hubs.elevateforhumanity.org/community-hub.html"
echo "   https://hubs.elevateforhumanity.org/educator-hub.html"