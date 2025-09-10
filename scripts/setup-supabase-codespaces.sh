#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# GitHub Codespaces Supabase Setup Script
# ===================================================================

echo "🚀 Setting up Supabase for GitHub Codespaces..."
echo "=============================================="

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

prompt_input() {
  local prompt="$1"; local var_name="$2"; local is_secret="${3:-false}"
  echo -e "${BLUE}${prompt}${NC}"
  local value
  if [[ "$is_secret" == "true" ]]; then read -r -s value; echo ""; else read -r value; fi
  if [[ -z "${value}" ]]; then
    echo -e "${RED}❌ Value cannot be empty. Please try again.${NC}"
    prompt_input "$prompt" "$var_name" "$is_secret"
  else
    printf -v "$var_name" '%s' "$value"
  fi
}

echo -e "${YELLOW}📝 Please provide your Supabase values:${NC}\n"
prompt_input "🌐 VITE_SUPABASE_URL (public):" VITE_SUPABASE_URL
prompt_input "🔑 VITE_SUPABASE_ANON_KEY (public):" VITE_SUPABASE_ANON_KEY
prompt_input "🌐 SUPABASE_URL (server):" SUPABASE_URL
prompt_input "🔐 SUPABASE_SERVICE_KEY (server, secret):" SUPABASE_SERVICE_KEY true

echo -e "\n${GREEN}✅ Configuration collected successfully!${NC}\n"

echo -e "${BLUE}📄 Writing root .env...${NC}"
cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}

# Environment
NODE_ENV=development
EOF

if [[ -d client ]]; then
  echo -e "${BLUE}📄 Writing client/.env...${NC}"
  cat > client/.env << EOF
# Supabase Configuration (Client)
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
EOF
fi

if [[ -d server ]]; then
  echo -e "${BLUE}📄 Writing server/.env...${NC}"
  cat > server/.env << EOF
# Supabase Configuration (Server)
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
NODE_ENV=development
EOF
fi

echo -e "${BLUE}🔒 Exporting environment variables for current session...${NC}"
export VITE_SUPABASE_URL
export VITE_SUPABASE_ANON_KEY
export SUPABASE_URL
export SUPABASE_SERVICE_KEY

if [[ -f "${HOME}/.bashrc" ]]; then
  echo -e "${BLUE}🧩 Appending variables to ~/.bashrc for persistence...${NC}"
  {
    echo ""
    echo "# Supabase Environment Variables"
    echo "export VITE_SUPABASE_URL=\"${VITE_SUPABASE_URL}\""
    echo "export VITE_SUPABASE_ANON_KEY=\"${VITE_SUPABASE_ANON_KEY}\""
    echo "export SUPABASE_URL=\"${SUPABASE_URL}\""
    echo "export SUPABASE_SERVICE_KEY=\"${SUPABASE_SERVICE_KEY}\""
  } >> "${HOME}/.bashrc"
fi

echo -e "${BLUE}🛡️  Ensuring env files are git-ignored...${NC}"
touch .gitignore
grep -qE '^\.env$' .gitignore || echo ".env" >> .gitignore
grep -qE '^\.env\.local$' .gitignore || echo ".env.local" >> .gitignore
grep -qE '^\.env\..*\.local$' .gitignore || echo ".env.*.local" >> .gitignore
grep -qE '^client/\.env$' .gitignore || echo "client/.env" >> .gitignore
grep -qE '^server/\.env$' .gitignore || echo "server/.env" >> .gitignore

echo -e "${BLUE}📋 Creating .env.example...${NC}"
cat > .env.example << 'EOF'
# Supabase Configuration (Examples)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=service-role-key
NODE_ENV=development
EOF

echo -e "\n${GREEN}✅ Supabase variables configured for Codespaces. Open a new shell or run: source ~/.bashrc${NC}"
echo -e "${YELLOW}ℹ️  Tip: Vite builds will read VITE_* values; server scripts read SUPABASE_* values.${NC}"
