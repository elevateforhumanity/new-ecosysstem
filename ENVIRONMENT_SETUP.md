# Environment Setup Guide - fix2

## Quick Setup (3 Steps)

### Step 1: Get Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Click "Continue to summary" → "Create Token"
5. **Copy the token** (you won't see it again!)

### Step 2: Set Environment Variables

```bash
# In your terminal
export CLOUDFLARE_API_TOKEN="your_token_from_step_1"

# Optional but recommended
export CLOUDFLARE_ACCOUNT_ID="your_account_id"
export CLOUDFLARE_ZONE_ID="your_zone_id"
```

**Or create .env file**:
```bash
cat > .env << 'EOF'
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_ZONE_ID=your_zone_id_here
EOF

# Load it
source .env
```

### Step 3: Deploy

```bash
cd /workspaces/fix2
./deploy-cloudflare-fixed.sh
```

Done! ✅

---

## Finding Your IDs

### Cloudflare Account ID

**Method 1 - From Dashboard**:
1. Go to https://dash.cloudflare.com
2. Click any website
3. Look at URL: `dash.cloudflare.com/{account_id}/...`
4. Copy the long hex string

**Method 2 - From Pages**:
1. Go to Pages section
2. Click any project
3. Account ID is in the URL

### Cloudflare Zone ID

1. Go to https://dash.cloudflare.com
2. Click your domain
3. Scroll down to "API" section on right sidebar
4. Copy "Zone ID"

---

## All Environment Variables

### Required for Deployment

```bash
# Cloudflare (Required)
CLOUDFLARE_API_TOKEN="your_api_token"

# Optional but recommended
CLOUDFLARE_ACCOUNT_ID="your_account_id"
CLOUDFLARE_ZONE_ID="your_zone_id"
```

### Required for Application (Set in Cloudflare Dashboard)

After deployment, set these in Cloudflare Pages dashboard:

```bash
# Supabase
VITE_SUPABASE_URL="https://cuxzzpsyufcewtmicszk.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Email (Optional)
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_RESEND_COOLDOWN_MIN="720"

# Node Environment
NODE_ENV="production"
```

**How to set in Cloudflare**:
1. Go to https://dash.cloudflare.com
2. Pages → Your Project → Settings → Environment variables
3. Add each variable
4. Redeploy

---

## Verification

### Check if variables are set:

```bash
# Check Cloudflare token
echo $CLOUDFLARE_API_TOKEN

# Should output your token
# If empty, it's not set
```

### Test Wrangler authentication:

```bash
# Install wrangler
npm install -g wrangler

# Check authentication
wrangler whoami

# Should show your email
# If error, run: wrangler login
```

### Test build:

```bash
cd /workspaces/fix2
npm install --legacy-peer-deps
npm run build

# Should complete without errors
# Check dist/ directory exists
ls -la dist/
```

---

## Troubleshooting

### "CLOUDFLARE_API_TOKEN not set"

**Fix**:
```bash
export CLOUDFLARE_API_TOKEN="your_token"
```

Or add to `.env` file and run `source .env`

### "Authentication required"

**Fix**:
```bash
wrangler login
```

Or ensure `CLOUDFLARE_API_TOKEN` is set correctly

### "Project not found"

**Fix Option 1** - Create project:
```bash
wrangler pages project create elevateforhumanity
```

**Fix Option 2** - Use existing project:
```bash
# List projects
wrangler pages project list

# Use correct name in deployment
wrangler pages deploy dist --project-name=YOUR_PROJECT_NAME
```

### "Build failed"

**Fix**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### "npm ci failed"

**Fix** - Use `npm install` instead:
```bash
npm install --legacy-peer-deps
```

---

## Complete Setup Script

Save this as `setup-env.sh`:

```bash
#!/bin/bash

echo "🔧 Environment Setup for fix2"
echo ""

# Prompt for Cloudflare API Token
read -p "Enter your CLOUDFLARE_API_TOKEN: " CF_TOKEN

if [ -z "$CF_TOKEN" ]; then
    echo "❌ Token cannot be empty"
    exit 1
fi

# Create .env file
cat > .env << EOF
CLOUDFLARE_API_TOKEN=$CF_TOKEN
EOF

echo "✅ Created .env file"
echo ""

# Optional: Add account ID
read -p "Enter CLOUDFLARE_ACCOUNT_ID (optional, press Enter to skip): " CF_ACCOUNT

if [ ! -z "$CF_ACCOUNT" ]; then
    echo "CLOUDFLARE_ACCOUNT_ID=$CF_ACCOUNT" >> .env
    echo "✅ Added account ID"
fi

# Optional: Add zone ID
read -p "Enter CLOUDFLARE_ZONE_ID (optional, press Enter to skip): " CF_ZONE

if [ ! -z "$CF_ZONE" ]; then
    echo "CLOUDFLARE_ZONE_ID=$CF_ZONE" >> .env
    echo "✅ Added zone ID"
fi

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "To use these variables, run:"
echo "  source .env"
echo ""
echo "Then deploy with:"
echo "  ./deploy-cloudflare-fixed.sh"
echo ""
```

**Usage**:
```bash
chmod +x setup-env.sh
./setup-env.sh
source .env
./deploy-cloudflare-fixed.sh
```

---

## Security Notes

### ⚠️ Never Commit Secrets

Add to `.gitignore`:
```
.env
.env.local
.env.production
*.key
*.pem
```

### ✅ Use Environment Variables

- **Local development**: Use `.env` file
- **Production**: Set in Cloudflare dashboard
- **CI/CD**: Use GitHub Secrets

### 🔒 Rotate Tokens Regularly

1. Create new API token
2. Update `.env` file
3. Update Cloudflare dashboard
4. Delete old token

---

## Quick Reference

### Deploy Command
```bash
./deploy-cloudflare-fixed.sh
```

### Check Status
```bash
wrangler pages deployment list --project-name=elevateforhumanity
```

### View Logs
```bash
wrangler pages deployment tail --project-name=elevateforhumanity
```

### Set Environment Variable in Cloudflare
```bash
wrangler pages secret put VARIABLE_NAME --project-name=elevateforhumanity
```

---

## Next Steps After Deployment

1. ✅ Verify deployment at https://dash.cloudflare.com
2. ✅ Set environment variables in Cloudflare dashboard
3. ✅ Apply database migrations (see docs/SETUP_EMAIL_RESEND.md)
4. ✅ Set admin roles in database
5. ✅ Test application functionality
6. ✅ Configure custom domain (optional)

---

**All 5 deployment issues are now fixed!** 🎉

Use `./deploy-cloudflare-fixed.sh` for reliable deployments.
