-- Simplify bookings RLS to use security-definer admin check
-- Ensures admins can read/update all bookings without cross-table RLS

begin;

-- Replace SELECT policy to use public.is_admin()
drop policy if exists "bookings_select_participants" on public.bookings;
create policy "bookings_select_participants"
  on public.bookings
  for select
  to authenticated
  using (
    student_id = auth.uid()
    or teacher_id = auth.uid()
    or public.is_admin()
  );

-- Replace UPDATE policy to use public.is_admin()
drop policy if exists "bookings_update_participants" on public.bookings;
create policy "bookings_update_participants"
  on public.bookings
  for update
  to authenticated
  using (
    student_id = auth.uid()
    or teacher_id = auth.uid()
    or public.is_admin()
  )
  with check (
    student_id = auth.uid()
    or teacher_id = auth.uid()
    or public.is_admin()
  );

commit;





