begin;
drop policy if exists testimonials_admin_read on public.testimonials;
revoke usage, select on sequence public.testimonials_id_seq from authenticated;
commit;
