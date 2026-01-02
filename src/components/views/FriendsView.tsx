import { useState } from 'react';
import { Search, UserPlus, Users, Clock, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { 
  useFriendships, 
  usePendingFriendRequests, 
  useSearchUsers, 
  useSendFriendRequest,
  useRespondToFriendRequest 
} from '@/hooks/useFriendships';
import { useTips } from '@/hooks/useTips';
import { TipCard } from '@/components/tips/TipCard';
import { toast } from 'sonner';
import type { Profile } from '@/types';

export function FriendsView() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: friendships, isLoading: friendshipsLoading } = useFriendships();
  const { data: pendingRequests } = usePendingFriendRequests();
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(searchTerm);
  const { data: allTips } = useTips();
  const sendRequest = useSendFriendRequest();
  const respondToRequest = useRespondToFriendRequest();

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold mb-2">Log in to see friends</h2>
            <p className="text-muted-foreground">You need to be logged in to search for friends and see their activity.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get accepted friends
  const acceptedFriends = friendships
    ?.filter(f => f.status === 'accepted')
    .map(f => {
      const friend = f.requester_id === user.id ? f.addressee : f.requester;
      return friend;
    })
    .filter(Boolean) as Profile[] || [];

  // Get friend IDs
  const friendIds = acceptedFriends.map(f => f.id);

  // Get recent tips from friends
  const friendsTips = allTips
    ?.filter(tip => friendIds.includes(tip.user_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20) || [];

  // Check if user already has a relationship with someone
  const hasRelationship = (userId: string) => {
    return friendships?.some(
      f => (f.requester_id === userId || f.addressee_id === userId)
    );
  };

  const handleSendRequest = async (addresseeId: string) => {
    try {
      await sendRequest.mutateAsync(addresseeId);
      toast.success('Friend request sent!');
    } catch (error: any) {
      toast.error(error.message || 'Could not send request');
    }
  };

  const handleRespondToRequest = async (friendshipId: string, accept: boolean) => {
    try {
      await respondToRequest.mutateAsync({ friendshipId, accept });
      toast.success(accept ? 'Friend request accepted!' : 'Friend request declined');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex-1 container max-w-4xl mx-auto p-4 space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {searchTerm.length >= 2 && (
            <div className="mt-4 space-y-2">
              {searchLoading ? (
                <p className="text-sm text-muted-foreground">Searching...</p>
              ) : searchResults && searchResults.length > 0 ? (
                searchResults.map((profile) => (
                  <div 
                    key={profile.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {profile.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.username}</p>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>
                    {hasRelationship(profile.id) ? (
                      <Badge variant="secondary">Already friend/requested</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleSendRequest(profile.id)}
                        disabled={sendRequest.isPending}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No users found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Friends and Activity */}
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Friends ({acceptedFriends.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Requests
            {pendingRequests && pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {friendshipsLoading ? (
                <p className="text-muted-foreground text-center">Loading...</p>
              ) : acceptedFriends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You don't have any friends yet.</p>
                  <p className="text-sm text-muted-foreground">Search for users above to add friends!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {acceptedFriends.map((friend) => (
                    <div 
                      key={friend.id} 
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <Avatar>
                        <AvatarFallback>
                          {friend.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{friend.username}</p>
                        <p className="text-sm text-muted-foreground">{friend.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {!pendingRequests || pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending friend requests.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {request.requester?.username?.substring(0, 2).toUpperCase() || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.requester?.username}</p>
                          <p className="text-sm text-muted-foreground">{request.requester?.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleRespondToRequest(request.id, true)}
                          disabled={respondToRequest.isPending}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRespondToRequest(request.id, false)}
                          disabled={respondToRequest.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Friends' latest tips</CardTitle>
            </CardHeader>
            <CardContent>
              {friendsTips.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tips from your friends yet.</p>
                  {acceptedFriends.length === 0 && (
                    <p className="text-sm text-muted-foreground">Add friends to see their activity!</p>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {friendsTips.map((tip) => (
                      <TipCard key={tip.id} tip={tip} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}