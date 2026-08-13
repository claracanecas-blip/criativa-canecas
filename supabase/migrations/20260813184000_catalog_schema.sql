begin;

create table public.collections (
  id text primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) > 0),
  description text not null default '',
  icon_name text not null,
  image_path text,
  display_order integer not null default 0 check (display_order >= 0),
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sku text not null unique check (length(btrim(sku)) > 0),
  name text not null check (length(btrim(name)) > 0),
  theme text not null default '',
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_collections (
  product_id text not null references public.products(id) on delete cascade,
  collection_id text not null references public.collections(id) on delete cascade,
  display_order integer not null default 0 check (display_order >= 0),
  primary key (product_id, collection_id)
);

create table public.product_images (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  storage_path text not null check (length(btrim(storage_path)) > 0),
  variant text not null check (variant in ('original', 'card-320', 'card-640', 'social')),
  alt_text text not null check (length(btrim(alt_text)) > 0),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, variant, display_order)
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

create index product_collections_collection_order_idx
  on public.product_collections(collection_id, display_order, product_id);
create index product_images_product_order_idx
  on public.product_images(product_id, display_order, variant);
create index products_public_order_idx
  on public.products(status, display_order, id);
create index collections_public_order_idx
  on public.collections(is_published, display_order, id);

create or replace function public.set_catalog_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger collections_set_updated_at
before update on public.collections
for each row execute function public.set_catalog_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_catalog_updated_at();

create or replace function public.is_catalog_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_catalog_admin() from public;
grant execute on function public.is_catalog_admin() to authenticated;

alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_collections enable row level security;
alter table public.product_images enable row level security;
alter table public.admin_users enable row level security;

revoke all on public.collections from anon, authenticated;
revoke all on public.products from anon, authenticated;
revoke all on public.product_collections from anon, authenticated;
revoke all on public.product_images from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;

grant select on public.collections, public.products, public.product_collections, public.product_images
  to anon, authenticated;
grant insert, update, delete on public.collections, public.products, public.product_collections, public.product_images
  to authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

create policy collections_public_read
on public.collections for select
to anon, authenticated
using (is_published);

create policy products_public_read
on public.products for select
to anon, authenticated
using (status = 'published');

create policy product_collections_public_read
on public.product_collections for select
to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_collections.product_id
      and products.status = 'published'
  )
  and exists (
    select 1 from public.collections
    where collections.id = product_collections.collection_id
      and collections.is_published
  )
);

create policy product_images_public_read
on public.product_images for select
to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and products.status = 'published'
  )
);

create policy collections_admin_all
on public.collections for all
to authenticated
using ((select public.is_catalog_admin()))
with check ((select public.is_catalog_admin()));

create policy products_admin_all
on public.products for all
to authenticated
using ((select public.is_catalog_admin()))
with check ((select public.is_catalog_admin()));

create policy product_collections_admin_all
on public.product_collections for all
to authenticated
using ((select public.is_catalog_admin()))
with check ((select public.is_catalog_admin()));

create policy product_images_admin_all
on public.product_images for all
to authenticated
using ((select public.is_catalog_admin()))
with check ((select public.is_catalog_admin()));

create policy admin_users_self_or_admin_read
on public.admin_users for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_catalog_admin()));

create policy admin_users_admin_write
on public.admin_users for all
to authenticated
using ((select public.is_catalog_admin()))
with check ((select public.is_catalog_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/webp', 'image/png', 'image/jpeg']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and (select public.is_catalog_admin()));

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and (select public.is_catalog_admin()))
with check (bucket_id = 'product-images' and (select public.is_catalog_admin()));

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and (select public.is_catalog_admin()));

commit;
