import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function RoleDebug() {
  const { user, session, profile, loading, forceRefreshProfile, resetAuthState } = useAuth();

  const handleTestRouting = () => {
    console.log('🧪 Testing role routing logic:');
    console.log('User:', user);
    console.log('Session:', session);
    console.log('Profile:', profile);
    console.log('Loading:', loading);
    
    if (loading) {
      console.log('🔄 Still loading...');
    } else if (!user) {
      console.log('❌ No user - should show login');
    } else if (!profile) {
      console.log('⚠️ User exists but no profile - ISSUE HERE!');
    } else {
      console.log(`✅ Role: ${profile.role} - should route to ${profile.role} dashboard`);
    }
  };

  const handleForceRefresh = async () => {
    console.log('🔄 Force refreshing profile...');
    await forceRefreshProfile();
  };

  const handleDirectSupabaseTest = async () => {
    console.log('🧪 Testing direct Supabase connection...');
    
    if (!user?.id) {
      console.log('❌ No user ID to test with');
      return;
    }

    try {
      // Test 1: Simple connection test
      console.log('Test 1: Basic connection...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      console.log('Basic connection result:', { hasData: !!testData, error: testError });

      // Test 2: Try to fetch the specific user profile
      console.log('Test 2: Fetching user profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Profile fetch result:', { 
        hasProfile: !!profileData, 
        error: profileError,
        profile: profileData 
      });

      // Test 3: Try without filtering
      console.log('Test 3: Fetching all profiles...');
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .limit(5);

      console.log('All profiles result:', { 
        count: allProfiles?.length, 
        error: allError,
        profiles: allProfiles 
      });

    } catch (error) {
      console.error('❌ Direct test failed:', error);
    }
  };

  const handleClearAuthState = async () => {
    console.log('🧹 Clearing authentication state...');
    
    // Clear all auth-related localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('supabase') || key.includes('auth')) {
          localStorage.removeItem(key);
          console.log('🗑️ Removed:', key);
        }
      });
      
      // Force reload the page to reinitialize everything
      window.location.reload();
    } catch (error) {
      console.error('❌ Error clearing auth state:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Panel</CardTitle>
          <CardDescription>Debug authentication state and profile loading</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Authentication State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">User State</h3>
              <Badge variant={user ? "default" : "secondary"}>
                {user ? "Authenticated" : "Not Authenticated"}
              </Badge>
              {user && (
                <div className="text-sm text-muted-foreground">
                  <div>ID: {user.id}</div>
                  <div>Email: {user.email}</div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Session State</h3>
              <Badge variant={session ? "default" : "secondary"}>
                {session ? "Active Session" : "No Session"}
              </Badge>
              {session && (
                <div className="text-sm text-muted-foreground">
                  <div>Access Token: {session.access_token ? 'Present' : 'Missing'}</div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Profile State</h3>
              <Badge variant={profile ? "default" : "destructive"}>
                {profile ? "Profile Loaded" : "Profile Missing"}
              </Badge>
              {profile && (
                <div className="text-sm text-muted-foreground">
                  <div>Name: {profile.full_name}</div>
                  <div>Role: {profile.role}</div>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          <div>
            <h3 className="font-medium mb-2">Loading State</h3>
            <Badge variant={loading ? "destructive" : "default"}>
              {loading ? "Loading..." : "Loaded"}
            </Badge>
          </div>

          {/* Profile Data */}
          {profile && (
            <div>
              <h3 className="font-medium mb-2">Profile Details</h3>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleTestRouting}>
              Test Routing Logic
            </Button>
            <Button onClick={handleForceRefresh} variant="outline">
              Force Refresh Profile
            </Button>
            <Button onClick={resetAuthState} variant="secondary">
              Reset Auth State
            </Button>
            <Button onClick={handleDirectSupabaseTest} variant="outline">
              Direct Supabase Test
            </Button>
            <Button onClick={handleClearAuthState} variant="destructive">
              Clear Auth State & Reload
            </Button>
          </div>

          {/* Issue Analysis */}
          {user && !profile && !loading && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h3 className="font-medium text-red-800 mb-2">🚨 Issue Detected</h3>
              <p className="text-red-700 text-sm">
                User is authenticated but profile is not loading. This indicates:
              </p>
              <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                <li>Database query might be failing</li>
                <li>RLS policies might be blocking access</li>
                <li>Profile might not exist in database</li>
                <li>Client-side query error</li>
                <li>Cached auth state corruption</li>
              </ul>
              <p className="text-red-700 text-sm mt-2">
                <strong>Try:</strong> "Clear Auth State & Reload" button above to reset everything.
              </p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
} 