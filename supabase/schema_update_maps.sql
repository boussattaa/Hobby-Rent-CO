-- Maps & Discovery Schema Update

-- 1. Add Geolocation to Items
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- 2. Create index for faster geospatial queries (optional but good practice)
CREATE INDEX IF NOT EXISTS items_geo_idx ON public.items (latitude, longitude);
