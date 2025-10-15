#!/usr/bin/env bash
# Trigger the "Close specific Dependabot PRs" workflow via GitHub API
set -euo pipefail

echo "🚀 Triggering GitHub Actions Workflow"
echo "======================================"
echo ""

# Check if GITHUB_TOKEN is set
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "❌ GITHUB_TOKEN environment variable is not set"
  echo ""
  echo "To create a token:"
  echo "  1. Go to: https://github.com/settings/tokens/new"
  echo "  2. Select scopes: 'repo' (full control)"
  echo "  3. Generate token"
  echo "  4. Export it: export GITHUB_TOKEN='your_token_here'"
  echo ""
  echo "Then run this script again."
  exit 1
fi

OWNER="elevateforhumanity"
REPO="fix2"
WORKFLOW_FILE="close-dependabot-prs.yml"
REF="main"

echo "Repository: ${OWNER}/${REPO}"
echo "Workflow: ${WORKFLOW_FILE}"
echo "Branch: ${REF}"
echo ""

# Trigger the workflow
echo "📡 Sending workflow dispatch request..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d "{\"ref\":\"${REF}\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [[ "$HTTP_CODE" == "204" ]]; then
  echo "✅ Workflow triggered successfully!"
  echo ""
  echo "🔍 Monitoring workflow status..."
  sleep 3
  
  # Get the latest workflow run
  RUNS=$(curl -s \
    "https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=1" \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28")
  
  RUN_ID=$(echo "$RUNS" | jq -r '.workflow_runs[0].id // empty')
  RUN_URL=$(echo "$RUNS" | jq -r '.workflow_runs[0].html_url // empty')
  RUN_STATUS=$(echo "$RUNS" | jq -r '.workflow_runs[0].status // empty')
  
  if [[ -n "$RUN_ID" ]]; then
    echo ""
    echo "📊 Workflow Run Details:"
    echo "  ID: ${RUN_ID}"
    echo "  Status: ${RUN_STATUS}"
    echo "  URL: ${RUN_URL}"
    echo ""
    echo "🌐 View progress at:"
    echo "  ${RUN_URL}"
    echo ""
    echo "⏳ The workflow will:"
    echo "  1. Find 5 open Dependabot PRs"
    echo "  2. Add comment to each"
    echo "  3. Add labels (blocked, manual-upgrade)"
    echo "  4. Close each PR"
    echo ""
    echo "⏱️  Expected completion: ~1 minute"
  else
    echo ""
    echo "⚠️  Could not fetch workflow run details"
    echo "   Check manually at:"
    echo "   https://github.com/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}"
  fi
else
  echo "❌ Failed to trigger workflow"
  echo "   HTTP Status: ${HTTP_CODE}"
  echo "   Response: ${BODY}"
  echo ""
  echo "Common issues:"
  echo "  - Token doesn't have 'repo' scope"
  echo "  - Token is expired"
  echo "  - Workflow file doesn't exist on main branch"
  exit 1
fi

echo ""
echo "✅ Done! Check the URL above for progress."
