begin;

revoke select on public.testimonials from authenticated;
grant select (id, author_display_name, quote, rating, photo_path, display_order)
on public.testimonials to authenticated;

create or replace function public.get_admin_testimonials()
returns setof public.testimonials
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_catalog_admin()) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  return query select * from public.testimonials order by updated_at desc;
end;
$$;

revoke all on function public.get_admin_testimonials() from public, anon;
grant execute on function public.get_admin_testimonials() to authenticated;

commit;
