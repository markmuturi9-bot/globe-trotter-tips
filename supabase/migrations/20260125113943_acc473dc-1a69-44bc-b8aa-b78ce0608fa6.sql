-- Create support_requests table for in-app support
CREATE TABLE public.support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Users can create support requests
CREATE POLICY "Anyone can create support requests"
ON public.support_requests
FOR INSERT
WITH CHECK (true);

-- Users can view their own requests
CREATE POLICY "Users can view their own support requests"
ON public.support_requests
FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all requests
CREATE POLICY "Admins can view all support requests"
ON public.support_requests
FOR SELECT
USING (public.is_admin_or_moderator(auth.uid()));

-- Admins can update requests
CREATE POLICY "Admins can update support requests"
ON public.support_requests
FOR UPDATE
USING (public.is_admin_or_moderator(auth.uid()));