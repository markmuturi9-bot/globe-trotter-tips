import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
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

  const signUp = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
        },
      },
    });
    
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
          return { error: new Error('Login service temporarily unavailable. Try using your email address.') };
        }
        
        if (data?.error) {
          return { error: new Error(data.error) };
        }
        
        if (!data?.email) {
          return { error: new Error('User not found. Please check your username.') };
        }
        
        emailToUse = data.email;
      } catch (e) {
        console.error('Username lookup failed:', e);
        return { error: new Error('Login service temporarily unavailable. Try using your email address.') };
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
      signUp,
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
