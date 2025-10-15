-- Payout Batch System
-- Automated nightly payouts with admin dashboard

-- View: Ready commissions grouped by affiliate
CREATE OR REPLACE VIEW v_commissions_ready AS
SELECT
    c.affiliate_id,
    SUM(c.amount)::NUMERIC AS total_amount,
    COUNT(c.id) AS commission_count
FROM commissions c
WHERE c.status = 'approved'
GROUP BY c.affiliate_id;

-- Payout batches table
CREATE TABLE IF NOT EXISTS public.payout_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID,
    total_amount NUMERIC NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    commission_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'processing', 'paid', 'partial', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add batch reference to commissions
ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS payout_batch_id UUID REFERENCES public.payout_batches(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payout_batches_status ON public.payout_batches(status);
CREATE INDEX IF NOT EXISTS idx_payout_batches_created_at ON public.payout_batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_payout_batch_id ON public.commissions(payout_batch_id);

-- Row Level Security
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;

-- Admins can view all batches
CREATE POLICY "Admins can view all payout batches"
    ON public.payout_batches
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Service role can manage batches
CREATE POLICY "Service role can manage payout batches"
    ON public.payout_batches
    FOR ALL
    WITH CHECK (true);

-- Comments
COMMENT ON VIEW v_commissions_ready IS 'Aggregates approved commissions ready for payout by affiliate';
COMMENT ON TABLE public.payout_batches IS 'Tracks payout batch runs (manual or automated)';
COMMENT ON COLUMN public.payout_batches.status IS 'Batch status: created, processing, paid, partial, failed';
COMMENT ON COLUMN public.commissions.payout_batch_id IS 'Links commission to payout batch';
