-- Migration to add geocoded columns for private addresses
-- and ensure public coordinates are a jittered version of private ones.

-- 1. Add lat/lng to private details
ALTER TABLE item_private_details 
ADD COLUMN IF NOT EXISTS storage_lat double precision,
ADD COLUMN IF NOT EXISTS storage_lng double precision;

-- 2. Create a function to apply jitter
-- This function takes exact coords and returns a point 3-5 miles away
CREATE OR REPLACE FUNCTION apply_privacy_jitter(lat double precision, lng double precision)
RETURNS TABLE(public_lat double precision, public_lng double precision) AS $$
DECLARE
    -- 1 degree lat is ~69 miles
    -- 3 miles = ~0.043 deg
    -- 5 miles = ~0.072 deg
    -- Random offset between 0.04 and 0.07 (positive or negative)
    lat_offset double precision;
    lng_offset double precision;
BEGIN
    lat_offset := (random() * (0.07 - 0.04) + 0.04) * (CASE WHEN random() > 0.5 THEN 1 ELSE -1 END);
    lng_offset := (random() * (0.07 - 0.04) + 0.04) * (CASE WHEN random() > 0.5 THEN 1 ELSE -1 END);
    
    RETURN QUERY SELECT (lat + lat_offset), (lng + lng_offset);
END;
$$ LANGUAGE plpgsql;
