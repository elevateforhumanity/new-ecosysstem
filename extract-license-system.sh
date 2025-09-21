#!/bin/bash

# EXTRACT COMPLETE LICENSE SYSTEM
# Packages all 34 license-related files into a deployable system

echo "🛡️ EXTRACTING COMPLETE LICENSE PROTECTION SYSTEM"
echo "================================================="

# Create license package directory
LICENSE_DIR="complete-license-system-package"
mkdir -p "$LICENSE_DIR"

echo "📦 Packaging 34 license system files..."

# Core license files
mkdir -p "$LICENSE_DIR/core"
cp license-protection-system.js "$LICENSE_DIR/core/" 2>/dev/null || echo "File not found: license-protection-system.js"
cp license-management-api.js "$LICENSE_DIR/core/" 2>/dev/null || echo "File not found: license-management-api.js"
cp license-production-server.js "$LICENSE_DIR/core/" 2>/dev/null || echo "File not found: license-production-server.js"
cp tiered-license-system.js "$LICENSE_DIR/core/" 2>/dev/null || echo "File not found: tiered-license-system.js"
cp license-generator.js "$LICENSE_DIR/core/" 2>/dev/null || echo "File not found: license-generator.js"
cp license-api.js "$LICENSE_DIR/core/" 2>/dev/null || echo "File not found: license-api.js"
cp renew-license.js "$LICENSE_DIR/core/" 2>/dev/null || echo "File not found: renew-license.js"

# Dashboard files
mkdir -p "$LICENSE_DIR/dashboard"
cp license-dashboard.html "$LICENSE_DIR/dashboard/" 2>/dev/null || echo "File not found: license-dashboard.html"
cp elevate_license_dashboard.html "$LICENSE_DIR/dashboard/" 2>/dev/null || echo "File not found: elevate_license_dashboard.html"
cp license-demo.html "$LICENSE_DIR/dashboard/" 2>/dev/null || echo "File not found: license-demo.html"
cp buy-license.html "$LICENSE_DIR/dashboard/" 2>/dev/null || echo "File not found: buy-license.html"

# Server infrastructure
mkdir -p "$LICENSE_DIR/server"
cp Dockerfile.license-server "$LICENSE_DIR/server/" 2>/dev/null || echo "File not found: Dockerfile.license-server"
cp license-server-package.json "$LICENSE_DIR/server/" 2>/dev/null || echo "File not found: license-server-package.json"
cp webhook-license-delivery.js "$LICENSE_DIR/server/" 2>/dev/null || echo "File not found: webhook-license-delivery.js"

# Integration files
mkdir -p "$LICENSE_DIR/integration"
cp middleware/license.js "$LICENSE_DIR/integration/" 2>/dev/null || echo "File not found: middleware/license.js"
cp routes/license-validation.js "$LICENSE_DIR/integration/" 2>/dev/null || echo "File not found: routes/license-validation.js"
cp lib/license-protection.js "$LICENSE_DIR/integration/" 2>/dev/null || echo "File not found: lib/license-protection.js"
cp config/license.env "$LICENSE_DIR/integration/" 2>/dev/null || echo "File not found: config/license.env"

# Scripts and automation
mkdir -p "$LICENSE_DIR/scripts"
cp scripts/generate-license.js "$LICENSE_DIR/scripts/" 2>/dev/null || echo "File not found: scripts/generate-license.js"
cp scripts/validate-license-system.js "$LICENSE_DIR/scripts/" 2>/dev/null || echo "File not found: scripts/validate-license-system.js"
cp scripts/license_pdf_generator.py "$LICENSE_DIR/scripts/" 2>/dev/null || echo "File not found: scripts/license_pdf_generator.py"
cp test-license-system.js "$LICENSE_DIR/scripts/" 2>/dev/null || echo "File not found: test-license-system.js"

# API files
mkdir -p "$LICENSE_DIR/api"
cp api/license-dashboard.js "$LICENSE_DIR/api/" 2>/dev/null || echo "File not found: api/license-dashboard.js"
cp api/license-server.js "$LICENSE_DIR/api/" 2>/dev/null || echo "File not found: api/license-server.js"

# Testing files
mkdir -p "$LICENSE_DIR/tests"
cp tests/performance/license-validation.js "$LICENSE_DIR/tests/" 2>/dev/null || echo "File not found: tests/performance/license-validation.js"

# Copy all remaining license files
echo "🔍 Finding and copying all license-related files..."
find . -name "*license*" -type f | while read file; do
    if [[ ! "$file" =~ node_modules && ! "$file" =~ .git ]]; then
        filename=$(basename "$file")
        if [[ ! -f "$LICENSE_DIR/core/$filename" && ! -f "$LICENSE_DIR/dashboard/$filename" && ! -f "$LICENSE_DIR/server/$filename" && ! -f "$LICENSE_DIR/integration/$filename" && ! -f "$LICENSE_DIR/scripts/$filename" && ! -f "$LICENSE_DIR/api/$filename" && ! -f "$LICENSE_DIR/tests/$filename" ]]; then
            cp "$file" "$LICENSE_DIR/misc/" 2>/dev/null || mkdir -p "$LICENSE_DIR/misc" && cp "$file" "$LICENSE_DIR/misc/"
            echo "  ✓ Copied additional file: $file"
        fi
    fi
done

# Create setup script
cat > "$LICENSE_DIR/setup-license-system.sh" << 'EOF'
#!/bin/bash
echo "🛡️ Setting up Complete License Protection System"
echo "================================================"

# Install dependencies
echo "📦 Installing dependencies..."
npm init -y
npm install express stripe jsonwebtoken crypto-js bcrypt cors helmet

# Setup environment
echo "⚙️ Setting up environment..."
cp integration/license.env .env
echo "Edit .env file with your actual keys and configuration"

# Make scripts executable
chmod +x scripts/*.js
chmod +x scripts/*.py

# Start license server
echo "🚀 Starting license server..."
node core/license-production-server.js &

echo "✅ License system setup complete!"
echo "📊 Dashboard available at: http://localhost:3001/dashboard"
echo "🔑 API endpoint: http://localhost:3001/api/validate-license"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Configure Stripe integration"
echo "3. Test license generation: node scripts/generate-license.js"
echo "4. Open dashboard: open dashboard/license-dashboard.html"
EOF

chmod +x "$LICENSE_DIR/setup-license-system.sh"

# Create package documentation
cp COMPLETE-LICENSE-PACKAGE.md "$LICENSE_DIR/README.md"

# Create deployment guide
cat > "$LICENSE_DIR/DEPLOYMENT-GUIDE.md" << 'EOF'
# LICENSE SYSTEM DEPLOYMENT GUIDE

## Quick Start
1. Run: `./setup-license-system.sh`
2. Configure environment variables in `.env`
3. Start the license server
4. Access dashboard at http://localhost:3001

## Production Deployment
1. Use Docker: `docker build -f server/Dockerfile.license-server`
2. Deploy to cloud platform (AWS, Azure, GCP)
3. Configure SSL certificates
4. Setup monitoring and backups

## Integration
- Add middleware to your Express app
- Use API endpoints for license validation
- Integrate with Stripe for payments
- Setup webhooks for automated delivery

## Support
- Documentation: README.md
- API Reference: Built-in dashboard
- Testing: Use test-license-system.js
EOF

# Count files and create summary
TOTAL_FILES=$(find "$LICENSE_DIR" -type f | wc -l)

echo ""
echo "✅ LICENSE SYSTEM PACKAGE COMPLETE!"
echo "=================================="
echo "📁 Package location: $LICENSE_DIR/"
echo "📊 Total files packaged: $TOTAL_FILES"
echo "🛡️ Features included:"
echo "  • Advanced DRM protection"
echo "  • Multi-tier licensing ($50K - $10M)"
echo "  • Usage tracking & analytics"
echo "  • Stripe payment integration"
echo "  • Enterprise dashboards"
echo "  • API endpoints"
echo "  • Docker deployment"
echo ""
echo "🚀 To deploy:"
echo "  cd $LICENSE_DIR"
echo "  ./setup-license-system.sh"
echo ""
echo "💰 Revenue potential: $50K - $10M+ per license"
echo "🔒 Enterprise-grade protection included"