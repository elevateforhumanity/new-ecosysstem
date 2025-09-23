# 🔍 WHERE IS WIX DNS? - Complete Location Guide

## If You Have Direct Wix Access:

### 🎨 **Wix Studio (New Interface):**
1. **Log in to Wix Studio**
2. **Go to Settings** (gear icon)
3. **Click "Domains"**
4. **Click "Connect a domain"** or **"Manage domains"**
5. **Choose "Connect via pointing"**
6. **DNS records will appear here**

### 🎨 **Wix Editor (Classic Interface):**
1. **Log in to Wix.com**
2. **Go to "My Sites"**
3. **Click "Manage Site"**
4. **Settings → Domains**
5. **"Connect a domain you own"**
6. **"Via pointing method"**

### 📱 **Wix Owner App:**
1. **Open Wix Owner mobile app**
2. **Settings → Domains**
3. **Connect Domain**
4. **Pointing method**

## If Developer Manages Wix:

### 🔑 **What to Ask Developer:**

#### Option 1: Get Access
```
"Can you give me access to the Wix dashboard to see DNS settings?
I need to connect elevate4humanity.org to the site."
```

#### Option 2: Get DNS Records
```
"What are the DNS records for connecting elevate4humanity.org?
I need:
- A record IP address
- CNAME target for www"
```

#### Option 3: Developer Sets Up DNS
```
"Can you set up DNS for elevate4humanity.org in Cloudflare?
I can give you API access to create the records."
```

## 🔍 **Common Wix DNS Locations:**

### **Wix Studio Path:**
```
Dashboard → Settings → Domains → Connect Domain → Via Pointing
```

### **Wix Editor Path:**
```
My Sites → Manage Site → Settings → Domains → Connect Domain
```

### **Wix Business Manager:**
```
Business Manager → Settings → Domains → Connect Domain
```

## 🚫 **If You Can't Find DNS Settings:**

### **Possible Reasons:**
1. **No access to Wix account** (developer-managed)
2. **Wrong Wix plan** (some plans don't support custom domains)
3. **Site not published** yet
4. **Domain already connected** differently
5. **Looking in wrong Wix interface**

### **Solutions:**
1. **Ask developer for access**
2. **Upgrade Wix plan** if needed
3. **Publish site** first
4. **Check all Wix interfaces** (Studio, Editor, App)

## 🎯 **What DNS Records Look Like in Wix:**

When you find the right place, you'll see:

```
To connect your domain via pointing, add these DNS records:

A Record:
Host: @
Points to: 23.236.62.147

CNAME Record:
Host: www
Points to: www123.wixdns.net
```

## 🔧 **Alternative: Check Current DNS:**

### **See What's Currently Set:**
```bash
# Check current DNS for elevate4humanity.org
nslookup elevate4humanity.org
nslookup www.elevate4humanity.org

# Or use online tools:
# whatsmydns.net
# dnschecker.org
```

## 🚀 **If You Still Can't Find It:**

### **Contact Wix Support:**
1. **Wix Help Center** → Contact Support
2. **Ask specifically about:** "DNS records for custom domain pointing"
3. **Mention:** "I need A and CNAME records for elevate4humanity.org"

### **Contact Your Developer:**
```
"Where can I find the Wix DNS settings for elevate4humanity.org?
I need access to set up the domain connection.
Can you either:
1. Give me access to the Wix dashboard
2. Provide the DNS records
3. Set up the DNS yourself"
```

## 🎯 **Quick Decision Tree:**

### **Do you have Wix login credentials?**
- **Yes** → Follow Wix Studio/Editor paths above
- **No** → Contact developer for access or DNS records

### **Can you see "Domains" in Wix settings?**
- **Yes** → Look for "Connect domain" or "Custom domains"
- **No** → Check Wix plan or contact support

### **Do you see "Via pointing" option?**
- **Yes** → DNS records will be shown there
- **No** → May need to upgrade plan or use nameservers

## ⚡ **Meanwhile, Don't Wait:**

```bash
./efh-autopilot.sh
# Skip Wix for now, set up redirects and other services
```

**You can always add Wix DNS later once you find the records!** 🎯