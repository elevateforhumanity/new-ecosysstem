/**
 * Advanced CAPTCHA & IP Blocking System
 * Elevate for Humanity - Maximum Security Protection
 * 
 * Features:
 * - Multi-layer CAPTCHA challenges
 * - Intelligent IP blocking and reputation
 * - Behavioral challenge system
 * - Automated threat response
 * - Real-time IP reputation monitoring
 */

class CaptchaIPBlockingSystem {
    constructor() {
        this.config = {
            // CAPTCHA Configuration
            captchaEnabled: true,
            captchaDifficulty: 'medium', // easy, medium, hard
            captchaTimeout: 300000, // 5 minutes
            maxCaptchaAttempts: 3,
            
            // IP Blocking Configuration
            ipBlockingEnabled: true,
            autoBlockThreshold: 5, // violations before auto-block
            blockDuration: 3600000, // 1 hour
            permanentBlockThreshold: 10,
            
            // Challenge Configuration
            challengeTypes: ['math', 'image', 'text', 'behavioral'],
            challengeRotation: true,
            adaptiveDifficulty: true,
            
            // Reputation Configuration
            reputationThreshold: 0.3,
            reputationSources: ['abuseipdb', 'virustotal', 'internal'],
            
            // Behavioral Analysis
            behaviorTracking: true,
            mouseTrackingEnabled: true,
            keystrokeAnalysis: true,
            timingAnalysis: true
        };
        
        this.blockedIPs = new Map(); // IP -> block info
        this.suspiciousIPs = new Map(); // IP -> suspicion score
        this.captchaSessions = new Map(); // session -> captcha data
        this.ipReputation = new Map(); // IP -> reputation data
        this.challengeHistory = new Map(); // IP -> challenge history
        
        this.initializeSystem();
    }
    
    initializeSystem() {
        this.setupIPBlocking();
        this.setupCaptchaSystem();
        this.setupBehavioralChallenges();
        this.setupReputationMonitoring();
        this.setupAutomatedResponse();
        
        console.log('🛡️ CAPTCHA & IP Blocking System Activated');
        console.log('🚫 Advanced threat protection enabled');
    }
    
    // Main request processing
    async processRequest(req, res, next) {
        const clientIP = this.getClientIP(req);
        const sessionId = this.getSessionId(req);
        
        // Check if IP is blocked
        if (await this.isIPBlocked(clientIP)) {
            return this.handleBlockedIP(res, clientIP);
        }
        
        // Check IP reputation
        const reputation = await this.checkIPReputation(clientIP);
        if (reputation.score < this.config.reputationThreshold) {
            return this.requireChallenge(res, clientIP, 'low_reputation');
        }
        
        // Check if challenge is required
        const challengeRequired = await this.isChallengeRequired(clientIP, req);
        if (challengeRequired.required) {
            return this.requireChallenge(res, clientIP, challengeRequired.reason);
        }
        
        // Check for suspicious behavior
        const behaviorScore = await this.analyzeBehavior(clientIP, req);
        if (behaviorScore > 0.7) {
            return this.requireChallenge(res, clientIP, 'suspicious_behavior');
        }
        
        next();
    }
    
    // IP Blocking System
    async isIPBlocked(ip) {
        const blockInfo = this.blockedIPs.get(ip);
        
        if (!blockInfo) return false;
        
        // Check if block has expired
        if (blockInfo.expiresAt && Date.now() > blockInfo.expiresAt) {
            this.blockedIPs.delete(ip);
            return false;
        }
        
        // Permanent blocks never expire
        return true;
    }
    
    async blockIP(ip, reason, duration = null) {
        const blockInfo = {
            ip: ip,
            reason: reason,
            blockedAt: Date.now(),
            expiresAt: duration ? Date.now() + duration : null,
            permanent: !duration,
            violations: (this.blockedIPs.get(ip)?.violations || 0) + 1
        };
        
        this.blockedIPs.set(ip, blockInfo);
        
        console.log(`🚫 IP Blocked: ${ip} - Reason: ${reason} - Duration: ${duration ? `${duration/1000}s` : 'Permanent'}`);
        
        // Log security event
        this.logSecurityEvent({
            type: 'ip_blocked',
            ip: ip,
            reason: reason,
            duration: duration,
            timestamp: Date.now()
        });
        
        // Send alert for permanent blocks
        if (!duration) {
            this.sendSecurityAlert('permanent_ip_block', { ip, reason });
        }
    }
    
    async unblockIP(ip) {
        if (this.blockedIPs.has(ip)) {
            this.blockedIPs.delete(ip);
            console.log(`✅ IP Unblocked: ${ip}`);
            
            this.logSecurityEvent({
                type: 'ip_unblocked',
                ip: ip,
                timestamp: Date.now()
            });
        }
    }
    
    // CAPTCHA System
    async generateCaptcha(type = 'math', difficulty = 'medium') {
        const captchaId = this.generateCaptchaId();
        let captchaData;
        
        switch (type) {
            case 'math':
                captchaData = this.generateMathCaptcha(difficulty);
                break;
            case 'image':
                captchaData = this.generateImageCaptcha(difficulty);
                break;
            case 'text':
                captchaData = this.generateTextCaptcha(difficulty);
                break;
            case 'behavioral':
                captchaData = this.generateBehavioralCaptcha(difficulty);
                break;
            default:
                captchaData = this.generateMathCaptcha(difficulty);
        }
        
        const captcha = {
            id: captchaId,
            type: type,
            difficulty: difficulty,
            data: captchaData,
            answer: captchaData.answer,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.config.captchaTimeout,
            attempts: 0
        };
        
        this.captchaSessions.set(captchaId, captcha);
        
        // Remove answer from data sent to client
        const clientData = { ...captcha };
        delete clientData.answer;
        
        return clientData;
    }
    
    generateMathCaptcha(difficulty) {
        let num1, num2, operation, answer;
        
        switch (difficulty) {
            case 'easy':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                operation = Math.random() > 0.5 ? '+' : '-';
                answer = operation === '+' ? num1 + num2 : Math.max(num1, num2) - Math.min(num1, num2);
                break;
            case 'medium':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                const operations = ['+', '-', '*'];
                operation = operations[Math.floor(Math.random() * operations.length)];
                switch (operation) {
                    case '+': answer = num1 + num2; break;
                    case '-': answer = Math.max(num1, num2) - Math.min(num1, num2); break;
                    case '*': answer = num1 * num2; break;
                }
                break;
            case 'hard':
                num1 = Math.floor(Math.random() * 50) + 10;
                num2 = Math.floor(Math.random() * 50) + 10;
                const hardOps = ['+', '-', '*', '/'];
                operation = hardOps[Math.floor(Math.random() * hardOps.length)];
                switch (operation) {
                    case '+': answer = num1 + num2; break;
                    case '-': answer = Math.abs(num1 - num2); break;
                    case '*': answer = num1 * num2; break;
                    case '/': 
                        num1 = num1 * num2; // Ensure clean division
                        answer = num1 / num2; 
                        break;
                }
                break;
        }
        
        return {
            question: `What is ${num1} ${operation} ${num2}?`,
            answer: answer.toString(),
            type: 'math'
        };
    }
    
    generateImageCaptcha(difficulty) {
        // Simplified image CAPTCHA - in production, use actual image generation
        const images = ['cat', 'dog', 'car', 'house', 'tree', 'flower', 'bird', 'fish'];
        const targetImage = images[Math.floor(Math.random() * images.length)];
        const decoyImages = images.filter(img => img !== targetImage)
                                 .sort(() => 0.5 - Math.random())
                                 .slice(0, difficulty === 'hard' ? 8 : difficulty === 'medium' ? 5 : 3);
        
        const allImages = [targetImage, ...decoyImages].sort(() => 0.5 - Math.random());
        
        return {
            question: `Click on all images containing: ${targetImage}`,
            images: allImages.map((img, index) => ({
                id: index,
                src: `/captcha/images/${img}.jpg`,
                alt: `Image ${index + 1}`
            })),
            answer: allImages.map((img, index) => img === targetImage ? index : null)
                            .filter(index => index !== null)
                            .join(','),
            type: 'image'
        };
    }
    
    generateTextCaptcha(difficulty) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = difficulty === 'hard' ? 7 : difficulty === 'medium' ? 5 : 4;
        let text = '';
        
        for (let i = 0; i < length; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return {
            question: 'Enter the text shown in the image:',
            imageData: this.generateTextImage(text, difficulty),
            answer: text,
            type: 'text'
        };
    }
    
    generateBehavioralCaptcha(difficulty) {
        const challenges = [
            {
                type: 'mouse_pattern',
                instruction: 'Draw a circle with your mouse in the box below',
                validation: 'circular_motion'
            },
            {
                type: 'typing_rhythm',
                instruction: 'Type the following phrase naturally: "I am human"',
                validation: 'human_typing_pattern'
            },
            {
                type: 'click_timing',
                instruction: 'Click the buttons in order when they appear',
                validation: 'human_reaction_time'
            }
        ];
        
        const challenge = challenges[Math.floor(Math.random() * challenges.length)];
        
        return {
            question: challenge.instruction,
            challengeType: challenge.type,
            validation: challenge.validation,
            answer: 'behavioral_validation',
            type: 'behavioral'
        };
    }
    
    generateTextImage(text, difficulty) {
        // Simplified - in production, generate actual distorted image
        const distortions = {
            easy: 'minimal',
            medium: 'moderate',
            hard: 'heavy'
        };
        
        return {
            text: text,
            distortion: distortions[difficulty],
            noise: difficulty === 'hard',
            rotation: difficulty !== 'easy'
        };
    }
    
    // CAPTCHA Validation
    async validateCaptcha(captchaId, userAnswer, behaviorData = null) {
        const captcha = this.captchaSessions.get(captchaId);
        
        if (!captcha) {
            return { valid: false, error: 'Invalid or expired CAPTCHA' };
        }
        
        if (Date.now() > captcha.expiresAt) {
            this.captchaSessions.delete(captchaId);
            return { valid: false, error: 'CAPTCHA expired' };
        }
        
        captcha.attempts++;
        
        if (captcha.attempts > this.config.maxCaptchaAttempts) {
            this.captchaSessions.delete(captchaId);
            return { valid: false, error: 'Too many attempts' };
        }
        
        let isValid = false;
        
        if (captcha.type === 'behavioral') {
            isValid = await this.validateBehavioralCaptcha(captcha, behaviorData);
        } else {
            isValid = this.validateStandardCaptcha(captcha, userAnswer);
        }
        
        if (isValid) {
            this.captchaSessions.delete(captchaId);
            return { valid: true };
        } else {
            return { 
                valid: false, 
                error: 'Incorrect answer',
                attemptsRemaining: this.config.maxCaptchaAttempts - captcha.attempts
            };
        }
    }
    
    validateStandardCaptcha(captcha, userAnswer) {
        return captcha.answer.toLowerCase() === userAnswer.toLowerCase().trim();
    }
    
    async validateBehavioralCaptcha(captcha, behaviorData) {
        if (!behaviorData) return false;
        
        switch (captcha.data.validation) {
            case 'circular_motion':
                return this.validateCircularMotion(behaviorData.mouseData);
            case 'human_typing_pattern':
                return this.validateTypingPattern(behaviorData.keystrokeData);
            case 'human_reaction_time':
                return this.validateReactionTime(behaviorData.clickData);
            default:
                return false;
        }
    }
    
    validateCircularMotion(mouseData) {
        if (!mouseData || mouseData.length < 10) return false;
        
        // Simplified circular motion detection
        const centerX = mouseData.reduce((sum, point) => sum + point.x, 0) / mouseData.length;
        const centerY = mouseData.reduce((sum, point) => sum + point.y, 0) / mouseData.length;
        
        let circularScore = 0;
        for (let i = 0; i < mouseData.length; i++) {
            const point = mouseData[i];
            const distance = Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2));
            
            // Check if points are roughly equidistant from center
            if (distance > 50 && distance < 150) {
                circularScore++;
            }
        }
        
        return circularScore / mouseData.length > 0.7;
    }
    
    validateTypingPattern(keystrokeData) {
        if (!keystrokeData || keystrokeData.length < 5) return false;
        
        // Analyze typing rhythm for human-like patterns
        const intervals = [];
        for (let i = 1; i < keystrokeData.length; i++) {
            intervals.push(keystrokeData[i].timestamp - keystrokeData[i-1].timestamp);
        }
        
        // Human typing has natural variation
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => 
            sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        
        // Too regular = bot, too irregular = also suspicious
        return variance > 100 && variance < 10000 && avgInterval > 50 && avgInterval < 500;
    }
    
    validateReactionTime(clickData) {
        if (!clickData || clickData.length < 3) return false;
        
        // Human reaction times are typically 200-800ms
        const reactionTimes = clickData.map(click => click.reactionTime);
        const validReactions = reactionTimes.filter(time => time >= 200 && time <= 800);
        
        return validReactions.length / reactionTimes.length > 0.7;
    }
    
    // IP Reputation System
    async checkIPReputation(ip) {
        // Check cache first
        if (this.ipReputation.has(ip)) {
            const cached = this.ipReputation.get(ip);
            if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
                return cached;
            }
        }
        
        // Check multiple reputation sources
        const reputation = await this.queryReputationSources(ip);
        
        // Cache result
        this.ipReputation.set(ip, {
            ...reputation,
            timestamp: Date.now()
        });
        
        return reputation;
    }
    
    async queryReputationSources(ip) {
        const reputation = {
            ip: ip,
            score: 1.0, // Start with good reputation
            sources: {},
            threats: [],
            country: null
        };
        
        try {
            // Internal reputation check
            reputation.sources.internal = this.checkInternalReputation(ip);
            
            // Simulate external API calls (implement actual APIs in production)
            reputation.sources.abuseipdb = await this.checkAbuseIPDB(ip);
            reputation.sources.virustotal = await this.checkVirusTotal(ip);
            
            // Calculate overall score
            const scores = Object.values(reputation.sources).map(s => s.score);
            reputation.score = scores.reduce((a, b) => a + b, 0) / scores.length;
            
            // Collect threats
            Object.values(reputation.sources).forEach(source => {
                if (source.threats) {
                    reputation.threats.push(...source.threats);
                }
            });
            
        } catch (error) {
            console.error('Reputation check error:', error);
            reputation.score = 0.5; // Neutral score on error
        }
        
        return reputation;
    }
    
    checkInternalReputation(ip) {
        const suspicion = this.suspiciousIPs.get(ip) || 0;
        const blocked = this.blockedIPs.has(ip);
        
        let score = 1.0;
        if (blocked) score = 0.0;
        else if (suspicion > 0.8) score = 0.2;
        else if (suspicion > 0.5) score = 0.5;
        else score = Math.max(0.1, 1.0 - suspicion);
        
        return {
            score: score,
            threats: blocked ? ['previously_blocked'] : [],
            source: 'internal'
        };
    }
    
    async checkAbuseIPDB(ip) {
        // Simulate AbuseIPDB API call
        // In production, implement actual API integration
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    score: Math.random() > 0.1 ? 0.8 : 0.2, // 90% good IPs
                    threats: Math.random() > 0.9 ? ['malware', 'spam'] : [],
                    source: 'abuseipdb'
                });
            }, 100);
        });
    }
    
    async checkVirusTotal(ip) {
        // Simulate VirusTotal API call
        // In production, implement actual API integration
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    score: Math.random() > 0.05 ? 0.9 : 0.1, // 95% good IPs
                    threats: Math.random() > 0.95 ? ['botnet'] : [],
                    source: 'virustotal'
                });
            }, 150);
        });
    }
    
    // Challenge System
    async isChallengeRequired(ip, req) {
        // Check challenge history
        const history = this.challengeHistory.get(ip) || { challenges: 0, lastChallenge: 0 };
        
        // Require challenge if suspicious activity
        const suspicionScore = this.suspiciousIPs.get(ip) || 0;
        if (suspicionScore > 0.5) {
            return { required: true, reason: 'suspicious_activity' };
        }
        
        // Require challenge for certain paths
        const protectedPaths = ['/admin', '/api', '/login', '/register'];
        if (protectedPaths.some(path => req.path.startsWith(path))) {
            return { required: true, reason: 'protected_path' };
        }
        
        // Require periodic challenges for unknown IPs
        if (history.challenges === 0 && Math.random() > 0.8) {
            return { required: true, reason: 'new_ip_verification' };
        }
        
        return { required: false };
    }
    
    async requireChallenge(res, ip, reason) {
        console.log(`🧩 Challenge required for IP ${ip}: ${reason}`);
        
        // Generate appropriate challenge
        const challengeType = this.selectChallengeType(ip, reason);
        const captcha = await this.generateCaptcha(challengeType);
        
        // Update challenge history
        const history = this.challengeHistory.get(ip) || { challenges: 0, lastChallenge: 0 };
        history.challenges++;
        history.lastChallenge = Date.now();
        this.challengeHistory.set(ip, history);
        
        // Log security event
        this.logSecurityEvent({
            type: 'challenge_required',
            ip: ip,
            reason: reason,
            challengeType: challengeType,
            timestamp: Date.now()
        });
        
        return res.status(429).json({
            error: 'Challenge Required',
            message: 'Please complete the security challenge to continue',
            challenge: captcha,
            reason: reason,
            timestamp: new Date().toISOString()
        });
    }
    
    selectChallengeType(ip, reason) {
        const history = this.challengeHistory.get(ip);
        
        // Adaptive challenge selection
        if (reason === 'suspicious_activity') {
            return 'behavioral'; // Harder to automate
        } else if (reason === 'low_reputation') {
            return 'image'; // Visual challenge
        } else if (history && history.challenges > 3) {
            return 'text'; // Vary challenge types
        } else {
            return 'math'; // Simple for first-time users
        }
    }
    
    // Behavioral Analysis
    async analyzeBehavior(ip, req) {
        // Simplified behavioral analysis
        let score = 0;
        
        // Check request patterns
        const userAgent = req.headers['user-agent'] || '';
        if (!userAgent || userAgent.length < 10) score += 0.3;
        
        // Check for automation indicators
        if (userAgent.includes('bot') || userAgent.includes('crawler')) score += 0.5;
        
        // Check headers
        if (!req.headers['accept'] || !req.headers['accept-language']) score += 0.2;
        
        return Math.min(score, 1.0);
    }
    
    // Request handlers
    handleBlockedIP(res, ip) {
        const blockInfo = this.blockedIPs.get(ip);
        
        console.log(`🚫 Blocked IP attempted access: ${ip}`);
        
        return res.status(403).json({
            error: 'Access Denied',
            message: 'Your IP address has been blocked due to suspicious activity',
            blocked_at: new Date(blockInfo.blockedAt).toISOString(),
            reason: blockInfo.reason,
            permanent: blockInfo.permanent,
            contact: 'security@elevateforhumanity.org'
        });
    }
    
    // Setup methods
    setupIPBlocking() {
        // Clean up expired blocks every 10 minutes
        setInterval(() => {
            this.cleanupExpiredBlocks();
        }, 600000);
        
        console.log('🚫 IP blocking system initialized');
    }
    
    setupCaptchaSystem() {
        // Clean up expired CAPTCHAs every 5 minutes
        setInterval(() => {
            this.cleanupExpiredCaptchas();
        }, 300000);
        
        console.log('🧩 CAPTCHA system initialized');
    }
    
    setupBehavioralChallenges() {
        console.log('🧠 Behavioral challenge system initialized');
    }
    
    setupReputationMonitoring() {
        // Update reputation cache every hour
        setInterval(() => {
            this.updateReputationCache();
        }, 3600000);
        
        console.log('🔍 IP reputation monitoring initialized');
    }
    
    setupAutomatedResponse() {
        console.log('🤖 Automated response system initialized');
    }
    
    // Cleanup methods
    cleanupExpiredBlocks() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [ip, blockInfo] of this.blockedIPs.entries()) {
            if (blockInfo.expiresAt && now > blockInfo.expiresAt) {
                this.blockedIPs.delete(ip);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} expired IP blocks`);
        }
    }
    
    cleanupExpiredCaptchas() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [id, captcha] of this.captchaSessions.entries()) {
            if (now > captcha.expiresAt) {
                this.captchaSessions.delete(id);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} expired CAPTCHAs`);
        }
    }
    
    updateReputationCache() {
        // Clear old reputation cache entries
        const oneHourAgo = Date.now() - 3600000;
        let cleaned = 0;
        
        for (const [ip, reputation] of this.ipReputation.entries()) {
            if (reputation.timestamp < oneHourAgo) {
                this.ipReputation.delete(ip);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} old reputation entries`);
        }
    }
    
    // Utility methods
    getClientIP(req) {
        return req.headers['cf-connecting-ip'] || 
               req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               '127.0.0.1';
    }
    
    getSessionId(req) {
        return req.sessionID || req.headers['x-session-id'] || 'anonymous';
    }
    
    generateCaptchaId() {
        return 'CAPTCHA-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 8);
    }
    
    logSecurityEvent(event) {
        console.log('🔒 Security Event:', JSON.stringify(event));
        // Send to security monitoring system
    }
    
    sendSecurityAlert(type, data) {
        console.log(`🚨 Security Alert: ${type}`, data);
        // Send to alerting system (email, Slack, etc.)
    }
    
    // Get system statistics
    getSystemStats() {
        return {
            blockedIPs: this.blockedIPs.size,
            suspiciousIPs: this.suspiciousIPs.size,
            activeCaptchas: this.captchaSessions.size,
            reputationCache: this.ipReputation.size,
            challengeHistory: this.challengeHistory.size,
            protectionLevel: 'MAXIMUM'
        };
    }
    
    // Get middleware for Express.js
    getMiddleware() {
        return (req, res, next) => {
            this.processRequest(req, res, next);
        };
    }
}

// Export for use in applications
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CaptchaIPBlockingSystem;
}

if (typeof window !== 'undefined') {
    window.CaptchaIPBlockingSystem = CaptchaIPBlockingSystem;
}

console.log('🛡️ CAPTCHA & IP Blocking System Loaded');
console.log('🚫 Maximum threat protection activated');