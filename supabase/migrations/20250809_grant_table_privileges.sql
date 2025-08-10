-- Ensure authenticated role has base privileges so RLS policies can apply

begin;

grant usage on schema public to authenticated;

-- Bookings: allow CRUD with RLS enforcing row access
grant select, insert, update, delete on table public.bookings to authenticated;

-- Teacher availability/unavailability
grant select, insert, update, delete on table public.teacher_unavailability to authenticated;
grant select, insert, update, delete on table public.teacher_availability to authenticated;

commit;



