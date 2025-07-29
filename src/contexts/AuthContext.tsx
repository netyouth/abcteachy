import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: Database['public']['Enums']['user_role']) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  forceRefreshProfile: () => Promise<void>;
  resetAuthState: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<void> => {
    console.log('🔄 Fetching profile for user:', userId);

    try {
      // Check current session state
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('🔐 Current session state:', {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userId: sessionData.session?.user?.id,
        matchesTargetUser: sessionData.session?.user?.id === userId
      });

      // Query all profile fields
      console.log('📡 Making Supabase query for full profile...');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('📊 Query result:', { 
        hasData: !!profile, 
        error: error?.message || 'none',
        errorCode: error?.code,
        profile: profile
      });

      if (error) {
        console.error('❌ Simple profile query failed:', error);
        setProfile(null);
        return;
      }

      if (profile) {
        console.log('✅ Profile loaded successfully:', profile.role);
        // Set the complete profile data from database
        setProfile(profile);
      } else {
        console.log('⚠️ No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ Profile fetch exception:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('🔄 Manual profile refresh for user:', user.id);
      await fetchProfile(user.id);
    } else {
      console.log('❌ Cannot refresh profile: no user ID');
    }
  };

  const resetAuthState = () => {
    console.log('🔄 Resetting auth state...');
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  const forceRefreshProfile = async () => {
    console.log('🔄 Force refreshing profile...');
    if (user?.id) {
      setLoading(true);
      await fetchProfile(user.id);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 AuthProvider initializing...');
    console.log('🔗 Checking Supabase client...');
    
    // Check localStorage for existing session
    try {
      const storedSession = localStorage.getItem('sb-objcklmxfnnsveqhsrok-auth-token');
      console.log('💾 Stored session exists:', !!storedSession);
      if (storedSession) {
        console.log('💾 Stored session preview:', storedSession.substring(0, 100) + '...');
      }
    } catch (error) {
      console.log('❌ Error checking localStorage:', error);
    }
    
    // Always set loading to false after maximum 5 seconds
    const maxLoadingTimeout = setTimeout(() => {
      console.log('⏰ Maximum loading time reached, forcing loading to false');
      setLoading(false);
    }, 5000);

    const initializeAuth = async () => {
      try {
        console.log('🚀 Getting initial session...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📋 Session result:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          error: error?.message 
        });
        
        if (error) {
          console.error('❌ Initial session error:', error);
          setLoading(false);
          clearTimeout(maxLoadingTimeout);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('👤 User found, fetching profile...');
          await fetchProfile(session.user.id);
        } else {
          console.log('👻 No user in session');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        console.log('✅ Auth initialization complete');
        setLoading(false);
        clearTimeout(maxLoadingTimeout);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, { hasSession: !!session, hasUser: !!session?.user });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          console.log('✅ User signed in, fetching profile...');
          setLoading(true);
          await fetchProfile(session.user.id);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setProfile(null);
        }
      }
    );

    return () => {
      clearTimeout(maxLoadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Add a recovery mechanism for stuck auth states
  useEffect(() => {
    if (user && !profile && !loading) {
      console.log('🔄 Recovery: User exists but no profile loaded, attempting immediate recovery...');
      const recoveryTimeout = setTimeout(async () => {
        console.log('🔄 Executing recovery profile fetch...');
        setLoading(true);
        await fetchProfile(user.id);
        setLoading(false);
      }, 500); // Reduced from 2000ms to 500ms for faster recovery

      return () => clearTimeout(recoveryTimeout);
    }
  }, [user, profile, loading]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: Database['public']['Enums']['user_role']) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          role: role
        }
      }
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const signOut = async () => {
    console.log('👋 Signing out...');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile,
    forceRefreshProfile,
    resetAuthState
  };

  return (
    <AuthContext.Provider value={value}>
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