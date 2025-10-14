-- LMS → Google Classroom Autopilot Sync
-- Staging tables, ID mappings, and sync orchestration

-- ============================================================================
-- 1. LMS Event Staging Tables
-- ============================================================================

-- Staging table for incoming LMS events
CREATE TABLE IF NOT EXISTS public.lms_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event metadata
  event_type TEXT NOT NULL CHECK (event_type IN ('course.upsert', 'topic.upsert', 'work.upsert', 'roster.upsert')),
  event_source TEXT NOT NULL, -- LMS identifier (e.g., 'canvas', 'moodle', 'blackboard')
  
  -- Event payload
  payload JSONB NOT NULL,
  
  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Error tracking
  error_message TEXT,
  error_details JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  
  -- Idempotency
  idempotency_key TEXT UNIQUE, -- LMS event ID or fingerprint
  
  -- Result tracking
  classroom_id TEXT, -- Google Classroom ID created/updated
  sync_result JSONB
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_lms_sync_queue_status ON public.lms_sync_queue(status) WHERE status IN ('pending', 'failed');
CREATE INDEX IF NOT EXISTS idx_lms_sync_queue_event_type ON public.lms_sync_queue(event_type);
CREATE INDEX IF NOT EXISTS idx_lms_sync_queue_created ON public.lms_sync_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lms_sync_queue_next_retry ON public.lms_sync_queue(next_retry_at) WHERE status = 'failed' AND attempts < max_attempts;

COMMENT ON TABLE public.lms_sync_queue IS 'Staging queue for LMS events to sync to Google Classroom';
COMMENT ON COLUMN public.lms_sync_queue.idempotency_key IS 'Unique key to prevent duplicate processing';

-- ============================================================================
-- 2. ID Mapping Tables (LMS ↔ Google Classroom)
-- ============================================================================

-- Course mapping
CREATE TABLE IF NOT EXISTS public.lms_classroom_course_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- LMS identifiers
  lms_source TEXT NOT NULL,
  lms_course_id TEXT NOT NULL,
  lms_course_code TEXT,
  
  -- Google Classroom identifiers
  classroom_course_id TEXT NOT NULL,
  classroom_course_link TEXT,
  
  -- Sync metadata
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'archived', 'deleted')),
  
  -- Course data snapshot
  lms_data JSONB,
  classroom_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(lms_source, lms_course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_map_lms ON public.lms_classroom_course_map(lms_source, lms_course_id);
CREATE INDEX IF NOT EXISTS idx_course_map_classroom ON public.lms_classroom_course_map(classroom_course_id);

-- Topic mapping
CREATE TABLE IF NOT EXISTS public.lms_classroom_topic_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- LMS identifiers
  lms_source TEXT NOT NULL,
  lms_course_id TEXT NOT NULL,
  lms_topic_id TEXT NOT NULL,
  
  -- Google Classroom identifiers
  classroom_course_id TEXT NOT NULL,
  classroom_topic_id TEXT NOT NULL,
  
  -- Sync metadata
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'active',
  
  -- Topic data snapshot
  lms_data JSONB,
  classroom_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(lms_source, lms_course_id, lms_topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_map_lms ON public.lms_classroom_topic_map(lms_source, lms_course_id, lms_topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_map_classroom ON public.lms_classroom_topic_map(classroom_course_id, classroom_topic_id);

-- Coursework/Assignment mapping
CREATE TABLE IF NOT EXISTS public.lms_classroom_work_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- LMS identifiers
  lms_source TEXT NOT NULL,
  lms_course_id TEXT NOT NULL,
  lms_work_id TEXT NOT NULL,
  lms_work_type TEXT, -- 'assignment', 'quiz', 'discussion', etc.
  
  -- Google Classroom identifiers
  classroom_course_id TEXT NOT NULL,
  classroom_work_id TEXT NOT NULL,
  classroom_work_type TEXT, -- 'ASSIGNMENT', 'SHORT_ANSWER_QUESTION', 'MULTIPLE_CHOICE_QUESTION'
  
  -- Sync metadata
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'active',
  
  -- Work data snapshot
  lms_data JSONB,
  classroom_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(lms_source, lms_course_id, lms_work_id)
);

CREATE INDEX IF NOT EXISTS idx_work_map_lms ON public.lms_classroom_work_map(lms_source, lms_course_id, lms_work_id);
CREATE INDEX IF NOT EXISTS idx_work_map_classroom ON public.lms_classroom_work_map(classroom_course_id, classroom_work_id);

-- Student roster mapping
CREATE TABLE IF NOT EXISTS public.lms_classroom_roster_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- LMS identifiers
  lms_source TEXT NOT NULL,
  lms_course_id TEXT NOT NULL,
  lms_user_id TEXT NOT NULL,
  lms_user_email TEXT NOT NULL,
  lms_user_role TEXT, -- 'student', 'teacher', 'ta'
  
  -- Google Classroom identifiers
  classroom_course_id TEXT NOT NULL,
  classroom_user_id TEXT,
  classroom_enrollment_id TEXT,
  
  -- Sync metadata
  enrollment_status TEXT DEFAULT 'active' CHECK (enrollment_status IN ('active', 'removed', 'pending')),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User data snapshot
  lms_data JSONB,
  classroom_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(lms_source, lms_course_id, lms_user_id)
);

CREATE INDEX IF NOT EXISTS idx_roster_map_lms ON public.lms_classroom_roster_map(lms_source, lms_course_id, lms_user_id);
CREATE INDEX IF NOT EXISTS idx_roster_map_classroom ON public.lms_classroom_roster_map(classroom_course_id, classroom_user_id);
CREATE INDEX IF NOT EXISTS idx_roster_map_email ON public.lms_classroom_roster_map(lms_user_email);

-- ============================================================================
-- 3. Sync Reconciliation Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lms_sync_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reconciliation metadata
  reconciliation_type TEXT NOT NULL CHECK (reconciliation_type IN ('full', 'incremental', 'course', 'roster')),
  lms_source TEXT NOT NULL,
  
  -- Scope
  course_ids TEXT[], -- Specific courses to reconcile (NULL = all)
  
  -- Status
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  
  -- Results
  items_checked INTEGER DEFAULT 0,
  items_synced INTEGER DEFAULT 0,
  items_skipped INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Details
  error_message TEXT,
  reconciliation_log JSONB
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON public.lms_sync_reconciliation(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_reconciliation_source ON public.lms_sync_reconciliation(lms_source, started_at DESC);

-- ============================================================================
-- 4. Update Triggers
-- ============================================================================

CREATE TRIGGER update_course_map_updated_at
  BEFORE UPDATE ON public.lms_classroom_course_map
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_map_updated_at
  BEFORE UPDATE ON public.lms_classroom_topic_map
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_map_updated_at
  BEFORE UPDATE ON public.lms_classroom_work_map
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roster_map_updated_at
  BEFORE UPDATE ON public.lms_classroom_roster_map
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Helper Functions
-- ============================================================================

-- Enqueue LMS event for sync
CREATE OR REPLACE FUNCTION enqueue_lms_sync(
  p_event_type TEXT,
  p_event_source TEXT,
  p_payload JSONB,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_queue_id UUID;
  v_idempotency_key TEXT;
BEGIN
  -- Generate idempotency key if not provided
  v_idempotency_key := COALESCE(
    p_idempotency_key,
    p_event_source || ':' || p_event_type || ':' || (p_payload->>'id')
  );
  
  -- Insert or update queue entry
  INSERT INTO lms_sync_queue (
    event_type,
    event_source,
    payload,
    idempotency_key,
    status
  )
  VALUES (
    p_event_type,
    p_event_source,
    p_payload,
    v_idempotency_key,
    'pending'
  )
  ON CONFLICT (idempotency_key) DO UPDATE SET
    payload = EXCLUDED.payload,
    status = CASE 
      WHEN lms_sync_queue.status = 'completed' THEN 'pending' -- Re-process if data changed
      ELSE lms_sync_queue.status
    END,
    updated_at = NOW()
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$;

COMMENT ON FUNCTION enqueue_lms_sync IS 'Enqueue an LMS event for sync to Google Classroom';

-- Get next pending sync task
CREATE OR REPLACE FUNCTION get_next_sync_task()
RETURNS TABLE (
  id UUID,
  event_type TEXT,
  event_source TEXT,
  payload JSONB,
  attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE lms_sync_queue
  SET 
    status = 'processing',
    attempts = attempts + 1,
    processed_at = NOW()
  WHERE id = (
    SELECT lms_sync_queue.id
    FROM lms_sync_queue
    WHERE status = 'pending'
      OR (status = 'failed' AND attempts < max_attempts AND next_retry_at <= NOW())
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING 
    lms_sync_queue.id,
    lms_sync_queue.event_type,
    lms_sync_queue.event_source,
    lms_sync_queue.payload,
    lms_sync_queue.attempts;
END;
$$;

COMMENT ON FUNCTION get_next_sync_task IS 'Get next pending sync task with lock';

-- Mark sync task as completed
CREATE OR REPLACE FUNCTION complete_sync_task(
  p_task_id UUID,
  p_classroom_id TEXT,
  p_sync_result JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE lms_sync_queue
  SET 
    status = 'completed',
    classroom_id = p_classroom_id,
    sync_result = p_sync_result,
    processed_at = NOW()
  WHERE id = p_task_id;
  
  RETURN FOUND;
END;
$$;

-- Mark sync task as failed
CREATE OR REPLACE FUNCTION fail_sync_task(
  p_task_id UUID,
  p_error_message TEXT,
  p_error_details JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempts INTEGER;
  v_max_attempts INTEGER;
BEGIN
  -- Get current attempts
  SELECT attempts, max_attempts INTO v_attempts, v_max_attempts
  FROM lms_sync_queue
  WHERE id = p_task_id;
  
  -- Update task
  UPDATE lms_sync_queue
  SET 
    status = CASE 
      WHEN v_attempts >= v_max_attempts THEN 'failed'
      ELSE 'failed'
    END,
    error_message = p_error_message,
    error_details = p_error_details,
    next_retry_at = CASE
      WHEN v_attempts < v_max_attempts THEN NOW() + (POWER(2, v_attempts) || ' minutes')::INTERVAL
      ELSE NULL
    END,
    processed_at = NOW()
  WHERE id = p_task_id;
  
  -- Log to audit_logs
  INSERT INTO audit_logs (action, details)
  VALUES (
    'lms_sync_failed',
    jsonb_build_object(
      'task_id', p_task_id,
      'attempts', v_attempts,
      'error', p_error_message
    )
  );
  
  RETURN FOUND;
END;
$$;

-- Get or create course mapping
CREATE OR REPLACE FUNCTION get_or_create_course_mapping(
  p_lms_source TEXT,
  p_lms_course_id TEXT,
  p_classroom_course_id TEXT,
  p_lms_data JSONB DEFAULT NULL,
  p_classroom_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mapping_id UUID;
BEGIN
  INSERT INTO lms_classroom_course_map (
    lms_source,
    lms_course_id,
    classroom_course_id,
    lms_data,
    classroom_data,
    last_synced_at
  )
  VALUES (
    p_lms_source,
    p_lms_course_id,
    p_classroom_course_id,
    p_lms_data,
    p_classroom_data,
    NOW()
  )
  ON CONFLICT (lms_source, lms_course_id) DO UPDATE SET
    classroom_course_id = EXCLUDED.classroom_course_id,
    lms_data = EXCLUDED.lms_data,
    classroom_data = EXCLUDED.classroom_data,
    last_synced_at = NOW()
  RETURNING id INTO v_mapping_id;
  
  RETURN v_mapping_id;
END;
$$;

-- ============================================================================
-- 6. Views for Monitoring
-- ============================================================================

-- Sync queue status view
CREATE OR REPLACE VIEW v_lms_sync_status AS
SELECT 
  event_type,
  event_source,
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest_event,
  MAX(created_at) as newest_event,
  AVG(attempts) as avg_attempts
FROM lms_sync_queue
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type, event_source, status
ORDER BY event_type, status;

COMMENT ON VIEW v_lms_sync_status IS 'LMS sync queue status summary (last 24 hours)';

-- Failed syncs view
CREATE OR REPLACE VIEW v_lms_sync_failures AS
SELECT 
  id,
  event_type,
  event_source,
  payload->>'id' as lms_id,
  payload->>'name' as lms_name,
  error_message,
  attempts,
  max_attempts,
  created_at,
  next_retry_at
FROM lms_sync_queue
WHERE status = 'failed'
  AND attempts < max_attempts
ORDER BY next_retry_at ASC NULLS LAST;

COMMENT ON VIEW v_lms_sync_failures IS 'Failed sync tasks that will be retried';

-- Mapping summary view
CREATE OR REPLACE VIEW v_lms_mapping_summary AS
SELECT 
  'courses' as entity_type,
  lms_source,
  COUNT(*) as total_mapped,
  COUNT(*) FILTER (WHERE sync_status = 'active') as active,
  COUNT(*) FILTER (WHERE last_synced_at > NOW() - INTERVAL '24 hours') as synced_24h
FROM lms_classroom_course_map
GROUP BY lms_source

UNION ALL

SELECT 
  'topics' as entity_type,
  lms_source,
  COUNT(*) as total_mapped,
  COUNT(*) FILTER (WHERE sync_status = 'active') as active,
  COUNT(*) FILTER (WHERE last_synced_at > NOW() - INTERVAL '24 hours') as synced_24h
FROM lms_classroom_topic_map
GROUP BY lms_source

UNION ALL

SELECT 
  'coursework' as entity_type,
  lms_source,
  COUNT(*) as total_mapped,
  COUNT(*) FILTER (WHERE sync_status = 'active') as active,
  COUNT(*) FILTER (WHERE last_synced_at > NOW() - INTERVAL '24 hours') as synced_24h
FROM lms_classroom_work_map
GROUP BY lms_source

UNION ALL

SELECT 
  'roster' as entity_type,
  lms_source,
  COUNT(*) as total_mapped,
  COUNT(*) FILTER (WHERE enrollment_status = 'active') as active,
  COUNT(*) FILTER (WHERE last_synced_at > NOW() - INTERVAL '24 hours') as synced_24h
FROM lms_classroom_roster_map
GROUP BY lms_source

ORDER BY entity_type, lms_source;

COMMENT ON VIEW v_lms_mapping_summary IS 'Summary of LMS to Classroom mappings';

-- ============================================================================
-- 7. RLS Policies
-- ============================================================================

ALTER TABLE public.lms_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_classroom_course_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_classroom_topic_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_classroom_work_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_classroom_roster_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_sync_reconciliation ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access - lms_sync_queue" ON public.lms_sync_queue
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - course_map" ON public.lms_classroom_course_map
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - topic_map" ON public.lms_classroom_topic_map
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - work_map" ON public.lms_classroom_work_map
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - roster_map" ON public.lms_classroom_roster_map
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - reconciliation" ON public.lms_sync_reconciliation
  FOR ALL USING (auth.role() = 'service_role');

-- Admins can view
CREATE POLICY "Admins can view lms_sync_queue" ON public.lms_sync_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- Sample Queries
-- ============================================================================

/*
-- Enqueue a course sync
SELECT enqueue_lms_sync(
  'course.upsert',
  'canvas',
  '{"id": "12345", "name": "Introduction to Programming", "code": "CS101"}'::jsonb
);

-- Get sync status
SELECT * FROM v_lms_sync_status;

-- View failed syncs
SELECT * FROM v_lms_sync_failures;

-- View mapping summary
SELECT * FROM v_lms_mapping_summary;

-- Get next task to process
SELECT * FROM get_next_sync_task();

-- Mark task as completed
SELECT complete_sync_task('task-uuid', 'classroom-course-id', '{"status": "success"}'::jsonb);

-- Mark task as failed
SELECT fail_sync_task('task-uuid', 'API rate limit exceeded', '{"code": 429}'::jsonb);
*/
