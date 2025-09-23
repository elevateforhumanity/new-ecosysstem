#!/bin/bash

# Test redirect setup
echo "🧪 Testing redirect setup..."

echo "Testing elevateforhumanity.org:"
curl -I https://elevateforhumanity.org 2>/dev/null | head -3

echo ""
echo "Testing www.elevateforhumanity.org:"
curl -I https://www.elevateforhumanity.org 2>/dev/null | head -3

echo ""
echo "Expected: HTTP/2 301 with Location header pointing to elevate4humanity.org"
