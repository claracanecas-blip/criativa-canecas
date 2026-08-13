begin;

drop policy if exists product_images_admin_delete on storage.objects;
drop policy if exists product_images_admin_update on storage.objects;
drop policy if exists product_images_admin_insert on storage.objects;
drop policy if exists product_images_public_read on storage.objects;

drop table if exists public.product_images;
drop table if exists public.product_collections;
drop table if exists public.products;
drop table if exists public.collections;
drop table if exists public.admin_users;
drop function if exists public.is_catalog_admin();
drop function if exists public.set_catalog_updated_at();

commit;
