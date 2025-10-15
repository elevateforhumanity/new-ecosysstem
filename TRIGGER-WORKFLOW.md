# 🚀 Trigger Workflow in This Environment

## Option 1: Using Script (Requires GitHub Token)

### Step 1: Get GitHub Token
1. Go to: https://github.com/settings/tokens/new
2. Token name: `Close Dependabot PRs`
3. Select scopes: ✅ `repo` (full control of private repositories)
4. Click "Generate token"
5. Copy the token (starts with `ghp_` or `github_pat_`)

### Step 2: Set Token and Run
```bash
export GITHUB_TOKEN='your_token_here'
./scripts/trigger-close-prs-workflow.sh
```

---

## Option 2: Manual API Call (One-Liner)

Replace `YOUR_TOKEN` with your GitHub token:

```bash
curl -X POST \
  "https://api.github.com/repos/elevateforhumanity/fix2/actions/workflows/close-dependabot-prs.yml/dispatches" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d '{"ref":"main"}'
```

Success response: HTTP 204 (no content)

---

## Option 3: GitHub Web UI (Easiest - No Token Needed)

**Just click this link and press the button:**

[**→ Run Workflow Now ←**](https://github.com/elevateforhumanity/fix2/actions/workflows/close-dependabot-prs.yml)

1. Click "Run workflow" button
2. Select branch: `main`
3. Click green "Run workflow"
4. Done! ✅

---

## Verify It Worked

After triggering, check:

```bash
# View workflow runs
curl -s "https://api.github.com/repos/elevateforhumanity/fix2/actions/workflows/close-dependabot-prs.yml/runs?per_page=1" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.workflow_runs[0] | {status, conclusion, html_url}'
```

Or visit: https://github.com/elevateforhumanity/fix2/actions

---

## What Happens Next

The workflow will:
1. ✅ Find 5 open Dependabot PRs
2. ✅ Add comment: "Major version with breaking changes - will upgrade manually when ready"
3. ✅ Add labels: `blocked`, `manual-upgrade`
4. ✅ Close each PR

**Time:** ~1 minute total

---

## Troubleshooting

### "Bad credentials" error
- Token is invalid or expired
- Token doesn't have `repo` scope
- Generate a new token with correct permissions

### "Resource not accessible"
- Token doesn't have write access to the repository
- Make sure you're a collaborator on the repo

### "Workflow not found"
- Make sure latest commits are pushed to `main`
- Wait 30 seconds for GitHub to index the workflow
- Check: https://github.com/elevateforhumanity/fix2/tree/main/.github/workflows

---

## 🎯 Recommended: Use Option 3 (Web UI)

The easiest and safest method is to use the GitHub web interface.
No tokens, no CLI, just click and run.

**Link:** https://github.com/elevateforhumanity/fix2/actions/workflows/close-dependabot-prs.yml
