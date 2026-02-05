-- Core Rental Features Schema Update

-- 1. Update Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS id_verified_status text DEFAULT 'unverified', -- 'unverified', 'pending', 'verified', 'rejected'
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 2. Create Bookings Table
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'paid', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- The renter
  item_id uuid REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  status booking_status DEFAULT 'pending' NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  total_price numeric(10,2) NOT NULL,
  waiver_signed boolean DEFAULT false,
  waiver_url text, -- content or link to signed doc
  owner_id uuid REFERENCES auth.users(id) -- redundant but useful for RLS
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Booking Policies
CREATE POLICY "Users can view their own bookings (as renter)"
ON public.bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Owners can view bookings for their items"
ON public.bookings FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update booking status"
ON public.bookings FOR UPDATE
USING (auth.uid() = owner_id);

-- 3. Update Items Table
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS instant_book boolean DEFAULT false;
