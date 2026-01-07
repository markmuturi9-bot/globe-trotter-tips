import { X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAcceptedFriends } from '@/hooks/useFriendships';
import { useCreateOrGetChat, ChatWithParticipant } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

interface NewChatDialogProps {
  onClose: () => void;
  onChatCreated: (chat: ChatWithParticipant) => void;
}

export function NewChatDialog({ onClose, onChatCreated }: NewChatDialogProps) {
  const friends = useAcceptedFriends();
  const createChat = useCreateOrGetChat();
  const { toast } = useToast();

  const handleStartChat = async (friendId: string, friendUsername: string) => {
    try {
      const chat = await createChat.mutateAsync(friendId);
      onChatCreated({
        ...chat,
        participant: { id: friendId, username: friendUsername } as any,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start chat.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-card rounded-xl shadow-strong overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl font-semibold">New Conversation</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 max-h-80 overflow-y-auto">
          {friends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No friends yet</p>
              <p className="text-xs mt-1">Add friends to start chatting!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Select a friend to start a conversation
              </p>
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleStartChat(friend.id, friend.username)}
                  disabled={createChat.isPending}
                  className="w-full flex items-center gap-3 p-3 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{friend.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
