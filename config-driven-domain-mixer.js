/**
 * Config-Driven Domain Mixer - CMS Powered
 * No-code configuration through Wix CMS collection
 */

const configDrivenDomainMixer = `
// EFH Domain Mixer — Config-Driven (CMS Powered) Master Page
$w.onReady(async () => {
  // ===== LOAD CONFIG FROM CMS =====
  let CFG = {
    // Safe defaults (fallback if CMS collection doesn't exist)
    mainDomain: 'elevate4humanity.org',
    subDomain: 'selfishincsupport.org',
    brandMain: 'Elevate for Humanity',
    brandSub: 'Selfish Inc Support',
    showBrandBar: true,
    subNoteOnHome: true,
    redirectRoot: true,
    rewriteLinks: true,
    rewriteForms: true,
    selfishOverlay: false
  };

  try {
    // Load from SiteSettings CMS collection
    const { query } = await import('wix-data');
    const settings = await query('SiteSettings').limit(1).find();
    
    if (settings.items && settings.items.length > 0) {
      const cms = settings.items[0];
      CFG = {
        mainDomain: cms.mainDomain || CFG.mainDomain,
        subDomain: cms.subDomain || CFG.subDomain,
        brandMain: cms.brandMain || CFG.brandMain,
        brandSub: cms.brandSub || CFG.brandSub,
        showBrandBar: cms.showBrandBar !== undefined ? cms.showBrandBar : CFG.showBrandBar,
        subNoteOnHome: cms.subNoteOnHome !== undefined ? cms.subNoteOnHome : CFG.subNoteOnHome,
        redirectRoot: cms.redirectRoot !== undefined ? cms.redirectRoot : CFG.redirectRoot,
        rewriteLinks: cms.rewriteLinks !== undefined ? cms.rewriteLinks : CFG.rewriteLinks,
        rewriteForms: cms.rewriteForms !== undefined ? cms.rewriteForms : CFG.rewriteForms,
        selfishOverlay: cms.selfishOverlay !== undefined ? cms.selfishOverlay : CFG.selfishOverlay
      };
      console.log('✅ Config loaded from CMS:', CFG);
    } else {
      console.log('⚠️ No SiteSettings found, using defaults:', CFG);
    }
  } catch (error) {
    console.log('⚠️ CMS config load failed, using defaults:', error.message);
  }

  // ===== CONTEXT =====
  const host = location.hostname.replace(/^www\\./,'').toLowerCase();
  const path = (location.pathname || '').replace(/\\/+$/,'') || '/';
  const isMain = host === CFG.mainDomain;
  const isSub = host === CFG.subDomain;

  // ===== HELPERS =====
  const ensureMeta = (k,v,prop=false) => {
    const sel = prop ? \`meta[property="\${k}"]\` : \`meta[name="\${k}"]\`;
    let el = document.head.querySelector(sel);
    if (!el) { 
      el = document.createElement('meta'); 
      prop ? el.setAttribute('property',k) : el.setAttribute('name',k); 
      document.head.appendChild(el); 
    }
    if (v!=null) el.setAttribute('content', v);
  };
  
  const ensureCanonical = href => {
    let c = document.head.querySelector('link[rel="canonical"]');
    if (!c) { 
      c = document.createElement('link'); 
      c.rel = 'canonical'; 
      document.head.appendChild(c); 
    }
    c.href = href;
  };
  
  const rehostURL = (raw) => {
    try {
      if (!raw || /^(mailto:|tel:|javascript:|#)/i.test(raw)) return raw;
      const u = new URL(raw, location.origin);
      const h = u.hostname.replace(/^www\\./,'').toLowerCase();
      if (h === CFG.subDomain) { 
        u.protocol = 'https:'; 
        u.hostname = CFG.mainDomain; 
      }
      return u.href;
    } catch { 
      return raw; 
    }
  };

  // ===== CANONICALIZE TO MAIN DOMAIN (SEO) =====
  const canonicalHref = \`https://\${CFG.mainDomain}\${path}\${location.search}\`;
  ensureCanonical(canonicalHref);
  ensureMeta('og:url', canonicalHref, true);
  
  if (!document.title || !document.title.trim()) {
    document.title = CFG.brandMain;
  }
  
  ensureMeta('description', \`\${CFG.brandMain} — workforce training, apprenticeships, and community support.\`);
  ensureMeta('og:title', document.title, true);
  ensureMeta('og:description', \`\${CFG.brandMain} — workforce training, apprenticeships, and community support.\`, true);

  // ===== BRAND BAR & HOME NOTE =====
  if (CFG.showBrandBar) {
    const bar = \`
      <div id="efh-brandbar" style="position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#0f172a;color:#fff;padding:8px 12px;text-align:center;font:13px system-ui;box-shadow:0 2px 4px rgba(0,0,0,0.1)">
        \${
          isMain
          ? \`Main site: <strong>\${CFG.brandMain}</strong> • Partner: <a href="https://\${CFG.subDomain}" style="color:#fff;text-decoration:underline">\${CFG.subDomain}</a>\`
          : \`You're on partner site <strong>\${CFG.subDomain}</strong> • Main: <a id="efh-mainlink" href="https://\${CFG.mainDomain}\${path}\${location.search}\${location.hash}" style="color:#fff;text-decoration:underline">\${CFG.mainDomain}</a>
             <button id="efh-switch-main" style="margin-left:8px;padding:4px 10px;border-radius:8px;border:1px solid #fff;background:transparent;color:#fff;cursor:pointer;transition:all 0.2s ease">Go to main</button>\`
        }
      </div>\`;
    document.body.insertAdjacentHTML('afterbegin', bar);
    document.body.style.paddingTop = '42px';
    
    // Enhanced button interaction
    const switchBtn = document.getElementById('efh-switch-main');
    if (switchBtn) {
      switchBtn.addEventListener('mouseenter', () => {
        switchBtn.style.background = '#fff';
        switchBtn.style.color = '#0f172a';
      });
      switchBtn.addEventListener('mouseleave', () => {
        switchBtn.style.background = 'transparent';
        switchBtn.style.color = '#fff';
      });
      switchBtn.addEventListener('click', () => {
        location.href = \`https://\${CFG.mainDomain}\${path}\${location.search}\${location.hash}\`;
      });
    }
  }
  
  if (CFG.subNoteOnHome && isMain && path === '/') {
    const note = \`
      <section id="subdomain-note" style="max-width:1100px;margin:12px auto 0;padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;font:15px system-ui;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <strong>\${CFG.brandSub}</strong> operates as our support subdomain. Visit
        <a href="https://\${CFG.subDomain}" style="text-decoration:underline;color:#1E3A8A">https://\${CFG.subDomain}</a>.
      </section>\`;
    document.body.insertAdjacentHTML('afterbegin', note);
  }

  // ===== AUTO-REDIRECT WITH ENHANCED UX =====
  if (CFG.redirectRoot && isSub && path === '/' && !/(?:^|[?&])(stay|no-redirect)=1\\b/i.test(location.search)) {
    // Check if user previously chose to stay
    let userWantsToStay = false;
    try {
      userWantsToStay = sessionStorage.getItem('efh_stay') === '1';
    } catch {}
    
    if (!userWantsToStay) {
      const wrap = document.createElement('div');
      wrap.id = 'efh-redirect-bar';
      wrap.style.cssText = \`
        position:fixed;left:50%;transform:translateX(-50%);
        bottom:16px;z-index:2147483647;background:#0f172a;color:#fff;
        padding:12px 16px;border-radius:12px;font:13px system-ui;
        display:flex;gap:12px;align-items:center;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);
        animation:slideUp 0.3s ease-out;
        max-width:90vw;
      \`;
      
      // Add animation styles
      const style = document.createElement('style');
      style.textContent = \`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateX(-50%) scale(1); }
          to { opacity: 0; transform: translateX(-50%) scale(0.9); }
        }
      \`;
      document.head.appendChild(style);
      
      wrap.innerHTML = \`
        <span>Redirecting to <strong>\${CFG.mainDomain}</strong> in <span id="efh-ctr" style="font-weight:bold;color:#F59E0B">3</span>s…</span>
        <button id="efh-stay" style="padding:6px 12px;border-radius:8px;border:1px solid #fff;background:transparent;color:#fff;cursor:pointer;transition:all 0.2s ease;font-size:12px">
          Stay here
        </button>
      \`;
      document.body.appendChild(wrap);
      
      // Enhanced countdown with urgency styling
      let n = 3;
      const tick = setInterval(() => {
        n--;
        const ctrEl = document.getElementById('efh-ctr');
        if (ctrEl) {
          ctrEl.textContent = String(n);
          if (n <= 1) {
            ctrEl.style.color = '#EF4444';
            ctrEl.style.fontSize = '14px';
          }
        }
        if (n <= 0) {
          clearInterval(tick);
          wrap.style.animation = 'fadeOut 0.3s ease-out';
          setTimeout(() => {
            location.replace(\`https://\${CFG.mainDomain}/\`);
          }, 300);
        }
      }, 1000);
      
      // Stay button with enhanced UX
      const stayBtn = document.getElementById('efh-stay');
      if (stayBtn) {
        stayBtn.addEventListener('mouseenter', () => {
          stayBtn.style.background = '#fff';
          stayBtn.style.color = '#0f172a';
        });
        stayBtn.addEventListener('mouseleave', () => {
          stayBtn.style.background = 'transparent';
          stayBtn.style.color = '#fff';
        });
        stayBtn.addEventListener('click', () => {
          clearInterval(tick);
          wrap.style.animation = 'fadeOut 0.3s ease-out';
          setTimeout(() => {
            wrap.remove();
            try {
              sessionStorage.setItem('efh_stay', '1');
            } catch {}
            
            // Show confirmation
            const confirmation = document.createElement('div');
            confirmation.style.cssText = \`
              position:fixed;right:16px;bottom:16px;z-index:2147483647;
              background:#16a34a;color:#fff;padding:8px 12px;border-radius:8px;
              font:12px system-ui;animation:slideUp 0.3s ease-out;
            \`;
            confirmation.textContent = \`Staying on \${CFG.subDomain}\`;
            document.body.appendChild(confirmation);
            
            setTimeout(() => {
              confirmation.style.animation = 'fadeOut 0.3s ease-out';
              setTimeout(() => confirmation.remove(), 300);
            }, 3000);
          }, 300);
        });
      }
      
      // ESC key to cancel
      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          stayBtn?.click();
          document.removeEventListener('keydown', handleKeydown);
        }
      };
      document.addEventListener('keydown', handleKeydown);
    }
  }

  // ===== AGGRESSIVE LINK & FORM REWRITING =====
  if (isSub && (CFG.rewriteLinks || CFG.rewriteForms)) {
    if (CFG.rewriteLinks) {
      // Initial sweep of existing links
      document.querySelectorAll('a[href]').forEach(a => {
        a.href = rehostURL(a.getAttribute('href'));
      });
      
      // Intercept clicks for dynamic links
      document.addEventListener('click', (e) => {
        const a = e.target?.closest && e.target.closest('a[href]');
        if (!a) return;
        a.href = rehostURL(a.getAttribute('href'));
      }, true);
      
      // Watch for dynamically added links
      const linkObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          [...mutation.addedNodes].forEach(node => {
            if (node.nodeType !== 1) return;
            if (node.matches?.('a[href]')) {
              node.setAttribute('href', rehostURL(node.getAttribute('href')));
            }
            node.querySelectorAll?.('a[href]').forEach(a => {
              a.setAttribute('href', rehostURL(a.getAttribute('href')));
            });
          });
        });
      });
      linkObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    if (CFG.rewriteForms) {
      const shouldRewriteForm = (action) => {
        if (!action) return true; // empty/relative
        if (/wix|_api|form|submit/i.test(action)) return false; // Wix/3rd-party
        try {
          const hostname = new URL(action, location.origin).hostname.replace(/^www\\./,'').toLowerCase();
          return hostname === CFG.subDomain;
        } catch {
          return false;
        }
      };
      
      // Initial form sweep
      document.querySelectorAll('form').forEach(form => {
        const action = form.getAttribute('action') || '';
        if (shouldRewriteForm(action)) {
          try {
            const u = new URL(action || location.pathname, location.origin);
            u.protocol = 'https:';
            u.hostname = CFG.mainDomain;
            form.setAttribute('action', u.href);
          } catch {}
        }
      });
      
      // Form submit handler
      document.addEventListener('submit', (e) => {
        const form = e.target?.closest && e.target.closest('form');
        if (!form) return;
        const action = form.getAttribute('action') || '';
        if (shouldRewriteForm(action)) {
          try {
            const u = new URL(action || location.href, location.origin);
            u.protocol = 'https:';
            u.hostname = CFG.mainDomain;
            form.setAttribute('action', u.href);
          } catch {
            e.preventDefault();
            location.href = \`https://\${CFG.mainDomain}\${location.pathname}\${location.search}\${location.hash}\`;
          }
        }
      }, true);
    }
  }

  // ===== OPTIONAL OVERLAY PAGES =====
  if (CFG.selfishOverlay && ['/selfish', '/donate'].includes(path)) {
    const overlayTitle = path === '/donate' ? 'Donate' : 'SelfishInc';
    const DESC = \`\${overlayTitle} - \${CFG.brandSub}, partner to \${CFG.brandMain}\`;
    
    document.title = \`\${overlayTitle} | \${CFG.brandSub}\`;
    ensureMeta('description', DESC);
    ensureMeta('og:title', document.title, true);
    ensureMeta('og:description', DESC, true);
    
    const overlayHTML = \`
      <style>
        #efh-overlay{position:fixed;inset:0;z-index:2147483647;background:#fff;color:#111;overflow:auto;font-family:system-ui}
        #efh-overlay .container{max-width:1000px;margin:0 auto;padding:32px 16px}
        #efh-overlay h1{font-size:2.5rem;margin:0 0 1rem;color:#1E3A8A}
        #efh-overlay .subtitle{font-size:1.2rem;color:#6B7280;margin-bottom:2rem}
        #efh-overlay .btn{display:inline-block;padding:12px 24px;border-radius:8px;background:#1E3A8A;color:#fff;text-decoration:none;margin-right:12px;transition:all 0.2s ease}
        #efh-overlay .btn:hover{background:#3B82F6;transform:translateY(-1px)}
        #efh-overlay .back-link{position:fixed;top:20px;left:20px;background:rgba(0,0,0,0.8);color:#fff;padding:8px 16px;border-radius:20px;text-decoration:none;font-size:14px}
      </style>
      <div id="efh-overlay" role="main" aria-label="\${overlayTitle} page">
        <a href="/" class="back-link">← Back to \${CFG.brandMain}</a>
        <div class="container">
          <h1>\${overlayTitle}</h1>
          <p class="subtitle">\${CFG.brandSub} — Partner to \${CFG.brandMain}</p>
          <p>Supporting workforce training, apprenticeships, and community programs.</p>
          \${path === '/donate' ? 
            '<p><a class="btn" href="#" onclick="alert(\\'Donation system coming soon!\\')">Donate Now</a></p>' :
            '<p><a class="btn" href="/contact">Contact Us</a> <a class="btn" href="/services">Our Services</a></p>'
          }
        </div>
      </div>\`;
    
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
    document.getElementById('efh-overlay')?.setAttribute('tabindex', '-1');
  }

  // ===== ACCESSIBILITY: AUTO-FILL MISSING ALT TEXT =====
  try {
    Array.from(document.querySelectorAll('img')).forEach((img, i) => {
      if (!img.alt || !img.alt.trim()) {
        img.alt = \`\${CFG.brandMain} image \${i + 1}\`;
      }
    });
  } catch (e) {
    console.warn('Alt text auto-fill failed:', e);
  }

  // ===== ADMIN HELPER (DEV MODE ONLY) =====
  if (location.search.includes('debug=1')) {
    const debugInfo = document.createElement('div');
    debugInfo.style.cssText = \`
      position:fixed;top:50px;right:10px;z-index:2147483647;
      background:#000;color:#0f0;padding:8px;border-radius:4px;
      font:10px monospace;max-width:300px;
    \`;
    debugInfo.innerHTML = \`
      <strong>EFH Domain Mixer Debug</strong><br>
      Host: \${host}<br>
      Path: \${path}<br>
      IsMain: \${isMain}<br>
      IsSub: \${isSub}<br>
      Canonical: \${canonicalHref}<br>
      Config: \${JSON.stringify(CFG, null, 1)}
    \`;
    document.body.appendChild(debugInfo);
  }

  console.log('✅ EFH Config-Driven Domain Mixer active', { 
    host, path, isMain, isSub, canonicalHref, CFG 
  });
});
`;

console.log('🎯 CONFIG-DRIVEN DOMAIN MIXER - CMS POWERED');
console.log('===========================================');
console.log('');
console.log('📋 MASTER PAGE CODE (CMS Configuration):');
console.log('=========================================');
console.log(configDrivenDomainMixer);
console.log('');
console.log('✅ CMS COLLECTION SETUP:');
console.log('========================');
console.log('Collection Name: SiteSettings (Site content)');
console.log('Permissions: Public Read');
console.log('');
console.log('Required Fields:');
console.log('• mainDomain (Text): elevate4humanity.org');
console.log('• subDomain (Text): selfishincsupport.org');
console.log('• brandMain (Text): Elevate for Humanity');
console.log('• brandSub (Text): Selfish Inc Support');
console.log('• showBrandBar (Boolean): ✅');
console.log('• subNoteOnHome (Boolean): ✅');
console.log('• redirectRoot (Boolean): ✅');
console.log('• rewriteLinks (Boolean): ✅');
console.log('• rewriteForms (Boolean): ✅');
console.log('• selfishOverlay (Boolean): ⬜️');
console.log('');
console.log('🚀 ENHANCED FEATURES:');
console.log('• CMS-driven configuration (no code edits)');
console.log('• Fallback to safe defaults if CMS unavailable');
console.log('• Enhanced animations and transitions');
console.log('• Improved accessibility and UX');
console.log('• Debug mode (?debug=1 for development)');
console.log('• Session storage for user preferences');
console.log('• ESC key support for canceling redirects');
console.log('• Professional styling and interactions');
console.log('');
console.log('🎯 CONFIGURATION WORKFLOW:');
console.log('1. Create SiteSettings collection in Content Manager');
console.log('2. Add one record with your domain configuration');
console.log('3. Set permissions to Public Read');
console.log('4. Paste Master Page code and publish');
console.log('5. Adjust settings in CMS anytime (no code changes)');
console.log('');
console.log('💡 SUBDOMAIN MIGRATION PATH:');
console.log('• Current: selfishincsupport.org (separate domain)');
console.log('• Future: support.elevate4humanity.org (true subdomain)');
console.log('• Change subDomain field in CMS when ready');
console.log('• No code changes required');
console.log('');
console.log('🔍 DEBUG MODE:');
console.log('Add ?debug=1 to any URL to see configuration details');
console.log('');
console.log('🏆 ULTIMATE NO-CODE DOMAIN ARCHITECTURE!');

// CMS Collection Schema
const cmsCollectionSchema = {
  name: 'SiteSettings',
  type: 'Site content',
  permissions: {
    read: 'Public',
    write: 'Admin'
  },
  fields: [
    { name: 'mainDomain', type: 'Text', required: true, default: 'elevate4humanity.org' },
    { name: 'subDomain', type: 'Text', required: true, default: 'selfishincsupport.org' },
    { name: 'brandMain', type: 'Text', required: true, default: 'Elevate for Humanity' },
    { name: 'brandSub', type: 'Text', required: true, default: 'Selfish Inc Support' },
    { name: 'showBrandBar', type: 'Boolean', required: true, default: true },
    { name: 'subNoteOnHome', type: 'Boolean', required: true, default: true },
    { name: 'redirectRoot', type: 'Boolean', required: true, default: true },
    { name: 'rewriteLinks', type: 'Boolean', required: true, default: true },
    { name: 'rewriteForms', type: 'Boolean', required: true, default: true },
    { name: 'selfishOverlay', type: 'Boolean', required: true, default: false }
  ]
};

console.log('');
console.log('📋 CMS COLLECTION SCHEMA:');
console.log('=========================');
console.log(JSON.stringify(cmsCollectionSchema, null, 2));

export { configDrivenDomainMixer, cmsCollectionSchema };