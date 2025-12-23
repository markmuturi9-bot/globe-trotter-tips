import { useState } from 'react';
import { Settings, LogOut, MapPin, Calendar, FileText, Globe, Sparkles, Download, Trash2, AlertTriangle } from 'lucide-react';
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
  const { data: userTips, isLoading: loadingTips } = useTipsByUser(user?.id || null);
  const { toast } = useToast();
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);
    
    try {
      // Fetch all user data
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

      // Create and download file
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
        title: 'Data exporterad',
        description: 'Dina uppgifter har laddats ner som en JSON-fil.',
      });
    } catch (error) {
      toast({
        title: 'Export misslyckades',
        description: 'Kunde inte exportera dina uppgifter. Försök igen.',
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
      // Delete all user tips first
      await supabase.from('tips').delete().eq('user_id', user.id);
      
      // Delete friendships
      await supabase.from('friendships').delete().or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
      
      // Delete messages
      await supabase.from('messages').delete().eq('sender_id', user.id);
      
      // Delete notifications
      await supabase.from('notifications').delete().eq('user_id', user.id);
      
      // Sign out (profile will be deleted by cascade when auth user is deleted)
      await signOut();
      
      toast({
        title: 'Konto raderat',
        description: 'Ditt konto och alla uppgifter har raderats.',
      });
    } catch (error) {
      toast({
        title: 'Radering misslyckades',
        description: 'Kunde inte radera kontot. Försök igen eller kontakta support.',
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
        <div className="p-4 animate-slide-up space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Sekretessinställningar</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="privacy" className="text-sm font-medium">Offentlig profil</Label>
                  <p className="text-xs text-muted-foreground">
                    Alla kan se din profil och dina tips
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
              <h3 className="font-medium mb-4">Dina rättigheter (GDPR)</h3>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Exportera dina uppgifter</p>
                    <p className="text-xs text-muted-foreground">
                      Ladda ner all din data som en JSON-fil
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportData}
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Exporterar...' : 'Exportera'}
                  </Button>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-destructive">Radera konto</p>
                      <p className="text-xs text-muted-foreground">
                        Permanent radera ditt konto och all data
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDeleting}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Radera
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Radera konto permanent
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Detta kan inte ångras. All din data kommer att raderas permanent, inklusive:
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                              <li>Din profil och kontoinformation</li>
                              <li>Alla dina tips och bilder</li>
                              <li>Dina vänner och meddelanden</li>
                            </ul>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? 'Raderar...' : 'Ja, radera mitt konto'}
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
