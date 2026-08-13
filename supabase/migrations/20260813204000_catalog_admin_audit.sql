begin;

alter table public.collections
  add column created_by uuid references auth.users(id) on delete set null,
  add column updated_by uuid references auth.users(id) on delete set null;

alter table public.products
  add column created_by uuid references auth.users(id) on delete set null,
  add column updated_by uuid references auth.users(id) on delete set null;

create table public.catalog_audit_logs (
  id bigint generated always as identity primary key,
  entity_type text not null check (entity_type in ('collection', 'product')),
  entity_id text not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  actor_id uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index catalog_audit_logs_entity_idx
  on public.catalog_audit_logs(entity_type, entity_id, changed_at desc);

create or replace function public.set_catalog_actor()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce((select auth.uid()), new.created_by);
  end if;
  new.updated_by := coalesce((select auth.uid()), new.updated_by);
  return new;
end;
$$;

create trigger collections_set_actor
before insert or update on public.collections
for each row execute function public.set_catalog_actor();

create trigger products_set_actor
before insert or update on public.products
for each row execute function public.set_catalog_actor();

create or replace function public.log_catalog_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id text;
  target_type text;
begin
  target_id := case when tg_op = 'DELETE' then old.id else new.id end;
  target_type := case when tg_table_name = 'collections' then 'collection' else 'product' end;

  insert into public.catalog_audit_logs (entity_type, entity_id, action, actor_id)
  values (target_type, target_id, lower(tg_op), (select auth.uid()));

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger collections_audit_change
after insert or update or delete on public.collections
for each row execute function public.log_catalog_change();

create trigger products_audit_change
after insert or update or delete on public.products
for each row execute function public.log_catalog_change();

revoke all on function public.set_catalog_actor() from public, anon, authenticated;
revoke all on function public.log_catalog_change() from public, anon, authenticated;

alter table public.catalog_audit_logs enable row level security;
revoke all on public.catalog_audit_logs from anon, authenticated;
grant select on public.catalog_audit_logs to authenticated;

create policy catalog_audit_logs_admin_read
on public.catalog_audit_logs for select
to authenticated
using ((select public.is_catalog_admin()));

commit;
