-- 1. Function to handle new user creation logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, notification_email, notification_sms)
  VALUES (
    new.id,
    new.email,
    -- Try specific fields first, fallback to splitting full_name
    COALESCE(new.raw_user_meta_data->>'given_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 1)),
    COALESCE(new.raw_user_meta_data->>'family_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 2)),
    true,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    -- Only update name if it was empty
    first_name = COALESCE(profiles.first_name, excluded.first_name),
    last_name = COALESCE(profiles.last_name, excluded.last_name);
  RETURN new;
END;
$$;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill existing users (Optional one-time run)
-- This updates existing profiles with data from Google if they are empty
UPDATE public.profiles p
SET
  first_name = COALESCE(p.first_name, u.raw_user_meta_data->>'given_name', split_part(u.raw_user_meta_data->>'full_name', ' ', 1)),
  last_name = COALESCE(p.last_name, u.raw_user_meta_data->>'family_name', split_part(u.raw_user_meta_data->>'full_name', ' ', 2))
FROM auth.users u
WHERE p.id = u.id
AND (p.first_name IS NULL OR p.first_name = '');
