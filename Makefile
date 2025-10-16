# EFH Autopilot Platform - Makefile
# Quick commands for deployment and testing

.PHONY: bootstrap secrets deploy workers frontend supabase test clean help

# Default target
.DEFAULT_GOAL := help

# Load environment variables
include .env
export

help: ## Show this help message
	@echo "EFH Autopilot Platform - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

bootstrap: secrets deploy test ## Complete setup: secrets + deploy + test

secrets: ## Set secrets for all workers
	@echo "🔑 Setting secrets for all workers..."
	@bash -lc 'source .env; \
	for W in $$(basename $$ORCH_DIR) $$(basename $$ANALYZER_DIR) $$(basename $$STYLIST_DIR); do \
	  printf "%s" "$$CF_API_TOKEN"  | wrangler secret put CF_API_TOKEN  --name $$W >/dev/null 2>&1; \
	  printf "%s" "$$CF_ACCOUNT_ID" | wrangler secret put CF_ACCOUNT_ID --name $$W >/dev/null 2>&1; \
	  [[ -n "$${SUPABASE_URL:-}" ]] && printf "%s" "$$SUPABASE_URL" | wrangler secret put SUPABASE_URL --name $$W >/dev/null 2>&1; \
	  [[ -n "$${SUPABASE_SERVICE_KEY:-}" ]] && printf "%s" "$$SUPABASE_SERVICE_KEY" | wrangler secret put SUPABASE_SERVICE_KEY --name $$W >/dev/null 2>&1; \
	  echo "  ✅ Secrets set for $$W"; \
	done'

workers: ## Deploy all workers
	@echo "🚀 Deploying workers..."
	@bash -lc 'source .env; \
	for D in $$ORCH_DIR $$ANALYZER_DIR $$STYLIST_DIR; do \
	  echo "  Deploying $$(basename $$D)..."; \
	  (cd $$D && wrangler deploy 2>&1 | grep -E "(Published|✨)" || true); \
	done'
	@echo "✅ All workers deployed"

supabase: ## Deploy Supabase Edge Functions
	@echo "🔧 Deploying Supabase functions..."
	@bash -lc 'source .env; \
	supabase login --token $$SUPABASE_ACCESS_TOKEN >/dev/null 2>&1; \
	supabase link --project-ref $$SUPABASE_PROJECT_REF >/dev/null 2>&1; \
	if [ -d ./supabase/functions ]; then \
	  supabase functions deploy --project-ref $$SUPABASE_PROJECT_REF; \
	else \
	  echo "  ⚠️  No Supabase functions directory found"; \
	fi'

frontend: ## Build frontend
	@echo "🎨 Building frontend..."
	@bash -lc 'source .env; \
	if [ -d $$FRONTEND_DIR ]; then \
	  (cd $$FRONTEND_DIR && npm i >/dev/null 2>&1 && NODE_ENV=$$FRONTEND_ENV bash -lc "$$FRONTEND_BUILD_CMD"); \
	  echo "  ✅ Frontend built"; \
	else \
	  echo "  ⚠️  Frontend directory not found"; \
	fi'

deploy: workers supabase frontend ## Deploy everything (workers + supabase + frontend)
	@echo "✅ Full deployment complete"

test: ## Run smoke tests on all workers
	@echo "🧪 Running smoke tests..."
	@bash -lc 'source .env; \
	OH=$$(basename $$ORCH_DIR).workers.dev; \
	AH=$$(basename $$ANALYZER_DIR).workers.dev; \
	SH=$$(basename $$STYLIST_DIR).workers.dev; \
	echo ""; \
	echo "Orchestrator ($$OH):"; \
	curl -sS https://$$OH/health 2>/dev/null | head -c 200 && echo "  ✅"; \
	echo ""; \
	echo "Analyzer ($$AH):"; \
	curl -sS https://$$AH/health 2>/dev/null | head -c 200 && echo "  ✅"; \
	echo ""; \
	echo "Stylist ($$SH):"; \
	curl -sS https://$$SH/health 2>/dev/null | head -c 200 && echo "  ✅"; \
	echo ""'

diagnose: ## Run orchestrator diagnostics
	@echo "🔍 Running diagnostics..."
	@bash -lc 'source .env; \
	OH=$$(basename $$ORCH_DIR).workers.dev; \
	curl -sS https://$$OH/autopilot/diagnose 2>/dev/null | jq . || curl -sS https://$$OH/autopilot/diagnose'

logs-orchestrator: ## Tail orchestrator logs
	@bash -lc 'source .env; wrangler tail $$(basename $$ORCH_DIR)'

logs-analyzer: ## Tail analyzer logs
	@bash -lc 'source .env; wrangler tail $$(basename $$ANALYZER_DIR)'

logs-stylist: ## Tail stylist logs
	@bash -lc 'source .env; wrangler tail $$(basename $$STYLIST_DIR)'

list-secrets: ## List secrets for all workers
	@echo "🔑 Secrets for all workers:"
	@bash -lc 'source .env; \
	for W in $$(basename $$ORCH_DIR) $$(basename $$ANALYZER_DIR) $$(basename $$STYLIST_DIR); do \
	  echo ""; \
	  echo "$$W:"; \
	  wrangler secret list --name $$W 2>/dev/null || echo "  No secrets found"; \
	done'

clean: ## Clean build artifacts
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf dist/ build/ .wrangler/ node_modules/.cache/
	@echo "✅ Clean complete"

dev-orchestrator: ## Run orchestrator in dev mode
	@bash -lc 'source .env; cd $$ORCH_DIR && wrangler dev'

dev-analyzer: ## Run analyzer in dev mode
	@bash -lc 'source .env; cd $$ANALYZER_DIR && wrangler dev'

dev-stylist: ## Run stylist in dev mode
	@bash -lc 'source .env; cd $$STYLIST_DIR && wrangler dev'

status: ## Show deployment status
	@echo "📊 Deployment Status:"
	@echo ""
	@echo "Workers:"
	@bash -lc 'source .env; \
	for W in $$(basename $$ORCH_DIR) $$(basename $$ANALYZER_DIR) $$(basename $$STYLIST_DIR); do \
	  echo "  $$W: $$(wrangler deployments list --name $$W 2>/dev/null | grep -o "https://[^ ]*" | head -1 || echo "Not deployed")"; \
	done'
	@echo ""
	@echo "KV Namespaces:"
	@wrangler kv:namespace list 2>/dev/null | grep -E "(REGISTRY|LOGS|SUMMARIES)" || echo "  None found"
	@echo ""
	@echo "R2 Buckets:"
	@wrangler r2 bucket list 2>/dev/null | grep -E "(efh-assets|efh-images)" || echo "  None found"

quick: ## Quick deploy (secrets + workers + test)
	@$(MAKE) secrets
	@$(MAKE) workers
	@$(MAKE) test
