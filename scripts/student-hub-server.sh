#!/bin/bash
# Student Hub Portal Server (Port 4000)
echo "🎓 Starting Student Hub Portal on port 4000..."
cd "$(dirname "$0")/.."
python3 -m http.server 4000 --bind 0.0.0.0 --directory . &
echo "✅ Student Hub Portal running at http://localhost:4000"
echo "🌐 Access via: https://elevateforhumanity.org/student-hub"
