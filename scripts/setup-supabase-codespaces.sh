#!/usr/bin/env bash
# Supabase Codespaces Setup Script for Elevate for Humanity
# This script helps set up Supabase credentials securely in the development environment

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env"
ENV_EXAMPLE_FILE=".env.example"

echo -e "${BLUE}🚀 Elevate for Humanity - Supabase Setup${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to prompt for input
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    local is_secret="${3:-false}"
    local value=""
    
    while [[ -z "$value" ]]; do
        if [[ "$is_secret" == "true" ]]; then
            read -s -p "$prompt " value
            echo "" # New line after hidden input
        else
            read -p "$prompt " value
        fi
        
        if [[ -z "$value" ]]; then
            print_warning "Value cannot be empty. Please try again."
        fi
    done
    
    echo "$value"
}

# Function to update or add environment variable
update_env_var() {
    local var_name="$1"
    local var_value="$2"
    
    if grep -q "^${var_name}=" "$ENV_FILE" 2>/dev/null; then
        # Update existing variable
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^${var_name}=.*|${var_name}=${var_value}|" "$ENV_FILE"
        else
            # Linux
            sed -i "s|^${var_name}=.*|${var_name}=${var_value}|" "$ENV_FILE"
        fi
    else
        # Add new variable
        echo "${var_name}=${var_value}" >> "$ENV_FILE"
    fi
}

# Main setup function
setup_supabase() {
    echo -e "${BLUE}🔧 Setting up Supabase credentials...${NC}"
    echo ""
    
    # Create .env file if it doesn't exist
    if [[ ! -f "$ENV_FILE" ]]; then
        if [[ -f "$ENV_EXAMPLE_FILE" ]]; then
            print_info "Creating $ENV_FILE from $ENV_EXAMPLE_FILE template..."
            cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
        else
            print_info "Creating new $ENV_FILE file..."
            touch "$ENV_FILE"
        fi
    fi
    
    print_info "Please provide your Supabase project credentials."
    print_info "You can find these in your Supabase project dashboard under Settings > API."
    echo ""
    
    # Collect Supabase credentials
    VITE_SUPABASE_URL=$(prompt_input "🌐 VITE_SUPABASE_URL (public):" "VITE_SUPABASE_URL")
    VITE_SUPABASE_ANON_KEY=$(prompt_input "🔑 VITE_SUPABASE_ANON_KEY (public):" "VITE_SUPABASE_ANON_KEY")
    SUPABASE_URL=$(prompt_input "🌐 SUPABASE_URL (server, usually same as VITE_SUPABASE_URL):" "SUPABASE_URL")
    SUPABASE_SERVICE_KEY=$(prompt_input "🔐 SUPABASE_SERVICE_KEY (server, secret):" "SUPABASE_SERVICE_KEY" "true")
    
    echo ""
    print_info "Updating environment variables..."
    
    # Update environment variables
    update_env_var "VITE_SUPABASE_URL" "$VITE_SUPABASE_URL"
    update_env_var "VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_ANON_KEY"
    update_env_var "SUPABASE_URL" "$SUPABASE_URL"
    update_env_var "SUPABASE_SERVICE_KEY" "$SUPABASE_SERVICE_KEY"
    
    print_status "Supabase credentials have been saved to $ENV_FILE"
    echo ""
}

# Function to setup Google configuration
setup_google() {
    echo -e "${BLUE}🔧 Setting up Google configuration (optional)...${NC}"
    echo ""
    
    read -p "Would you like to configure Google Analytics and Search Console? (y/N): " configure_google
    
    if [[ "$configure_google" =~ ^[Yy]$ ]]; then
        print_info "Please provide your Google configuration details."
        echo ""
        
        GA_MEASUREMENT_ID=$(prompt_input "📊 Google Analytics 4 Measurement ID (e.g., G-XXXXXXXXXX):" "GA_MEASUREMENT_ID")
        GOOGLE_SITE_VERIFICATION=$(prompt_input "🔍 Google Search Console verification code:" "GOOGLE_SITE_VERIFICATION")
        CANONICAL_DOMAIN=$(prompt_input "🌐 Canonical domain (e.g., https://yourdomain.com):" "CANONICAL_DOMAIN")
        
        echo ""
        print_info "Updating Google configuration..."
        
        update_env_var "VITE_GA_MEASUREMENT_ID" "$GA_MEASUREMENT_ID"
        update_env_var "GOOGLE_SITE_VERIFICATION" "$GOOGLE_SITE_VERIFICATION"
        update_env_var "CANONICAL_DOMAIN" "$CANONICAL_DOMAIN"
        
        print_status "Google configuration has been saved to $ENV_FILE"
        
        print_info "Running Google configuration script..."
        if [[ -f "scripts/apply-google-config.js" ]]; then
            node scripts/apply-google-config.js
        else
            print_warning "Google configuration script not found. Run 'node scripts/apply-google-config.js' manually after setup."
        fi
    else
        print_info "Skipping Google configuration. You can run this script again to configure it later."
    fi
    echo ""
}

# Function to test Supabase connection
test_supabase_connection() {
    echo -e "${BLUE}🧪 Testing Supabase connection...${NC}"
    
    # Create a simple test script
    cat > /tmp/test-supabase.js << 'EOF'
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('_realtime_version').select('version').limit(1);
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        console.log('✅ Supabase connection successful!');
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
EOF
    
    if command -v node >/dev/null 2>&1; then
        node /tmp/test-supabase.js
    else
        print_warning "Node.js not found. Skipping connection test."
    fi
    
    # Clean up
    rm -f /tmp/test-supabase.js
    echo ""
}

# Main execution
main() {
    # Check if we're in a Git repository
    if [[ ! -d ".git" ]]; then
        print_error "This script should be run from the root of the Git repository."
        exit 1
    fi
    
    # Setup Supabase
    setup_supabase
    
    # Setup Google (optional)
    setup_google
    
    # Test connection
    test_supabase_connection
    
    # Final instructions
    echo -e "${GREEN}🎉 Setup complete!${NC}"
    echo ""
    print_info "Your credentials have been saved to $ENV_FILE"
    print_info "Make sure to add $ENV_FILE to your .gitignore to keep credentials secure."
    echo ""
    print_info "Next steps:"
    echo "  1. Restart your development server to pick up the new environment variables"
    echo "  2. Test your application's Supabase integration"
    echo "  3. If you configured Google Analytics, verify tracking is working"
    echo "  4. Submit your sitemap to Google Search Console"
    echo ""
    print_warning "Remember: Never commit .env files to version control!"
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi