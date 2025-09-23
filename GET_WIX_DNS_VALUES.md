# 🎨 GET WIX DNS VALUES (CNAME & IP ADDRESS)

## Where to Find Your Wix DNS Values:

### 📋 **Step 1: Go to Wix Dashboard**
1. Log in to your Wix account
2. Go to **Settings** → **Domains**
3. Click **"Connect a domain you own"**
4. Choose **"Via pointing"** method

### 📝 **Step 2: Wix Will Show You Exact Values**

Wix will display something like:

```
A Record (for apex domain):
Name: @
Value: 23.236.62.147  ← THIS IS YOUR IP ADDRESS

CNAME Record (for www):
Name: www
Value: www123.wixdns.net  ← THIS IS YOUR CNAME TARGET
```

### ⚠️ **Important Notes:**

1. **Don't use example values** - Each Wix site gets unique values
2. **IP addresses vary** - Could be 23.x.x.x, 185.x.x.x, etc.
3. **CNAME targets are unique** - Format: www[numbers].wixdns.net
4. **Values can change** - Always get fresh values from Wix dashboard

### 🔍 **Common Wix DNS Patterns:**

#### A Record IPs (examples):
- `23.236.62.147`
- `185.230.63.107` 
- `23.236.62.147`
- `185.230.63.186`

#### CNAME Targets (examples):
- `www123.wixdns.net`
- `www456.wixdns.net`
- `www789.wixdns.net`

### 🚀 **Use with Your Autopilot:**

Once you have the values from Wix:

```bash
./efh-autopilot.sh
```

When prompted:
- **WIX A Record IP**: Paste the IP from Wix (e.g., 23.236.62.147)
- **WIX CNAME target**: Paste the CNAME from Wix (e.g., www123.wixdns.net)

### 📱 **Alternative: Wix Mobile App**
You can also find these values in:
- Wix Owner app → Settings → Domains → Connect Domain

### 🔧 **If You Can't Find Them:**
1. Contact Wix support
2. Check Wix help center for "pointing method"
3. Look for "DNS records" in your Wix dashboard

### ✅ **Verification:**
After getting the values, your autopilot will create:
```
A @ → [Your Wix IP] (unproxied)
CNAME www → [Your Wix CNAME] (unproxied)
```

**The exact values are unique to your Wix site - get them from your Wix dashboard!** 🎯