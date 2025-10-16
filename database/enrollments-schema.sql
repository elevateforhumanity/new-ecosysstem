-- Enrollments Table
-- Tracks student enrollments in programs/courses

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  program_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'expired', 'failed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'free', 'failed', 'refunded', 'expired')),
  
  -- Stripe payment info
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  amount DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  
  -- Customer info
  customer_email TEXT,
  customer_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enrolled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Indexes
  CONSTRAINT unique_active_enrollment UNIQUE (user_id, program_id, status)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_program_id ON enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_stripe_session ON enrollments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at DESC);

-- Row Level Security (RLS)
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own enrollments
CREATE POLICY "Users can view own enrollments"
  ON enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own enrollments
CREATE POLICY "Users can create own enrollments"
  ON enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own enrollments
CREATE POLICY "Users can update own enrollments"
  ON enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments"
  ON enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update all enrollments
CREATE POLICY "Admins can update all enrollments"
  ON enrollments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Comments
COMMENT ON TABLE enrollments IS 'Student enrollments in programs and courses';
COMMENT ON COLUMN enrollments.status IS 'Enrollment status: pending, active, completed, cancelled, expired, failed';
COMMENT ON COLUMN enrollments.payment_status IS 'Payment status: pending, paid, free, failed, refunded, expired';
COMMENT ON COLUMN enrollments.progress_percentage IS 'Course completion percentage (0-100)';

-- Payment History Table
-- Tracks all payment transactions

CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'cancelled')),
  payment_method TEXT,
  
  -- Stripe info
  stripe_payment_intent TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_refund_id TEXT,
  
  -- Transaction details
  description TEXT,
  receipt_url TEXT,
  failure_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_enrollment ON payment_history(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created ON payment_history(created_at DESC);

-- RLS
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payment history
CREATE POLICY "Users can view own payment history"
  ON payment_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can view all payment history
CREATE POLICY "Admins can view all payment history"
  ON payment_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE payment_history IS 'Payment transaction history';

-- Function to update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_accessed_at
  NEW.last_accessed_at = NOW();
  
  -- If progress reaches 100%, mark as completed
  IF NEW.progress_percentage >= 100 AND OLD.progress_percentage < 100 THEN
    NEW.status = 'completed';
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update progress
CREATE TRIGGER enrollment_progress_trigger
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  WHEN (NEW.progress_percentage IS DISTINCT FROM OLD.progress_percentage)
  EXECUTE FUNCTION update_enrollment_progress();

-- Function to create payment history on enrollment payment
CREATE OR REPLACE FUNCTION create_payment_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create payment history for paid enrollments
  IF NEW.payment_status = 'paid' AND NEW.amount > 0 THEN
    INSERT INTO payment_history (
      enrollment_id,
      user_id,
      amount,
      currency,
      status,
      stripe_payment_intent,
      description,
      created_at
    ) VALUES (
      NEW.id,
      NEW.user_id,
      NEW.amount,
      NEW.currency,
      'succeeded',
      NEW.stripe_payment_intent,
      'Enrollment payment for ' || NEW.program_name,
      NEW.enrolled_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create payment history
CREATE TRIGGER enrollment_payment_trigger
  AFTER UPDATE ON enrollments
  FOR EACH ROW
  WHEN (NEW.payment_status = 'paid' AND OLD.payment_status != 'paid')
  EXECUTE FUNCTION create_payment_history();
