-- Guardian Email Preferences & Opt-Out System

CREATE TABLE IF NOT EXISTS public.guardian_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_email TEXT NOT NULL,
  student_id TEXT,
  opted_out BOOLEAN DEFAULT false,
  opted_out_at TIMESTAMPTZ,
  email_frequency TEXT DEFAULT 'weekly' CHECK (email_frequency IN ('daily', 'weekly', 'never')),
  notification_types JSONB DEFAULT '{
    "missing_assignments": true,
    "grade_updates": true,
    "course_announcements": true,
    "attendance_alerts": true
  }'::jsonb,
  unsubscribe_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guardian_email, student_id)
);

CREATE INDEX IF NOT EXISTS idx_guardian_prefs_email ON public.guardian_preferences(guardian_email);
CREATE INDEX IF NOT EXISTS idx_guardian_prefs_student ON public.guardian_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_guardian_prefs_token ON public.guardian_preferences(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_guardian_prefs_opted_out ON public.guardian_preferences(opted_out);

-- Update timestamp trigger
CREATE TRIGGER update_guardian_preferences_updated_at
  BEFORE UPDATE ON public.guardian_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.guardian_preferences IS 'Guardian email preferences and opt-out settings';
COMMENT ON COLUMN public.guardian_preferences.guardian_email IS 'Guardian email address';
COMMENT ON COLUMN public.guardian_preferences.student_id IS 'Specific student (NULL = all students)';
COMMENT ON COLUMN public.guardian_preferences.opted_out IS 'Whether guardian has opted out of all emails';
COMMENT ON COLUMN public.guardian_preferences.email_frequency IS 'How often to send emails (daily, weekly, never)';
COMMENT ON COLUMN public.guardian_preferences.notification_types IS 'Which types of notifications to send';
COMMENT ON COLUMN public.guardian_preferences.unsubscribe_token IS 'Secure token for unsubscribe links';

-- RLS Policy
ALTER TABLE public.guardian_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access - guardian_preferences" ON public.guardian_preferences
  FOR ALL USING (auth.role() = 'service_role');

-- Guardians can view/update their own preferences (if authenticated)
CREATE POLICY "Guardians can manage own preferences" ON public.guardian_preferences
  FOR ALL
  USING (auth.email() = guardian_email);

-- Helper function to check if guardian should receive emails
CREATE OR REPLACE FUNCTION should_send_to_guardian(
  p_email TEXT,
  p_student_id TEXT DEFAULT NULL,
  p_notification_type TEXT DEFAULT 'missing_assignments'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefs RECORD;
BEGIN
  -- Get preferences
  SELECT * INTO v_prefs
  FROM guardian_preferences
  WHERE guardian_email = p_email
    AND (student_id = p_student_id OR (student_id IS NULL AND p_student_id IS NULL))
  LIMIT 1;

  -- No preferences = send (opt-in by default)
  IF v_prefs IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check if opted out
  IF v_prefs.opted_out THEN
    RETURN FALSE;
  END IF;

  -- Check email frequency
  IF v_prefs.email_frequency = 'never' THEN
    RETURN FALSE;
  END IF;

  -- Check notification type
  IF NOT (v_prefs.notification_types->>p_notification_type)::boolean THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION should_send_to_guardian IS 'Check if guardian should receive a specific type of email';

-- View for active guardians (not opted out)
CREATE OR REPLACE VIEW v_active_guardians AS
SELECT 
  gp.*,
  cg.student_id as classroom_student_id,
  cs.name as student_name,
  cs.email as student_email
FROM guardian_preferences gp
LEFT JOIN classroom_guardians cg ON gp.guardian_email = cg.guardian_email
LEFT JOIN classroom_students cs ON cg.student_id = cs.user_id
WHERE gp.opted_out = false
  AND gp.email_frequency != 'never';

COMMENT ON VIEW v_active_guardians IS 'Active guardians who have not opted out';

-- Sample data for testing (optional)
-- INSERT INTO guardian_preferences (guardian_email, student_id, unsubscribe_token)
-- VALUES 
--   ('parent1@example.com', 'student123', encode(gen_random_bytes(32), 'hex')),
--   ('parent2@example.com', NULL, encode(gen_random_bytes(32), 'hex'));
