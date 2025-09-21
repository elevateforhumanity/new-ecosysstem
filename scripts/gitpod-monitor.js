import os from "os";
import fs from "fs";
import { execSync } from "child_process";

function toMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

function toGB(bytes) {
  return (bytes / 1024 / 1024 / 1024).toFixed(2);
}

function getDiskUsage() {
  try {
    const output = execSync('df -h /workspace', { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    if (lines.length > 1) {
      const parts = lines[1].split(/\s+/);
      return {
        total: parts[1],
        used: parts[2],
        available: parts[3],
        percentage: parts[4]
      };
    }
  } catch (error) {
    return { error: error.message };
  }
  return { error: "Unable to get disk usage" };
}

function getWorkspaceSize() {
  try {
    const output = execSync('du -sh /workspace', { encoding: 'utf8' });
    return output.trim().split('\t')[0];
  } catch (error) {
    return "Unknown";
  }
}

function getFileCount() {
  try {
    const output = execSync('find /workspace -type f | wc -l', { encoding: 'utf8' });
    return parseInt(output.trim()).toLocaleString();
  } catch (error) {
    return "Unknown";
  }
}

function getGitRepoSize() {
  try {
    const output = execSync('du -sh .git', { encoding: 'utf8' });
    return output.trim().split('\t')[0];
  } catch (error) {
    return "Unknown";
  }
}

function getNodeModulesSize() {
  try {
    const output = execSync('du -sh node_modules', { encoding: 'utf8' });
    return output.trim().split('\t')[0];
  } catch (error) {
    return "Not found";
  }
}

function getDistSize() {
  try {
    const output = execSync('du -sh dist', { encoding: 'utf8' });
    return output.trim().split('\t')[0];
  } catch (error) {
    return "Not found";
  }
}

const mem = os.totalmem();
const free = os.freemem();
const used = mem - free;
const load = os.loadavg();
const disk = getDiskUsage();
const workspaceSize = getWorkspaceSize();
const fileCount = getFileCount();
const gitSize = getGitRepoSize();
const nodeModulesSize = getNodeModulesSize();
const distSize = getDistSize();

// Calculate memory percentage
const memoryPercentage = ((used / mem) * 100).toFixed(1);

// Determine health status
let healthStatus = "🟢 HEALTHY";
let warnings = [];

if (parseFloat(memoryPercentage) > 80) {
  healthStatus = "🔴 CRITICAL";
  warnings.push("High memory usage");
}
if (disk.percentage && parseFloat(disk.percentage.replace('%', '')) > 85) {
  healthStatus = "🔴 CRITICAL";
  warnings.push("High disk usage");
}
if (load[0] > os.cpus().length * 0.8) {
  healthStatus = "🟡 WARNING";
  warnings.push("High CPU load");
}

const timestamp = new Date().toISOString();

const report = `
=== Gitpod Health Report ===
Timestamp: ${timestamp}
Status: ${healthStatus}
${warnings.length > 0 ? `Warnings: ${warnings.join(', ')}` : ''}

📊 SYSTEM RESOURCES:
CPU Cores: ${os.cpus().length}
CPU Load (1m, 5m, 15m): ${load.map(l => l.toFixed(2)).join(", ")}
Memory Total: ${toMB(mem)} MB (${toGB(mem)} GB)
Memory Used: ${toMB(used)} MB (${memoryPercentage}%)
Memory Free: ${toMB(free)} MB

💾 DISK USAGE:
${disk.error ? `Error: ${disk.error}` : `
Total: ${disk.total}
Used: ${disk.used} (${disk.percentage})
Available: ${disk.available}`}

📁 WORKSPACE BREAKDOWN:
Total Workspace Size: ${workspaceSize}
Total Files: ${fileCount}
Git Repository: ${gitSize}
node_modules: ${nodeModulesSize}
dist folder: ${distSize}

🔧 RECOMMENDATIONS:
${memoryPercentage > 70 ? "- Consider running gitpod-clean.sh to free memory\n" : ""}${disk.percentage && parseFloat(disk.percentage.replace('%', '')) > 75 ? "- Disk usage high - consider offloading assets to R2/S3\n" : ""}${load[0] > os.cpus().length * 0.5 ? "- High CPU load - consider reducing concurrent operations\n" : ""}${parseInt(fileCount.replace(/,/g, '')) > 50000 ? "- Large file count - consider lazy loading or archiving\n" : ""}
============================
`;

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Write report to file
fs.writeFileSync("dist/gitpod-health.txt", report);

// Also create JSON version for programmatic access
const jsonReport = {
  timestamp,
  status: healthStatus,
  warnings,
  system: {
    cpuCores: os.cpus().length,
    cpuLoad: load,
    memory: {
      total: mem,
      used,
      free,
      percentage: parseFloat(memoryPercentage)
    }
  },
  disk,
  workspace: {
    totalSize: workspaceSize,
    fileCount: parseInt(fileCount.replace(/,/g, '')),
    gitSize,
    nodeModulesSize,
    distSize
  }
};

fs.writeFileSync("dist/gitpod-health.json", JSON.stringify(jsonReport, null, 2));

console.log(report);

// Exit with error code if critical issues
if (healthStatus.includes("CRITICAL")) {
  console.error("🚨 Critical resource issues detected!");
  process.exit(1);
}