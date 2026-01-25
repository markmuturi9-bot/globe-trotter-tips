-- Create a security definer function that allows admins to view all profiles
-- This bypasses RLS while still being protected by the role check

CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE (
  id uuid,
  username text,
  email text,
  created_at timestamptz,
  avatar_url text,
  privacy_setting text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.email,
    p.created_at,
    p.avatar_url,
    p.privacy_setting
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (the function itself checks for admin role)
GRANT EXECUTE ON FUNCTION public.admin_get_all_profiles() TO authenticated;