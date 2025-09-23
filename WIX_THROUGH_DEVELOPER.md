# 🎨 WIX THROUGH DEVELOPER - DNS Setup Guide

## When Wix is Managed by a Developer:

### 🔑 **What You Need from Your Developer:**

#### Option 1: Get DNS Records from Developer
Ask your developer for:
```
"I need the DNS records to point elevate4humanity.org to the Wix site.
Please provide:
- A record IP address for the apex domain
- CNAME target for www subdomain"
```

#### Option 2: Developer Sets Up DNS
Send your developer:
```
"Please set up DNS for elevate4humanity.org to point to the Wix site.
The domain is managed in Cloudflare.
I can provide API access or you can give me the DNS records."
```

### 📋 **Information to Share with Developer:**

#### Domain Details:
- **Domain:** elevate4humanity.org
- **DNS Provider:** Cloudflare
- **Needed:** A record for apex, CNAME for www
- **Method:** Pointing (not nameservers)

#### Cloudflare Access (if needed):
- Zone ID: `0cde07dbe1f6b3e3c25ec30421ee7ced`
- Zone Name: elevateforhumanity.org
- You can create a limited API token for them

### 🚀 **Meanwhile, Set Up Everything Else:**

Don't wait for the developer - run your autopilot now:

```bash
./efh-autopilot.sh
```

**Choose:**
- Wix DNS setup? → **N** (skip - developer will handle)
- Cloudflare redirect? → **Y** (elevateforhumanity.org → elevate4humanity.org)
- Supabase domain? → **Y** (if needed)
- Gitpod tunnel? → **Y** (if needed)

### 🔧 **Developer Communication Template:**

```
Hi [Developer],

I need to connect elevate4humanity.org to the Wix site you're managing.

The domain is hosted on Cloudflare. I need either:

1. The DNS records to create:
   - A record IP for elevate4humanity.org
   - CNAME target for www.elevate4humanity.org

2. Or you can set up the DNS directly if I give you Cloudflare access.

The goal is to have:
- elevate4humanity.org → Wix site
- www.elevate4humanity.org → Wix site

Please let me know what you need from me.

Thanks!
```

### 🎯 **Three Scenarios:**

#### Scenario A: Developer Gives You DNS Records
```bash
# Add to .env.autopilot:
echo "WIX_A_IP=23.236.62.147" >> .env.autopilot  # Use actual IP
echo "WIX_CNAME_TARGET=www123.wixdns.net" >> .env.autopilot  # Use actual CNAME

# Run Wix autopilot:
node autopilot-wix.cjs
```

#### Scenario B: Developer Handles DNS Setup
- Give them Cloudflare access
- They create the records directly
- You verify it's working

#### Scenario C: Developer Uses Different Method
- They might use nameservers instead
- You'd change nameservers at domain registrar
- Cloudflare features would be limited

### 🔍 **Questions to Ask Your Developer:**

1. **"What DNS records does the Wix site need?"**
2. **"Can you provide A and CNAME records for pointing method?"**
3. **"Do you prefer to set up DNS directly or give me the records?"**
4. **"Is the Wix site ready for custom domain connection?"**
5. **"What's the timeline for getting this connected?"**

### ⚡ **Quick Win Approach:**

#### Today:
```bash
./efh-autopilot.sh
# Set up redirects and other services (skip Wix)
```

#### This Week:
- Contact developer for Wix DNS info
- Get records or Cloudflare access
- Complete Wix connection

### 🛡️ **If Developer Needs Cloudflare Access:**

#### Create Limited API Token:
1. Go to Cloudflare → API Tokens
2. Create token with:
   - Zone:DNS:Edit
   - Zone:Zone:Read
   - Scoped to elevateforhumanity.org only
3. Share token with developer
4. Revoke after setup is complete

### 📞 **Backup Plan:**

If developer is slow to respond:
1. **Use elevateforhumanity.org for now** (redirect setup)
2. **Point app.elevateforhumanity.org to Netlify**
3. **Connect Wix to elevate4humanity.org later**

### ✅ **Success Criteria:**

Once developer provides info:
- elevate4humanity.org loads Wix site
- www.elevate4humanity.org loads Wix site
- SSL certificate works
- Site loads quickly

**Don't let developer delays block your progress - set up everything else now!** 🚀