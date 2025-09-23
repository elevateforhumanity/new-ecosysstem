# 🚀 COMPLETE SETUP - MANUAL DNS CREATION

## Your Wix DNS Values:
- **A Record IP:** 185.230.63.107
- **CNAME Target:** elevate4humanity.org

## 🎯 DNS Records to Create in Cloudflare:

### For elevateforhumanity.org zone:

#### 1. Wix A Record (Apex Domain):
```
Type: A
Name: @
Value: 185.230.63.107
Proxy: OFF (Gray Cloud)
TTL: Auto
```

#### 2. Wix CNAME Record (WWW):
```
Type: CNAME
Name: www
Value: elevate4humanity.org
Proxy: OFF (Gray Cloud)
TTL: Auto
```

#### 3. Redirect Setup (Optional):
If you want elevateforhumanity.org to redirect to elevate4humanity.org instead:

**In Cloudflare → Rules → Redirect Rules:**
```
Rule Name: Redirect to elevate4humanity.org

When incoming requests match:
- Field: Hostname
- Operator: equals
- Value: elevateforhumanity.org

Then:
- Type: Static
- URL: https://elevate4humanity.org
- Status Code: 301
```

## 🔧 Step-by-Step in Cloudflare Dashboard:

### Step 1: Go to DNS Records
1. Log in to Cloudflare
2. Select elevateforhumanity.org zone
3. Go to DNS → Records

### Step 2: Create A Record
1. Click "Add record"
2. Type: A
3. Name: @
4. IPv4 address: 185.230.63.107
5. Proxy status: DNS only (Gray cloud)
6. Click "Save"

### Step 3: Create CNAME Record
1. Click "Add record"
2. Type: CNAME
3. Name: www
4. Target: elevate4humanity.org
5. Proxy status: DNS only (Gray cloud)
6. Click "Save"

## ✅ What This Achieves:

### Option A: Direct Wix Connection
- elevateforhumanity.org → Loads Wix site
- www.elevateforhumanity.org → Loads Wix site

### Option B: With Redirect (Recommended)
- elevateforhumanity.org → Redirects to elevate4humanity.org
- www.elevateforhumanity.org → Redirects to www.elevate4humanity.org
- All traffic flows to your primary domain

## 🧪 Test After Setup:

```bash
# Test direct connection
curl -I https://elevateforhumanity.org

# Test www
curl -I https://www.elevateforhumanity.org

# Should return HTTP 200 (direct) or HTTP 301 (redirect)
```

## 🎯 Recommended Approach:

### For Durable Setup:
1. **Create the A and CNAME records** (Steps 1-3 above)
2. **Add redirect rules** to send traffic to elevate4humanity.org
3. **Use elevate4humanity.org as your primary domain**

### For Direct Wix Setup:
1. **Just create the A and CNAME records**
2. **Use elevateforhumanity.org directly**

## 🚀 Next Steps:

1. **Create the DNS records** in Cloudflare dashboard
2. **Wait 5-10 minutes** for DNS propagation
3. **Test the domains** in your browser
4. **Verify SSL certificates** are working

## 📋 Summary:

**You have everything you need:**
- ✅ Wix IP: 185.230.63.107
- ✅ DNS configuration plan
- ✅ Step-by-step instructions

**Just create those two DNS records in Cloudflare and you're done!** 🎉