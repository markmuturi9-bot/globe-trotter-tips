import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Settings, Calendar, FileText, Globe, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useTipsByUser } from '@/hooks/useTips';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { TipCard } from '@/components/tips/TipCard';
import { TipDetail } from '@/components/tips/TipDetail';
import { useLanguage } from '@/lib/i18n';
import type { Tip } from '@/types';

export function ProfileView() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const { data: userTips } = useTipsByUser(user?.id || null);
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  
  // Kept true while a password reset is saved, so the sign-in screen stays open.
  const [resetBusy, setResetBusy] = useState(false);

  const uniqueCountries = new Set(userTips?.map(tip => tip.country_id) || []);

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
  
  // Show sign-in / sign-up when not logged in
  if (!user || resetBusy) {
    return <AuthScreen onBusyChange={setResetBusy} />;
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
    <div className="flex-1">
      {/* Hero */}
      <div className="bg-gradient-to-b from-accent to-background px-5 pt-6 pb-1">
        <div className="flex items-start justify-between mb-4">
          <div className="relative group">
            <Avatar className="w-[84px] h-[84px]">
              <AvatarImage src={(profile as any).avatar_url} alt={profile.username} />
              <AvatarFallback className="text-4xl font-display font-bold bg-primary text-primary-foreground">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" strokeWidth={1.5} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          <Link
            to="/settings"
            aria-label={t('profile.settings')}
            className="w-11 h-11 rounded-[14px] border border-border bg-card flex items-center justify-center text-foreground"
          >
            <Settings className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>

        <h1 className="font-display text-3xl font-bold">@{profile.username}</h1>
        <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1.5">
          <Calendar className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
          {t('profile.joined', {
            date: format(new Date(profile.created_at), 'MMM yyyy', { locale: language === 'sv' ? sv : undefined }),
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-5 mt-5">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <FileText className="w-[22px] h-[22px] text-primary" strokeWidth={1.5} aria-hidden="true" />
            <p className="font-display text-3xl font-bold mt-2">{userTips?.length || 0}</p>
            <p className="text-sm text-muted-foreground">{t('profile.tipsShared')}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <Globe className="w-[22px] h-[22px] text-primary" strokeWidth={1.5} aria-hidden="true" />
            <p className="font-display text-3xl font-bold mt-2">{uniqueCountries.size}</p>
            <p className="text-sm text-muted-foreground">{t('profile.countries')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Your tips */}
      <section className="px-5 mt-6 space-y-3">
        <h2 className="font-display text-lg font-semibold">{t('profile.yourTips')}</h2>
        {userTips && userTips.length > 0 ? (
          <div className="space-y-3">
            {userTips.map((tip) => (
              <TipCard key={tip.id} tip={tip} onClick={() => setSelectedTip(tip)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('profile.noTips')}</p>
        )}
      </section>

      {selectedTip && <TipDetail tip={selectedTip} onClose={() => setSelectedTip(null)} />}
    </div>
  );
}
