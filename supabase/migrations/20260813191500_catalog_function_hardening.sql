begin;

revoke all on function public.set_catalog_updated_at() from public, anon, authenticated;

commit;
