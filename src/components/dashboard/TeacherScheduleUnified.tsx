import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock4,
  Ban
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Day-specific schedule data
  const { bookings: dayBookings, unavailability, loading: dayLoading, setBookingStatus, createBlock, deleteBlock } = useTeacherSchedule(user?.id, selectedDate);
  
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

  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [blockStart, setBlockStart] = useState<string>('09:00');
  const [blockEnd, setBlockEnd] = useState<string>('10:00');
  const [blockReason, setBlockReason] = useState<string>('');

  const dayLabel = useMemo(() => selectedDate.toLocaleDateString(undefined, { 
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' 
  }), [selectedDate]);

  const toISO = (date: Date, hhmm: string) => {
    const [hh, mm] = hhmm.split(':').map(Number);
    const d = new Date(date);
    d.setHours(hh || 0, mm || 0, 0, 0);
    return d.toISOString();
  };

  const filteredAllBookings = useMemo(() => {
    const base = allBookings.filter(b => b.status !== 'canceled');
    if (statusFilter === 'all') return base;
    return base.filter(booking => booking.status === statusFilter);
  }, [allBookings, statusFilter]);

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

  const UnavailabilityCard = ({ block, onDelete }: {
    block: any;
    onDelete: (id: string) => void;
  }) => (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:shadow-md">
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-full bg-white">
          <Ban className="h-4 w-4 text-gray-600" />
        </div>
        <div className="space-y-1">
          <div className="font-medium flex items-center gap-2">
            <Clock className="h-3 w-3" />
            {new Date(block.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(block.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          {block.reason && (
            <div className="text-sm text-muted-foreground">{block.reason}</div>
          )}
        </div>
      </div>
      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(block.id)}>
        Remove
      </Button>
    </div>
  );

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

                {/* Allow blocking only when selected date has no bookings */}
                <Dialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={dayBookings.length > 0}>
                      <Plus className="h-4 w-4 mr-2" />
                      Block Time
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Block Time on {dayLabel}</DialogTitle>
                      <DialogDescription>Add a personal block to prevent bookings.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Start Time</label>
                        <input 
                          type="time" 
                          className="mt-1 w-full border rounded-md p-2" 
                          value={blockStart} 
                          onChange={(e) => setBlockStart(e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">End Time</label>
                        <input 
                          type="time" 
                          className="mt-1 w-full border rounded-md p-2" 
                          value={blockEnd} 
                          onChange={(e) => setBlockEnd(e.target.value)} 
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Reason (optional)</label>
                        <input 
                          type="text" 
                          className="mt-1 w-full border rounded-md p-2" 
                          placeholder="e.g., personal meeting, break"
                          value={blockReason} 
                          onChange={(e) => setBlockReason(e.target.value)} 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={async () => { 
                        await createBlock(toISO(selectedDate, blockStart), toISO(selectedDate, blockEnd), blockReason || undefined); 
                        setIsBlockOpen(false); 
                      }}>
                        Save Block
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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

                    {/* Personal Blocks (hide empty state) */}
                    {unavailability.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Ban className="h-4 w-4" />
                          Personal Blocks
                        </div>
                        <div className="space-y-3">
                          {unavailability.map((block) => (
                            <UnavailabilityCard 
                              key={block.id} 
                              block={block} 
                              onDelete={deleteBlock}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  <Users className="h-3 w-3 mr-1" />
                  {filteredAllBookings.length} bookings
                </Badge>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {allLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filteredAllBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">
                  {statusFilter === 'all' ? 'No bookings yet' : `No ${statusFilter} bookings`}
                </div>
                <div className="text-muted-foreground">
                  {statusFilter === 'all' 
                    ? 'Bookings will appear here when students schedule classes with you'
                    : `No bookings with ${statusFilter} status found`}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAllBookings.map((booking) => (
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