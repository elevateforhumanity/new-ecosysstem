/**
 * Unified Configuration for Integrated Application
 * Supabase (Database) + Cloudflare Pages (Frontend) + Render (Backend API)
 */

export const config = {
  // Application Info
  app: {
    name: 'Elevate for Humanity',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'production',
  },

  // Supabase Configuration (Database & Auth)
  supabase: {
    url: process.env.VITE_SUPABASE_URL || 'https://cuxzzpsyufcewtmicszk.supabase.co',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA',
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  // Cloudflare Pages Configuration (Frontend Hosting)
  cloudflare: {
    projectName: 'elevateforhumanity',
    productionUrl: 'https://elevateforhumanity.pages.dev',
    previewUrl: process.env.CF_PAGES_URL || 'https://elevateforhumanity.pages.dev',
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
  },

  // Render Configuration (Backend API)
  render: {
    serviceId: process.env.RENDER_SERVICE_ID,
    apiUrl: process.env.RENDER_API_URL || 'https://elevateforhumanity.onrender.com',
    apiKey: process.env.RENDER_API_KEY,
    deployHook: process.env.RENDER_DEPLOY_HOOK,
  },

  // CORS Configuration (Allow all platforms to communicate)
  cors: {
    allowedOrigins: [
      'https://elevateforhumanity.pages.dev',
      'https://elevateforhumanity.onrender.com',
      'https://cuxzzpsyufcewtmicszk.supabase.co',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'apikey',
      'X-Client-Info',
      'X-Supabase-Auth',
    ],
    credentials: true,
  },

  // Security Headers
  security: {
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cuxzzpsyufcewtmicszk.supabase.co'],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': [
        "'self'",
        'https://cuxzzpsyufcewtmicszk.supabase.co',
        'wss://cuxzzpsyufcewtmicszk.supabase.co',
        'https://elevateforhumanity.onrender.com',
        'https://elevateforhumanity.pages.dev',
      ],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  },

  // API Endpoints
  api: {
    base: process.env.VITE_API_URL || 'https://elevateforhumanity.onrender.com',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      programs: '/api/programs',
      enrollments: '/api/enrollments',
    },
  },

  // Feature Flags
  features: {
    enableAnalytics: true,
    enableChatbot: true,
    enableAutopilot: true,
    enablePayments: true,
    enableNotifications: true,
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${config.api.base}${config.api.endpoints[endpoint] || endpoint}`;
};

// Helper function to check if origin is allowed
export const isOriginAllowed = (origin) => {
  return config.cors.allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith('.pages.dev') || origin.endsWith('.onrender.com')
  );
};

// Export for CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config, getApiUrl, isOriginAllowed };
}
