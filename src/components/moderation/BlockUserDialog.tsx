import { Ban, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBlockUser } from '@/hooks/useModeration';
import { useToast } from '@/hooks/use-toast';

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
}

export function BlockUserDialog({ open, onOpenChange, userId, username }: BlockUserDialogProps) {
  const blockUser = useBlockUser();
  const { toast } = useToast();

  const handleBlock = async () => {
    try {
      await blockUser.mutateAsync(userId);
      toast({
        title: 'User blocked',
        description: `You will no longer see content from @${username}.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Failed to block user',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-destructive" />
            Block @{username}?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>When you block someone:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>You won't see their tips or content</li>
              <li>They won't be able to message you</li>
              <li>Any existing conversations will be hidden</li>
            </ul>
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg mt-3">
              <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                You can unblock users from your profile settings at any time.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleBlock}
            disabled={blockUser.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {blockUser.isPending ? 'Blocking...' : 'Block User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
