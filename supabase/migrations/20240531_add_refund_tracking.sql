-- Add refund tracking columns to rentals table
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT false;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS refund_amount NUMERIC;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS refund_id TEXT;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add comments for documentation
COMMENT ON COLUMN rentals.refunded IS 'Whether the rental has been refunded';
COMMENT ON COLUMN rentals.refund_amount IS 'Amount refunded in dollars';
COMMENT ON COLUMN rentals.refund_id IS 'Stripe refund ID';
COMMENT ON COLUMN rentals.stripe_payment_intent_id IS 'Stripe payment intent ID for refunds';
