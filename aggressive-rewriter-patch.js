/**
 * Aggressive Link & Form Rewriter Patch
 * Complete solution for subdomain to main domain redirection
 */

const aggressiveRewriterPatch = `
// ===== Aggressive rehost for links & forms when on SUB domain =====
const CUR_HOST = location.hostname.replace(/^www\\./,'').toLowerCase();
if (CUR_HOST === SUB_DOMAIN) {
  // helper: convert subdomain URLs to main-domain equivalents
  const rehost = (raw) => {
    try {
      if (!raw) return raw;
      if (/^(mailto:|tel:|javascript:|#)/i.test(raw)) return raw; // leave safe schemes/anchors
      const u = new URL(raw, location.origin);
      const h = u.hostname.replace(/^www\\./,'').toLowerCase();
      if (h === SUB_DOMAIN) {
        u.protocol = 'https:'; 
        u.hostname = MAIN_DOMAIN;
        return u.href;
      }
      return u.href; // external or already main — leave as is
    } catch { return raw; }
  };

  // 1) Rewrite existing anchors immediately (menus, buttons, text links)
  document.querySelectorAll('a[href]').forEach(a => {
    a.href = rehost(a.getAttribute('href'));
  });

  // 2) Intercept clicks (catches dynamic/menu links before navigation)
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    const raw = a.getAttribute('href');
    a.href = rehost(raw);
  }, true);

  // 3) MutationObserver — rewrite links that appear later (lazy menus, repeaters, etc.)
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      for (const n of m.addedNodes || []) {
        if (n.nodeType !== 1) continue;
        if (n.matches && n.matches('a[href]')) n.setAttribute('href', rehost(n.getAttribute('href')));
        if (n.querySelectorAll) n.querySelectorAll('a[href]').forEach(a => a.setAttribute('href', rehost(a.getAttribute('href'))));
      }
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // 4) Forms — rewrite action to the main domain when safe
  //    (skips Wix internal forms/endpoints and third-party APIs)
  const shouldRewriteForm = (actionAttr) => {
    if (!actionAttr) return true;                    // relative or empty — safe to rewrite
    if (/wix|_api|form|submit/i.test(actionAttr)) return false; // likely Wix/third-party form handler
    try {
      const u = new URL(actionAttr, location.origin);
      const h = u.hostname.replace(/^www\\./,'').toLowerCase();
      return (h === SUB_DOMAIN);                     // only rewrite if pointing to SUB now
    } catch { return false; }
  };

  // initial sweep
  document.querySelectorAll('form').forEach(form => {
    const act = form.getAttribute('action') || '';
    if (shouldRewriteForm(act)) {
      try {
        const u = new URL(act || location.pathname, location.origin);
        u.protocol = 'https:'; u.hostname = MAIN_DOMAIN;
        form.setAttribute('action', u.href);
      } catch {}
    }
  });

  // submit guard (handles forms with no action or dynamic changes)
  document.addEventListener('submit', (e) => {
    const form = e.target && e.target.closest ? e.target.closest('form') : null;
    if (!form) return;
    const act = form.getAttribute('action') || '';
    if (shouldRewriteForm(act)) {
      try {
        const u = new URL(act || location.href, location.origin);
        u.protocol = 'https:'; u.hostname = MAIN_DOMAIN;
        form.setAttribute('action', u.href);
      } catch {
        // last-ditch: prevent and navigate to main root
        e.preventDefault();
        location.href = \`https://\${MAIN_DOMAIN}\${location.pathname}\${location.search}\${location.hash}\`;
      }
    }
  }, true);

  console.log('✅ Aggressive rewriter active: All links and forms redirect to main domain');
}
`;

console.log('🔗 AGGRESSIVE LINK & FORM REWRITER PATCH');
console.log('=========================================');
console.log('');
console.log('📋 REPLACE YOUR EXISTING LINK REWRITER WITH THIS:');
console.log('(Insert after CONFIG section in Master Page)');
console.log('=================================================');
console.log(aggressiveRewriterPatch);
console.log('');
console.log('✅ ENHANCED FEATURES:');
console.log('• Immediate rewrite of all existing links');
console.log('• Click interception for dynamic navigation');
console.log('• MutationObserver for lazy-loaded content');
console.log('• Smart form action rewriting (skips Wix/3rd-party)');
console.log('• Submit guard for dynamic form changes');
console.log('• Preserves mailto:, tel:, javascript:, and # anchors');
console.log('');
console.log('🎯 SMART FORM HANDLING:');
console.log('• Rewrites custom forms to main domain');
console.log('• Skips Wix internal forms (wix, _api, form, submit)');
console.log('• Handles forms with no action attribute');
console.log('• Last-ditch navigation fallback');
console.log('');
console.log('🚀 VERIFICATION COMMANDS:');
console.log('1. Check links: [...document.querySelectorAll("a[href]")].slice(0,10).map(a=>a.href)');
console.log('2. Check forms: document.querySelectorAll("form")[0]?.getAttribute("action")');
console.log('3. Console log: Should see "Aggressive rewriter active" message');
console.log('');
console.log('💡 ADDITIONAL ENHANCEMENTS AVAILABLE:');
console.log('• Force <img src> to load from CDN/main bucket');
console.log('• Opt-in whitelist for external domains to preserve');
console.log('• CSS background-image URL rewriting');
console.log('• Video/audio source rewriting');

// Complete Master Page template with aggressive rewriter
const completeMasterPageTemplate = `
// EFH x SelfishIncSupport — Complete Domain Architecture with Aggressive Rewriter
$w.onReady(() => {
  // ==== CONFIG ====
  const MAIN_DOMAIN = 'elevate4humanity.org';
  const SUB_DOMAIN  = 'selfishincsupport.org';
  const BRAND_MAIN  = 'Elevate for Humanity';
  const BRAND_SUB   = 'Selfish Inc Support';
  const AUTO_REDIRECT_ROOT = true;

  // ==== AGGRESSIVE LINK & FORM REWRITER ====
  ${aggressiveRewriterPatch}

  // ==== DOMAIN MIXER CORE ====
  const host = (location.hostname || '').replace(/^www\\./,'').toLowerCase();
  const path = (location.pathname || '').replace(/\\/+$/,'') || '/';
  const isMain = host === MAIN_DOMAIN;
  const isSub  = host === SUB_DOMAIN;

  // Canonical strategy
  const canonicalHref = \`https://\${MAIN_DOMAIN}\${path}\${location.search}\`;
  let canon = document.head.querySelector('link[rel="canonical"]');
  if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
  canon.href = canonicalHref;

  // Brand bar
  const barHtml = \`
    <div id="efh-brandbar" style="position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#0f172a;color:#fff;padding:8px 12px;text-align:center;font:13px/1.2 system-ui">
      \${isMain 
        ? \`Main site: <strong>\${BRAND_MAIN}</strong> • Partner: <a href="https://\${SUB_DOMAIN}" style="color:#fff;text-decoration:underline">\${SUB_DOMAIN}</a>\`
        : \`Partner site: <strong>\${SUB_DOMAIN}</strong> • Main: <a href="https://\${MAIN_DOMAIN}" style="color:#fff;text-decoration:underline">\${MAIN_DOMAIN}</a>
           <button id="efh-switch-main" style="margin-left:8px;padding:4px 10px;border-radius:8px;border:1px solid #fff;background:transparent;color:#fff">Go to main</button>\`
      }
    </div>\`;
  document.body.insertAdjacentHTML('afterbegin', barHtml);
  document.body.style.paddingTop = '42px';

  // Auto-redirect and switch functionality
  if (!isMain) {
    document.getElementById('efh-switch-main')?.addEventListener('click', () => {
      location.href = \`https://\${MAIN_DOMAIN}\${path}\${location.search}\${location.hash}\`;
    });
    if (AUTO_REDIRECT_ROOT && path === '/') {
      setTimeout(() => location.replace(\`https://\${MAIN_DOMAIN}/\`), 3000);
    }
  }

  console.log('✅ Complete domain architecture active:', { host, path, isMain, isSub });
});
`;

console.log('');
console.log('📋 COMPLETE MASTER PAGE TEMPLATE:');
console.log('==================================');
console.log('(Full implementation with aggressive rewriter)');
console.log('');
console.log(completeMasterPageTemplate);

export { aggressiveRewriterPatch, completeMasterPageTemplate };