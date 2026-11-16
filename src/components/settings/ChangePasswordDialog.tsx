import { useState } from 'react';
import { ChevronRight, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, type TranslationKey } from '@/lib/i18n';
import { authErrorKey } from '@/lib/authErrors';

const MIN_PASSWORD = 8;

/** A settings row that opens a small form: current password + new password. */
export function ChangePasswordDialog({ rowClassName, iconClassName }: { rowClassName: string; iconClassName: string }) {
  const { changePassword } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setCurrent('');
      setNext('');
      setErrorKey(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);
    if (next.length < MIN_PASSWORD) {
      setErrorKey('auth.error.passwordShort');
      return;
    }
    setSaving(true);
    try {
      const { error } = await changePassword(current, next);
      if (error) {
        const key = authErrorKey(error);
        setErrorKey(key === 'auth.error.invalidCredentials' ? 'settings.wrongPassword' : key);
        return;
      }
      toast({ title: t('settings.passwordChanged') });
      handleOpenChange(false);
    } catch (err) {
      console.error('Change password failed:', err);
      setErrorKey('auth.error.generic');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" className={rowClassName} onClick={() => setOpen(true)}>
        <KeyRound className={iconClassName} strokeWidth={1.5} aria-hidden="true" />
        <span className="flex-1">{t('settings.changePassword')}</span>
        <ChevronRight className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.changePassword')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t('settings.currentPassword')}</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="change-new-password">{t('settings.newPassword')}</Label>
              <Input
                id="change-new-password"
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">{t('settings.newPasswordHelp')}</p>
            </div>
            {errorKey && (
              <div role="alert" className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {t(errorKey)}
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? t('settings.saving') : t('settings.savePassword')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
