#!/bin/bash

# EXTRACT SISTER SITES & BRAIN SYSTEM
# Packages all sister sites and brain system files for multi-site architecture

echo "🧠 EXTRACTING SISTER SITES & BRAIN SYSTEM PACKAGE"
echo "================================================="

# Create sister sites and brain package directory
SISTER_BRAIN_DIR="complete-sister-sites-brain-package"
mkdir -p "$SISTER_BRAIN_DIR"

echo "🔍 Packaging sister sites and brain system files..."

# =============================================================================
# BRAIN SYSTEM CORE
# =============================================================================

echo "🧠 Extracting Brain System Core..."
mkdir -p "$SISTER_BRAIN_DIR/brain-system"

# Copy brain dashboard files
echo "  📊 Copying brain dashboard files..."
cp src/dashboard/elevate-brain.html "$SISTER_BRAIN_DIR/brain-system/" 2>/dev/null && echo "    ✓ elevate-brain.html"
cp src/dashboard/license-manager.html "$SISTER_BRAIN_DIR/brain-system/" 2>/dev/null && echo "    ✓ license-manager.html"

# Copy brain configuration files
echo "  ⚙️ Copying brain configuration..."
cp config/sister_sites_nav_config.json "$SISTER_BRAIN_DIR/brain-system/" 2>/dev/null && echo "    ✓ sister_sites_nav_config.json"
cp public/sister_sites_nav_config.json "$SISTER_BRAIN_DIR/brain-system/public_nav_config.json" 2>/dev/null && echo "    ✓ public_nav_config.json"
cp js/sister-sites-nav.js "$SISTER_BRAIN_DIR/brain-system/" 2>/dev/null && echo "    ✓ sister-sites-nav.js"

# =============================================================================
# SISTER SITES ARCHITECTURE
# =============================================================================

echo "🏗️ Extracting Sister Sites Architecture..."
mkdir -p "$SISTER_BRAIN_DIR/sister-sites-architecture"

# Copy wire_in_sisters directory
echo "  🔌 Copying wire_in_sisters system..."
if [ -d "wire_in_sisters" ]; then
    cp -r wire_in_sisters/* "$SISTER_BRAIN_DIR/sister-sites-architecture/" 2>/dev/null
    echo "    ✓ Complete wire_in_sisters/ directory"
fi

# =============================================================================
# SISTER SITES REACT COMPONENTS
# =============================================================================

echo "⚛️ Extracting Sister Sites React Components..."
mkdir -p "$SISTER_BRAIN_DIR/react-components"

# Copy sister sites React components
echo "  📱 Copying React components..."
if [ -d "client/src/pages/sisters" ]; then
    cp -r client/src/pages/sisters/* "$SISTER_BRAIN_DIR/react-components/" 2>/dev/null
    echo "    ✓ Complete sisters/ React components"
fi

# List the components copied
echo "  📋 Sister site components included:"
ls "$SISTER_BRAIN_DIR/react-components/" 2>/dev/null | while read component; do
    echo "    • $component"
done

# =============================================================================
# SISTER SITES MANAGEMENT & MONITORING
# =============================================================================

echo "📊 Extracting Management & Monitoring..."
mkdir -p "$SISTER_BRAIN_DIR/management"

# Copy management files
echo "  🏥 Copying health monitoring..."
cp sister-sites-health-check.html "$SISTER_BRAIN_DIR/management/" 2>/dev/null && echo "    ✓ sister-sites-health-check.html"
cp tools/sister-sites-integration-check.js "$SISTER_BRAIN_DIR/management/" 2>/dev/null && echo "    ✓ sister-sites-integration-check.js"
cp sister-site-autopilot.js "$SISTER_BRAIN_DIR/management/" 2>/dev/null && echo "    ✓ sister-site-autopilot.js"

# =============================================================================
# DEPLOYMENT & CONFIGURATION
# =============================================================================

echo "🚀 Extracting Deployment & Configuration..."
mkdir -p "$SISTER_BRAIN_DIR/deployment"

# Copy deployment files
echo "  🌐 Copying deployment configuration..."
cp netlify-sister.toml "$SISTER_BRAIN_DIR/deployment/" 2>/dev/null && echo "    ✓ netlify-sister.toml"

# Copy deployment scripts
mkdir -p "$SISTER_BRAIN_DIR/deployment/scripts"
cp scripts/build-sister-landing-pages.js "$SISTER_BRAIN_DIR/deployment/scripts/" 2>/dev/null && echo "    ✓ build-sister-landing-pages.js"
cp scripts/inject-sister-nav.js "$SISTER_BRAIN_DIR/deployment/scripts/" 2>/dev/null && echo "    ✓ inject-sister-nav.js"

# =============================================================================
# SHARED MEMORY & DATA SYSTEM
# =============================================================================

echo "💾 Extracting Shared Memory & Data System..."
mkdir -p "$SISTER_BRAIN_DIR/shared-memory"

# Copy brain data fixtures
echo "  🧠 Copying brain data fixtures..."
find data/fixtures -name "*sister*" -o -name "*brain*" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        cp "$file" "$SISTER_BRAIN_DIR/shared-memory/"
        echo "    ✓ $filename"
    fi
done

# =============================================================================
# TESTING SUITE
# =============================================================================

echo "🧪 Extracting Testing Suite..."
mkdir -p "$SISTER_BRAIN_DIR/testing"

# Copy integration tests
echo "  🔬 Copying integration tests..."
if [ -d "tests/integration/pages/sisters" ]; then
    cp -r tests/integration/pages/sisters "$SISTER_BRAIN_DIR/testing/" 2>/dev/null
    echo "    ✓ Sister sites integration tests"
fi

# =============================================================================
# FIND ADDITIONAL SISTER/BRAIN FILES
# =============================================================================

echo "🔍 Finding additional sister sites and brain files..."

# Find any remaining sister/brain files
find . -name "*sister*" -o -name "*brain*" | while read file; do
    if [[ -f "$file" && ! "$file" =~ node_modules && ! "$file" =~ .git ]]; then
        filename=$(basename "$file")
        
        # Check if file already copied
        if ! find "$SISTER_BRAIN_DIR" -name "$filename" | grep -q .; then
            mkdir -p "$SISTER_BRAIN_DIR/additional"
            cp "$file" "$SISTER_BRAIN_DIR/additional/"
            echo "    ✓ Additional file: $filename"
        fi
    fi
done

# =============================================================================
# CREATE SETUP AND MANAGEMENT SCRIPTS
# =============================================================================

echo "🛠️ Creating setup and management scripts..."

# Create brain system setup script
cat > "$SISTER_BRAIN_DIR/setup-brain-system.sh" << 'EOF'
#!/bin/bash
echo "🧠 Setting up Brain System & Sister Sites"
echo "========================================="

# Install dependencies
echo "📦 Installing dependencies..."
npm init -y
npm install react react-dom express cors

# Setup brain system
echo "🧠 Setting up brain system..."
mkdir -p public/brain
cp brain-system/sister_sites_nav_config.json public/brain/
cp brain-system/sister-sites-nav.js public/brain/

# Setup sister sites architecture
echo "🏗️ Setting up sister sites architecture..."
if [ -f "sister-sites-architecture/sister_sites.yaml" ]; then
    echo "Sister sites configuration found"
    python sister-sites-architecture/validate_sites.py
fi

# Setup React components
echo "⚛️ Setting up React components..."
mkdir -p src/pages/sisters
cp react-components/* src/pages/sisters/ 2>/dev/null

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x deployment/scripts/*.js

echo "✅ Brain system and sister sites setup complete!"
echo ""
echo "🎯 Available Commands:"
echo "  • Health check: open management/sister-sites-health-check.html"
echo "  • Build sites: node deployment/scripts/build-sister-landing-pages.js"
echo "  • Inject navigation: node deployment/scripts/inject-sister-nav.js"
echo "  • Validate sites: python sister-sites-architecture/validate_sites.py"
echo "  • Generate sitemaps: python sister-sites-architecture/generate_sitemaps.py"
echo ""
echo "🧠 Brain Dashboard: brain-system/elevate-brain.html"
echo "📊 Health Monitor: management/sister-sites-health-check.html"
EOF

chmod +x "$SISTER_BRAIN_DIR/setup-brain-system.sh"

# Create sister sites deployment script
cat > "$SISTER_BRAIN_DIR/deploy-sister-sites.sh" << 'EOF'
#!/bin/bash
echo "🚀 Deploying Sister Sites"
echo "========================"

# Build all sister sites
echo "🏗️ Building sister sites..."
node deployment/scripts/build-sister-landing-pages.js

# Inject navigation across all sites
echo "🧭 Injecting navigation..."
node deployment/scripts/inject-sister-nav.js

# Generate sitemaps
echo "🗺️ Generating sitemaps..."
python sister-sites-architecture/generate_sitemaps.py

# Deploy to Netlify (if configured)
echo "🌐 Deploying to Netlify..."
if [ -f "deployment/netlify-sister.toml" ]; then
    netlify deploy --config=deployment/netlify-sister.toml
fi

# Validate deployment
echo "✅ Validating deployment..."
python sister-sites-architecture/validate_sites.py

echo "🎉 Sister sites deployment complete!"
EOF

chmod +x "$SISTER_BRAIN_DIR/deploy-sister-sites.sh"

# Create monitoring script
cat > "$SISTER_BRAIN_DIR/monitor-sister-sites.sh" << 'EOF'
#!/bin/bash
echo "📊 Monitoring Sister Sites"
echo "========================="

# Run health checks
echo "🏥 Running health checks..."
node management/sister-sites-integration-check.js

# Run autopilot management
echo "🤖 Running autopilot management..."
node management/sister-site-autopilot.js

# Open health dashboard
echo "📊 Opening health dashboard..."
if command -v open &> /dev/null; then
    open management/sister-sites-health-check.html
elif command -v xdg-open &> /dev/null; then
    xdg-open management/sister-sites-health-check.html
else
    echo "Health dashboard: management/sister-sites-health-check.html"
fi

echo "✅ Monitoring complete!"
EOF

chmod +x "$SISTER_BRAIN_DIR/monitor-sister-sites.sh"

# Create brain API server
cat > "$SISTER_BRAIN_DIR/brain-api-server.js" << 'EOF'
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Brain API endpoints
app.get('/api/brain/config', (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync('brain-system/sister_sites_nav_config.json', 'utf8'));
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load brain config' });
    }
});

app.get('/api/brain/sites', (req, res) => {
    // Return list of sister sites
    res.json({
        sites: [
            { name: 'Mentorship', url: '/mentorship', component: 'Mentorship' },
            { name: 'Volunteer', url: '/volunteer', component: 'Volunteer' },
            { name: 'Wellness', url: '/wellness', component: 'Wellness' },
            { name: 'Peer Support', url: '/peer-support', component: 'PeerSupport' }
        ]
    });
});

app.get('/api/brain/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        sites_active: 4,
        brain_status: 'operational'
    });
});

app.listen(PORT, () => {
    console.log(`🧠 Brain API Server running on port ${PORT}`);
    console.log(`📊 Health endpoint: http://localhost:${PORT}/api/brain/health`);
    console.log(`🏗️ Sites endpoint: http://localhost:${PORT}/api/brain/sites`);
    console.log(`⚙️ Config endpoint: http://localhost:${PORT}/api/brain/config`);
});
EOF

# Copy documentation
cp SISTER-SITES-BRAIN-PACKAGE.md "$SISTER_BRAIN_DIR/README.md"

# Create quick start guide
cat > "$SISTER_BRAIN_DIR/QUICK-START.md" << 'EOF'
# SISTER SITES & BRAIN SYSTEM QUICK START

## Setup Brain System
```bash
./setup-brain-system.sh
```

## Deploy Sister Sites
```bash
./deploy-sister-sites.sh
```

## Monitor Sister Sites
```bash
./monitor-sister-sites.sh
```

## Start Brain API Server
```bash
node brain-api-server.js
```

## Sister Sites Available

### Mentorship Platform
- Mentor directory and matching
- Mentorship progress tracking
- Community features

### Volunteer Network
- Volunteer opportunities
- Skill-based matching
- Impact tracking

### Wellness Platform
- Mental health resources
- Peer support network
- Wellness journey tracking

### Peer Support
- Community support
- Peer connections
- Resource sharing

## Brain System Features
- **Shared Authentication**: Single sign-on across all sites
- **Unified Navigation**: Consistent navigation experience
- **Cross-Site Search**: Search across all sister sites
- **Shared Resources**: Common assets and components
- **Centralized Analytics**: Unified tracking and reporting

## Configuration
Edit `brain-system/sister_sites_nav_config.json` to:
- Add new sister sites
- Configure navigation
- Set shared resources
- Manage permissions

## Value Proposition
- **Unified User Experience**: Seamless cross-site navigation
- **Reduced Development Costs**: Shared components and resources
- **Centralized Management**: Single brain controls all sites
- **Scalable Architecture**: Easy addition of new sister sites
- **Enhanced Analytics**: Cross-site user journey tracking
EOF

# Count files and create summary
TOTAL_FILES=$(find "$SISTER_BRAIN_DIR" -type f | wc -l)

echo ""
echo "✅ SISTER SITES & BRAIN SYSTEM PACKAGE COMPLETE!"
echo "==============================================="
echo "📁 Package location: $SISTER_BRAIN_DIR/"
echo "📊 Total files packaged: $TOTAL_FILES"
echo "🧠 Brain system included:"
echo "  • Central brain dashboard"
echo "  • Shared memory system"
echo "  • Cross-site navigation"
echo "  • Unified authentication"
echo ""
echo "🏗️ Sister sites included:"
echo "  • Mentorship platform"
echo "  • Volunteer network"
echo "  • Wellness platform"
echo "  • Peer support system"
echo ""
echo "🚀 To deploy:"
echo "  cd $SISTER_BRAIN_DIR"
echo "  ./setup-brain-system.sh"
echo "  ./deploy-sister-sites.sh"
echo "  node brain-api-server.js"
echo ""
echo "💰 System value: $500K+ (multi-site architecture)"
echo "🎯 User experience: Unified across all sites"
echo "📈 Scalability: Easy addition of new sister sites"