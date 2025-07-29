import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const [profileTimeout, setProfileTimeout] = useState(false);

  // Add a timeout for profile loading
  useEffect(() => {
    if (user && !profile && !loading) {
      console.log('User exists but profile not loaded, starting timeout...');
      const timeout = setTimeout(() => {
        console.log('Profile loading timeout reached');
        setProfileTimeout(true);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [user, profile, loading]);

  console.log('ProtectedRoute state:', { 
    loading, 
    hasUser: !!user, 
    hasProfile: !!profile, 
    profileTimeout,
    userRole: profile?.role,
    allowedRoles,
    requiresRoleCheck: !!allowedRoles
  });

  // Show loading only if initial loading or if we have user but no profile and haven't timed out
  // BUT only if allowedRoles is specified (meaning we need role checking)
  if (loading || (requireAuth && user && !profile && !profileTimeout && allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : 'Loading profile...'}
          </p>
          {user && !profile && !loading && (
            <p className="text-xs text-muted-foreground mt-2">
              If this takes too long, there might be a profile loading issue.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <LoginForm />;
  }

  // If we have a user but no profile and we've timed out, show an error
  // BUT only if allowedRoles is specified (meaning we need role checking)
  if (requireAuth && user && !profile && profileTimeout && allowedRoles) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Profile Loading Error</h1>
          <p className="text-muted-foreground mb-4">
            Unable to load your profile. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Only check roles if allowedRoles is specified
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // If we reach here, allow access
  // - User is authenticated (if requireAuth is true)
  // - Role is allowed (if allowedRoles is specified and profile exists)
  // - OR no role checking required (allowedRoles not specified)
  console.log('ProtectedRoute: Allowing access');
  return <>{children}</>;
}