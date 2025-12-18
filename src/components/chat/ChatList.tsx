import { MessageCircle } from 'lucide-react';
import { useChats, ChatWithParticipant } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
  onSelectChat: (chat: ChatWithParticipant) => void;
  selectedChatId?: string;
}

export function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const { data: chats, isLoading } = useChats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <MessageCircle className="w-6 h-6 text-primary animate-pulse" />
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Start chatting with friends!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
            selectedChatId === chat.id 
              ? 'bg-primary/10 text-primary' 
              : 'hover:bg-secondary'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
            {chat.participant?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{chat.participant?.username}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
