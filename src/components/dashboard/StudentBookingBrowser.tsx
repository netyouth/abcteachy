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
import { generateAvailableSlots, toISO, TimeSlot } from '@/utils/booking-utils';
import { TablesInsert, Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { STATUS_BADGE_TONE, listItem } from '@/components/dashboard/ui';

type Profile = Tables<'profiles'>;

export default function StudentBookingBrowser() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // 30 or 60 minutes
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const { createBooking } = useBookings();
  const { bookings: myBookings, updateBooking, loading: bookingsLoading, refetch: refetchMyBookings } = useBookings({ studentId: user?.id });
  const teacherNameById = useMemo(() => {
    const map: Record<string, string> = {};
    (teachers || []).forEach((t) => {
      if (t.id) map[t.id] = (t as any).full_name || 'Teacher';
    });
    return map;
  }, [teachers]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const { toast } = useToast();

  // Highlight days on the calendar where the student already has a booking
  const bookedDates = useMemo(() => {
    const set = new Set<string>();
    (myBookings || []).forEach((b) => {
      const d = new Date(b.start_at);
      const normalized = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
      set.add(normalized);
    });
    return set;
  }, [myBookings]);

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
      try {
        const target = new Date(selectedDate);
        const dayStart = new Date(target);
        dayStart.setUTCHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        const { data: availability } = await supabase
          .from('teacher_availability')
          .select('*')
          .eq('teacher_id', selectedTeacher);

        // Try RPCs; fallback to direct selects if RPCs are unavailable
        const bookedRes = await supabase.rpc('get_teacher_booked_times', {
          p_teacher_id: selectedTeacher,
          p_day_start: dayStart.toISOString(),
          p_day_end: dayEnd.toISOString(),
        });
        const unavailRes = await supabase.rpc('get_teacher_unavailable_times', {
          p_teacher_id: selectedTeacher,
          p_day_start: dayStart.toISOString(),
          p_day_end: dayEnd.toISOString(),
        });
        let bookedRanges = bookedRes.data as any[] | null;
        let unavail = unavailRes.data as any[] | null;
        if (bookedRes.error || !Array.isArray(bookedRanges)) {
          const { data } = await supabase
            .from('bookings')
            .select('start_at,end_at,status')
            .eq('teacher_id', selectedTeacher)
            .gte('start_at', dayStart.toISOString())
            .lt('end_at', dayEnd.toISOString());
          bookedRanges = (data as any[])?.map((b: any) => ({ start_at: b.start_at, end_at: b.end_at, status: b.status })) || [];
        }
        if (unavailRes.error || !Array.isArray(unavail)) {
          const { data } = await supabase
            .from('teacher_unavailability')
            .select('start_at,end_at')
            .eq('teacher_id', selectedTeacher)
            .gte('start_at', dayStart.toISOString())
            .lt('end_at', dayEnd.toISOString());
          unavail = (data as any[]) || [];
        }

        // Fallback: if no configured availability, assume default open hours with 25-minute slots
        const hasConfigured = Array.isArray(availability) && availability.length > 0;
        const fallbackAvailability = hasConfigured
          ? (availability as any)
          : ([{
              weekday: target.getDay(),
              start_time: '08:00:00',
              end_time: '20:00:00',
              slot_minutes: 25,
              is_active: true,
            }] as any);

        const generated = generateAvailableSlots(
          target,
          fallbackAvailability || [],
          bookedRanges || [],
          unavail || [],
          selectedDuration
        );
        setSlots(generated);
        setSelectedSlotIndex(null);
      } catch (err: any) {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [supabase, selectedTeacher, selectedDate, selectedDuration]);

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
    const durationText = selectedDuration === 60 ? '1-hour' : `${selectedDuration}-minute`;
    toast({ title: 'Booking created', description: `${durationText} class ${slot.label} with selected teacher` });
    setIsConfirmOpen(false);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-xl">Book a Class</CardTitle>
            <CardDescription className="text-sm">Choose a teacher, date and time. Times shown in your local timezone.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-2">
        {/* Responsive single-column on mobile to prevent overlaps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-3 lg:space-y-6">
            <Card className="border-border/50 bg-gradient-to-br from-muted/50 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">Choose Teacher</Label>
                </div>
              </CardHeader>
              <CardContent>
                <Select value={selectedTeacher || ''} onValueChange={(v) => setSelectedTeacher(v)}>
                  <SelectTrigger className="h-11 touch-manipulation cursor-pointer">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="truncate max-w-[220px] sm:max-w-none">{t.full_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
              <Card className="border-border/50 bg-gradient-to-br from-muted/50 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">Pick Date</Label>
                </div>
              </CardHeader>
              <CardContent>
                  <div className="rounded-lg border border-border/50 p-2 sm:p-3 pb-3 sm:pb-4 bg-background/50 overflow-hidden">
                    <CalendarUI
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => d && setSelectedDate(d)}
                      disabled={(d) => d < new Date(new Date().toDateString())}
                      className="rounded-md border"
                      // Highlight days where the student already has bookings
                      modifiers={{
                        booked: (day) =>
                          bookedDates.has(
                            new Date(day.getFullYear(), day.getMonth(), day.getDate()).toDateString()
                          ),
                      }}
                    />
                  </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50 bg-gradient-to-br from-muted/50 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">Class Duration</Label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedDuration === 30 ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedDuration(30);
                      setSelectedSlotIndex(null); // Reset selected slot when duration changes
                    }}
                    className="touch-manipulation cursor-pointer"
                  >
                    <span className="pointer-events-none">30 min</span>
                  </Button>
                  <Button
                    variant={selectedDuration === 60 ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedDuration(60);
                      setSelectedSlotIndex(null); // Reset selected slot when duration changes
                    }}
                    className="touch-manipulation cursor-pointer"
                  >
                    <span className="pointer-events-none">1 hour</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Slots panel */}
          <div className="lg:col-span-2 space-y-3 lg:space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">Available Time Slots</Label>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs sm:text-sm">
                    {slots.length} {slots.length === 1 ? 'slot' : 'slots'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                 <div className="min-h-[180px] lg:min-h-[220px]">
                  {!selectedTeacher ? (
                    <div className="flex flex-col items-center justify-center h-24 sm:h-32 text-center px-4">
                      <User className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
                      <p className="text-xs sm:text-sm text-muted-foreground">Please select a teacher to view available slots</p>
                    </div>
                   ) : loadingSlots ? (
                    <div className={`grid ${selectedDuration === 30 ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'} gap-2 sm:gap-3`}>
                      {Array.from({ length: selectedDuration === 30 ? 12 : 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 sm:h-12 rounded-lg" />
                      ))}
                    </div>
                   ) : slots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 sm:h-32 text-center px-4">
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
                      <p className="text-xs sm:text-sm text-muted-foreground">No available slots for {selectedDate.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Try selecting a different date</p>
                    </div>
                  ) : (
                      <ScrollArea className={`${selectedDuration === 30 ? 'h-[220px] sm:h-[280px] lg:h-[380px]' : 'h-[180px] sm:h-[220px] lg:h-[300px]'} pr-2 sm:pr-4`}>
                      <div className={`grid ${selectedDuration === 30 ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'} gap-2 sm:gap-3`}>
                        {slots.map((s, i) => (
                          <Button
                            key={`${s.label}-${i}`}
                            variant={selectedSlotIndex === i ? 'default' : 'outline'}
                            onClick={() => {
                              console.log('Slot clicked:', s.label, i);
                              setSelectedSlotIndex(i);
                            }}
                              className={`h-10 sm:h-12 flex-col gap-0.5 sm:gap-1 transition-all duration-200 hover:scale-105 text-xs sm:text-sm touch-manipulation cursor-pointer whitespace-nowrap ${
                              selectedSlotIndex === i 
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                                : 'hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          >
                            <span className="font-semibold pointer-events-none">{s.label}</span>
                            <span className="text-xs opacity-70 hidden sm:inline pointer-events-none">
                              {s.duration === 60 ? '1hr' : `${s.duration}min`}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center px-2 sm:px-4 lg:px-0">
              <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogTrigger asChild>
                  <Button 
                    disabled={!selectedTeacher || selectedSlotIndex === null}
                    className="w-full lg:w-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
                    size="lg"
                    onClick={() => console.log('Book This Class clicked', { selectedTeacher, selectedSlotIndex })}
                  >
                    <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5 pointer-events-none" />
                    <span className="pointer-events-none">Book This Class</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] sm:max-w-md mx-4">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Confirm Your Booking
                    </DialogTitle>
                    <DialogDescription className="text-left pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Time:</span>
                          <span>{selectedSlotIndex !== null ? slots[selectedSlotIndex].label : ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Date:</span>
                          <span>{selectedDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Duration:</span>
                          <span>{selectedDuration === 60 ? '1 hour' : `${selectedDuration} minutes`}</span>
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="touch-manipulation">
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        console.log('Confirm Booking clicked');
                        handleBook();
                      }} 
                      className="bg-gradient-to-r from-primary to-primary/80 touch-manipulation"
                    >
                      Confirm Booking
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="pt-3 lg:pt-6 pb-16 md:pb-0">
          <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg">Your Upcoming Bookings</CardTitle>
                  <CardDescription className="text-sm">Manage your scheduled classes and appointments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              {bookingsLoading ? (
                <div className="space-y-2 sm:space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 sm:h-20 rounded-lg" />
                  ))}
                </div>
              ) : (myBookings || []).filter((b) => new Date(b.start_at) >= new Date()).length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No upcoming bookings</p>
                  <p className="text-xs text-muted-foreground mt-1">Book your first class above!</p>
                </div>
              ) : (
                (myBookings || [])
                  .filter((b) => new Date(b.start_at) >= new Date())
                  .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
                  .map((b) => {
                    const getStatusIcon = (status: string) => {
                      switch (status) {
                        case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
                        case 'canceled': return <XCircle className="h-4 w-4 text-red-500" />;
                        default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
                      }
                    };
                    
  // Status colors centralized in STATUS_BADGE_TONE
                    
                      return (
                      <div key={b.id} className={listItem("flex flex-col gap-3")}>
                        <div className="space-y-1 sm:space-y-2 min-w-0">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                            <span className="font-semibold text-sm sm:text-base">
                              {new Date(b.start_at).toLocaleDateString()} at {new Date(b.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getStatusIcon(b.status)}
                            <Badge variant="outline" className={`text-xs ${STATUS_BADGE_TONE[b.status] || ''}`}>
                              {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">• {Math.round((new Date(b.end_at).getTime() - new Date(b.start_at).getTime()) / (1000 * 60))} min duration</span>
                            <span className="text-xs text-muted-foreground">• with {b.teacher_id ? (teacherNameById[b.teacher_id] || 'Teacher') : 'Teacher'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          {b.status !== 'canceled' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive text-xs sm:text-sm touch-manipulation cursor-pointer"
                                  onClick={() => console.log('Cancel booking clicked')}
                                >
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-destructive" />
                                    Cancel this booking?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will cancel your class scheduled for {new Date(b.start_at).toLocaleString()}. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={async () => { 
                                      await updateBooking(b.id, { status: 'canceled' as any }); 
                                      await refetchMyBookings(); 
                                      toast({ 
                                        title: 'Booking canceled', 
                                        description: 'Your class has been successfully canceled.' 
                                      }); 
                                    }}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Yes, Cancel
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}


