-- Files table for R2 metadata tracking
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL CHECK (purpose IN ('intake', 'w9', 'id', 'return', 'certificate', 'other')),
    storage_key TEXT NOT NULL UNIQUE,
    mime TEXT,
    size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Donations table for Stripe payments
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_files_owner_id ON public.files(owner_id);
CREATE INDEX IF NOT EXISTS idx_files_purpose ON public.files(purpose);
CREATE INDEX IF NOT EXISTS idx_files_storage_key ON public.files(storage_key);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_stripe_session_id ON public.donations(stripe_session_id);

-- Row Level Security
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Files policies
CREATE POLICY "Users can view own files"
    ON public.files
    FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Admins can view all files"
    ON public.files
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Service role can insert files"
    ON public.files
    FOR INSERT
    WITH CHECK (true);

-- Donations policies
CREATE POLICY "Users can view own donations"
    ON public.donations
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all donations"
    ON public.donations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Service role can manage donations"
    ON public.donations
    FOR ALL
    WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.files IS 'Metadata for files stored in Cloudflare R2';
COMMENT ON COLUMN public.files.storage_key IS 'R2 object key for retrieval';
COMMENT ON COLUMN public.files.purpose IS 'File purpose: intake, w9, id, return, certificate, other';
COMMENT ON TABLE public.donations IS 'Donation records from Stripe payments';
