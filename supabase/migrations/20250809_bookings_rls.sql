-- RLS for public.bookings
-- Ensures students can create their own bookings, participants can read/update their own,
-- and admins have full access.

begin;

alter table if exists public.bookings enable row level security;

-- Read: participants and admins
drop policy if exists "bookings_select_participants" on public.bookings;
create policy "bookings_select_participants"
  on public.bookings
  for select
  to authenticated
  using (
    student_id = auth.uid()
    or teacher_id = auth.uid()
    or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Insert: students create their own bookings with a valid teacher
drop policy if exists "bookings_insert_students" on public.bookings;
create policy "bookings_insert_students"
  on public.bookings
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and created_by = auth.uid()
    and teacher_id <> auth.uid()
    and exists (
      select 1 from public.profiles t
      where t.id = public.bookings.teacher_id and t.role = 'teacher'
    )
  );

-- Update: participants and admins can update their rows
-- (you may refine WITH CHECK to limit what fields each role may change)
drop policy if exists "bookings_update_participants" on public.bookings;
create policy "bookings_update_participants"
  on public.bookings
  for update
  to authenticated
  using (
    student_id = auth.uid()
    or teacher_id = auth.uid()
    or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    student_id = auth.uid()
    or teacher_id = auth.uid()
    or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

commit;
