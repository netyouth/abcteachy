import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, MessageCircle, Home, LogOut, Calendar, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SimpleChat } from '@/components/SimpleChat';
import StudentBookingBrowser from '@/components/dashboard/StudentBookingBrowser';
import { useEffect, useMemo, useState } from 'react';
import { DashboardThemeScope } from '@/components/dashboard/DashboardThemeScope';
import { ModeToggle } from '@/components/ModeToggle';
import { useBookings } from '@/hooks/useBookings';
import { createClient } from '@/lib/supabase/client';
import { listItem, STATUS_BADGE_TONE } from '@/components/dashboard/ui';

export function StudentDashboard() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'book' | 'chat' | 'profile'>('overview');
  const { bookings: myBookings, loading: bookingsLoading } = useBookings({ studentId: user?.id });
  const supabase = useMemo(() => createClient(), []);
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Status colors centralized in STATUS_BADGE_TONE

  useEffect(() => {
    const loadTeacherNames = async () => {
      const upcoming = (myBookings || [])
        .filter((b) => new Date(b.start_at) >= new Date() && b.status !== 'canceled')
        .map((b) => b.teacher_id)
        .filter((v): v is string => !!v);
      const uniqueTeacherIds = Array.from(new Set(upcoming));
      if (uniqueTeacherIds.length === 0) {
        setTeacherNames({});
        return;
      }
      // Try direct select first
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', uniqueTeacherIds);
      if (!error && Array.isArray(data)) {
        const map: Record<string, string> = {};
        for (const row of data as any[]) {
          if (row.id) map[row.id] = row.full_name || 'Teacher';
        }
        setTeacherNames(map);
        return;
      }
      // Fallback to RPC that lists available teachers; filter locally
      const { data: rpcData } = await supabase.rpc('get_available_chat_users', { target_role_param: 'teacher' as any });
      if (Array.isArray(rpcData)) {
        const map: Record<string, string> = {};
        for (const r of rpcData as any[]) {
          if (uniqueTeacherIds.includes(r.id)) map[r.id] = r.full_name || 'Teacher';
        }
        setTeacherNames(map);
      }
    };
    loadTeacherNames();
  }, [myBookings, supabase]);

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
                <div className="hidden md:block">
                  <ModeToggle />
                </div>
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
                  className="hidden md:inline-flex transition-all duration-200 hover:scale-105 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 text-xs sm:text-sm px-2 sm:px-3 touch-manipulation cursor-pointer"
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
              <TabsList className="hidden md:grid w-full grid-cols-4 gap-0.5 sm:gap-1 bg-muted/50 p-1 h-auto overflow-hidden">
                <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3 touch-manipulation cursor-pointer text-center min-w-0">
                  <Home className="h-4 w-4 pointer-events-none" />
                  <span className="text-[10px] sm:text-sm pointer-events-none truncate">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="book" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3 touch-manipulation cursor-pointer text-center min-w-0">
                  <Calendar className="h-4 w-4 pointer-events-none" />
                  <span className="text-[10px] sm:text-sm pointer-events-none truncate">Book</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3 touch-manipulation cursor-pointer text-center min-w-0">
                  <MessageCircle className="h-4 w-4 pointer-events-none" />
                  <span className="text-[10px] sm:text-sm pointer-events-none truncate">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3">
                  <User className="h-4 w-4" />
                  <span className="text-[10px] sm:text-sm">Profile</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg flex-shrink-0">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg">Upcoming Classes</CardTitle>
                        <CardDescription className="text-sm">Your next scheduled classes</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    {bookingsLoading ? (
                      <div className="text-sm text-muted-foreground py-4">Loading...</div>
                    ) : (() => {
                      const upcoming = (myBookings || [])
                        .filter((b) => new Date(b.start_at) >= new Date() && b.status !== 'canceled')
                        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
                      if (upcoming.length === 0) {
                        return (
                          <div className="text-center py-6 sm:py-8">
                            <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No upcoming classes</p>
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-2">
                           {upcoming.map((b) => (
                             <div key={b.id} className={listItem("flex flex-col gap-3")}>
                              <div className="space-y-1 sm:space-y-2 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                                  <span className="font-semibold text-sm sm:text-base">
                                    {new Date(b.start_at).toLocaleDateString()} at {new Date(b.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                   <Badge variant="outline" className={`text-xs ${STATUS_BADGE_TONE[b.status] || ''}`}>
                                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">• {Math.round((new Date(b.end_at).getTime() - new Date(b.start_at).getTime()) / (1000 * 60))} min duration</span>
                                  <span className="text-xs text-muted-foreground">• with {b.teacher_id ? (teacherNames[b.teacher_id] || 'Teacher') : 'Teacher'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>


              <TabsContent value="chat" className="space-y-4">
                <SimpleChat className="h-[calc(100vh-180px)] sm:h-[calc(100vh-260px)] min-h-[400px] sm:min-h-[560px] border-0 rounded-none sm:border sm:border-border/50 sm:rounded-lg" />
              </TabsContent>

              <TabsContent value="book" className="space-y-4 pb-4 md:pb-0">
                <StudentBookingBrowser />
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card className="border-primary/20">
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
                      <Button 
                        onClick={handleSignOut} 
                        variant="outline"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        {/* Duolingo-like mobile bottom navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="grid grid-cols-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center py-2 ${activeTab === 'overview' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Overview"
            >
              <Home className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`flex flex-col items-center py-2 ${activeTab === 'book' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Book"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Book</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center py-2 ${activeTab === 'chat' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Chat"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Chat</span>
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