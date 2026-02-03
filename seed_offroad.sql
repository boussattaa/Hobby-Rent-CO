-- Seed Offroad Data
-- This script inserts 4 real offroad listings into your 'items' table.
-- It assigns them to the first user found in your authentication table (likely YOU).

WITH first_user AS (
    SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
)
INSERT INTO public.items (name, price, image_url, location, lat, lng, category, subcategory, description, owner_id)
SELECT
    'KTM 450 SX-F', 150, '/images/ktm-450.png', 'Moab, UT', 38.5733, -109.5498, 'offroad', 'Dirt Bikes', 'Championship winning motocross bike. Perfect for the dunes or the track. Well maintained and ready to rip.', id
FROM first_user
UNION ALL
SELECT 'Polaris RZR XP', 350, '/images/polaris-rzr.png', 'Sand Hollow, UT', 37.1232, -113.3828, 'offroad', '2-Seaters', 'The ultimate side-by-side experience. 4 seats, turbo charged, plenty of suspension travel.', id FROM first_user
UNION ALL
SELECT 'Honda CRF250R', 120, '/images/honda-crf250r.png', 'St. George, UT', 37.0965, -113.5684, 'offroad', 'Dirt Bikes', 'Reliable and fun. Great for intermediate riders looking to explore the trails.', id FROM first_user
UNION ALL
SELECT 'Can-Am Maverick', 400, '/images/can-am-maverick.png', 'Dumont Dunes, CA', 35.6836, -116.2201, 'offroad', '2-Seaters', 'High performance beast. Conquer any dune with this machine.', id FROM first_user;
