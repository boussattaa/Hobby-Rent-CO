-- Add weekend_price to items table
alter table items 
add column if not exists weekend_price numeric;

-- Optional: Add a check to ensure weekend_price is positive (if provided)
alter table items
add constraint weekend_price_check check (weekend_price >= 0);
