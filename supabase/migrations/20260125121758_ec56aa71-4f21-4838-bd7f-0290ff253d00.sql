-- Security fixes migration

-- 1. Add DELETE policies for reports table
-- Users can delete their own pending reports (before moderator review)
CREATE POLICY "Users can delete own pending reports"
ON public.reports
FOR DELETE
USING (
  reporter_id = auth.uid() 
  AND status = 'pending'
);

-- Admins can delete any report
CREATE POLICY "Admins can delete reports"
ON public.reports
FOR DELETE
USING (is_admin_or_moderator(auth.uid()));

-- 2. Secure the get_email_by_username function by requiring authentication
-- This prevents email enumeration attacks from unauthenticated users
CREATE OR REPLACE FUNCTION public.get_email_by_username(_username text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Require authentication to prevent email enumeration attacks
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN (SELECT email FROM public.profiles WHERE username = _username LIMIT 1);
END;
$$;

-- 3. Make tip-images bucket private (require signed URLs)
UPDATE storage.buckets SET public = false WHERE id = 'tip-images';

-- 4. Update storage policies for tip-images to use signed URLs
-- Drop existing public read policy
DROP POLICY IF EXISTS "Anyone can view tip images" ON storage.objects;

-- Create policy for authenticated access to tip images
CREATE POLICY "Authenticated users can view tip images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'tip-images'
  AND auth.uid() IS NOT NULL
);