/**
 * Protection Injection Script
 * Automatically injects watermarks and protection into all HTML pages
 */

// Protection injection code that gets added to every page
const protectionInjectionCode = `
<!-- EFH Maximum Security Protection -->
<script>
// Immediate protection activation
(function() {
    'use strict';
    
    // Disable right-click immediately
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        console.warn('🚫 Right-click disabled - Content protected by Elevate for Humanity');
        return false;
    });
    
    // Disable text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable drag
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+A, Ctrl+C
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || 
                          e.key === 'a' || e.key === 'A' || e.key === 'c' || e.key === 'C' ||
                          e.key === 'p' || e.key === 'P')) ||
            e.key === 'PrintScreen') {
            e.preventDefault();
            console.warn('🚫 Action blocked - Content protected by Elevate for Humanity');
            return false;
        }
    });
    
    // Add immediate watermark
    function addImmediateWatermark() {
        const watermark = document.createElement('div');
        watermark.id = 'efh-immediate-watermark';
        watermark.innerHTML = '© 2025 Elevate for Humanity - Licensed Content';
        watermark.style.cssText = \`
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 8px 12px;
            font-size: 11px;
            color: #666;
            opacity: 0.8;
            z-index: 999999;
            pointer-events: none;
            user-select: none;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        \`;
        document.body.appendChild(watermark);
    }
    
    // Add watermark when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addImmediateWatermark);
    } else {
        addImmediateWatermark();
    }
    
    // Add CSS protection
    const protectionCSS = \`
        * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }
        
        img {
            -webkit-user-drag: none !important;
            -khtml-user-drag: none !important;
            -moz-user-drag: none !important;
            -o-user-drag: none !important;
            user-drag: none !important;
            pointer-events: none !important;
        }
        
        body::before {
            content: "© 2025 Elevate for Humanity - Protected Content";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 36px;
            color: rgba(0, 0, 0, 0.02);
            pointer-events: none;
            user-select: none;
            z-index: -1;
            white-space: nowrap;
            font-weight: bold;
        }
        
        @media print {
            body::after {
                content: "© 2025 Elevate for Humanity - Licensed Content - Unauthorized reproduction prohibited";
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 12px;
                padding: 10px;
                background: #f0f0f0;
                border-top: 2px solid #333;
            }
        }
    \`;
    
    const style = document.createElement('style');
    style.textContent = protectionCSS;
    document.head.appendChild(style);
    
    console.log('🔒 EFH Protection System Activated');
})();
</script>

<!-- Load full protection systems -->
<script src="/security/watermark-protection-system.js"></script>
<script src="/security/anti-scraping-protection.js"></script>
<script src="/security/copyright-enforcement-system.js"></script>

<!-- Protection monitoring -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all protection systems
    if (typeof WatermarkProtectionSystem !== 'undefined') {
        window.efhWatermark = new WatermarkProtectionSystem();
    }
    
    if (typeof AntiScrapingProtection !== 'undefined') {
        window.efhAntiScraping = new AntiScrapingProtection();
    }
    
    if (typeof CopyrightEnforcementSystem !== 'undefined') {
        window.efhCopyright = new CopyrightEnforcementSystem();
        window.efhCopyright.startMonitoring();
    }
    
    console.log('🛡️ All EFH protection systems loaded and active');
});
</script>

<!-- Hidden tracking elements -->
<div style="display: none;" data-efh-protected="true" data-efh-timestamp="${Date.now()}" data-efh-version="1.0"></div>
<meta name="efh-protection" content="maximum" style="display: none;">
<meta name="efh-copyright" content="2025 Elevate for Humanity" style="display: none;">
`;

// Function to inject protection into HTML files
function injectProtectionIntoHTML(htmlContent) {
    // Insert protection code before closing </head> tag
    const headCloseIndex = htmlContent.indexOf('</head>');
    if (headCloseIndex !== -1) {
        return htmlContent.slice(0, headCloseIndex) + 
               protectionInjectionCode + 
               htmlContent.slice(headCloseIndex);
    }
    
    // If no </head> tag, insert after <head> tag
    const headOpenIndex = htmlContent.indexOf('<head>');
    if (headOpenIndex !== -1) {
        const insertIndex = headOpenIndex + '<head>'.length;
        return htmlContent.slice(0, insertIndex) + 
               protectionInjectionCode + 
               htmlContent.slice(insertIndex);
    }
    
    // If no head tags, insert at the beginning of body
    const bodyOpenIndex = htmlContent.indexOf('<body>');
    if (bodyOpenIndex !== -1) {
        const insertIndex = bodyOpenIndex + '<body>'.length;
        return htmlContent.slice(0, insertIndex) + 
               protectionInjectionCode + 
               htmlContent.slice(insertIndex);
    }
    
    // Last resort: prepend to content
    return protectionInjectionCode + htmlContent;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        protectionInjectionCode,
        injectProtectionIntoHTML
    };
}

// Export for browser
if (typeof window !== 'undefined') {
    window.EFHProtectionInjector = {
        protectionInjectionCode,
        injectProtectionIntoHTML
    };
}

console.log('💉 Protection injection system ready');