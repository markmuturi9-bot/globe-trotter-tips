-- Allow anonymous users to look up email by username for login
CREATE POLICY "Anyone can lookup email by username for login" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Drop the old restrictive select policies since we now have a broader one
DROP POLICY IF EXISTS "Public profiles viewable via view only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;