import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_tip_id: string | null;
  reported_message_id: string | null;
  reason: ReportReason;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

// Hook to create a report
export function useCreateReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      reported_user_id?: string;
      reported_tip_id?: string;
      reported_message_id?: string;
      reason: ReportReason;
      description?: string;
    }) => {
      if (!user) throw new Error('Must be logged in to report');

      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_user_id: data.reported_user_id || null,
        reported_tip_id: data.reported_tip_id || null,
        reported_message_id: data.reported_message_id || null,
        reason: data.reason,
        description: data.description || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

// Hook to block a user
export function useBlockUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (blockedUserId: string) => {
      if (!user) throw new Error('Must be logged in to block');
      if (blockedUserId === user.id) throw new Error('Cannot block yourself');

      const { error } = await supabase.from('blocked_users').insert({
        blocker_id: user.id,
        blocked_id: blockedUserId,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('User is already blocked');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

// Hook to unblock a user
export function useUnblockUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (blockedUserId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

// Hook to get blocked users
export function useBlockedUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['blocked-users', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', user.id);

      if (error) throw error;
      return data as BlockedUser[];
    },
    enabled: !!user,
  });
}

// Hook to check if a user is blocked
export function useIsUserBlocked(userId: string | undefined) {
  const { data: blockedUsers } = useBlockedUsers();

  if (!userId || !blockedUsers) return false;
  return blockedUsers.some((b) => b.blocked_id === userId);
}
