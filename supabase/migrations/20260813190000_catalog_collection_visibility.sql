begin;

alter table public.collections
  add column is_listed boolean not null default true;

create index collections_listed_order_idx
  on public.collections(is_published, is_listed, display_order, id);

commit;
