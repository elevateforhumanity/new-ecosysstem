# 🤖 ULTIMATE AUTOPILOT - EVERYTHING IN ONE RUN

## One Command Does It All:

```bash
./autopilot-everything.sh
```

## What This Ultimate Autopilot Does:

### 🔑 **Smart Token Management**
- ✅ Checks if you have a working API token
- ✅ Tests existing tokens automatically
- ✅ Guides you to get fresh token if needed
- ✅ Opens Cloudflare token page for you

### 🎯 **Interactive Setup Menu**
Choose what you want to set up:
1. **Basic Redirect**: elevateforhumanity.org → elevate4humanity.org
2. **Wix DNS Pointing**: Connect your Wix site to the domain
3. **Supabase Custom Domain**: Set up auth.elevateforhumanity.org
4. **Gitpod Tunnel**: Stable studio.elevateforhumanity.org for your workspace

### 🚀 **Automated Execution**
- ✅ **Validates all inputs** before proceeding
- ✅ **Creates DNS records automatically** via Cloudflare API
- ✅ **Handles errors gracefully** with clear messages
- ✅ **Tests everything** to verify it works
- ✅ **Shows you the results** and next steps

## What Each Option Sets Up:

### 1️⃣ Basic Redirect
- A record: @ → 192.0.2.1 (proxied)
- CNAME: www → elevateforhumanity.org (proxied)
- Redirect rule: elevateforhumanity.org → elevate4humanity.org (301)

### 2️⃣ Wix DNS Pointing
- A record: @ → [Wix IP] (unproxied)
- CNAME: www → [Wix CNAME target] (unproxied)
- Prompts you for exact values from Wix dashboard

### 3️⃣ Supabase Custom Domain
- TXT records for domain verification (unproxied)
- CNAME record pointing to Supabase (unproxied)
- Creates supabase-records.json automatically

### 4️⃣ Gitpod Tunnel
- Configures Cloudflare Tunnel for stable subdomain
- Maps studio.elevateforhumanity.org → your Gitpod workspace
- Provides ready-to-run tunnel script

## Zero Manual DNS Work:

- ❌ No manual DNS record creation
- ❌ No manual redirect setup
- ❌ No manual testing
- ❌ No guessing IP addresses or CNAME targets
- ✅ **Everything automated via API**

## Smart Features:

- **Idempotent**: Safe to re-run, won't create duplicates
- **Validates inputs**: Won't proceed with invalid data
- **Error recovery**: Clear error messages with solutions
- **Dependency checking**: Ensures node, jq, curl are available
- **Token testing**: Verifies API access before making changes

## Files Created:

- `.env.autopilot` - Your configuration (git-ignored)
- `supabase-records.json` - Supabase DNS records (if used)
- Updated `gitpod-tunnel.sh` - Customized tunnel script (if used)

## Run It Now:

```bash
chmod +x autopilot-everything.sh
./autopilot-everything.sh
```

**Your ultimate autopilot handles everything automatically!** 🚀

Just paste your API token once and choose what you want to set up. The autopilot does all the DNS work for you.