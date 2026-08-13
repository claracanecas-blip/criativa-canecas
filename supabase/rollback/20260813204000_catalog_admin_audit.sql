begin;

drop trigger if exists collections_audit_change on public.collections;
drop trigger if exists products_audit_change on public.products;
drop trigger if exists collections_set_actor on public.collections;
drop trigger if exists products_set_actor on public.products;
drop function if exists public.log_catalog_change();
drop function if exists public.set_catalog_actor();
drop table if exists public.catalog_audit_logs;

alter table public.collections
  drop column if exists created_by,
  drop column if exists updated_by;

alter table public.products
  drop column if exists created_by,
  drop column if exists updated_by;

commit;
