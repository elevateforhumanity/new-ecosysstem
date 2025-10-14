/*
  Cloudflare Pages Functions Middleware
  Handles routing, caching, and automatic updates
*/

export async function onRequest(context: any) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // Add security headers
  const response = await next();
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  newResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Cache static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Don't cache HTML or API responses
  if (url.pathname.endsWith('.html') || url.pathname.startsWith('/api/')) {
    newResponse.headers.set('Cache-Control', 'no-cache, must-revalidate');
  }
  
  // Sitemap caching - prevent old sitemaps
  if (url.pathname.includes('sitemap')) {
    newResponse.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    newResponse.headers.set('X-Robots-Tag', 'noindex');
  }

  return newResponse;
}
