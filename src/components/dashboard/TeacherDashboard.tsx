import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  LogOut, 
  Plus,
  GraduationCap,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock4
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SimpleChat } from '@/components/SimpleChat';
import TeacherScheduleUnified from '@/components/dashboard/TeacherScheduleUnified';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardThemeScope } from '@/components/dashboard/DashboardThemeScope';
import { ModeToggle } from '@/components/ModeToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookings } from '@/hooks/useBookings';

export function TeacherDashboard() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const supabase = createClient();
  const [studentsCount, setStudentsCount] = useState<number | null>(null);
  const [messagesCount, setMessagesCount] = useState<number | null>(null);
  const [upcomingCount, setUpcomingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Fetch upcoming bookings for overview
  const { bookings: upcomingBookings, loading: bookingsLoading } = useBookings(
    user?.id ? { teacherId: user.id } : undefined
  );
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Teacher';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const loadCounts = async () => {
    setLoading(true);
    // Count available students
    const { count: students } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student');

    // Count messages in rooms the teacher is a participant of (RLS enforced)
    const { count: msgs } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true });

    // Count upcoming bookings (next 7 days) using direct select (RLS permits teacher access)
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    let upcoming = 0;
    if (user?.id) {
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('teacher_id', user.id)
        .gte('start_at', now.toISOString())
        .lt('start_at', sevenDays.toISOString());
      upcoming = count ?? 0;
    }

    setStudentsCount(students ?? 0);
    setMessagesCount(msgs ?? 0);
    setUpcomingCount(upcoming ?? 0);
    setLoading(false);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    loadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get today's and next 7 days bookings (excluding cancelled)
  const todaysAndUpcomingBookings = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return upcomingBookings
      .filter(booking => {
        const bookingDate = new Date(booking.start_at);
        return bookingDate >= today && 
               bookingDate < sevenDaysFromNow && 
               booking.status !== 'canceled';
      })
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
      .slice(0, 5); // Show only next 5 bookings
  }, [upcomingBookings]);

  const statusIcons = {
    pending: AlertCircle,
    confirmed: CheckCircle,
    canceled: XCircle,
    completed: Clock4,
    rescheduled: Clock
  };

  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    confirmed: 'text-green-600 bg-green-50 border-green-200',
    canceled: 'text-red-600 bg-red-50 border-red-200',
    completed: 'text-blue-600 bg-blue-50 border-blue-200',
    rescheduled: 'text-orange-600 bg-orange-50 border-orange-200'
  };

  const kpi = useMemo(() => ([
    { label: 'Available Students', value: studentsCount, icon: Users },
    { label: 'Messages', value: messagesCount, icon: MessageCircle },
    { label: 'Upcoming (7d)', value: upcomingCount, icon: Calendar },
  ]), [studentsCount, messagesCount, upcomingCount]);

  return (
    <DashboardThemeScope>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
        <header className="bg-background/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-duolingo-heading text-foreground">Teacher Portal</h1>
                  <p className="text-sm font-duolingo-body text-muted-foreground">Welcome back, {userName}!</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Refresh dashboard"
                  onClick={loadCounts}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <ModeToggle />
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{role}</Badge>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="flex flex-wrap gap-2">
                <TabsTrigger value="overview" className="flex items-center gap-2" data-value="overview">
                  <GraduationCap className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center gap-2" data-value="students">
                  <Users className="h-4 w-4" />
                  <span>My Students</span>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2" data-value="schedule">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule & Bookings</span>
                </TabsTrigger>
                
                <TabsTrigger value="messages" className="flex items-center gap-2" data-value="messages">
                  <MessageCircle className="h-4 w-4" />
                  <span>Messages</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Loading...'}
                  </div>
                  {!loading && (
                    <Button size="sm" variant="outline" onClick={loadCounts}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {kpi.map(({ label, value, icon: Icon }) => (
                    <Card key={label} className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{label}</CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <Skeleton className="h-8 w-16 mb-1" />
                        ) : (
                          <div className="text-2xl font-bold">{value ?? '—'}</div>
                        )}
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Bookings
                      </CardTitle>
                      <CardDescription>Your next scheduled lessons</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {bookingsLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-16" />
                          ))}
                        </div>
                      ) : todaysAndUpcomingBookings.length === 0 ? (
                        <div className="text-center py-6">
                          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-muted-foreground">No upcoming bookings</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {todaysAndUpcomingBookings.map((booking) => {
                            const StatusIcon = statusIcons[booking.status as keyof typeof statusIcons] || AlertCircle;
                            const isToday = new Date(booking.start_at).toDateString() === new Date().toDateString();
                            
                            return (
                              <div key={booking.id} className={`flex items-center justify-between rounded-lg border p-3 ${statusColors[booking.status as keyof typeof statusColors]}`}>
                                <div className="flex items-center space-x-3">
                                  <div className="p-1.5 rounded-full bg-white/50">
                                    <StatusIcon className="h-3 w-3" />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      {isToday ? 'Today' : new Date(booking.start_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(booking.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <Badge variant="outline" className="text-xs h-5">
                                      {booking.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {todaysAndUpcomingBookings.length < upcomingBookings.length && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => {
                                const scheduleTab = document.querySelector('[data-value="schedule"]') as HTMLElement;
                                scheduleTab?.click();
                              }}
                            >
                              View all {upcomingBookings.length} bookings
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Get started with common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <Button className="w-full justify-start transition-all duration-200 hover:scale-[1.02]" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Class
                      </Button>
                      <Button className="w-full justify-start transition-all duration-200 hover:scale-[1.02]" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Students
                      </Button>
                      <Button 
                        className="w-full justify-start transition-all duration-200 hover:scale-[1.02]" 
                        variant="outline"
                        onClick={() => {
                          const scheduleTab = document.querySelector('[data-value="schedule"]') as HTMLElement;
                          scheduleTab?.click();
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule & Bookings
                      </Button>
                      <Button 
                        className="w-full justify-start transition-all duration-200 hover:scale-[1.02]" 
                        variant="outline"
                        onClick={() => {
                          const messagesTab = document.querySelector('[data-value="messages"]') as HTMLElement;
                          messagesTab?.click();
                        }}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Messages
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Students</CardTitle>
                    <CardDescription>
                      Students enrolled in your classes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No students yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Students will appear here once they enroll in your classes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <TeacherScheduleUnified />
              </TabsContent>

              <TabsContent value="messages" className="space-y-4">
                <Card className="border-dashed border-muted">
                  <CardHeader>
                    <CardTitle className="text-base text-muted-foreground">
                      Chat privately with your students. Your conversations are saved and sync across devices.
                    </CardTitle>
                  </CardHeader>
                </Card>
                <SimpleChat className="h-[calc(100vh-340px)] min-h-[560px]" />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </DashboardThemeScope>
  );
}