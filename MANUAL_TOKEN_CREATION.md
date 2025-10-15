# Manual API Token Creation Guide

## 🚨 Current Situation

The existing Cloudflare API token **cannot create new tokens** because it lacks the "User API Tokens: Edit" permission.

**Error:** `Valid user-level authentication not found (code: 9109)`

---

## ✅ Solution: Create Token Manually

### Step 1: Go to Cloudflare Dashboard

Visit: [https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/api-tokens](https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/api-tokens)

### Step 2: Create New Token

1. Click **"Create Token"**
2. Click **"Get started"** next to "Create Custom Token"

### Step 3: Configure Token

**Token Name:** `EFH Deployment Token`

**Permissions:**

| Resource | Permission |
|----------|------------|
| Account → Workers Scripts | Edit |
| Account → Workers KV Storage | Edit |
| Account → Workers R2 Storage | Edit |
| Account → Workers AI | Read |
| Account → Account Settings | Read |

**Account Resources:**
- Include: `Elevateforhumanity@gmail.com's Account`

**Client IP Address Filtering:** (Optional)
- Leave blank for access from anywhere
- Or add your IP for extra security

**TTL:** (Optional)
- Leave blank for no expiration
- Or set expiration date

### Step 4: Create and Copy Token

1. Click **"Continue to summary"**
2. Review permissions
3. Click **"Create Token"**
4. **IMPORTANT:** Copy the token immediately (it's only shown once!)

### Step 5: Update .env File

```bash
# Open .env file
nano .env

# Replace the CLOUDFLARE_API_TOKEN line with:
CLOUDFLARE_API_TOKEN=your_new_token_here

# Save and exit (Ctrl+X, Y, Enter)
```

### Step 6: Verify Token

```bash
export CLOUDFLARE_API_TOKEN=your_new_token_here
export CLOUDFLARE_ACCOUNT_ID=6ba1d2a52a3fa230972960db307ac7c0

npx wrangler whoami
```

You should see your account information with no errors.

---

## 🚀 After Token Creation

Once you have the new token, you can:

### 1. Create KV Namespace
```bash
cd workers/agent
npx wrangler kv namespace create AI_EMPLOYEE_LOGS

# Copy the ID and update wrangler.toml:
# [[kv_namespaces]]
# binding = "AI_EMPLOYEE_LOGS"
# id = "paste_id_here"
```

### 2. Create R2 Buckets
```bash
npx wrangler r2 bucket create efh-private
npx wrangler r2 bucket create efh-pages

# Uncomment R2 bindings in wrangler.toml files
```

### 3. Deploy Workers
```bash
# AI Employee
cd workers/agent
npx wrangler deploy ai-employee.js

# AI Stylist
cd workers/stylist
npx wrangler deploy ai-stylist.js

# Page Deployer
cd workers/deployer
npx wrangler deploy page-deployer.js
```

---

## 📋 Quick Reference

**Account ID:** `6ba1d2a52a3fa230972960db307ac7c0`

**Required Permissions:**
- ✅ Workers Scripts: Edit
- ✅ Workers KV Storage: Edit
- ✅ Workers R2 Storage: Edit
- ✅ Workers AI: Read
- ✅ Account Settings: Read

**Token Dashboard:** [https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/api-tokens](https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/api-tokens)

---

## 🔒 Security Best Practices

1. **Store token securely** - Never commit to Git
2. **Use environment variables** - Keep in .env file
3. **Rotate regularly** - Create new tokens periodically
4. **Limit scope** - Only grant necessary permissions
5. **Monitor usage** - Check token activity in dashboard

---

## ❓ Troubleshooting

### "Authentication error [code: 10000]"
- Token doesn't have required permission
- Check token permissions in dashboard
- Create new token with correct permissions

### "Valid user-level authentication not found [code: 9109]"
- Token can't create other tokens
- Must create token manually in dashboard

### "Token not found"
- Token may have been deleted
- Create new token

---

## 📞 Need Help?

- [Cloudflare API Tokens Docs](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

**Once you have the new token, all deployments will work!** 🎉
