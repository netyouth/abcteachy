import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Booking = Tables<'bookings'>;

export function useBookings(filters?: { studentId?: string; teacherId?: string; from?: string; to?: string; status?: 'pending' | 'confirmed' | 'canceled' | 'completed' | 'rescheduled' }) {
  const supabase = useMemo(() => createClient(), []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = !!(filters?.studentId || filters?.teacherId || filters?.from || filters?.to || filters?.status);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // If no filters provided, allow admins to fetch all bookings
      if (!hasFilters) {
        const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
        if (adminError) throw adminError;
        if (isAdmin) {
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('start_at', { ascending: true });
          if (error) throw error;
          setBookings((data as Booking[]) || []);
        } else {
          // Non-admins must use filters
          setBookings([]);
        }
        return;
      }
      // Prefer RPCs to avoid RLS edge cases on direct selects
      if (filters?.studentId && !filters?.teacherId) {
        // Prefer RPC; gracefully fallback to direct select if RPC is unavailable
        const rpcRes = await supabase.rpc('get_student_bookings', {
          p_student_id: filters.studentId,
          p_from: filters.from,
          p_to: filters.to,
        });
        if (!rpcRes.error && rpcRes.data) {
          setBookings((rpcRes.data as unknown as Booking[]) || []);
          return;
        }
        // Fallback path with RLS: direct select by student_id
        let q = supabase.from('bookings').select('*').order('start_at', { ascending: true }).eq('student_id', filters.studentId);
        if (filters?.from) q = q.gte('start_at', filters.from);
        if (filters?.to) q = q.lte('end_at', filters.to);
        const { data, error } = await q;
        if (error) throw error;
        setBookings((data as Booking[]) || []);
        return;
      }
      
      // For teacher-specific queries, use the RPC function
      if (filters?.teacherId && !filters?.studentId) {
        const { data, error } = await supabase.rpc('get_teacher_bookings', {
          p_teacher_id: filters.teacherId,
          p_from: filters.from,
          p_to: filters.to,
        });
        if (error) throw error;
        setBookings((data as unknown as Booking[]) || []);
        return;
      }

      // For complex queries or mixed filters, use direct select with RLS
      let q = supabase.from('bookings').select('*').order('start_at', { ascending: true });
      if (filters?.studentId) q = q.eq('student_id', filters.studentId);
      if (filters?.teacherId) q = q.eq('teacher_id', filters.teacherId);
      if (filters?.from) q = q.gte('start_at', filters.from);
      if (filters?.to) q = q.lte('end_at', filters.to);
      if (filters?.status) q = q.eq('status', filters.status);
      const { data, error } = await q;
      if (error) throw error;
      setBookings((data as Booking[]) || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [supabase, hasFilters, filters?.studentId, filters?.teacherId, filters?.from, filters?.to, filters?.status]);

  const createBooking = useCallback(async (payload: TablesInsert<'bookings'>) => {
    // Prefer RPC to avoid insert RLS edge cases
    const { error } = await supabase.rpc('create_booking', {
      p_student_id: payload.student_id,
      p_teacher_id: payload.teacher_id,
      p_start_at: payload.start_at,
      p_end_at: payload.end_at,
      p_created_by: payload.created_by ?? payload.student_id,
    });
    if (error) throw error;
    await fetchBookings();
    return undefined as unknown as Booking;
  }, [supabase, fetchBookings]);

  const updateBooking = useCallback(async (id: string, update: TablesUpdate<'bookings'>) => {
    // For status updates, use the RPC function to avoid RLS issues
    if (update.status && Object.keys(update).length === 1) {
      const { error } = await supabase.rpc('update_booking_status', {
        p_booking_id: id,
        p_status: update.status,
      });
      if (error) throw error;
    } else {
      // For other updates, use direct table update
      const { error } = await supabase.from('bookings').update(update).eq('id', id);
      if (error) throw error;
    }
    await fetchBookings();
  }, [supabase, fetchBookings]);

  const deleteBooking = useCallback(async (id: string) => {
    // Delete the booking record directly
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await fetchBookings();
  }, [supabase, fetchBookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
  };
}


