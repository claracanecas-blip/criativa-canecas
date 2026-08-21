begin;

with restored_products (
  id, slug, sku, name, theme, description, price, status, is_featured,
  display_order, seo_title, seo_description
) as (
  values
    (
      'animes-027', 'animes-027', 'CC-ANIMES-027', 'Fairy Tail 01', 'Fairy Tail',
      'Caneca personalizada Fairy Tail 01, coleção Animes.', 39.90, 'published', false,
      69, 'Fairy Tail 01 | Criativa Canecas',
      'Conheça a caneca Fairy Tail 01 personalizada pela Criativa Canecas.'
    ),
    (
      'animes-083', 'animes-083', 'CC-ANIMES-083', 'Hunter x Hunter 02', 'Hunter x Hunter',
      'Caneca personalizada Hunter x Hunter 02, coleção Animes.', 39.90, 'published', false,
      125, 'Hunter x Hunter 02 | Criativa Canecas',
      'Conheça a caneca Hunter x Hunter 02 personalizada pela Criativa Canecas.'
    )
)
insert into public.products (
  id, slug, sku, name, theme, description, price, status, is_featured,
  display_order, seo_title, seo_description
)
select * from restored_products
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
values
  ('animes-027', 'animes', 69),
  ('animes-083', 'animes', 125)
on conflict (product_id, collection_id) do update
set display_order = excluded.display_order;

with restored_images (product_id, name) as (
  values
    ('animes-027', 'Fairy Tail 01'),
    ('animes-083', 'Hunter x Hunter 02')
)
insert into public.product_images (
  id, product_id, storage_path, variant, alt_text, width, height, display_order
)
select
  restored.product_id || '--' || variant.name,
  restored.product_id,
  variant.directory || restored.product_id || '.webp',
  variant.name,
  restored.name,
  variant.width,
  variant.height,
  0
from restored_images as restored
cross join (
  values
    ('original', '', 1000, 1000),
    ('card-320', 'card/320/', 320, 320),
    ('card-640', 'card/640/', 640, 640),
    ('social', 'social/', 1200, 630)
) as variant(name, directory, width, height)
on conflict (id) do update set
  product_id = excluded.product_id,
  storage_path = excluded.storage_path,
  variant = excluded.variant,
  alt_text = excluded.alt_text,
  width = excluded.width,
  height = excluded.height,
  display_order = excluded.display_order;

update public.products
set
  name = 'Cavaleiros do Zodíaco ' || lpad((substring(id from 9))::integer::text, 2, '0'),
  theme = 'Cavaleiros do Zodíaco',
  description = 'Caneca personalizada Cavaleiros do Zodíaco ' || lpad((substring(id from 9))::integer::text, 2, '0') || ', coleção Animes.',
  seo_title = 'Cavaleiros do Zodíaco ' || lpad((substring(id from 9))::integer::text, 2, '0') || ' | Criativa Canecas',
  seo_description = 'Conheça a caneca Cavaleiros do Zodíaco ' || lpad((substring(id from 9))::integer::text, 2, '0') || ' personalizada pela Criativa Canecas.'
where id between 'animes-016' and 'animes-020';

update public.product_images as image
set alt_text = product.name
from public.products as product
where image.product_id = product.id
  and product.id between 'animes-016' and 'animes-020';

-- Os oito WebPs removidos do catálogo permanecem no Storage para permitir este rollback.
-- O rollback reintroduz intencionalmente a classificação antiga, inclusive os erros corrigidos.

commit;
