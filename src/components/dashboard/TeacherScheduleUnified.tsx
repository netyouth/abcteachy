import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock4,
  
} from 'lucide-react';
import { STATUS_BADGE_TONE, listItem } from '@/components/dashboard/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherSchedule } from '@/hooks/useTeacherSchedule';
import { useBookings } from '@/hooks/useBookings';

const statusIcons = {
  pending: AlertCircle,
  confirmed: CheckCircle, 
  canceled: XCircle,
  completed: Clock4,
  rescheduled: Clock
};

// Neutral card with color-coded left border + badge colors
// left-border tones reserved (currently unused after redesign)

// Use centralized status tones

export default function TeacherScheduleUnified() {
  const { user, role } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // Filter removed for simplified UI
  
  // Day-specific schedule data
  const { bookings: dayBookings, loading: dayLoading, setBookingStatus } = useTeacherSchedule(user?.id, selectedDate);
  
  // All bookings data 
  const shouldFilterByTeacher = role !== 'admin';
  const { bookings: allBookings, updateBooking, loading: allLoading } = useBookings(
    shouldFilterByTeacher && user?.id ? { teacherId: user.id } : undefined
  );

  // Build a set of days that have at least one booking to highlight on calendar
  const bookedDates = useMemo(() => {
    const set = new Set<string>();
    for (const b of allBookings) {
      if (b.status === 'canceled') continue;
      const d = new Date(b.start_at);
      // Normalize to local day string
      set.add(new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString());
    }
    return set;
  }, [allBookings]);

  // Block time removed

  // Removed day label and toISO utilities with the simplified UI

  const allNonCanceledBookings = useMemo(() => {
    return allBookings.filter(b => b.status !== 'canceled');
  }, [allBookings]);

  const visibleDayBookings = useMemo(() => {
    return dayBookings.filter(b => b.status !== 'canceled');
  }, [dayBookings]);

  const BookingCard = ({ booking, onStatusUpdate }: {
    booking: any;
    onStatusUpdate: (id: string, update: any) => void;
  }) => {
    const StatusIcon = statusIcons[booking.status as keyof typeof statusIcons] || AlertCircle;

    // student_name is populated by useTeacherSchedule for day view; may be absent in full list

    const start = new Date(booking.start_at)
    const end = new Date(booking.end_at)
    const dateStr = start.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' })
    const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    const durationMin = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
    return (
      <div className={listItem("rounded-xl p-4 hover:shadow-sm")}> 
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold">
              <Clock className="h-4 w-4 text-orange-500" aria-hidden="true" />
              <span className="truncate">{dateStr} at {timeStr}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs sm:text-sm ${STATUS_BADGE_TONE[booking.status] || ''}`}>
                <StatusIcon className="h-4 w-4" aria-hidden="true" />
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              <span className="text-sm text-muted-foreground">• {durationMin} min duration</span>
              {booking.student_name && (
                <span className="text-sm text-muted-foreground">• {booking.student_name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-end">
            {booking.status === 'pending' && (
              <Button size="sm" onClick={() => onStatusUpdate(booking.id, { status: 'confirmed' })}>
                Confirm
              </Button>
            )}
            {booking.status !== 'canceled' && booking.status !== 'completed' && (
              <Button size="sm" variant="outline" onClick={() => onStatusUpdate(booking.id, { status: 'canceled' })}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Personal blocks UI removed

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule & Bookings
            </CardTitle>
            <CardDescription>
              Manage your schedule, bookings, and availability in one place
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Section */}
              <div className="space-y-4">
                <CalendarUI
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={() => false}
                  className="rounded-md border"
                  // Highlight days with bookings in green
                  modifiers={{
                    booked: (day) => bookedDates.has(new Date(day.getFullYear(), day.getMonth(), day.getDate()).toDateString()),
                  }}
                />
              </div>

              {/* Day Schedule Section */}
              <div className="lg:col-span-2 space-y-4">

                {dayLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Bookings (hide empty state) */}
                    {visibleDayBookings.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Users className="h-4 w-4" />
                          Student Bookings
                        </div>
                        <div className="space-y-3">
                          {visibleDayBookings.map((booking) => (
                            <BookingCard 
                              key={booking.id} 
                              booking={booking} 
                              onStatusUpdate={(id: string, update: any) => setBookingStatus(id, update.status)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          {/* All bookings list below day view */}
          <div className="space-y-4 pb-16 md:pb-0">
            {allLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : allNonCanceledBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">
                  No bookings yet
                </div>
                <div className="text-muted-foreground">Bookings will appear here when students schedule classes with you</div>
              </div>
            ) : (
              <div className="space-y-3">
                {allNonCanceledBookings.map((booking) => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    onStatusUpdate={updateBooking}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}