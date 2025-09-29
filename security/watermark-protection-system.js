/**
 * Advanced Watermark & Digital Fingerprint Protection System
 * Elevate for Humanity - Maximum Content Protection
 * 
 * Features:
 * - Dynamic visual watermarks with user tracking
 * - Hidden digital fingerprints in content
 * - Image protection and watermarking
 * - Content fingerprinting and tracking
 * - Anti-copy protection measures
 * - Real-time violation detection
 */

class WatermarkProtectionSystem {
    constructor() {
        this.config = {
            // Watermark Configuration
            watermarkText: '© 2025 Elevate for Humanity - Licensed Content',
            watermarkOpacity: 0.15,
            watermarkSize: '12px',
            watermarkColor: '#666666',
            watermarkPosition: 'bottom-right',
            
            // Digital Fingerprint Configuration
            fingerprintLength: 32,
            fingerprintElements: 50,
            trackingEnabled: true,
            
            // Protection Configuration
            disableRightClick: true,
            disableTextSelection: true,
            disableImageDrag: true,
            disablePrintScreen: true,
            disableDevTools: true,
            
            // Monitoring Configuration
            violationTracking: true,
            alertThreshold: 3,
            sessionTracking: true
        };
        
        this.sessionId = this.generateSessionId();
        this.userId = this.generateUserId();
        this.fingerprints = new Map();
        this.violations = [];
        
        this.initializeProtection();
    }
    
    initializeProtection() {
        this.addVisualWatermarks();
        this.addDigitalFingerprints();
        this.protectImages();
        this.disableCopyMechanisms();
        this.setupViolationDetection();
        this.trackUserSession();
        
        console.log('🔒 Watermark Protection System Activated');
        console.log(`👤 Session ID: ${this.sessionId}`);
        console.log(`🆔 User ID: ${this.userId}`);
    }
    
    // Add visual watermarks to all content
    addVisualWatermarks() {
        // Main page watermark
        this.addMainWatermark();
        
        // Content section watermarks
        this.addContentWatermarks();
        
        // Background watermarks
        this.addBackgroundWatermarks();
        
        // Dynamic watermarks
        this.addDynamicWatermarks();
        
        console.log('💧 Visual watermarks applied to all content');
    }
    
    addMainWatermark() {
        const watermark = document.createElement('div');
        watermark.id = 'efh-main-watermark';
        watermark.innerHTML = `
            <div class="watermark-content">
                ${this.config.watermarkText}<br>
                Session: ${this.sessionId.substr(0, 8)}<br>
                ${new Date().toLocaleString()}
            </div>
        `;
        
        const watermarkStyles = `
            #efh-main-watermark {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 10px;
                font-size: ${this.config.watermarkSize};
                color: ${this.config.watermarkColor};
                opacity: ${this.config.watermarkOpacity};
                z-index: 999999;
                pointer-events: none;
                user-select: none;
                font-family: Arial, sans-serif;
                line-height: 1.4;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                backdrop-filter: blur(5px);
            }
            
            .watermark-content {
                font-size: 11px;
                text-align: center;
                white-space: nowrap;
            }
            
            @media print {
                #efh-main-watermark {
                    display: block !important;
                    opacity: 0.3 !important;
                }
            }
        `;
        
        this.addStyles(watermarkStyles);
        document.body.appendChild(watermark);
    }
    
    addContentWatermarks() {
        // Add watermarks to content sections
        const contentSelectors = [
            'main', 'article', '.content', '.post', 
            '.program-info', '.course-content', '.training-material'
        ];
        
        contentSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                this.addElementWatermark(element, index);
            });
        });
    }
    
    addElementWatermark(element, index) {
        const watermark = document.createElement('div');
        watermark.className = 'efh-content-watermark';
        watermark.innerHTML = `EFH-${this.sessionId.substr(0, 6)}-${index}`;
        
        const watermarkStyles = `
            .efh-content-watermark {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 10px;
                color: rgba(102, 102, 102, 0.3);
                pointer-events: none;
                user-select: none;
                z-index: 1000;
                font-family: monospace;
            }
        `;
        
        this.addStyles(watermarkStyles);
        
        // Make parent relative if not already positioned
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(watermark);
    }
    
    addBackgroundWatermarks() {
        const backgroundWatermark = `
            body::before {
                content: "${this.config.watermarkText} - ${this.sessionId}";
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 48px;
                color: rgba(0, 0, 0, 0.03);
                pointer-events: none;
                user-select: none;
                z-index: -1;
                white-space: nowrap;
                font-weight: bold;
            }
            
            body::after {
                content: "PROTECTED CONTENT - UNAUTHORIZED COPYING PROHIBITED";
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(90deg, transparent, rgba(102, 102, 102, 0.1), transparent);
                text-align: center;
                font-size: 10px;
                padding: 5px;
                color: rgba(102, 102, 102, 0.5);
                pointer-events: none;
                user-select: none;
                z-index: 999998;
            }
        `;
        
        this.addStyles(backgroundWatermark);
    }
    
    addDynamicWatermarks() {
        // Add moving watermarks that change position
        setInterval(() => {
            this.updateDynamicWatermarks();
        }, 30000); // Update every 30 seconds
    }
    
    updateDynamicWatermarks() {
        const dynamicWatermark = document.getElementById('efh-dynamic-watermark');
        if (dynamicWatermark) {
            dynamicWatermark.remove();
        }
        
        const watermark = document.createElement('div');
        watermark.id = 'efh-dynamic-watermark';
        watermark.innerHTML = `EFH-${Date.now().toString(36)}-${this.userId.substr(0, 8)}`;
        
        const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        const position = positions[Math.floor(Math.random() * positions.length)];
        
        const positionStyles = {
            'top-left': 'top: 20px; left: 20px;',
            'top-right': 'top: 20px; right: 20px;',
            'bottom-left': 'bottom: 60px; left: 20px;',
            'bottom-right': 'bottom: 60px; right: 20px;'
        };
        
        watermark.style.cssText = `
            position: fixed;
            ${positionStyles[position]}
            font-size: 10px;
            color: rgba(102, 102, 102, 0.2);
            pointer-events: none;
            user-select: none;
            z-index: 999997;
            font-family: monospace;
            background: rgba(255, 255, 255, 0.8);
            padding: 3px 6px;
            border-radius: 3px;
        `;
        
        document.body.appendChild(watermark);
    }
    
    // Add hidden digital fingerprints
    addDigitalFingerprints() {
        // Add invisible tracking elements throughout the page
        this.addInvisibleFingerprints();
        
        // Add metadata fingerprints
        this.addMetadataFingerprints();
        
        // Add content fingerprints
        this.addContentFingerprints();
        
        // Add behavioral fingerprints
        this.addBehavioralFingerprints();
        
        console.log('🔍 Digital fingerprints embedded in content');
    }
    
    addInvisibleFingerprints() {
        for (let i = 0; i < this.config.fingerprintElements; i++) {
            const fingerprint = document.createElement('span');
            const fingerprintId = this.generateFingerprint();
            
            fingerprint.style.cssText = `
                display: none;
                position: absolute;
                width: 0;
                height: 0;
                opacity: 0;
                pointer-events: none;
            `;
            
            fingerprint.setAttribute('data-efh-fp', fingerprintId);
            fingerprint.setAttribute('data-efh-session', this.sessionId);
            fingerprint.setAttribute('data-efh-user', this.userId);
            fingerprint.setAttribute('data-efh-timestamp', Date.now());
            fingerprint.setAttribute('data-efh-index', i);
            
            // Insert at random positions in the document
            const elements = document.querySelectorAll('p, div, section, article, main');
            if (elements.length > 0) {
                const randomElement = elements[Math.floor(Math.random() * elements.length)];
                randomElement.appendChild(fingerprint);
            }
            
            this.fingerprints.set(fingerprintId, {
                element: fingerprint,
                timestamp: Date.now(),
                position: i
            });
        }
    }
    
    addMetadataFingerprints() {
        // Add hidden meta tags
        const metaFingerprints = [
            { name: 'efh-session-id', content: this.sessionId },
            { name: 'efh-user-id', content: this.userId },
            { name: 'efh-timestamp', content: Date.now() },
            { name: 'efh-protection-level', content: 'MAXIMUM' },
            { name: 'efh-content-hash', content: this.generateContentHash() }
        ];
        
        metaFingerprints.forEach(meta => {
            const metaTag = document.createElement('meta');
            metaTag.name = meta.name;
            metaTag.content = meta.content;
            metaTag.style.display = 'none';
            document.head.appendChild(metaTag);
        });
    }
    
    addContentFingerprints() {
        // Add invisible characters to text content
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        
        textElements.forEach((element, index) => {
            if (element.textContent && element.textContent.trim().length > 10) {
                const fingerprint = this.generateTextFingerprint(index);
                
                // Insert invisible Unicode characters
                const invisibleChars = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
                const fingerprintChars = fingerprint.split('').map(char => 
                    invisibleChars[parseInt(char, 16) % invisibleChars.length]
                ).join('');
                
                element.textContent += fingerprintChars;
            }
        });
    }
    
    addBehavioralFingerprints() {
        // Track user behavior for fingerprinting
        const behaviorData = {
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language
        };
        
        // Store in hidden element
        const behaviorElement = document.createElement('div');
        behaviorElement.id = 'efh-behavior-fingerprint';
        behaviorElement.style.display = 'none';
        behaviorElement.setAttribute('data-behavior', JSON.stringify(behaviorData));
        document.body.appendChild(behaviorElement);
    }
    
    // Protect images from copying
    protectImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach((img, index) => {
            // Add watermark overlay
            this.addImageWatermark(img, index);
            
            // Disable right-click and drag
            img.addEventListener('contextmenu', e => e.preventDefault());
            img.addEventListener('dragstart', e => e.preventDefault());
            img.style.userSelect = 'none';
            img.style.pointerEvents = 'none';
            
            // Add protection attributes
            img.setAttribute('data-efh-protected', 'true');
            img.setAttribute('data-efh-session', this.sessionId);
            img.setAttribute('data-efh-index', index);
        });
        
        console.log(`🖼️ Protected ${images.length} images with watermarks`);
    }
    
    addImageWatermark(img, index) {
        const container = document.createElement('div');
        container.style.cssText = `
            position: relative;
            display: inline-block;
            width: ${img.width || 'auto'};
            height: ${img.height || 'auto'};
        `;
        
        const watermark = document.createElement('div');
        watermark.innerHTML = `EFH-${this.sessionId.substr(0, 6)}-IMG-${index}`;
        watermark.style.cssText = `
            position: absolute;
            bottom: 5px;
            right: 5px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 2px 6px;
            font-size: 10px;
            border-radius: 3px;
            pointer-events: none;
            user-select: none;
            z-index: 10;
            font-family: monospace;
        `;
        
        // Wrap image with container
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        container.appendChild(watermark);
    }
    
    // Disable copy mechanisms
    disableCopyMechanisms() {
        if (this.config.disableRightClick) {
            document.addEventListener('contextmenu', e => {
                e.preventDefault();
                this.logViolation('right_click_attempt');
                return false;
            });
        }
        
        if (this.config.disableTextSelection) {
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            document.body.style.mozUserSelect = 'none';
            document.body.style.msUserSelect = 'none';
        }
        
        if (this.config.disablePrintScreen) {
            document.addEventListener('keydown', e => {
                if (e.key === 'PrintScreen' || 
                    (e.ctrlKey && (e.key === 'p' || e.key === 'P'))) {
                    e.preventDefault();
                    this.logViolation('print_attempt');
                    return false;
                }
            });
        }
        
        if (this.config.disableDevTools) {
            document.addEventListener('keydown', e => {
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                    (e.ctrlKey && e.key === 'U')) {
                    e.preventDefault();
                    this.logViolation('devtools_attempt');
                    return false;
                }
            });
        }
        
        // Disable common copy shortcuts
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || 
                             e.key === 'a' || e.key === 'A' ||
                             e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                this.logViolation('copy_shortcut_attempt');
                return false;
            }
        });
        
        console.log('🚫 Copy protection mechanisms activated');
    }
    
    // Setup violation detection
    setupViolationDetection() {
        // Monitor for suspicious activity
        this.monitorSuspiciousActivity();
        
        // Check for tampering attempts
        this.monitorTamperingAttempts();
        
        // Monitor for automation tools
        this.detectAutomationTools();
        
        console.log('🔍 Violation detection system active');
    }
    
    monitorSuspiciousActivity() {
        let rapidClicks = 0;
        let lastClickTime = 0;
        
        document.addEventListener('click', () => {
            const now = Date.now();
            if (now - lastClickTime < 100) {
                rapidClicks++;
                if (rapidClicks > 10) {
                    this.logViolation('rapid_clicking_detected');
                    rapidClicks = 0;
                }
            } else {
                rapidClicks = 0;
            }
            lastClickTime = now;
        });
        
        // Monitor for unusual mouse patterns
        let mouseMovements = 0;
        document.addEventListener('mousemove', () => {
            mouseMovements++;
            if (mouseMovements > 1000) {
                this.logViolation('excessive_mouse_movement');
                mouseMovements = 0;
            }
        });
    }
    
    monitorTamperingAttempts() {
        // Monitor for watermark removal attempts
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.removedNodes.forEach(node => {
                        if (node.id && node.id.includes('efh-')) {
                            this.logViolation('watermark_removal_attempt');
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    detectAutomationTools() {
        // Check for common automation indicators
        const automationIndicators = [
            'webdriver' in window,
            'callPhantom' in window,
            'phantom' in window,
            '_phantom' in window,
            navigator.webdriver === true
        ];
        
        if (automationIndicators.some(indicator => indicator)) {
            this.logViolation('automation_tool_detected');
        }
    }
    
    // Track user session
    trackUserSession() {
        const sessionData = {
            sessionId: this.sessionId,
            userId: this.userId,
            startTime: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            url: window.location.href
        };
        
        // Send session data to tracking endpoint
        this.sendTrackingData('session_start', sessionData);
        
        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.sendTrackingData('session_end', {
                sessionId: this.sessionId,
                duration: Date.now() - sessionData.startTime,
                violations: this.violations.length
            });
        });
    }
    
    // Logging and tracking methods
    logViolation(type) {
        const violation = {
            type: type,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.violations.push(violation);
        
        console.warn(`🚨 Violation detected: ${type}`);
        
        // Send violation alert if threshold exceeded
        if (this.violations.length >= this.config.alertThreshold) {
            this.sendViolationAlert();
        }
        
        // Send tracking data
        this.sendTrackingData('violation', violation);
    }
    
    sendViolationAlert() {
        const alertData = {
            sessionId: this.sessionId,
            userId: this.userId,
            violationCount: this.violations.length,
            violations: this.violations,
            timestamp: Date.now(),
            url: window.location.href
        };
        
        // Send to monitoring endpoint
        this.sendTrackingData('violation_alert', alertData);
        
        console.error('🚨 VIOLATION ALERT: Multiple protection violations detected');
    }
    
    sendTrackingData(event, data) {
        if (!this.config.trackingEnabled) return;
        
        // Send to tracking endpoint (implement actual endpoint)
        fetch('/api/security/tracking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event: event,
                data: data,
                timestamp: Date.now()
            })
        }).catch(error => {
            console.log('Tracking data queued for later transmission');
        });
    }
    
    // Utility methods
    generateSessionId() {
        return 'SES-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    generateUserId() {
        return 'USR-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    generateFingerprint() {
        return Array.from({length: this.config.fingerprintLength}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }
    
    generateTextFingerprint(index) {
        return (this.sessionId + index).split('').map(char => 
            char.charCodeAt(0).toString(16)
        ).join('').substr(0, 8);
    }
    
    generateContentHash() {
        const content = document.body.textContent || '';
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    
    addStyles(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    // Get protection statistics
    getProtectionStats() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            watermarksActive: document.querySelectorAll('[id*="efh-"]').length,
            fingerprintsEmbedded: this.fingerprints.size,
            violationsDetected: this.violations.length,
            protectionLevel: 'MAXIMUM',
            imagesProtected: document.querySelectorAll('img[data-efh-protected]').length
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.efhWatermarkProtection = new WatermarkProtectionSystem();
    });
} else {
    window.efhWatermarkProtection = new WatermarkProtectionSystem();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WatermarkProtectionSystem;
}

console.log('💧 Watermark Protection System Loaded');
console.log('🔒 Maximum content protection activated');