/**
 * Advanced Autopilot Orchestrator
 * Intelligent task scheduling, self-healing, and autonomous operations
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class AutopilotOrchestrator extends EventEmitter {
  constructor() {
    super();
    
    this.dataDir = path.join(process.cwd(), '.data/autopilot');
    this.stateFile = path.join(this.dataDir, 'orchestrator-state.json');
    this.tasksFile = path.join(this.dataDir, 'tasks.json');
    this.metricsFile = path.join(this.dataDir, 'metrics.json');
    this.logsFile = path.join(this.dataDir, 'orchestrator.log');
    
    this.state = this.loadState();
    this.tasks = this.loadTasks();
    this.metrics = this.loadMetrics();
    
    this.taskExecutors = new Map();
    this.scheduledTasks = new Map();
    this.runningTasks = new Map();
    
    this.ensureDataDir();
    this.registerDefaultExecutors();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Load orchestrator state
   */
  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        return JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
      }
    } catch (error) {
      this.log('error', 'Failed to load state', { error: error.message });
    }
    
    return {
      status: 'idle',
      startedAt: null,
      lastCycle: null,
      cycleCount: 0,
      health: {
        status: 'healthy',
        lastCheck: Date.now(),
        issues: []
      }
    };
  }

  /**
   * Save orchestrator state
   */
  saveState() {
    try {
      fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (error) {
      this.log('error', 'Failed to save state', { error: error.message });
    }
  }

  /**
   * Load tasks
   */
  loadTasks() {
    try {
      if (fs.existsSync(this.tasksFile)) {
        return JSON.parse(fs.readFileSync(this.tasksFile, 'utf8'));
      }
    } catch (error) {
      this.log('error', 'Failed to load tasks', { error: error.message });
    }
    
    return [];
  }

  /**
   * Save tasks
   */
  saveTasks() {
    try {
      fs.writeFileSync(this.tasksFile, JSON.stringify(this.tasks, null, 2), 'utf8');
    } catch (error) {
      this.log('error', 'Failed to save tasks', { error: error.message });
    }
  }

  /**
   * Load metrics
   */
  loadMetrics() {
    try {
      if (fs.existsSync(this.metricsFile)) {
        return JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
      }
    } catch (error) {
      this.log('error', 'Failed to load metrics', { error: error.message });
    }
    
    return {
      tasksExecuted: 0,
      tasksSucceeded: 0,
      tasksFailed: 0,
      tasksRetried: 0,
      averageExecutionTime: 0,
      lastUpdated: Date.now()
    };
  }

  /**
   * Save metrics
   */
  saveMetrics() {
    try {
      this.metrics.lastUpdated = Date.now();
      fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2), 'utf8');
    } catch (error) {
      this.log('error', 'Failed to save metrics', { error: error.message });
    }
  }

  /**
   * Log message
   */
  log(level, message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    };
    
    const logLine = JSON.stringify(entry) + '\n';
    
    try {
      fs.appendFileSync(this.logsFile, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write log:', error.message);
    }
    
    // Emit log event
    this.emit('log', entry);
    
    // Console output
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍'
    }[level] || '📝';
    
    console.log(`${emoji} [${level.toUpperCase()}] ${message}`, data);
  }

  /**
   * Register default task executors
   */
  registerDefaultExecutors() {
    // Health check executor
    this.registerExecutor('health_check', async (task) => {
      const health = await this.performHealthCheck();
      return { success: true, health };
    });

    // Metrics snapshot executor
    this.registerExecutor('metrics_snapshot', async (task) => {
      const snapshot = this.captureMetricsSnapshot();
      return { success: true, snapshot };
    });

    // Route validation executor
    this.registerExecutor('route_validation', async (task) => {
      const routeValidator = require('./route-validator.cjs');
      const { validation } = routeValidator.run(false);
      return { 
        success: validation.issues.length === 0, 
        validation,
        autoFixed: false
      };
    });

    // Route auto-fix executor
    this.registerExecutor('route_autofix', async (task) => {
      const routeValidator = require('./route-validator.cjs');
      const { validation, fixResults } = routeValidator.run(true);
      return { 
        success: fixResults?.success || false, 
        validation,
        fixResults
      };
    });

    // Security scan executor
    this.registerExecutor('security_scan', async (task) => {
      const duplicationScanner = require('./duplication-scanner.cjs');
      const content = task.payload?.content || 'Sample content for security scan';
      const result = await duplicationScanner.scanContent(content, {
        searchEngines: ['duckduckgo'],
        maxPhrases: 3,
        saveHistory: true
      });
      return { success: true, scan: result };
    });

    // Build verification executor
    this.registerExecutor('build_verification', async (task) => {
      const { execSync } = require('child_process');
      try {
        execSync('npm run build', { 
          stdio: 'pipe',
          timeout: 120000 // 2 minutes
        });
        return { success: true, message: 'Build successful' };
      } catch (error) {
        return { 
          success: false, 
          message: 'Build failed',
          error: error.message
        };
      }
    });

    // Cleanup executor
    this.registerExecutor('cleanup', async (task) => {
      const cleaned = await this.performCleanup(task.payload);
      return { success: true, cleaned };
    });

    // Self-healing executor
    this.registerExecutor('self_healing', async (task) => {
      const healed = await this.performSelfHealing();
      return { success: true, healed };
    });
  }

  /**
   * Register task executor
   */
  registerExecutor(type, executor) {
    this.taskExecutors.set(type, executor);
    this.log('info', `Registered executor: ${type}`);
  }

  /**
   * Schedule task
   */
  scheduleTask(type, payload = {}, options = {}) {
    const task = {
      id: this.generateTaskId(),
      type,
      payload,
      status: 'scheduled',
      priority: options.priority || 5,
      retries: 0,
      maxRetries: options.maxRetries || 3,
      timeout: options.timeout || 60000,
      scheduledAt: Date.now(),
      executeAt: options.executeAt || Date.now(),
      recurring: options.recurring || false,
      interval: options.interval || null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.tasks.push(task);
    this.saveTasks();
    
    this.log('info', `Task scheduled: ${type}`, { taskId: task.id });
    this.emit('task:scheduled', task);
    
    return task;
  }

  /**
   * Execute task
   */
  async executeTask(task) {
    if (!this.taskExecutors.has(task.type)) {
      this.log('error', `No executor for task type: ${task.type}`, { taskId: task.id });
      task.status = 'failed';
      task.error = 'No executor found';
      task.updatedAt = Date.now();
      this.saveTasks();
      return;
    }

    task.status = 'running';
    task.startedAt = Date.now();
    task.updatedAt = Date.now();
    this.runningTasks.set(task.id, task);
    this.saveTasks();

    this.log('info', `Executing task: ${task.type}`, { taskId: task.id });
    this.emit('task:started', task);

    const executor = this.taskExecutors.get(task.type);
    const startTime = Date.now();

    try {
      // Execute with timeout
      const result = await Promise.race([
        executor(task),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Task timeout')), task.timeout)
        )
      ]);

      const executionTime = Date.now() - startTime;

      task.status = result.success ? 'completed' : 'failed';
      task.result = result;
      task.executionTime = executionTime;
      task.completedAt = Date.now();
      task.updatedAt = Date.now();

      // Update metrics
      this.metrics.tasksExecuted++;
      if (result.success) {
        this.metrics.tasksSucceeded++;
      } else {
        this.metrics.tasksFailed++;
      }
      
      // Update average execution time
      this.metrics.averageExecutionTime = 
        (this.metrics.averageExecutionTime * (this.metrics.tasksExecuted - 1) + executionTime) / 
        this.metrics.tasksExecuted;

      this.saveMetrics();

      this.log(result.success ? 'success' : 'error', 
        `Task ${result.success ? 'completed' : 'failed'}: ${task.type}`, 
        { taskId: task.id, executionTime });

      this.emit('task:completed', task);

      // Handle recurring tasks
      if (task.recurring && task.interval) {
        this.scheduleTask(task.type, task.payload, {
          priority: task.priority,
          maxRetries: task.maxRetries,
          timeout: task.timeout,
          recurring: true,
          interval: task.interval,
          executeAt: Date.now() + task.interval
        });
      }

    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.executionTime = Date.now() - startTime;
      task.updatedAt = Date.now();

      this.metrics.tasksExecuted++;
      this.metrics.tasksFailed++;
      this.saveMetrics();

      this.log('error', `Task failed: ${task.type}`, { 
        taskId: task.id, 
        error: error.message 
      });

      this.emit('task:failed', task);

      // Retry logic
      if (task.retries < task.maxRetries) {
        task.retries++;
        task.status = 'scheduled';
        task.executeAt = Date.now() + (1000 * Math.pow(2, task.retries)); // Exponential backoff
        
        this.metrics.tasksRetried++;
        this.saveMetrics();

        this.log('warning', `Retrying task: ${task.type}`, { 
          taskId: task.id, 
          retry: task.retries 
        });

        this.emit('task:retry', task);
      }
    } finally {
      this.runningTasks.delete(task.id);
      this.saveTasks();
    }
  }

  /**
   * Process task queue
   */
  async processQueue() {
    const now = Date.now();
    
    // Get tasks ready to execute
    const readyTasks = this.tasks
      .filter(task => 
        task.status === 'scheduled' && 
        task.executeAt <= now
      )
      .sort((a, b) => b.priority - a.priority); // Higher priority first

    if (readyTasks.length === 0) {
      return;
    }

    this.log('info', `Processing ${readyTasks.length} tasks`);

    // Execute tasks (limit concurrent execution)
    const maxConcurrent = 5;
    const executing = [];

    for (const task of readyTasks.slice(0, maxConcurrent)) {
      executing.push(this.executeTask(task));
    }

    await Promise.allSettled(executing);
  }

  /**
   * Start autopilot
   */
  async start(options = {}) {
    if (this.state.status === 'running') {
      this.log('warning', 'Autopilot already running');
      return;
    }

    this.state.status = 'running';
    this.state.startedAt = Date.now();
    this.saveState();

    this.log('success', 'Autopilot started');
    this.emit('autopilot:started');

    const interval = options.interval || 60000; // 1 minute default

    // Main loop
    this.mainLoop = setInterval(async () => {
      try {
        await this.cycle();
      } catch (error) {
        this.log('error', 'Cycle error', { error: error.message });
      }
    }, interval);

    // Initial cycle
    await this.cycle();
  }

  /**
   * Stop autopilot
   */
  stop() {
    if (this.state.status !== 'running') {
      this.log('warning', 'Autopilot not running');
      return;
    }

    if (this.mainLoop) {
      clearInterval(this.mainLoop);
      this.mainLoop = null;
    }

    this.state.status = 'stopped';
    this.saveState();

    this.log('success', 'Autopilot stopped');
    this.emit('autopilot:stopped');
  }

  /**
   * Execute one cycle
   */
  async cycle() {
    this.state.cycleCount++;
    this.state.lastCycle = Date.now();
    this.saveState();

    this.log('info', `Cycle ${this.state.cycleCount} started`);
    this.emit('cycle:started', this.state.cycleCount);

    // Process task queue
    await this.processQueue();

    // Perform health check
    await this.performHealthCheck();

    // Clean up old tasks
    this.cleanupOldTasks();

    this.log('info', `Cycle ${this.state.cycleCount} completed`);
    this.emit('cycle:completed', this.state.cycleCount);
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    const health = {
      status: 'healthy',
      lastCheck: Date.now(),
      issues: [],
      checks: {}
    };

    // Check disk space
    try {
      const { execSync } = require('child_process');
      const df = execSync('df -h .').toString();
      const usage = df.split('\n')[1].split(/\s+/)[4];
      const usagePercent = parseInt(usage);
      
      health.checks.diskSpace = {
        status: usagePercent < 90 ? 'ok' : 'warning',
        usage: usage
      };
      
      if (usagePercent >= 90) {
        health.issues.push('Disk space usage high');
        health.status = 'degraded';
      }
    } catch (error) {
      health.checks.diskSpace = { status: 'error', error: error.message };
    }

    // Check running tasks
    health.checks.runningTasks = {
      status: this.runningTasks.size < 10 ? 'ok' : 'warning',
      count: this.runningTasks.size
    };

    if (this.runningTasks.size >= 10) {
      health.issues.push('Too many running tasks');
      health.status = 'degraded';
    }

    // Check failed tasks
    const recentFailed = this.tasks.filter(t => 
      t.status === 'failed' && 
      Date.now() - t.updatedAt < 3600000 // Last hour
    ).length;

    health.checks.failedTasks = {
      status: recentFailed < 5 ? 'ok' : 'warning',
      count: recentFailed
    };

    if (recentFailed >= 5) {
      health.issues.push('High failure rate');
      health.status = 'degraded';
    }

    this.state.health = health;
    this.saveState();

    if (health.status !== 'healthy') {
      this.log('warning', 'Health check issues detected', { health });
      this.emit('health:degraded', health);
    }

    return health;
  }

  /**
   * Perform self-healing
   */
  async performSelfHealing() {
    const healed = [];

    // Restart stuck tasks
    const stuckTasks = this.tasks.filter(t => 
      t.status === 'running' && 
      Date.now() - t.startedAt > t.timeout * 2
    );

    for (const task of stuckTasks) {
      task.status = 'scheduled';
      task.executeAt = Date.now();
      task.retries++;
      healed.push({ type: 'restart_stuck_task', taskId: task.id });
    }

    // Clean up zombie tasks
    const zombieTasks = this.tasks.filter(t => 
      t.status === 'running' && 
      !this.runningTasks.has(t.id)
    );

    for (const task of zombieTasks) {
      task.status = 'failed';
      task.error = 'Zombie task cleaned up';
      healed.push({ type: 'cleanup_zombie_task', taskId: task.id });
    }

    if (healed.length > 0) {
      this.saveTasks();
      this.log('success', `Self-healing completed: ${healed.length} issues fixed`, { healed });
    }

    return healed;
  }

  /**
   * Perform cleanup
   */
  async performCleanup(options = {}) {
    const cleaned = [];
    const maxAge = options.maxAge || 86400000; // 24 hours default

    // Remove old completed tasks
    const oldTasks = this.tasks.filter(t => 
      (t.status === 'completed' || t.status === 'failed') &&
      Date.now() - t.updatedAt > maxAge
    );

    this.tasks = this.tasks.filter(t => !oldTasks.includes(t));
    cleaned.push({ type: 'old_tasks', count: oldTasks.length });

    // Trim logs
    try {
      const stats = fs.statSync(this.logsFile);
      if (stats.size > 10 * 1024 * 1024) { // 10MB
        const logs = fs.readFileSync(this.logsFile, 'utf8').split('\n');
        const trimmed = logs.slice(-10000).join('\n'); // Keep last 10k lines
        fs.writeFileSync(this.logsFile, trimmed, 'utf8');
        cleaned.push({ type: 'logs', trimmed: logs.length - 10000 });
      }
    } catch (error) {
      // Ignore
    }

    this.saveTasks();

    if (cleaned.length > 0) {
      this.log('success', 'Cleanup completed', { cleaned });
    }

    return cleaned;
  }

  /**
   * Clean up old tasks
   */
  cleanupOldTasks() {
    const maxAge = 86400000; // 24 hours
    const before = this.tasks.length;

    this.tasks = this.tasks.filter(t => 
      !(t.status === 'completed' && Date.now() - t.updatedAt > maxAge)
    );

    const removed = before - this.tasks.length;
    if (removed > 0) {
      this.saveTasks();
      this.log('info', `Cleaned up ${removed} old tasks`);
    }
  }

  /**
   * Capture metrics snapshot
   */
  captureMetricsSnapshot() {
    return {
      timestamp: Date.now(),
      tasks: {
        total: this.tasks.length,
        scheduled: this.tasks.filter(t => t.status === 'scheduled').length,
        running: this.runningTasks.size,
        completed: this.tasks.filter(t => t.status === 'completed').length,
        failed: this.tasks.filter(t => t.status === 'failed').length
      },
      metrics: { ...this.metrics },
      health: { ...this.state.health }
    };
  }

  /**
   * Generate task ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      status: this.state.status,
      startedAt: this.state.startedAt,
      lastCycle: this.state.lastCycle,
      cycleCount: this.state.cycleCount,
      health: this.state.health,
      tasks: {
        total: this.tasks.length,
        scheduled: this.tasks.filter(t => t.status === 'scheduled').length,
        running: this.runningTasks.size,
        completed: this.tasks.filter(t => t.status === 'completed').length,
        failed: this.tasks.filter(t => t.status === 'failed').length
      },
      metrics: this.metrics
    };
  }

  /**
   * Get tasks
   */
  getTasks(filter = {}) {
    let filtered = [...this.tasks];

    if (filter.status) {
      filtered = filtered.filter(t => t.status === filter.status);
    }

    if (filter.type) {
      filtered = filtered.filter(t => t.type === filter.type);
    }

    if (filter.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }

  /**
   * Get task by ID
   */
  getTask(taskId) {
    return this.tasks.find(t => t.id === taskId);
  }

  /**
   * Cancel task
   */
  cancelTask(taskId) {
    const task = this.getTask(taskId);
    if (!task) {
      return false;
    }

    if (task.status === 'running') {
      this.log('warning', 'Cannot cancel running task', { taskId });
      return false;
    }

    task.status = 'cancelled';
    task.updatedAt = Date.now();
    this.saveTasks();

    this.log('info', 'Task cancelled', { taskId });
    this.emit('task:cancelled', task);

    return true;
  }
}

module.exports = new AutopilotOrchestrator();
