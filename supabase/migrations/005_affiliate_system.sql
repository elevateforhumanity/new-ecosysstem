-- Affiliate, Referral, Commission, and Payout System
-- Supports Supersonic Fast Cash affiliate program

-- Affiliates table
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('standard', 'gold', 'platinum')),
    w9_file_id UUID,
    commission_rate NUMERIC DEFAULT 10.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    source TEXT NOT NULL CHECK (source IN ('link', 'qr', 'manual', 'import')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rejected')),
    converted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Commissions table
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    basis_amount NUMERIC NOT NULL CHECK (basis_amount >= 0),
    percent NUMERIC NOT NULL CHECK (percent >= 0 AND percent <= 100),
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'batched', 'paid', 'rejected')),
    payout_batch_id UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payouts table
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    method TEXT NOT NULL CHECK (method IN ('manual', 'ach', 'stripe', 'check')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_tier ON public.affiliates(tier);
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON public.referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id ON public.commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_payout_batch_id ON public.commissions(payout_batch_id);

-- Row Level Security
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Affiliates policies
CREATE POLICY "Affiliates can view own record"
    ON public.affiliates
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all affiliates"
    ON public.affiliates
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Admins can insert affiliates"
    ON public.affiliates
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- Referrals policies
CREATE POLICY "Affiliates can view own referrals"
    ON public.referrals
    FOR SELECT
    USING (
        affiliate_id IN (
            SELECT id FROM public.affiliates WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all referrals"
    ON public.referrals
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Affiliates can create referrals"
    ON public.referrals
    FOR INSERT
    WITH CHECK (
        affiliate_id IN (
            SELECT id FROM public.affiliates WHERE user_id = auth.uid()
        )
    );

-- Commissions policies
CREATE POLICY "Affiliates can view own commissions"
    ON public.commissions
    FOR SELECT
    USING (
        affiliate_id IN (
            SELECT id FROM public.affiliates WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all commissions"
    ON public.commissions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- Payouts policies (admin only)
CREATE POLICY "Admins can view all payouts"
    ON public.payouts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Functions
CREATE OR REPLACE FUNCTION calculate_commission_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.amount := (NEW.basis_amount * NEW.percent) / 100;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_commission_amount
    BEFORE INSERT OR UPDATE ON public.commissions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_commission_amount();

-- Comments
COMMENT ON TABLE public.affiliates IS 'Affiliate partners in the Supersonic Fast Cash program';
COMMENT ON TABLE public.referrals IS 'Client referrals from affiliates';
COMMENT ON TABLE public.commissions IS 'Commission records for successful referrals';
COMMENT ON TABLE public.payouts IS 'Payout batches for approved commissions';
