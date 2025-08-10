import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Shield,
  Settings,
  LogOut,
  BookOpen,
  UserPlus,
  BarChart3,
  Database,
  MessageCircle,
  
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminData } from '@/hooks/useAdminData';
import { Skeleton } from '@/components/ui/skeleton';
import AdminUserManagement from '@/components/dashboard/AdminUserManagement';
import AdminBookingsPanel from '@/components/dashboard/AdminBookingsPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardThemeScope } from '@/components/dashboard/DashboardThemeScope';
import { ModeToggle } from '@/components/ModeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import * as React from 'react';
import { metricCardHover } from '@/components/dashboard/ui';

export function AdminDashboard() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { stats, recentUsers, recentActivity, loading, error, refreshData } = useAdminData();
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'analytics' | 'bookings' | 'settings'>('overview');
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  React.useEffect(() => {
    if (!loading) setLastUpdated(new Date());
  }, [loading]);

  const totalUsersSafe = Math.max(1, stats.totalUsers || 0);
  const adminPct = Math.round(((stats.adminCount || 0) / totalUsersSafe) * 100);
  const teacherPct = Math.round(((stats.teacherCount || 0) / totalUsersSafe) * 100);
  const studentPct = Math.round(((stats.studentCount || 0) / totalUsersSafe) * 100);

  return (
    <DashboardThemeScope>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
        <header className="bg-background/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4">
              <div className="flex items-center space-x-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-duolingo-heading text-foreground">Admin Portal</h1>
                  <p className="text-sm font-duolingo-body text-muted-foreground">Welcome back, {userName}!</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="hidden md:block">
                  <ModeToggle />
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hidden xs:inline-flex">{role}</Badge>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="hidden md:inline-flex transition-all duration-200 hover:scale-105">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-3 sm:py-6 px-3 sm:px-6 lg:px-8 pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-6">
          <div className="px-4 py-6 sm:px-0">
            {error && (
              <Alert className={`mb-6 ${error.includes('temporary policy') ? 'border-amber-500/50 text-amber-700 dark:border-amber-500 [&>svg]:text-amber-600' : 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'}`}>
                <Shield className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <div>{error}</div>
                  {error.includes('RLS has been temporarily disabled') ? (
                    <div className="text-sm space-y-1">
                      <div className="font-medium">✅ Admin Dashboard is Working!</div>
                      <div>• RLS temporarily disabled to resolve access issues</div>
                      <div>• JWT claims are working correctly</div>
                      <div>• All admin functionality is available</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        To re-enable security: Run the re-enable script in fix-admin-dashboard-complete.sql
                      </div>
                    </div>
                  ) : error.includes('Custom Access Token Hook') || error.includes('temporary policy') ? (
                    <div className="text-sm space-y-1">
                      <div className="font-medium">To fix permanently:</div>
                      <div>1. Go to <a href="https://supabase.com/dashboard/project/objcklmxfnnsveqhsrok/auth/hooks" target="_blank" rel="noopener noreferrer" className="underline">Authentication → Hooks</a></div>
                      <div>2. Enable "Custom Access Token" hook</div>
                      <div>3. Sign out and sign back in</div>
                      <div>4. Remove temporary policy (see cleanup-temp-policy.sql)</div>
                    </div>
                  ) : (
                    <Button 
                      onClick={refreshData} 
                      variant="link" 
                      className="h-auto p-0 ml-2 text-destructive hover:text-destructive/80"
                      size="sm"
                    >
                      Try again
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
              <TabsList className="hidden md:grid w-full grid-cols-5 gap-0.5 sm:gap-1 bg-muted/50 p-1 h-auto">
                <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3">
                  <Users className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Users</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Bookings</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 py-1.5 sm:py-3 px-0.5 sm:px-3">
                  <Settings className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="text-sm text-muted-foreground">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Loading...'}</div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className={metricCardHover}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <Skeleton className="h-8 w-16 mb-1" />
                      ) : (
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      )}
                      <p className="text-xs text-muted-foreground">All registered users</p>
                    </CardContent>
                  </Card>

                  <Card className={metricCardHover}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <Skeleton className="h-8 w-16 mb-1" />
                      ) : (
                        <div className="text-2xl font-bold">{stats.activeConversations}</div>
                      )}
                      <p className="text-xs text-muted-foreground">Active conversations</p>
                    </CardContent>
                  </Card>

                  <Card className={metricCardHover}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <Skeleton className="h-8 w-16 mb-1" />
                      ) : (
                        <div className="text-2xl font-bold">{stats.totalBookings ?? 0}</div>
                      )}
                      <p className="text-xs text-muted-foreground">All-time bookings</p>
                    </CardContent>
                  </Card>

                  <Card className={metricCardHover}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <Skeleton className="h-8 w-16 mb-1" />
                      ) : (
                        <div className="text-2xl font-bold">{stats.activeBookingsToday ?? 0}</div>
                      )}
                      <p className="text-xs text-muted-foreground">Starting today</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Roles</CardTitle>
                      <CardDescription>Distribution across roles</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Admins</span>
                          <span className="text-muted-foreground">{stats.adminCount}</span>
                        </div>
                        <Progress value={adminPct} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Teachers</span>
                          <span className="text-muted-foreground">{stats.teacherCount}</span>
                        </div>
                        <Progress value={teacherPct} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Students</span>
                          <span className="text-muted-foreground">{stats.studentCount}</span>
                        </div>
                        <Progress value={studentPct} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Bookings</CardTitle>
                      <CardDescription>At a glance</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-3">
                      <div className="rounded-md border p-3 text-center">
                        <div className="text-2xl font-bold">{stats.totalBookings ?? 0}</div>
                        <div className="text-xs text-muted-foreground mt-1">Total</div>
                      </div>
                      <div className="rounded-md border p-3 text-center">
                        <div className="text-2xl font-bold">{stats.completedBookings ?? 0}</div>
                        <div className="text-xs text-muted-foreground mt-1">Completed</div>
                      </div>
                      <div className="rounded-md border p-3 text-center">
                        <div className="text-2xl font-bold">{stats.canceledBookings ?? 0}</div>
                        <div className="text-xs text-muted-foreground mt-1">Canceled</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2 lg:col-span-1">
                    <CardHeader>
                      <CardTitle>Recent Users</CardTitle>
                      <CardDescription>Latest registrations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {loading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-10" />
                          ))}
                        </div>
                      ) : recentUsers.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No recent users</div>
                      ) : (
                        recentUsers.slice(0, 5).map((u) => (
                          <div key={u.id} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={u.avatar_url || undefined} alt={u.full_name || 'User'} />
                              <AvatarFallback>{(u.full_name || 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{u.full_name || 'User'}</div>
                              <div className="text-xs text-muted-foreground">{u.role} • {new Date(u.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Existing recent activity and actions remain below */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest system events and user activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-start space-x-4 p-3">
                            <Skeleton className="h-8 w-8 rounded-full mt-1" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentActivity.length === 0 ? (
                      <div className="text-center py-8">
                        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          System activity will appear here as users interact with the platform.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => {
                          const getActivityIcon = () => {
                            switch (activity.type) {
                              case 'user_registered':
                                return <UserPlus className="h-4 w-4 text-secondary-green" />;
                              case 'message_sent':
                                return <MessageCircle className="h-4 w-4 text-secondary-blue" />;
                              case 'conversation_started':
                                return <BookOpen className="h-4 w-4 text-primary" />;
                              default:
                                return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
                            }
                          };

                          return (
                            <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-accent/30 rounded-lg transition-colors">
                              <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center mt-1">
                                {getActivityIcon()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{activity.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(activity.timestamp).toLocaleDateString()} at {' '}
                                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        
                        {recentActivity.length > 0 && (
                          <div className="pt-4 border-t">
                            <Button variant="outline" className="w-full">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View All Activity
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Administration</CardTitle>
                    <CardDescription>
                      System administration and management tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Button className="w-full justify-start transition-all duration-200 hover:scale-[1.02]" variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create User Account
                    </Button>
                    <Button className="w-full justify-start transition-all duration-200 hover:scale-[1.02]" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Button>
                    <Button className="w-full justify-start transition-all duration-200 hover:scale-[1.02]" variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Manage Courses
                    </Button>
                    <Button className="w-full justify-start transition-all duration-200 hover:scale-[1.02]" variant="outline">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Reports
                    </Button>
                    <Button className="w-full justify-start transition-all duration-200 hover:scale-[1.02]" variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      System Settings
                    </Button>
                    <Button className="w-full justify-start transition-all duration-200 hover:scale-[1.02]" variant="outline">
                      <Database className="mr-2 h-4 w-4" />
                      Database Management
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <AdminUserManagement />
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                <AdminBookingsPanel />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Analytics</CardTitle>
                    <CardDescription>
                      Usage statistics and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Analytics and usage statistics will appear here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>
                      Configure system-wide settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">General Settings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" className="w-full">
                              <Settings className="mr-2 h-4 w-4" />
                              Configure
                            </Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Security Settings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" className="w-full">
                              <Shield className="mr-2 h-4 w-4" />
                              Configure
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        {/* Duolingo-like mobile bottom navigation for Admin */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="grid grid-cols-5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center py-2 ${activeTab === 'overview' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Overview"
            >
              <Shield className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex flex-col items-center py-2 ${activeTab === 'users' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Users"
            >
              <Users className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Users</span>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex flex-col items-center py-2 ${activeTab === 'bookings' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Bookings"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Bookings</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center py-2 ${activeTab === 'analytics' ? 'text-primary' : 'text-foreground/70'}`}
              aria-label="Analytics"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Analytics</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center py-2 text-foreground/70 hover:text-destructive transition-colors"
              aria-label="Sign Out"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Sign Out</span>
            </button>
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
      </div>
    </DashboardThemeScope>
  );
}