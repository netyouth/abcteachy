import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent } from '@/components/ui/tabs';
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

const statusColors = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  confirmed: 'text-green-600 bg-green-50 border-green-200',
  canceled: 'text-red-600 bg-red-50 border-red-200', 
  completed: 'text-blue-600 bg-blue-50 border-blue-200',
  rescheduled: 'text-orange-600 bg-orange-50 border-orange-200'
};

export default function TeacherScheduleUnified() {
  const { user, role } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'all'>('day');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Day-specific schedule data
  const { bookings: dayBookings, unavailability, loading: dayLoading, setBookingStatus, createBlock, deleteBlock, deleteBooking } = useTeacherSchedule(user?.id, selectedDate);
  
  // All bookings data 
  const shouldFilterByTeacher = role !== 'admin';
  const { bookings: allBookings, updateBooking, deleteBooking: deleteAllBooking, loading: allLoading } = useBookings(
    shouldFilterByTeacher && user?.id ? { teacherId: user.id } : undefined
  );

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
    if (statusFilter === 'all') return allBookings;
    return allBookings.filter(booking => booking.status === statusFilter);
  }, [allBookings, statusFilter]);

  const BookingCard = ({ booking, onStatusUpdate, onDelete, showDate = false }: {
    booking: any;
    onStatusUpdate: (id: string, update: any) => void;
    onDelete?: (id: string) => void;
    showDate?: boolean;
  }) => {
    const StatusIcon = statusIcons[booking.status as keyof typeof statusIcons] || AlertCircle;
    return (
      <div className={`flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-md ${statusColors[booking.status as keyof typeof statusColors]}`}>
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-full bg-white/50">
            <StatusIcon className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="font-medium flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {showDate && <span>{new Date(booking.start_at).toLocaleDateString()} • </span>}
              {new Date(booking.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {booking.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {booking.status !== 'confirmed' && booking.status !== 'canceled' && booking.status !== 'completed' && (
            <Button size="sm" onClick={() => onStatusUpdate(booking.id, { status: 'confirmed' })}>
              Confirm
            </Button>
          )}
          {booking.status !== 'completed' && booking.status !== 'canceled' && (
            <Button size="sm" variant="secondary" onClick={() => onStatusUpdate(booking.id, { status: 'completed' })}>
              Complete
            </Button>
          )}
          {booking.status !== 'canceled' && (
            <Button size="sm" variant="outline" onClick={() => onStatusUpdate(booking.id, { status: 'canceled' })}>
              Cancel
            </Button>
          )}
          {booking.status === 'canceled' && onDelete && (
            <Button size="sm" variant="destructive" onClick={() => onDelete(booking.id)}>
              Delete
            </Button>
          )}
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
    <Card>
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
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'day' | 'all')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day View</SelectItem>
                <SelectItem value="all">All Bookings</SelectItem>
              </SelectContent>
            </Select>
            {viewMode === 'all' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'day' | 'all')}>
          <TabsContent value="day" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Section */}
              <div className="space-y-4">
                <CalendarUI
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={() => false}
                  className="rounded-md border"
                />

                <Dialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
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
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="font-medium">{dayLabel}</div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-white">
                      <Users className="h-3 w-3 mr-1" />
                      {dayBookings.length} bookings
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      <Ban className="h-3 w-3 mr-1" />
                      {unavailability.length} blocks
                    </Badge>
                  </div>
                </div>

                {dayLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Bookings */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Student Bookings
                      </div>
                      {dayBookings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <div>No bookings for this day</div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dayBookings.map((booking) => (
                            <BookingCard 
                              key={booking.id} 
                              booking={booking} 
                              onStatusUpdate={(id: string, update: any) => setBookingStatus(id, update.status)}
                              onDelete={(id: string) => deleteBooking(id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Personal Blocks */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Ban className="h-4 w-4" />
                        Personal Blocks
                      </div>
                      {unavailability.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <div>No blocks for this day</div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {unavailability.map((block) => (
                            <UnavailabilityCard 
                              key={block.id} 
                              block={block} 
                              onDelete={deleteBlock}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  <Users className="h-3 w-3 mr-1" />
                  {filteredAllBookings.length} bookings
                </Badge>
                {statusFilter !== 'all' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
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
                    : `No bookings with ${statusFilter} status found`
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAllBookings.map((booking) => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    onStatusUpdate={updateBooking}
                    onDelete={(id: string) => deleteAllBooking(id)}
                    showDate={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}