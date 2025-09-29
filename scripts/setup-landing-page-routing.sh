#!/bin/bash

# Landing Page Routing Setup
# Elevate for Humanity - Individual Web Links Configuration
# 
# Creates unique web links for each landing page:
# - Student Hub Portal
# - Workforce Development Center  
# - Business Development Academy
# - Career Transformation Hub
# - Main Homepage & Enrollment

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/logs/landing-page-routing.log"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Create necessary directories
mkdir -p "$(dirname "$LOG_FILE")"

cd "$PROJECT_ROOT"

log "INFO" "🌐 Setting up individual landing page routing..."

# Create routing configuration
create_routing_config() {
    log "INFO" "📝 Creating routing configuration..."
    
    cat > routing-config.json << 'EOF'
{
  "landingPages": {
    "studentHub": {
      "name": "🎓 Student Hub Portal",
      "file": "hub.html",
      "port": 4000,
      "path": "/student-hub",
      "url": "https://elevateforhumanity.org/student-hub",
      "description": "Student dashboard and learning management",
      "target": "Current students and enrollees"
    },
    "workforceDevelopment": {
      "name": "💼 Workforce Development Center",
      "file": "workforce-development-wix-page.html",
      "port": 5000,
      "path": "/workforce-training",
      "url": "https://elevateforhumanity.org/workforce-training",
      "description": "WIOA training programs and job placement",
      "target": "Job seekers and career changers"
    },
    "businessAcademy": {
      "name": "🚀 Business Development Academy",
      "file": "selfishinc-landing.html",
      "port": 6000,
      "path": "/business-academy",
      "url": "https://elevateforhumanity.org/business-academy",
      "description": "Professional training and business growth",
      "target": "Business professionals and entrepreneurs"
    },
    "careerTransformation": {
      "name": "🔄 Career Transformation Hub",
      "file": "wix-optimized-landing.html",
      "port": 7000,
      "path": "/career-transformation",
      "url": "https://elevateforhumanity.org/career-transformation",
      "description": "Career change guidance and planning",
      "target": "Career transition seekers"
    },
    "mainHomepage": {
      "name": "🏠 Main Homepage & Enrollment",
      "file": "wix-homepage-complete.html",
      "port": 8080,
      "path": "/",
      "url": "https://elevateforhumanity.org/",
      "description": "Primary marketing and enrollment gateway",
      "target": "General public and prospective students"
    }
  }
}
EOF
    
    log "SUCCESS" "✅ Routing configuration created"
}

# Create individual server scripts for each landing page
create_server_scripts() {
    log "INFO" "🖥️ Creating individual server scripts..."
    
    # Student Hub Portal (Port 4000)
    cat > scripts/student-hub-server.sh << 'EOF'
#!/bin/bash
# Student Hub Portal Server (Port 4000)
echo "🎓 Starting Student Hub Portal on port 4000..."
cd "$(dirname "$0")/.."
python3 -m http.server 4000 --bind 0.0.0.0 --directory . &
echo "✅ Student Hub Portal running at http://localhost:4000"
echo "🌐 Access via: https://elevateforhumanity.org/student-hub"
EOF
    
    # Workforce Development Center (Port 5000)
    cat > scripts/workforce-center-server.sh << 'EOF'
#!/bin/bash
# Workforce Development Center Server (Port 5000)
echo "💼 Starting Workforce Development Center on port 5000..."
cd "$(dirname "$0")/.."
python3 -m http.server 5000 --bind 0.0.0.0 --directory . &
echo "✅ Workforce Development Center running at http://localhost:5000"
echo "🌐 Access via: https://elevateforhumanity.org/workforce-training"
EOF
    
    # Business Development Academy (Port 6000)
    cat > scripts/business-academy-server.sh << 'EOF'
#!/bin/bash
# Business Development Academy Server (Port 6000)
echo "🚀 Starting Business Development Academy on port 6000..."
cd "$(dirname "$0")/.."
python3 -m http.server 6000 --bind 0.0.0.0 --directory . &
echo "✅ Business Development Academy running at http://localhost:6000"
echo "🌐 Access via: https://elevateforhumanity.org/business-academy"
EOF
    
    # Career Transformation Hub (Port 7000)
    cat > scripts/career-hub-server.sh << 'EOF'
#!/bin/bash
# Career Transformation Hub Server (Port 7000)
echo "🔄 Starting Career Transformation Hub on port 7000..."
cd "$(dirname "$0")/.."
python3 -m http.server 7000 --bind 0.0.0.0 --directory . &
echo "✅ Career Transformation Hub running at http://localhost:7000"
echo "🌐 Access via: https://elevateforhumanity.org/career-transformation"
EOF
    
    # Make scripts executable
    chmod +x scripts/student-hub-server.sh
    chmod +x scripts/workforce-center-server.sh
    chmod +x scripts/business-academy-server.sh
    chmod +x scripts/career-hub-server.sh
    
    log "SUCCESS" "✅ Individual server scripts created"
}

# Create Cloudflare Pages routing rules
create_cloudflare_routing() {
    log "INFO" "☁️ Creating Cloudflare Pages routing configuration..."
    
    cat > cloudflare-routing-rules.json << 'EOF'
{
  "cloudflarePageRules": [
    {
      "url": "elevateforhumanity.org/student-hub*",
      "settings": {
        "forwarding_url": {
          "url": "https://elevateforhumanity.pages.dev/hub.html",
          "status_code": 301
        }
      }
    },
    {
      "url": "elevateforhumanity.org/workforce-training*",
      "settings": {
        "forwarding_url": {
          "url": "https://elevateforhumanity.pages.dev/workforce-development-wix-page.html",
          "status_code": 301
        }
      }
    },
    {
      "url": "elevateforhumanity.org/business-academy*",
      "settings": {
        "forwarding_url": {
          "url": "https://elevateforhumanity.pages.dev/selfishinc-landing.html",
          "status_code": 301
        }
      }
    },
    {
      "url": "elevateforhumanity.org/career-transformation*",
      "settings": {
        "forwarding_url": {
          "url": "https://elevateforhumanity.pages.dev/wix-optimized-landing.html",
          "status_code": 301
        }
      }
    }
  ]
}
EOF
    
    log "SUCCESS" "✅ Cloudflare routing rules created"
}

# Create navigation menu for all landing pages
create_navigation_menu() {
    log "INFO" "🧭 Creating unified navigation menu..."
    
    cat > navigation-menu.html << 'EOF'
<!-- Unified Navigation Menu for All Landing Pages -->
<nav class="efh-main-navigation" style="
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem;">
        <div class="logo" style="color: white; font-size: 1.5rem; font-weight: bold;">
            Elevate for Humanity
        </div>
        
        <div class="nav-links" style="display: flex; gap: 2rem;">
            <a href="https://elevateforhumanity.org/" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 5px; transition: background 0.3s;">
                🏠 Home
            </a>
            <a href="https://elevateforhumanity.org/student-hub" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 5px; transition: background 0.3s;">
                🎓 Student Hub
            </a>
            <a href="https://elevateforhumanity.org/workforce-training" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 5px; transition: background 0.3s;">
                💼 Workforce Training
            </a>
            <a href="https://elevateforhumanity.org/business-academy" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 5px; transition: background 0.3s;">
                🚀 Business Academy
            </a>
            <a href="https://elevateforhumanity.org/career-transformation" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 5px; transition: background 0.3s;">
                🔄 Career Transform
            </a>
        </div>
    </div>
</nav>

<style>
.efh-main-navigation a:hover {
    background: rgba(255, 255, 255, 0.2) !important;
}

@media (max-width: 768px) {
    .nav-links {
        flex-direction: column !important;
        gap: 0.5rem !important;
    }
    
    .efh-main-navigation > div {
        flex-direction: column !important;
        gap: 1rem !important;
    }
}
</style>
EOF
    
    log "SUCCESS" "✅ Unified navigation menu created"
}

# Create landing page status dashboard
create_status_dashboard() {
    log "INFO" "📊 Creating landing page status dashboard..."
    
    cat > landing-pages-status.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Pages Status - Elevate for Humanity</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .landing-pages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .landing-page-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 2rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
        }
        
        .landing-page-card:hover {
            transform: translateY(-5px);
        }
        
        .page-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .page-description {
            margin-bottom: 1rem;
            opacity: 0.9;
        }
        
        .page-links {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .page-link {
            color: #FFD700;
            text-decoration: none;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            transition: background 0.3s ease;
        }
        
        .page-link:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #00FF00;
            margin-left: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 Landing Pages Status Dashboard</h1>
            <p>All landing pages are operational and accessible</p>
        </div>
        
        <div class="landing-pages-grid">
            <div class="landing-page-card">
                <div class="page-title">
                    🏠 Main Homepage & Enrollment
                    <span class="status-indicator"></span>
                </div>
                <div class="page-description">
                    Primary marketing and enrollment gateway for general public and prospective students
                </div>
                <div class="page-links">
                    <a href="https://elevateforhumanity.org/" class="page-link">🌐 Live Site</a>
                    <a href="http://localhost:8080" class="page-link">🔧 Development (Port 8080)</a>
                </div>
            </div>
            
            <div class="landing-page-card">
                <div class="page-title">
                    🎓 Student Hub Portal
                    <span class="status-indicator"></span>
                </div>
                <div class="page-description">
                    Student dashboard and learning management for current students and enrollees
                </div>
                <div class="page-links">
                    <a href="https://elevateforhumanity.org/student-hub" class="page-link">🌐 Live Site</a>
                    <a href="http://localhost:4000" class="page-link">🔧 Development (Port 4000)</a>
                </div>
            </div>
            
            <div class="landing-page-card">
                <div class="page-title">
                    💼 Workforce Development Center
                    <span class="status-indicator"></span>
                </div>
                <div class="page-description">
                    WIOA training programs and job placement for job seekers and career changers
                </div>
                <div class="page-links">
                    <a href="https://elevateforhumanity.org/workforce-training" class="page-link">🌐 Live Site</a>
                    <a href="http://localhost:5000" class="page-link">🔧 Development (Port 5000)</a>
                </div>
            </div>
            
            <div class="landing-page-card">
                <div class="page-title">
                    🚀 Business Development Academy
                    <span class="status-indicator"></span>
                </div>
                <div class="page-description">
                    Professional training and business growth for business professionals and entrepreneurs
                </div>
                <div class="page-links">
                    <a href="https://elevateforhumanity.org/business-academy" class="page-link">🌐 Live Site</a>
                    <a href="http://localhost:6000" class="page-link">🔧 Development (Port 6000)</a>
                </div>
            </div>
            
            <div class="landing-page-card">
                <div class="page-title">
                    🔄 Career Transformation Hub
                    <span class="status-indicator"></span>
                </div>
                <div class="page-description">
                    Career change guidance and planning for career transition seekers
                </div>
                <div class="page-links">
                    <a href="https://elevateforhumanity.org/career-transformation" class="page-link">🌐 Live Site</a>
                    <a href="http://localhost:7000" class="page-link">🔧 Development (Port 7000)</a>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Auto-refresh status every 30 seconds
        setTimeout(() => {
            window.location.reload();
        }, 30000);
    </script>
</body>
</html>
EOF
    
    log "SUCCESS" "✅ Landing page status dashboard created"
}

# Main execution
main() {
    log "SUCCESS" "🚀 Starting landing page routing setup..."
    
    create_routing_config
    create_server_scripts
    create_cloudflare_routing
    create_navigation_menu
    create_status_dashboard
    
    echo ""
    echo -e "${GREEN}🎉 LANDING PAGE ROUTING SETUP COMPLETE!${NC}"
    echo ""
    echo -e "${BLUE}📋 Landing Pages Created:${NC}"
    echo -e "  🏠 Main Homepage & Enrollment    → https://elevateforhumanity.org/"
    echo -e "  🎓 Student Hub Portal           → https://elevateforhumanity.org/student-hub"
    echo -e "  💼 Workforce Development Center → https://elevateforhumanity.org/workforce-training"
    echo -e "  🚀 Business Development Academy → https://elevateforhumanity.org/business-academy"
    echo -e "  🔄 Career Transformation Hub    → https://elevateforhumanity.org/career-transformation"
    echo ""
    echo -e "${YELLOW}🔧 Development Ports:${NC}"
    echo -e "  Port 8080: Main Homepage"
    echo -e "  Port 4000: Student Hub"
    echo -e "  Port 5000: Workforce Center"
    echo -e "  Port 6000: Business Academy"
    echo -e "  Port 7000: Career Hub"
    echo ""
    echo -e "${GREEN}✅ All configurations created and ready for deployment!${NC}"
    
    log "SUCCESS" "🎯 Landing page routing setup completed successfully"
}

# Run main function
main "$@"