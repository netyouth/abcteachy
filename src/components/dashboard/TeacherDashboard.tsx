import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  LogOut, 
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock4,
  User,
  Search as SearchIcon
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
import { STATUS_BADGE_TONE, listItem } from '@/components/dashboard/ui';
import { useBookings } from '@/hooks/useBookings';

export function TeacherDashboard() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const supabase = createClient();
  // Counts previously used for KPI; removed for simplified Home tab
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'schedule' | 'messages' | 'profile'>('overview');
  
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
    // counts removed
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

  // Map student_id -> full_name for upcoming bookings (load from all upcoming bookings for accuracy)
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  useEffect(() => {
    const loadNames = async () => {
      const ids = Array.from(new Set(
        (upcomingBookings || [])
          .map(b => b.student_id)
          .filter((v): v is string => !!v)
      ));
      if (ids.length === 0) return;
      const map: Record<string, string> = {};
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ids);
        (data || []).forEach((p: any) => { if (p?.id) map[p.id] = p.full_name || 'Student'; });
      } catch {}

      // Fallback for any IDs not returned due to RLS: use RPC per id
      const missing = ids.filter((id) => !map[id]);
      if (missing.length > 0) {
        const results = await Promise.allSettled(
          missing.map(async (id) => {
            const { data } = await supabase.rpc('get_user_profile', { user_id: id });
            const row = Array.isArray(data) ? data[0] : null;
            return { id, name: row?.full_name };
          })
        );
        results.forEach((res) => {
          if (res.status === 'fulfilled' && res.value?.id) {
            map[res.value.id] = res.value.name || 'Student';
          }
        });
      }
      setStudentNames((prev) => ({ ...prev, ...map }));
    };
    loadNames();
  }, [upcomingBookings, supabase]);

  const statusIcons = {
    pending: AlertCircle,
    confirmed: CheckCircle,
    canceled: XCircle,
    completed: Clock4,
    rescheduled: Clock
  };

  // Status tones centralized in STATUS_BADGE_TONE

  // KPI grid removed from Home; keeping counts state for potential future use

  // Aggregate students from bookings (exclude canceled)
  const studentsSummary = useMemo(() => {
    const summary: Record<string, { name: string; total: number; upcoming: number; last: string; next?: string } > = {}
    const now = new Date()
    for (const b of upcomingBookings) {
      if (!b.student_id || b.status === 'canceled') continue
      const id = b.student_id
      const name = studentNames[id] || 'Student'
      const last = summary[id]?.last && new Date(summary[id].last) > new Date(b.start_at) ? summary[id].last : b.start_at
      const upcoming = new Date(b.start_at) >= now ? 1 : 0
      let next = summary[id]?.next
      if (upcoming) {
        next = next && new Date(next) < new Date(b.start_at) ? next : b.start_at
      }
      const prev = summary[id]
      summary[id] = prev
        ? { name, total: prev.total + 1, upcoming: prev.upcoming + upcoming, last, next: next || prev.next }
        : { name, total: 1, upcoming, last, next }
    }
    return summary
  }, [upcomingBookings, studentNames])

  const [studentSearch, setStudentSearch] = useState('')
  const [studentSort, setStudentSort] = useState<'recent' | 'name' | 'upcoming'>('recent')

  const studentsArray = useMemo(() => {
    const list = Object.entries(studentsSummary).map(([id, info]) => ({ id, ...info }))
    const filtered = list.filter((s) => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
    const sorted = filtered.sort((a, b) => {
      if (studentSort === 'name') return a.name.localeCompare(b.name)
      if (studentSort === 'upcoming') return (b.upcoming || 0) - (a.upcoming || 0)
      // recent
      return new Date(b.last).getTime() - new Date(a.last).getTime()
    })
    return sorted
  }, [studentsSummary, studentSearch, studentSort])

  return (
    <DashboardThemeScope>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
        <header className="bg-background/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md"></div>
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary relative z-10" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-duolingo-heading text-foreground truncate">Teacher Portal</h1>
                  <p className="text-xs sm:text-sm font-duolingo-body text-muted-foreground truncate">Welcome back, {userName}!</p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="hidden md:block">
                  <ModeToggle />
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hidden xs:inline-flex">{role}</Badge>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="hidden md:inline-flex transition-all duration-200 hover:scale-105 text-xs sm:text-sm px-2 sm:px-3">
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-3 sm:py-6 px-3 sm:px-6 lg:px-8 pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-6">
          <div className="space-y-4 sm:space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
              <TabsList className="hidden md:grid w-full grid-cols-5 gap-0.5 sm:gap-1 bg-muted/50 p-1 h-auto">
                <TabsTrigger value="overview" className="flex items-center gap-2" data-value="overview">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center gap-2" data-value="students">
                  <Users className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Students</span>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2" data-value="schedule">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Schedule</span>
                </TabsTrigger>
                
                <TabsTrigger value="messages" className="flex items-center gap-2" data-value="messages">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Messages</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2" data-value="profile">
                  <User className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Profile</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Loading...'}
                  </div>
                </div>

            {/* Upcoming bookings at the top for quick glance */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Card className="border-orange-200">
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
                        const studentName = studentNames[booking.student_id as string] || 'Student';
                        
                        return (
                          <div key={booking.id} className={listItem(`flex items-center justify-between p-3`)}>
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 rounded-full bg-white/50">
                                <StatusIcon className="h-3 w-3" />
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm font-medium flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {isToday ? 'Today' : new Date(booking.start_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(booking.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-xs text-muted-foreground">Student: <span className="font-medium capitalize">{studentName}</span></div>
                              </div>
                            </div>
                            <Badge variant="outline" className={`text-xs h-5 capitalize ${STATUS_BADGE_TONE[booking.status] || ''}`}>{booking.status}</Badge>
                          </div>
                        );
                      })}
                      {todaysAndUpcomingBookings.length < upcomingBookings.length && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => setActiveTab('schedule')}
                        >
                          View all bookings
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>


            </div>

                {/* Home tab should only show upcoming bookings; KPI grid removed */}

                
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <Card className="border-orange-200 bg-white">
                  <CardHeader className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Students
                      </CardTitle>
                      <Select value={studentSort} onValueChange={(v) => setStudentSort(v as any)}>
                        <SelectTrigger className="h-9 w-full sm:w-[140px]">
                          <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Recent</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative">
                      <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search" className="pl-8 h-10 bg-background" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {studentsArray.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No students yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Students will appear here once they book a class.</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {studentsArray.map((s) => (
                          <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 hover:bg-primary/5 rounded-md px-2 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>{s.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-medium truncate text-sm sm:text-base">{s.name}</div>
                                <div className="text-xs text-muted-foreground truncate">Last • {new Date(s.last).toLocaleDateString()} {new Date(s.last).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                            </div>
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:justify-end">
                              <Badge variant="outline" className={`h-6 px-2 text-[11px] ${ (s.upcoming||0) > 0 ? 'bg-green-50 text-green-800 border-green-200' : 'bg-secondary/20 border-secondary/30' }`}>{s.upcoming || 0} upcoming</Badge>
                              <Badge variant="outline" className="h-6 px-2 text-[11px] bg-primary/10 text-primary border-primary/20">{s.total} total</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <TeacherScheduleUnified />
              </TabsContent>

              <TabsContent value="messages" className="space-y-4">
                <SimpleChat className="h-[calc(100vh-220px)] sm:h-[calc(100vh-300px)] min-h-[420px] sm:min-h-[560px]" />
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Profile
                    </CardTitle>
                    <CardDescription>Manage appearance and account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Theme</div>
                        <div className="text-xs text-muted-foreground">Light/Dark mode</div>
                      </div>
                      <ModeToggle />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Role</div>
                        <Badge variant="outline" className="mt-1 capitalize">{role}</Badge>
                      </div>
                      <Button onClick={handleSignOut} variant="outline">
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        {/* Duolingo-like mobile bottom navigation for Teacher */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="grid grid-cols-5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center py-2 ${activeTab === 'overview' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Overview"
            >
              <GraduationCap className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex flex-col items-center py-2 ${activeTab === 'students' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Students"
            >
              <Users className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Students</span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex flex-col items-center py-2 ${activeTab === 'schedule' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Schedule"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Schedule</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex flex-col items-center py-2 ${activeTab === 'messages' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Messages"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Messages</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center py-2 ${activeTab === 'profile' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Profile</span>
            </button>
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
      </div>
    </DashboardThemeScope>
  );
}