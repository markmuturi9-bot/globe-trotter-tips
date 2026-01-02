import { useState } from 'react';
import { Settings, LogOut, Calendar, FileText, Globe, Download, Trash2, AlertTriangle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useTipsByUser } from '@/hooks/useTips';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/alert-dialog";

export function ProfileView() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { data: userTips } = useTipsByUser(user?.id || null);
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const uniqueCountries = new Set(userTips?.map(tip => tip.country_id) || []);
  
  const handlePrivacyChange = async (isPublic: boolean) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ privacy_setting: isPublic ? 'public' : 'friends_only' })
      .eq('id', user.id);
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update privacy settings.',
        variant: 'destructive',
      });
    } else {
      await refreshProfile();
      toast({
        title: 'Settings updated',
        description: `Your profile is now ${isPublic ? 'public' : 'friends only'}.`,
      });
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const imageUrl = await uploadImage(file);
      if (!imageUrl) throw new Error('Upload failed');
      
      toast({
        title: 'Profile picture uploaded',
        description: 'Your profile picture has been uploaded.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error?.message || 'Failed to upload profile picture.',
        variant: 'destructive',
      });
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);
    
    try {
      const [profileResult, tipsResult, friendshipsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('tips').select('*').eq('user_id', user.id),
        supabase.from('friendships').select('*').or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        profile: profileResult.data,
        tips: tipsResult.data || [],
        friendships: friendshipsResult.data || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data exported',
        description: 'Your data has been downloaded as a JSON file.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    
    try {
      await supabase.from('tips').delete().eq('user_id', user.id);
      await supabase.from('friendships').delete().or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
      await supabase.from('messages').delete().eq('sender_id', user.id);
      await supabase.from('notifications').delete().eq('user_id', user.id);
      
      await signOut();
      
      toast({
        title: 'Account deleted',
        description: 'Your account and all data have been deleted.',
      });
    } catch (error) {
      toast({
        title: 'Deletion failed',
        description: 'Could not delete account. Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (!user || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background p-6 pb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="relative group">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl font-serif font-semibold bg-primary text-primary-foreground">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        
        <h1 className="font-serif text-2xl font-semibold mb-1">@{profile.username}</h1>
        <p className="text-sm text-muted-foreground mb-4">{profile.email}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Joined {format(new Date(profile.created_at), 'MMM yyyy')}
          </span>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 p-4 -mt-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-semibold">{userTips?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Tips shared</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Globe className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-semibold">{uniqueCountries.size}</p>
            <p className="text-xs text-muted-foreground">Countries</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Settings - Always visible */}
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4" />
              <h3 className="font-medium">Privacy Settings</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="privacy" className="text-sm font-medium">Public profile</Label>
                <p className="text-xs text-muted-foreground">
                  Everyone can see your profile and tips
                </p>
              </div>
              <Switch
                id="privacy"
                checked={profile.privacy_setting === 'public'}
                onCheckedChange={handlePrivacyChange}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* GDPR Data Rights */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Your Rights (GDPR)</h3>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Export your data</p>
                  <p className="text-xs text-muted-foreground">
                    Download all your data as a JSON file
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-destructive">Delete account</p>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={isDeleting}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          Permanently delete account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This cannot be undone. All your data will be permanently deleted, including:
                          <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Your profile and account information</li>
                            <li>All your tips and images</li>
                            <li>Your friends and messages</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}