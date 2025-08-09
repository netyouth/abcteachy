-- Simplify RBAC: Remove complex permission system and use simple roles
-- This migration removes the over-engineered RBAC system and simplifies to 3-role system

-- Drop complex RBAC tables that aren't being used by frontend
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop complex permission enums
DROP TYPE IF EXISTS public.app_permission CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Drop complex authorization functions
DROP FUNCTION IF EXISTS public.authorize(required_permission public.app_permission) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_permissions() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.custom_access_token_hook(event json) CASCADE;

-- Keep simple user_role enum (this is actually used)
-- user_role enum already exists and is used in profiles table

-- Simplify get_current_user_role to just return profile role
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
  -- Simple role lookup from profiles table
  SELECT role::text INTO user_role_result 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role_result, 'student');
END;
$$;

-- Simplify is_admin function
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

-- Keep simple admin dashboard function but remove permission complexity
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSON;
  user_stats JSON;
  recent_users JSON;
  recent_activity JSON;
BEGIN
  -- Only allow admins to call this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Get user statistics
  SELECT json_build_object(
    'totalUsers', COUNT(*),
    'adminCount', COUNT(*) FILTER (WHERE role = 'admin'),
    'teacherCount', COUNT(*) FILTER (WHERE role = 'teacher'), 
    'studentCount', COUNT(*) FILTER (WHERE role = 'student'),
    'activeConversations', 0, -- Simplified for now
    'totalMessages', 0, -- Simplified for now
    'systemStatus', 'good'
  ) INTO user_stats
  FROM public.profiles;

  -- Get recent users (last 10)
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', id,
      'full_name', full_name,
      'role', role,
      'avatar_url', avatar_url,
      'created_at', created_at,
      'updated_at', updated_at
    )
  ), '[]'::json) INTO recent_users
  FROM (
    SELECT id, full_name, role, avatar_url, created_at, updated_at
    FROM public.profiles 
    ORDER BY created_at DESC 
    LIMIT 10
  ) recent;

  -- Create simple activity from user registrations
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', 'user-' || id,
      'type', 'user_registered',
      'description', full_name || ' registered as ' || role,
      'timestamp', created_at,
      'user', json_build_object(
        'full_name', full_name,
        'role', role
      )
    )
  ), '[]'::json) INTO recent_activity
  FROM (
    SELECT id, full_name, role, created_at
    FROM public.profiles 
    ORDER BY created_at DESC 
    LIMIT 10
  ) activity;

  -- Build final result
  SELECT json_build_object(
    'stats', user_stats,
    'recentUsers', recent_users,
    'recentActivity', recent_activity
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_data() TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.get_current_user_role() IS 
'Simple function that returns user role from profiles table';

COMMENT ON FUNCTION public.is_admin() IS 
'Simple function that checks if current user has admin role';

COMMENT ON FUNCTION public.get_admin_dashboard_data() IS 
'Simple admin dashboard data aggregation function';

-- Log the cleanup
DO $$ 
BEGIN 
  RAISE NOTICE 'RBAC system simplified successfully - removed complex permission system';
END $$;