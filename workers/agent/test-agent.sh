#!/bin/bash
# Test script for EFH AI Agent
# Usage: ./test-agent.sh [worker-url] [jwt-token]

set -e

WORKER_URL="${1:-http://localhost:8787}"
JWT_TOKEN="${2:-test-token}"

echo "🧪 Testing EFH AI Agent"
echo "Worker URL: $WORKER_URL"
echo ""

# Test 1: Create Program
echo "Test 1: Create Program"
curl -X POST "$WORKER_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "prompt": "Create a new Tax Prep Training program for $2500 tuition"
  }' | jq '.'

echo ""
echo "---"
echo ""

# Test 2: Update Tuition
echo "Test 2: Update Tuition"
curl -X POST "$WORKER_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "prompt": "Update tuition for program abc-123 to $3000"
  }' | jq '.'

echo ""
echo "---"
echo ""

# Test 3: Generate Report
echo "Test 3: Generate Report"
curl -X POST "$WORKER_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "prompt": "Generate ETPL report"
  }' | jq '.'

echo ""
echo "---"
echo ""

# Test 4: Get Stats
echo "Test 4: Get Stats"
curl -X POST "$WORKER_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "prompt": "Show me the stats"
  }' | jq '.'

echo ""
echo "✅ All tests complete"
