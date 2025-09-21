import fs from "fs";
import fetch from "node-fetch";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';
const EMAIL_TO = process.env.EMAIL_TO || "team@elevateforhumanity.org";
const SITE_URL = process.env.SITE_URL || "https://www.elevate4humanity.org";
const GITPOD_WORKSPACE_URL = process.env.GITPOD_WORKSPACE_URL;

class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.startTime = Date.now();
  }

  async sendSlackNotification(payload) {
    if (!SLACK_WEBHOOK_URL) {
      console.log("⚠️ Slack webhook not configured, skipping Slack notification");
      return false;
    }

    try {
      const response = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log("✅ Slack notification sent successfully");
        return true;
      } else {
        console.error(`❌ Slack notification failed: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Slack notification error: ${error.message}`);
      return false;
    }
  }

  async sendEmailNotification(subject, body) {
    if (!EMAIL_ENABLED) {
      console.log("⚠️ Email notifications not enabled");
      return false;
    }

    // For now, just log the email content
    // In production, you'd integrate with SendGrid, AWS SES, etc.
    console.log("📧 Email notification (would be sent):");
    console.log(`To: ${EMAIL_TO}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
    return true;
  }

  generateAutopilotSummary(status, completedSteps, failedSteps, duration) {
    const totalSteps = completedSteps.length + failedSteps.length;
    const successRate = Math.round((completedSteps.length / totalSteps) * 100);
    
    return {
      status,
      duration: `${Math.round(duration / 1000)}s`,
      success_rate: `${successRate}%`,
      completed_steps: completedSteps.length,
      failed_steps: failedSteps.length,
      total_steps: totalSteps,
      site_url: SITE_URL,
      workspace_url: GITPOD_WORKSPACE_URL,
      timestamp: new Date().toISOString()
    };
  }

  async notifyAutopilotStart() {
    const payload = {
      text: "🚀 Autopilot Starting",
      attachments: [{
        color: "good",
        fields: [
          { title: "Status", value: "Starting", short: true },
          { title: "Site", value: SITE_URL, short: true },
          { title: "Workspace", value: GITPOD_WORKSPACE_URL || "Unknown", short: false }
        ],
        footer: "EFH Autopilot",
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    await this.sendSlackNotification(payload);
    await this.sendEmailNotification(
      "🚀 EFH Autopilot Started",
      `Autopilot has started for ${SITE_URL}\n\nWorkspace: ${GITPOD_WORKSPACE_URL || 'Unknown'}\nTime: ${new Date().toISOString()}`
    );
  }

  async notifyAutopilotSuccess(completedSteps, duration) {
    const summary = this.generateAutopilotSummary("SUCCESS", completedSteps, [], duration);
    
    const payload = {
      text: "✅ Autopilot Completed Successfully",
      attachments: [{
        color: "good",
        fields: [
          { title: "Status", value: "SUCCESS", short: true },
          { title: "Duration", value: summary.duration, short: true },
          { title: "Steps Completed", value: `${summary.completed_steps}/${summary.total_steps}`, short: true },
          { title: "Success Rate", value: summary.success_rate, short: true },
          { title: "Site URL", value: `<${SITE_URL}|Visit Site>`, short: false },
          { title: "Sitemap", value: `<${SITE_URL}/sitemap.xml|View Sitemap>`, short: true }
        ],
        footer: "EFH Autopilot",
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    await this.sendSlackNotification(payload);
    
    const emailBody = `
🎉 Autopilot completed successfully!

📊 Summary:
- Duration: ${summary.duration}
- Steps completed: ${summary.completed_steps}/${summary.total_steps}
- Success rate: ${summary.success_rate}

🔗 Links:
- Site: ${SITE_URL}
- Sitemap: ${SITE_URL}/sitemap.xml
- Workspace: ${GITPOD_WORKSPACE_URL || 'Unknown'}

✅ Completed steps:
${completedSteps.map(step => `- ${step}`).join('\n')}

Time: ${new Date().toISOString()}
`;

    await this.sendEmailNotification("✅ EFH Autopilot Success", emailBody);
  }

  async notifyAutopilotFailure(completedSteps, failedSteps, duration, error) {
    const summary = this.generateAutopilotSummary("FAILED", completedSteps, failedSteps, duration);
    
    const payload = {
      text: "❌ Autopilot Failed",
      attachments: [{
        color: "danger",
        fields: [
          { title: "Status", value: "FAILED", short: true },
          { title: "Duration", value: summary.duration, short: true },
          { title: "Steps Completed", value: `${summary.completed_steps}/${summary.total_steps}`, short: true },
          { title: "Failed Steps", value: failedSteps.join(', '), short: false },
          { title: "Error", value: error || "Unknown error", short: false },
          { title: "Workspace", value: GITPOD_WORKSPACE_URL || "Unknown", short: false }
        ],
        footer: "EFH Autopilot",
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    await this.sendSlackNotification(payload);
    
    const emailBody = `
❌ Autopilot failed!

📊 Summary:
- Duration: ${summary.duration}
- Steps completed: ${summary.completed_steps}/${summary.total_steps}
- Success rate: ${summary.success_rate}

❌ Failed steps:
${failedSteps.map(step => `- ${step}`).join('\n')}

✅ Completed steps:
${completedSteps.map(step => `- ${step}`).join('\n')}

🔍 Error: ${error || 'Unknown error'}

🔗 Workspace: ${GITPOD_WORKSPACE_URL || 'Unknown'}

Time: ${new Date().toISOString()}
`;

    await this.sendEmailNotification("❌ EFH Autopilot Failed", emailBody);
  }

  async notifyDeployHealth(isHealthy, deployInfo) {
    if (isHealthy) {
      const payload = {
        text: "🌐 Deploy Health Check Passed",
        attachments: [{
          color: "good",
          fields: [
            { title: "Status", value: "Healthy", short: true },
            { title: "Deploy URL", value: `<${deployInfo.url}|View Deploy>`, short: true },
            { title: "Deploy ID", value: deployInfo.id, short: true },
            { title: "Branch", value: deployInfo.branch || "main", short: true }
          ],
          footer: "Deploy Monitor",
          ts: Math.floor(Date.now() / 1000)
        }]
      };

      await this.sendSlackNotification(payload);
    } else {
      const payload = {
        text: "🚨 Deploy Health Check Failed",
        attachments: [{
          color: "danger",
          fields: [
            { title: "Status", value: "Unhealthy", short: true },
            { title: "Deploy State", value: deployInfo.state || "Unknown", short: true },
            { title: "Error", value: deployInfo.error_message || "Health check failed", short: false },
            { title: "Workspace", value: GITPOD_WORKSPACE_URL || "Unknown", short: false }
          ],
          footer: "Deploy Monitor",
          ts: Math.floor(Date.now() / 1000)
        }]
      };

      await this.sendSlackNotification(payload);
      
      await this.sendEmailNotification(
        "🚨 Deploy Health Check Failed",
        `Deploy health check failed for ${SITE_URL}\n\nState: ${deployInfo.state}\nError: ${deployInfo.error_message || 'Unknown'}\n\nWorkspace: ${GITPOD_WORKSPACE_URL || 'Unknown'}\nTime: ${new Date().toISOString()}`
      );
    }
  }

  async notifySecurityAlert(alertType, details) {
    const payload = {
      text: `🛡️ Security Alert: ${alertType}`,
      attachments: [{
        color: "warning",
        fields: [
          { title: "Alert Type", value: alertType, short: true },
          { title: "Site", value: SITE_URL, short: true },
          { title: "Details", value: details, short: false },
          { title: "Time", value: new Date().toISOString(), short: true }
        ],
        footer: "Security Monitor",
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    await this.sendSlackNotification(payload);
    await this.sendEmailNotification(
      `🛡️ Security Alert: ${alertType}`,
      `Security alert for ${SITE_URL}\n\nType: ${alertType}\nDetails: ${details}\n\nTime: ${new Date().toISOString()}`
    );
  }

  async notifyDuplicationDetected(duplications) {
    if (duplications.length === 0) return;

    const payload = {
      text: "🕵️ Content Duplication Detected",
      attachments: [{
        color: "warning",
        fields: [
          { title: "Duplications Found", value: duplications.length.toString(), short: true },
          { title: "Affected Domains", value: duplications.map(d => d.domain).slice(0, 5).join(', '), short: false },
          { title: "Action Required", value: "DMCA notices generated", short: true },
          { title: "Site", value: SITE_URL, short: true }
        ],
        footer: "Content Protection",
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    await this.sendSlackNotification(payload);
    
    const emailBody = `
🕵️ Content duplication detected!

📊 Summary:
- Duplications found: ${duplications.length}
- Affected domains: ${duplications.map(d => d.domain).join(', ')}

🔍 Details:
${duplications.map(d => `- ${d.domain}: ${d.match_count} matches (${d.severity} severity)`).join('\n')}

⚖️ DMCA notices have been automatically generated for review.

Time: ${new Date().toISOString()}
`;

    await this.sendEmailNotification("🕵️ Content Duplication Detected", emailBody);
  }

  async notifyResourceAlert(resourceType, usage, threshold) {
    const payload = {
      text: `⚠️ Resource Alert: High ${resourceType} Usage`,
      attachments: [{
        color: "warning",
        fields: [
          { title: "Resource", value: resourceType, short: true },
          { title: "Usage", value: `${usage}%`, short: true },
          { title: "Threshold", value: `${threshold}%`, short: true },
          { title: "Workspace", value: GITPOD_WORKSPACE_URL || "Unknown", short: false }
        ],
        footer: "Resource Monitor",
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    await this.sendSlackNotification(payload);
  }

  async generateDailyReport() {
    // Read various report files
    const reports = {};
    
    try {
      if (fs.existsSync('dist/autopilot-report.json')) {
        reports.autopilot = JSON.parse(fs.readFileSync('dist/autopilot-report.json', 'utf-8'));
      }
      if (fs.existsSync('dist/security-report.json')) {
        reports.security = JSON.parse(fs.readFileSync('dist/security-report.json', 'utf-8'));
      }
      if (fs.existsSync('dist/duplication-report.json')) {
        reports.duplication = JSON.parse(fs.readFileSync('dist/duplication-report.json', 'utf-8'));
      }
      if (fs.existsSync('dist/gitpod-health.json')) {
        reports.health = JSON.parse(fs.readFileSync('dist/gitpod-health.json', 'utf-8'));
      }
    } catch (error) {
      console.warn(`⚠️ Failed to read some reports: ${error.message}`);
    }

    const payload = {
      text: "📊 Daily Autopilot Report",
      attachments: [{
        color: "good",
        fields: [
          { title: "Site", value: `<${SITE_URL}|${SITE_URL}>`, short: true },
          { title: "Protected Pages", value: reports.security?.protected_pages?.toString() || "Unknown", short: true },
          { title: "Duplications", value: reports.duplication?.suspected_duplications?.toString() || "0", short: true },
          { title: "System Health", value: reports.health?.status || "Unknown", short: true },
          { title: "Last Updated", value: new Date().toISOString(), short: false }
        ],
        footer: "Daily Report",
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    await this.sendSlackNotification(payload);
    
    const emailBody = `
📊 Daily Autopilot Report for ${SITE_URL}

🛡️ Security:
- Protected pages: ${reports.security?.protected_pages || 'Unknown'}
- Security features active: ${reports.security?.security_features?.length || 0}

🕵️ Content Protection:
- Suspected duplications: ${reports.duplication?.suspected_duplications || 0}
- External results monitored: ${reports.duplication?.external_results || 0}

💻 System Health:
- Status: ${reports.health?.status || 'Unknown'}
- Memory usage: ${reports.health?.system?.memory?.percentage || 'Unknown'}%
- Workspace size: ${reports.health?.workspace?.totalSize || 'Unknown'}

🔗 Quick Links:
- Site: ${SITE_URL}
- Sitemap: ${SITE_URL}/sitemap.xml
- Copyright Policy: ${SITE_URL}/copyright.html

Generated: ${new Date().toISOString()}
`;

    await this.sendEmailNotification("📊 Daily EFH Autopilot Report", emailBody);
  }
}

// Export for use in other scripts
export { NotificationSystem };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const notifier = new NotificationSystem();
  const action = process.argv[2];
  
  switch (action) {
    case 'start':
      await notifier.notifyAutopilotStart();
      break;
    case 'success':
      await notifier.notifyAutopilotSuccess(['build', 'deploy', 'purge'], 120000);
      break;
    case 'failure':
      await notifier.notifyAutopilotFailure(['build'], ['deploy'], 60000, 'Deploy failed');
      break;
    case 'daily':
      await notifier.generateDailyReport();
      break;
    default:
      console.log("Usage: node notification-system.js [start|success|failure|daily]");
  }
}