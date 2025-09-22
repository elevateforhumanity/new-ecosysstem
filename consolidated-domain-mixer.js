/**
 * Consolidated Domain Mixer - Complete Solution
 * Single Master Page snippet for perfect domain architecture
 */

const consolidatedDomainMixer = `
// EFH × SelfishIncSupport — Consolidated Domain Mixer (Master Page only)
$w.onReady(() => {
  // ===== CONFIG =====
  const MAIN_DOMAIN = 'elevate4humanity.org';   // primary
  const SUB_DOMAIN  = 'selfishincsupport.org';  // partner/subdomain
  const BRAND_MAIN  = 'Elevate for Humanity';
  const BRAND_SUB   = 'Selfish Inc Support';

  const CFG = {
    SHOW_BRAND_BAR:     true,
    SUBNOTE_ON_HOME:    true,   // note on Elevate homepage referencing Selfish
    REDIRECT_ROOT:      true,   // on Selfish "/" → auto-redirect to Elevate after 3s (cancelable)
    REWRITE_LINKS:      true,   // rewrite internal links on Selfish → Elevate
    REWRITE_FORMS:      true,   // rewrite safe form actions on Selfish → Elevate
    SELFISH_OVERLAY:    false   // show overlay content on /selfish or /donate
  };

  // ===== Context =====
  const host = location.hostname.replace(/^www\\./,'').toLowerCase();
  const path = (location.pathname || '').replace(/\\/+$/,'') || '/';
  const isMain = host === MAIN_DOMAIN;
  const isSub  = host === SUB_DOMAIN;

  // ===== Helpers =====
  const ensureMeta = (k,v,prop=false) => {
    const sel = prop ? \`meta[property="\${k}"]\` : \`meta[name="\${k}"]\`;
    let el = document.head.querySelector(sel);
    if (!el) { el = document.createElement('meta'); prop ? el.setAttribute('property',k) : el.setAttribute('name',k); document.head.appendChild(el); }
    if (v!=null) el.setAttribute('content', v);
  };
  const ensureCanonical = href => {
    let c = document.head.querySelector('link[rel="canonical"]');
    if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c); }
    c.href = href;
  };
  const rehostURL = (raw) => {
    try {
      if (!raw || /^(mailto:|tel:|javascript:|#)/i.test(raw)) return raw;
      const u = new URL(raw, location.origin);
      const h = u.hostname.replace(/^www\\./,'').toLowerCase();
      if (h === SUB_DOMAIN) { u.protocol='https:'; u.hostname = MAIN_DOMAIN; }
      return u.href;
    } catch { return raw; }
  };

  // ===== Canonicalize every page to MAIN domain (avoids duplicate SEO) =====
  const canonicalHref = \`https://\${MAIN_DOMAIN}\${path}\${location.search}\`;
  ensureCanonical(canonicalHref);
  ensureMeta('og:url', canonicalHref, true);
  if (!document.title || !document.title.trim()) document.title = BRAND_MAIN;
  ensureMeta('description', 'Elevate for Humanity — workforce training, apprenticeships, and community support.');
  ensureMeta('og:title', document.title, true);
  ensureMeta('og:description', 'Elevate for Humanity — workforce training, apprenticeships, and community support.', true);

  // ===== Brand bar & Elevate-home note =====
  if (CFG.SHOW_BRAND_BAR) {
    const bar = \`
      <div id="efh-brandbar" style="position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#0f172a;color:#fff;padding:8px 12px;text-align:center;font:13px system-ui">
        \${
          isMain
          ? \`Main site: <strong>\${BRAND_MAIN}</strong> • Partner: <a href="https://\${SUB_DOMAIN}" style="color:#fff;text-decoration:underline">\${SUB_DOMAIN}</a>\`
          : \`You're on partner site <strong>\${SUB_DOMAIN}</strong> • Main: <a id="efh-mainlink" href="https://\${MAIN_DOMAIN}\${path}\${location.search}\${location.hash}" style="color:#fff;text-decoration:underline">\${MAIN_DOMAIN}</a>
             <button id="efh-switch-main" style="margin-left:8px;padding:4px 10px;border-radius:8px;border:1px solid #fff;background:transparent;color:#fff">Go to main</button>\`
        }
      </div>\`;
    document.body.insertAdjacentHTML('afterbegin', bar);
    document.body.style.paddingTop = '42px';
    document.getElementById('efh-switch-main')?.addEventListener('click', () => {
      location.href = \`https://\${MAIN_DOMAIN}\${path}\${location.search}\${location.hash}\`;
    });
  }
  if (CFG.SUBNOTE_ON_HOME && isMain && path === '/') {
    const note = \`
      <section id="subdomain-note" style="max-width:1100px;margin:12px auto 0;padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;font:15px system-ui">
        <strong>\${BRAND_SUB}</strong> operates as our support subdomain. Visit
        <a href="https://\${SUB_DOMAIN}" style="text-decoration:underline">https://\${SUB_DOMAIN}</a>.
      </section>\`;
    document.body.insertAdjacentHTML('afterbegin', note);
  }

  // ===== Auto-redirect Selfish ROOT → Elevate (cancelable) =====
  if (CFG.REDIRECT_ROOT && isSub && path === '/' && !/(?:^|[?&])(stay|no-redirect)=1\\b/i.test(location.search)) {
    const wrap = document.createElement('div');
    wrap.id = 'efh-redirect-bar';
    wrap.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:2147483647;background:#0f172a;color:#fff;padding:10px 12px;border-radius:10px;font:13px system-ui;display:flex;gap:10px;align-items:center';
    wrap.innerHTML = \`Redirecting to <strong>\${MAIN_DOMAIN}</strong> in <span id="efh-ctr">3</span>s… <button id="efh-stay" style="padding:6px 10px;border-radius:8px;border:1px solid #fff;background:transparent;color:#fff">Stay here</button>\`;
    document.body.appendChild(wrap);
    let n=3; const tick = setInterval(()=>{ n--; document.getElementById('efh-ctr').textContent=String(n);
      if(n<=0){ clearInterval(tick); location.replace(\`https://\${MAIN_DOMAIN}/\`); }}, 1000);
    document.getElementById('efh-stay')?.addEventListener('click', ()=>{ clearInterval(tick); wrap.remove(); try{sessionStorage.setItem('efh_stay','1');}catch{}; });
    try{ if(sessionStorage.getItem('efh_stay')==='1'){ clearInterval(tick); wrap.remove(); } }catch{}
  }

  // ===== Rewrite internal links & forms on SUB → MAIN =====
  if (isSub && (CFG.REWRITE_LINKS || CFG.REWRITE_FORMS)) {
    if (CFG.REWRITE_LINKS) {
      // initial sweep
      document.querySelectorAll('a[href]').forEach(a => a.href = rehostURL(a.getAttribute('href')));
      // intercept clicks
      document.addEventListener('click', (e) => {
        const a = e.target?.closest && e.target.closest('a[href]');
        if (!a) return;
        a.href = rehostURL(a.getAttribute('href'));
      }, true);
      // links added later
      new MutationObserver(muts => {
        muts.forEach(m => [...m.addedNodes].forEach(n => {
          if (n.nodeType!==1) return;
          if (n.matches?.('a[href]')) n.setAttribute('href', rehostURL(n.getAttribute('href')));
          n.querySelectorAll?.('a[href]').forEach(a => a.setAttribute('href', rehostURL(a.getAttribute('href'))));
        }));
      }).observe(document.documentElement, { childList:true, subtree:true });
    }

    if (CFG.REWRITE_FORMS) {
      const shouldRewriteForm = (action) => {
        if (!action) return true; // empty/relative
        if (/wix|_api|form|submit/i.test(action)) return false; // likely Wix/3P handler
        try { return (new URL(action, location.origin).hostname.replace(/^www\\./,'').toLowerCase() === SUB_DOMAIN); } catch { return false; }
      };
      // initial
      document.querySelectorAll('form').forEach(f => {
        const act = f.getAttribute('action') || '';
        if (shouldRewriteForm(act)) {
          try { const u = new URL(act || location.pathname, location.origin); u.protocol='https:'; u.hostname=MAIN_DOMAIN; f.setAttribute('action', u.href); } catch {}
        }
      });
      // on submit
      document.addEventListener('submit', (e) => {
        const f = e.target?.closest && e.target.closest('form'); if (!f) return;
        const act = f.getAttribute('action') || '';
        if (shouldRewriteForm(act)) {
          try { const u = new URL(act || location.href, location.origin); u.protocol='https:'; u.hostname=MAIN_DOMAIN; f.setAttribute('action', u.href); }
          catch { e.preventDefault(); location.href = \`https://\${MAIN_DOMAIN}\${location.pathname}\${location.search}\${location.hash}\`; }
        }
      }, true);
    }
  }

  // ===== Optional overlay for /selfish and /donate =====
  if (CFG.SELFISH_OVERLAY && ['/selfish','/donate'].includes(path)) {
    const DESC = 'Donate to Selfish Inc Support — partner to Elevate for Humanity.';
    document.title = \`\${BRAND_SUB} — Partner to \${BRAND_MAIN}\`;
    ensureMeta('description', DESC); ensureMeta('og:title', document.title, true); ensureMeta('og:description', DESC, true);
    const html = \`
      <style>
        #efh-ov{position:fixed;inset:0;z-index:2147483647;background:#fff;color:#111;overflow:auto}
        #efh-ov .w{max-width:1000px;margin:0 auto;padding:32px 16px;font:16px system-ui}
        #efh-ov h1{font-size:28px;margin:0 0 6px}
        #efh-ov .btn{display:inline-block;padding:12px 18px;border-radius:12px;background:#111;color:#fff;text-decoration:none;margin-right:8px}
      </style>
      <div id="efh-ov" role="main" aria-label="Selfish Support">
        <div class="w">
          <h1>\${BRAND_SUB} — Partner to \${BRAND_MAIN}</h1>
          <p>Donations support workforce training and community programs.</p>
          <p><a class="btn" href="/" aria-label="Back">← Back to site</a></p>
        </div>
      </div>\`;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('efh-ov')?.setAttribute('tabindex','-1');
  }

  // ===== A11y polish: fill img alt if missing =====
  try { Array.from(document.querySelectorAll('img')).forEach((img,i)=>{ if(!img.alt||!img.alt.trim()) img.alt = \`\${BRAND_MAIN} image \${i+1}\`; }); } catch {}

  console.log('✅ EFH Domain Mixer active', { host, path, isMain, isSub, canonicalHref, CFG });
});
`;

console.log('🎯 CONSOLIDATED DOMAIN MIXER - COMPLETE SOLUTION');
console.log('================================================');
console.log('');
console.log('📋 SINGLE MASTER PAGE SNIPPET:');
console.log('===============================');
console.log(consolidatedDomainMixer);
console.log('');
console.log('✅ COMPLETE FEATURE SET:');
console.log('• Clean CONFIG section for easy customization');
console.log('• Brand bar explaining domain relationship');
console.log('• Canonical tags for SEO optimization');
console.log('• Auto-redirect with cancelable countdown');
console.log('• Aggressive link and form rewriting');
console.log('• Optional overlay for /selfish and /donate');
console.log('• Automatic alt text for accessibility');
console.log('• Session storage for user preferences');
console.log('');
console.log('🎯 CONFIGURATION OPTIONS:');
console.log('• SHOW_BRAND_BAR: Show relationship bar (true/false)');
console.log('• SUBNOTE_ON_HOME: Note on main homepage (true/false)');
console.log('• REDIRECT_ROOT: Auto-redirect subdomain root (true/false)');
console.log('• REWRITE_LINKS: Rewrite internal links (true/false)');
console.log('• REWRITE_FORMS: Rewrite form actions (true/false)');
console.log('• SELFISH_OVERLAY: Show overlay pages (true/false)');
console.log('');
console.log('🚀 DEPLOYMENT INSTRUCTIONS:');
console.log('1. Open Wix → Dev Mode (Velo) → Master Page (Site Code)');
console.log('2. Paste the complete snippet above');
console.log('3. Adjust CONFIG settings if needed');
console.log('4. Publish the site');
console.log('5. Test both domains for functionality');
console.log('');
console.log('🔍 VERIFICATION CHECKLIST:');
console.log('• selfishincsupport.org → 3s redirect countdown (if enabled)');
console.log('• Menu links point to elevate4humanity.org');
console.log('• Brand bar shows on both domains');
console.log('• Canonical tags point to main domain');
console.log('• Forms submit to main domain (custom forms only)');
console.log('• Alt text auto-filled on images');
console.log('');
console.log('💡 BYPASS OPTIONS:');
console.log('• ?stay=1 or ?no-redirect=1 to skip auto-redirect');
console.log('• "Stay here" button during countdown');
console.log('• Session storage remembers user preference');
console.log('');
console.log('🏆 PERFECT DOMAIN ARCHITECTURE ACHIEVED!');

// Configuration examples for different scenarios
const configExamples = {
  minimal: {
    SHOW_BRAND_BAR: true,
    SUBNOTE_ON_HOME: false,
    REDIRECT_ROOT: false,
    REWRITE_LINKS: true,
    REWRITE_FORMS: false,
    SELFISH_OVERLAY: false
  },
  
  aggressive: {
    SHOW_BRAND_BAR: true,
    SUBNOTE_ON_HOME: true,
    REDIRECT_ROOT: true,
    REWRITE_LINKS: true,
    REWRITE_FORMS: true,
    SELFISH_OVERLAY: true
  },
  
  seo_focused: {
    SHOW_BRAND_BAR: false,
    SUBNOTE_ON_HOME: true,
    REDIRECT_ROOT: false,
    REWRITE_LINKS: true,
    REWRITE_FORMS: false,
    SELFISH_OVERLAY: false
  }
};

console.log('');
console.log('📋 CONFIGURATION EXAMPLES:');
console.log('==========================');
console.log('');
console.log('MINIMAL SETUP (basic link rewriting):');
console.log(JSON.stringify(configExamples.minimal, null, 2));
console.log('');
console.log('AGGRESSIVE SETUP (all features enabled):');
console.log(JSON.stringify(configExamples.aggressive, null, 2));
console.log('');
console.log('SEO FOCUSED (canonical optimization):');
console.log(JSON.stringify(configExamples.seo_focused, null, 2));

export { consolidatedDomainMixer, configExamples };