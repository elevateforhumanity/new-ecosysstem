#!/usr/bin/env bash
set -euo pipefail

need() { test -n "${!1:-}" || { echo "Missing env: $1"; exit 1; }; }

need CF_API_TOKEN
need CF_ACCOUNT_ID
need CF_ZONE_NAME
need CF_PAGES_PROJECT

echo "Env OK: CF_ACCOUNT_ID=$CF_ACCOUNT_ID  ZONE=$CF_ZONE_NAME  PROJECT=$CF_PAGES_PROJECT"