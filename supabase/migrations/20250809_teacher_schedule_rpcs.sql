-- Secure RPCs for teacher schedule fetching

begin;

create or replace function public.get_teacher_day_schedule(
  p_teacher_id uuid,
  p_day_start timestamptz,
  p_day_end timestamptz
)
returns table (
  id uuid,
  start_at timestamptz,
  end_at timestamptz,
  status public.booking_status,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select b.id, b.start_at, b.end_at, b.status, b.created_at, b.updated_at
  from public.bookings b
  where (
    p_teacher_id = auth.uid() or public.is_admin()
  )
  and b.teacher_id = p_teacher_id
  and b.start_at >= p_day_start
  and b.end_at   <  p_day_end
  order by b.start_at asc;
$$;

grant execute on function public.get_teacher_day_schedule(uuid, timestamptz, timestamptz) to authenticated;

commit;





