/**
 * Runtime env guard — import *once* near app bootstrap.
 * Prevents silent blank screens when required env vars are missing.
 */
const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

const missing = required.filter((k) => !import.meta.env[k]);
if (missing.length) {
  // Surface a visible error in dev/preview; fail gracefully in prod
  console.error('❌ Missing env vars:', missing);
  const msg = `Configuration error. Missing: ${missing.join(', ')}`;
  if (typeof document !== 'undefined') {
    const el = document.createElement('pre');
    el.style.cssText =
      'padding:16px;background:#fff3cd;border:1px solid #ffecb5;color:#664d03;margin:20px;border-radius:8px;font-family:monospace;';
    el.textContent = `⚠️ ${msg}\n\nAdd these to your Cloudflare Pages environment variables.`;
    document.body.prepend(el);
  }
}
export {};
