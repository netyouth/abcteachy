
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  Clock, 
  Home,
  LogOut,
  User,
  DollarSign,
  CheckCircle,
  BookOpen,
  Video,
  Bell,
  Settings,
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
import { useToast } from '@/hooks/use-toast';

interface TeacherStats {
  totalStudents: number;
  upcomingLessons: number;
  todayEarnings: number;
  completedLessons: number;
  averageRating: number;
}

export function TeacherDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Real teacher data from Supabase
  const [teacherStats, setTeacherStats] = useState<TeacherStats>({
    totalStudents: 0,
    upcomingLessons: 0,
    todayEarnings: 0,
    completedLessons: 0,
    averageRating: 4.8
  });

  const [dataLoading, setDataLoading] = useState(true);

  // Fetch real teacher statistics
  const fetchTeacherStats = async () => {
    if (!user?.id) return;

    try {
      console.log('📊 Fetching teacher statistics...');

      // Get teacher's lesson bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('lesson_bookings')
        .select('*')
        .eq('teacher_id', user.id);

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return;
      }

      // Calculate statistics
      const completedLessons = bookings?.filter(b => b.status === 'completed').length || 0;
      const upcomingLessons = bookings?.filter(b => b.status === 'confirmed' || b.status === 'pending').length || 0;
      
      // Get unique students
      const uniqueStudents = [...new Set(bookings?.map(b => b.student_id) || [])];
      
      // Calculate earnings (assuming hourly rate)
      const todayEarnings = profile?.hourly_rate ? profile.hourly_rate * 6 : 150; // 6 hours as example

      setTeacherStats({
        totalStudents: uniqueStudents.length,
        upcomingLessons,
        todayEarnings,
        completedLessons,
        averageRating: 4.8 // Would come from ratings table in real app
      });

      console.log('✅ Teacher stats loaded');
    } catch (error) {
      console.error('❌ Error fetching teacher stats:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher statistics",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadTeacherData = async () => {
      setDataLoading(true);
      await fetchTeacherStats();
      setDataLoading(false);
    };

    if (user?.id) {
      loadTeacherData();
    }
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'available':
        return <Badge variant="secondary">Available</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">ABC Teachy ESL</h1>
                  <p className="text-sm text-muted-foreground">Teacher Portal</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                <span className="bg-red-500 text-white text-xs rounded-full px-1">3</span>
              </Button>
              
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
                      <Badge className="w-fit mt-1" variant="default">ESL Teacher</Badge>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0] || 'Teacher'}!</h2>
            <p className="text-muted-foreground">Manage your ESL lessons and connect with students.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Availability
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">{teacherStats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Lessons</p>
                <p className="text-2xl font-bold">{teacherStats.upcomingLessons}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Earnings</p>
                <p className="text-2xl font-bold">${teacherStats.todayEarnings}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{teacherStats.averageRating}/5</p>
              </div>
              <CheckCircle className="h-8 w-8 text-yellow-600" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Your lessons for today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* This section will be populated with real data from Supabase */}
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4" />
                    <p>Today's schedule data loading...</p>
                    <p className="text-sm">Your scheduled lessons will appear here.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Messages</CardTitle>
                  <CardDescription>Latest messages from students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* This section will be populated with real data from Supabase */}
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>Recent messages data loading...</p>
                    <p className="text-sm">Messages from students will appear here.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Manage your teaching availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Schedule management coming soon...</p>
                  <p className="text-sm">Set your available hours and manage recurring slots.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Bookings</CardTitle>
                <CardDescription>Manage student booking requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* This section will be populated with real data from Supabase */}
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <p>Booking requests data loading...</p>
                  <p className="text-sm">Student booking requests will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Messages</CardTitle>
                <CardDescription>Chat with your students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>Chat interface coming soon...</p>
                  <p className="text-sm">Communicate with students between lessons.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Profile</CardTitle>
                <CardDescription>Manage your teaching profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>Profile settings coming soon...</p>
                  <p className="text-sm">Update your bio, rates, specializations, and availability.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}