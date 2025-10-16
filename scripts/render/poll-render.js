#!/usr/bin/env node
/**
 * Render Deployment Watcher
 * Polls Render deploy until success/failure; on failure, opens GitHub Issue with logs + suggested fixes.
 */

const https = require('https');
const { execSync } = require('child_process');

const RENDER_API = 'api.render.com';
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const SERVICE_ID = process.env.RENDER_SERVICE_ID;
const DEPLOY_ID = process.env.RENDER_DEPLOY_ID || null;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;

if (!RENDER_API_KEY || !SERVICE_ID || !GITHUB_TOKEN) {
  console.error('❌ Missing required environment variables:');
  if (!RENDER_API_KEY) console.error('   - RENDER_API_KEY');
  if (!SERVICE_ID) console.error('   - RENDER_SERVICE_ID');
  if (!GITHUB_TOKEN) console.error('   - GITHUB_TOKEN');
  console.error('\n💡 Add these as GitHub Secrets:');
  console.error('   Settings → Secrets and variables → Actions → New repository secret');
  process.exit(1);
}

function rget(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: RENDER_API,
        path,
        method: 'GET',
        headers: { Authorization: `Bearer ${RENDER_API_KEY}` }
      },
      res => {
        let data = '';
        res.on('data', d => (data += d));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function latestDeployId() {
  try {
    const j = await rget(`/v1/services/${SERVICE_ID}/deploys`);
    if (!Array.isArray(j) || j.length === 0) return null;
    return j[0].deploy.id;
  } catch (e) {
    console.error('Failed to fetch latest deploy:', e.message);
    return null;
  }
}

async function logsForService() {
  try {
    const j = await rget(`/v1/services/${SERVICE_ID}`);
    if (j && j.service) {
      return `Service: ${j.service.name}\nURL: ${j.service.serviceDetails?.url || 'N/A'}`;
    }
    return 'Logs API not available; check Render dashboard.';
  } catch {
    return 'Could not fetch logs. Check Render dashboard.';
  }
}

function guessFixesFrom(text) {
  const hints = [];
  
  if (/Missing required environment variables/i.test(text) || /SUPABASE_URL|JWT_SECRET/i.test(text)) {
    hints.push('**Missing Environment Variables**: Add required env vars in Render → Settings → Environment (e.g., SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, PORT).');
  }
  
  if (/Cannot find module .*dist\/index\.js/i.test(text) || /MODULE_NOT_FOUND.*dist/i.test(text)) {
    hints.push('**Backend Build Failed**: Ensure build command runs successfully. For TypeScript: `tsc -p tsconfig.json`. For JavaScript: verify server.js exists.');
  }
  
  if (/only one run of the codeql\/analyze or codeql\/upload-sarif/i.test(text)) {
    hints.push('**CodeQL Duplicate SARIF**: Remove duplicate upload-sarif step. The analyze step already uploads. Set unique `category: "typescript-${{ github.job }}-${{ github.run_id }}"`.');
  }
  
  if (/ENOENT|no such file or directory.*dist/i.test(text)) {
    hints.push('**Missing Build Output**: Check build command produces expected files. Verify tsconfig.json `outDir` or vite.config output paths.');
  }
  
  if (/EACCES|permission denied/i.test(text)) {
    hints.push('**Permission Error**: Avoid privileged ports (use PORT env var). Ensure proper file permissions in build step.');
  }
  
  if (/npm ERR!|pnpm ERR!/i.test(text)) {
    hints.push('**Package Manager Error**: Check package.json scripts and dependencies. Try `pnpm install --frozen-lockfile=false` or `npm ci`.');
  }
  
  if (/compression|express/i.test(text) && /cannot find module/i.test(text)) {
    hints.push('**Missing Dependencies**: Run `pnpm add compression` or verify all dependencies are in package.json.');
  }

  if (hints.length === 0) {
    hints.push('**Check Render Logs**: Open Render Dashboard → Service → Logs for detailed error messages.');
  }
  
  return hints;
}

async function createIssue(title, body) {
  if (!GITHUB_REPOSITORY) {
    console.error('⚠️  GITHUB_REPOSITORY not set, cannot create issue');
    return;
  }

  const payload = {
    title,
    body,
    labels: ['autopilot', 'render', 'deploy-failure']
  };

  try {
    const cmd = `curl -s -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -X POST https://api.github.com/repos/${GITHUB_REPOSITORY}/issues \
      -d '${JSON.stringify(payload).replace(/'/g, "'\\''")}'`;
    
    execSync(cmd, { stdio: 'inherit' });
    console.log('✅ GitHub Issue created');
  } catch (e) {
    console.error('❌ Failed to create GitHub Issue:', e.message);
  }
}

(async () => {
  console.log('🔍 Render Deployment Watcher');
  console.log('============================\n');

  const id = DEPLOY_ID || (await latestDeployId());
  if (!id) {
    console.log('⚠️  No deploy to watch. Exiting.');
    return;
  }

  console.log(`📦 Watching deploy: ${id}`);
  console.log(`🔗 Service: ${SERVICE_ID}\n`);

  let status = 'created';
  const start = Date.now();
  const MAX_DURATION = 15 * 60 * 1000; // 15 minutes

  while (true) {
    try {
      const j = await rget(`/v1/services/${SERVICE_ID}/deploys/${id}`);
      status = j.deploy?.status || 'unknown';
      
      const elapsed = Math.floor((Date.now() - start) / 1000);
      console.log(`[${elapsed}s] Status: ${status}`);

      if (status === 'live') {
        console.log('\n✅ Deploy is LIVE!');
        console.log('🎉 Deployment successful');
        return;
      }

      if (['build_failed', 'update_failed', 'deactivated', 'canceled'].includes(status)) {
        console.log(`\n❌ Deploy FAILED: ${status}`);

        // Gather logs and error info
        const logs = await logsForService();
        const errorMsg = j.deploy?.error || '';
        const commitMsg = j.deploy?.commit?.message || '';
        const combined = `${commitMsg}\n${errorMsg}\n${logs}`;
        
        const hints = guessFixesFrom(combined);
        
        const body = `## 🚨 Render Deployment Failed

**Deploy ID**: \`${id}\`  
**Status**: \`${status}\`  
**Service**: \`${SERVICE_ID}\`

### 🔧 Suggested Fixes

${hints.map(h => `- ${h}`).join('\n')}

### 📋 Deploy Information

**Commit**: ${commitMsg || 'N/A'}  
**Error**: ${errorMsg || 'N/A'}

### 📝 Service Info

\`\`\`
${logs}
\`\`\`

### 🔗 Quick Links

- [Render Dashboard](https://dashboard.render.com)
- [Service Logs](https://dashboard.render.com/web/${SERVICE_ID}/logs)
- [Deployment Docs](https://render.com/docs/deploys)

### ✅ Next Steps

1. Check the suggested fixes above
2. Review Render logs for detailed error messages
3. Update environment variables if needed
4. Trigger manual redeploy after fixes
`;

        await createIssue(`Render deploy failed: ${status}`, body);
        process.exit(1);
      }

      if (Date.now() - start > MAX_DURATION) {
        console.log('\n⏰ Timeout after 15 minutes');
        const logs = await logsForService();
        await createIssue(
          'Render deploy watcher timeout',
          `Deploy \`${id}\` did not complete after 15 minutes.\n\n**Last Status**: ${status}\n\n**Logs**:\n\`\`\`\n${logs}\n\`\`\``
        );
        process.exit(1);
      }

      // Wait before next poll
      await new Promise(r => setTimeout(r, 15000)); // 15 seconds
    } catch (e) {
      console.error('❌ Error polling Render API:', e.message);
      await new Promise(r => setTimeout(r, 30000)); // Wait longer on error
    }
  }
})();
