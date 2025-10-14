-- Do Not Contact and Role-Based Access Control
-- Adds compliance features and admin-only resend controls

-- ============================================================================
-- 1. Do Not Contact Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.do_not_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact information
  email TEXT NOT NULL UNIQUE,
  
  -- Reason and metadata
  reason TEXT CHECK (reason IN (
    'user_request',      -- User requested to be removed
    'hard_bounce',       -- Email hard bounced
    'spam_complaint',    -- User marked as spam
    'admin_block',       -- Admin manually blocked
    'legal_requirement'  -- Legal/compliance requirement
  )),
  reason_details TEXT,
  
  -- Who added this
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  added_by_email TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Optional expiration (for temporary blocks)
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dnc_email ON public.do_not_contact(email);
CREATE INDEX IF NOT EXISTS idx_dnc_reason ON public.do_not_contact(reason);
CREATE INDEX IF NOT EXISTS idx_dnc_expires ON public.do_not_contact(expires_at) WHERE expires_at IS NOT NULL;

-- Update timestamp trigger
CREATE TRIGGER update_do_not_contact_updated_at
  BEFORE UPDATE ON public.do_not_contact
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.do_not_contact IS 'Email addresses that should not receive any communications';
COMMENT ON COLUMN public.do_not_contact.reason IS 'Why this email is blocked';
COMMENT ON COLUMN public.do_not_contact.expires_at IS 'Optional expiration for temporary blocks';

-- ============================================================================
-- 2. Add Do Not Contact flag to email_events
-- ============================================================================

ALTER TABLE public.email_events 
  ADD COLUMN IF NOT EXISTS blocked_by_dnc BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS resend_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_resend_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resend_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_email_events_blocked ON public.email_events(blocked_by_dnc) WHERE blocked_by_dnc = TRUE;
CREATE INDEX IF NOT EXISTS idx_email_events_resend_count ON public.email_events(resend_count) WHERE resend_count > 0;

COMMENT ON COLUMN public.email_events.blocked_by_dnc IS 'TRUE if email was blocked by Do Not Contact list';
COMMENT ON COLUMN public.email_events.resend_count IS 'Number of times this email has been resent';
COMMENT ON COLUMN public.email_events.last_resend_at IS 'Timestamp of last resend attempt';
COMMENT ON COLUMN public.email_events.resend_by IS 'Admin user who triggered the resend';

-- ============================================================================
-- 3. RLS Policies for Do Not Contact
-- ============================================================================

ALTER TABLE public.do_not_contact ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access - do_not_contact" ON public.do_not_contact
  FOR ALL USING (auth.role() = 'service_role');

-- Admins can view and manage
CREATE POLICY "Admins can manage do_not_contact" ON public.do_not_contact
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users can view their own email status
CREATE POLICY "Users can view own dnc status" ON public.do_not_contact
  FOR SELECT
  USING (
    email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 4. Function to check if email is on Do Not Contact list
-- ============================================================================

CREATE OR REPLACE FUNCTION is_email_blocked(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_blocked BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM do_not_contact
    WHERE email = LOWER(p_email)
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_blocked;
  
  RETURN v_blocked;
END;
$$;

COMMENT ON FUNCTION is_email_blocked IS 'Check if an email address is on the Do Not Contact list';

-- ============================================================================
-- 5. Function to add email to Do Not Contact list
-- ============================================================================

CREATE OR REPLACE FUNCTION add_to_do_not_contact(
  p_email TEXT,
  p_reason TEXT,
  p_reason_details TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dnc_id UUID;
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Get current user info
  v_user_id := auth.uid();
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  
  -- Insert or update
  INSERT INTO do_not_contact (
    email,
    reason,
    reason_details,
    added_by,
    added_by_email,
    expires_at
  )
  VALUES (
    LOWER(p_email),
    p_reason,
    p_reason_details,
    v_user_id,
    v_user_email,
    p_expires_at
  )
  ON CONFLICT (email) DO UPDATE SET
    reason = EXCLUDED.reason,
    reason_details = EXCLUDED.reason_details,
    added_by = EXCLUDED.added_by,
    added_by_email = EXCLUDED.added_by_email,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW()
  RETURNING id INTO v_dnc_id;
  
  RETURN v_dnc_id;
END;
$$;

COMMENT ON FUNCTION add_to_do_not_contact IS 'Add an email to the Do Not Contact list';

-- ============================================================================
-- 6. Function to remove email from Do Not Contact list
-- ============================================================================

CREATE OR REPLACE FUNCTION remove_from_do_not_contact(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM do_not_contact WHERE email = LOWER(p_email);
  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION remove_from_do_not_contact IS 'Remove an email from the Do Not Contact list';

-- ============================================================================
-- 7. Function to check if user is admin
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  SELECT 
    raw_user_meta_data->>'role' = 'admin'
  INTO v_is_admin
  FROM auth.users
  WHERE id = v_user_id;
  
  RETURN COALESCE(v_is_admin, FALSE);
END;
$$;

COMMENT ON FUNCTION is_admin IS 'Check if a user has admin role';

-- ============================================================================
-- 8. Enhanced resend function with RBAC and DNC checks
-- ============================================================================

CREATE OR REPLACE FUNCTION can_resend_email(
  p_event_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  can_resend BOOLEAN,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
  v_event RECORD;
  v_blocked BOOLEAN;
  v_cooldown_minutes INTEGER;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  v_cooldown_minutes := COALESCE(current_setting('app.email_resend_cooldown_min', TRUE)::INTEGER, 720);
  
  -- Check if user is admin
  v_is_admin := is_admin(v_user_id);
  
  IF NOT v_is_admin THEN
    RETURN QUERY SELECT FALSE, 'Only administrators can resend emails';
    RETURN;
  END IF;
  
  -- Get email event details
  SELECT * INTO v_event
  FROM email_events
  WHERE id = p_event_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Email event not found';
    RETURN;
  END IF;
  
  -- Check if email is on Do Not Contact list
  v_blocked := is_email_blocked(v_event.recipient);
  
  IF v_blocked THEN
    RETURN QUERY SELECT FALSE, 'Email is on Do Not Contact list';
    RETURN;
  END IF;
  
  -- Check if email status allows resend
  IF v_event.status NOT IN ('failed', 'bounced') THEN
    RETURN QUERY SELECT FALSE, 'Can only resend failed or bounced emails';
    RETURN;
  END IF;
  
  -- Check cooldown period
  IF v_event.last_resend_at IS NOT NULL 
     AND v_event.last_resend_at > NOW() - (v_cooldown_minutes || ' minutes')::INTERVAL THEN
    RETURN QUERY SELECT FALSE, 
      'Cooldown period active. Last resend was ' || 
      EXTRACT(EPOCH FROM (NOW() - v_event.last_resend_at))/60 || 
      ' minutes ago. Wait ' || 
      EXTRACT(EPOCH FROM ((v_event.last_resend_at + (v_cooldown_minutes || ' minutes')::INTERVAL) - NOW()))/60 ||
      ' more minutes.';
    RETURN;
  END IF;
  
  -- Check if too many resend attempts
  IF v_event.resend_count >= 3 THEN
    RETURN QUERY SELECT FALSE, 'Maximum resend attempts (3) reached';
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT TRUE, 'Email can be resent';
END;
$$;

COMMENT ON FUNCTION can_resend_email IS 'Check if an email can be resent with RBAC and DNC validation';

-- ============================================================================
-- 9. Trigger to auto-add bounced/complained emails to DNC
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_add_to_dnc()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Hard bounce - add to DNC
  IF NEW.status = 'bounced' AND OLD.status != 'bounced' THEN
    PERFORM add_to_do_not_contact(
      NEW.recipient,
      'hard_bounce',
      'Automatically added due to hard bounce: ' || COALESCE(NEW.error_message, 'No details')
    );
    NEW.blocked_by_dnc := TRUE;
  END IF;
  
  -- Spam complaint - add to DNC
  IF NEW.status = 'complained' AND OLD.status != 'complained' THEN
    PERFORM add_to_do_not_contact(
      NEW.recipient,
      'spam_complaint',
      'Automatically added due to spam complaint'
    );
    NEW.blocked_by_dnc := TRUE;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER email_events_auto_dnc
  BEFORE UPDATE ON public.email_events
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_to_dnc();

COMMENT ON FUNCTION auto_add_to_dnc IS 'Automatically add emails to DNC list on hard bounce or spam complaint';

-- ============================================================================
-- 10. View for DNC statistics
-- ============================================================================

CREATE OR REPLACE VIEW v_dnc_stats AS
SELECT 
  reason,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at > NOW()) as temporary_blocks,
  COUNT(*) FILTER (WHERE expires_at IS NULL OR expires_at <= NOW()) as permanent_blocks
FROM do_not_contact
GROUP BY reason
ORDER BY count DESC;

COMMENT ON VIEW v_dnc_stats IS 'Statistics about Do Not Contact list';

-- ============================================================================
-- 11. View for admin dashboard
-- ============================================================================

CREATE OR REPLACE VIEW v_email_admin_dashboard AS
SELECT 
  ee.id,
  ee.recipient,
  ee.subject,
  ee.email_type,
  ee.provider,
  ee.status,
  ee.created_at,
  ee.sent_at,
  ee.error_message,
  ee.resend_count,
  ee.last_resend_at,
  ee.blocked_by_dnc,
  dnc.reason as dnc_reason,
  dnc.reason_details as dnc_details,
  CASE 
    WHEN ee.status IN ('failed', 'bounced') 
         AND NOT ee.blocked_by_dnc 
         AND (ee.last_resend_at IS NULL OR ee.last_resend_at < NOW() - INTERVAL '12 hours')
         AND ee.resend_count < 3
    THEN TRUE
    ELSE FALSE
  END as can_resend
FROM email_events ee
LEFT JOIN do_not_contact dnc ON LOWER(ee.recipient) = dnc.email
WHERE ee.created_at > NOW() - INTERVAL '30 days'
ORDER BY ee.created_at DESC;

COMMENT ON VIEW v_email_admin_dashboard IS 'Admin dashboard view with resend eligibility';

-- ============================================================================
-- Sample queries for testing
-- ============================================================================

/*
-- Check if email is blocked
SELECT is_email_blocked('user@example.com');

-- Add email to DNC
SELECT add_to_do_not_contact('spam@example.com', 'user_request', 'User requested removal');

-- Check if user can resend
SELECT * FROM can_resend_email('event-uuid-here');

-- View DNC statistics
SELECT * FROM v_dnc_stats;

-- View admin dashboard
SELECT * FROM v_email_admin_dashboard WHERE can_resend = TRUE LIMIT 10;

-- Remove from DNC
SELECT remove_from_do_not_contact('user@example.com');

-- Check if user is admin
SELECT is_admin();
*/
