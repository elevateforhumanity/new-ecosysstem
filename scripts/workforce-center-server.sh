#!/bin/bash
# Workforce Development Center Server (Port 5000)
echo "💼 Starting Workforce Development Center on port 5000..."
cd "$(dirname "$0")/.."
python3 -m http.server 5000 --bind 0.0.0.0 --directory . &
echo "✅ Workforce Development Center running at http://localhost:5000"
echo "🌐 Access via: https://elevateforhumanity.org/workforce-training"
