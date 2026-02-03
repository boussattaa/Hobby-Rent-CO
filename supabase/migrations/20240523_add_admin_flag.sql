-- Add is_admin column to profiles table
alter table profiles 
add column if not exists is_admin boolean default false;

-- Policy: Only admins can view all profiles (optional, but good for admin dashboard)
create policy "Admins can view all profiles"
  on profiles
  for select
  using (
    (select is_admin from profiles where id = auth.uid()) = true
  );

-- Helper to make someone an admin (run manually)
-- update profiles set is_admin = true where id = 'USER_ID';
