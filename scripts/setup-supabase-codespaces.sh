#!/bin/bash

# Supabase Setup Script for Elevate for Humanity
# Copyright (c) 2025 Elevate for Humanity
# Commercial License. No resale, sublicensing, or redistribution allowed.

set -e

echo "🚀 Elevate for Humanity - Supabase Configuration Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for input with optional masking
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    local is_secret="${3:-false}"
    
    echo -e "${BLUE}${prompt}${NC}"
    
    if [ "$is_secret" = "true" ]; then
        read -s input_value
        echo ""
    else
        read input_value
    fi
    
    if [ -z "$input_value" ]; then
        echo -e "${RED}❌ Error: This field is required${NC}"
        exit 1
    fi
    
    # Export to environment
    export "$var_name"="$input_value"
    
    # Add to .env file
    if grep -q "^${var_name}=" .env 2>/dev/null; then
        # Update existing line
        sed -i "s|^${var_name}=.*|${var_name}=${input_value}|" .env
    else
        # Add new line
        echo "${var_name}=${input_value}" >> .env
    fi
    
    echo -e "${GREEN}✅ ${var_name} configured${NC}"
    echo ""
}

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}📄 Created .env file from template${NC}"
fi

echo "Please provide your Supabase credentials:"
echo ""

# Collect Supabase credentials
prompt_input "🌐 VITE_SUPABASE_URL (public):" "VITE_SUPABASE_URL"
prompt_input "🔑 VITE_SUPABASE_ANON_KEY (public):" "VITE_SUPABASE_ANON_KEY"
prompt_input "🌐 SUPABASE_URL (server):" "SUPABASE_URL"
prompt_input "🔐 SUPABASE_SERVICE_KEY (server, secret):" "SUPABASE_SERVICE_KEY" "true"

# Optional Google credentials
echo -e "${YELLOW}📊 Optional: Google Services Configuration${NC}"
echo "Press Enter to skip, or provide your Google credentials:"
echo ""

echo -e "${BLUE}📈 Google Analytics GA4 Measurement ID (optional):${NC}"
read ga_id
if [ ! -z "$ga_id" ]; then
    if grep -q "^GA_MEASUREMENT_ID=" .env 2>/dev/null; then
        sed -i "s|^GA_MEASUREMENT_ID=.*|GA_MEASUREMENT_ID=${ga_id}|" .env
    else
        echo "GA_MEASUREMENT_ID=${ga_id}" >> .env
    fi
    echo -e "${GREEN}✅ Google Analytics configured${NC}"
fi

echo -e "${BLUE}🔍 Google Search Console Verification Code (optional):${NC}"
read verification_code
if [ ! -z "$verification_code" ]; then
    if grep -q "^GOOGLE_VERIFICATION_CODE=" .env 2>/dev/null; then
        sed -i "s|^GOOGLE_VERIFICATION_CODE=.*|GOOGLE_VERIFICATION_CODE=${verification_code}|" .env
    else
        echo "GOOGLE_VERIFICATION_CODE=${verification_code}" >> .env
    fi
    echo -e "${GREEN}✅ Google Search Console configured${NC}"
    
    # Update google-site-verification.html
    if [ -f "google-site-verification.html" ]; then
        sed -i "s|GOOGLE_VERIFICATION_CODE_HERE|${verification_code}|g" google-site-verification.html
        echo -e "${GREEN}✅ Updated google-site-verification.html${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Supabase configuration complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Verify your Supabase project is active"
echo "2. Check database tables and RLS policies"
echo "3. Test the connection with: npm run test:supabase"
echo "4. If using Google services, verify your GA and Search Console setup"
echo ""
echo -e "${BLUE}🔐 Security Note:${NC}"
echo "Your .env file contains sensitive credentials and should never be committed to version control."
echo ""

# Test Supabase connection if possible
if command -v node &> /dev/null; then
    echo -e "${BLUE}🧪 Testing Supabase connection...${NC}"
    
    # Create a simple test script
    cat > /tmp/test-supabase.js << 'EOF'
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials not found');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple connection test
supabase.from('_test').select('*').limit(1).then(
    () => console.log('✅ Supabase connection successful'),
    (err) => {
        if (err.message.includes('relation "_test" does not exist')) {
            console.log('✅ Supabase connection successful (test table not found is expected)');
        } else {
            console.log('❌ Supabase connection failed:', err.message);
        }
    }
);
EOF

    if npm list @supabase/supabase-js &> /dev/null; then
        node /tmp/test-supabase.js
    else
        echo -e "${YELLOW}⚠️  @supabase/supabase-js not installed. Run 'npm install' to test connection.${NC}"
    fi
    
    rm -f /tmp/test-supabase.js
fi

echo -e "${GREEN}🚀 Setup complete! Happy coding!${NC}"