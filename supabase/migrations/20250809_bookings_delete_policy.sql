-- Allow teachers to delete their own bookings only when canceled; admins can delete any

begin;

alter table if exists public.bookings enable row level security;

drop policy if exists "bookings_delete_canceled_teacher_or_admin" on public.bookings;
create policy "bookings_delete_canceled_teacher_or_admin"
  on public.bookings
  for delete
  to authenticated
  using (
    (teacher_id = auth.uid() and status = 'canceled')
    or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

commit;



