-- Add contract_signed field to rentals table
-- This tracks whether the renter has signed the rental agreement/contract

ALTER TABLE rentals 
ADD COLUMN IF NOT EXISTS contract_signed boolean DEFAULT false;

-- Update status check constraint to include awaiting_payment
ALTER TABLE rentals DROP CONSTRAINT IF EXISTS rentals_status_check;
ALTER TABLE rentals ADD CONSTRAINT rentals_status_check 
CHECK (status IN ('pending', 'awaiting_payment', 'approved', 'active', 'completed', 'cancelled'));
