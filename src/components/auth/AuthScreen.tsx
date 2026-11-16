import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, type TranslationKey } from '@/lib/i18n';
import { authErrorKey } from '@/lib/authErrors';
import appLogo from '@/assets/app-logo.png';

type View = 'signin' | 'signup' | 'confirm' | 'forgot' | 'reset';

const USERNAME_RE = /^[A-Za-z0-9_-]{3,30}$/;
const CODE_RE = /^\d{6}$/;
const MIN_PASSWORD = 8;
const RESEND_SECONDS = 60;

interface AuthScreenProps {
  /** Called with true while a password reset is being saved, so the parent keeps this screen open. */
  onBusyChange?: (busy: boolean) => void;
}

export function AuthScreen({ onBusyChange }: AuthScreenProps) {
  const {
    signIn, signUp, checkUsernameAvailable, verifySignupCode, resendSignupCode,
    requestPasswordReset, resetPasswordWithCode,
  } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [view, setView] = useState<View>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Count down the "send again" wait.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const goTo = (next: View) => {
    setView(next);
    setErrorKey(null);
    setCode('');
  };

  const fail = (key: TranslationKey) => {
    setErrorKey(key);
    setLoading(false);
  };

  const handleSignIn = async () => {
    const { error } = await signIn(email.trim(), password);
    if (!error) return;

    if (authErrorKey(error) === 'auth.error.notConfirmed') {
      if (email.includes('@')) {
        // Unconfirmed account: send a fresh code and go to the code step.
        await resendSignupCode(email.trim());
        setCooldown(RESEND_SECONDS);
        goTo('confirm');
      } else {
        setErrorKey('auth.error.notConfirmedUsername');
      }
      return;
    }
    setErrorKey(authErrorKey(error));
  };

  const handleSignUp = async () => {
    const name = username.trim();
    if (!name) return fail('auth.error.usernameRequired');
    if (!USERNAME_RE.test(name)) return fail('auth.error.usernameFormat');
    if (!acceptedTerms) return fail('auth.error.termsRequired');
    if (password.length < MIN_PASSWORD) return fail('auth.error.passwordShort');

    const { available, error: checkError } = await checkUsernameAvailable(name);
    if (checkError) return fail('auth.error.generic');
    if (!available) return fail('auth.error.usernameTaken');

    const { error, needsConfirmation } = await signUp(email.trim(), password, name);
    if (error) return setErrorKey(authErrorKey(error));

    if (needsConfirmation) {
      setCooldown(RESEND_SECONDS);
      goTo('confirm');
    } else {
      toast({ title: t('auth.accountCreated'), description: t('auth.accountCreatedText') });
    }
  };

  const handleConfirm = async () => {
    if (!CODE_RE.test(code)) return fail('auth.error.codeFormat');
    const { error } = await verifySignupCode(email.trim(), code);
    if (error) return setErrorKey(authErrorKey(error));
    toast({ title: t('auth.accountCreated'), description: t('auth.accountCreatedText') });
  };

  const handleForgot = async () => {
    if (!email.includes('@')) return fail('auth.error.invalidEmail');
    const { error } = await requestPasswordReset(email.trim());
    if (error) return setErrorKey(authErrorKey(error));
    setCooldown(RESEND_SECONDS);
    goTo('reset');
  };

  const handleReset = async () => {
    if (!CODE_RE.test(code)) return fail('auth.error.codeFormat');
    if (newPassword.length < MIN_PASSWORD) return fail('auth.error.passwordShort');

    // Keep this screen open: the code step signs the user in before the new password is saved.
    onBusyChange?.(true);
    try {
      const { error } = await resetPasswordWithCode(email.trim(), code, newPassword);
      if (error) return setErrorKey(authErrorKey(error));
      toast({ title: t('auth.passwordReset'), description: t('auth.passwordResetText') });
    } finally {
      onBusyChange?.(false);
    }
  };

  const handleResend = async () => {
    setErrorKey(null);
    setLoading(true);
    const { error } =
      view === 'reset' ? await requestPasswordReset(email.trim()) : await resendSignupCode(email.trim());
    setLoading(false);
    if (error) return setErrorKey(authErrorKey(error));
    setCooldown(RESEND_SECONDS);
    toast({ title: t('auth.codeSent') });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorKey(null);
    try {
      if (view === 'signin') await handleSignIn();
      else if (view === 'signup') await handleSignUp();
      else if (view === 'confirm') await handleConfirm();
      else if (view === 'forgot') await handleForgot();
      else await handleReset();
    } catch (err) {
      console.error('Auth error:', err);
      setErrorKey('auth.error.generic');
    } finally {
      setLoading(false);
    }
  };

  const isTabView = view === 'signin' || view === 'signup';
  const showCode = view === 'confirm' || view === 'reset';

  const titleKey: Record<Exclude<View, 'signin' | 'signup'>, TranslationKey> = {
    confirm: 'auth.confirmTitle',
    forgot: 'auth.forgotTitle',
    reset: 'auth.resetTitle',
  };
  const textKey: Record<Exclude<View, 'signin' | 'signup'>, TranslationKey> = {
    confirm: 'auth.confirmText',
    forgot: 'auth.forgotText',
    reset: 'auth.resetText',
  };
  const submitKey: Record<View, TranslationKey> = {
    signin: 'auth.signIn',
    signup: 'auth.createAccount',
    confirm: 'auth.confirm',
    forgot: 'auth.sendCode',
    reset: 'auth.savePassword',
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <img src={appLogo} alt="TIPIT" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg" />
            <h1 className="text-2xl font-display font-semibold">{t('auth.welcome')}</h1>
            <p className="text-muted-foreground mt-1">{t('auth.tagline')}</p>
          </div>

          <Card>
            <CardHeader className="pb-4">
              {isTabView ? (
                <Tabs value={view} onValueChange={(v) => goTo(v as View)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                    <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
                  </TabsList>
                </Tabs>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => goTo(view === 'reset' ? 'forgot' : 'signin')}
                    className="flex items-center gap-1 text-sm text-muted-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    {t('auth.back')}
                  </button>
                  <h2 className="text-lg font-semibold">{t(titleKey[view])}</h2>
                  <p className="text-sm text-muted-foreground">{t(textKey[view], { email: email.trim() })}</p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {view === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('auth.username')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder={t('auth.usernamePlaceholder')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                        maxLength={30}
                        autoCapitalize="none"
                        autoCorrect="off"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{t('auth.usernameHelp')}</p>
                  </div>
                )}

                {(isTabView || view === 'forgot') && (
                  <div className="space-y-2">
                    <Label htmlFor="email">{view === 'signin' ? t('auth.emailOrUsername') : t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type={view === 'signin' ? 'text' : 'email'}
                        placeholder={view === 'signin' ? t('auth.emailOrUsernamePlaceholder') : t('auth.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        autoCapitalize="none"
                        autoCorrect="off"
                        required
                      />
                    </div>
                  </div>
                )}

                {isTabView && (
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    {view === 'signup' && (
                      <p className="text-xs text-muted-foreground">{t('auth.newPasswordHelp')}</p>
                    )}
                    {view === 'signin' && (
                      <button
                        type="button"
                        onClick={() => goTo('forgot')}
                        className="text-sm text-primary hover:underline"
                      >
                        {t('auth.forgot')}
                      </button>
                    )}
                  </div>
                )}

                {showCode && (
                  <div className="space-y-2">
                    <Label htmlFor="code">{t('auth.code')}</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder={t('auth.codePlaceholder')}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="pl-10 tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                )}

                {view === 'reset' && (
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t('auth.newPassword')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder={t('auth.newPassword')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{t('auth.newPasswordHelp')}</p>
                  </div>
                )}

                {view === 'signup' && (
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer text-muted-foreground">
                      {t('auth.acceptPrefix')}{' '}
                      <Link to="/terms" className="text-primary hover:underline font-medium" target="_blank">
                        {t('auth.terms')}
                      </Link>{' '}
                      {t('auth.and')}{' '}
                      <Link to="/privacy" className="text-primary hover:underline font-medium" target="_blank">
                        {t('auth.privacy')}
                      </Link>
                    </Label>
                  </div>
                )}

                {errorKey && (
                  <div role="alert" className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {t(errorKey)}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.pleaseWait') : t(submitKey[view])}
                </Button>

                {showCode && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    disabled={loading || cooldown > 0}
                    onClick={handleResend}
                  >
                    {cooldown > 0 ? t('auth.resendIn', { seconds: String(cooldown) }) : t('auth.resend')}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
