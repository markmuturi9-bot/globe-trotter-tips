import { useState } from 'react';
import { X, Search, UserPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchUsers, useSendFriendRequest, useFriendships } from '@/hooks/useFriendships';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AddFriendDialogProps {
  onClose: () => void;
}

export function AddFriendDialog({ onClose }: AddFriendDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: searchResults, isLoading } = useSearchUsers(searchTerm);
  const { data: friendships } = useFriendships();
  const sendRequest = useSendFriendRequest();
  const { user } = useAuth();
  const { toast } = useToast();

  const getFriendshipStatus = (userId: string) => {
    if (!friendships) return null;
    
    const friendship = friendships.find(
      f => f.requester_id === userId || f.addressee_id === userId
    );

    if (!friendship) return null;
    if (friendship.status === 'accepted') return 'friends';
    if (friendship.requester_id === user?.id) return 'pending_sent';
    return 'pending_received';
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequest.mutateAsync(userId);
      toast({
        title: 'Friend request sent!',
        description: 'Waiting for them to accept.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send request.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-card rounded-xl shadow-strong overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl font-semibold">Add Friend</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isLoading && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Searching...
              </p>
            )}

            {searchTerm.length < 2 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Type at least 2 characters to search
              </p>
            )}

            {searchResults?.length === 0 && searchTerm.length >= 2 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found
              </p>
            )}

            {searchResults?.map((profile) => {
              const status = getFriendshipStatus(profile.id);
              
              return (
                <div 
                  key={profile.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{profile.username}</p>
                  </div>
                  
                  {status === 'friends' && (
                    <span className="text-xs text-primary flex items-center gap-1">
                      <Check className="w-3 h-3" /> Friends
                    </span>
                  )}
                  
                  {status === 'pending_sent' && (
                    <span className="text-xs text-muted-foreground">
                      Request sent
                    </span>
                  )}
                  
                  {status === 'pending_received' && (
                    <span className="text-xs text-muted-foreground">
                      Pending
                    </span>
                  )}
                  
                  {!status && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendRequest(profile.id)}
                      disabled={sendRequest.isPending}
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
