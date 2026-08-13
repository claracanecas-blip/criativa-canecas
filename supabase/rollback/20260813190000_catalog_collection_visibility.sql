begin;

drop index if exists public.collections_listed_order_idx;
alter table public.collections drop column if exists is_listed;

commit;
