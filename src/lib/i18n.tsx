import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Minimal Swedish/English support. The language is stored on the device only.
 * Only texts added in the design update use this so far - the rest of the app is
 * still English (see docs/STATUS.md).
 */
export type Language = 'en' | 'sv';

const STORAGE_KEY = 'tipit-language';

const en = {
  'nav.map': 'Map',
  'nav.list': 'List',
  'nav.friends': 'Friends',
  'nav.profile': 'Profile',

  'profile.joined': 'Joined {date}',
  'profile.tipsShared': 'Tips shared',
  'profile.countries': 'Countries',
  'profile.yourTips': 'Your tips',
  'profile.noTips': "You haven't shared any tips yet.",
  'profile.settings': 'Settings',

  'settings.title': 'Settings',
  'settings.account': 'Account',
  'settings.username': 'Username',
  'settings.signOut': 'Sign out',
  'settings.privacy': 'Privacy',
  'settings.whoCanSee': 'Who can see your profile',
  'settings.everyone': 'Everyone',
  'settings.friendsOnly': 'Friends only',
  'settings.helpEveryone': 'Everyone can see your profile and tips',
  'settings.helpFriends': 'Only your friends can see your profile and tips',
  'settings.friendRequests': 'Friend requests',
  'settings.notifications': 'Notifications',
  'settings.push': 'Push notifications',
  'settings.appearance': 'Appearance',
  'settings.theme': 'Theme',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
  'settings.system': 'System',
  'settings.language': 'Language',
  'settings.about': 'About',
  'settings.contactUs': 'Contact us',
  'settings.contactHelp': 'Questions or data requests: {email}',
  'settings.privacyPolicy': 'Privacy policy',
  'settings.deleteAccount': 'Delete account',
  'settings.deleteHelp': 'Permanently delete your account and all data',
  'settings.delete': 'Delete',
  'settings.deleteTitle': 'Permanently delete account',
  'settings.deleteIntro': 'This cannot be undone. All your data will be permanently deleted, including:',
  'settings.deleteItem1': 'Your profile and account information',
  'settings.deleteItem2': 'All your tips and images',
  'settings.deleteItem3': 'Your friends and messages',
  'settings.cancel': 'Cancel',
  'settings.deleteConfirm': 'Yes, delete my account',
  'settings.deleting': 'Deleting...',
  'settings.saved': 'Settings updated',
  'settings.saveFailed': 'Failed to update privacy settings.',

  'auth.welcome': 'Welcome to TIPIT',
  'auth.tagline': 'Share and discover travel tips',
  'auth.signIn': 'Sign in',
  'auth.signUp': 'Sign up',
  'auth.username': 'Username',
  'auth.usernamePlaceholder': 'Choose a username',
  'auth.usernameHelp': '3-30 characters: letters, digits, _ and -',
  'auth.emailOrUsername': 'Email or username',
  'auth.emailOrUsernamePlaceholder': 'Email or username',
  'auth.email': 'Email',
  'auth.emailPlaceholder': 'Enter your email',
  'auth.password': 'Password',
  'auth.passwordPlaceholder': 'Enter your password',
  'auth.newPasswordHelp': 'At least 8 characters',
  'auth.acceptPrefix': 'I accept the',
  'auth.terms': 'Terms of Service',
  'auth.and': 'and',
  'auth.privacy': 'Privacy Policy',
  'auth.createAccount': 'Create account',
  'auth.pleaseWait': 'Please wait...',
  'auth.forgot': 'Forgot password?',
  'auth.back': 'Back',
  'auth.accountCreated': 'Account created',
  'auth.accountCreatedText': 'Welcome to TIPIT! You can now start sharing tips.',

  'auth.confirmTitle': 'Confirm your email',
  'auth.confirmText': 'We sent an email with a 6-digit code to {email}. Enter it below.',
  'auth.code': 'Code',
  'auth.codePlaceholder': '6-digit code',
  'auth.confirm': 'Confirm',
  'auth.resend': 'Send code again',
  'auth.resendIn': 'Send again in {seconds} s',
  'auth.codeSent': 'A new code has been sent',

  'auth.forgotTitle': 'Forgot password',
  'auth.forgotText': 'Enter your email and we will send a 6-digit code.',
  'auth.sendCode': 'Send code',
  'auth.resetTitle': 'Choose a new password',
  'auth.resetText': 'Enter the code we sent to {email} and your new password.',
  'auth.newPassword': 'New password',
  'auth.savePassword': 'Save password',
  'auth.passwordReset': 'Password changed',
  'auth.passwordResetText': 'You are now signed in with your new password.',

  'auth.error.usernameRequired': 'Enter a username.',
  'auth.error.usernameFormat': 'The username must be 3-30 characters and may only contain letters, digits, _ and -.',
  'auth.error.usernameTaken': 'That username is already taken. Choose another one.',
  'auth.error.usernameRejected': 'The username is invalid or already taken. Choose another one.',
  'auth.error.termsRequired': 'You must accept the Terms of Service and Privacy Policy.',
  'auth.error.passwordShort': 'The password must be at least 8 characters.',
  'auth.error.codeFormat': 'Enter the 6-digit code.',
  'auth.error.invalidCredentials': 'Wrong email/username or password. Please try again.',
  'auth.error.emailTaken': 'This email is already registered. Please sign in instead.',
  'auth.error.notConfirmed': 'Your email is not confirmed yet.',
  'auth.error.notConfirmedUsername': 'Your email is not confirmed yet. Sign in with your email address to get a new code.',
  'auth.error.badCode': 'Wrong or expired code. Request a new code and try again.',
  'auth.error.weakPassword': 'The password is too weak. Use at least 8 characters.',
  'auth.error.samePassword': 'The new password must be different from the old one.',
  'auth.error.rateLimit': 'Too many attempts. Wait a moment and try again.',
  'auth.error.userNotFound': 'No user found. Check the username.',
  'auth.error.lookupUnavailable': 'The login service is unavailable right now. Try your email address instead.',
  'auth.error.invalidEmail': 'Enter a valid email address.',
  'auth.error.generic': 'Something went wrong. Please try again.',

  'settings.changePassword': 'Change password',
  'settings.currentPassword': 'Current password',
  'settings.newPassword': 'New password',
  'settings.newPasswordHelp': 'At least 8 characters',
  'settings.savePassword': 'Save password',
  'settings.saving': 'Saving...',
  'settings.passwordChanged': 'Password changed',
  'settings.wrongPassword': 'The current password is wrong.',
  'settings.deletePassword': 'Enter your password to confirm',
  'settings.deleteDone': 'Account deleted',
  'settings.deleteDoneText': 'Your account and all data have been deleted.',
  'settings.deleteFailed': 'Deletion failed',
  'settings.deleteWrongPassword': 'Wrong password. Your account was not deleted.',
  'settings.deleteLastAdmin': 'You are the last admin. Make someone else admin before deleting this account.',
  'settings.deleteFilesFailed': 'Your files could not be deleted, so the account was kept. Please try again.',
  'settings.deleteGeneric': 'Could not delete the account. Please try again or contact support.',

  'tips.loginRequired': 'Log in to see tips from friends and public profiles.',
  'tips.loginButton': 'Log in',

  'tip.publish': 'Publish',
  'tip.publishing': 'Publishing...',
} as const;

export type TranslationKey = keyof typeof en;

const sv: Record<TranslationKey, string> = {
  'nav.map': 'Karta',
  'nav.list': 'Lista',
  'nav.friends': 'Vänner',
  'nav.profile': 'Profil',

  'profile.joined': 'Gick med {date}',
  'profile.tipsShared': 'Delade tips',
  'profile.countries': 'Länder',
  'profile.yourTips': 'Dina tips',
  'profile.noTips': 'Du har inte delat några tips än.',
  'profile.settings': 'Inställningar',

  'settings.title': 'Inställningar',
  'settings.account': 'Konto',
  'settings.username': 'Användarnamn',
  'settings.signOut': 'Logga ut',
  'settings.privacy': 'Integritet',
  'settings.whoCanSee': 'Vem kan se din profil',
  'settings.everyone': 'Alla',
  'settings.friendsOnly': 'Bara vänner',
  'settings.helpEveryone': 'Alla kan se din profil och dina tips',
  'settings.helpFriends': 'Bara dina vänner kan se din profil och dina tips',
  'settings.friendRequests': 'Vänförfrågningar',
  'settings.notifications': 'Notiser',
  'settings.push': 'Pushnotiser',
  'settings.appearance': 'Utseende',
  'settings.theme': 'Tema',
  'settings.light': 'Ljust',
  'settings.dark': 'Mörkt',
  'settings.system': 'System',
  'settings.language': 'Språk',
  'settings.about': 'Om',
  'settings.contactUs': 'Kontakta oss',
  'settings.contactHelp': 'Frågor eller dataförfrågningar: {email}',
  'settings.privacyPolicy': 'Integritetspolicy',
  'settings.deleteAccount': 'Radera konto',
  'settings.deleteHelp': 'Radera ditt konto och all data permanent',
  'settings.delete': 'Radera',
  'settings.deleteTitle': 'Radera kontot permanent',
  'settings.deleteIntro': 'Detta går inte att ångra. All din data raderas permanent, inklusive:',
  'settings.deleteItem1': 'Din profil och kontoinformation',
  'settings.deleteItem2': 'Alla dina tips och bilder',
  'settings.deleteItem3': 'Dina vänner och meddelanden',
  'settings.cancel': 'Avbryt',
  'settings.deleteConfirm': 'Ja, radera mitt konto',
  'settings.deleting': 'Raderar...',
  'settings.saved': 'Inställningar sparade',
  'settings.saveFailed': 'Det gick inte att spara integritetsinställningen.',

  'auth.welcome': 'Välkommen till TIPIT',
  'auth.tagline': 'Dela och upptäck resetips',
  'auth.signIn': 'Logga in',
  'auth.signUp': 'Skapa konto',
  'auth.username': 'Användarnamn',
  'auth.usernamePlaceholder': 'Välj ett användarnamn',
  'auth.usernameHelp': '3–30 tecken: bokstäver, siffror, _ och -',
  'auth.emailOrUsername': 'E-post eller användarnamn',
  'auth.emailOrUsernamePlaceholder': 'E-post eller användarnamn',
  'auth.email': 'E-post',
  'auth.emailPlaceholder': 'Skriv din e-postadress',
  'auth.password': 'Lösenord',
  'auth.passwordPlaceholder': 'Skriv ditt lösenord',
  'auth.newPasswordHelp': 'Minst 8 tecken',
  'auth.acceptPrefix': 'Jag godkänner',
  'auth.terms': 'användarvillkoren',
  'auth.and': 'och',
  'auth.privacy': 'integritetspolicyn',
  'auth.createAccount': 'Skapa konto',
  'auth.pleaseWait': 'Vänta...',
  'auth.forgot': 'Glömt lösenord?',
  'auth.back': 'Tillbaka',
  'auth.accountCreated': 'Konto skapat',
  'auth.accountCreatedText': 'Välkommen till TIPIT! Nu kan du börja dela tips.',

  'auth.confirmTitle': 'Bekräfta din e-post',
  'auth.confirmText': 'Vi har skickat ett mejl med en kod på 6 siffror till {email}. Skriv in den här.',
  'auth.code': 'Kod',
  'auth.codePlaceholder': 'Kod med 6 siffror',
  'auth.confirm': 'Bekräfta',
  'auth.resend': 'Skicka koden igen',
  'auth.resendIn': 'Skicka igen om {seconds} s',
  'auth.codeSent': 'En ny kod har skickats',

  'auth.forgotTitle': 'Glömt lösenord',
  'auth.forgotText': 'Skriv din e-post så skickar vi en kod på 6 siffror.',
  'auth.sendCode': 'Skicka kod',
  'auth.resetTitle': 'Välj nytt lösenord',
  'auth.resetText': 'Skriv koden vi skickade till {email} och ditt nya lösenord.',
  'auth.newPassword': 'Nytt lösenord',
  'auth.savePassword': 'Spara lösenord',
  'auth.passwordReset': 'Lösenordet är ändrat',
  'auth.passwordResetText': 'Du är nu inloggad med ditt nya lösenord.',

  'auth.error.usernameRequired': 'Skriv ett användarnamn.',
  'auth.error.usernameFormat': 'Användarnamnet måste vara 3–30 tecken och får bara innehålla bokstäver, siffror, _ och -.',
  'auth.error.usernameTaken': 'Användarnamnet är redan taget. Välj ett annat.',
  'auth.error.usernameRejected': 'Användarnamnet är ogiltigt eller redan taget. Välj ett annat.',
  'auth.error.termsRequired': 'Du måste godkänna användarvillkoren och integritetspolicyn.',
  'auth.error.passwordShort': 'Lösenordet måste vara minst 8 tecken.',
  'auth.error.codeFormat': 'Skriv koden med 6 siffror.',
  'auth.error.invalidCredentials': 'Fel e-post/användarnamn eller lösenord. Försök igen.',
  'auth.error.emailTaken': 'Den här e-postadressen är redan registrerad. Logga in i stället.',
  'auth.error.notConfirmed': 'Din e-post är inte bekräftad än.',
  'auth.error.notConfirmedUsername': 'Din e-post är inte bekräftad än. Logga in med din e-postadress för att få en ny kod.',
  'auth.error.badCode': 'Fel kod eller så har den gått ut. Be om en ny kod och försök igen.',
  'auth.error.weakPassword': 'Lösenordet är för svagt. Använd minst 8 tecken.',
  'auth.error.samePassword': 'Det nya lösenordet måste skilja sig från det gamla.',
  'auth.error.rateLimit': 'För många försök. Vänta en stund och försök igen.',
  'auth.error.userNotFound': 'Ingen användare hittades. Kontrollera användarnamnet.',
  'auth.error.lookupUnavailable': 'Inloggningen är otillgänglig just nu. Försök med din e-postadress i stället.',
  'auth.error.invalidEmail': 'Skriv en giltig e-postadress.',
  'auth.error.generic': 'Något gick fel. Försök igen.',

  'settings.changePassword': 'Byt lösenord',
  'settings.currentPassword': 'Nuvarande lösenord',
  'settings.newPassword': 'Nytt lösenord',
  'settings.newPasswordHelp': 'Minst 8 tecken',
  'settings.savePassword': 'Spara lösenord',
  'settings.saving': 'Sparar...',
  'settings.passwordChanged': 'Lösenordet är ändrat',
  'settings.wrongPassword': 'Nuvarande lösenord är fel.',
  'settings.deletePassword': 'Skriv ditt lösenord för att bekräfta',
  'settings.deleteDone': 'Kontot är raderat',
  'settings.deleteDoneText': 'Ditt konto och all din data har raderats.',
  'settings.deleteFailed': 'Raderingen misslyckades',
  'settings.deleteWrongPassword': 'Fel lösenord. Kontot raderades inte.',
  'settings.deleteLastAdmin': 'Du är den sista admin. Gör någon annan till admin innan du raderar kontot.',
  'settings.deleteFilesFailed': 'Dina filer kunde inte raderas, så kontot finns kvar. Försök igen.',
  'settings.deleteGeneric': 'Kontot kunde inte raderas. Försök igen eller kontakta supporten.',

  'tips.loginRequired': 'Logga in för att se tips från vänner och öppna profiler.',
  'tips.loginButton': 'Logga in',

  'tip.publish': 'Publicera',
  'tip.publishing': 'Publicerar...',
};

const dictionaries: Record<Language, Record<TranslationKey, string>> = { en, sv };

function detectInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'sv') return stored;
  } catch {
    // storage unavailable - fall through
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('sv') ? 'sv' : 'en';
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore - the choice just won't survive a restart
    }
  }, []);

  const t = useCallback<LanguageContextValue['t']>(
    (key, vars) => {
      let text = dictionaries[language][key];
      if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, v);
      return text;
    },
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
