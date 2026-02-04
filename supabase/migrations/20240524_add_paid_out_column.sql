-- Add paid_out column to rentals table for tracking payout status
ALTER TABLE rentals 
ADD COLUMN IF NOT EXISTS paid_out BOOLEAN DEFAULT false;

-- Create index for efficient querying of unpaid rentals
CREATE INDEX IF NOT EXISTS idx_rentals_paid_out ON rentals(paid_out);
