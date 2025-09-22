/**
 * Link Rewriter Enhancer
 * Forces all internal links on subdomain to open on main domain
 */

const linkRewriterEnhancer = `
// Rewrite internal links on SUB domain to MAIN domain
if (location.hostname.replace(/^www\\./,'').toLowerCase() === SUB_DOMAIN) {
  const rehost = (raw) => {
    try {
      if (/^(mailto:|tel:|javascript:)/i.test(raw)) return raw;
      const u = new URL(raw, location.origin);
      if (u.hostname.replace(/^www\\./,'').toLowerCase() === SUB_DOMAIN) {
        u.protocol = 'https:'; u.hostname = MAIN_DOMAIN;
        return u.href;
      }
    } catch (_) {}
    return raw;
  };
  
  // 1) Rewrite existing relative links
  document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]').forEach(a => {
    a.href = rehost(a.getAttribute('href'));
  });
  
  // 2) Intercept clicks (catches dynamic/menu links)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const href = a.getAttribute('href'); if (!href) return;
    a.href = rehost(href);
  }, true);
  
  // 3) Enhanced: Rewrite form actions to main domain
  document.querySelectorAll('form[action]').forEach(form => {
    const action = form.getAttribute('action');
    if (action && action.startsWith('/')) {
      form.action = \`https://\${MAIN_DOMAIN}\${action}\`;
    }
  });
  
  // 4) Enhanced: Update Wix menu items at runtime
  setTimeout(() => {
    document.querySelectorAll('[data-testid*="menu"], .menu-item, nav a').forEach(menuItem => {
      const href = menuItem.getAttribute('href');
      if (href && href.startsWith('/')) {
        menuItem.href = \`https://\${MAIN_DOMAIN}\${href}\`;
      }
    });
  }, 1000); // Wait for Wix menu to load
  
  console.log('✅ Link rewriter active: All internal links redirect to main domain');
}
`;

console.log('🔗 LINK REWRITER ENHANCER');
console.log('=========================');
console.log('');
console.log('📋 ADD THIS TO YOUR EXISTING MASTER PAGE CODE:');
console.log('(Insert after the CONFIG section)');
console.log('===============================================');
console.log(linkRewriterEnhancer);
console.log('');
console.log('✅ ENHANCED FEATURES:');
console.log('• Rewrites relative links (/page → https://main-domain/page)');
console.log('• Intercepts dynamic menu clicks');
console.log('• Updates form actions to main domain');
console.log('• Handles Wix menu items at runtime');
console.log('• Preserves mailto:, tel:, and external links');
console.log('');
console.log('🎯 ACTIVATION:');
console.log('• Only works when on selfishincsupport.org');
console.log('• Automatically redirects all internal navigation');
console.log('• Maintains seamless user experience');
console.log('');
console.log('🚀 VERIFICATION STEPS:');
console.log('1. Publish updated Master Page code');
console.log('2. Visit selfishincsupport.org');
console.log('3. Hover menu links → should show elevate4humanity.org URLs');
console.log('4. Click any internal link → lands on main domain');
console.log('');
console.log('💡 COMPLETE INTEGRATION:');
console.log('This ensures users always end up on the main domain');
console.log('while keeping the support subdomain for specific content.');

// Complete integrated code example
const completeIntegratedCode = `
// EFH x SelfishIncSupport — Domain Mixer & Canonical Guard + Link Rewriter
$w.onReady(() => {
  // ==== CONFIG ====
  const MAIN_DOMAIN = 'elevate4humanity.org';
  const SUB_DOMAIN  = 'selfishincsupport.org';
  const BRAND_MAIN  = 'Elevate for Humanity';
  const BRAND_SUB   = 'Selfish Inc Support';
  const AUTO_REDIRECT_ROOT = true;

  // ==== LINK REWRITER ENHANCER ====
  ${linkRewriterEnhancer}

  // ==== REST OF DOMAIN MIXER CODE ====
  // [Previous domain mixer implementation continues...]
  
  console.log('✅ Complete domain architecture with link rewriting active');
});
`;

console.log('');
console.log('📋 COMPLETE INTEGRATED VERSION:');
console.log('===============================');
console.log('(Full Master Page code with link rewriter included)');
console.log('');
console.log(completeIntegratedCode);

export { linkRewriterEnhancer, completeIntegratedCode };