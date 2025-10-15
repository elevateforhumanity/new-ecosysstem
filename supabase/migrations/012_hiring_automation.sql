-- Hiring Automation Tables
-- Candidates and Interviews for EFH Autopilot

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Personal info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  
  -- Application details
  position TEXT NOT NULL,
  source TEXT, -- LinkedIn, Indeed, Referral, etc.
  resume_url TEXT,
  cover_letter TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
  stage TEXT DEFAULT 'application' CHECK (stage IN ('application', 'phone_screen', 'technical', 'final', 'offer', 'closed')),
  
  -- Scoring
  technical_score INTEGER CHECK (technical_score >= 0 AND technical_score <= 100),
  culture_fit_score INTEGER CHECK (culture_fit_score >= 0 AND culture_fit_score <= 100),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  
  -- Notes and metadata
  notes TEXT,
  tags TEXT[], -- Skills, certifications, etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Assignment tracking
  assigned_to UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Relationship
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Interview details
  interview_type TEXT NOT NULL CHECK (interview_type IN ('phone_screen', 'technical', 'behavioral', 'panel', 'final')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT, -- Zoom link, office location, etc.
  
  -- Participants
  interviewer_id UUID REFERENCES auth.users(id),
  interviewer_name TEXT,
  panel_members TEXT[], -- For panel interviews
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  
  -- Feedback
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  recommendation TEXT CHECK (recommendation IN ('strong_yes', 'yes', 'maybe', 'no', 'strong_no')),
  
  -- Notes
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Calendar integration
  calendar_event_id TEXT,
  meeting_link TEXT
);

-- Job postings table (for tracking what we're hiring for)
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Job details
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
  
  -- Description
  description TEXT NOT NULL,
  requirements TEXT[],
  responsibilities TEXT[],
  benefits TEXT[],
  
  -- Compensation
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'filled')),
  posted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Tracking
  applications_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- External links
  linkedin_url TEXT,
  indeed_url TEXT,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Hiring pipeline stages (for tracking candidate progress)
CREATE TABLE IF NOT EXISTS hiring_pipeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_position ON candidates(position);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pipeline_events_candidate_id ON hiring_pipeline_events(candidate_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_events_created_at ON hiring_pipeline_events(created_at DESC);

-- RLS Policies (Row Level Security)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hiring_pipeline_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all candidates
CREATE POLICY "Authenticated users can view candidates"
  ON candidates FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert candidates
CREATE POLICY "Authenticated users can insert candidates"
  ON candidates FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update candidates
CREATE POLICY "Authenticated users can update candidates"
  ON candidates FOR UPDATE
  TO authenticated
  USING (true);

-- Similar policies for interviews
CREATE POLICY "Authenticated users can view interviews"
  ON interviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert interviews"
  ON interviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update interviews"
  ON interviews FOR UPDATE
  TO authenticated
  USING (true);

-- Job postings policies
CREATE POLICY "Anyone can view active job postings"
  ON job_postings FOR SELECT
  TO anon, authenticated
  USING (status = 'active' OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage job postings"
  ON job_postings FOR ALL
  TO authenticated
  USING (true);

-- Pipeline events policies
CREATE POLICY "Authenticated users can view pipeline events"
  ON hiring_pipeline_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert pipeline events"
  ON hiring_pipeline_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to track pipeline changes
CREATE OR REPLACE FUNCTION track_candidate_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND (OLD.stage != NEW.stage OR OLD.status != NEW.status)) THEN
    INSERT INTO hiring_pipeline_events (
      candidate_id,
      from_stage,
      to_stage,
      from_status,
      to_status,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.stage,
      NEW.stage,
      OLD.status,
      NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically track stage changes
CREATE TRIGGER track_candidate_pipeline
  AFTER UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION track_candidate_stage_change();

-- View for candidate pipeline summary
CREATE OR REPLACE VIEW candidate_pipeline_summary AS
SELECT 
  stage,
  status,
  COUNT(*) as count,
  AVG(overall_score) as avg_score
FROM candidates
WHERE status NOT IN ('rejected', 'withdrawn')
GROUP BY stage, status
ORDER BY 
  CASE stage
    WHEN 'application' THEN 1
    WHEN 'phone_screen' THEN 2
    WHEN 'technical' THEN 3
    WHEN 'final' THEN 4
    WHEN 'offer' THEN 5
    ELSE 6
  END;

-- View for upcoming interviews
CREATE OR REPLACE VIEW upcoming_interviews AS
SELECT 
  i.*,
  c.full_name as candidate_name,
  c.email as candidate_email,
  c.position
FROM interviews i
JOIN candidates c ON i.candidate_id = c.id
WHERE i.status = 'scheduled'
  AND i.scheduled_at > NOW()
ORDER BY i.scheduled_at ASC;

COMMENT ON TABLE candidates IS 'Stores candidate information for hiring pipeline';
COMMENT ON TABLE interviews IS 'Tracks interview schedules and feedback';
COMMENT ON TABLE job_postings IS 'Active and historical job postings';
COMMENT ON TABLE hiring_pipeline_events IS 'Audit log of candidate stage changes';
