import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'teacher' | 'student';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Get user role from JWT custom claims (from custom access token hook)
  const getRoleFromJWT = (session: any): UserRole | null => {
    try {
      if (!session?.access_token) {
        return null;
      }

      // Parse JWT payload to get custom claims
      const payload = JSON.parse(atob(session.access_token.split('.')[1]));
      const role = payload.role as UserRole;
      
      return role || null;
    } catch (err) {
      console.warn('Error parsing JWT for role:', err);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session and role
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const sessionUser = session?.user ?? null;
      
      console.log('🔄 Initial session:', sessionUser?.email || 'None');
      setUser(sessionUser);
      
      if (sessionUser && session) {
        const userRole = getRoleFromJWT(session);
        setRole(userRole);
        console.log('👤 User role loaded from JWT:', userRole);
      } else {
        setRole(null);
      }
      
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const sessionUser = session?.user ?? null;
        console.log('🔄 Auth change:', event, sessionUser?.email || 'None');
        
        setUser(sessionUser);
        
        if (sessionUser && session) {
          const userRole = getRoleFromJWT(session);
          setRole(userRole);
          console.log('👤 User role updated from JWT:', userRole);
        } else {
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    role,
    loading,
    signIn,
    signUp,
    signOut
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