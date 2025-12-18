import { useState } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { NewChatDialog } from './NewChatDialog';
import { ChatWithParticipant } from '@/hooks/useChat';

export function ChatView() {
  const [selectedChat, setSelectedChat] = useState<ChatWithParticipant | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* Sidebar - Chat list */}
      <div className={`w-full md:w-80 border-r border-border bg-card flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
          </h2>
          <Button size="sm" variant="outline" onClick={() => setShowNewChat(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <ChatList 
            onSelectChat={setSelectedChat}
            selectedChatId={selectedChat?.id}
          />
        </div>
      </div>

      {/* Main - Chat window */}
      <div className={`flex-1 flex flex-col ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
        {selectedChat ? (
          <ChatWindow 
            chat={selectedChat}
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showNewChat && (
        <NewChatDialog 
          onClose={() => setShowNewChat(false)}
          onChatCreated={(chat) => {
            setSelectedChat(chat);
            setShowNewChat(false);
          }}
        />
      )}
    </div>
  );
}
