import { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Calendar } from 'lucide-react';
import { STATUS_BADGE_TONE, listItem } from '@/components/dashboard/ui';

type Booking = Tables<'bookings'>;

export default function AdminBookingsPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First check if user is admin and get current user info
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check user role using multiple methods
      let userRole = null;
      
      // Method 1: Check user metadata (most reliable for this case)
      if (user.user_metadata?.role) {
        userRole = user.user_metadata.role;
        console.log('Role from user_metadata:', userRole);
      }
      
      // Method 2: Check app metadata
      if (!userRole && user.app_metadata?.role) {
        userRole = user.app_metadata.role;
        console.log('Role from app_metadata:', userRole);
      }
      
      // Method 3: Check profiles table (fallback)
      if (!userRole) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (!profileError && profile) {
          userRole = profile.role;
          console.log('Role from profiles table:', userRole);
        } else {
          console.error('Profile query error:', profileError);
        }
      }

      console.log('Final determined user role:', userRole);

      if (userRole !== 'admin') {
        throw new Error('Admin access required');
      }

      // Use RPC function that bypasses RLS for admin queries
      let bookingsData;
      
      // Try RPC first - this should work for admin users
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_all_bookings_admin' as any);

      if (rpcError) {
        console.log('RPC failed:', rpcError?.message);
        throw new Error(`Admin booking query failed: ${rpcError.message}`);
      }

      // Transform RPC data to match expected format
      const rpcArray = Array.isArray(rpcData) ? rpcData : [];
      bookingsData = rpcArray.map((item: any) => ({
        ...item,
        id: item.booking_id, // Map booking_id back to id
        student: { full_name: item.student_name },
        teacher: { full_name: item.teacher_name }
      }));
      
      console.log('Fetched bookings:', bookingsData?.length);
      setBookings(bookingsData || []);
    } catch (e: any) {
      console.error('Error fetching bookings:', e);
      setError(e.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateBooking = useCallback(async (id: string, update: Partial<Booking>) => {
    try {
      const { error } = await supabase.from('bookings').update(update).eq('id', id);
      if (error) throw error;
      await fetchAllBookings();
    } catch (e: any) {
      console.error('Error updating booking:', e);
    }
  }, [supabase, fetchAllBookings]);

  const deleteBooking = useCallback(async (id: string) => {
    try {
      console.log('Deleting booking:', id);
      const { data, error } = await supabase.rpc('delete_booking_admin' as any, {
        p_booking_id: id
      });
      
      if (error) {
        console.error('Delete RPC error:', error);
        throw error;
      }
      
      console.log('Booking deleted successfully:', data);
      await fetchAllBookings();
    } catch (e: any) {
      console.error('Error deleting booking:', e);
      setError(`Failed to delete booking: ${e.message}`);
    }
  }, [supabase, fetchAllBookings]);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  const overrideAssign = async (bookingId: string) => {
    // Simple example: rotates to the first teacher found
    const { data: teachers } = await supabase.from('profiles').select('id,full_name').eq('role', 'teacher').limit(1);
    if (teachers && teachers.length > 0) {
      await updateBooking(bookingId, { teacher_id: teachers[0].id } as any);
    }
  };

  // Use shared status tones for consistency across dashboards

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-sm text-destructive">{error}</div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>Manage bookings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <div className="text-sm text-muted-foreground">No bookings</div>
            </div>
          ) : (
            bookings.map((b: any) => (
              <div key={b.id} className={listItem("flex flex-col md:flex-row md:items-center justify-between gap-3")}>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(b.start_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      {' '}• {new Date(b.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{b.student?.full_name || 'Student'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-medium">{b.teacher?.full_name || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-2 md:justify-end">
                  <Badge variant="outline" className={`capitalize ${STATUS_BADGE_TONE[b.status] || ''}`}>{b.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => overrideAssign(b.id)}>
                    Assign
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => updateBooking(b.id, { status: 'confirmed' })}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => updateBooking(b.id, { status: 'completed' })}>
                    Complete
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteBooking(b.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}


