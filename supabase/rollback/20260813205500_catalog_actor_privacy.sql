begin;

grant select on public.collections to anon, authenticated;
grant select on public.products to anon, authenticated;

commit;
