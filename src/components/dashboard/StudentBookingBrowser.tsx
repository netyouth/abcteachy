import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useBookings } from '@/hooks/useBookings';
import { generateAvailableSlots, toISO } from '@/utils/booking-utils';
import { TablesInsert, Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Profile = Tables<'profiles'>;

export default function StudentBookingBrowser() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<{ label: string; start: Date; end: Date }[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const { createBooking } = useBookings();
  const { bookings: myBookings, updateBooking, loading: bookingsLoading, refetch: refetchMyBookings } = useBookings({ studentId: user?.id });
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadTeachers = async () => {
      let loaded: Profile[] = [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'teacher');
      if (!error && Array.isArray(data)) loaded = data as Profile[];
      // Fallback to RPC if table is not readable or empty due to RLS
      if (loaded.length === 0) {
        const { data: rpcData } = await supabase.rpc('get_available_chat_users', { target_role_param: 'teacher' as any });
        if (Array.isArray(rpcData)) {
          loaded = (rpcData as any).map((r: any) => ({ id: r.id, full_name: r.full_name, role: 'teacher' }));
        }
      }
      setTeachers(loaded);
    };
    loadTeachers();
  }, [supabase]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedTeacher) return setSlots([]);
      setLoadingSlots(true);
      const target = new Date(selectedDate);
      const dayStart = new Date(target);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const { data: availability } = await supabase
        .from('teacher_availability')
        .select('*')
        .eq('teacher_id', selectedTeacher);
      // Use RPC to fetch teacher's booked times without exposing identities (RLS-safe)
      const { data: bookedRanges } = await supabase.rpc('get_teacher_booked_times', {
        p_teacher_id: selectedTeacher,
        p_day_start: dayStart.toISOString(),
        p_day_end: dayEnd.toISOString(),
      });
      const { data: unavail } = await supabase.rpc('get_teacher_unavailable_times', {
        p_teacher_id: selectedTeacher,
        p_day_start: dayStart.toISOString(),
        p_day_end: dayEnd.toISOString(),
      });
      // Fallback: if no configured availability, assume default open hours
      const hasConfigured = Array.isArray(availability) && availability.length > 0;
      const fallbackAvailability = hasConfigured
        ? (availability as any)
        : ([{
            weekday: target.getDay(),
            start_time: '08:00:00',
            end_time: '20:00:00',
            slot_minutes: 60,
            is_active: true,
          }] as any);

      const generated = generateAvailableSlots(
        target,
        fallbackAvailability || [],
        [],
        ([...((unavail as any) || []), ...((bookedRanges as any) || [])])
      );
      setSlots(generated);
      setSelectedSlotIndex(null);
      setLoadingSlots(false);
    };
    loadSlots();
  }, [supabase, selectedTeacher, selectedDate]);

  const handleBook = async () => {
    if (!user?.id || !selectedTeacher || selectedSlotIndex === null) return;
    const slot = slots[selectedSlotIndex];
    const payload: TablesInsert<'bookings'> = {
      student_id: user.id,
      teacher_id: selectedTeacher,
      start_at: toISO(slot.start),
      end_at: toISO(slot.end),
      status: 'pending',
      created_by: user.id,
    } as any;
    await createBooking(payload);
    await refetchMyBookings();
    toast({ title: 'Booking created', description: `${slot.label} with selected teacher` });
    setIsConfirmOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Class</CardTitle>
        <CardDescription>Choose a teacher, date, and time slot. All times are in your local time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={selectedTeacher || ''} onValueChange={(v) => setSelectedTeacher(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <div className="rounded-md border p-2">
                <CalendarUI
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  disabled={(d) => d < new Date(new Date().toDateString())}
                  className="rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Available slots</div>
              <Badge variant="outline">{slots.length} slots</Badge>
            </div>
            <div className="min-h-[120px]">
              {loadingSlots ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-9" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="text-sm text-muted-foreground">No slots available for this date.</div>
              ) : (
                <ScrollArea className="h-[220px] rounded-md border p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {slots.map((s, i) => (
                      <Button
                        key={`${s.label}-${i}`}
                        variant={selectedSlotIndex === i ? 'default' : 'outline'}
                        onClick={() => setSelectedSlotIndex(i)}
                        className="justify-center"
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
            <div>
              <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!selectedTeacher || selectedSlotIndex === null}>Book Class</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Booking</DialogTitle>
                    <DialogDescription>
                      You are booking {selectedSlotIndex !== null ? slots[selectedSlotIndex].label : ''} with the selected teacher.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button onClick={handleBook}>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Upcoming Bookings</CardTitle>
              <CardDescription>Manage and cancel your upcoming classes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {bookingsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (myBookings || []).filter((b) => new Date(b.start_at) >= new Date()).length === 0 ? (
                <div className="text-sm text-muted-foreground">No upcoming bookings.</div>
              ) : (
                (myBookings || [])
                  .filter((b) => new Date(b.start_at) >= new Date())
                  .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
                  .map((b) => (
                    <div key={b.id} className="flex items-center justify-between border rounded-md p-3">
                      <div className="space-y-1">
                        <div className="font-medium">{new Date(b.start_at).toLocaleString()} - {new Date(b.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-xs text-muted-foreground">Status: <Badge variant="outline">{b.status}</Badge></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" disabled={b.status === 'canceled'}>
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                              <AlertDialogAction onClick={async () => { await updateBooking(b.id, { status: 'canceled' as any }); await refetchMyBookings(); toast({ title: 'Booking canceled' }); }}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}


