begin;

do $$
begin
  if not exists (
    select 1
    from public.collections
    where id = 'futebol'
      and is_published
  ) then
    raise exception 'A coleção publicada futebol é obrigatória.';
  end if;
end;
$$;

create temporary table selected_football_products (
  number integer primary key,
  theme text not null,
  variant_number integer not null
) on commit drop;

insert into selected_football_products (number, theme, variant_number)
values
  (1, 'Flamengo', 1), (2, 'Flamengo', 2), (3, 'Flamengo', 3), (4, 'Flamengo', 4), (5, 'Flamengo', 5),
  (6, 'Corinthians', 1), (7, 'Corinthians', 2), (8, 'Corinthians', 3),
  (9, 'São Paulo', 1), (10, 'São Paulo', 2), (11, 'São Paulo', 3), (12, 'São Paulo', 4),
  (13, 'São Paulo', 5), (14, 'São Paulo', 6), (15, 'São Paulo', 7),
  (16, 'Palmeiras', 1), (17, 'Palmeiras', 2), (18, 'Palmeiras', 3), (19, 'Palmeiras', 4),
  (20, 'Palmeiras', 5), (21, 'Palmeiras', 6), (22, 'Palmeiras', 7),
  (23, 'Cruzeiro', 1), (24, 'Cruzeiro', 2), (25, 'Vasco', 1),
  (26, 'Grêmio', 1), (27, 'Grêmio', 2), (28, 'Grêmio', 3), (29, 'Grêmio', 4),
  (30, 'Atlético Mineiro', 1), (31, 'Santos', 1), (32, 'Santos', 2), (33, 'Santos', 3),
  (34, 'Internacional', 1), (35, 'Internacional', 2), (36, 'Internacional', 3),
  (37, 'Botafogo', 1), (38, 'Botafogo', 2), (39, 'Fluminense', 1), (40, 'Bahia', 1),
  (41, 'Sport Recife', 1), (42, 'Fortaleza', 1), (43, 'Ceará', 1),
  (44, 'Athletico Paranaense', 1), (45, 'Real Madrid', 1), (46, 'Real Madrid', 2),
  (47, 'Barcelona', 1), (48, 'Barcelona', 2), (49, 'Chelsea', 1), (50, 'Chelsea', 2);

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
  'futebol-' || lpad(number::text, 2, '0'),
  'futebol-' || lpad(number::text, 2, '0'),
  'CC-FUTEBOL-' || lpad(number::text, 2, '0'),
  theme || ' ' || lpad(variant_number::text, 2, '0'),
  theme,
  'Caneca personalizada ' || theme || ' ' || lpad(variant_number::text, 2, '0') || ', tema Futebol & Esportes.',
  39.90,
  'published',
  false,
  number - 1,
  theme || ' ' || lpad(variant_number::text, 2, '0') || ' | Criativa Canecas',
  'Conheça a caneca ' || theme || ' ' || lpad(variant_number::text, 2, '0') || ' personalizada pela Criativa Canecas.'
from selected_football_products
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
  'futebol-' || lpad(number::text, 2, '0'),
  'futebol',
  number - 1
from selected_football_products
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
  selected.theme || ' ' || lpad(selected.variant_number::text, 2, '0'),
  image.width,
  image.height,
  0
from selected_football_products as selected
cross join lateral (
  select 'futebol-' || lpad(selected.number::text, 2, '0') as product_id
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
