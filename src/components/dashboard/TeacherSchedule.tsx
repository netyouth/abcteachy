import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherSchedule } from '@/hooks/useTeacherSchedule';

export default function TeacherSchedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { bookings, unavailability, loading, setBookingStatus, createBlock, deleteBlock } = useTeacherSchedule(user?.id, selectedDate);

  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [blockStart, setBlockStart] = useState<string>('09:00');
  const [blockEnd, setBlockEnd] = useState<string>('10:00');
  const [blockReason, setBlockReason] = useState<string>('');

  const dayLabel = useMemo(() => selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }), [selectedDate]);

  const toISO = (date: Date, hhmm: string) => {
    const [hh, mm] = hhmm.split(':').map(Number);
    const d = new Date(date);
    d.setHours(hh || 0, mm || 0, 0, 0);
    return d.toISOString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
        <CardDescription>Unified view of bookings and personal blocks. You are available by default.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <CalendarUI
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={() => false}
            className="rounded-md"
          />

          <Dialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Block Time</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block Time on {dayLabel}</DialogTitle>
                <DialogDescription>Add a personal block to prevent bookings.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Start</label>
                  <input type="time" className="mt-1 w-full border rounded-md p-2" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm">End</label>
                  <input type="time" className="mt-1 w-full border rounded-md p-2" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm">Reason (optional)</label>
                  <input type="text" className="mt-1 w-full border rounded-md p-2" placeholder="e.g., personal, meeting" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={async () => { await createBlock(toISO(selectedDate, blockStart), toISO(selectedDate, blockEnd), blockReason || undefined); setIsBlockOpen(false); }}>Save Block</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{dayLabel}</div>
            <Badge variant="outline">{bookings.length} bookings • {unavailability.length} blocks</Badge>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Bookings</div>
                {bookings.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No bookings</div>
                ) : (
                  bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between border rounded-md p-3">
                      <div className="space-y-1">
                        <div className="font-medium">{new Date(b.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-xs text-muted-foreground">Status: <Badge variant="outline">{b.status}</Badge></div>
                      </div>
                      <div className="flex items-center gap-2">
                        {b.status !== 'confirmed' && (
                          <Button size="sm" onClick={() => setBookingStatus(b.id, 'confirmed' as any)}>Confirm</Button>
                        )}
                        {b.status !== 'completed' && (
                          <Button size="sm" variant="secondary" onClick={() => setBookingStatus(b.id, 'completed' as any)}>Complete</Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => setBookingStatus(b.id, 'canceled' as any)}>Decline</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Personal Blocks</div>
                {unavailability.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No blocks</div>
                ) : (
                  unavailability.map((u) => (
                    <div key={u.id} className="flex items-center justify-between border rounded-md p-3">
                      <div className="space-y-1">
                        <div className="font-medium">{new Date(u.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(u.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        {u.reason && <div className="text-xs text-muted-foreground">{u.reason}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteBlock(u.id)}>Remove</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


