# Environment Variables Configuration

## 🔧 Netlify Environment Variables

Set these in **Netlify Dashboard → Site Settings → Environment Variables**:

### Client-Side Variables (Public)
These are exposed to the browser and used by the login system:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Server-Side Variables (Edge Functions)
These are used by the Netlify Edge Function for authentication:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Build Configuration
```bash
NODE_VERSION=22
```

---

## 🔍 How to Get Your Supabase Credentials

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be created (2-3 minutes)

### 2. Get Project URL and Keys
1. In your Supabase dashboard, go to **Settings → API**
2. Copy the following values:

**Project URL**: `https://your-project-id.supabase.co`
**Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configure Google OAuth
1. In Supabase: **Authentication → Providers → Google**
2. Enable the Google provider
3. Set up Google Cloud Console (see below)
4. Add your Client ID and Client Secret from Google

---

## 🔐 Google Cloud Console Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable the **Google+ API**

### 2. Create OAuth 2.0 Credentials
1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
5. Copy the **Client ID** and **Client Secret**

### 3. Configure in Supabase
1. Back in Supabase: **Authentication → Providers → Google**
2. Paste your **Client ID** and **Client Secret**
3. Add your site URL:
   ```
   Site URL: https://your-domain.com
   Redirect URLs: https://your-domain.com/login-callback.html
   ```

---

## 🌐 Domain Configuration

### Supabase Allowed Origins
In **Supabase → Authentication → URL Configuration**:

```
Site URL: https://your-domain.com
Additional Redirect URLs:
- https://your-domain.com/login-callback.html
- http://localhost:3000/login-callback.html (for local testing)
```

### Netlify Domain Settings
1. In Netlify, go to **Site Settings → Domain Management**
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable HTTPS (automatic with Netlify)

---

## 🧪 Testing Your Configuration

### 1. Local Testing (Optional)
If you want to test locally before deploying:

```bash
# Create .env file in your project root
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Serve locally
npx serve public -p 3000
```

### 2. Production Testing
1. Deploy to Netlify with environment variables set
2. Visit your site's `/login.html`
3. Click "Sign in with Google"
4. Complete OAuth flow
5. Try accessing a protected route like `/portal/`

---

## 🔒 Security Best Practices

### Environment Variable Scopes
- Set scope to **"Builds and Runtime"** for all variables
- Never use the service role key in client-side code
- Only use the anon key (it's safe for public exposure)

### Supabase Security
- Enable Row Level Security (RLS) on all tables
- Configure proper authentication policies
- Use the anon key for client-side operations
- Reserve service role key for server-side admin operations only

### Domain Security
- Always use HTTPS in production
- Configure proper CORS settings in Supabase
- Limit redirect URLs to your actual domains
- Enable Netlify's security headers (already configured in netlify.toml)

---

## 🚨 Common Issues & Solutions

### "Invalid redirect URL" Error
**Problem**: OAuth redirect fails
**Solution**: Ensure your domain is added to Supabase redirect URLs exactly as it appears in the browser

### "Invalid API key" Error
**Problem**: Supabase connection fails
**Solution**: Double-check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly

### Edge Function Authentication Fails
**Problem**: Protected routes don't work
**Solution**: Verify that SUPABASE_URL and SUPABASE_ANON_KEY (without VITE_ prefix) are set for edge functions

### Google OAuth Setup Issues
**Problem**: "OAuth client not found"
**Solution**: Verify Google Cloud Console credentials and ensure the redirect URI matches exactly

---

## 📋 Environment Variables Checklist

Before deploying, verify you have:

- [ ] **VITE_SUPABASE_URL** - Your Supabase project URL
- [ ] **VITE_SUPABASE_ANON_KEY** - Your Supabase anon key (for client)
- [ ] **SUPABASE_URL** - Same URL (for edge functions)
- [ ] **SUPABASE_ANON_KEY** - Same anon key (for edge functions)
- [ ] **NODE_VERSION** - Set to 22
- [ ] **Google OAuth** - Configured in both Google Cloud and Supabase
- [ ] **Domain URLs** - Added to Supabase allowed origins
- [ ] **Redirect URLs** - Include your login-callback.html page

---

## 📞 Need Help?

If you're having trouble with environment configuration:

1. **Check Netlify Deploy Logs** - Look for environment variable errors
2. **Test Supabase Connection** - Use the Supabase dashboard to verify your project
3. **Verify Google OAuth** - Test the OAuth flow in Google Cloud Console
4. **Contact Support** - support@elevateforhumanity.org

**Remember**: Environment variables are case-sensitive and must be set exactly as shown above.