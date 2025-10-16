-- Email Events Tracking
-- Logs all email activity with provider message IDs

CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Email details
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT,
  
  -- Provider details
  provider TEXT NOT NULL CHECK (provider IN ('resend', 'postmark', 'ses', 'smtp')),
  provider_message_id TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'queued' CHECK (status IN (
    'queued',
    'sent',
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'complained',
    'failed'
  )),
  
  -- Event timestamps
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Error tracking
  error_message TEXT,
  error_code TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Related records
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  sync_run_id UUID REFERENCES public.sync_runs(id) ON DELETE SET NULL,
  content_id TEXT, -- Generic content reference (course_id, coursework_id, etc.)
  student_id TEXT,
  guardian_email TEXT,
  
  -- Correlation tracking
  correlation_id TEXT, -- Group related emails (e.g., all emails from one digest run)
  parent_event_id UUID REFERENCES public.email_events(id) ON DELETE SET NULL, -- For reply chains
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_events_recipient ON public.email_events(recipient);
CREATE INDEX IF NOT EXISTS idx_email_events_provider_id ON public.email_events(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON public.email_events(status);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON public.email_events(email_type);
CREATE INDEX IF NOT EXISTS idx_email_events_provider ON public.email_events(provider);
CREATE INDEX IF NOT EXISTS idx_email_events_created ON public.email_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_student ON public.email_events(student_id);
CREATE INDEX IF NOT EXISTS idx_email_events_guardian ON public.email_events(guardian_email);
CREATE INDEX IF NOT EXISTS idx_email_events_task ON public.email_events(task_id);
CREATE INDEX IF NOT EXISTS idx_email_events_sync_run ON public.email_events(sync_run_id);
CREATE INDEX IF NOT EXISTS idx_email_events_content ON public.email_events(content_id);
CREATE INDEX IF NOT EXISTS idx_email_events_correlation ON public.email_events(correlation_id);

-- Update timestamp trigger
CREATE TRIGGER update_email_events_updated_at
  BEFORE UPDATE ON public.email_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.email_events IS 'Tracks all email activity with provider message IDs';
COMMENT ON COLUMN public.email_events.provider_message_id IS 'Unique ID from email provider (for webhook matching)';
COMMENT ON COLUMN public.email_events.status IS 'Current email status';
COMMENT ON COLUMN public.email_events.metadata IS 'Additional provider-specific data';

-- RLS Policy
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access - email_events" ON public.email_events
  FOR ALL USING (auth.role() = 'service_role');

-- Admins can view email events
CREATE POLICY "Admins can view email events" ON public.email_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Email delivery statistics view
CREATE OR REPLACE VIEW v_email_stats AS
SELECT 
  DATE(created_at) as date,
  provider,
  email_type,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'opened') as opened,
  COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
  COUNT(*) FILTER (WHERE status = 'complained') as complained,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'delivered') / NULLIF(COUNT(*), 0),
    2
  ) as delivery_rate,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'opened') / NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0),
    2
  ) as open_rate,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'clicked') / NULLIF(COUNT(*) FILTER (WHERE status = 'opened'), 0),
    2
  ) as click_rate
FROM email_events
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at), provider, email_type
ORDER BY date DESC, provider, email_type;

COMMENT ON VIEW v_email_stats IS 'Email delivery statistics by date, provider, and type';

-- Recent email events view (for admin UI)
CREATE OR REPLACE VIEW v_recent_email_events AS
SELECT 
  ee.id,
  ee.recipient,
  ee.subject,
  ee.email_type,
  ee.provider,
  ee.provider_message_id,
  ee.status,
  ee.created_at,
  ee.sent_at,
  ee.delivered_at,
  ee.opened_at,
  ee.error_message,
  cs.name as student_name,
  cs.email as student_email
FROM email_events ee
LEFT JOIN classroom_students cs ON ee.student_id = cs.user_id
WHERE ee.created_at > NOW() - INTERVAL '7 days'
ORDER BY ee.created_at DESC
LIMIT 1000;

COMMENT ON VIEW v_recent_email_events IS 'Recent email events for admin UI (last 7 days)';

-- Function to update email event status (called by webhooks)
CREATE OR REPLACE FUNCTION update_email_event_status(
  p_provider_message_id TEXT,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL,
  p_error_code TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_timestamp_column TEXT;
BEGIN
  -- Determine which timestamp column to update
  v_timestamp_column := p_status || '_at';
  
  -- Update the event
  EXECUTE format(
    'UPDATE email_events 
     SET status = $1, 
         %I = NOW(),
         error_message = $2,
         error_code = $3,
         updated_at = NOW()
     WHERE provider_message_id = $4',
    v_timestamp_column
  )
  USING p_status, p_error_message, p_error_code, p_provider_message_id;
  
  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION update_email_event_status IS 'Update email event status from webhook';

-- Function to get email stats for a date range
CREATE OR REPLACE FUNCTION get_email_stats(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  provider TEXT,
  email_type TEXT,
  total_sent BIGINT,
  delivered BIGINT,
  opened BIGINT,
  clicked BIGINT,
  bounced BIGINT,
  complained BIGINT,
  failed BIGINT,
  delivery_rate NUMERIC,
  open_rate NUMERIC,
  click_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ee.provider,
    ee.email_type,
    COUNT(*) as total_sent,
    COUNT(*) FILTER (WHERE ee.status = 'delivered') as delivered,
    COUNT(*) FILTER (WHERE ee.status = 'opened') as opened,
    COUNT(*) FILTER (WHERE ee.status = 'clicked') as clicked,
    COUNT(*) FILTER (WHERE ee.status = 'bounced') as bounced,
    COUNT(*) FILTER (WHERE ee.status = 'complained') as complained,
    COUNT(*) FILTER (WHERE ee.status = 'failed') as failed,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE ee.status = 'delivered') / NULLIF(COUNT(*), 0),
      2
    ) as delivery_rate,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE ee.status = 'opened') / NULLIF(COUNT(*) FILTER (WHERE ee.status = 'delivered'), 0),
      2
    ) as open_rate,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE ee.status = 'clicked') / NULLIF(COUNT(*) FILTER (WHERE ee.status = 'opened'), 0),
      2
    ) as click_rate
  FROM email_events ee
  WHERE DATE(ee.created_at) BETWEEN p_start_date AND p_end_date
  GROUP BY ee.provider, ee.email_type
  ORDER BY ee.provider, ee.email_type;
END;
$$;

COMMENT ON FUNCTION get_email_stats IS 'Get email statistics for a date range';

-- Sample queries for testing
/*
-- View recent email events
SELECT * FROM v_recent_email_events LIMIT 50;

-- View email stats
SELECT * FROM v_email_stats WHERE date > CURRENT_DATE - INTERVAL '7 days';

-- Get stats for last 30 days
SELECT * FROM get_email_stats(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE);

-- Find bounced emails
SELECT recipient, subject, error_message, bounced_at
FROM email_events
WHERE status = 'bounced'
ORDER BY bounced_at DESC;

-- Find emails that haven't been delivered
SELECT recipient, subject, provider, created_at
FROM email_events
WHERE status IN ('queued', 'sent')
  AND created_at < NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
*/
