// COMPLETE MASTER PAGE CODE WITH ADMIN PANEL
// Config-Driven Domain Architecture with Secure Admin Management
// Paste this entire code into your Wix Master Page

import { whoami, getSettings, saveSettings } from 'backend/adminConfig.jsw';

let CONFIG = {
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

let isDebugMode = false;
let isAdminMode = false;
let userInfo = null;

// Initialize system
$w.onReady(async () => {
  try {
    // Load configuration from CMS
    const settingsResult = await getSettings();
    if (settingsResult.success) {
      CONFIG = { ...CONFIG, ...settingsResult.settings };
    }
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    isDebugMode = urlParams.get('debug') === '1';
    isAdminMode = urlParams.get('admin') === 'edit';
    
    // Get user info for admin features
    userInfo = await whoami();
    
    // Initialize appropriate mode
    if (isAdminMode && userInfo.isAdmin) {
      initializeAdminPanel();
    } else {
      initializeDomainSystem();
    }
    
    if (isDebugMode) {
      showDebugInfo();
    }
  } catch (error) {
    console.error('Initialization error:', error);
    initializeDomainSystem(); // Fallback to normal operation
  }
});

function initializeDomainSystem() {
  const currentDomain = window.location.hostname;
  const isSubDomain = currentDomain.includes(CONFIG.subDomain.replace('https://', '').replace('http://', ''));
  
  // Add brand bar
  if (CONFIG.showBrandBar) {
    addBrandBar(isSubDomain);
  }
  
  // Add partner note on main domain homepage
  if (!isSubDomain && CONFIG.subNoteOnHome && isHomePage()) {
    addPartnerNote();
  }
  
  // Handle subdomain redirects
  if (isSubDomain && CONFIG.redirectRoot && isHomePage()) {
    showRedirectCountdown();
  }
  
  // Rewrite links and forms
  if (CONFIG.rewriteLinks) {
    rewriteLinks(isSubDomain);
  }
  
  if (CONFIG.rewriteForms) {
    rewriteForms(isSubDomain);
  }
  
  // Add SEO optimization
  addCanonicalTags(isSubDomain);
  
  // Add CSS for animations
  addSystemCSS();
}

function initializeAdminPanel() {
  document.body.innerHTML = `
    <div id="adminPanel" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 30px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    ">
      <h1 style="color: #2c3e50; margin-bottom: 30px; text-align: center;">
        🔧 Domain Configuration Admin Panel
      </h1>
      
      <div id="userInfo" style="
        background: #e8f5e8;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 30px;
        border-left: 4px solid #27ae60;
      ">
        <strong>Logged in as:</strong> ${userInfo.roles.join(', ')}<br>
        <strong>Admin Access:</strong> ✅ Granted
      </div>
      
      <form id="configForm" style="display: grid; gap: 20px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #34495e;">
              Main Domain:
            </label>
            <input type="text" id="mainDomain" value="${CONFIG.mainDomain}" style="
              width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px;
              font-size: 14px; transition: border-color 0.3s;
            ">
          </div>
          
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #34495e;">
              Sub Domain:
            </label>
            <input type="text" id="subDomain" value="${CONFIG.subDomain}" style="
              width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px;
              font-size: 14px; transition: border-color 0.3s;
            ">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #34495e;">
              Main Brand:
            </label>
            <input type="text" id="brandMain" value="${CONFIG.brandMain}" style="
              width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px;
              font-size: 14px; transition: border-color 0.3s;
            ">
          </div>
          
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #34495e;">
              Sub Brand:
            </label>
            <input type="text" id="brandSub" value="${CONFIG.brandSub}" style="
              width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px;
              font-size: 14px; transition: border-color 0.3s;
            ">
          </div>
        </div>
        
        <div style="
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 15px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        ">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="showBrandBar" ${CONFIG.showBrandBar ? 'checked' : ''}>
            <span>Show Brand Bar</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="subNoteOnHome" ${CONFIG.subNoteOnHome ? 'checked' : ''}>
            <span>Sub Note on Home</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="redirectRoot" ${CONFIG.redirectRoot ? 'checked' : ''}>
            <span>Redirect Root</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="rewriteLinks" ${CONFIG.rewriteLinks ? 'checked' : ''}>
            <span>Rewrite Links</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="rewriteForms" ${CONFIG.rewriteForms ? 'checked' : ''}>
            <span>Rewrite Forms</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="selfishOverlay" ${CONFIG.selfishOverlay ? 'checked' : ''}>
            <span>Selfish Overlay</span>
          </label>
        </div>
        
        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
          <button type="button" id="saveBtn" style="
            background: #27ae60; color: white; border: none; padding: 12px 24px;
            border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s;
          ">💾 Save Configuration</button>
          
          <button type="button" id="reloadBtn" style="
            background: #3498db; color: white; border: none; padding: 12px 24px;
            border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s;
          ">🔄 Reload</button>
          
          <button type="button" id="copyBtn" style="
            background: #9b59b6; color: white; border: none; padding: 12px 24px;
            border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s;
          ">📋 Copy JSON</button>
        </div>
      </form>
      
      <div id="status" style="
        margin-top: 20px; padding: 15px; border-radius: 8px; text-align: center;
        display: none;
      "></div>
      
      <div style="
        margin-top: 30px; padding: 20px; background: #f1f2f6; border-radius: 8px;
        border-left: 4px solid #3498db;
      ">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Quick Actions:</h3>
        <p style="margin: 5px 0;">
          <strong>View Site:</strong> 
          <a href="/" style="color: #3498db;">Return to Homepage</a>
        </p>
        <p style="margin: 5px 0;">
          <strong>Debug Mode:</strong> 
          <a href="/?debug=1" style="color: #3498db;">Enable Debug View</a>
        </p>
        <p style="margin: 5px 0;">
          <strong>Canonical URL:</strong> 
          <code style="background: #fff; padding: 4px 8px; border-radius: 4px;">
            https://${CONFIG.mainDomain}${window.location.pathname}
          </code>
        </p>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('saveBtn').onclick = saveConfiguration;
  document.getElementById('reloadBtn').onclick = () => window.location.reload();
  document.getElementById('copyBtn').onclick = copyConfigJSON;
  
  // Add hover effects
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.onmouseenter = () => btn.style.transform = 'translateY(-2px)';
    btn.onmouseleave = () => btn.style.transform = 'translateY(0)';
  });
}

async function saveConfiguration() {
  const statusDiv = document.getElementById('status');
  statusDiv.style.display = 'block';
  statusDiv.style.background = '#fff3cd';
  statusDiv.style.color = '#856404';
  statusDiv.innerHTML = '⏳ Saving configuration...';
  
  try {
    const newConfig = {
      mainDomain: document.getElementById('mainDomain').value,
      subDomain: document.getElementById('subDomain').value,
      brandMain: document.getElementById('brandMain').value,
      brandSub: document.getElementById('brandSub').value,
      showBrandBar: document.getElementById('showBrandBar').checked,
      subNoteOnHome: document.getElementById('subNoteOnHome').checked,
      redirectRoot: document.getElementById('redirectRoot').checked,
      rewriteLinks: document.getElementById('rewriteLinks').checked,
      rewriteForms: document.getElementById('rewriteForms').checked,
      selfishOverlay: document.getElementById('selfishOverlay').checked
    };
    
    const result = await saveSettings(newConfig);
    
    if (result.success) {
      statusDiv.style.background = '#d4edda';
      statusDiv.style.color = '#155724';
      statusDiv.innerHTML = '✅ Configuration saved successfully! Refresh your site to see changes.';
      CONFIG = { ...CONFIG, ...newConfig };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    statusDiv.style.background = '#f8d7da';
    statusDiv.style.color = '#721c24';
    statusDiv.innerHTML = `❌ Error saving: ${error.message}`;
  }
}

function copyConfigJSON() {
  const config = {
    mainDomain: document.getElementById('mainDomain').value,
    subDomain: document.getElementById('subDomain').value,
    brandMain: document.getElementById('brandMain').value,
    brandSub: document.getElementById('brandSub').value,
    showBrandBar: document.getElementById('showBrandBar').checked,
    subNoteOnHome: document.getElementById('subNoteOnHome').checked,
    redirectRoot: document.getElementById('redirectRoot').checked,
    rewriteLinks: document.getElementById('rewriteLinks').checked,
    rewriteForms: document.getElementById('rewriteForms').checked,
    selfishOverlay: document.getElementById('selfishOverlay').checked
  };
  
  navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  
  const statusDiv = document.getElementById('status');
  statusDiv.style.display = 'block';
  statusDiv.style.background = '#d1ecf1';
  statusDiv.style.color = '#0c5460';
  statusDiv.innerHTML = '📋 Configuration JSON copied to clipboard!';
}

function addBrandBar(isSubDomain) {
  const brandBar = document.createElement('div');
  brandBar.id = 'domainBrandBar';
  brandBar.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; z-index: 10000;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white; text-align: center; padding: 8px 15px;
    font-size: 14px; font-weight: 500; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transform: translateY(-100%); transition: transform 0.5s ease;
  `;
  
  if (isSubDomain) {
    brandBar.innerHTML = `
      🤝 <strong>${CONFIG.brandSub}</strong> - Partner site of 
      <a href="https://${CONFIG.mainDomain}" style="color: #fff; text-decoration: underline;">
        ${CONFIG.brandMain}
      </a>
    `;
  } else {
    brandBar.innerHTML = `
      🏠 <strong>${CONFIG.brandMain}</strong> - Main site
      ${CONFIG.subNoteOnHome ? `| Partner: <a href="https://${CONFIG.subDomain}" style="color: #fff; text-decoration: underline;">${CONFIG.brandSub}</a>` : ''}
    `;
  }
  
  document.body.appendChild(brandBar);
  document.body.style.paddingTop = '45px';
  
  setTimeout(() => {
    brandBar.style.transform = 'translateY(0)';
  }, 100);
}

function addPartnerNote() {
  const note = document.createElement('div');
  note.style.cssText = `
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white; padding: 15px; margin: 20px 0; border-radius: 8px;
    text-align: center; font-weight: 500; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    animation: slideInFromTop 0.6s ease-out;
  `;
  note.innerHTML = `
    🤝 <strong>Partner Network:</strong> 
    Visit our partner site <a href="https://${CONFIG.subDomain}" 
    style="color: #fff; text-decoration: underline; font-weight: 600;">
    ${CONFIG.brandSub}</a> for specialized support services.
  `;
  
  const firstSection = document.querySelector('section, .main-content, #content, main');
  if (firstSection) {
    firstSection.parentNode.insertBefore(note, firstSection);
  }
}

function showRedirectCountdown() {
  const overlay = document.createElement('div');
  overlay.id = 'redirectOverlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); z-index: 50000; display: flex;
    align-items: center; justify-content: center; animation: fadeIn 0.3s ease;
  `;
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white; padding: 40px; border-radius: 15px; text-align: center;
    max-width: 500px; margin: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: slideInFromBottom 0.5s ease-out;
  `;
  
  modal.innerHTML = `
    <h2 style="color: #2c3e50; margin-bottom: 20px;">🔄 Redirecting to Main Site</h2>
    <p style="color: #7f8c8d; margin-bottom: 30px; line-height: 1.6;">
      You'll be redirected to <strong>${CONFIG.brandMain}</strong> in 
      <span id="countdown" style="color: #e74c3c; font-weight: bold; font-size: 24px;">3</span> seconds.
    </p>
    <div style="display: flex; gap: 15px; justify-content: center;">
      <button id="cancelRedirect" style="
        background: #95a5a6; color: white; border: none; padding: 12px 24px;
        border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;
      ">Stay Here</button>
      <button id="goNow" style="
        background: #3498db; color: white; border: none; padding: 12px 24px;
        border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;
      ">Go Now</button>
    </div>
    <p style="color: #bdc3c7; font-size: 12px; margin-top: 20px;">
      Press ESC to cancel | This choice will be remembered
    </p>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  let countdown = 3;
  const countdownEl = document.getElementById('countdown');
  
  const timer = setInterval(() => {
    countdown--;
    countdownEl.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(timer);
      window.location.href = `https://${CONFIG.mainDomain}`;
    }
  }, 1000);
  
  document.getElementById('cancelRedirect').onclick = () => {
    clearInterval(timer);
    overlay.remove();
    sessionStorage.setItem('skipRedirect', 'true');
  };
  
  document.getElementById('goNow').onclick = () => {
    clearInterval(timer);
    window.location.href = `https://${CONFIG.mainDomain}`;
  };
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      clearInterval(timer);
      overlay.remove();
      sessionStorage.setItem('skipRedirect', 'true');
    }
  });
}

function rewriteLinks(isSubDomain) {
  if (!isSubDomain) return;
  
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      link.setAttribute('href', `https://${CONFIG.mainDomain}${href}`);
      link.setAttribute('data-rewritten', 'true');
    }
  });
}

function rewriteForms(isSubDomain) {
  if (!isSubDomain) return;
  
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const action = form.getAttribute('action');
    if (action && !action.startsWith('http')) {
      form.setAttribute('action', `https://${CONFIG.mainDomain}${action}`);
      form.setAttribute('data-rewritten', 'true');
    }
  });
}

function addCanonicalTags(isSubDomain) {
  if (isSubDomain) {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `https://${CONFIG.mainDomain}${window.location.pathname}`;
    document.head.appendChild(canonical);
  }
}

function addSystemCSS() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideInFromTop {
      from { transform: translateY(-30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideInFromBottom {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    #adminPanel input:focus {
      border-color: #3498db !important;
      outline: none;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
    
    #adminPanel button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
  `;
  document.head.appendChild(style);
}

function showDebugInfo() {
  const debug = document.createElement('div');
  debug.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; background: #2c3e50;
    color: white; padding: 15px; border-radius: 8px; font-family: monospace;
    font-size: 12px; max-width: 300px; z-index: 10000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;
  debug.innerHTML = `
    <strong>🐛 Debug Info</strong><br>
    Domain: ${window.location.hostname}<br>
    Main: ${CONFIG.mainDomain}<br>
    Sub: ${CONFIG.subDomain}<br>
    Brand Bar: ${CONFIG.showBrandBar}<br>
    Redirect: ${CONFIG.redirectRoot}<br>
    Rewrite Links: ${CONFIG.rewriteLinks}<br>
    Admin: ${userInfo ? userInfo.isAdmin : 'N/A'}
  `;
  document.body.appendChild(debug);
}

function isHomePage() {
  return window.location.pathname === '/' || window.location.pathname === '';
}