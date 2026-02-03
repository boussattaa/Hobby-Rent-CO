-- Seed Trailer Data
-- This script inserts 5 real trailer listings into your 'items' table.
-- It assigns them to the first user found in your authentication table (likely YOU).

WITH first_user AS (
    SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
)
INSERT INTO public.items (name, price, image_url, location, lat, lng, category, subcategory, description, owner_id)
SELECT
    '20'' Car Hauler', 85, '/images/car-hauler.png', 'Salt Lake City, UT', 40.7608, -111.8910, 'trailers', 'Car Haulers', 'Heavy duty tandem axle car hauler with ramps. Perfect for moving vehicles.', id
FROM first_user
UNION ALL
SELECT '14'' Dump Trailer', 120, '/images/dump-trailer.png', 'Orem, UT', 40.2969, -111.6946, 'trailers', 'Dump', 'Hydraulic dump trailer with high sides. Ideal for construction debris or landscaping materials.', id FROM first_user
UNION ALL
SELECT '15 Yard Dumpster', 250, '/images/dumpster-bin.png', 'Provo, UT', 40.2338, -111.6585, 'trailers', 'Enclosed', 'Roll-off dumpster bin for large cleanups and renovations.', id FROM first_user
UNION ALL
SELECT 'Enclosed Cargo 6x12', 60, '/images/enclosed-trailer.png', 'Lehi, UT', 40.3916, -111.8491, 'trailers', 'Utility', 'Weather-proof enclosed cargo trailer. varying sizes available.', id FROM first_user
UNION ALL
SELECT 'Heavy Duty Flatbed', 100, '/images/flatbed-trailer.png', 'Draper, UT', 40.5247, -111.8638, 'trailers', 'Livestock', 'Gooseneck flatbed trailer for hauling heavy machinery or large loads.', id FROM first_user;
