
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  GraduationCap, 
  UserPlus, 
  TrendingUp, 
  Home,
  LogOut,
  User,
  Calendar,
  MessageCircle,
  BookOpen,
  DollarSign,
  Settings,
  Shield,
  AlertTriangle,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminUserCreationForm } from './AdminUserCreationForm';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  newUsersThisMonth: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
}

interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
  avatar_url?: string;
}

interface RecentBooking {
  id: string;
  student_name: string;
  teacher_name: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  lesson_topic?: string;
}

export function AdminDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Real data from Supabase
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    newUsersThisMonth: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0
  });
  
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch real data from Supabase
  const fetchUserStats = async () => {
    try {
      console.log('📊 Fetching user statistics...');
      
      // Get total users by role
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('role');
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      const roleCounts = profilesData.reduce((acc, profile) => {
        acc[profile.role] = (acc[profile.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get new users this month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const { data: newUsersData, error: newUsersError } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', oneMonthAgo.toISOString());

      // Get booking statistics
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('lesson_bookings')
        .select('status');

      const bookingCounts = bookingsData?.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setUserStats({
        totalUsers: profilesData.length,
        totalStudents: roleCounts.student || 0,
        totalTeachers: roleCounts.teacher || 0,
        totalAdmins: roleCounts.admin || 0,
        newUsersThisMonth: newUsersData?.length || 0,
        totalBookings: bookingsData?.length || 0,
        pendingBookings: bookingCounts.pending || 0,
        completedBookings: bookingCounts.completed || 0
      });

      console.log('✅ User stats loaded:', roleCounts);
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      toast({
        title: "Error",
        description: "Failed to load user statistics",
        variant: "destructive"
      });
    }
  };

  const fetchRecentUsers = async () => {
    try {
      console.log('👥 Fetching recent users...');
      
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          created_at,
          avatar_url
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent users:', error);
        return;
      }

      // Get emails from auth.users (need to join manually due to RLS)
      const userIds = usersData.map(u => u.id);
      const { data: authData } = await supabase
        .from('profiles')
        .select('id')
        .in('id', userIds);

      const recentUsersWithEmails: RecentUser[] = usersData.map(user => ({
        ...user,
        email: `user-${user.id.slice(0, 8)}@abcteachy.com`, // Simplified for demo
        avatar_url: user.avatar_url || undefined
      }));

      setRecentUsers(recentUsersWithEmails);
      console.log('✅ Recent users loaded:', recentUsersWithEmails.length);
    } catch (error) {
      console.error('❌ Error fetching recent users:', error);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      console.log('📅 Fetching recent bookings...');
      
      // Simplified query to avoid relationship conflicts
      const { data: bookingsData, error } = await supabase
        .from('lesson_bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent bookings:', error);
        return;
      }

      // Fetch student and teacher names separately to avoid join issues
      const formattedBookings: RecentBooking[] = [];
      
      for (const booking of bookingsData) {
        const { data: studentData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', booking.student_id)
          .single();
          
        const { data: teacherData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', booking.teacher_id)
          .single();

        formattedBookings.push({
          id: booking.id,
          student_name: studentData?.full_name || 'Unknown Student',
          teacher_name: teacherData?.full_name || 'Unknown Teacher',
          scheduled_at: new Date(booking.scheduled_at).toLocaleDateString(),
          duration_minutes: booking.duration_minutes,
          status: booking.status,
          lesson_topic: booking.lesson_topic || undefined
        });
      }

      setRecentBookings(formattedBookings);
      console.log('✅ Recent bookings loaded:', formattedBookings.length);
    } catch (error) {
      console.error('❌ Error fetching recent bookings:', error);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setDataLoading(true);
      await Promise.all([
        fetchUserStats(),
        fetchRecentUsers(),
        fetchRecentBookings()
      ]);
      setDataLoading(false);
    };

    loadDashboardData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'teacher':
        return 'default' as const;
      case 'student':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/a48522f4-db07-475a-b8dc-96da5a16426a.png"
              alt="ABC Teachy Logo"
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">ABC Teachy Management Portal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleGoHome}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <Badge className="w-fit mt-1" variant="destructive">Administrator</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0] || 'Admin'}</h2>
            <p className="text-muted-foreground">Here's what's happening in your ABC Teachy platform today.</p>
          </div>
          <Button onClick={fetchUserStats} disabled={loading}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{loading ? '...' : userStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{loading ? '...' : userStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Active learners</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? '...' : userStats.totalTeachers}</div>
              <p className="text-xs text-muted-foreground">Educators</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{loading ? '...' : userStats.totalAdmins}</div>
              <p className="text-xs text-muted-foreground">System administrators</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="create">Create User</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest user registrations and activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                  ) : recentUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No users found</div>
                  ) : (
                    recentUsers.map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url} alt={user.full_name} />
                            <AvatarFallback>{user.full_name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{user.full_name}</h4>
                            <p className="text-sm text-muted-foreground">Joined {formatDate(user.created_at)}</p>
                          </div>
                        </div>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-20 flex-col" onClick={() => setActiveTab('create')}>
                      <Plus className="h-6 w-6 mb-2" />
                      Create User
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab('users')}>
                      <Users className="h-6 w-6 mb-2" />
                      Manage Users
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Shield className="h-6 w-6 mb-2" />
                      Security
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab('settings')}>
                      <Settings className="h-6 w-6 mb-2" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Complete list of registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                  ) : recentUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No users found</div>
                  ) : (
                    recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url} alt={user.full_name} />
                            <AvatarFallback>{user.full_name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{user.full_name}</h4>
                            <p className="text-sm text-muted-foreground">Joined {formatDate(user.created_at)}</p>
                            <Badge className="mt-1" variant={getRoleBadgeVariant(user.role)}>
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <AdminUserCreationForm />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure your ABC Teachy platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  System settings panel coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}