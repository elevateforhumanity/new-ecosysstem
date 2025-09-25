#!/usr/bin/env bash
set -euo pipefail

echo "🏥 LANDING PAGE HEALTH CHECK"
echo "================================"

# Check if we're in the right directory
if [ ! -d "dist" ]; then
    echo "❌ dist/ directory not found. Run: node scripts/build-durable-site.mjs --inline"
    exit 1
fi

cd dist

echo "📁 Files Check:"
echo "---------------"
for file in index.html apply.html employers.html programs.html policies.html robots.txt sitemap.xml onepage-inline.html; do
    if [ -f "$file" ]; then
        size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "unknown")
        echo "✅ $file ($size bytes)"
    else
        echo "❌ $file - MISSING"
    fi
done

echo ""
echo "🌐 Server Check:"
echo "----------------"

# Check for running servers
servers=$(netstat -tlnp 2>/dev/null | grep -E ":(8080|8081|8082|3000|5173)" || echo "")
if [ -n "$servers" ]; then
    echo "✅ Active servers found:"
    echo "$servers" | while read line; do
        port=$(echo "$line" | grep -oE ":(8080|8081|8082|3000|5173)" | cut -d: -f2)
        echo "   Port $port - LISTENING"
    done
else
    echo "⚠️  No servers detected on common ports"
fi

echo ""
echo "🔗 Page Health Check:"
echo "---------------------"

# Find an active port
active_port=""
for port in 8082 8081 8080 3000 5173; do
    if netstat -tln 2>/dev/null | grep -q ":$port "; then
        active_port=$port
        break
    fi
done

if [ -n "$active_port" ]; then
    echo "🎯 Testing on port $active_port"
    
    # Test each page
    for page in "" "apply.html" "employers.html" "programs.html" "policies.html"; do
        url="http://localhost:$active_port/$page"
        status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        
        if [ "$status" = "200" ]; then
            # Check if it's actually HTML
            content=$(curl -s "$url" 2>/dev/null | head -1)
            if [[ "$content" == *"<!doctype html>"* ]] || [[ "$content" == *"<html"* ]]; then
                echo "✅ /$page - OK ($status)"
            else
                echo "⚠️  /$page - Response but not HTML ($status)"
            fi
        else
            echo "❌ /$page - FAILED ($status)"
        fi
    done
    
    echo ""
    echo "🔍 Content Validation:"
    echo "---------------------"
    
    # Check main page content
    main_content=$(curl -s "http://localhost:$active_port/" 2>/dev/null || echo "")
    if [[ "$main_content" == *"Elevate for Humanity"* ]]; then
        echo "✅ Main page contains correct branding"
    else
        echo "❌ Main page missing expected content"
    fi
    
    if [[ "$main_content" == *"Ignite Your Future"* ]]; then
        echo "✅ Hero headline present"
    else
        echo "❌ Hero headline missing"
    fi
    
    if [[ "$main_content" == *"Jordan Lee"* ]] && [[ "$main_content" == *"Alex Morgan"* ]] && [[ "$main_content" == *"Taylor Rivers"* ]]; then
        echo "✅ All testimonials present"
    else
        echo "❌ Testimonials missing or incomplete"
    fi
    
    echo ""
    echo "🌍 Public URL:"
    echo "-------------"
    
    # Try to get Gitpod URL
    if command -v gp >/dev/null 2>&1; then
        public_url=$(gp url $active_port 2>/dev/null || echo "")
        if [ -n "$public_url" ]; then
            echo "🔗 $public_url"
            echo "📱 Test on mobile: $public_url"
        else
            echo "⚠️  Could not generate public URL"
        fi
    else
        echo "⚠️  Gitpod CLI not available for public URL"
    fi
    
else
    echo "❌ No active server found. Starting one..."
    echo "🚀 Starting server on port 8080..."
    python3 -m http.server 8080 --bind 0.0.0.0 &
    sleep 2
    echo "✅ Server started. Re-run healthcheck."
fi

echo ""
echo "📊 Summary:"
echo "----------"
echo "✅ Landing page files: $(ls -1 *.html 2>/dev/null | wc -l) pages"
echo "✅ SEO files: $(ls -1 robots.txt sitemap.xml 2>/dev/null | wc -l)/2"
echo "✅ Deployment ready: $([ -f onepage-inline.html ] && echo "YES" || echo "NO")"

if [ -n "$active_port" ]; then
    echo "🌐 Live preview: http://localhost:$active_port"
else
    echo "⚠️  No live preview available"
fi

echo ""
echo "🎯 Ready for deployment to Durable, Netlify, or any hosting platform!"