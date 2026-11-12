import { ReactNode, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import {
  AlertTriangle, Bell, ChevronRight, FileText, Globe, Lock, LogOut, Mail, Sun, Trash2, User, UserPlus,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage, type Language } from '@/lib/i18n';
import { CONTACT_EMAIL } from '@/lib/constants';
import { cn } from '@/lib/utils';

const PUSH_KEY = 'tipit-push-enabled';

function readPush(): boolean {
  try {
    return localStorage.getItem(PUSH_KEY) !== 'false';
  } catch {
    return true;
  }
}

// ---- small building blocks -------------------------------------------------

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="pl-1 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground font-sans">
        {title}
      </h2>
      <div className="rounded-2xl border border-border bg-card shadow-card divide-y divide-border">{children}</div>
    </section>
  );
}

const rowClass = 'flex items-center gap-3.5 min-h-[52px] px-4 w-full text-left text-base';
const iconClass = 'w-5 h-5 shrink-0';

function Segmented<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 p-1 rounded-xl bg-muted">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            className={cn(
              'flex-1 min-h-[40px] rounded-[9px] text-sm transition-colors',
              on ? 'bg-card text-foreground font-semibold shadow-sm' : 'text-muted-foreground font-medium'
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ---- page -------------------------------------------------------------------

export function SettingsView() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [pushOn, setPushOn] = useState(readPush);
  const [isDeleting, setIsDeleting] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/profile" replace />;
  if (!profile) return null;

  // The database already stores this as 'public' | 'friends_only'.
  const visibility = profile.privacy_setting === 'public' ? 'everyone' : 'friends';

  const handleVisibility = async (next: 'everyone' | 'friends') => {
    if (next === visibility) return;
    const { error } = await supabase
      .from('profiles')
      .update({ privacy_setting: next === 'everyone' ? 'public' : 'friends_only' })
      .eq('id', user.id);
    if (error) {
      toast({ title: 'Error', description: t('settings.saveFailed'), variant: 'destructive' });
      return;
    }
    await refreshProfile();
    toast({ title: t('settings.saved') });
  };

  // Push is not implemented in the app yet - only the choice is stored on the device.
  const handlePush = (on: boolean) => {
    setPushOn(on);
    try {
      localStorage.setItem(PUSH_KEY, String(on));
    } catch {
      // ignore
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await supabase.from('tips').delete().eq('user_id', user.id);
      await supabase.from('friendships').delete().or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
      await supabase.from('messages').delete().eq('sender_id', user.id);
      await supabase.from('notifications').delete().eq('user_id', user.id);
      await signOut();
      toast({ title: 'Account deleted', description: 'Your account and all data have been deleted.' });
    } catch {
      toast({
        title: 'Deletion failed',
        description: 'Could not delete account. Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 px-5 pt-5 space-y-6">
      <Section title={t('settings.account')}>
        <div className={rowClass}>
          <User className={iconClass} strokeWidth={1.5} aria-hidden="true" />
          <span className="flex-1">{t('settings.username')}</span>
          <span className="text-[15px] text-muted-foreground">@{profile.username}</span>
        </div>
        <ChangePasswordDialog rowClassName={rowClass} iconClassName={iconClass} />
        <button type="button" className={rowClass} onClick={() => signOut()}>
          <LogOut className={iconClass} strokeWidth={1.5} aria-hidden="true" />
          <span className="flex-1">{t('settings.signOut')}</span>
        </button>
      </Section>

      <Section title={t('settings.privacy')}>
        <div className="flex flex-col gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3.5">
            <Lock className={iconClass} strokeWidth={1.5} aria-hidden="true" />
            <div className="flex-1">
              <p className="text-base">{t('settings.whoCanSee')}</p>
              <p className="text-[13px] text-muted-foreground">
                {visibility === 'everyone' ? t('settings.helpEveryone') : t('settings.helpFriends')}
              </p>
            </div>
          </div>
          <Segmented
            label={t('settings.whoCanSee')}
            value={visibility}
            onChange={handleVisibility}
            options={[
              { id: 'everyone', label: t('settings.everyone') },
              { id: 'friends', label: t('settings.friendsOnly') },
            ]}
          />
        </div>
        <div className={rowClass}>
          <UserPlus className={iconClass} strokeWidth={1.5} aria-hidden="true" />
          <span className="flex-1">{t('settings.friendRequests')}</span>
          <span className="text-[15px] text-muted-foreground">{t('settings.everyone')}</span>
        </div>
      </Section>

      <Section title={t('settings.notifications')}>
        <div className={rowClass}>
          <Bell className={iconClass} strokeWidth={1.5} aria-hidden="true" />
          <span className="flex-1">{t('settings.push')}</span>
          <Switch checked={pushOn} onCheckedChange={handlePush} aria-label={t('settings.push')} />
        </div>
      </Section>

      <Section title={t('settings.appearance')}>
        <div className="flex flex-col gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3.5">
            <Sun className={iconClass} strokeWidth={1.5} aria-hidden="true" />
            <span className="flex-1 text-base">{t('settings.theme')}</span>
          </div>
          <Segmented
            label={t('settings.theme')}
            value={(theme as 'light' | 'dark' | 'system') ?? 'system'}
            onChange={setTheme}
            options={[
              { id: 'light', label: t('settings.light') },
              { id: 'dark', label: t('settings.dark') },
              { id: 'system', label: t('settings.system') },
            ]}
          />
        </div>
        <div className="flex flex-col gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3.5">
            <Globe className={iconClass} strokeWidth={1.5} aria-hidden="true" />
            <span className="flex-1 text-base">{t('settings.language')}</span>
          </div>
          <Segmented<Language>
            label={t('settings.language')}
            value={language}
            onChange={setLanguage}
            options={[
              { id: 'en', label: 'English' },
              { id: 'sv', label: 'Svenska' },
            ]}
          />
        </div>
      </Section>

      <Section title={t('settings.about')}>
        <a href={`mailto:${CONTACT_EMAIL}`} className={cn(rowClass, 'py-2')}>
          <Mail className={iconClass} strokeWidth={1.5} aria-hidden="true" />
          <span className="flex-1">
            <span className="block">{t('settings.contactUs')}</span>
            <span className="block text-[13px] text-muted-foreground">
              {t('settings.contactHelp', { email: CONTACT_EMAIL })}
            </span>
          </span>
          <ChevronRight className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        </a>
        <Link to="/privacy" className={rowClass}>
          <FileText className={iconClass} strokeWidth={1.5} aria-hidden="true" />
          <span className="flex-1">{t('settings.privacyPolicy')}</span>
          <ChevronRight className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </Section>

      {/* Required by App Store rule 5.1.1(v): account deletion must be inside the app */}
      <section className="flex items-center gap-3.5 rounded-2xl border border-destructive/30 bg-card p-4">
        <div className="flex-1">
          <p className="text-base font-semibold text-destructive">{t('settings.deleteAccount')}</p>
          <p className="text-[13px] text-muted-foreground">{t('settings.deleteHelp')}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="min-h-[44px] rounded-xl px-4 font-semibold" disabled={isDeleting}>
              <Trash2 className="w-[18px] h-[18px] mr-2" strokeWidth={1.75} aria-hidden="true" />
              {t('settings.delete')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden="true" />
                {t('settings.deleteTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('settings.deleteIntro')}
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>{t('settings.deleteItem1')}</li>
                  <li>{t('settings.deleteItem2')}</li>
                  <li>{t('settings.deleteItem3')}</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('settings.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? t('settings.deleting') : t('settings.deleteConfirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
