import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Friendship, PublicProfile } from '@/types';

export interface FriendshipWithProfile extends Friendship {
  requester?: PublicProfile;
  addressee?: PublicProfile;
}

export function useFriendships() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friendships', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:profiles_public!friendships_requester_id_fkey(id, username, privacy_setting, avatar_url),
          addressee:profiles_public!friendships_addressee_id_fkey(id, username, privacy_setting, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;
      return data as FriendshipWithProfile[];
    },
    enabled: !!user,
  });
}

export function usePendingFriendRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friendships', 'pending', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:profiles_public!friendships_requester_id_fkey(id, username, privacy_setting, avatar_url)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      return data as FriendshipWithProfile[];
    },
    enabled: !!user,
  });
}

export function useAcceptedFriends() {
  const { user } = useAuth();
  const { data: friendships } = useFriendships();

  if (!user || !friendships) return [];

  return friendships
    .filter(f => f.status === 'accepted')
    .map(f => {
      const friend = f.requester_id === user.id ? f.addressee : f.requester;
      return friend;
    })
    .filter(Boolean) as PublicProfile[];
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (addresseeId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendshipId, accept }: { friendshipId: string; accept: boolean }) => {
      if (accept) {
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', friendshipId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('friendships')
          .delete()
          .eq('id', friendshipId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });
}

export function useSearchUsers(searchTerm: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['users', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles_public')
        .select('*')
        .neq('id', user?.id || '')
        .ilike('username', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data as PublicProfile[];
    },
    enabled: searchTerm.length >= 2,
  });
}
