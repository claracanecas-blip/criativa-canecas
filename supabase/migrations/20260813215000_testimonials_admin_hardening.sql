begin;

grant usage, select on sequence public.testimonials_id_seq to authenticated;

create policy testimonials_admin_read
on public.testimonials for select
to authenticated
using ((select public.is_catalog_admin()));

commit;
