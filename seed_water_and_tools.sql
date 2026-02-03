-- Seed Water and Tools Data
-- This script inserts real listings for the 'water' and 'housing' (tools) categories.

WITH first_user AS (
    SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
)
INSERT INTO public.items (name, price, image_url, location, lat, lng, category, subcategory, description, owner_id)
SELECT 'Sea-Doo GTX', 250, '/images/seadoo-gtx.png', 'Miami, FL', 25.7617, -80.1918, 'water', 'Personal Watercraft (PWC)', 'Luxury personal watercraft. Stable, fast, and comfortable for 3 riders.', id FROM first_user
UNION ALL
SELECT 'MasterCraft NXT', 800, '/images/mastercraft-nxt.png', 'Lake Powell, AZ', 36.9360, -111.4838, 'water', 'Boats', 'Premium wakeboard boat. Create the perfect wave for surfing or boarding.', id FROM first_user
UNION ALL
SELECT 'Inflatable Paddleboard', 40, '/images/paddleboard.png', 'Austin, TX', 30.2672, -97.7431, 'water', 'Non-Powered', 'Portable fun. easy to carry and inflate. Includes paddle and pump.', id FROM first_user
UNION ALL
SELECT 'DeWalt 20V Drill Set', 25, '/images/dewalt-drill.png', 'Seattle, WA', 47.6062, -122.3321, 'housing', 'Power Tools', 'Complete drill and impact driver set. Batteries included.', id FROM first_user
UNION ALL
SELECT 'Industrial Carpet Cleaner', 60, '/images/carpet-cleaner.png', 'Portland, OR', 45.5152, -122.6784, 'housing', 'Cleaning/Finish', 'Deep clean your carpets like a pro. Removes tough stains and odors.', id FROM first_user;
