import { useState } from 'react';
import { X, MapPin, Clock, User, ExternalLink, Pencil, Trash2, Languages, Loader2, Shield, Flag, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from './CategoryBadge';
import { EditTipDialog } from './EditTipDialog';
import { ReportDialog } from '@/components/moderation/ReportDialog';
import { BlockUserDialog } from '@/components/moderation/BlockUserDialog';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useDeleteTip } from '@/hooks/useTips';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tip } from '@/types';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface TipDetailProps {
  tip: Tip;
  onClose: () => void;
}

export function TipDetail({ tip, onClose }: TipDetailProps) {
  const { user } = useAuth();
  const { isModerator, deleteTip: adminDeleteTip } = useAdmin();
  const deleteTip = useDeleteTip();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const [isShowingTranslation, setIsShowingTranslation] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  
  const countryName = tip.countries?.name || 'Unknown';
  const username = tip.profiles?.username || 'Anonymous';
  const isOwner = user?.id === tip.user_id;
  const canDelete = isOwner || isModerator;
  const canEdit = isOwner;
  const canReport = user && !isOwner;

  const handleDelete = async () => {
    try {
      if (isModerator && !isOwner) {
        const { error } = await adminDeleteTip(tip.id);
        if (error) throw error;
        toast({
          title: 'Tip removed',
          description: 'The tip has been removed by moderation.',
        });
      } else {
        await deleteTip.mutateAsync(tip.id);
        toast({
          title: 'Tip deleted',
          description: 'Your tip has been deleted.',
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete tip.',
        variant: 'destructive',
      });
    }
  };

  const handleTranslate = async () => {
    if (isShowingTranslation) {
      setIsShowingTranslation(false);
      return;
    }

    if (translatedTitle && translatedDescription) {
      setIsShowingTranslation(true);
      return;
    }

    setIsTranslating(true);
    try {
      const userLang = navigator.language.split('-')[0] || 'en';
      
      const [titleResult, descResult] = await Promise.all([
        supabase.functions.invoke('translate-text', {
          body: { text: tip.title, targetLanguage: userLang }
        }),
        supabase.functions.invoke('translate-text', {
          body: { text: tip.description, targetLanguage: userLang }
        })
      ]);

      if (titleResult.error) throw titleResult.error;
      if (descResult.error) throw descResult.error;

      setTranslatedTitle(titleResult.data.translatedText);
      setTranslatedDescription(descResult.data.translatedText);
      setIsShowingTranslation(true);
    } catch (error: any) {
      toast({
        title: 'Translation failed',
        description: error?.message || 'Could not translate the tip.',
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const displayTitle = isShowingTranslation && translatedTitle ? translatedTitle : tip.title;
  const displayDescription = isShowingTranslation && translatedDescription ? translatedDescription : tip.description;
  
  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
        <div className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-card rounded-xl shadow-strong overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <CategoryBadge category={tip.category} />
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleTranslate}
                disabled={isTranslating}
                title={isShowingTranslation ? "Show original" : "Translate"}
              >
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Languages className={`w-4 h-4 ${isShowingTranslation ? 'text-primary' : ''}`} />
                )}
              </Button>
              
              {canEdit && (
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" title={isModerator && !isOwner ? "Remove (Moderator)" : "Delete"}>
                      {isModerator && !isOwner ? (
                        <Shield className="w-4 h-4 text-destructive" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-destructive" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isModerator && !isOwner ? "Remove this tip?" : "Delete tip?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isModerator && !isOwner 
                          ? "As a moderator, you are removing this tip for policy violations. This action cannot be undone."
                          : "This action cannot be undone. This will permanently delete your tip."
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isModerator && !isOwner ? "Remove" : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Report/Block Menu for non-owners */}
              {canReport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                      <Flag className="w-4 h-4 mr-2" />
                      Report Tip
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="text-destructive">
                      <Ban className="w-4 h-4 mr-2" />
                      Block @{username}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(100%-4rem)]">
            <h2 className="font-serif text-2xl font-semibold mb-4">{displayTitle}</h2>
            
            {isShowingTranslation && (
              <p className="text-xs text-muted-foreground mb-2 italic">Translated</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {countryName}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                @{username}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {format(new Date(tip.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            
            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-foreground whitespace-pre-wrap">{displayDescription}</p>
            </div>
            
            {tip.address && (
              <div className="p-4 bg-muted rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Address</p>
                    <p className="text-sm text-muted-foreground">{tip.address}</p>
                    {tip.latitude && tip.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${tip.latitude},${tip.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                      >
                        Open in Maps
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {tip.images && tip.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {tip.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${tip.title} - Image ${index + 1}`}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <EditTipDialog 
          tip={tip} 
          onClose={() => setIsEditing(false)}
          onSuccess={onClose}
        />
      )}

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reportType="tip"
        targetId={tip.id}
        targetName={tip.title}
      />

      <BlockUserDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        userId={tip.user_id}
        username={username}
      />
    </>
  );
}
