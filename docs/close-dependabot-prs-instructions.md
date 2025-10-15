# How to Close Breaking Dependabot PRs

## Quick Start - GitHub Actions (Recommended)

The easiest way to close the breaking Dependabot PRs is via GitHub Actions:

### Steps:

1. **Go to GitHub Actions**
   - Navigate to: [https://github.com/elevateforhumanity/fix2/actions](https://github.com/elevateforhumanity/fix2/actions)

2. **Select the workflow**
   - Click on "Close specific Dependabot PRs" in the left sidebar

3. **Run the workflow**
   - Click "Run workflow" button (top right)
   - Select branch: `main`
   - Click green "Run workflow" button

4. **Monitor progress**
   - The workflow will process 5 PRs in parallel
   - Each job will:
     - Find the open PR for that branch
     - Add comment: "Major version with breaking changes - will upgrade manually when ready"
     - Add labels: `blocked`, `manual-upgrade`
     - Close the PR

5. **Verify results**
   - Check the workflow run for success
   - Visit PRs tab to confirm they're closed

## Alternative - CLI Script

If you prefer to run locally:

### Prerequisites:
```bash
# Install GitHub CLI
# macOS: brew install gh
# Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md
# Windows: https://github.com/cli/cli/releases

# Authenticate
gh auth login
```

### Run:
```bash
./scripts/close-dependabot-prs.sh
```

### Expected Output:
```
🤖 Closing Dependabot PRs with breaking changes
================================================

✅ GitHub CLI authenticated

Checking branch: dependabot/npm_and_yarn/tailwindcss-4.1.14
  📝 Found PR #123
  💬 Adding comment...
  🏷️  Adding labels...
  ❌ Closing PR...
  ✅ Closed PR #123

...

================================================
Summary:
  ✅ Closed: 5 PRs
  ⏭️  Skipped: 0 PRs (not found or already closed)

🎉 Done!
```

## PRs That Will Be Closed

1. **tailwindcss 4.1.14**
   - Branch: `dependabot/npm_and_yarn/tailwindcss-4.1.14`
   - Reason: Major breaking changes (config, syntax, browser requirements)

2. **react 19.2.0**
   - Branch: `dependabot/npm_and_yarn/react-19.2.0`
   - Reason: Peer dependency conflicts with react-helmet-async

3. **@sentry/react 10.19.0**
   - Branch: `dependabot/npm_and_yarn/sentry/react-10.19.0`
   - Reason: Major version requires migration

4. **vite 7.1.10**
   - Branch: `dependabot/npm_and_yarn/vite-7.1.10`
   - Reason: Potential breaking changes

5. **react-router-dom 7.9.4**
   - Branch: `dependabot/npm_and_yarn/react-router-dom-7.9.4`
   - Reason: Major API changes

## What Happens After Closing

### Immediate Effects:
- ✅ PRs are closed with explanation
- ✅ Labeled for future reference
- ✅ No more CI/CD failures from these PRs

### Future Behavior:
- ✅ Dependabot won't recreate these PRs (due to `.github/dependabot.yml` ignore rules)
- ✅ Security patches will still be applied automatically
- ✅ Team can plan major upgrades deliberately

## Troubleshooting

### "No open PR found"
- PR may already be closed
- Branch name may have changed
- Check: `gh pr list --search "is:open author:app/dependabot"`

### "Could not add labels"
- Labels `blocked` or `manual-upgrade` don't exist in repo
- This is non-fatal - PR will still close
- Create labels in GitHub: Settings → Labels

### "Permission denied"
- GitHub token needs `pull-requests: write` permission
- For CLI: Re-run `gh auth login` with correct scopes
- For Actions: Permissions are configured in workflow file

## Manual Verification

After running, verify PRs are closed:

```bash
# List all open Dependabot PRs
gh pr list --author app/dependabot --state open

# Should return empty or only safe PRs
```

Or visit: [https://github.com/elevateforhumanity/fix2/pulls?q=is:pr+author:app/dependabot+is:closed](https://github.com/elevateforhumanity/fix2/pulls?q=is:pr+author:app/dependabot+is:closed)

## Related Documentation

- `docs/dependabot-build-fix.md` - Why these PRs are being closed
- `.github/dependabot.yml` - Dependabot configuration
- `.github/workflows/close-dependabot-prs.yml` - Workflow source

---

**Last Updated:** 2025-10-15 01:53 UTC
