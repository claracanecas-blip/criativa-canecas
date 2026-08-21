begin;

do $$
begin
  if not exists (
    select 1 from public.collections where id = 'amizade' and is_published
  ) then
    raise exception 'A coleção publicada amizade é obrigatória.';
  end if;

  if exists (
    select 1
    from public.products
    where id in (
      select 'amizade-' || lpad(number::text, 2, '0')
      from generate_series(43, 72) as series(number)
    )
  ) then
    raise exception 'Um ou mais produtos amizade-43 a amizade-72 já existem.';
  end if;
end;
$$;

insert into public.products (
  id, slug, sku, name, theme, description, price, status, is_featured,
  display_order, seo_title, seo_description
)
select
  'amizade-' || lpad(number::text, 2, '0'),
  'amizade-' || lpad(number::text, 2, '0'),
  'CC-AMIZADE-' || lpad(number::text, 2, '0'),
  'Amizade ' || lpad(number::text, 2, '0'),
  'Amizade',
  'Caneca personalizada Amizade ' || lpad(number::text, 2, '0') || ', coleção Amizade.',
  39.90,
  'published',
  false,
  number,
  'Amizade ' || lpad(number::text, 2, '0') || ' | Criativa Canecas',
  'Conheça a caneca Amizade ' || lpad(number::text, 2, '0') || ' personalizada pela Criativa Canecas.'
from generate_series(43, 72) as series(number);

insert into public.product_collections (product_id, collection_id, display_order)
select
  'amizade-' || lpad(number::text, 2, '0'),
  'amizade',
  number
from generate_series(43, 72) as series(number);

insert into public.product_images (
  id, product_id, storage_path, variant, alt_text, width, height, display_order
)
select
  product_id || '--' || image.variant,
  product_id,
  image.directory || product_id || '.webp',
  image.variant,
  'Amizade ' || lpad(selected.number::text, 2, '0'),
  image.width,
  image.height,
  0
from generate_series(43, 72) as selected(number)
cross join lateral (
  select 'amizade-' || lpad(selected.number::text, 2, '0') as product_id
) as product
cross join (
  values
    ('original', '', 1000, 1000),
    ('card-320', 'card/320/', 320, 320),
    ('card-640', 'card/640/', 640, 640),
    ('social', 'social/', 1200, 630)
) as image(variant, directory, width, height);

commit;
