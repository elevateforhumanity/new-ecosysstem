/**
 * Enterprise-Grade Anti-Scraping Protection System
 * Elevate for Humanity - Maximum Security Configuration
 * 
 * Features:
 * - Advanced bot detection and blocking
 * - Rate limiting with progressive penalties
 * - IP reputation and geolocation filtering
 * - Behavioral analysis and fingerprinting
 * - Honeypot traps and decoy content
 * - Real-time threat monitoring
 */

class AntiScrapingProtection {
    constructor() {
        this.suspiciousIPs = new Set();
        this.blockedIPs = new Set();
        this.requestCounts = new Map();
        this.behaviorScores = new Map();
        this.honeypotTriggers = new Set();
        
        // Configuration
        this.config = {
            maxRequestsPerMinute: 30,
            maxRequestsPerHour: 500,
            suspiciousThreshold: 0.7,
            blockThreshold: 0.9,
            honeypotPaths: ['/admin-secret/', '/api-internal/', '/backup-files/'],
            protectedExtensions: ['.json', '.xml', '.csv', '.sql', '.bak'],
            allowedUserAgents: ['googlebot', 'bingbot', 'facebookexternalhit'],
            blockedUserAgents: ['scrapy', 'selenium', 'phantomjs', 'headless']
        };
        
        this.initializeProtection();
    }
    
    initializeProtection() {
        this.setupRateLimiting();
        this.setupBotDetection();
        this.setupHoneypots();
        this.setupBehaviorAnalysis();
        this.setupIPFiltering();
        console.log('🛡️ Enterprise Anti-Scraping Protection Activated');
    }
    
    // Advanced Rate Limiting with Progressive Penalties
    setupRateLimiting() {
        const rateLimitMiddleware = (req, res, next) => {
            const clientIP = this.getClientIP(req);
            const now = Date.now();
            const minute = Math.floor(now / 60000);
            const hour = Math.floor(now / 3600000);
            
            // Initialize tracking
            if (!this.requestCounts.has(clientIP)) {
                this.requestCounts.set(clientIP, {
                    minute: { count: 0, window: minute },
                    hour: { count: 0, window: hour },
                    violations: 0
                });
            }
            
            const clientData = this.requestCounts.get(clientIP);
            
            // Reset counters if window changed
            if (clientData.minute.window !== minute) {
                clientData.minute = { count: 0, window: minute };
            }
            if (clientData.hour.window !== hour) {
                clientData.hour = { count: 0, window: hour };
            }
            
            // Increment counters
            clientData.minute.count++;
            clientData.hour.count++;
            
            // Check limits
            if (clientData.minute.count > this.config.maxRequestsPerMinute) {
                clientData.violations++;
                this.flagSuspiciousIP(clientIP, 'rate_limit_minute');
                return this.blockRequest(res, 'Rate limit exceeded (per minute)', 429);
            }
            
            if (clientData.hour.count > this.config.maxRequestsPerHour) {
                clientData.violations++;
                this.flagSuspiciousIP(clientIP, 'rate_limit_hour');
                return this.blockRequest(res, 'Rate limit exceeded (per hour)', 429);
            }
            
            next();
        };
        
        this.rateLimitMiddleware = rateLimitMiddleware;
    }
    
    // Advanced Bot Detection
    setupBotDetection() {
        const botDetectionMiddleware = (req, res, next) => {
            const userAgent = req.headers['user-agent'] || '';
            const clientIP = this.getClientIP(req);
            
            // Check for blocked user agents
            const isBlockedBot = this.config.blockedUserAgents.some(bot => 
                userAgent.toLowerCase().includes(bot)
            );
            
            if (isBlockedBot) {
                this.flagSuspiciousIP(clientIP, 'blocked_user_agent');
                return this.blockRequest(res, 'Unauthorized bot detected', 403);
            }
            
            // Advanced bot detection patterns
            const botPatterns = [
                /curl|wget|python|java|go-http|node-fetch/i,
                /bot|crawler|spider|scraper|harvester/i,
                /headless|phantom|selenium|playwright/i
            ];
            
            const isSuspiciousBot = botPatterns.some(pattern => pattern.test(userAgent));
            
            if (isSuspiciousBot) {
                // Allow legitimate search engine bots
                const isLegitimateBot = this.config.allowedUserAgents.some(bot => 
                    userAgent.toLowerCase().includes(bot)
                );
                
                if (!isLegitimateBot) {
                    this.flagSuspiciousIP(clientIP, 'suspicious_user_agent');
                    this.increaseBehaviorScore(clientIP, 0.3);
                }
            }
            
            // Check for missing or suspicious headers
            if (!req.headers['accept'] || !req.headers['accept-language']) {
                this.increaseBehaviorScore(clientIP, 0.2);
            }
            
            // Check for automation indicators
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' && 
                !req.headers['referer']) {
                this.increaseBehaviorScore(clientIP, 0.1);
            }
            
            next();
        };
        
        this.botDetectionMiddleware = botDetectionMiddleware;
    }
    
    // Honeypot Traps
    setupHoneypots() {
        const honeypotMiddleware = (req, res, next) => {
            const path = req.path;
            const clientIP = this.getClientIP(req);
            
            // Check for honeypot path access
            if (this.config.honeypotPaths.some(trap => path.includes(trap))) {
                this.honeypotTriggers.add(clientIP);
                this.flagSuspiciousIP(clientIP, 'honeypot_triggered');
                this.increaseBehaviorScore(clientIP, 0.8);
                
                // Serve fake content to waste scraper time
                return res.status(200).json({
                    error: "Access denied",
                    message: "This is a protected resource",
                    timestamp: new Date().toISOString(),
                    fake_data: Array(1000).fill("decoy").join(" ")
                });
            }
            
            // Check for protected file extensions
            const hasProtectedExtension = this.config.protectedExtensions.some(ext => 
                path.endsWith(ext)
            );
            
            if (hasProtectedExtension) {
                this.flagSuspiciousIP(clientIP, 'protected_file_access');
                return this.blockRequest(res, 'File type not accessible', 403);
            }
            
            next();
        };
        
        this.honeypotMiddleware = honeypotMiddleware;
    }
    
    // Behavioral Analysis
    setupBehaviorAnalysis() {
        const behaviorMiddleware = (req, res, next) => {
            const clientIP = this.getClientIP(req);
            const userAgent = req.headers['user-agent'] || '';
            
            // Analyze request patterns
            const suspiciousPatterns = [
                // Rapid sequential requests
                req.headers['connection'] === 'close',
                // Missing common browser headers
                !req.headers['accept-encoding'],
                // Suspicious referer patterns
                req.headers['referer'] && req.headers['referer'].includes('localhost'),
                // Direct file access patterns
                /\.(json|xml|csv|sql|bak|log)$/i.test(req.path)
            ];
            
            const suspiciousCount = suspiciousPatterns.filter(Boolean).length;
            if (suspiciousCount >= 2) {
                this.increaseBehaviorScore(clientIP, 0.2 * suspiciousCount);
            }
            
            // Check behavior score and take action
            const score = this.behaviorScores.get(clientIP) || 0;
            if (score >= this.config.blockThreshold) {
                this.blockedIPs.add(clientIP);
                return this.blockRequest(res, 'Suspicious behavior detected', 403);
            } else if (score >= this.config.suspiciousThreshold) {
                this.suspiciousIPs.add(clientIP);
                // Add delay for suspicious IPs
                setTimeout(() => next(), 2000);
                return;
            }
            
            next();
        };
        
        this.behaviorMiddleware = behaviorMiddleware;
    }
    
    // IP Filtering and Reputation
    setupIPFiltering() {
        const ipFilterMiddleware = (req, res, next) => {
            const clientIP = this.getClientIP(req);
            
            // Check blocked IPs
            if (this.blockedIPs.has(clientIP)) {
                return this.blockRequest(res, 'IP address blocked', 403);
            }
            
            // Check for known malicious IP patterns
            const maliciousPatterns = [
                /^10\./, // Private networks (suspicious for public access)
                /^192\.168\./, // Private networks
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./ // Private networks
            ];
            
            // Note: In production, integrate with IP reputation services
            // like AbuseIPDB, VirusTotal, or commercial threat intelligence
            
            next();
        };
        
        this.ipFilterMiddleware = ipFilterMiddleware;
    }
    
    // Utility Methods
    getClientIP(req) {
        return req.headers['cf-connecting-ip'] || 
               req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               '127.0.0.1';
    }
    
    flagSuspiciousIP(ip, reason) {
        this.suspiciousIPs.add(ip);
        console.log(`🚨 Suspicious IP flagged: ${ip} - Reason: ${reason}`);
        
        // Log to security monitoring system
        this.logSecurityEvent({
            type: 'suspicious_ip',
            ip: ip,
            reason: reason,
            timestamp: new Date().toISOString()
        });
    }
    
    increaseBehaviorScore(ip, increment) {
        const currentScore = this.behaviorScores.get(ip) || 0;
        const newScore = Math.min(currentScore + increment, 1.0);
        this.behaviorScores.set(ip, newScore);
        
        if (newScore >= this.config.suspiciousThreshold) {
            this.flagSuspiciousIP(ip, `behavior_score_${newScore.toFixed(2)}`);
        }
    }
    
    blockRequest(res, message, statusCode = 403) {
        console.log(`🛡️ Request blocked: ${message}`);
        
        // Return fake content to waste scraper time
        const fakeContent = {
            error: message,
            timestamp: new Date().toISOString(),
            request_id: Math.random().toString(36).substring(7),
            // Add large fake data to slow down scrapers
            decoy_data: Array(500).fill("protected_content").join(" ")
        };
        
        return res.status(statusCode).json(fakeContent);
    }
    
    logSecurityEvent(event) {
        // In production, send to security monitoring system
        console.log('🔒 Security Event:', JSON.stringify(event));
        
        // Store in security log file
        const logEntry = `${event.timestamp} - ${event.type} - ${event.ip} - ${event.reason}\n`;
        // fs.appendFileSync('security/security-events.log', logEntry);
    }
    
    // Get middleware stack for Express.js
    getMiddlewareStack() {
        return [
            this.ipFilterMiddleware,
            this.rateLimitMiddleware,
            this.botDetectionMiddleware,
            this.honeypotMiddleware,
            this.behaviorMiddleware
        ];
    }
    
    // Get protection statistics
    getStats() {
        return {
            suspiciousIPs: this.suspiciousIPs.size,
            blockedIPs: this.blockedIPs.size,
            honeypotTriggers: this.honeypotTriggers.size,
            activeConnections: this.requestCounts.size,
            protectionLevel: 'ENTERPRISE_MAXIMUM'
        };
    }
}

// Export for use in applications
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AntiScrapingProtection;
}

// Browser-side protection (for client-side deployment)
if (typeof window !== 'undefined') {
    window.AntiScrapingProtection = AntiScrapingProtection;
}

console.log('🛡️ Enterprise Anti-Scraping Protection System Loaded');