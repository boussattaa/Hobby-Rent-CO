-- RLS Policy: Allow admins to update any user's profile
-- This is required for the Verify/Reject actions in the Admin Dashboard to persist.

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
