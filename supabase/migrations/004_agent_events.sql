-- Agent Events Audit Table
-- Logs all AI agent actions for compliance and debugging

CREATE TABLE IF NOT EXISTS public.agent_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    params JSONB,
    message TEXT,
    success BOOLEAN DEFAULT true,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_agent_events_created_at ON public.agent_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_events_action ON public.agent_events(action);
CREATE INDEX IF NOT EXISTS idx_agent_events_user_id ON public.agent_events(user_id);

-- Row Level Security
ALTER TABLE public.agent_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view agent events
CREATE POLICY "Admins can view all agent events"
    ON public.agent_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- Service role can insert (from Edge Function)
CREATE POLICY "Service role can insert agent events"
    ON public.agent_events
    FOR INSERT
    WITH CHECK (true);

COMMENT ON TABLE public.agent_events IS 'Audit log for AI agent actions';
COMMENT ON COLUMN public.agent_events.action IS 'Action type (createProgram, updateTuition, etc.)';
COMMENT ON COLUMN public.agent_events.params IS 'JSON parameters passed to action';
COMMENT ON COLUMN public.agent_events.message IS 'Human-readable result message';
COMMENT ON COLUMN public.agent_events.success IS 'Whether action succeeded';
