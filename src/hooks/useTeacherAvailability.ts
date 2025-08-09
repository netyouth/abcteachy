import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type TeacherAvailability = Tables<'teacher_availability'>;

export interface AvailabilityForm {
  weekday: number;
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  slot_minutes: number;
  timezone?: string;
}

export function useTeacherAvailability(teacherId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [availabilities, setAvailabilities] = useState<TeacherAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailabilities = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('teacher_availability')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('weekday', { ascending: true })
        .order('start_time', { ascending: true });
      if (error) throw error;
      setAvailabilities((data as TeacherAvailability[]) || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, [supabase, teacherId]);

  const createAvailability = useCallback(async (form: AvailabilityForm) => {
    if (!teacherId) throw new Error('Missing teacher');
    const payload: TablesInsert<'teacher_availability'> = {
      teacher_id: teacherId,
      weekday: form.weekday,
      start_time: form.start_time + ':00',
      end_time: form.end_time + ':00',
      slot_minutes: form.slot_minutes,
      timezone: form.timezone || 'UTC',
    } as any;
    const { data, error } = await supabase
      .from('teacher_availability')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    await fetchAvailabilities();
    return data as TeacherAvailability;
  }, [supabase, teacherId, fetchAvailabilities]);

  const updateAvailability = useCallback(async (id: string, update: Partial<TeacherAvailability>) => {
    const patch: TablesUpdate<'teacher_availability'> = update as any;
    const { error } = await supabase
      .from('teacher_availability')
      .update(patch)
      .eq('id', id);
    if (error) throw error;
    await fetchAvailabilities();
  }, [supabase, fetchAvailabilities]);

  const deleteAvailability = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('teacher_availability')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await fetchAvailabilities();
  }, [supabase, fetchAvailabilities]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  return {
    availabilities,
    loading,
    error,
    refetch: fetchAvailabilities,
    createAvailability,
    updateAvailability,
    deleteAvailability,
  };
}





