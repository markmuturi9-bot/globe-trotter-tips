-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can lookup email by username for login" ON public.profiles;

-- Create a more restrictive policy - only allow reading email column via RPC
-- Users can still only see their own full profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

-- Create a security definer function for username-to-email lookup
CREATE OR REPLACE FUNCTION public.get_email_by_username(_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE username = _username LIMIT 1
$$;