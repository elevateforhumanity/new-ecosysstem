/**
 * Advanced Content & Image Protection System
 * Elevate for Humanity - Maximum Copy Protection
 * 
 * Features:
 * - Dynamic image watermarking and protection
 * - Content encryption and obfuscation
 * - Real-time copy attempt detection
 * - Advanced anti-screenshot protection
 * - Behavioral analysis and tracking
 */

class ContentImageProtection {
    constructor() {
        this.config = {
            // Image Protection
            imageWatermarking: true,
            imageEncryption: true,
            disableRightClick: true,
            disableDragDrop: true,
            disableImageSaving: true,
            
            // Content Protection
            textObfuscation: true,
            contentEncryption: true,
            disableTextSelection: true,
            disableCopyPaste: true,
            
            // Screenshot Protection
            screenshotDetection: true,
            screenshotBlocking: true,
            printScreenDisabled: true,
            
            // Behavioral Monitoring
            copyAttemptTracking: true,
            violationThreshold: 3,
            autoBlockEnabled: true,
            
            // Watermark Configuration
            watermarkOpacity: 0.3,
            watermarkSize: '14px',
            watermarkColor: '#ff0000',
            dynamicWatermarks: true
        };
        
        this.protectedImages = new Map();
        this.protectedContent = new Map();
        this.copyAttempts = new Map();
        this.violationLog = [];
        this.sessionId = this.generateSessionId();
        
        this.initializeProtection();
    }
    
    initializeProtection() {
        this.protectImages();
        this.protectContent();
        this.setupCopyDetection();
        this.setupScreenshotProtection();
        this.setupBehaviorMonitoring();
        this.injectProtectionCSS();
        
        console.log('🛡️ Content & Image Protection System Activated');
        console.log(`🔒 Session ID: ${this.sessionId}`);
    }
    
    // Image Protection System
    protectImages() {
        // Protect existing images
        this.protectExistingImages();
        
        // Monitor for new images
        this.setupImageMonitoring();
        
        // Setup image encryption
        this.setupImageEncryption();
        
        console.log('🖼️ Image protection system activated');
    }
    
    protectExistingImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach((img, index) => {
            this.applyImageProtection(img, index);
        });
        
        console.log(`🖼️ Protected ${images.length} existing images`);
    }
    
    applyImageProtection(img, index) {
        const imageId = `img_${index}_${Date.now()}`;
        
        // Create protection wrapper
        const wrapper = this.createImageWrapper(img, imageId);
        
        // Add watermark overlay
        this.addImageWatermark(wrapper, imageId);
        
        // Disable image interactions
        this.disableImageInteractions(img);
        
        // Add protection attributes
        this.addImageProtectionAttributes(img, imageId);
        
        // Store protection data
        this.protectedImages.set(imageId, {
            element: img,
            wrapper: wrapper,
            protected: true,
            timestamp: Date.now()
        });
    }
    
    createImageWrapper(img, imageId) {
        const wrapper = document.createElement('div');
        wrapper.className = 'efh-image-protection-wrapper';
        wrapper.setAttribute('data-image-id', imageId);
        
        wrapper.style.cssText = `
            position: relative;
            display: inline-block;
            overflow: hidden;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        `;
        
        // Wrap the image
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        return wrapper;
    }
    
    addImageWatermark(wrapper, imageId) {
        // Main watermark
        const watermark = document.createElement('div');
        watermark.className = 'efh-image-watermark';
        watermark.innerHTML = `© EFH ${this.sessionId.substr(0, 8)}`;
        
        watermark.style.cssText = `
            position: absolute;
            bottom: 5px;
            right: 5px;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 2px 8px;
            font-size: ${this.config.watermarkSize};
            font-family: Arial, sans-serif;
            border-radius: 3px;
            pointer-events: none;
            user-select: none;
            z-index: 1000;
            opacity: ${this.config.watermarkOpacity};
        `;
        
        wrapper.appendChild(watermark);
        
        // Add diagonal watermark
        this.addDiagonalWatermark(wrapper, imageId);
        
        // Add corner watermarks
        this.addCornerWatermarks(wrapper, imageId);
    }
    
    addDiagonalWatermark(wrapper, imageId) {
        const diagonalWatermark = document.createElement('div');
        diagonalWatermark.className = 'efh-diagonal-watermark';
        diagonalWatermark.innerHTML = 'ELEVATE FOR HUMANITY - PROTECTED CONTENT';
        
        diagonalWatermark.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 16px;
            font-weight: bold;
            color: rgba(255, 0, 0, 0.2);
            white-space: nowrap;
            pointer-events: none;
            user-select: none;
            z-index: 999;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        `;
        
        wrapper.appendChild(diagonalWatermark);
    }
    
    addCornerWatermarks(wrapper, imageId) {
        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        
        corners.forEach(corner => {
            const cornerWatermark = document.createElement('div');
            cornerWatermark.className = `efh-corner-watermark-${corner}`;
            cornerWatermark.innerHTML = 'EFH';
            
            const positions = {
                'top-left': 'top: 5px; left: 5px;',
                'top-right': 'top: 5px; right: 5px;',
                'bottom-left': 'bottom: 25px; left: 5px;',
                'bottom-right': 'bottom: 25px; right: 50px;'
            };
            
            cornerWatermark.style.cssText = `
                position: absolute;
                ${positions[corner]}
                font-size: 10px;
                font-weight: bold;
                color: rgba(255, 0, 0, 0.6);
                background: rgba(255, 255, 255, 0.8);
                padding: 1px 3px;
                border-radius: 2px;
                pointer-events: none;
                user-select: none;
                z-index: 998;
            `;
            
            wrapper.appendChild(cornerWatermark);
        });
    }
    
    disableImageInteractions(img) {
        // Disable right-click
        img.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.logViolation('image_right_click', img);
            return false;
        });
        
        // Disable drag and drop
        img.addEventListener('dragstart', (e) => {
            e.preventDefault();
            this.logViolation('image_drag_attempt', img);
            return false;
        });
        
        // Disable selection
        img.addEventListener('selectstart', (e) => {
            e.preventDefault();
            this.logViolation('image_selection_attempt', img);
            return false;
        });
        
        // Disable pointer events for saving
        img.style.pointerEvents = 'none';
        
        // Add protection attributes
        img.setAttribute('draggable', 'false');
        img.setAttribute('ondragstart', 'return false;');
        img.setAttribute('onselectstart', 'return false;');
        img.setAttribute('oncontextmenu', 'return false;');
    }
    
    addImageProtectionAttributes(img, imageId) {
        img.setAttribute('data-efh-protected', 'true');
        img.setAttribute('data-efh-id', imageId);
        img.setAttribute('data-efh-session', this.sessionId);
        img.setAttribute('data-efh-timestamp', Date.now());
        
        // Add invisible tracking pixel
        const trackingPixel = document.createElement('img');
        trackingPixel.src = `data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7`;
        trackingPixel.style.cssText = 'position: absolute; width: 1px; height: 1px; opacity: 0;';
        trackingPixel.setAttribute('data-efh-tracker', imageId);
        
        img.parentNode.appendChild(trackingPixel);
    }
    
    setupImageMonitoring() {
        // Monitor for new images added to DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                        images.forEach((img, index) => {
                            if (!img.getAttribute('data-efh-protected')) {
                                this.applyImageProtection(img, Date.now() + index);
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    setupImageEncryption() {
        // Implement image URL obfuscation
        const images = document.querySelectorAll('img[data-efh-protected]');
        
        images.forEach(img => {
            const originalSrc = img.src;
            const encryptedSrc = this.encryptImageURL(originalSrc);
            
            // Replace with encrypted URL
            img.setAttribute('data-original-src', originalSrc);
            img.src = encryptedSrc;
        });
    }
    
    encryptImageURL(url) {
        // Simple URL obfuscation (implement stronger encryption in production)
        const encoded = btoa(url + '|' + this.sessionId + '|' + Date.now());
        return `/api/secure-image/${encoded}`;
    }
    
    // Content Protection System
    protectContent() {
        this.protectTextContent();
        this.setupContentMonitoring();
        this.obfuscateContent();
        
        console.log('📝 Content protection system activated');
    }
    
    protectTextContent() {
        // Disable text selection
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
        
        // Disable copy/paste shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || 
                             e.key === 'a' || e.key === 'A' ||
                             e.key === 'v' || e.key === 'V' ||
                             e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                this.logViolation('copy_paste_attempt', e.target);
                return false;
            }
        });
        
        // Disable right-click on content
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.logViolation('content_right_click', e.target);
            return false;
        });
    }
    
    setupContentMonitoring() {
        // Monitor for copy attempts
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.logViolation('copy_event_triggered', e.target);
            return false;
        });
        
        // Monitor for selection attempts
        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
            this.logViolation('text_selection_attempt', e.target);
            return false;
        });
    }
    
    obfuscateContent() {
        // Add invisible characters to text content
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        
        textElements.forEach((element, index) => {
            if (element.textContent && element.textContent.trim().length > 10) {
                this.addContentFingerprint(element, index);
            }
        });
    }
    
    addContentFingerprint(element, index) {
        const originalText = element.textContent;
        const fingerprint = this.generateContentFingerprint(index);
        
        // Insert invisible Unicode characters
        const invisibleChars = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
        const fingerprintChars = fingerprint.split('').map(char => 
            invisibleChars[parseInt(char, 16) % invisibleChars.length]
        ).join('');
        
        // Add fingerprint to content
        element.textContent = originalText + fingerprintChars;
        
        // Add protection attributes
        element.setAttribute('data-efh-content-protected', 'true');
        element.setAttribute('data-efh-fingerprint', fingerprint);
    }
    
    generateContentFingerprint(index) {
        return (this.sessionId + index + Date.now()).split('').map(char => 
            char.charCodeAt(0).toString(16)
        ).join('').substr(0, 16);
    }
    
    // Screenshot Protection
    setupScreenshotProtection() {
        // Detect print screen attempts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                this.logViolation('print_screen_attempt', document.body);
                this.triggerScreenshotProtection();
                return false;
            }
        });
        
        // Detect developer tools
        this.setupDevToolsDetection();
        
        // Add screenshot detection overlay
        this.addScreenshotDetectionOverlay();
        
        console.log('📸 Screenshot protection activated');
    }
    
    setupDevToolsDetection() {
        // Detect F12 and developer shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
                e.preventDefault();
                this.logViolation('devtools_attempt', document.body);
                this.triggerDevToolsProtection();
                return false;
            }
        });
        
        // Detect console access
        let devtools = {open: false, orientation: null};
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.logViolation('devtools_opened', document.body);
                    this.triggerDevToolsProtection();
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }
    
    addScreenshotDetectionOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'efh-screenshot-overlay';
        overlay.innerHTML = 'SCREENSHOT DETECTED - CONTENT PROTECTED';
        
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            font-size: 48px;
            font-weight: bold;
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            text-align: center;
            pointer-events: none;
        `;
        
        document.body.appendChild(overlay);
    }
    
    triggerScreenshotProtection() {
        const overlay = document.getElementById('efh-screenshot-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            
            // Hide overlay after 3 seconds
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 3000);
        }
        
        // Blur content temporarily
        this.blurContent(2000);
        
        console.log('📸 Screenshot protection triggered');
    }
    
    triggerDevToolsProtection() {
        // Redirect or show warning
        if (this.copyAttempts.size > 3) {
            window.location.href = '/security/blocked';
        } else {
            alert('Developer tools detected. This action has been logged for security purposes.');
        }
    }
    
    blurContent(duration) {
        document.body.style.filter = 'blur(10px)';
        document.body.style.transition = 'filter 0.3s ease';
        
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, duration);
    }
    
    // Behavior Monitoring
    setupBehaviorMonitoring() {
        this.monitorMouseBehavior();
        this.monitorKeyboardBehavior();
        this.monitorScrollBehavior();
        
        console.log('👁️ Behavior monitoring activated');
    }
    
    monitorMouseBehavior() {
        let rapidClicks = 0;
        let lastClickTime = 0;
        
        document.addEventListener('click', (e) => {
            const now = Date.now();
            if (now - lastClickTime < 100) {
                rapidClicks++;
                if (rapidClicks > 10) {
                    this.logViolation('rapid_clicking', e.target);
                    rapidClicks = 0;
                }
            } else {
                rapidClicks = 0;
            }
            lastClickTime = now;
        });
        
        // Monitor for automation patterns
        let mouseMovements = 0;
        document.addEventListener('mousemove', () => {
            mouseMovements++;
            if (mouseMovements > 1000) {
                this.logViolation('excessive_mouse_movement', document.body);
                mouseMovements = 0;
            }
        });
    }
    
    monitorKeyboardBehavior() {
        let keyPresses = 0;
        let lastKeyTime = 0;
        
        document.addEventListener('keydown', (e) => {
            const now = Date.now();
            keyPresses++;
            
            // Detect rapid typing (bot-like)
            if (now - lastKeyTime < 50 && keyPresses > 20) {
                this.logViolation('rapid_typing', e.target);
                keyPresses = 0;
            }
            
            lastKeyTime = now;
        });
    }
    
    monitorScrollBehavior() {
        let scrollEvents = 0;
        let lastScrollTime = 0;
        
        document.addEventListener('scroll', () => {
            const now = Date.now();
            scrollEvents++;
            
            // Detect rapid scrolling (automation)
            if (now - lastScrollTime < 10 && scrollEvents > 50) {
                this.logViolation('rapid_scrolling', document.body);
                scrollEvents = 0;
            }
            
            lastScrollTime = now;
        });
    }
    
    // Violation Logging
    logViolation(type, element) {
        const violation = {
            type: type,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            element: element.tagName || 'unknown',
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.violationLog.push(violation);
        
        // Track per-session violations
        const sessionViolations = this.copyAttempts.get(this.sessionId) || 0;
        this.copyAttempts.set(this.sessionId, sessionViolations + 1);
        
        console.warn(`🚨 Protection violation: ${type}`);
        
        // Send violation data
        this.sendViolationData(violation);
        
        // Check for auto-block
        if (sessionViolations >= this.config.violationThreshold) {
            this.triggerAutoBlock();
        }
    }
    
    sendViolationData(violation) {
        // Send to monitoring endpoint
        fetch('/api/security/violation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(violation)
        }).catch(error => {
            console.log('Violation data queued for later transmission');
        });
    }
    
    triggerAutoBlock() {
        if (this.config.autoBlockEnabled) {
            console.log('🚫 Auto-block triggered due to multiple violations');
            
            // Redirect to block page
            window.location.href = '/security/blocked';
        }
    }
    
    // CSS Protection Injection
    injectProtectionCSS() {
        const protectionCSS = `
            /* EFH Content Protection Styles */
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
            
            .efh-image-protection-wrapper {
                position: relative !important;
                overflow: hidden !important;
            }
            
            .efh-image-watermark,
            .efh-diagonal-watermark,
            .efh-corner-watermark-top-left,
            .efh-corner-watermark-top-right,
            .efh-corner-watermark-bottom-left,
            .efh-corner-watermark-bottom-right {
                pointer-events: none !important;
                user-select: none !important;
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
            }
            
            /* Disable print styles */
            @media print {
                body::before {
                    content: "© 2025 Elevate for Humanity - Unauthorized reproduction prohibited";
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #ff0000;
                    color: white;
                    text-align: center;
                    font-size: 24px;
                    padding: 20px;
                    z-index: 999999;
                }
                
                img {
                    display: none !important;
                }
                
                .efh-image-protection-wrapper::after {
                    content: "[PROTECTED IMAGE - REPRODUCTION PROHIBITED]";
                    display: block;
                    background: #f0f0f0;
                    border: 2px solid #ff0000;
                    padding: 20px;
                    text-align: center;
                    font-weight: bold;
                }
            }
            
            /* Hide content from screen readers when protection is active */
            .efh-protected-content {
                speak: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = protectionCSS;
        document.head.appendChild(style);
    }
    
    // Utility Methods
    generateSessionId() {
        return 'SES-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    // Get protection statistics
    getProtectionStats() {
        return {
            sessionId: this.sessionId,
            protectedImages: this.protectedImages.size,
            protectedContent: this.protectedContent.size,
            violations: this.violationLog.length,
            copyAttempts: Array.from(this.copyAttempts.values()).reduce((a, b) => a + b, 0),
            protectionLevel: 'MAXIMUM'
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.efhContentProtection = new ContentImageProtection();
    });
} else {
    window.efhContentProtection = new ContentImageProtection();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentImageProtection;
}

console.log('🛡️ Content & Image Protection System Loaded');
console.log('🔒 Maximum copy protection activated');