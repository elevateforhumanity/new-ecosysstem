-- Google Classroom Sync Tables
-- Stores synced data from Google Classroom API

-- Courses
CREATE TABLE IF NOT EXISTS public.classroom_courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  section TEXT,
  description TEXT,
  description_heading TEXT,
  room TEXT,
  owner_id TEXT,
  course_state TEXT,
  enrollment_code TEXT,
  calendar_id TEXT,
  teacher_group_email TEXT,
  course_group_email TEXT,
  guardians_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classroom_courses_state ON public.classroom_courses(course_state);
CREATE INDEX IF NOT EXISTS idx_classroom_courses_owner ON public.classroom_courses(owner_id);

-- Students
CREATE TABLE IF NOT EXISTS public.classroom_students (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.classroom_courses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_students_course ON public.classroom_students(course_id);
CREATE INDEX IF NOT EXISTS idx_classroom_students_user ON public.classroom_students(user_id);
CREATE INDEX IF NOT EXISTS idx_classroom_students_email ON public.classroom_students(email);

-- Teachers
CREATE TABLE IF NOT EXISTS public.classroom_teachers (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.classroom_courses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_teachers_course ON public.classroom_teachers(course_id);
CREATE INDEX IF NOT EXISTS idx_classroom_teachers_user ON public.classroom_teachers(user_id);

-- Coursework (Assignments)
CREATE TABLE IF NOT EXISTS public.classroom_coursework (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.classroom_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  state TEXT,
  alternate_link TEXT,
  creation_time TIMESTAMPTZ,
  update_time TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  max_points NUMERIC,
  work_type TEXT,
  submission_modification_mode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classroom_coursework_course ON public.classroom_coursework(course_id);
CREATE INDEX IF NOT EXISTS idx_classroom_coursework_state ON public.classroom_coursework(state);
CREATE INDEX IF NOT EXISTS idx_classroom_coursework_due ON public.classroom_coursework(due_date);

-- Submissions
CREATE TABLE IF NOT EXISTS public.classroom_submissions (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.classroom_courses(id) ON DELETE CASCADE,
  coursework_id TEXT NOT NULL REFERENCES public.classroom_coursework(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  state TEXT,
  late BOOLEAN DEFAULT false,
  draft_grade NUMERIC,
  assigned_grade NUMERIC,
  alternate_link TEXT,
  creation_time TIMESTAMPTZ,
  update_time TIMESTAMPTZ,
  submission_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coursework_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_submissions_course ON public.classroom_submissions(course_id);
CREATE INDEX IF NOT EXISTS idx_classroom_submissions_coursework ON public.classroom_submissions(coursework_id);
CREATE INDEX IF NOT EXISTS idx_classroom_submissions_student ON public.classroom_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_classroom_submissions_state ON public.classroom_submissions(state);
CREATE INDEX IF NOT EXISTS idx_classroom_submissions_late ON public.classroom_submissions(late);

-- Guardians
CREATE TABLE IF NOT EXISTS public.classroom_guardians (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  guardian_id TEXT,
  guardian_email TEXT NOT NULL,
  invited_email TEXT,
  invitation_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classroom_guardians_student ON public.classroom_guardians(student_id);
CREATE INDEX IF NOT EXISTS idx_classroom_guardians_email ON public.classroom_guardians(guardian_email);
CREATE INDEX IF NOT EXISTS idx_classroom_guardians_state ON public.classroom_guardians(invitation_state);

-- Sync Runs (track sync execution)
CREATE TABLE IF NOT EXISTS public.sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_deleted INTEGER DEFAULT 0,
  error_message TEXT,
  details JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_type ON public.sync_runs(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_runs_status ON public.sync_runs(status);
CREATE INDEX IF NOT EXISTS idx_sync_runs_started ON public.sync_runs(started_at DESC);

-- Alert Logs
CREATE TABLE IF NOT EXISTS public.alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  channels_sent JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_logs_severity ON public.alert_logs(severity);
CREATE INDEX IF NOT EXISTS idx_alert_logs_created ON public.alert_logs(created_at DESC);

-- Pending Emails (queue for email sending)
CREATE TABLE IF NOT EXISTS public.pending_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipients TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  email_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_emails_status ON public.pending_emails(status);
CREATE INDEX IF NOT EXISTS idx_pending_emails_type ON public.pending_emails(email_type);
CREATE INDEX IF NOT EXISTS idx_pending_emails_created ON public.pending_emails(created_at DESC);

-- Update timestamp triggers
CREATE TRIGGER update_classroom_courses_updated_at
  BEFORE UPDATE ON public.classroom_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classroom_students_updated_at
  BEFORE UPDATE ON public.classroom_students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classroom_teachers_updated_at
  BEFORE UPDATE ON public.classroom_teachers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classroom_coursework_updated_at
  BEFORE UPDATE ON public.classroom_coursework
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classroom_submissions_updated_at
  BEFORE UPDATE ON public.classroom_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classroom_guardians_updated_at
  BEFORE UPDATE ON public.classroom_guardians
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.classroom_courses IS 'Synced Google Classroom courses';
COMMENT ON TABLE public.classroom_students IS 'Synced student rosters';
COMMENT ON TABLE public.classroom_teachers IS 'Synced teacher rosters';
COMMENT ON TABLE public.classroom_coursework IS 'Synced assignments/coursework';
COMMENT ON TABLE public.classroom_submissions IS 'Synced student submissions';
COMMENT ON TABLE public.classroom_guardians IS 'Synced guardian invitations';
COMMENT ON TABLE public.sync_runs IS 'Tracks sync execution history';
COMMENT ON TABLE public.alert_logs IS 'Logs all system alerts';
COMMENT ON TABLE public.pending_emails IS 'Queue for outgoing emails';

-- RLS Policies (restrict access)
ALTER TABLE public.classroom_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_coursework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_emails ENABLE ROW LEVEL SECURITY;

-- Service role can access everything
CREATE POLICY "Service role full access - courses" ON public.classroom_courses
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - students" ON public.classroom_students
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - teachers" ON public.classroom_teachers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - coursework" ON public.classroom_coursework
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - submissions" ON public.classroom_submissions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - guardians" ON public.classroom_guardians
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - sync_runs" ON public.sync_runs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - alert_logs" ON public.alert_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - pending_emails" ON public.pending_emails
  FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can read their own data
-- TODO: Add more granular policies based on your auth system
