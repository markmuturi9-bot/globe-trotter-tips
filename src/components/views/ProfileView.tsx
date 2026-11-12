import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Calendar, FileText, Globe, Camera, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import appLogo from '@/assets/app-logo.png';

export function ProfileView() {
  const { user, profile, signIn, signUp, loading, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const { data: userTips } = useTipsByUser(user?.id || null);
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  
  // Auth form state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
        if (!acceptedTerms) {
          setAuthError('You must accept the Terms of Service and Privacy Policy');
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
            description: 'Welcome to TIPIT! You can now start sharing tips.',
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
  
  // Show auth form when not logged in
  if (!user) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-6">
            {/* Logo */}
            <div className="text-center">
              <img src={appLogo} alt="TIPIT" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg" />
              <h1 className="text-2xl font-display font-semibold">Welcome to TIPIT</h1>
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
                    <Label htmlFor="email">{authMode === 'signin' ? 'Email or Username' : 'Email'}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type={authMode === 'signin' ? 'text' : 'email'}
                        placeholder={authMode === 'signin' ? 'Email or username' : 'Enter your email'}
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

                  {authMode === 'signup' && (
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="terms" 
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer text-muted-foreground">
                        I accept the{' '}
                        <Link to="/terms" className="text-primary hover:underline font-medium" target="_blank">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary hover:underline font-medium" target="_blank">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                  )}

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
