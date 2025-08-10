-- RLS policies for teacher tables so teachers and admins can manage their data

begin;

-- Enable RLS
alter table if exists public.teacher_unavailability enable row level security;
alter table if exists public.teacher_availability enable row level security;

-- Teacher Unavailability Policies
drop policy if exists "tu_select_owner_admin" on public.teacher_unavailability;
create policy "tu_select_owner_admin"
  on public.teacher_unavailability
  for select
  to authenticated
  using (
    teacher_id = auth.uid() or public.is_admin()
  );

drop policy if exists "tu_insert_owner_admin" on public.teacher_unavailability;
create policy "tu_insert_owner_admin"
  on public.teacher_unavailability
  for insert
  to authenticated
  with check (
    teacher_id = auth.uid() or public.is_admin()
  );

drop policy if exists "tu_update_owner_admin" on public.teacher_unavailability;
create policy "tu_update_owner_admin"
  on public.teacher_unavailability
  for update
  to authenticated
  using (
    teacher_id = auth.uid() or public.is_admin()
  )
  with check (
    teacher_id = auth.uid() or public.is_admin()
  );

drop policy if exists "tu_delete_owner_admin" on public.teacher_unavailability;
create policy "tu_delete_owner_admin"
  on public.teacher_unavailability
  for delete
  to authenticated
  using (
    teacher_id = auth.uid() or public.is_admin()
  );

-- Teacher Availability Policies (teachers manage their own availability; public read could be via RPC)
drop policy if exists "ta_select_owner_admin" on public.teacher_availability;
create policy "ta_select_owner_admin"
  on public.teacher_availability
  for select
  to authenticated
  using (
    teacher_id = auth.uid() or public.is_admin()
  );

drop policy if exists "ta_insert_owner_admin" on public.teacher_availability;
create policy "ta_insert_owner_admin"
  on public.teacher_availability
  for insert
  to authenticated
  with check (
    teacher_id = auth.uid() or public.is_admin()
  );

drop policy if exists "ta_update_owner_admin" on public.teacher_availability;
create policy "ta_update_owner_admin"
  on public.teacher_availability
  for update
  to authenticated
  using (
    teacher_id = auth.uid() or public.is_admin()
  )
  with check (
    teacher_id = auth.uid() or public.is_admin()
  );

drop policy if exists "ta_delete_owner_admin" on public.teacher_availability;
create policy "ta_delete_owner_admin"
  on public.teacher_availability
  for delete
  to authenticated
  using (
    teacher_id = auth.uid() or public.is_admin()
  );

commit;





