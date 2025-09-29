#!/bin/bash
# Business Development Academy Server (Port 6000)
echo "🚀 Starting Business Development Academy on port 6000..."
cd "$(dirname "$0")/.."
python3 -m http.server 6000 --bind 0.0.0.0 --directory . &
echo "✅ Business Development Academy running at http://localhost:6000"
echo "🌐 Access via: https://elevateforhumanity.org/business-academy"
