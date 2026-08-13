begin;
drop function if exists public.get_admin_testimonials();
grant select on public.testimonials to authenticated;
commit;
