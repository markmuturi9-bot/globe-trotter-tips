import { useState } from 'react';
import { Settings, LogOut, MapPin, Calendar, FileText, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TipCard } from '@/components/tips/TipCard';
import { TipDetail } from '@/components/tips/TipDetail';
import { BulkTipImport } from '@/components/tips/BulkTipImport';
import { useAuth } from '@/hooks/useAuth';
import { useTipsByUser } from '@/hooks/useTips';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tip } from '@/types';
import { format } from 'date-fns';

export function ProfileView() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { data: userTips, isLoading: loadingTips } = useTipsByUser(user?.id || null);
  const { toast } = useToast();
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  
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
          <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-serif font-semibold">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
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
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 animate-slide-up">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Privacy Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="privacy" className="text-sm font-medium">Public Profile</Label>
                  <p className="text-xs text-muted-foreground">
                    Anyone can view your profile and tips
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
        </div>
      )}
      
      {/* User Tips */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Your Tips</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkImport(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Import
          </Button>
        </div>
        
        {loadingTips ? (
          <p className="text-sm text-muted-foreground">Loading tips...</p>
        ) : userTips && userTips.length > 0 ? (
          <div className="space-y-3">
            {userTips.map(tip => (
              <TipCard key={tip.id} tip={tip} onClick={() => setSelectedTip(tip)} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">You haven't shared any tips yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start sharing your travel experiences!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {selectedTip && (
        <TipDetail tip={selectedTip} onClose={() => setSelectedTip(null)} />
      )}
      
      {showBulkImport && (
        <BulkTipImport onClose={() => setShowBulkImport(false)} />
      )}
    </div>
  );
}
