-- Google Classroom OAuth Token Storage
-- Stores refresh tokens for user authentication

CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  access_token TEXT,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expiry_date BIGINT,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_user_tokens_email ON public.user_tokens(email);

-- RLS Policies (restrict access to service role only)
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access tokens
CREATE POLICY "Service role only" ON public.user_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_tokens_updated_at
  BEFORE UPDATE ON public.user_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.user_tokens IS 'Stores Google OAuth refresh tokens for Classroom API access';
COMMENT ON COLUMN public.user_tokens.email IS 'User email (teacher/admin)';
COMMENT ON COLUMN public.user_tokens.access_token IS 'Short-lived access token (refreshed automatically)';
COMMENT ON COLUMN public.user_tokens.refresh_token IS 'Long-lived refresh token (never expires unless revoked)';
COMMENT ON COLUMN public.user_tokens.expiry_date IS 'Unix timestamp when access_token expires';
COMMENT ON COLUMN public.user_tokens.scope IS 'OAuth scopes granted';
