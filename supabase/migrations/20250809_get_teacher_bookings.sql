-- Secure helper RPC to fetch teacher bookings with optional date range
-- Enforces that only the teacher themselves or admins can use it

begin;

create or replace function public.get_teacher_bookings(
  p_teacher_id uuid,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns setof public.bookings
language sql
security definer
stable
set search_path = public
as $$
  select b.*
  from public.bookings b
  where (
    -- Only the teacher themselves, or admins, can view
    (p_teacher_id = auth.uid())
    or public.is_admin()
  )
  and b.teacher_id = p_teacher_id
  and (p_from is null or b.start_at >= p_from)
  and (p_to is null or b.end_at <= p_to)
  order by b.start_at asc;
$$;

grant execute on function public.get_teacher_bookings(uuid, timestamptz, timestamptz) to authenticated;

commit;





