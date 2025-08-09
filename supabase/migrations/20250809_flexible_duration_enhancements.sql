-- Enhancements for flexible duration booking system
-- Adds helpful functions for managing 30min and 1hr bookings

begin;

-- Function to get booking duration in minutes
create or replace function public.get_booking_duration_minutes(booking_start timestamptz, booking_end timestamptz)
returns integer
language sql
immutable
as $$
  select extract(epoch from (booking_end - booking_start))::integer / 60;
$$;

-- Enhanced function to get teacher bookings with duration info
create or replace function public.get_teacher_bookings_with_duration(
  p_teacher_id uuid,
  p_from timestamptz default now(),
  p_to timestamptz default (now() + interval '30 days')
)
returns table (
  id uuid,
  student_id uuid,
  teacher_id uuid,
  start_at timestamptz,
  end_at timestamptz,
  duration_minutes integer,
  status public.booking_status,
  created_at timestamptz,
  created_by uuid,
  feedback text,
  metadata jsonb,
  student_name text
)
language sql
security definer
stable
set search_path = public
as $$
  select 
    b.id,
    b.student_id,
    b.teacher_id,
    b.start_at,
    b.end_at,
    public.get_booking_duration_minutes(b.start_at, b.end_at) as duration_minutes,
    b.status,
    b.created_at,
    b.created_by,
    b.feedback,
    b.metadata,
    coalesce(s.full_name, s.email, 'Unknown Student') as student_name
  from public.bookings b
  left join public.profiles s on s.id = b.student_id
  where (
    p_teacher_id = auth.uid() or public.is_admin()
  )
  and b.teacher_id = p_teacher_id
  and b.start_at >= p_from
  and b.end_at <= p_to
  order by b.start_at asc;
$$;

grant execute on function public.get_booking_duration_minutes(timestamptz, timestamptz) to authenticated;
grant execute on function public.get_teacher_bookings_with_duration(uuid, timestamptz, timestamptz) to authenticated;

-- Function to get available slots with specific duration
create or replace function public.get_available_slots_for_duration(
  p_teacher_id uuid,
  p_date date,
  p_duration_minutes integer
)
returns table (
  slot_start timestamptz,
  slot_end timestamptz,
  duration_minutes integer
)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  day_start timestamptz;
  day_end timestamptz;
  availability_record record;
  current_slot_start timestamptz;
  current_slot_end timestamptz;
begin
  -- Set day boundaries
  day_start := p_date::timestamptz;
  day_end := day_start + interval '1 day';
  
  -- Get teacher availability for this weekday
  for availability_record in
    select start_time, end_time, slot_minutes, is_active
    from public.teacher_availability
    where teacher_id = p_teacher_id
      and weekday = extract(dow from p_date)::integer
      and is_active = true
  loop
    -- Parse time slots
    current_slot_start := day_start + availability_record.start_time::time;
    
    -- Generate slots with requested duration
    while current_slot_start + (p_duration_minutes * interval '1 minute') <= day_start + availability_record.end_time::time loop
      current_slot_end := current_slot_start + (p_duration_minutes * interval '1 minute');
      
      -- Check if slot conflicts with existing bookings
      if not exists (
        select 1 from public.bookings
        where teacher_id = p_teacher_id
          and status != 'canceled'
          and (
            (start_at < current_slot_end and end_at > current_slot_start)
          )
      ) then
        -- Check if slot conflicts with unavailability
        if not exists (
          select 1 from public.teacher_unavailability
          where teacher_id = p_teacher_id
            and (
              (start_at < current_slot_end and end_at > current_slot_start)
            )
        ) then
          return query select current_slot_start, current_slot_end, p_duration_minutes;
        end if;
      end if;
      
      -- Move to next slot
      current_slot_start := current_slot_start + (coalesce(availability_record.slot_minutes, 30) * interval '1 minute');
    end loop;
  end loop;
end;
$$;

grant execute on function public.get_available_slots_for_duration(uuid, date, integer) to authenticated;

commit;