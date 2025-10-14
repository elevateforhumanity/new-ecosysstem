-- =====================================================
-- LMS Identity Mapping & Auto-Unenroll Rules
-- =====================================================
-- Purpose: Map LMS user IDs to Google emails and manage
--          automatic unenrollment policies
-- Version: 1.0.0
-- Date: 2025-10-14
-- =====================================================

-- =====================================================
-- 1. Identity Mapping Tables
-- =====================================================

-- Identity mapping: LMS user ID → Google email
CREATE TABLE IF NOT EXISTS lms_identity_map (
  id BIGSERIAL PRIMARY KEY,
  lms_source TEXT NOT NULL,
  lms_user_id TEXT NOT NULL,
  google_email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lms_source, lms_user_id)
);

CREATE INDEX idx_lms_identity_map_lookup ON lms_identity_map(lms_source, lms_user_id);
CREATE INDEX idx_lms_identity_map_email ON lms_identity_map(google_email);

COMMENT ON TABLE lms_identity_map IS 'Maps LMS user IDs to Google email addresses for roster sync';

-- Identity import staging table
CREATE TABLE IF NOT EXISTS lms_identity_import (
  id BIGSERIAL PRIMARY KEY,
  lms_source TEXT NOT NULL,
  lms_user_id TEXT NOT NULL,
  google_email TEXT NOT NULL,
  full_name TEXT,
  import_batch_id UUID DEFAULT gen_random_uuid(),
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ
);

CREATE INDEX idx_lms_identity_import_batch ON lms_identity_import(import_batch_id);
CREATE INDEX idx_lms_identity_import_applied ON lms_identity_import(applied);

COMMENT ON TABLE lms_identity_import IS 'Staging table for CSV imports of identity mappings';

-- =====================================================
-- 2. Auto-Unenroll Policy Table
-- =====================================================

CREATE TABLE IF NOT EXISTS lms_unenroll_policy (
  id BIGSERIAL PRIMARY KEY,
  auto_unenroll BOOLEAN DEFAULT FALSE,
  grace_period_days INTEGER DEFAULT 7,
  protected_domains TEXT[] DEFAULT ARRAY[]::TEXT[],
  protected_emails TEXT[] DEFAULT ARRAY[]::TEXT[],
  dry_run_mode BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default policy
INSERT INTO lms_unenroll_policy (auto_unenroll, grace_period_days, dry_run_mode)
VALUES (FALSE, 7, TRUE)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE lms_unenroll_policy IS 'Global policy for automatic unenrollment from Google Classroom';
COMMENT ON COLUMN lms_unenroll_policy.auto_unenroll IS 'Master switch: enable/disable auto-unenroll';
COMMENT ON COLUMN lms_unenroll_policy.grace_period_days IS 'Days to wait before unenrolling inactive users';
COMMENT ON COLUMN lms_unenroll_policy.protected_domains IS 'Email domains that should never be auto-unenrolled';
COMMENT ON COLUMN lms_unenroll_policy.protected_emails IS 'Specific emails that should never be auto-unenrolled';
COMMENT ON COLUMN lms_unenroll_policy.dry_run_mode IS 'If true, log unenroll actions without executing them';

-- =====================================================
-- 3. Functions
-- =====================================================

-- Function: Resolve LMS user ID to Google email
CREATE OR REPLACE FUNCTION resolve_lms_identity(
  p_lms_source TEXT,
  p_lms_user_id TEXT,
  p_fallback_email TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_google_email TEXT;
BEGIN
  -- Try to find mapping
  SELECT google_email INTO v_google_email
  FROM lms_identity_map
  WHERE lms_source = p_lms_source
    AND lms_user_id = p_lms_user_id;
  
  -- Return mapped email or fallback
  RETURN COALESCE(v_google_email, p_fallback_email);
END;
$$;

COMMENT ON FUNCTION resolve_lms_identity IS 'Resolve LMS user ID to Google email using identity map';

-- Function: Apply identity import batch
CREATE OR REPLACE FUNCTION apply_identity_import(
  p_batch_id UUID DEFAULT NULL
)
RETURNS TABLE(
  imported_count INTEGER,
  updated_count INTEGER,
  skipped_count INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_imported INTEGER := 0;
  v_updated INTEGER := 0;
  v_skipped INTEGER := 0;
  v_batch_id UUID;
BEGIN
  -- Use provided batch_id or get the latest unapplied batch
  v_batch_id := COALESCE(
    p_batch_id,
    (SELECT import_batch_id FROM lms_identity_import WHERE NOT applied LIMIT 1)
  );
  
  IF v_batch_id IS NULL THEN
    RAISE NOTICE 'No unapplied import batches found';
    RETURN QUERY SELECT 0, 0, 0;
    RETURN;
  END IF;
  
  -- Upsert into identity map
  WITH upserted AS (
    INSERT INTO lms_identity_map (lms_source, lms_user_id, google_email, full_name, updated_at)
    SELECT lms_source, lms_user_id, google_email, full_name, NOW()
    FROM lms_identity_import
    WHERE import_batch_id = v_batch_id
      AND NOT applied
    ON CONFLICT (lms_source, lms_user_id)
    DO UPDATE SET
      google_email = EXCLUDED.google_email,
      full_name = EXCLUDED.full_name,
      updated_at = NOW()
    RETURNING (xmax = 0) AS inserted
  )
  SELECT 
    COUNT(*) FILTER (WHERE inserted) INTO v_imported,
    COUNT(*) FILTER (WHERE NOT inserted) INTO v_updated
  FROM upserted;
  
  -- Mark import records as applied
  UPDATE lms_identity_import
  SET applied = TRUE, applied_at = NOW()
  WHERE import_batch_id = v_batch_id
    AND NOT applied;
  
  -- Log to audit
  INSERT INTO audit_logs (event_type, details)
  VALUES (
    'identity_import_applied',
    jsonb_build_object(
      'batch_id', v_batch_id,
      'imported', v_imported,
      'updated', v_updated
    )
  );
  
  RETURN QUERY SELECT v_imported, v_updated, v_skipped;
END;
$$;

COMMENT ON FUNCTION apply_identity_import IS 'Apply identity mappings from import staging table';

-- Function: Check if user should be protected from unenroll
CREATE OR REPLACE FUNCTION is_protected_from_unenroll(
  p_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_policy RECORD;
  v_domain TEXT;
BEGIN
  -- Get current policy
  SELECT * INTO v_policy FROM lms_unenroll_policy ORDER BY id DESC LIMIT 1;
  
  -- Check if email is in protected list
  IF p_email = ANY(v_policy.protected_emails) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if domain is protected
  v_domain := split_part(p_email, '@', 2);
  IF v_domain = ANY(v_policy.protected_domains) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION is_protected_from_unenroll IS 'Check if user email is protected from auto-unenroll';

-- Function: Get unenroll candidates
CREATE OR REPLACE FUNCTION get_unenroll_candidates(
  p_lms_source TEXT DEFAULT NULL
)
RETURNS TABLE(
  lms_source TEXT,
  lms_course_id TEXT,
  lms_user_id TEXT,
  google_email TEXT,
  classroom_course_id TEXT,
  last_active TIMESTAMPTZ,
  days_inactive INTEGER,
  is_protected BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_policy RECORD;
BEGIN
  -- Get current policy
  SELECT * INTO v_policy FROM lms_unenroll_policy ORDER BY id DESC LIMIT 1;
  
  -- Return candidates based on grace period
  RETURN QUERY
  SELECT 
    r.lms_source,
    r.lms_course_id,
    r.lms_user_id,
    r.google_email,
    r.classroom_course_id,
    r.updated_at AS last_active,
    EXTRACT(DAY FROM NOW() - r.updated_at)::INTEGER AS days_inactive,
    is_protected_from_unenroll(r.google_email) AS is_protected
  FROM lms_classroom_roster_map r
  WHERE r.enrollment_status = 'active'
    AND (p_lms_source IS NULL OR r.lms_source = p_lms_source)
    AND EXTRACT(DAY FROM NOW() - r.updated_at) > v_policy.grace_period_days
    AND NOT is_protected_from_unenroll(r.google_email)
  ORDER BY r.updated_at ASC;
END;
$$;

COMMENT ON FUNCTION get_unenroll_candidates IS 'Get list of users eligible for auto-unenroll based on policy';

-- Function: Process auto-unenroll (with dry-run support)
CREATE OR REPLACE FUNCTION process_auto_unenroll()
RETURNS TABLE(
  action TEXT,
  lms_source TEXT,
  lms_course_id TEXT,
  google_email TEXT,
  days_inactive INTEGER,
  dry_run BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_policy RECORD;
  v_candidate RECORD;
  v_action TEXT;
BEGIN
  -- Get current policy
  SELECT * INTO v_policy FROM lms_unenroll_policy ORDER BY id DESC LIMIT 1;
  
  -- Check if auto-unenroll is enabled
  IF NOT v_policy.auto_unenroll THEN
    RAISE NOTICE 'Auto-unenroll is disabled in policy';
    RETURN;
  END IF;
  
  -- Process each candidate
  FOR v_candidate IN 
    SELECT * FROM get_unenroll_candidates()
  LOOP
    IF v_policy.dry_run_mode THEN
      -- Dry run: just log
      v_action := 'dry_unenroll';
      
      INSERT INTO audit_logs (event_type, details)
      VALUES (
        'dry_unenroll',
        jsonb_build_object(
          'lms_source', v_candidate.lms_source,
          'lms_course_id', v_candidate.lms_course_id,
          'lms_user_id', v_candidate.lms_user_id,
          'google_email', v_candidate.google_email,
          'days_inactive', v_candidate.days_inactive,
          'classroom_course_id', v_candidate.classroom_course_id
        )
      );
    ELSE
      -- Real unenroll: update status
      v_action := 'unenroll';
      
      UPDATE lms_classroom_roster_map
      SET 
        enrollment_status = 'auto_removed',
        updated_at = NOW()
      WHERE lms_source = v_candidate.lms_source
        AND lms_course_id = v_candidate.lms_course_id
        AND lms_user_id = v_candidate.lms_user_id;
      
      INSERT INTO audit_logs (event_type, details)
      VALUES (
        'auto_unenroll',
        jsonb_build_object(
          'lms_source', v_candidate.lms_source,
          'lms_course_id', v_candidate.lms_course_id,
          'lms_user_id', v_candidate.lms_user_id,
          'google_email', v_candidate.google_email,
          'days_inactive', v_candidate.days_inactive,
          'classroom_course_id', v_candidate.classroom_course_id
        )
      );
    END IF;
    
    RETURN QUERY SELECT 
      v_action,
      v_candidate.lms_source,
      v_candidate.lms_course_id,
      v_candidate.google_email,
      v_candidate.days_inactive,
      v_policy.dry_run_mode;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION process_auto_unenroll IS 'Process automatic unenrollment based on policy (supports dry-run)';

-- =====================================================
-- 4. Views
-- =====================================================

-- View: Identity mapping summary
CREATE OR REPLACE VIEW v_lms_identity_summary AS
SELECT 
  lms_source,
  COUNT(*) AS total_mappings,
  COUNT(DISTINCT google_email) AS unique_emails,
  MAX(updated_at) AS last_updated
FROM lms_identity_map
GROUP BY lms_source;

COMMENT ON VIEW v_lms_identity_summary IS 'Summary of identity mappings by LMS source';

-- View: Unenroll candidates preview
CREATE OR REPLACE VIEW v_unenroll_candidates AS
SELECT * FROM get_unenroll_candidates();

COMMENT ON VIEW v_unenroll_candidates IS 'Preview of users eligible for auto-unenroll';

-- View: Protected users
CREATE OR REPLACE VIEW v_protected_users AS
SELECT 
  r.lms_source,
  r.google_email,
  r.enrollment_status,
  CASE 
    WHEN r.google_email = ANY((SELECT protected_emails FROM lms_unenroll_policy LIMIT 1)) 
      THEN 'protected_email'
    WHEN split_part(r.google_email, '@', 2) = ANY((SELECT protected_domains FROM lms_unenroll_policy LIMIT 1))
      THEN 'protected_domain'
    ELSE 'not_protected'
  END AS protection_reason
FROM lms_classroom_roster_map r
WHERE is_protected_from_unenroll(r.google_email);

COMMENT ON VIEW v_protected_users IS 'List of users protected from auto-unenroll';

-- =====================================================
-- 5. Row Level Security (RLS)
-- =====================================================

ALTER TABLE lms_identity_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_identity_import ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_unenroll_policy ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access
CREATE POLICY service_role_all_lms_identity_map ON lms_identity_map
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY service_role_all_lms_identity_import ON lms_identity_import
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY service_role_all_lms_unenroll_policy ON lms_unenroll_policy
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Admins can read
CREATE POLICY admin_read_lms_identity_map ON lms_identity_map
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY admin_read_lms_unenroll_policy ON lms_unenroll_policy
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can update policy
CREATE POLICY admin_update_lms_unenroll_policy ON lms_unenroll_policy
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- 6. Grants
-- =====================================================

GRANT SELECT ON lms_identity_map TO authenticated;
GRANT SELECT ON lms_identity_import TO authenticated;
GRANT SELECT ON lms_unenroll_policy TO authenticated;
GRANT SELECT ON v_lms_identity_summary TO authenticated;
GRANT SELECT ON v_unenroll_candidates TO authenticated;
GRANT SELECT ON v_protected_users TO authenticated;

GRANT EXECUTE ON FUNCTION resolve_lms_identity TO service_role;
GRANT EXECUTE ON FUNCTION apply_identity_import TO service_role;
GRANT EXECUTE ON FUNCTION is_protected_from_unenroll TO service_role;
GRANT EXECUTE ON FUNCTION get_unenroll_candidates TO service_role;
GRANT EXECUTE ON FUNCTION process_auto_unenroll TO service_role;

-- =====================================================
-- Complete!
-- =====================================================

-- Verify installation
DO $$
BEGIN
  RAISE NOTICE '✅ LMS Identity Mapping & Auto-Unenroll Rules installed successfully';
  RAISE NOTICE '📊 Tables: lms_identity_map, lms_identity_import, lms_unenroll_policy';
  RAISE NOTICE '🔧 Functions: resolve_lms_identity, apply_identity_import, process_auto_unenroll';
  RAISE NOTICE '👁️  Views: v_lms_identity_summary, v_unenroll_candidates, v_protected_users';
  RAISE NOTICE '🔒 RLS policies enabled for all tables';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Upload CSV with columns: lms_source, lms_user_id, google_email, full_name';
  RAISE NOTICE '2. Run: SELECT * FROM apply_identity_import();';
  RAISE NOTICE '3. Monitor dry-run: SELECT * FROM v_unenroll_candidates;';
  RAISE NOTICE '4. Enable auto-unenroll when ready: UPDATE lms_unenroll_policy SET auto_unenroll = TRUE, dry_run_mode = FALSE;';
END $$;
