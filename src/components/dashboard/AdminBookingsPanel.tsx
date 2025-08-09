import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { useBookings } from '@/hooks/useBookings';

export default function AdminBookingsPanel() {
  const supabase = useMemo(() => createClient(), []);
  const { bookings, updateBooking, deleteBooking, loading } = useBookings();

  const overrideAssign = async (bookingId: string) => {
    // Simple example: rotates to the first teacher found
    const { data: teachers } = await supabase.from('profiles').select('id,full_name').eq('role', 'teacher').limit(1);
    if (teachers && teachers.length > 0) {
      await updateBooking(bookingId, { teacher_id: teachers[0].id } as any);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bookings</CardTitle>
        <CardDescription>Admin-level controls for all bookings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-sm text-muted-foreground">No bookings</div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between border rounded-md p-3">
              <div className="space-y-1">
                <div className="font-medium">{new Date(b.start_at).toLocaleString()} → {new Date(b.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-xs text-muted-foreground">Status: <Badge variant="outline">{b.status}</Badge></div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => overrideAssign(b.id)}>Assign Teacher</Button>
                <Button size="sm" variant="secondary" onClick={() => updateBooking(b.id, { status: 'confirmed' as any })}>Confirm</Button>
                <Button size="sm" variant="secondary" onClick={() => updateBooking(b.id, { status: 'completed' as any })}>Complete</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteBooking(b.id)}>Cancel</Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}


