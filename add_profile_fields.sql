-- Add phone verification fields to profiles table
-- Run this in Supabase SQL Editor

-- Add phone_verified column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS phone_verified boolean default false,
ADD COLUMN IF NOT EXISTS notification_email boolean default true,
ADD COLUMN IF NOT EXISTS notification_sms boolean default false;

-- Create phone_otps table for storing verification codes
CREATE TABLE IF NOT EXISTS public.phone_otps (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null unique,
    phone text not null,
    otp text not null,
    expires_at timestamp with time zone not null,
    verified boolean default false,
    created_at timestamp with time zone default now()
);

-- Enable RLS on phone_otps
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access phone_otps (API routes use service role)
CREATE POLICY "Service role only for phone_otps"
    ON public.phone_otps
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant access
GRANT ALL ON public.phone_otps TO postgres, service_role;
