import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeacherAvailability } from '@/hooks/useTeacherAvailability';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const weekdays = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function TeacherAvailabilityManager() {
  const { user } = useAuth();
  const teacherId = user?.id;
  const { availabilities, loading, error, createAvailability, deleteAvailability } = useTeacherAvailability(teacherId);
  const supabase = useMemo(() => createClient(), []);
  const [busyRanges, setBusyRanges] = useState<{ start_at: string; end_at: string }[]>([]);

  const [form, setForm] = useState({ weekday: 1, start_time: '09:00', end_time: '10:00', slot_minutes: 60, timezone: 'UTC' });
  const grouped = useMemo(() => {
    return weekdays.map((w) => ({
      weekday: w.value,
      label: w.label,
      entries: availabilities.filter((a) => a.weekday === w.value),
    }));
  }, [availabilities]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;
    await createAvailability(form);
  };

  // Show teacher-specific unavailability (personal blocks)
  React.useEffect(() => {
    let isMounted = true;
    const loadBusy = async () => {
      if (!teacherId) return;
      const start = new Date();
      const end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000); // next 2 weeks
      const { data } = await supabase
        .from('teacher_unavailability')
        .select('start_at,end_at')
        .eq('teacher_id', teacherId)
        .lt('start_at', end.toISOString())
        .gt('end_at', start.toISOString());
      if (isMounted) setBusyRanges((data as any) || []);
    };
    loadBusy();
    return () => { isMounted = false; };
  }, [supabase, teacherId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability</CardTitle>
        <CardDescription>Set the times you are available for classes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="space-y-2">
            <Label>Day</Label>
            <Select value={String(form.weekday)} onValueChange={(v) => setForm((f) => ({ ...f, weekday: Number(v) }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {weekdays.map((w) => (
                  <SelectItem key={w.value} value={String(w.value)}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start</Label>
            <Input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>End</Label>
            <Input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Slot (min)</Label>
            <Input type="number" min={15} step={15} value={form.slot_minutes} onChange={(e) => setForm((f) => ({ ...f, slot_minutes: Number(e.target.value) }))} required />
          </div>
          <Button type="submit" disabled={loading}>Add</Button>
        </form>

        {error && <div className="text-destructive text-sm">{error}</div>}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Configured slots</div>
          <Badge variant="outline">{availabilities.length}</Badge>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : (
        <div className="space-y-4">
          {grouped.map((g) => (
            <div key={g.weekday} className="space-y-2">
              <div className="font-medium">{g.label}</div>
              {g.entries.length === 0 ? (
                <div className="text-sm text-muted-foreground">No availability</div>
              ) : (
                <div className="space-y-2">
                  {g.entries.map((a) => (
                    <div key={a.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <div className="font-medium">{a.start_time.slice(0,5)} - {a.end_time.slice(0,5)}</div>
                        <div className="text-xs text-muted-foreground">Slot: {a.slot_minutes} min • TZ: {a.timezone}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteAvailability(a.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="space-y-2">
            <div className="font-medium">Upcoming Unavailability</div>
            {busyRanges.length === 0 ? (
              <div className="text-sm text-muted-foreground">No personal blocks</div>
            ) : (
              <div className="space-y-2">
                {busyRanges.map((r, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground">
                    {new Date(r.start_at).toLocaleString()} - {new Date(r.end_at).toLocaleString()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  );
}


