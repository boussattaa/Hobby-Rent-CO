-- Add public SEO fields to items table
ALTER TABLE items
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS make TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS rules TEXT,
ADD COLUMN IF NOT EXISTS features TEXT[];

-- Create private details table
CREATE TABLE IF NOT EXISTS item_private_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  vin TEXT,
  license_plate TEXT,
  maintenance_notes TEXT,
  purchase_date DATE,
  purchase_price NUMERIC,
  insurance_policy TEXT,
  storage_address TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for item_private_details
ALTER TABLE item_private_details ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view their own private details
CREATE POLICY "Owners can view their own private details"
ON item_private_details FOR SELECT
USING (
  auth.uid() IN (
    SELECT owner_id FROM items WHERE id = item_private_details.item_id
  )
);

-- Policy: Owners can insert their own private details
CREATE POLICY "Owners can insert their own private details"
ON item_private_details FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT owner_id FROM items WHERE id = item_private_details.item_id
  )
);

-- Policy: Owners can update their own private details
CREATE POLICY "Owners can update their own private details"
ON item_private_details FOR UPDATE
USING (
  auth.uid() IN (
    SELECT owner_id FROM items WHERE id = item_private_details.item_id
  )
);

-- Policy: Owners can delete their own private details
CREATE POLICY "Owners can delete their own private details"
ON item_private_details FOR DELETE
USING (
  auth.uid() IN (
    SELECT owner_id FROM items WHERE id = item_private_details.item_id
  )
);
