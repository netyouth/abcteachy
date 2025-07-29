import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import { NotFound } from '@/pages/NotFound';
import { LoginForm } from '@/components/auth/LoginForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { RoleDebug } from '@/components/debug/RoleDebug';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@supabase/supabase-js';

interface SimpleProfile {
  id: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
  updated_at: string;
}

// Simple direct dashboard component that bypasses AuthContext issues
function DirectDashboard() {
  const [directProfile, setDirectProfile] = useState<SimpleProfile | null>(null);
  const [directUser, setDirectUser] = useState<User | null>(null);
  const [directLoading, setDirectLoading] = useState(true);

  useEffect(() => {
    const loadDirectProfile = async () => {
      try {
        console.log('🔄 DirectDashboard: Getting session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          console.log('❌ DirectDashboard: No session, redirecting to login');
          setDirectLoading(false);
          return;
        }

        setDirectUser(session.user);
        console.log('👤 DirectDashboard: Found user, fetching profile...');

        // Direct profile fetch without AuthContext
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, role, created_at, updated_at')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('❌ DirectDashboard: Profile fetch failed:', profileError);
        } else if (profile) {
          console.log('✅ DirectDashboard: Profile loaded:', profile.role);
          setDirectProfile(profile);
        }
      } catch (error) {
        console.error('❌ DirectDashboard: Exception:', error);
      } finally {
        setDirectLoading(false);
      }
    };

    loadDirectProfile();
  }, []);

  if (directLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!directUser) {
    return <LoginForm />;
  }

  if (!directProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto">
          <div className="text-destructive mb-4 text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold mb-4">Unable to load your profile</h2>
          <p className="text-muted-foreground mb-6">
            Profile fetch failed with direct method.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate dashboard
  switch (directProfile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <StudentDashboard />;
  }
}

function DashboardPage() {
  const { profile, user, loading, resetAuthState, forceRefreshProfile } = useAuth();

  console.log('🔍 DashboardPage render:', {
    hasUser: !!user,
    hasProfile: !!profile,
    role: profile?.role,
    loading,
    userId: user?.id,
    userEmail: user?.email
  });

  // If AuthContext is stuck, use direct method
  if (user && !profile && !loading) {
    console.log('🔄 Switching to DirectDashboard to bypass AuthContext issues...');
    return <DirectDashboard />;
  }

  if (loading) {
    console.log('🔄 Dashboard: Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ Dashboard: No user found, redirecting to login');
    return <LoginForm />;
  }

  // If we have a user but no profile after loading is done, something went wrong
  if (!profile) {
    console.log('⚠️ Dashboard: User exists but no profile loaded');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto">
          <div className="text-destructive mb-4 text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold mb-4">Unable to load your profile</h2>
          <p className="text-muted-foreground mb-6">
            We found your account but couldn't load your profile information.
          </p>
          <div className="space-y-3">
            <button
              onClick={async () => {
                console.log('🔄 Manual refresh attempt...');
                await forceRefreshProfile();
              }}
              className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                console.log('🔄 Resetting auth state...');
                resetAuthState();
                window.location.href = '/';
              }}
              className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            >
              Go to Home
            </button>
            <button
              onClick={() => window.location.href = '/debug'}
              className="w-full px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/90"
            >
              Debug Info
            </button>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">
            <details>
              <summary className="cursor-pointer">Technical Details</summary>
              <div className="mt-2 text-left bg-muted p-2 rounded">
                <div>User ID: {user?.id}</div>
                <div>Email: {user?.email}</div>
                <div>Loading: {loading.toString()}</div>
                <div>Profile: {profile ? 'Found' : 'Missing'}</div>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Role-based dashboard rendering
  console.log(`✅ Dashboard: Rendering ${profile.role} dashboard`);
  switch (profile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      console.log('❓ Dashboard: Unknown role, defaulting to student');
      return <StudentDashboard />;
  }
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Index />} />
      
      {/* Public login page */}
      <Route path="/login" element={<LoginForm />} />
      
      {/* Protected admin route - keep this one protected */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute 
            allowedRoles={['admin']} 
            requireAuth={true}
          >
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Dashboard route - remove strict role checking, handle internally */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute 
            requireAuth={true}
            /* No allowedRoles - let DashboardPage handle role logic */
          >
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Debug route for role testing */}
      <Route path="/debug" element={<RoleDebug />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <AuthProvider>
    <Toaster />
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App; 