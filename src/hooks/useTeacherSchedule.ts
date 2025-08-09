import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Booking = Tables<'bookings'>;
export type Unavailability = Tables<'teacher_unavailability'>;

export function useTeacherSchedule(teacherId?: string, day?: Date) {
  const supabase = useMemo(() => createClient(), []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [unavailability, setUnavailability] = useState<Unavailability[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDayData = useCallback(async () => {
    if (!teacherId || !day) return;
    setLoading(true);
    setError(null);
    try {
      // Use local midnight boundaries for the selected date to align with UI expectations
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const [{ data: b }, { data: u }] = await Promise.all([
        supabase.rpc('get_teacher_day_schedule', {
          p_teacher_id: teacherId,
          p_day_start: dayStart.toISOString(),
          p_day_end: dayEnd.toISOString(),
        }),
        supabase
          .from('teacher_unavailability')
          .select('*')
          .eq('teacher_id', teacherId)
          .lt('start_at', dayEnd.toISOString())
          .gt('end_at', dayStart.toISOString())
          .order('start_at', { ascending: true })
      ]);

      setBookings((b as Booking[]) || []);
      setUnavailability((u as Unavailability[]) || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, [supabase, teacherId, day]);

  useEffect(() => {
    fetchDayData();
  }, [fetchDayData]);

  // Realtime updates for bookings and unavailability affecting this teacher
  useEffect(() => {
    if (!teacherId) return;
    const channel = supabase
      .channel(`teacher-schedule-${teacherId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `teacher_id=eq.${teacherId}` },
        () => {
          fetchDayData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teacher_unavailability', filter: `teacher_id=eq.${teacherId}` },
        () => {
          fetchDayData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, teacherId, fetchDayData]);

  const createBlock = useCallback(async (start: string, end: string, reason?: string) => {
    if (!teacherId) throw new Error('Missing teacher');
    const payload: TablesInsert<'teacher_unavailability'> = {
      teacher_id: teacherId,
      start_at: start,
      end_at: end,
      reason: reason || null,
    } as any;
    const { error } = await supabase.from('teacher_unavailability').insert(payload);
    if (error) throw error;
    await fetchDayData();
  }, [supabase, teacherId, fetchDayData]);

  const deleteBlock = useCallback(async (id: string) => {
    const { error } = await supabase.from('teacher_unavailability').delete().eq('id', id);
    if (error) throw error;
    await fetchDayData();
  }, [supabase, fetchDayData]);

  const setBookingStatus = useCallback(async (id: string, status: Booking['status']) => {
    // Use direct update; RLS permits teacher updates on own bookings
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) throw error;
    await fetchDayData();
  }, [supabase, fetchDayData]);

  const deleteBooking = useCallback(async (id: string) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
    await fetchDayData();
  }, [supabase, fetchDayData]);

  return {
    bookings,
    unavailability,
    loading,
    error,
    refetch: fetchDayData,
    createBlock,
    deleteBlock,
    setBookingStatus,
    deleteBooking,
  };
}


