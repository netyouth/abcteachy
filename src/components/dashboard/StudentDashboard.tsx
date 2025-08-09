import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, MessageCircle, Home, LogOut, Calendar, GraduationCap, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SimpleChat } from '@/components/SimpleChat';
import StudentBookingBrowser from '@/components/dashboard/StudentBookingBrowser';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardThemeScope } from '@/components/dashboard/DashboardThemeScope';
import { ModeToggle } from '@/components/ModeToggle';
import { Skeleton } from '@/components/ui/skeleton';

export function StudentDashboard() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const supabase = createClient();
  const [teachersCount, setTeachersCount] = useState<number | null>(null);
  const [messagesCount, setMessagesCount] = useState<number | null>(null);
  const [upcomingCount, setUpcomingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const loadCounts = async () => {
    setLoading(true);
    // Count available teachers
    const { count: teachers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'teacher');

    // Count messages (RLS limits to rooms the student can see)
    const { count: msgs } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true });

    // Count upcoming bookings for student (next 7 days)
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    let upcoming = 0;
    if (user?.id) {
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', user.id)
        .gte('start_at', now.toISOString())
        .lt('start_at', sevenDays.toISOString());
      upcoming = count ?? 0;
    }

    setTeachersCount(teachers ?? 0);
    setMessagesCount(msgs ?? 0);
    setUpcomingCount(upcoming ?? 0);
    setLoading(false);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    loadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpi = useMemo(() => ([
    { label: 'Available Teachers', value: teachersCount, icon: GraduationCap },
    { label: 'Messages', value: messagesCount, icon: MessageCircle },
    { label: 'Upcoming (7d)', value: upcomingCount, icon: Calendar },
  ]), [teachersCount, messagesCount, upcomingCount]);

  return (
    <DashboardThemeScope>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
        <header className="bg-background/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Home className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-duolingo-heading text-foreground">Student Portal</h1>
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
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Courses</span>
                </TabsTrigger>
                <TabsTrigger value="book" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Book a Class</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Next Steps</CardTitle>
                    <CardDescription>Jump back into learning</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Button className="w-full transition-all duration-200 hover:scale-[1.02]" variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Courses
                    </Button>
                    <Button className="w-full transition-all duration-200 hover:scale-[1.02]" variant="outline">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Start Chat
                    </Button>
                    <Button className="w-full transition-all duration-200 hover:scale-[1.02]" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book a Class
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Courses</CardTitle>
                    <CardDescription>
                      Browse and enroll in courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No courses yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Course catalog will be available soon.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat" className="space-y-4">
                <Card className="border-dashed border-muted">
                  <CardHeader>
                    <CardTitle className="text-base text-muted-foreground">
                      Chat privately with your teacher. Conversations are saved and available when you return.
                    </CardTitle>
                  </CardHeader>
                </Card>
                <SimpleChat className="h-[calc(100vh-340px)] min-h-[560px]" />
              </TabsContent>

              <TabsContent value="book" className="space-y-4">
                <StudentBookingBrowser />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </DashboardThemeScope>
  );
}