
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Calendar, 
  MessageCircle, 
  Search,
  Home,
  LogOut,
  User,
  Clock,
  Star,
  DollarSign,
  Video,
  Globe,
  Award,
  Target,
  Bell,
  Filter
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
import { Input } from '@/components/ui/input';

export function StudentDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // ESL Student data - in a real app, this would come from your database
  const [studentStats, setStudentStats] = useState({
    currentLevel: 'Intermediate',
    hoursLearned: 45,
    lessonsCompleted: 18,
    upcomingLessons: 2,
    studyStreak: 12,
    averageScore: 85,
    upcomingBookings: [
      {
        id: 1,
        teacherName: "Sarah Johnson",
        scheduledAt: "Today, 3:00 PM",
        duration: 60,
        topic: "Business English",
        status: "confirmed",
        meetingLink: "https://zoom.us/j/123456789"
      },
      {
        id: 2,
        teacherName: "Michael Chen",
        scheduledAt: "Tomorrow, 10:00 AM",
        duration: 60,
        topic: "Conversation Practice",
        status: "confirmed",
        meetingLink: "https://zoom.us/j/987654321"
      }
    ],
    availableTeachers: [
      {
        id: 1,
        name: "Sarah Johnson",
        rating: 4.9,
        lessonsCount: 150,
        hourlyRate: 25,
        specializations: ["Business English", "IELTS", "Grammar"],
        languages: ["English", "Spanish"],
        avatar: null,
        nextAvailable: "Today, 4:00 PM",
        experience: "5 years"
      },
      {
        id: 2,
        name: "Michael Chen",
        rating: 4.8,
        lessonsCount: 200,
        hourlyRate: 22,
        specializations: ["Conversation", "Pronunciation", "Academic Writing"],
        languages: ["English", "Mandarin"],
        avatar: null,
        nextAvailable: "Tomorrow, 9:00 AM",
        experience: "7 years"
      },
      {
        id: 3,
        name: "Emma Wilson",
        rating: 4.9,
        lessonsCount: 120,
        hourlyRate: 28,
        specializations: ["TOEFL", "Business English", "Interview Prep"],
        languages: ["English", "French"],
        avatar: null,
        nextAvailable: "Today, 6:00 PM",
        experience: "4 years"
      }
    ],
    recentMessages: [
      {
        id: 1,
        teacherName: "Sarah Johnson",
        lastMessage: "Great progress in today's lesson! Don't forget to practice the new vocabulary.",
        timestamp: "2 hours ago",
        unread: false
      },
      {
        id: 2,
        teacherName: "Michael Chen",
        lastMessage: "I've prepared some pronunciation exercises for our next session.",
        timestamp: "1 day ago",
        unread: true
      }
    ],
    learningProgress: {
      grammar: 75,
      vocabulary: 80,
      speaking: 65,
      listening: 70,
      writing: 60,
      reading: 85
    }
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
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
                  <p className="text-sm text-muted-foreground">Student Portal</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                <span className="bg-red-500 text-white text-xs rounded-full px-1">2</span>
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
                      <Badge className="w-fit mt-1" variant="secondary">ESL Student</Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
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
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!</h2>
            <p className="text-muted-foreground">Continue your English learning journey with ABC Teachy.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{studentStats.currentLevel}</div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{studentStats.studyStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hours Learned</p>
                <p className="text-2xl font-bold">{studentStats.hoursLearned}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lessons Completed</p>
                <p className="text-2xl font-bold">{studentStats.lessonsCompleted}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Lessons</p>
                <p className="text-2xl font-bold">{studentStats.upcomingLessons}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{studentStats.averageScore}%</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="lessons">My Lessons</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Lessons */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Lessons</CardTitle>
                  <CardDescription>Your scheduled lessons with teachers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {studentStats.upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{booking.teacherName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{booking.teacherName}</h4>
                          <p className="text-sm text-muted-foreground">{booking.topic}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {booking.scheduledAt} ({booking.duration} min)
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(booking.status)}
                        {booking.status === 'confirmed' && (
                          <Button size="sm">
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Learning Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                  <CardDescription>Your English skill development</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(studentStats.learningProgress).map(([skill, progress]) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{skill}</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find ESL Teachers</CardTitle>
                <CardDescription>Browse and book lessons with qualified English teachers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1">
                    <Input 
                      placeholder="Search teachers by name or specialization..." 
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {studentStats.availableTeachers.map((teacher) => (
                    <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-lg">{teacher.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{teacher.name}</h3>
                              <div className="text-right">
                                <div className="font-bold text-green-600">${teacher.hourlyRate}/hr</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 mb-2">
                              {renderStars(teacher.rating)}
                              <span className="text-sm text-muted-foreground ml-2">
                                {teacher.rating} ({teacher.lessonsCount} lessons)
                              </span>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex flex-wrap gap-1">
                                {teacher.specializations.slice(0, 3).map((spec, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Globe className="h-4 w-4 mr-1" />
                                {teacher.languages.join(', ')}
                              </div>
                              
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-1" />
                                Next available: {teacher.nextAvailable}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button size="sm" className="flex-1">
                                Book Lesson
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Lessons</CardTitle>
                <CardDescription>View your lesson history and manage bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Lesson management coming soon...</p>
                  <p className="text-sm">View past lessons, reschedule, and manage bookings.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Chat with your teachers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentStats.recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{message.teacherName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{message.teacherName}</h4>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.lastMessage}</p>
                      {message.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Progress</CardTitle>
                <CardDescription>Track your English learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4" />
                  <p>Detailed progress tracking coming soon...</p>
                  <p className="text-sm">View detailed analytics, certificates, and achievements.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}