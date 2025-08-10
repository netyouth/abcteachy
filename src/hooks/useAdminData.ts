import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface AdminStats {
  totalUsers: number;
  adminCount: number;
  teacherCount: number;
  studentCount: number;
  activeConversations: number;
  totalMessages: number;
  systemStatus: 'good' | 'warning' | 'error';
  totalBookings?: number;
  canceledBookings?: number;
  completedBookings?: number;
  activeBookingsToday?: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_registered' | 'message_sent' | 'conversation_started';
  description: string;
  timestamp: string;
  user?: {
    full_name: string;
    role: string;
  };
}

export interface AdminUser extends Tables<'profiles'> {
  // Add any additional fields we might need
}

interface AdminDashboardResponse {
  stats: {
    totalUsers: number;
    adminCount: number;
    teacherCount: number;
    studentCount: number;
    activeConversations: number;
    totalMessages: number;
    systemStatus: string;
  };
  recentUsers: AdminUser[];
  recentActivity: RecentActivity[];
}

export function useAdminData() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    adminCount: 0,
    teacherCount: 0,
    studentCount: 0,
    activeConversations: 0,
    totalMessages: 0,
    systemStatus: 'good',
    totalBookings: 0,
    canceledBookings: 0,
    completedBookings: 0,
    activeBookingsToday: 0,
  });
  
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      console.log('🔍 Fetching admin dashboard data...');

      // Use the simplified server-side function
      const { data, error } = await supabase.rpc('get_admin_dashboard_data');

      if (error) {
        console.error('RPC function failed:', error);
        // Fall back to individual queries if the RPC fails
        console.log('Falling back to individual queries...');
        await fetchDataIndividually();
        return;
      }

      if (data) {
        const dashboardData = data as unknown as AdminDashboardResponse;
        
        // Update stats
        setStats({
          totalUsers: dashboardData.stats.totalUsers || 0,
          adminCount: dashboardData.stats.adminCount || 0,
          teacherCount: dashboardData.stats.teacherCount || 0,
          studentCount: dashboardData.stats.studentCount || 0,
          activeConversations: dashboardData.stats.activeConversations || 0,
          totalMessages: dashboardData.stats.totalMessages || 0,
          systemStatus: dashboardData.stats.systemStatus as AdminStats['systemStatus'] || 'good'
        });

        // Fetch booking-related stats (counts) separately so the overview can show them
        await fetchBookingStats();

        // Update recent users
        setRecentUsers(dashboardData.recentUsers || []);

        // Update recent activity
        setRecentActivity(dashboardData.recentActivity || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      // Try individual queries as fallback
      console.log('Falling back to individual queries due to error...');
      await fetchDataIndividually();
    }
  };

  // Helper to get today's start/end in ISO (UTC)
  const getTodayRangeIso = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { startIso: start.toISOString(), endIso: end.toISOString() };
  };

  // Fetch booking counts used on the admin overview
  const fetchBookingStats = async () => {
    try {
      let totalBookings = 0;
      let canceledBookings = 0;
      let completedBookings = 0;
      let activeBookingsToday = 0;

      const { count: total } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true });
      totalBookings = total || 0;

      const { count: canceled } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'canceled');
      canceledBookings = canceled || 0;

      const { count: completed } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed');
      completedBookings = completed || 0;

      const { startIso, endIso } = getTodayRangeIso();
      const { count: todayActive } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .gte('start_at', startIso)
        .lt('start_at', endIso)
        .neq('status', 'canceled');
      activeBookingsToday = todayActive || 0;

      setStats(prev => ({
        ...prev,
        totalBookings,
        canceledBookings,
        completedBookings,
        activeBookingsToday,
      }));
    } catch (e) {
      // Silently ignore; leave defaults
    }
  };

  const fetchDataIndividually = async () => {
    try {
      console.log('Fetching data with individual queries...');
      
      // Try to fetch basic stats first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('role, created_at, full_name, id, avatar_url, updated_at')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      console.log('Profiles fetched successfully:', profiles?.length || 0);

      // Count roles
      const roleCount = (profiles || []).reduce(
        (acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        },
        { admin: 0, teacher: 0, student: 0 } as Record<string, number>
      );

      // Set basic stats
      setStats({
        totalUsers: profiles?.length || 0,
        adminCount: roleCount.admin || 0,
        teacherCount: roleCount.teacher || 0,
        studentCount: roleCount.student || 0,
        activeConversations: 0, // We'll update this separately
        totalMessages: 0, // We'll update this separately
        systemStatus: 'good',
        totalBookings: 0,
        canceledBookings: 0,
        completedBookings: 0,
      });

      // Set recent users
      setRecentUsers(profiles?.slice(0, 10) || []);

      // Try to fetch conversations and messages (these might fail due to RLS)
      try {
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id');
        
        const { data: messages } = await supabase
          .from('messages')
          .select('id');

        // Bookings counts (may fail if policies restrict)
        let totalBookings = 0;
        let canceledBookings = 0;
        let completedBookings = 0;
        let activeBookingsToday = 0;
        try {
          const { count: total } = await supabase
            .from('bookings')
            .select('id', { count: 'exact', head: true });
          totalBookings = total || 0;
          const { count: canceled } = await supabase
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'canceled');
          canceledBookings = canceled || 0;
          const { count: completed } = await supabase
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'completed');
          completedBookings = completed || 0;

          const { startIso, endIso } = getTodayRangeIso();
          const { count: todayActive } = await supabase
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .gte('start_at', startIso)
            .lt('start_at', endIso)
            .neq('status', 'canceled');
          activeBookingsToday = todayActive || 0;
        } catch (e) {
          // ignore
        }

        setStats(prev => ({
          ...prev,
          activeConversations: conversations?.length || 0,
          totalMessages: messages?.length || 0,
          totalBookings,
          canceledBookings,
          completedBookings,
          activeBookingsToday,
        }));
      } catch (convError) {
        console.warn('Could not fetch conversations/messages:', convError);
        // This is expected if RLS blocks access, stats will show 0
      }

      // Create simple recent activity from profiles
      const activities: RecentActivity[] = (profiles || [])
        .slice(0, 10)
        .map(profile => ({
          id: `profile-${profile.created_at}`,
          type: 'user_registered' as const,
          description: `${profile.full_name} registered as ${profile.role}`,
          timestamp: profile.created_at,
          user: {
            full_name: profile.full_name,
            role: profile.role
          }
        }));

      setRecentActivity(activities);

    } catch (err) {
      console.error('Individual queries also failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      setStats(prev => ({ ...prev, systemStatus: 'error' }));
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    await fetchAllData();
    
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    stats,
    recentUsers,
    recentActivity,
    loading,
    error,
    refreshData
  };
}