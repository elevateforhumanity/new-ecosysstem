-- Task Queue for Google Classroom Autopilot
-- Compatible with EFH Autopilot v1 task system

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient task processing
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_kind ON public.tasks(kind);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled ON public.tasks(scheduled_for) WHERE status = 'pending';

-- Audit log for task execution
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_task_id ON public.audit_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Update timestamp trigger
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.tasks IS 'Task queue for Google Classroom autopilot operations';
COMMENT ON COLUMN public.tasks.kind IS 'Task type (e.g., gc_create_coursework, gc_invite_student)';
COMMENT ON COLUMN public.tasks.payload IS 'Task-specific data (courseId, email, etc.)';
COMMENT ON COLUMN public.tasks.priority IS 'Higher number = higher priority (1-10)';
COMMENT ON COLUMN public.tasks.status IS 'Current task status';
COMMENT ON COLUMN public.tasks.attempts IS 'Number of execution attempts';
COMMENT ON COLUMN public.tasks.max_attempts IS 'Maximum retry attempts before marking as failed';

-- Google Classroom specific task kinds
COMMENT ON TABLE public.tasks IS 'Supported task kinds:
- gc_create_course: Create a new course
- gc_update_course: Update course details
- gc_invite_student: Invite student to course
- gc_invite_teacher: Invite teacher to course
- gc_create_coursework: Create assignment
- gc_grade_submission: Grade student submission
- gc_create_announcement: Post announcement
- gc_invite_guardian: Invite guardian
- gc_sync_roster: Sync course roster
';
