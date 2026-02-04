-- Add hourly pricing support to items
alter table items
add column if not exists price_type text default 'daily' check (price_type in ('daily', 'hourly')),
add column if not exists hourly_rate numeric,
add column if not exists min_duration integer default 4; -- Minimum hours

-- Add precise timestamps to rentals
alter table rentals
add column if not exists start_time timestamp with time zone,
add column if not exists end_time timestamp with time zone;

-- Backfill timestamps for existing rentals (assuming noon pick up/drop off or just using date boundary)
-- For existing daily rentals, start_time = start_date at 00:00, end_time = end_date at 23:59:59?
-- Or just leave null and handle in code. 
-- Let's populate defaults to avoid logic errors.
update rentals 
set start_time = start_date::timestamp with time zone, 
    end_time = (end_date + interval '1 day' - interval '1 second')::timestamp with time zone
where start_time is null;
