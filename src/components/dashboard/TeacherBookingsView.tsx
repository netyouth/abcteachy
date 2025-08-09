 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';

export default function TeacherBookingsView() {
  const { user, role, loading: authLoading } = useAuth();
  // If admin, show all bookings; otherwise filter by current user's id (works for teachers and unknown roles)
  const shouldFilterByTeacher = role !== 'admin';
  const isAuthReady = !authLoading && !!user?.id;
  const { bookings, updateBooking, loading } = useBookings(
    shouldFilterByTeacher && user?.id ? { teacherId: user.id } : undefined
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Classes</CardTitle>
        <CardDescription>Manage your scheduled classes, confirm or complete.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {!isAuthReady || loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-sm text-muted-foreground">No bookings</div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between border rounded-md p-3">
              <div className="space-y-1">
                <div className="font-medium">{new Date(b.start_at).toLocaleString()} - {new Date(b.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-xs text-muted-foreground">Status: <Badge variant="outline">{b.status}</Badge></div>
              </div>
              <div className="flex items-center gap-2">
                {b.status !== 'confirmed' && b.status !== 'canceled' && b.status !== 'completed' && (
                  <Button size="sm" onClick={() => updateBooking(b.id, { status: 'confirmed' as any })}>Confirm</Button>
                )}
                {b.status !== 'completed' && b.status !== 'canceled' && (
                  <Button size="sm" variant="secondary" onClick={() => updateBooking(b.id, { status: 'completed' as any })}>Complete</Button>
                )}
                {b.status !== 'canceled' && (
                  <Button size="sm" variant="destructive" onClick={() => updateBooking(b.id, { status: 'canceled' as any })}>Cancel</Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}


