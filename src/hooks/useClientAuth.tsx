import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { clientProfileService, ClientProfile } from '@/services/clientProfileService';

interface ClientAuthContextType {
  user: User | null;
  session: Session | null;
  profile: ClientProfile | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithIdToken: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export const ClientAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, userMeta?: any) => {
    let clientProfile = await clientProfileService.getProfile(userId);
    
    // Auto-create profile if it doesn't exist (first Google sign-in)
    if (!clientProfile && userMeta) {
      clientProfile = await clientProfileService.upsertProfile(userId, {
        full_name: userMeta.full_name || userMeta.name || null,
        email: userMeta.email || null,
        avatar_url: userMeta.avatar_url || userMeta.picture || null,
      });
    }
    
    setProfile(clientProfile);
  }, []);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential Supabase deadlock
          setTimeout(() => {
            fetchProfile(session.user.id, session.user.user_metadata);
          }, 0);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.user_metadata);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const signInWithIdToken = async (token: string) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token,
    });
    if (error) {
      console.error('ID token sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.user_metadata);
    }
  };

  return (
    <ClientAuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isSignedIn: !!user,
        signInWithGoogle,
        signInWithIdToken,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (context === undefined) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
};
