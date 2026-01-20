-- Create a public view for profiles that excludes sensitive email data
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    created_at,
    updated_at,
    country_id,
    username,
    privacy_setting,
    avatar_url
  FROM public.profiles;

-- Drop existing SELECT policies that expose email
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view friends profiles" ON public.profiles;

-- Create new policies that only allow email access to profile owner
-- Owner can see their own full profile (including email)
-- This policy already exists: "Users can view their own profile"

-- For public profiles: allow SELECT but through the view only
-- We need to deny direct SELECT on the base table for non-owners
-- First, let's create a security definer function to check if user is viewing their own profile
CREATE OR REPLACE FUNCTION public.is_own_profile(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = _profile_id
$$;

-- Update the profiles table to only allow owners to SELECT (which includes email)
-- Non-owners must use the profiles_public view

-- Recreate public profile access without email - they should use the view
CREATE POLICY "Public profiles viewable via view only" 
ON public.profiles 
FOR SELECT 
USING (
  -- Owner can always see their own profile
  id = auth.uid()
);

-- Note: The existing "Users can view their own profile" policy is redundant now
-- but we keep it for clarity. The new policy covers owner access.

-- Friends should also use the view to avoid email exposure
-- We remove the direct friends policy and they'll use profiles_public view

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;