begin;

do $$
begin
  if not exists (
    select 1
    from public.collections
    where id = 'pets'
      and is_published
  ) then
    raise exception 'A coleção publicada pets é obrigatória.';
  end if;
end;
$$;

insert into public.products (
  id,
  slug,
  sku,
  name,
  theme,
  description,
  price,
  status,
  is_featured,
  display_order,
  seo_title,
  seo_description
)
select
  'pets-' || lpad(number::text, 2, '0'),
  'pets-' || lpad(number::text, 2, '0'),
  'CC-PETS-' || lpad(number::text, 2, '0'),
  'Pets ' || lpad(number::text, 2, '0'),
  'Pets',
  'Caneca personalizada Pets ' || lpad(number::text, 2, '0') || ', tema Pets.',
  39.90,
  'published',
  false,
  number - 1,
  'Pets ' || lpad(number::text, 2, '0') || ' | Criativa Canecas',
  'Conheça a caneca Pets ' || lpad(number::text, 2, '0') || ' personalizada pela Criativa Canecas.'
from generate_series(1, 50) as series(number)
on conflict (id) do update set
  slug = excluded.slug,
  sku = excluded.sku,
  name = excluded.name,
  theme = excluded.theme,
  description = excluded.description,
  price = excluded.price,
  status = excluded.status,
  is_featured = excluded.is_featured,
  display_order = excluded.display_order,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;

insert into public.product_collections (product_id, collection_id, display_order)
select
  'pets-' || lpad(number::text, 2, '0'),
  'pets',
  number - 1
from generate_series(1, 50) as series(number)
on conflict (product_id, collection_id) do update set
  display_order = excluded.display_order;

insert into public.product_images (
  id,
  product_id,
  storage_path,
  variant,
  alt_text,
  width,
  height,
  display_order
)
select
  product_id || '--' || image.variant,
  product_id,
  image.directory || product_id || '.webp',
  image.variant,
  'Pets ' || lpad(number::text, 2, '0'),
  image.width,
  image.height,
  0
from generate_series(1, 50) as series(number)
cross join lateral (
  select 'pets-' || lpad(number::text, 2, '0') as product_id
) as product
cross join (
  values
    ('original', '', 1000, 1000),
    ('card-320', 'card/320/', 320, 320),
    ('card-640', 'card/640/', 640, 640),
    ('social', 'social/', 1200, 630)
) as image(variant, directory, width, height)
on conflict (id) do update set
  product_id = excluded.product_id,
  storage_path = excluded.storage_path,
  variant = excluded.variant,
  alt_text = excluded.alt_text,
  width = excluded.width,
  height = excluded.height,
  display_order = excluded.display_order;

commit;
