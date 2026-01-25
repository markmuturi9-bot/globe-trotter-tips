-- Drop the existing view and recreate it WITHOUT security_invoker
-- This allows the view to bypass RLS when accessing profiles
DROP VIEW IF EXISTS public.profiles_public;

-- Recreate the view without security_invoker (uses security definer by default)
-- This ensures all users can see public profile data
CREATE VIEW public.profiles_public AS
SELECT 
  id,
  username,
  avatar_url,
  privacy_setting,
  country_id,
  created_at,
  updated_at
FROM public.profiles;

-- Grant select access to authenticated and anon roles
GRANT SELECT ON public.profiles_public TO anon, authenticated;