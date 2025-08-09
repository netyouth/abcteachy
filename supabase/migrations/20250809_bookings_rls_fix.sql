-- Fix bookings insert policy by avoiding cross-table RLS in policy checks
-- Introduce a SECURITY DEFINER helper to verify teacher role safely

begin;

-- Helper: check if a user is a teacher (bypasses RLS via SECURITY DEFINER)
create or replace function public.is_user_teacher(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles t
    where t.id = p_user_id
      and t.role = 'teacher'
  );
$$;

grant execute on function public.is_user_teacher(uuid) to authenticated;

-- Recreate insert policy to use helper function instead of cross-table EXISTS
drop policy if exists "bookings_insert_students" on public.bookings;
create policy "bookings_insert_students"
  on public.bookings
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and created_by = auth.uid()
    and teacher_id <> auth.uid()
    and public.is_user_teacher(teacher_id)
  );

commit;


