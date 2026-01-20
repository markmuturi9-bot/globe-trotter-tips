import { useState } from 'react';
import { Settings, LogOut, Calendar, FileText, Globe, Download, Trash2, AlertTriangle, Camera, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import appLogo from '@/assets/app-logo.png';

export function ProfileView() {
  const { user, profile, signOut, signIn, signUp, loading, refreshProfile } = useAuth();
  const { data: userTips } = useTipsByUser(user?.id || null);
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Auth form state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const uniqueCountries = new Set(userTips?.map(tip => tip.country_id) || []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'signup') {
        if (!username.trim()) {
          setAuthError('Username is required');
          setAuthLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          if (error.message.includes('already registered')) {
            setAuthError('This email is already registered. Please sign in instead.');
          } else {
            setAuthError(error.message);
          }
        } else {
          toast({
            title: 'Account created',
            description: 'Welcome to TipTip! You can now start sharing tips.',
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setAuthError('Invalid email or password. Please try again.');
          } else {
            setAuthError(error.message);
          }
        }
      }
    } catch (error: any) {
      setAuthError(error.message || 'An error occurred');
    } finally {
      setAuthLoading(false);
    }
  };
  
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
      
      // Save avatar URL to profile
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: imageUrl })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: 'Profile picture updated',
        description: 'Your profile picture has been saved.',
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

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show auth form when not logged in
  if (!user) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-6">
            {/* Logo */}
            <div className="text-center">
              <img src={appLogo} alt="TipTip" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg" />
              <h1 className="text-2xl font-display font-semibold">Welcome to TipTip</h1>
              <p className="text-muted-foreground mt-1">Share and discover travel tips</p>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <Tabs value={authMode} onValueChange={(v) => { setAuthMode(v as 'signin' | 'signup'); setAuthError(null); }}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="Choose a username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      {authError}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  // Show loading for profile
  if (!profile) {
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
              <AvatarImage src={(profile as any).avatar_url} alt={profile.username} />
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
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
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