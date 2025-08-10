 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { Clock, User, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { STATUS_BADGE_TONE, listItem } from '@/components/dashboard/ui';

export default function TeacherBookingsView() {
  const { user, role, loading: authLoading } = useAuth();
  // If admin, show all bookings; otherwise filter by current user's id (works for teachers and unknown roles)
  const shouldFilterByTeacher = role !== 'admin';
  const isAuthReady = !authLoading && !!user?.id;
  const { bookings, updateBooking, loading } = useBookings(
    shouldFilterByTeacher && user?.id ? { teacherId: user.id } : undefined
  );

  // Calculate duration in minutes
  const getDurationMinutes = (startAt: string, endAt: string): number => {
    return Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / (1000 * 60));
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'canceled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Status tones provided by STATUS_BADGE_TONE

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Upcoming Classes</CardTitle>
            <CardDescription>Manage your scheduled classes, confirm or complete sessions.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isAuthReady || loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming classes</p>
            <p className="text-xs text-muted-foreground mt-1">Your scheduled classes will appear here</p>
          </div>
        ) : (
          bookings
            .filter((b) => new Date(b.start_at) >= new Date()) // Only show future bookings
            .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
            .map((b) => {
              const durationMinutes = getDurationMinutes(b.start_at, b.end_at);
              const isToday = new Date(b.start_at).toDateString() === new Date().toDateString();
              
              return (
                <div key={b.id} className={listItem("flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-4")}>
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className={`font-semibold text-sm sm:text-base ${isToday ? 'text-primary' : ''}`}>
                          {new Date(b.start_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(b.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(b.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isToday && (
                        <Badge className="bg-primary/10 text-primary text-xs">Today</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(b.status)}
                        <Badge variant="outline" className={`text-xs ${STATUS_BADGE_TONE[b.status] || ''}`}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(durationMinutes)} class</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Student booking</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {b.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateBooking(b.id, { status: 'confirmed' as any })}
                        className="text-xs sm:text-sm touch-manipulation"
                      >
                        Confirm
                      </Button>
                    )}
                    {(b.status === 'confirmed' || b.status === 'pending') && (
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => updateBooking(b.id, { status: 'completed' as any })}
                        className="text-xs sm:text-sm touch-manipulation"
                      >
                        Complete
                      </Button>
                    )}
                    {b.status !== 'canceled' && b.status !== 'completed' && (
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => updateBooking(b.id, { status: 'canceled' as any })}
                        className="text-xs sm:text-sm touch-manipulation"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </CardContent>
    </Card>
  );
}


