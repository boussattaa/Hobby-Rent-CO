-- SQL Migration: Create leads table for GearBuddy chat assistant
-- Run this in your Supabase SQL Editor to save leads to the database.

CREATE TABLE IF NOT EXISTS public.leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    message text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (public lead submission)
DROP POLICY IF EXISTS "Allow public insert to leads" ON public.leads;
CREATE POLICY "Allow public insert to leads"
ON public.leads FOR INSERT
WITH CHECK (true);

-- Policy: Allow authenticated users to view leads (e.g. admins)
DROP POLICY IF EXISTS "Allow authenticated read to leads" ON public.leads;
CREATE POLICY "Allow authenticated read to leads"
ON public.leads FOR SELECT
USING (auth.role() = 'authenticated');

-- Grant permissions to typical roles
GRANT ALL ON public.leads TO postgres, service_role;
GRANT INSERT ON public.leads TO anon, authenticated;
