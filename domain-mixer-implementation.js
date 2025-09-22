/**
 * Domain Mixer Implementation
 * Aggressive Master Page snippet for proper domain relationship
 */

const domainMixerCode = `
// EFH x SelfishIncSupport — Domain Mixer & Canonical Guard (Master Page only)
$w.onReady(() => {
  // ==== CONFIG ====
  const MAIN_DOMAIN = 'elevate4humanity.org';       // primary brand
  const SUB_DOMAIN  = 'selfishincsupport.org';      // support brand (will be treated as subdomain/partner)
  const BRAND_MAIN  = 'Elevate for Humanity';
  const BRAND_SUB   = 'Selfish Inc Support';
  const AUTO_REDIRECT_ROOT = true; // if on SUB domain at "/", auto-send to MAIN after 3s

  // ==== Context ====
  const host = (location.hostname || '').replace(/^www\\./,'').toLowerCase();
  const path = (location.pathname || '').replace(/\\/+$/,'') || '/';
  const isMain = host === MAIN_DOMAIN;
  const isSub  = host === SUB_DOMAIN;

  // ==== Helpers ====
  const ensureMeta = (key, val, useProperty=false) => {
    const sel = useProperty ? \`meta[property="\${key}"]\` : \`meta[name="\${key}"]\`;
    let el = document.head.querySelector(sel);
    if (!el) { el = document.createElement('meta'); useProperty ? el.setAttribute('property', key) : el.setAttribute('name', key); document.head.appendChild(el); }
    if (val) el.setAttribute('content', val);
  };
  const ensureCanonical = href => {
    let c = document.head.querySelector('link[rel="canonical"]');
    if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c); }
    c.href = href;
  };

  // ==== Canonical strategy (avoid duplicate SEO) ====
  // Always canonize to the MAIN domain version of the current path.
  const canonicalHref = \`https://\${MAIN_DOMAIN}\${path}\${location.search}\`;
  ensureCanonical(canonicalHref);
  ensureMeta('og:url', canonicalHref, true);

  // Minimal SEO hardening (safe even if Editor SEO is set)
  if (!document.title || !document.title.trim())
    document.title = BRAND_MAIN;
  ensureMeta('description', 'Elevate for Humanity — workforce training, apprenticeships, and community support.');
  ensureMeta('og:title', document.title || BRAND_MAIN, true);
  ensureMeta('og:description', 'Elevate for Humanity — workforce training, apprenticeships, and community support.', true);

  // ==== Brand bar (explains relationship & offers quick switch) ====
  const barHtml = \`
    <div id="efh-brandbar" style="position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#0f172a;color:#fff;padding:8px 12px;text-align:center;font:13px/1.2 system-ui">
      \${
        isMain
          ? \`Main site: <strong>\${BRAND_MAIN}</strong> • Partner/Subdomain: <a href="https://\${SUB_DOMAIN}" style="color:#fff;text-decoration:underline">\${SUB_DOMAIN}</a>\`
          : \`You're viewing the partner/subdomain <strong>\${SUB_DOMAIN}</strong> • Main site: <a href="https://\${MAIN_DOMAIN}" style="color:#fff;text-decoration:underline">\${MAIN_DOMAIN}</a>
             <button id="efh-switch-main" style="margin-left:8px;padding:4px 10px;border-radius:8px;border:1px solid #fff;background:transparent;color:#fff">Go to main</button>\`
      }
    </div>\`;
  document.body.insertAdjacentHTML('afterbegin', barHtml);
  document.body.style.paddingTop = '42px';

  if (!isMain) {
    document.getElementById('efh-switch-main')?.addEventListener('click', () => {
      location.href = \`https://\${MAIN_DOMAIN}\${path}\${location.search}\${location.hash}\`;
    });
    if (AUTO_REDIRECT_ROOT && path === '/') {
      setTimeout(() => location.replace(\`https://\${MAIN_DOMAIN}/\`), 3000);
    }
  }

  // ==== Elevate homepage note (shows only on MAIN "/") ====
  if (isMain && path === '/') {
    const note = \`
      <section id="subdomain-note" style="max-width:1100px;margin:12px auto 0;padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;font:15px system-ui">
        <strong>\${BRAND_SUB}</strong> operates as our support subdomain. Visit
        <a href="https://\${SUB_DOMAIN}" style="text-decoration:underline">https://\${SUB_DOMAIN}</a>.
      </section>\`;
    // Insert just under the brand bar
    document.body.insertAdjacentHTML('afterbegin', note);
  }

  // ==== SelfishInc dedicated page (enhanced for domain relationship) ====
  const selfishPath = (location.pathname || '').replace(/\\/+$/,'').toLowerCase();
  const selfishSlugs = new Set(['/selfish', '/selfishinc']);
  if (selfishSlugs.has(selfishPath)) {
    
    // Enhanced SEO for SelfishInc page within main domain
    const SELFISH_TITLE = 'SelfishInc - Professional Business Consulting | Elevate for Humanity';
    const SELFISH_DESC = 'Transform your business with SelfishInc expert consulting. Part of the Elevate for Humanity network providing personalized strategies and proven results.';
    document.title = SELFISH_TITLE;
    
    ensureMeta('description', SELFISH_DESC);
    ensureMeta('og:title', SELFISH_TITLE, true);
    ensureMeta('og:description', SELFISH_DESC, true);
    ensureMeta('og:type', 'website', true);
    ensureMeta('og:image', 'https://static.wixstatic.com/media/selfishinc-hero-4k.jpg', true);
    
    // Professional SelfishInc page implementation
    const selfishHTML = \`
    <style>
      #selfishinc-professional{position:fixed;inset:0;z-index:2147483646;background:#fff;color:#111;overflow:auto;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;padding-top:42px}
      .selfish-hero{background:linear-gradient(135deg,#1E3A8A 0%,#3B82F6 100%);color:white;padding:80px 20px;text-align:center;position:relative}
      .selfish-hero::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=1080&fit=crop') center/cover;opacity:0.2;z-index:-1}
      .hero-content{max-width:800px;margin:0 auto;position:relative;z-index:2}
      .hero-title{font-size:3.5rem;font-weight:700;margin-bottom:1rem;line-height:1.2}
      .hero-subtitle{font-size:1.5rem;margin-bottom:2rem;opacity:0.9}
      .cta-button{background:#F59E0B;color:white;padding:16px 32px;border:none;border-radius:8px;font-size:18px;font-weight:600;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 12px rgba(245,158,11,0.3);text-decoration:none;display:inline-block}
      .cta-button:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(245,158,11,0.4)}
      .container{max-width:1200px;margin:0 auto;padding:0 20px}
      .section{padding:80px 0}
      .section-title{font-size:2.5rem;font-weight:700;text-align:center;margin-bottom:3rem;color:#1E3A8A}
      .services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem}
      .service-card{background:white;padding:2rem;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);transition:transform 0.3s ease;border:1px solid #e5e7eb}
      .service-card:hover{transform:translateY(-5px)}
      .service-icon{width:60px;height:60px;background:#3B82F6;border-radius:12px;margin-bottom:1rem;display:flex;align-items:center;justify-content:center;font-size:24px;color:white}
      .service-title{font-size:1.5rem;font-weight:600;margin-bottom:1rem;color:#1E3A8A}
      .back-link{position:fixed;top:50px;left:20px;background:rgba(0,0,0,0.8);color:white;padding:8px 16px;border-radius:20px;text-decoration:none;font-size:14px;z-index:1000}
      .network-badge{position:fixed;top:50px;right:20px;background:#F59E0B;color:white;padding:8px 16px;border-radius:20px;font-size:12px;z-index:1000}
      @media(max-width:768px){.hero-title{font-size:2.5rem}.services-grid{grid-template-columns:1fr}}
    </style>
    
    <div id="selfishinc-professional" role="main">
      <a href="/" class="back-link">← Back to Elevate</a>
      <div class="network-badge">Part of Elevate for Humanity Network</div>
      
      <section class="selfish-hero">
        <div class="hero-content">
          <h1 class="hero-title">Transform Your Business with SelfishInc</h1>
          <p class="hero-subtitle">Professional consulting within the Elevate for Humanity network</p>
          <a href="#contact" class="cta-button">Get Started Today</a>
        </div>
      </section>
      
      <section class="section">
        <div class="container">
          <h2 class="section-title">Comprehensive Business Solutions</h2>
          <div class="services-grid">
            <div class="service-card">
              <div class="service-icon">📊</div>
              <h3 class="service-title">Strategic Planning</h3>
              <p>Develop clear roadmaps for sustainable growth with measurable goals and competitive advantage.</p>
            </div>
            <div class="service-card">
              <div class="service-icon">⚙️</div>
              <h3 class="service-title">Operational Excellence</h3>
              <p>Optimize processes for maximum efficiency, reduced costs, and improved quality delivery.</p>
            </div>
            <div class="service-card">
              <div class="service-icon">💻</div>
              <h3 class="service-title">Digital Transformation</h3>
              <p>Leverage technology for competitive advantage with modern systems and automated processes.</p>
            </div>
            <div class="service-card">
              <div class="service-icon">👥</div>
              <h3 class="service-title">Leadership Development</h3>
              <p>Build strong teams and effective leadership for sustainable organizational growth.</p>
            </div>
            <div class="service-card">
              <div class="service-icon">💰</div>
              <h3 class="service-title">Financial Optimization</h3>
              <p>Maximize profitability and cash flow with strategic financial planning and analysis.</p>
            </div>
            <div class="service-card">
              <div class="service-icon">🚀</div>
              <h3 class="service-title">Market Expansion</h3>
              <p>Identify and capture new opportunities for revenue growth and market penetration.</p>
            </div>
          </div>
          
          <div style="text-align:center;margin-top:3rem;padding:2rem;background:#f8fafc;border-radius:12px">
            <h3 style="color:#1E3A8A;margin-bottom:1rem">Need Support?</h3>
            <p style="margin-bottom:1rem">For technical support and additional resources, visit our dedicated support site:</p>
            <a href="https://\${SUB_DOMAIN}" class="cta-button" style="background:#6B7280">Visit \${BRAND_SUB}</a>
          </div>
        </div>
      </section>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', selfishHTML);
    
    const page = document.getElementById('selfishinc-professional');
    if (page) page.setAttribute('tabindex', '-1'), page.focus();
    
    console.log('✅ SelfishInc professional page deployed within Elevate network');
  }

  // ==== Small polish: add ALT text if missing (accessibility) ====
  try {
    Array.from(document.querySelectorAll('img')).forEach((img, i) => {
      if (!img.alt || !img.alt.trim()) img.alt = \`\${BRAND_MAIN} image \${i + 1}\`;
    });
  } catch {}

  console.log('✅ Domain Mixer active:', { host, path, canonicalHref, isMain, isSub });
});
`;

console.log('🤖 DOMAIN MIXER IMPLEMENTATION');
console.log('==============================');
console.log('');
console.log('📋 MASTER PAGE CODE (paste in Site Code):');
console.log('==========================================');
console.log(domainMixerCode);
console.log('');
console.log('✅ FEATURES IMPLEMENTED:');
console.log('• Clear brand relationship explanation');
console.log('• Canonical tags for SEO optimization');
console.log('• Auto-redirect from subdomain root (optional)');
console.log('• Enhanced SelfishInc page with network branding');
console.log('• Cross-domain navigation and support links');
console.log('• Professional domain architecture');
console.log('');
console.log('🎯 DOMAIN STRUCTURE:');
console.log('• Main: elevate4humanity.org (primary brand)');
console.log('• Partner: selfishincsupport.org (support subdomain)');
console.log('• SelfishInc: elevate4humanity.org/selfish (dedicated page)');
console.log('');
console.log('🚀 READY FOR DEPLOYMENT');

export { domainMixerCode };