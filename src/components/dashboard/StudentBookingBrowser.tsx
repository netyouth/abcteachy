import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// Removed unused AlertDialog imports after simplifying bottom list
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useBookings } from '@/hooks/useBookings';
import { generateAvailableSlots, toISO, TimeSlot } from '@/utils/booking-utils';
import { TablesInsert, Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';
// import { STATUS_BADGE_TONE, listItem } from '@/components/dashboard/ui';
import { useIsMobile } from '@/hooks/use-mobile';
// import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const isMobile = useIsMobile();
  // const [teacherDrawerOpen, setTeacherDrawerOpen] = useState(false);
  const { createBooking } = useBookings();
  const { bookings: myBookings, refetch: refetchMyBookings } = useBookings({ studentId: user?.id });
  // Map for teacher names retained previously; no longer used in this component after UI simplification
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
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg">Book a Class</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Book your next class</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-6 px-4 sm:px-6">
        {/* Step indicator */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 px-0">
          <div className="flex items-center gap-2">
            <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-semibold border ${currentStep >= 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'}`}>
              1
            </div>
            <div className={`text-[10px] xs:text-[11px] sm:text-sm ${currentStep >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Teacher</div>
          </div>
          <div className={`h-0.5 flex-1 rounded ${currentStep >= 2 ? 'bg-primary' : 'bg-border'}`} />
          <div className="flex items-center gap-2">
            <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-semibold border ${currentStep >= 2 ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'}`}>
              2
            </div>
            <div className={`text-[10px] xs:text-[11px] sm:text-sm ${currentStep >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Date</div>
          </div>
          <div className={`h-0.5 flex-1 rounded ${currentStep >= 3 ? 'bg-primary' : 'bg-border'}`} />
          <div className="flex items-center gap-2">
            <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-semibold border ${currentStep >= 3 ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'}`}>
              3
            </div>
            <div className={`text-[10px] xs:text-[11px] sm:text-sm ${currentStep >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Time</div>
          </div>
        </div>

        {/* Animated step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {currentStep === 1 && (
            <Card className="border-border/50 bg-gradient-to-br from-muted/50 to-transparent">
                <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">Choose Teacher</Label>
                </div>
              </CardHeader>
                <CardContent className="pt-0 pb-4">
                  {isMobile ? (
                    <div className="space-y-3">
                      {teachers.map((t) => (
                        <Button
                          key={t.id}
                          variant={selectedTeacher === t.id ? 'default' : 'outline'}
                          className="w-full justify-start h-12 touch-manipulation"
                          onClick={() => {
                            setSelectedTeacher(t.id as string);
                            setCurrentStep(2);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="truncate">{t.full_name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Select
                      value={selectedTeacher || ''}
                      onValueChange={(v) => {
                        setSelectedTeacher(v);
                        setCurrentStep(2);
                      }}
                    >
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
                  )}
                  {!isMobile && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setCurrentStep(2)}
                        disabled={!selectedTeacher}
                        className="touch-manipulation"
                      >
                        Continue
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
            )}
            
            {currentStep === 2 && (
              <Card className="border-border/50 bg-gradient-to-br from-muted/50 to-transparent">
                <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">Pick Date</Label>
                </div>
              </CardHeader>
                 <CardContent className="pt-0 pb-6 space-y-4">
                    <CalendarUI
                      mode="single"
                      selected={selectedDate}
                      captionLayout={isMobile ? 'dropdown' : 'label'}
                      showOutsideDays={!isMobile}
                      onSelect={(d) => {
                        if (d) {
                          setSelectedDate(d);
                          setCurrentStep(3);
                        }
                      }}
                      disabled={(d) => d < new Date(new Date().toDateString())}
                      className="rounded-md w-full"
                      modifiers={{
                        booked: (day) =>
                          bookedDates.has(
                            new Date(day.getFullYear(), day.getMonth(), day.getDate()).toDateString()
                          ),
                      }}
                    />
                    
                    <div className="flex justify-between gap-4 pt-4">
                      <Button variant="outline" onClick={() => setCurrentStep(1)} className="touch-manipulation w-24 sm:w-auto h-12 sm:h-11">
                        Back
                      </Button>
                      <Button onClick={() => setCurrentStep(3)} className="touch-manipulation flex-1 sm:flex-none h-12 sm:h-11">
                        Continue
                      </Button>
                    </div>
              </CardContent>
            </Card>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Removed mobile summary bar as requested */}
            <Card className="border-border/50 bg-gradient-to-br from-muted/50 to-transparent">
                  <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">Class Duration</Label>
                </div>
              </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedDuration === 30 ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedDuration(30);
                          setSelectedSlotIndex(null);
                    }}
                    className="touch-manipulation cursor-pointer"
                  >
                    <span className="pointer-events-none">30 min</span>
                  </Button>
                  <Button
                    variant={selectedDuration === 60 ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedDuration(60);
                          setSelectedSlotIndex(null);
                    }}
                    className="touch-manipulation cursor-pointer"
                  >
                    <span className="pointer-events-none">1 hour</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                  <CardContent className="pt-0 pb-6">
                    <div className="min-h-[160px] sm:min-h-[180px] lg:min-h-[200px]">
                  {!selectedTeacher ? (
                        <div className="flex flex-col items-center justify-center h-32 sm:h-36 text-center px-4">
                      <User className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
                      <p className="text-xs sm:text-sm text-muted-foreground">Please select a teacher to view available slots</p>
                    </div>
                   ) : loadingSlots ? (
                        <div className={`grid ${selectedDuration === 30 ? 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'} gap-2 sm:gap-3`}>
                      {Array.from({ length: selectedDuration === 30 ? 12 : 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 sm:h-12 rounded-lg" />
                      ))}
                    </div>
                   ) : slots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 sm:h-36 text-center px-4">
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
                      <p className="text-xs sm:text-sm text-muted-foreground">No available slots for {selectedDate.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Try selecting a different date</p>
                    </div>
                  ) : (
                         <ScrollArea className={`${selectedDuration === 30 ? 'h-[220px] xs:h-[240px] sm:h-[260px] lg:h-[300px]' : 'h-[180px] xs:h-[200px] sm:h-[220px] lg:h-[260px]'} px-2 sm:px-4`}>
                           <div className={`grid ${selectedDuration === 30 ? 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'} gap-2 sm:gap-3 text-center pt-1 pb-24`}>
                        {slots.map((s, i) => (
                          <Button
                            key={`${s.label}-${i}`}
                            variant={selectedSlotIndex === i ? 'default' : 'outline'}
                            onClick={() => {
                              setSelectedSlotIndex(i);
                            }}
                                 className={`h-11 xs:h-12 sm:h-12 w-full px-1.5 xs:px-2 overflow-hidden flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-200 hover:scale-105 text-[11px] xs:text-[13px] sm:text-sm touch-manipulation cursor-pointer ${selectedSlotIndex === i ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:border-primary/50 hover:bg-primary/5'}`}
                              >
                                <span className="font-semibold pointer-events-none truncate w-full">
                                  {isMobile
                                    ? s.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                                    : s.label}
                                </span>
                                <span className="text-[11px] opacity-70 hidden sm:inline pointer-events-none">
                              {s.duration === 60 ? '1hr' : `${s.duration}min`}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
                
                <div className="border-t border-border/30 pt-4 mt-4">
                  <div className="flex justify-between gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="touch-manipulation w-24 sm:w-auto h-12 sm:h-11">
                      Back
                    </Button>

                    <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          disabled={!selectedTeacher || selectedSlotIndex === null}
                          className="flex-1 sm:w-auto h-12 sm:h-11 px-4 sm:px-6 text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
                          size="lg"
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
                        <Button onClick={handleBook} className="bg-gradient-to-r from-primary to-primary/80 touch-manipulation">
                      Confirm Booking
                    </Button>
                  </DialogFooter>
                </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
            )}
          </motion.div>
        </AnimatePresence>

      </CardContent>
    </Card>
  );
}


