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
