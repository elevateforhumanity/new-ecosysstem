#!/bin/bash
# Career Transformation Hub Server (Port 7000)
echo "🔄 Starting Career Transformation Hub on port 7000..."
cd "$(dirname "$0")/.."
python3 -m http.server 7000 --bind 0.0.0.0 --directory . &
echo "✅ Career Transformation Hub running at http://localhost:7000"
echo "🌐 Access via: https://elevateforhumanity.org/career-transformation"
