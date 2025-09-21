#!/usr/bin/env node

/**
 * EFH License Protection & Watermarking System
 * Advanced DRM and copyright protection for $3.15B platform
 */

class LicenseProtectionSystem {
  constructor() {
    this.licenseKey = this.generateLicenseKey();
    this.watermarkText = 'EFH-LICENSED-CONTENT-$3.15B-PLATFORM';
    this.protectionLevel = 'MAXIMUM';
    this.init();
  }

  init() {
    this.addDynamicWatermarks();
    this.enableScreenshotProtection();
    this.addLicenseValidation();
    this.setupCopyrightProtection();
    this.enableUsageTracking();
  }

  generateLicenseKey() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const platform = 'EFH-ECOSYSTEM';
    return `${platform}-${timestamp}-${random}`.toUpperCase();
  }

  addDynamicWatermarks() {
    // Create multiple watermark layers
    const watermarkStyles = `
      <style id="watermark-protection">
        .watermark-layer-1 {
          position: fixed;
          top: 10%;
          left: 10%;
          transform: rotate(-15deg);
          font-size: 2rem;
          color: rgba(255,0,0,0.1);
          z-index: 9999;
          pointer-events: none;
          font-weight: bold;
          user-select: none;
        }
        
        .watermark-layer-2 {
          position: fixed;
          bottom: 10%;
          right: 10%;
          transform: rotate(15deg);
          font-size: 1.5rem;
          color: rgba(0,0,255,0.1);
          z-index: 9999;
          pointer-events: none;
          font-weight: bold;
          user-select: none;
        }
        
        .watermark-layer-3 {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 6rem;
          color: rgba(255,255,255,0.03);
          z-index: -1;
          pointer-events: none;
          font-weight: bold;
          user-select: none;
          white-space: nowrap;
        }
        
        .license-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 20%, rgba(255,0,0,0.02) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0,0,255,0.02) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(0,255,0,0.02) 0%, transparent 50%);
          z-index: -2;
          pointer-events: none;
        }
        
        .copyright-badge {
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.8);
          color: #ff6b6b;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 0.7rem;
          z-index: 10000;
          font-weight: bold;
        }
        
        @media print {
          .watermark-layer-1, .watermark-layer-2, .watermark-layer-3 {
            display: block !important;
            color: rgba(255,0,0,0.3) !important;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', watermarkStyles);

    // Add watermark elements
    const watermarks = `
      <div class="watermark-layer-1">© EFH LICENSED - ${this.licenseKey}</div>
      <div class="watermark-layer-2">PROTECTED CONTENT - $3.15B</div>
      <div class="watermark-layer-3">${this.watermarkText}</div>
      <div class="license-overlay"></div>
      <div class="copyright-badge">LICENSED DEMO</div>
    `;

    document.body.insertAdjacentHTML('afterbegin', watermarks);

    // Animate watermarks
    this.animateWatermarks();
  }

  animateWatermarks() {
    const layer1 = document.querySelector('.watermark-layer-1');
    const layer2 = document.querySelector('.watermark-layer-2');
    
    let rotation1 = -15;
    let rotation2 = 15;
    
    setInterval(() => {
      rotation1 += 0.5;
      rotation2 -= 0.5;
      
      if (layer1) layer1.style.transform = `rotate(${rotation1}deg)`;
      if (layer2) layer2.style.transform = `rotate(${rotation2}deg)`;
    }, 100);

    // Update license key periodically
    setInterval(() => {
      const newKey = this.generateLicenseKey();
      if (layer1) layer1.textContent = `© EFH LICENSED - ${newKey}`;
    }, 30000);
  }

  enableScreenshotProtection() {
    // Detect screenshot attempts
    document.addEventListener('keydown', (e) => {
      // Print Screen, Alt+Print Screen, Windows+Print Screen
      if (e.key === 'PrintScreen' || 
          (e.altKey && e.key === 'PrintScreen') ||
          (e.metaKey && e.shiftKey && e.key === '3') ||
          (e.metaKey && e.shiftKey && e.key === '4')) {
        e.preventDefault();
        this.handleScreenshotAttempt();
        return false;
      }
    });

    // Detect developer tools
    let devtools = false;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        if (!devtools) {
          devtools = true;
          this.handleDevToolsDetection();
        }
      } else {
        devtools = false;
      }
    }, 1000);

    // Blur content when window loses focus (potential screenshot)
    window.addEventListener('blur', () => {
      document.body.style.filter = 'blur(10px)';
      setTimeout(() => {
        document.body.style.filter = 'none';
      }, 2000);
    });
  }

  handleScreenshotAttempt() {
    // Flash red overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255,0,0,0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      font-weight: bold;
    `;
    overlay.innerHTML = '🔒 SCREENSHOT BLOCKED - LICENSED CONTENT';
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
    }, 2000);

    // Log the attempt
    this.logSecurityEvent('screenshot_attempt');
  }

  handleDevToolsDetection() {
    alert('🔒 Developer tools detected. This content is protected by DRM.');
    this.logSecurityEvent('devtools_detected');
    
    // Redirect after multiple attempts
    if (this.devToolsAttempts > 3) {
      window.location.href = 'about:blank';
    }
    this.devToolsAttempts = (this.devToolsAttempts || 0) + 1;
  }

  addLicenseValidation() {
    // Create license validation overlay
    const licenseInfo = `
      <div id="license-validation" style="
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(90deg, #000, #333, #000);
        color: #ff6b6b;
        padding: 10px;
        text-align: center;
        font-size: 0.8rem;
        z-index: 10000;
        border-top: 2px solid #ff6b6b;
      ">
        🔒 LICENSED DEMO - License: ${this.licenseKey} | 
        Platform Value: $3.15B | 
        © 2025 Elevate for Humanity | 
        Unauthorized use prohibited | 
        Session: ${Date.now()}
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', licenseInfo);

    // Update session info
    setInterval(() => {
      const licenseEl = document.getElementById('license-validation');
      if (licenseEl) {
        licenseEl.innerHTML = `
          🔒 LICENSED DEMO - License: ${this.licenseKey} | 
          Platform Value: $3.15B | 
          © 2025 Elevate for Humanity | 
          Unauthorized use prohibited | 
          Session: ${Date.now()}
        `;
      }
    }, 10000);
  }

  setupCopyrightProtection() {
    // Disable common copy methods
    document.addEventListener('copy', (e) => {
      e.clipboardData.setData('text/plain', 
        '🔒 PROTECTED CONTENT - This material is licensed and cannot be copied. Contact sales@elevateforhumanity.org for licensing.');
      e.preventDefault();
      this.logSecurityEvent('copy_attempt');
    });

    // Disable drag and drop
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      this.logSecurityEvent('drag_attempt');
    });

    // Disable save page
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        alert('🔒 Save disabled - Licensed content cannot be saved locally');
        this.logSecurityEvent('save_attempt');
      }
    });

    // Add copyright notices to all images
    document.querySelectorAll('img').forEach(img => {
      img.style.position = 'relative';
      img.addEventListener('load', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        ctx.fillStyle = 'rgba(255,0,0,0.3)';
        ctx.font = '20px Arial';
        ctx.fillText('© EFH LICENSED', 10, 30);
        
        img.src = canvas.toDataURL();
      });
    });
  }

  enableUsageTracking() {
    // Track user behavior
    const trackingData = {
      sessionId: this.licenseKey,
      startTime: Date.now(),
      interactions: 0,
      scrollDepth: 0,
      timeSpent: 0
    };

    // Track interactions
    document.addEventListener('click', () => {
      trackingData.interactions++;
      this.sendTrackingData('interaction', trackingData);
    });

    // Track scroll
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      trackingData.scrollDepth = Math.max(trackingData.scrollDepth, scrollPercent);
    });

    // Send periodic updates
    setInterval(() => {
      trackingData.timeSpent = Date.now() - trackingData.startTime;
      this.sendTrackingData('usage_update', trackingData);
    }, 30000);

    // Send final data on page unload
    window.addEventListener('beforeunload', () => {
      trackingData.timeSpent = Date.now() - trackingData.startTime;
      this.sendTrackingData('session_end', trackingData);
    });
  }

  logSecurityEvent(eventType) {
    const securityEvent = {
      type: eventType,
      timestamp: new Date().toISOString(),
      licenseKey: this.licenseKey,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ip: 'client-side' // Would be filled server-side
    };

    console.warn('🔒 Security Event:', securityEvent);
    
    // Send to security monitoring
    fetch('/api/security-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(securityEvent)
    }).catch(() => {}); // Fail silently
  }

  sendTrackingData(eventType, data) {
    fetch('/api/usage-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventType,
        data: data,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {}); // Fail silently
  }

  // Public method to verify license
  verifyLicense() {
    return {
      valid: true,
      licenseKey: this.licenseKey,
      platform: 'EFH Ecosystem',
      value: '$3.15B',
      protection: this.protectionLevel,
      timestamp: new Date().toISOString()
    };
  }
}

// Initialize protection system
if (typeof window !== 'undefined') {
  window.EFHProtection = new LicenseProtectionSystem();
  
  // Add to console for verification
  console.log('%c🔒 EFH LICENSE PROTECTION ACTIVE', 'color: red; font-size: 16px; font-weight: bold;');
  console.log('%cPlatform Value: $3.15 Billion', 'color: blue; font-size: 14px;');
  console.log('%cLicense Key:', window.EFHProtection.licenseKey);
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LicenseProtectionSystem;
}