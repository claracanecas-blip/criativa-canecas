begin;

revoke select on public.collections from anon, authenticated;
grant select (
  id, slug, name, description, icon_name, image_path, display_order,
  is_published, is_listed, seo_title, seo_description, created_at, updated_at
) on public.collections to anon, authenticated;

revoke select on public.products from anon, authenticated;
grant select (
  id, slug, sku, name, theme, description, price, status, is_featured,
  display_order, seo_title, seo_description, created_at, updated_at
) on public.products to anon, authenticated;

commit;
