import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types';
import { authError } from '@/lib/authErrors';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  checkUsernameAvailable: (username: string) => Promise<{ available: boolean; error: Error | null }>;
  /** needsConfirmation is false if the project does not require email confirmation (user is then signed in). */
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null; needsConfirmation: boolean }>;
  verifySignupCode: (email: string, code: string) => Promise<{ error: Error | null }>;
  resendSignupCode: (email: string) => Promise<{ error: Error | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: Error | null }>;
  resetPasswordWithCode: (email: string, code: string, newPassword: string) => Promise<{ error: Error | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST (before checking existing session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // Synchronous state updates only
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Defer profile fetching with setTimeout to prevent deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      // Only set if not already set by onAuthStateChange
      if (!session) {
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        
        if (existingSession?.user) {
          fetchProfile(existingSession.user.id);
        }
        
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUsernameAvailable = async (username: string) => {
    const { data, error } = await supabase.rpc('is_username_available', { _username: username });
    return { available: data === true, error: error as Error | null };
  };

  const signUp = async (email: string, password: string, username: string) => {
    // No redirect link: the email contains a 6-digit code that is typed into the app.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) return { error: error as Error, needsConfirmation: false };

    // For an email that is already registered, Supabase answers "success" with
    // no identities (to not reveal which emails exist). Treat it as an error.
    if (data.user && data.user.identities?.length === 0) {
      return { error: authError('user_already_exists'), needsConfirmation: false };
    }

    return { error: null, needsConfirmation: !data.session };
  };

  const verifySignupCode = async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' });
    return { error: error as Error | null };
  };

  const resendSignupCode = async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    return { error: error as Error | null };
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error as Error | null };
  };

  const resetPasswordWithCode = async (email: string, code: string, newPassword: string) => {
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
    if (verifyError) return { error: verifyError as Error };

    // The code is used up and we now hold a temporary session. If saving the
    // new password fails, end that session so the user starts over cleanly.
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      await supabase.auth.signOut();
      return { error: updateError as Error };
    }
    return { error: null };
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) return { error: authError('not_signed_in') };

    // Check the current password first (updateUser alone would not ask for it).
    const { error: checkError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (checkError) return { error: checkError as Error };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error as Error | null };
  };

  const signIn = async (identifier: string, password: string) => {
    let emailToUse = identifier;
    
    // Check if identifier is not an email (i.e., it's a username)
    if (!identifier.includes('@')) {
      // Look up the email by username using secure edge function with rate limiting
      try {
        const { data, error: lookupError } = await supabase.functions.invoke('login-username', {
          body: { username: identifier }
        });
        
        if (lookupError) {
          console.error('Username lookup error:', lookupError);
          return { error: authError('lookup_unavailable') };
        }
        
        if (data?.error) {
          return { error: authError('too_many_attempts') };
        }
        
        if (!data?.email) {
          return { error: authError('user_not_found') };
        }
        
        emailToUse = data.email;
      } catch (e) {
        console.error('Username lookup failed:', e);
        return { error: authError('lookup_unavailable') };
      }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      checkUsernameAvailable,
      signUp,
      verifySignupCode,
      resendSignupCode,
      requestPasswordReset,
      resetPasswordWithCode,
      changePassword,
      signIn,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
