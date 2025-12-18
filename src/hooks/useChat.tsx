import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Chat, Message, Profile } from '@/types';

export interface ChatWithParticipant extends Chat {
  participant?: Profile;
  lastMessage?: Message;
}

export interface MessageWithSender extends Message {
  sender?: Profile;
}

export function useChats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chats', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          participant_one_profile:participant_one(id, username, email),
          participant_two_profile:participant_two(id, username, email)
        `)
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to get the other participant
      return data.map((chat: any) => ({
        ...chat,
        participant: chat.participant_one === user.id 
          ? chat.participant_two_profile 
          : chat.participant_one_profile,
      })) as ChatWithParticipant[];
    },
    enabled: !!user,
  });
}

export function useMessages(chatId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, username, email)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as MessageWithSender[];
    },
    enabled: !!chatId,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);

  return query;
}

export function useCreateOrGetChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participantId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .or(
          `and(participant_one.eq.${user.id},participant_two.eq.${participantId}),and(participant_one.eq.${participantId},participant_two.eq.${user.id})`
        )
        .maybeSingle();

      if (existingChat) return existingChat;

      // Create new chat
      const { data, error } = await supabase
        .from('chats')
        .insert({
          participant_one: user.id,
          participant_two: participantId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      chatId, 
      content, 
      tipReference 
    }: { 
      chatId: string; 
      content: string; 
      tipReference?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content,
          tip_reference: tipReference || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}
