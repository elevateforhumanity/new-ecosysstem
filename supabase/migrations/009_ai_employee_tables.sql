-- AI Employee System Tables
-- Supports lead management, email queue, and task scheduling

-- Leads table for CRM
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT, -- website, referral, email, etc.
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, qualified, enrolled, lost
  notes TEXT,
  last_contact TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email queue for outbound emails
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  template_name TEXT,
  template_variables JSONB,
  subject TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scheduled tasks for follow-ups
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  action_type TEXT NOT NULL, -- send_email, create_checkout, update_status, etc.
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, cancelled
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI employee task log
CREATE TABLE IF NOT EXISTS ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_text TEXT NOT NULL,
  plan JSONB NOT NULL, -- The planned actions
  results JSONB, -- Execution results
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, failed
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_scheduled_for ON scheduled_tasks(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_created_at ON ai_tasks(created_at DESC);

-- RLS policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access to leads" ON leads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to email_queue" ON email_queue FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to scheduled_tasks" ON scheduled_tasks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to ai_tasks" ON ai_tasks FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can view their own leads
CREATE POLICY "Users can view leads" ON leads FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can view AI tasks
CREATE POLICY "Users can view ai_tasks" ON ai_tasks FOR SELECT USING (auth.role() = 'authenticated');
