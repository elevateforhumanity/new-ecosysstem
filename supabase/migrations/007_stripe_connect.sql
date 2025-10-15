-- Stripe Connect Integration
-- Enables automated affiliate payouts via Stripe

-- Add Stripe Connect account ID to affiliates
ALTER TABLE public.affiliates 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_onboarded_at TIMESTAMP WITH TIME ZONE;

-- Payout items (links commissions to payout batches)
CREATE TABLE IF NOT EXISTS public.payout_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID NOT NULL REFERENCES public.payouts(id) ON DELETE CASCADE,
    commission_id UUID NOT NULL REFERENCES public.commissions(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(commission_id)
);

-- Transfers (Stripe Connect transfers to affiliates)
CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    stripe_account_id TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'usd',
    stripe_transfer_id TEXT UNIQUE,
    status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'pending', 'paid', 'failed', 'reversed')),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_stripe_account_id ON public.affiliates(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_payout_items_payout_id ON public.payout_items(payout_id);
CREATE INDEX IF NOT EXISTS idx_payout_items_commission_id ON public.payout_items(commission_id);
CREATE INDEX IF NOT EXISTS idx_transfers_affiliate_id ON public.transfers(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_transfers_stripe_transfer_id ON public.transfers(stripe_transfer_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON public.transfers(status);

-- Row Level Security
ALTER TABLE public.payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Payout items policies (admin only)
CREATE POLICY "Admins can view all payout items"
    ON public.payout_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Service role can manage payout items"
    ON public.payout_items
    FOR ALL
    WITH CHECK (true);

-- Transfers policies
CREATE POLICY "Affiliates can view own transfers"
    ON public.transfers
    FOR SELECT
    USING (
        affiliate_id IN (
            SELECT id FROM public.affiliates WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all transfers"
    ON public.transfers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Service role can manage transfers"
    ON public.transfers
    FOR ALL
    WITH CHECK (true);

-- Comments
COMMENT ON COLUMN public.affiliates.stripe_account_id IS 'Stripe Connect account ID for automated payouts';
COMMENT ON TABLE public.payout_items IS 'Links individual commissions to payout batches';
COMMENT ON TABLE public.transfers IS 'Stripe Connect transfers to affiliate accounts';
COMMENT ON COLUMN public.transfers.stripe_transfer_id IS 'Stripe transfer ID (tr_...)';
