#!/usr/bin/env node

/**
 * Copilot-Enhanced Auto-Scaling Deployment Engine
 * Intelligent deployment system with AI-driven scaling and monitoring
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');

class CopilotDeploymentEngine {
    constructor() {
        this.config = {
            environment: process.env.NODE_ENV || 'production',
            port: process.env.PORT || 3000,
            maxInstances: parseInt(process.env.MAX_INSTANCES) || os.cpus().length,
            minInstances: parseInt(process.env.MIN_INSTANCES) || 1,
            scaleThreshold: {
                cpu: 70,
                memory: 80,
                responseTime: 1000
            },
            healthCheck: {
                interval: 30000,
                timeout: 5000,
                retries: 3
            }
        };
        
        this.instances = new Map();
        this.metrics = {
            cpu: [],
            memory: [],
            responseTime: [],
            requests: 0,
            errors: 0
        };
        
        this.copilot = new AIDeploymentCopilot();
        this.isRunning = false;
    }

    async deploy() {
        console.log('🚀 Starting Copilot-Enhanced Auto-Scaling Deployment...');
        
        try {
            // Pre-deployment checks
            await this.runPreDeploymentChecks();
            
            // Initialize copilot intelligence
            await this.copilot.initialize();
            
            // Deploy initial instances
            await this.deployInitialInstances();
            
            // Start monitoring and scaling
            this.startMonitoring();
            
            // Start load balancer
            await this.startLoadBalancer();
            
            console.log('✅ Deployment successful! System is running with intelligent auto-scaling.');
            this.isRunning = true;
            
            return {
                status: 'success',
                instances: this.instances.size,
                port: this.config.port,
                environment: this.config.environment
            };
            
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            await this.cleanup();
            throw error;
        }
    }

    async runPreDeploymentChecks() {
        console.log('🔍 Running pre-deployment checks...');
        
        const checks = [
            this.checkSystemResources(),
            this.checkDependencies(),
            this.checkConfiguration(),
            this.checkHealthEndpoints()
        ];
        
        const results = await Promise.allSettled(checks);
        const failures = results.filter(r => r.status === 'rejected');
        
        if (failures.length > 0) {
            throw new Error(`Pre-deployment checks failed: ${failures.map(f => f.reason).join(', ')}`);
        }
        
        console.log('✅ All pre-deployment checks passed');
    }

    async checkSystemResources() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memUsage = ((totalMem - freeMem) / totalMem) * 100;
        
        if (memUsage > 90) {
            throw new Error(`Insufficient memory: ${memUsage.toFixed(1)}% used`);
        }
        
        const loadAvg = os.loadavg()[0];
        const cpuCount = os.cpus().length;
        
        if (loadAvg > cpuCount * 0.8) {
            throw new Error(`High system load: ${loadAvg.toFixed(2)}`);
        }
    }

    async checkDependencies() {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Check if node_modules exists
        if (!fs.existsSync('node_modules')) {
            throw new Error('Dependencies not installed. Run npm install first.');
        }
        
        // Verify critical dependencies
        const criticalDeps = ['express', 'cors', 'helmet'];
        for (const dep of criticalDeps) {
            if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
                console.warn(`⚠️ Missing recommended dependency: ${dep}`);
            }
        }
    }

    async checkConfiguration() {
        // Validate environment variables
        const requiredEnvVars = ['NODE_ENV'];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                console.warn(`⚠️ Missing environment variable: ${envVar}`);
            }
        }
        
        // Check port availability
        return new Promise((resolve, reject) => {
            const server = require('net').createServer();
            server.listen(this.config.port, (err) => {
                if (err) {
                    reject(new Error(`Port ${this.config.port} is already in use`));
                } else {
                    server.close();
                    resolve();
                }
            });
        });
    }

    async checkHealthEndpoints() {
        // Verify application has health endpoints
        const appFiles = ['app.js', 'server.js', 'index.js'];
        let mainFile = null;
        
        for (const file of appFiles) {
            if (fs.existsSync(file)) {
                mainFile = file;
                break;
            }
        }
        
        if (!mainFile) {
            throw new Error('No main application file found');
        }
        
        const content = fs.readFileSync(mainFile, 'utf8');
        if (!content.includes('/health') && !content.includes('/status')) {
            console.warn('⚠️ No health endpoint detected. Consider adding one for better monitoring.');
        }
    }

    async deployInitialInstances() {
        console.log(`🔄 Deploying ${this.config.minInstances} initial instances...`);
        
        for (let i = 0; i < this.config.minInstances; i++) {
            await this.createInstance(this.config.port + i);
        }
    }

    async createInstance(port) {
        const instanceId = `instance-${port}`;
        
        console.log(`🚀 Creating instance ${instanceId} on port ${port}...`);
        
        const instance = spawn('node', ['app.js'], {
            env: { ...process.env, PORT: port },
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        instance.stdout.on('data', (data) => {
            console.log(`[${instanceId}] ${data.toString().trim()}`);
        });
        
        instance.stderr.on('data', (data) => {
            console.error(`[${instanceId}] ERROR: ${data.toString().trim()}`);
        });
        
        instance.on('exit', (code) => {
            console.log(`[${instanceId}] Exited with code ${code}`);
            this.instances.delete(instanceId);
            
            // Auto-restart if unexpected exit
            if (code !== 0 && this.isRunning) {
                setTimeout(() => this.createInstance(port), 5000);
            }
        });
        
        this.instances.set(instanceId, {
            process: instance,
            port: port,
            startTime: Date.now(),
            status: 'starting'
        });
        
        // Wait for instance to be ready
        await this.waitForInstanceReady(port);
        this.instances.get(instanceId).status = 'running';
        
        console.log(`✅ Instance ${instanceId} is ready`);
    }

    async waitForInstanceReady(port, timeout = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            try {
                const response = await this.makeHealthCheck(port);
                if (response) return true;
            } catch (error) {
                // Instance not ready yet
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        throw new Error(`Instance on port ${port} failed to start within ${timeout}ms`);
    }

    async makeHealthCheck(port) {
        return new Promise((resolve, reject) => {
            const http = require('http');
            const req = http.get(`http://localhost:${port}/health`, { timeout: 5000 }, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Health check timeout')));
        });
    }

    startMonitoring() {
        console.log('📊 Starting intelligent monitoring system...');
        
        setInterval(async () => {
            await this.collectMetrics();
            await this.copilot.analyzeMetrics(this.metrics);
            await this.makeScalingDecisions();
        }, this.config.healthCheck.interval);
    }

    async collectMetrics() {
        // Collect system metrics
        const cpuUsage = await this.getCPUUsage();
        const memUsage = this.getMemoryUsage();
        
        this.metrics.cpu.push(cpuUsage);
        this.metrics.memory.push(memUsage);
        
        // Keep only last 10 measurements
        if (this.metrics.cpu.length > 10) this.metrics.cpu.shift();
        if (this.metrics.memory.length > 10) this.metrics.memory.shift();
        
        // Collect instance metrics
        for (const [instanceId, instance] of this.instances) {
            try {
                const responseTime = await this.measureResponseTime(instance.port);
                this.metrics.responseTime.push(responseTime);
            } catch (error) {
                console.warn(`Failed to measure response time for ${instanceId}:`, error.message);
            }
        }
    }

    async getCPUUsage() {
        return new Promise((resolve) => {
            const startUsage = process.cpuUsage();
            setTimeout(() => {
                const endUsage = process.cpuUsage(startUsage);
                const totalUsage = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
                resolve(totalUsage);
            }, 100);
        });
    }

    getMemoryUsage() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        return ((totalMem - freeMem) / totalMem) * 100;
    }

    async measureResponseTime(port) {
        const start = Date.now();
        await this.makeHealthCheck(port);
        return Date.now() - start;
    }

    async makeScalingDecisions() {
        const avgCPU = this.metrics.cpu.reduce((a, b) => a + b, 0) / this.metrics.cpu.length;
        const avgMemory = this.metrics.memory.reduce((a, b) => a + b, 0) / this.metrics.memory.length;
        const avgResponseTime = this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length;
        
        const currentInstances = this.instances.size;
        
        // Scale up conditions
        if ((avgCPU > this.config.scaleThreshold.cpu || 
             avgMemory > this.config.scaleThreshold.memory || 
             avgResponseTime > this.config.scaleThreshold.responseTime) &&
            currentInstances < this.config.maxInstances) {
            
            console.log('📈 Scaling up due to high load...');
            await this.scaleUp();
        }
        
        // Scale down conditions
        else if (avgCPU < this.config.scaleThreshold.cpu * 0.3 && 
                 avgMemory < this.config.scaleThreshold.memory * 0.3 && 
                 avgResponseTime < this.config.scaleThreshold.responseTime * 0.3 &&
                 currentInstances > this.config.minInstances) {
            
            console.log('📉 Scaling down due to low load...');
            await this.scaleDown();
        }
    }

    async scaleUp() {
        const newPort = this.config.port + this.instances.size;
        await this.createInstance(newPort);
        console.log(`✅ Scaled up to ${this.instances.size} instances`);
    }

    async scaleDown() {
        const instanceIds = Array.from(this.instances.keys());
        const instanceToRemove = instanceIds[instanceIds.length - 1];
        
        const instance = this.instances.get(instanceToRemove);
        instance.process.kill('SIGTERM');
        this.instances.delete(instanceToRemove);
        
        console.log(`✅ Scaled down to ${this.instances.size} instances`);
    }

    async startLoadBalancer() {
        console.log('⚖️ Starting intelligent load balancer...');
        
        const express = require('express');
        const httpProxy = require('http-proxy-middleware');
        
        const app = express();
        
        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                instances: this.instances.size,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            });
        });
        
        // Metrics endpoint
        app.get('/metrics', (req, res) => {
            res.json({
                instances: Array.from(this.instances.entries()).map(([id, instance]) => ({
                    id,
                    port: instance.port,
                    status: instance.status,
                    uptime: Date.now() - instance.startTime
                })),
                metrics: this.metrics,
                config: this.config
            });
        });
        
        // Proxy middleware with intelligent routing
        app.use('/', httpProxy({
            target: `http://localhost:${this.config.port}`,
            changeOrigin: true,
            router: (req) => {
                // Round-robin load balancing
                const instances = Array.from(this.instances.values());
                const healthyInstances = instances.filter(i => i.status === 'running');
                
                if (healthyInstances.length === 0) {
                    throw new Error('No healthy instances available');
                }
                
                const selectedInstance = healthyInstances[this.metrics.requests % healthyInstances.length];
                this.metrics.requests++;
                
                return `http://localhost:${selectedInstance.port}`;
            },
            onError: (err, req, res) => {
                this.metrics.errors++;
                console.error('Load balancer error:', err.message);
                res.status(503).json({ error: 'Service temporarily unavailable' });
            }
        }));
        
        const balancerPort = this.config.port - 1;
        app.listen(balancerPort, () => {
            console.log(`✅ Load balancer running on port ${balancerPort}`);
        });
    }

    async cleanup() {
        console.log('🧹 Cleaning up instances...');
        
        this.isRunning = false;
        
        for (const [instanceId, instance] of this.instances) {
            console.log(`Stopping ${instanceId}...`);
            instance.process.kill('SIGTERM');
        }
        
        this.instances.clear();
        console.log('✅ Cleanup complete');
    }

    async getStatus() {
        return {
            isRunning: this.isRunning,
            instances: this.instances.size,
            metrics: this.metrics,
            config: this.config,
            uptime: process.uptime()
        };
    }
}

class AIDeploymentCopilot {
    constructor() {
        this.learningData = {
            patterns: [],
            optimizations: [],
            predictions: []
        };
    }

    async initialize() {
        console.log('🤖 Initializing AI Deployment Copilot...');
        
        // Load historical data if available
        await this.loadLearningData();
        
        // Initialize prediction models
        this.initializePredictionModels();
        
        console.log('✅ AI Copilot ready');
    }

    async loadLearningData() {
        try {
            if (fs.existsSync('deployment-learning-data.json')) {
                const data = fs.readFileSync('deployment-learning-data.json', 'utf8');
                this.learningData = JSON.parse(data);
                console.log('📚 Loaded historical learning data');
            }
        } catch (error) {
            console.warn('⚠️ Could not load learning data:', error.message);
        }
    }

    initializePredictionModels() {
        // Simple prediction models for demonstration
        this.models = {
            loadPrediction: this.createLoadPredictionModel(),
            scalingOptimization: this.createScalingOptimizationModel(),
            performanceOptimization: this.createPerformanceOptimizationModel()
        };
    }

    createLoadPredictionModel() {
        return {
            predict: (metrics) => {
                // Simple moving average prediction
                const recentCPU = metrics.cpu.slice(-3);
                const recentMemory = metrics.memory.slice(-3);
                
                if (recentCPU.length < 3) return null;
                
                const cpuTrend = (recentCPU[2] - recentCPU[0]) / 2;
                const memoryTrend = (recentMemory[2] - recentMemory[0]) / 2;
                
                return {
                    predictedCPU: recentCPU[2] + cpuTrend,
                    predictedMemory: recentMemory[2] + memoryTrend,
                    confidence: Math.min(0.8, recentCPU.length / 10)
                };
            }
        };
    }

    createScalingOptimizationModel() {
        return {
            optimize: (currentInstances, metrics) => {
                const avgLoad = (metrics.cpu.reduce((a, b) => a + b, 0) / metrics.cpu.length) || 0;
                const optimalInstances = Math.ceil(avgLoad / 50); // Target 50% CPU per instance
                
                return {
                    recommendedInstances: Math.max(1, Math.min(8, optimalInstances)),
                    reasoning: `Based on ${avgLoad.toFixed(1)}% average CPU load`,
                    confidence: 0.7
                };
            }
        };
    }

    createPerformanceOptimizationModel() {
        return {
            suggest: (metrics) => {
                const suggestions = [];
                
                const avgResponseTime = metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length;
                
                if (avgResponseTime > 500) {
                    suggestions.push({
                        type: 'performance',
                        suggestion: 'Consider adding caching layer',
                        impact: 'high',
                        effort: 'medium'
                    });
                }
                
                if (metrics.errors > metrics.requests * 0.01) {
                    suggestions.push({
                        type: 'reliability',
                        suggestion: 'Implement circuit breaker pattern',
                        impact: 'high',
                        effort: 'high'
                    });
                }
                
                return suggestions;
            }
        };
    }

    async analyzeMetrics(metrics) {
        // Predict future load
        const loadPrediction = this.models.loadPrediction.predict(metrics);
        if (loadPrediction) {
            console.log(`🔮 Load prediction: CPU ${loadPrediction.predictedCPU.toFixed(1)}%, Memory ${loadPrediction.predictedMemory.toFixed(1)}%`);
        }
        
        // Get optimization suggestions
        const suggestions = this.models.performanceOptimization.suggest(metrics);
        if (suggestions.length > 0) {
            console.log('💡 AI Suggestions:');
            suggestions.forEach(s => console.log(`  - ${s.suggestion} (${s.impact} impact, ${s.effort} effort)`));
        }
        
        // Learn from current patterns
        this.learnFromMetrics(metrics);
    }

    learnFromMetrics(metrics) {
        // Store patterns for future learning
        this.learningData.patterns.push({
            timestamp: Date.now(),
            metrics: JSON.parse(JSON.stringify(metrics))
        });
        
        // Keep only recent patterns
        if (this.learningData.patterns.length > 100) {
            this.learningData.patterns.shift();
        }
        
        // Periodically save learning data
        if (this.learningData.patterns.length % 10 === 0) {
            this.saveLearningData();
        }
    }

    async saveLearningData() {
        try {
            fs.writeFileSync('deployment-learning-data.json', JSON.stringify(this.learningData, null, 2));
        } catch (error) {
            console.warn('⚠️ Could not save learning data:', error.message);
        }
    }
}

// CLI Interface
if (require.main === module) {
    const engine = new CopilotDeploymentEngine();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'deploy':
            engine.deploy().catch(console.error);
            break;
            
        case 'status':
            engine.getStatus().then(status => {
                console.log(JSON.stringify(status, null, 2));
            });
            break;
            
        case 'stop':
            engine.cleanup().then(() => process.exit(0));
            break;
            
        default:
            console.log(`
Usage: node copilot-deployment-engine.js <command>

Commands:
  deploy    Start the auto-scaling deployment
  status    Show current deployment status
  stop      Stop all instances and cleanup

Environment Variables:
  NODE_ENV        Environment (default: production)
  PORT           Base port (default: 3000)
  MAX_INSTANCES  Maximum instances (default: CPU count)
  MIN_INSTANCES  Minimum instances (default: 1)
            `);
    }
}

module.exports = CopilotDeploymentEngine;