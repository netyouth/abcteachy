import { Tables } from '@/integrations/supabase/types';

export type TeacherAvailability = Tables<'teacher_availability'>;
export type Booking = Tables<'bookings'>;

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string; // e.g., "10:00 - 11:00"
  duration: number; // duration in minutes
}

export function getWeekdayIndex(date: Date): number {
  return date.getDay(); // 0-6, Sunday = 0
}

function parseTimeToDate(date: Date, timeStr: string): Date {
  const [hh, mm, ss] = timeStr.split(':').map((v) => parseInt(v, 10));
  const dt = new Date(date);
  dt.setHours(hh || 0, mm || 0, ss || 0, 0);
  return dt;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function formatSlotLabel(start: Date, end: Date): string {
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${fmt(start)} - ${fmt(end)}`;
}

export function generateAvailableSlots(
  date: Date,
  availabilities: TeacherAvailability[],
  existingBookings: Booking[],
  unavailability: { start_at: string; end_at: string }[] = [],
  requestedDuration?: number // Optional: override slot duration (30 or 60 minutes)
): TimeSlot[] {
  const weekday = getWeekdayIndex(date);
  const dayAvailabilities = availabilities.filter((a) => a.is_active && a.weekday === weekday);
  if (dayAvailabilities.length === 0) return [];

  const now = new Date();
  const slots: TimeSlot[] = [];

  for (const a of dayAvailabilities) {
    const slotMinutes = requestedDuration || a.slot_minutes || 30;
    const start = parseTimeToDate(date, a.start_time);
    const end = parseTimeToDate(date, a.end_time);
    
    let cursor = new Date(start);
    while (cursor < end) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + slotMinutes * 60 * 1000);
      if (slotEnd > end) break;

      // Skip past slots if date is today
      if (slotStart < now && date.toDateString() === now.toDateString()) {
        cursor = new Date(cursor.getTime() + slotMinutes * 60 * 1000);
        continue;
      }

      const conflicts = existingBookings.some((b) => {
        if (b.status === 'canceled') return false as any; // Types are strings; rely on enum values
        const bStart = new Date(b.start_at);
        const bEnd = new Date(b.end_at);
        return overlaps(slotStart, slotEnd, bStart, bEnd);
      });

      const blocked = conflicts || unavailability.some((u) => overlaps(slotStart, slotEnd, new Date(u.start_at), new Date(u.end_at)));

      if (!blocked) {
        slots.push({ 
          start: slotStart, 
          end: slotEnd, 
          label: formatSlotLabel(slotStart, slotEnd),
          duration: slotMinutes
        });
      }

      cursor = new Date(cursor.getTime() + slotMinutes * 60 * 1000);
    }
  }

  // Sort slots by start time
  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  return slots;
}

export function toISO(date: Date): string {
  return date.toISOString();
}


