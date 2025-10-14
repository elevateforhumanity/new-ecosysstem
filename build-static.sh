#!/bin/bash
set -e

echo "🏗️  Building static site for production..."

# Clean previous build
rm -rf dist-static
mkdir -p dist-static

# Copy all static HTML pages
echo "📄 Copying HTML pages..."
cp -r pages/* dist-static/
cp -r public/* dist-static/ 2>/dev/null || true

# Copy root-level HTML files
cp *.html dist-static/ 2>/dev/null || true

# Copy assets
echo "🎨 Copying assets..."
mkdir -p dist-static/assets
cp -r assets/* dist-static/assets/ 2>/dev/null || true

# Copy JavaScript
mkdir -p dist-static/js
cp -r js/* dist-static/js/ 2>/dev/null || true

# Copy catalog
mkdir -p dist-static/catalog
cp -r catalog/* dist-static/catalog/ 2>/dev/null || true

# Copy HLS videos
mkdir -p dist-static/hls
cp -r hls/* dist-static/hls/ 2>/dev/null || true

# Copy configuration files
echo "⚙️  Copying configuration..."
cp _headers dist-static/ 2>/dev/null || true
cp robots.txt dist-static/ 2>/dev/null || true
cp sitemap*.xml dist-static/ 2>/dev/null || true
cp manifest.json dist-static/ 2>/dev/null || true
cp health.txt dist-static/ 2>/dev/null || true

# Create a proper index.html (not redirect)
cat > dist-static/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elevate for Humanity | Career and Technical Education</title>
    <meta name="description" content="Elevate for Humanity provides career and technical education, workforce development, and community impact programs.">
    <link rel="canonical" href="https://elevateforhumanity.org/">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex items-center justify-center px-4">
        <div class="max-w-4xl w-full text-center">
            <h1 class="text-5xl font-bold text-gray-900 mb-6">Elevate for Humanity</h1>
            <p class="text-xl text-gray-600 mb-8">Career and Technical Education Platform</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
                <a href="/lms.html" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                    <h3 class="text-lg font-semibold text-purple-600 mb-2">Learning Management System</h3>
                    <p class="text-gray-600">Access courses and training</p>
                </a>
                
                <a href="/demo-site.html" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                    <h3 class="text-lg font-semibold text-blue-600 mb-2">Demo Site</h3>
                    <p class="text-gray-600">Explore platform features</p>
                </a>
                
                <a href="/connect.html" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                    <h3 class="text-lg font-semibold text-green-600 mb-2">Connect</h3>
                    <p class="text-gray-600">Join our community</p>
                </a>
                
                <a href="/apply.html" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                    <h3 class="text-lg font-semibold text-orange-600 mb-2">Apply</h3>
                    <p class="text-gray-600">Start your journey</p>
                </a>
                
                <a href="/employers.html" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                    <h3 class="text-lg font-semibold text-red-600 mb-2">Employers</h3>
                    <p class="text-gray-600">Hire our graduates</p>
                </a>
                
                <a href="/donate.html" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                    <h3 class="text-lg font-semibold text-pink-600 mb-2">Donate</h3>
                    <p class="text-gray-600">Support our mission</p>
                </a>
            </div>
        </div>
    </div>
</body>
</html>
EOF

echo "✅ Static site built successfully!"
echo "📁 Output: dist-static/"
echo "📊 Files: $(find dist-static -type f | wc -l)"
