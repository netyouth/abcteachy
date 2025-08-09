// ⚠️  SECURITY WARNING: ADMIN CLIENT WITH SERVICE ROLE KEY
// 
// This file contains the Supabase service role key which has FULL DATABASE ACCESS.
// 
// IMPORTANT SECURITY CONSIDERATIONS:
// 1. This key bypasses ALL Row Level Security (RLS) policies
// 2. This key has read/write access to ALL tables
// 3. This key should NEVER be exposed to client-side code in production
// 4. This key should ONLY be used in secure server-side environments
// 
// FOR PRODUCTION:
// - Move this to environment variables
// - Use Edge Functions or API routes instead of client-side admin operations
// - Consider using more restricted service role keys
// 
// This is acceptable for development/demo purposes but needs security review for production.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://objcklmxfnnsveqhsrok.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamNrbG14Zm5uc3ZlcWhzcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY4NjI1NiwiZXhwIjoyMDY5MjYyMjU2fQ.remwy5eTrZgoLv1XWmguP7O3ZCGKMBLsLkxZRjDZzds";

// This client has FULL admin privileges - use with extreme caution
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to create a user with admin privileges
// This will auto-confirm the user's email and create their profile
export async function createUserAsAdmin(
  email: string, 
  password: string, 
  fullName: string, 
  role: 'student' | 'teacher' | 'admin' = 'student'
) {
  try {
    console.log(`Creating user with admin privileges: ${email} (${role})`);
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email - no verification needed
      user_metadata: {
        full_name: fullName,
        role: role
      }
    });

    if (error) {
      console.error('Admin user creation failed:', error);
      throw error;
    }
    
    console.log('User created successfully with admin privileges');

    // Ensure a profiles row exists for this user so they show up in lists
    if (data?.user?.id) {
      const profilePayload = {
        id: data.user.id,
        full_name: fullName,
        role: role,
      } as const;
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });
      if (profileError) {
        console.warn('Profile upsert failed (non-fatal):', profileError);
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception in createUserAsAdmin:', error);
    return { data: null, error };
  }
} 