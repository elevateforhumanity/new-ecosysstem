/**
 * Intelligent Task Scheduler
 * AI-powered task prioritization and scheduling
 */

const fs = require('fs');
const path = require('path');

class IntelligentScheduler {
  constructor() {
    this.dataDir = path.join(process.cwd(), '.data/autopilot');
    this.historyFile = path.join(this.dataDir, 'task-history.json');
    this.patternsFile = path.join(this.dataDir, 'learned-patterns.json');
    
    this.history = this.loadHistory();
    this.patterns = this.loadPatterns();
    
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Load task history
   */
  loadHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        return JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
      }
    } catch (error) {
      console.error('Failed to load history:', error.message);
    }
    return [];
  }

  /**
   * Save task history
   */
  saveHistory() {
    try {
      fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save history:', error.message);
    }
  }

  /**
   * Load learned patterns
   */
  loadPatterns() {
    try {
      if (fs.existsSync(this.patternsFile)) {
        return JSON.parse(fs.readFileSync(this.patternsFile, 'utf8'));
      }
    } catch (error) {
      console.error('Failed to load patterns:', error.message);
    }
    
    return {
      taskSuccessRates: {},
      optimalTimes: {},
      dependencies: {},
      resourceUsage: {},
      lastUpdated: Date.now()
    };
  }

  /**
   * Save learned patterns
   */
  savePatterns() {
    try {
      this.patterns.lastUpdated = Date.now();
      fs.writeFileSync(this.patternsFile, JSON.stringify(this.patterns, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save patterns:', error.message);
    }
  }

  /**
   * Record task execution
   */
  recordExecution(task) {
    const record = {
      taskId: task.id,
      type: task.type,
      status: task.status,
      executionTime: task.executionTime,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      retries: task.retries,
      priority: task.priority,
      timestamp: Date.now()
    };

    this.history.push(record);

    // Keep only last 1000 records
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000);
    }

    this.saveHistory();
    this.updatePatterns(record);
  }

  /**
   * Update learned patterns
   */
  updatePatterns(record) {
    // Update success rates
    if (!this.patterns.taskSuccessRates[record.type]) {
      this.patterns.taskSuccessRates[record.type] = {
        total: 0,
        succeeded: 0,
        failed: 0,
        rate: 0
      };
    }

    const stats = this.patterns.taskSuccessRates[record.type];
    stats.total++;
    
    if (record.status === 'completed') {
      stats.succeeded++;
    } else if (record.status === 'failed') {
      stats.failed++;
    }

    stats.rate = stats.succeeded / stats.total;

    // Update optimal times
    if (record.status === 'completed' && record.executionTime) {
      if (!this.patterns.optimalTimes[record.type]) {
        this.patterns.optimalTimes[record.type] = {
          samples: [],
          average: 0,
          min: Infinity,
          max: 0
        };
      }

      const times = this.patterns.optimalTimes[record.type];
      times.samples.push(record.executionTime);

      // Keep only last 100 samples
      if (times.samples.length > 100) {
        times.samples = times.samples.slice(-100);
      }

      times.average = times.samples.reduce((a, b) => a + b, 0) / times.samples.length;
      times.min = Math.min(...times.samples);
      times.max = Math.max(...times.samples);
    }

    // Update resource usage patterns
    const hour = new Date(record.startedAt).getHours();
    if (!this.patterns.resourceUsage[hour]) {
      this.patterns.resourceUsage[hour] = {
        taskCount: 0,
        averageExecutionTime: 0
      };
    }

    const usage = this.patterns.resourceUsage[hour];
    usage.taskCount++;
    
    if (record.executionTime) {
      usage.averageExecutionTime = 
        (usage.averageExecutionTime * (usage.taskCount - 1) + record.executionTime) / 
        usage.taskCount;
    }

    this.savePatterns();
  }

  /**
   * Calculate task priority
   */
  calculatePriority(task) {
    let priority = task.priority || 5;

    // Adjust based on success rate
    const successRate = this.patterns.taskSuccessRates[task.type]?.rate || 0.5;
    if (successRate < 0.5) {
      priority -= 1; // Lower priority for frequently failing tasks
    } else if (successRate > 0.9) {
      priority += 1; // Higher priority for reliable tasks
    }

    // Adjust based on retry count
    if (task.retries > 0) {
      priority += task.retries; // Increase priority for retried tasks
    }

    // Adjust based on age
    const age = Date.now() - task.createdAt;
    const ageHours = age / (1000 * 60 * 60);
    if (ageHours > 1) {
      priority += Math.floor(ageHours); // Increase priority for old tasks
    }

    // Adjust based on current load
    const currentHour = new Date().getHours();
    const currentLoad = this.patterns.resourceUsage[currentHour]?.taskCount || 0;
    if (currentLoad > 10) {
      priority -= 1; // Lower priority during high load
    }

    // Clamp priority between 1 and 10
    return Math.max(1, Math.min(10, Math.round(priority)));
  }

  /**
   * Determine optimal execution time
   */
  determineOptimalTime(task) {
    const now = Date.now();

    // If task has explicit executeAt, use it
    if (task.executeAt && task.executeAt > now) {
      return task.executeAt;
    }

    // Find hour with lowest load
    const currentHour = new Date().getHours();
    let optimalHour = currentHour;
    let minLoad = Infinity;

    for (let hour = 0; hour < 24; hour++) {
      const load = this.patterns.resourceUsage[hour]?.taskCount || 0;
      if (load < minLoad) {
        minLoad = load;
        optimalHour = hour;
      }
    }

    // If optimal hour is current hour, execute immediately
    if (optimalHour === currentHour) {
      return now;
    }

    // Calculate time until optimal hour
    let hoursUntil = optimalHour - currentHour;
    if (hoursUntil < 0) {
      hoursUntil += 24;
    }

    // Don't delay more than 6 hours
    if (hoursUntil > 6) {
      return now;
    }

    return now + (hoursUntil * 60 * 60 * 1000);
  }

  /**
   * Detect task dependencies
   */
  detectDependencies(task) {
    const dependencies = [];

    // Check if task type has known dependencies
    if (this.patterns.dependencies[task.type]) {
      dependencies.push(...this.patterns.dependencies[task.type]);
    }

    // Infer dependencies from history
    const recentHistory = this.history.slice(-100);
    const taskTypeHistory = recentHistory.filter(r => r.type === task.type);

    // Find tasks that frequently execute before this task type
    const precedingTasks = new Map();
    
    for (let i = 1; i < taskTypeHistory.length; i++) {
      const current = taskTypeHistory[i];
      const previous = recentHistory[recentHistory.indexOf(current) - 1];
      
      if (previous && previous.type !== task.type) {
        const count = precedingTasks.get(previous.type) || 0;
        precedingTasks.set(previous.type, count + 1);
      }
    }

    // Add frequently preceding tasks as dependencies
    for (const [type, count] of precedingTasks.entries()) {
      if (count / taskTypeHistory.length > 0.5) { // More than 50% of the time
        if (!dependencies.includes(type)) {
          dependencies.push(type);
        }
      }
    }

    return dependencies;
  }

  /**
   * Suggest task schedule
   */
  suggestSchedule(tasks) {
    const schedule = [];

    // Sort tasks by calculated priority
    const prioritized = tasks.map(task => ({
      task,
      priority: this.calculatePriority(task),
      optimalTime: this.determineOptimalTime(task),
      dependencies: this.detectDependencies(task)
    })).sort((a, b) => b.priority - a.priority);

    // Build schedule respecting dependencies
    const scheduled = new Set();

    for (const item of prioritized) {
      // Check if dependencies are satisfied
      const dependenciesSatisfied = item.dependencies.every(dep => 
        scheduled.has(dep) || !tasks.some(t => t.type === dep)
      );

      if (dependenciesSatisfied) {
        schedule.push({
          task: item.task,
          priority: item.priority,
          executeAt: item.optimalTime,
          dependencies: item.dependencies
        });
        scheduled.add(item.task.type);
      } else {
        // Delay until dependencies are satisfied
        const maxDepTime = Math.max(
          ...item.dependencies
            .map(dep => {
              const depItem = schedule.find(s => s.task.type === dep);
              return depItem ? depItem.executeAt : 0;
            })
        );
        
        schedule.push({
          task: item.task,
          priority: item.priority,
          executeAt: Math.max(item.optimalTime, maxDepTime + 60000), // 1 min after dep
          dependencies: item.dependencies
        });
        scheduled.add(item.task.type);
      }
    }

    return schedule;
  }

  /**
   * Predict task duration
   */
  predictDuration(taskType) {
    const times = this.patterns.optimalTimes[taskType];
    
    if (!times || times.samples.length === 0) {
      return 60000; // Default 1 minute
    }

    // Use average + 20% buffer
    return Math.round(times.average * 1.2);
  }

  /**
   * Analyze task patterns
   */
  analyzePatterns() {
    const analysis = {
      timestamp: Date.now(),
      taskTypes: {},
      recommendations: []
    };

    // Analyze each task type
    for (const [type, stats] of Object.entries(this.patterns.taskSuccessRates)) {
      analysis.taskTypes[type] = {
        successRate: stats.rate,
        totalExecutions: stats.total,
        averageDuration: this.patterns.optimalTimes[type]?.average || 0,
        reliability: this.calculateReliability(type)
      };

      // Generate recommendations
      if (stats.rate < 0.5) {
        analysis.recommendations.push({
          type: 'low_success_rate',
          taskType: type,
          message: `Task type "${type}" has low success rate (${(stats.rate * 100).toFixed(1)}%). Consider reviewing implementation.`
        });
      }

      if (stats.total > 10 && stats.rate > 0.95) {
        analysis.recommendations.push({
          type: 'high_reliability',
          taskType: type,
          message: `Task type "${type}" is highly reliable (${(stats.rate * 100).toFixed(1)}% success). Consider increasing priority.`
        });
      }
    }

    // Analyze resource usage
    const peakHours = Object.entries(this.patterns.resourceUsage)
      .sort((a, b) => b[1].taskCount - a[1].taskCount)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    if (peakHours.length > 0) {
      analysis.recommendations.push({
        type: 'peak_hours',
        message: `Peak usage hours: ${peakHours.join(', ')}. Consider scheduling non-critical tasks outside these hours.`
      });
    }

    return analysis;
  }

  /**
   * Calculate task reliability score
   */
  calculateReliability(taskType) {
    const stats = this.patterns.taskSuccessRates[taskType];
    if (!stats || stats.total === 0) {
      return 0;
    }

    // Factors: success rate, sample size, consistency
    const successRate = stats.rate;
    const sampleSize = Math.min(stats.total / 100, 1); // Normalize to 0-1
    
    const times = this.patterns.optimalTimes[taskType];
    let consistency = 1;
    
    if (times && times.samples.length > 1) {
      const variance = times.samples.reduce((sum, time) => {
        return sum + Math.pow(time - times.average, 2);
      }, 0) / times.samples.length;
      
      const stdDev = Math.sqrt(variance);
      consistency = 1 - Math.min(stdDev / times.average, 1);
    }

    // Weighted score
    return (successRate * 0.5 + sampleSize * 0.2 + consistency * 0.3);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      historySize: this.history.length,
      taskTypes: Object.keys(this.patterns.taskSuccessRates).length,
      patterns: this.patterns,
      analysis: this.analyzePatterns()
    };
  }
}

module.exports = new IntelligentScheduler();
