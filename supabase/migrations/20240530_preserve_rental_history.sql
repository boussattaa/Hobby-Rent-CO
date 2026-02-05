-- Preserve rental history when items are deleted
-- 1. Add item_name column to store the name permanently
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS item_name TEXT;

-- 2. Populate item_name for existing rentals
UPDATE rentals 
SET item_name = items.name 
FROM items 
WHERE rentals.item_id = items.id 
AND rentals.item_name IS NULL;

-- 3. Make item_id nullable (required for SET NULL behavior)
ALTER TABLE rentals ALTER COLUMN item_id DROP NOT NULL;

-- 4. Drop the old CASCADE constraint and recreate with SET NULL
ALTER TABLE rentals DROP CONSTRAINT IF EXISTS rentals_item_id_fkey;
ALTER TABLE rentals 
ADD CONSTRAINT rentals_item_id_fkey 
FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN rentals.item_name IS 'Preserved item name for historical records even after item deletion';
