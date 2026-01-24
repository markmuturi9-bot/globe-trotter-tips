-- =====================================================
-- UGC MODERATION: Reports and Blocked Users Tables
-- =====================================================

-- Reports table for tips, messages, and profiles
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  reported_tip_id UUID,
  reported_message_id UUID,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'misinformation', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure at least one target is specified
  CONSTRAINT report_has_target CHECK (
    reported_user_id IS NOT NULL OR 
    reported_tip_id IS NOT NULL OR 
    reported_message_id IS NOT NULL
  )
);

-- Blocked users table
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate blocks
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id),
  -- Prevent self-blocking
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for reports
-- =====================================================

-- Users can create reports
CREATE POLICY "Users can create reports"
ON public.reports
FOR INSERT
WITH CHECK (reporter_id = auth.uid());

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
ON public.reports
FOR SELECT
USING (reporter_id = auth.uid());

-- Moderators and admins can view all reports
CREATE POLICY "Moderators can view all reports"
ON public.reports
FOR SELECT
USING (is_admin_or_moderator(auth.uid()));

-- Moderators can update reports (review status)
CREATE POLICY "Moderators can update reports"
ON public.reports
FOR UPDATE
USING (is_admin_or_moderator(auth.uid()));

-- =====================================================
-- RLS Policies for blocked_users
-- =====================================================

-- Users can block others
CREATE POLICY "Users can block others"
ON public.blocked_users
FOR INSERT
WITH CHECK (blocker_id = auth.uid());

-- Users can view their blocks
CREATE POLICY "Users can view their blocks"
ON public.blocked_users
FOR SELECT
USING (blocker_id = auth.uid());

-- Users can unblock
CREATE POLICY "Users can unblock"
ON public.blocked_users
FOR DELETE
USING (blocker_id = auth.uid());

-- =====================================================
-- Indexes for performance
-- =====================================================

CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_reported_tip ON public.reports(reported_tip_id) WHERE reported_tip_id IS NOT NULL;
CREATE INDEX idx_reports_reported_user ON public.reports(reported_user_id) WHERE reported_user_id IS NOT NULL;

CREATE INDEX idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON public.blocked_users(blocked_id);

-- =====================================================
-- Update tips RLS to filter blocked users' tips
-- =====================================================

-- Drop existing policy and recreate to filter blocked users
DROP POLICY IF EXISTS "Anyone can view tips" ON public.tips;

CREATE POLICY "Anyone can view tips except from blocked users"
ON public.tips
FOR SELECT
USING (
  NOT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE blocker_id = auth.uid() AND blocked_id = tips.user_id
  )
  OR auth.uid() IS NULL -- Allow unauthenticated users to see all tips
);