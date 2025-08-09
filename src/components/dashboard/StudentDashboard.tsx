import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, MessageCircle, Home, LogOut, Calendar, GraduationCap, RefreshCw, TrendingUp, Clock, Star, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SimpleChat } from '@/components/SimpleChat';
import StudentBookingBrowser from '@/components/dashboard/StudentBookingBrowser';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardThemeScope } from '@/components/dashboard/DashboardThemeScope';
import { ModeToggle } from '@/components/ModeToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export function StudentDashboard() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'book' | 'chat'>('overview');
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
    { 
      label: 'Available Teachers', 
      value: teachersCount, 
      icon: GraduationCap, 
      description: 'Ready to help you learn',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      label: 'Messages', 
      value: messagesCount, 
      icon: MessageCircle, 
      description: 'Total conversations',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      label: 'Upcoming Classes', 
      value: upcomingCount, 
      icon: Calendar, 
      description: 'Next 7 days',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
  ]), [teachersCount, messagesCount, upcomingCount]);

  return (
    <DashboardThemeScope>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
        <header className="bg-background/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md"></div>
                  <Home className="h-6 w-6 sm:h-8 sm:w-8 text-primary relative z-10" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-duolingo-heading text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
                    Student Portal
                  </h1>
                  <p className="text-xs sm:text-sm font-duolingo-body text-muted-foreground truncate">Welcome, {userName}! 👋</p>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Refresh dashboard"
                  onClick={() => {
                    console.log('Refresh clicked');
                    loadCounts();
                  }}
                  className="hover:bg-primary/10 transition-colors h-8 w-8 sm:h-10 sm:w-10 touch-manipulation cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 pointer-events-none ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <ModeToggle />
                <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20 font-semibold text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 hidden xs:inline-flex">
                  {role}
                </Badge>
                <Button 
                  onClick={() => {
                    console.log('Sign Out clicked');
                    handleSignOut();
                  }} 
                  variant="outline" 
                  size="sm" 
                  className="transition-all duration-200 hover:scale-105 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 text-xs sm:text-sm px-2 sm:px-3 touch-manipulation cursor-pointer"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 pointer-events-none" />
                  <span className="hidden sm:inline pointer-events-none">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-3 sm:py-6 px-3 sm:px-6 lg:px-8 pb-20 md:pb-6">
          <div className="space-y-4 sm:space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 gap-0.5 sm:gap-1 bg-muted/50 p-1 h-auto overflow-hidden">
                <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3 touch-manipulation cursor-pointer text-center min-w-0">
                  <Home className="h-4 w-4 pointer-events-none" />
                  <span className="text-[10px] sm:text-sm pointer-events-none truncate">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3 touch-manipulation cursor-pointer text-center min-w-0">
                  <BookOpen className="h-4 w-4 pointer-events-none" />
                  <span className="text-[10px] sm:text-sm pointer-events-none truncate">Courses</span>
                </TabsTrigger>
                <TabsTrigger value="book" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3 touch-manipulation cursor-pointer text-center min-w-0">
                  <Calendar className="h-4 w-4 pointer-events-none" />
                  <span className="text-[10px] sm:text-sm pointer-events-none truncate">Book</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3 touch-manipulation cursor-pointer text-center min-w-0">
                  <MessageCircle className="h-4 w-4 pointer-events-none" />
                  <span className="text-[10px] sm:text-sm pointer-events-none truncate">Chat</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Loading...'}
                  </div>
                  {!loading && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        console.log('Refresh in overview clicked');
                        loadCounts();
                      }} 
                      className="self-start sm:self-auto touch-manipulation cursor-pointer"
                    >
                      <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4 pointer-events-none" /> 
                      <span className="text-xs sm:text-sm pointer-events-none">Refresh</span>
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {kpi.map(({ label, value, icon: Icon, description, color, bgColor }, index) => (
                    <Card key={label} className="group transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] border-border/50 bg-gradient-to-br from-card to-card/50 overflow-hidden relative cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">{label}</CardTitle>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                        <div className={`p-2 ${bgColor} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        {loading ? (
                          <div className="space-y-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-1 w-full" />
                          </div>
                        ) : (
                          <>
                            <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent animate-in fade-in-50 duration-500" 
                                 style={{ animationDelay: `${index * 100}ms` }}>
                              {value ?? '—'}
                            </div>
                            {!loading && value !== null && (
                              <div className="mt-3 h-2 bg-secondary/50 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full bg-gradient-to-r ${color.replace('text-', 'from-').replace('-600', '-400')} to-primary/70 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left-full`}
                                  style={{ 
                                    width: `${Math.min((value / Math.max(10, value)) * 100, 100)}%`,
                                    animationDelay: `${500 + index * 200}ms`
                                  }}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-2">
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <CardTitle>Quick Actions</CardTitle>
                      </div>
                      <CardDescription>Jump back into learning</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        className="w-full justify-start transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 touch-manipulation" 
                        size="lg"
                        onClick={() => console.log('Browse Courses clicked')}
                      >
                        <BookOpen className="mr-2 sm:mr-3 h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-left text-sm sm:text-base">Browse Courses</span>
                        <span className="text-xs opacity-70 hidden sm:inline">0 active</span>
                      </Button>
                      <Button 
                        className="w-full justify-start transition-all duration-200 hover:scale-[1.02] touch-manipulation" 
                        variant="outline" 
                        size="lg"
                        onClick={() => console.log('Start Chat clicked')}
                      >
                        <MessageCircle className="mr-2 sm:mr-3 h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-left text-sm sm:text-base">Start Chat</span>
                        <span className="text-xs opacity-70 hidden sm:inline">{messagesCount || 0} msgs</span>
                      </Button>
                      <Button 
                        className="w-full justify-start transition-all duration-200 hover:scale-[1.02] touch-manipulation" 
                        variant="outline" 
                        size="lg"
                        onClick={() => console.log('Book a Class clicked')}
                      >
                        <Calendar className="mr-2 sm:mr-3 h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-left text-sm sm:text-base">Book a Class</span>
                        <span className="text-xs opacity-70 hidden sm:inline">{upcomingCount || 0} upcoming</span>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-secondary-foreground" />
                        <CardTitle>Learning Progress</CardTitle>
                      </div>
                      <CardDescription>Your educational journey</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span className="font-medium">25%</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-primary">0</div>
                          <div className="text-xs text-muted-foreground">Courses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-secondary-foreground">0h</div>
                          <div className="text-xs text-muted-foreground">Study Time</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          Available Courses
                        </CardTitle>
                        <CardDescription>
                          Browse and enroll in courses tailored to your learning goals
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Star className="mr-2 h-4 w-4" />
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="relative mx-auto mb-4">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                        <BookOpen className="mx-auto h-16 w-16 text-primary relative z-10" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Course Catalog Coming Soon</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                        We're preparing an amazing selection of courses for you. Get ready to embark on your learning journey!
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-primary to-primary/80 touch-manipulation"
                        onClick={() => console.log('Get Notified clicked')}
                      >
                        Get Notified
                        <Clock className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat" className="space-y-4">
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent border-dashed">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground">
                          Private Teacher Chat
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Chat privately with your teacher. All conversations are automatically saved.
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                <SimpleChat className="h-[calc(100vh-280px)] sm:h-[calc(100vh-340px)] min-h-[400px] sm:min-h-[560px] border border-border/50 rounded-lg" />
              </TabsContent>

              <TabsContent value="book" className="space-y-4 pb-4 md:pb-0">
                <StudentBookingBrowser />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        {/* Mobile primary action: Book a class */}
        {activeTab !== 'book' && (
          <div className="fixed bottom-4 right-4 z-40 md:hidden">
            <Button
              size="lg"
              className="rounded-full shadow-lg px-4 h-11 bg-primary text-primary-foreground"
              onClick={() => setActiveTab('book')}
              aria-label="Book a class"
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              <span className="text-sm">Book</span>
            </Button>
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        )}
      </div>
    </DashboardThemeScope>
  );
}