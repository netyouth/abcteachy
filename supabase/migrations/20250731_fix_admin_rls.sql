-- Fix circular RLS dependency for admin authentication
-- This migration resolves the issue where admin users can't retrieve their profile
-- due to circular dependencies in Row Level Security policies

-- Drop and recreate the get_current_user_role function with proper RLS bypass
DROP FUNCTION IF EXISTS public.get_current_user_role();

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER 
STABLE
SET search_path = 'public'
AS $$
DECLARE
  user_role_result TEXT;
BEGIN
  -- Bypass RLS by using a direct query with security definer privileges
  SELECT role::text INTO user_role_result 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role_result, 'student');
END;
$$;

-- Recreate the is_admin function to work with the fixed role function
DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
BEGIN
  RETURN COALESCE(public.get_current_user_role() = 'admin', false);
END;
$$;

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Create new, cleaner RLS policies that avoid circular dependencies

-- Policy 1: Users can always view their own profile (no function dependency)
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Allow profile creation during signup
CREATE POLICY "Users can create own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile (but not change role)
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = OLD.role);

-- Policy 4: Special admin access - uses security definer function
CREATE POLICY "Admin full access" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Comment explaining the fix
COMMENT ON FUNCTION public.get_current_user_role() IS 
'Security definer function that bypasses RLS to get user role, preventing circular dependencies';

COMMENT ON FUNCTION public.is_admin() IS 
'Security definer function that checks if current user is admin, using the RLS-bypassing role function';