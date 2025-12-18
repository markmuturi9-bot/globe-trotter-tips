import { Check, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePendingFriendRequests, useRespondToFriendRequest } from '@/hooks/useFriendships';
import { useToast } from '@/hooks/use-toast';

export function FriendRequestList() {
  const { data: pendingRequests, isLoading } = usePendingFriendRequests();
  const respondToRequest = useRespondToFriendRequest();
  const { toast } = useToast();

  const handleRespond = async (friendshipId: string, accept: boolean) => {
    try {
      await respondToRequest.mutateAsync({ friendshipId, accept });
      toast({
        title: accept ? 'Friend added!' : 'Request declined',
        description: accept ? 'You are now friends.' : 'Friend request has been declined.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to respond to request.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No pending friend requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingRequests.map((request) => (
        <div 
          key={request.id}
          className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
        >
          <div>
            <p className="font-medium">{request.requester?.username}</p>
            <p className="text-xs text-muted-foreground">Wants to be your friend</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRespond(request.id, false)}
              disabled={respondToRequest.isPending}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => handleRespond(request.id, true)}
              disabled={respondToRequest.isPending}
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
