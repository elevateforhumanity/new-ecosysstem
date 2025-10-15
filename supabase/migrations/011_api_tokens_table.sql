-- API Tokens Storage
-- Securely stores API tokens for various services

CREATE TABLE IF NOT EXISTS api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL, -- cloudflare, stripe, postmark, etc.
  token_name TEXT NOT NULL,
  token_value TEXT NOT NULL, -- Encrypted in production
  token_id TEXT, -- External token ID if applicable
  permissions JSONB, -- Token permissions/scopes
  account_id TEXT, -- Associated account ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_tokens_service ON api_tokens(service);
CREATE INDEX IF NOT EXISTS idx_api_tokens_is_active ON api_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_api_tokens_created_at ON api_tokens(created_at DESC);

-- RLS policies
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access tokens (security)
CREATE POLICY "Service role full access to api_tokens" ON api_tokens FOR ALL USING (auth.role() = 'service_role');

-- Function to update last_used_at
CREATE OR REPLACE FUNCTION update_token_last_used()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_used_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Trigger would be added when tokens are actually used
-- For now, manual updates via application code
