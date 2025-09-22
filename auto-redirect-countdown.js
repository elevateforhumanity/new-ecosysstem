/**
 * Auto-Redirect with Cancelable Countdown
 * Smart redirect from subdomain root to main domain with user control
 */

const autoRedirectCountdown = `
// ===== Auto-redirect Selfish ROOT -> Elevate (3s, cancelable) =====
const CUR_HOST = location.hostname.replace(/^www\\./,'').toLowerCase();
const CUR_PATH = (location.pathname || '').replace(/\\/+$/,'') || '/';

if (CUR_HOST === SUB_DOMAIN && CUR_PATH === '/') {
  // allow quick disable via query: ?stay=1 or ?no-redirect=1
  const q = location.search;
  const disabled = /(?:^|[?&])(stay|no-redirect)=1\\b/i.test(q);
  if (!disabled) {
    // simple countdown UI
    const wrap = document.createElement('div');
    wrap.id = 'efh-redirect-bar';
    wrap.style.cssText = \`
      position:fixed;left:50%;transform:translateX(-50%);
      bottom:16px;z-index:2147483647;background:#0f172a;color:#fff;
      padding:10px 12px;border-radius:10px;font:13px system-ui;display:flex;gap:10px;align-items:center;
      box-shadow:0 4px 12px rgba(0,0,0,0.3);animation:efh-slide-up 0.3s ease-out
    \`;
    
    // Add slide-up animation
    const style = document.createElement('style');
    style.textContent = \`
      @keyframes efh-slide-up {
        from { transform: translateX(-50%) translateY(100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      @keyframes efh-fade-out {
        from { opacity: 1; transform: translateX(-50%) scale(1); }
        to { opacity: 0; transform: translateX(-50%) scale(0.9); }
      }
    \`;
    document.head.appendChild(style);
    
    wrap.innerHTML = \`
      <span>Redirecting to <strong>\${MAIN_DOMAIN}</strong> in <span id="efh-ctr">3</span>s…</span>
      <button id="efh-stay" style="padding:6px 10px;border-radius:8px;border:1px solid #fff;background:transparent;color:#fff;cursor:pointer;transition:all 0.2s ease">
        Stay here
      </button>
    \`;
    document.body.appendChild(wrap);

    // Enhanced button hover effect
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
    }

    let n = 3;
    const ctrEl = () => document.getElementById('efh-ctr');
    const tick = setInterval(() => {
      n -= 1;
      if (ctrEl()) {
        ctrEl().textContent = String(n);
        // Add urgency styling as countdown gets lower
        if (n <= 1) {
          ctrEl().style.color = '#f59e0b';
          ctrEl().style.fontWeight = 'bold';
        }
      }
      if (n <= 0) {
        clearInterval(tick);
        // Smooth fade out before redirect
        if (wrap) {
          wrap.style.animation = 'efh-fade-out 0.3s ease-out';
          setTimeout(() => {
            location.replace(\`https://\${MAIN_DOMAIN}/\`);
          }, 300);
        } else {
          location.replace(\`https://\${MAIN_DOMAIN}/\`);
        }
      }
    }, 1000);

    // Stay button functionality
    document.getElementById('efh-stay')?.addEventListener('click', () => {
      clearInterval(tick);
      // Smooth fade out
      wrap.style.animation = 'efh-fade-out 0.3s ease-out';
      setTimeout(() => {
        wrap.remove();
        
        // Add a small "stayed" indicator
        const stayedIndicator = document.createElement('div');
        stayedIndicator.style.cssText = \`
          position:fixed;right:16px;bottom:16px;z-index:2147483647;
          background:#16a34a;color:#fff;padding:8px 12px;border-radius:8px;
          font:12px system-ui;animation:efh-slide-up 0.3s ease-out
        \`;
        stayedIndicator.textContent = \`Staying on \${SUB_DOMAIN}\`;
        document.body.appendChild(stayedIndicator);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
          stayedIndicator.style.animation = 'efh-fade-out 0.3s ease-out';
          setTimeout(() => stayedIndicator.remove(), 300);
        }, 3000);
      }, 300);
    });

    // Keyboard shortcut: ESC to cancel redirect
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        document.getElementById('efh-stay')?.click();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);

    console.log('✅ Auto-redirect countdown active (3s to main domain, ESC or click to cancel)');
  } else {
    console.log('✅ Auto-redirect disabled via query parameter');
  }
}
`;

console.log('⏰ AUTO-REDIRECT WITH CANCELABLE COUNTDOWN');
console.log('==========================================');
console.log('');
console.log('📋 ADD THIS TO YOUR MASTER PAGE CODE:');
console.log('(Insert after the aggressive rewriter section)');
console.log('==============================================');
console.log(autoRedirectCountdown);
console.log('');
console.log('✅ ENHANCED FEATURES:');
console.log('• 3-second countdown with visual timer');
console.log('• Smooth slide-up animation on appear');
console.log('• Cancelable with "Stay here" button');
console.log('• ESC key shortcut to cancel');
console.log('• Query parameter bypass (?stay=1 or ?no-redirect=1)');
console.log('• Hover effects on cancel button');
console.log('• Urgency styling as countdown decreases');
console.log('• Smooth fade-out animations');
console.log('• "Stayed" confirmation indicator');
console.log('');
console.log('🎯 ACTIVATION CONDITIONS:');
console.log('• Only on subdomain root (selfishincsupport.org/)');
console.log('• Skipped if ?stay=1 or ?no-redirect=1 in URL');
console.log('• Automatic redirect to main domain after 3 seconds');
console.log('');
console.log('🚀 USER EXPERIENCE:');
console.log('• Clear countdown timer');
console.log('• Easy cancellation options');
console.log('• Smooth animations');
console.log('• Keyboard accessibility');
console.log('• Non-intrusive design');
console.log('');
console.log('💡 BYPASS OPTIONS:');
console.log('• URL: selfishincsupport.org/?stay=1');
console.log('• URL: selfishincsupport.org/?no-redirect=1');
console.log('• Button: Click "Stay here"');
console.log('• Keyboard: Press ESC key');

// Complete integration example
const completeIntegration = `
// Complete Master Page with Auto-Redirect Countdown
$w.onReady(() => {
  // ==== CONFIG ====
  const MAIN_DOMAIN = 'elevate4humanity.org';
  const SUB_DOMAIN  = 'selfishincsupport.org';
  const BRAND_MAIN  = 'Elevate for Humanity';
  const BRAND_SUB   = 'Selfish Inc Support';

  // ==== AGGRESSIVE LINK & FORM REWRITER ====
  // [Previous aggressive rewriter code here]

  // ==== AUTO-REDIRECT WITH COUNTDOWN ====
  ${autoRedirectCountdown}

  // ==== DOMAIN MIXER CORE ====
  // [Previous domain mixer code here]

  console.log('✅ Complete domain architecture with auto-redirect active');
});
`;

console.log('');
console.log('📋 COMPLETE INTEGRATION EXAMPLE:');
console.log('=================================');
console.log(completeIntegration);

export { autoRedirectCountdown, completeIntegration };