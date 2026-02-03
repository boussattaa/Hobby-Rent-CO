
-- Backfill profiles for users who signed up before the profiles table existed
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
