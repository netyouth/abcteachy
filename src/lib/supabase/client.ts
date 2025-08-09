// Use the same Supabase client instance as the main application
// This ensures authentication context is shared properly
import { supabase } from '@/integrations/supabase/client'

export function createClient() {
  // Return the same client instance used by the AuthContext
  // This eliminates authentication context fragmentation
  return supabase
}
