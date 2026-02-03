-- Add Stripe Connect columns to profiles
alter table profiles
add column if not exists stripe_account_id text,
add column if not exists stripe_details_submitted boolean default false;

-- Index for faster lookups if needed (optional)
create index if not exists idx_profiles_stripe_account_id on profiles(stripe_account_id);
