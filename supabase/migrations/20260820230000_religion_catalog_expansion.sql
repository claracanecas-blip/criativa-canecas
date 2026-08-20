begin;

do $$
begin
  if not exists (
    select 1
    from public.collections
    where id = 'religiao'
      and is_published
  ) then
    raise exception 'A coleção publicada religiao é obrigatória.';
  end if;
end;
$$;

create temporary table selected_religion_products (
  number integer primary key,
  name text not null,
  tradition text not null
) on commit drop;

insert into selected_religion_products (number, name, tradition)
values
  (1, 'Fé Islâmica', 'Islâmica'), (2, 'Fé Messiânica', 'Messiânica'), (3, 'Nossa Senhora de Fátima 01', 'Católica'),
  (4, 'Assembleia de Deus', 'Evangélica'), (5, 'Círio de Nazaré 01', 'Católica'), (6, 'Esperança em Deus', 'Cristã'),
  (7, 'São Cosme e Damião', 'Católica'), (8, 'Fé e Certeza', 'Cristã'), (9, 'Nossa Senhora Aparecida 01', 'Católica'),
  (10, 'Oração', 'Cristã'), (11, 'Nossa Senhora de Fátima 02', 'Católica'), (12, 'Vivo por Jesus', 'Cristã'),
  (13, 'Santo Antônio', 'Católica'), (14, 'Igreja do Evangelho Quadrangular', 'Evangélica'), (15, 'Nossa Senhora Aparecida 02', 'Católica'),
  (16, 'Eu Amo a Bíblia', 'Cristã'), (17, 'Sagrada Família', 'Católica'), (18, 'Confia no Senhor', 'Católica'),
  (19, 'Nossa Senhora Aparecida 03', 'Católica'), (20, 'O Senhor é Meu Pastor', 'Cristã'), (21, 'Madre Teresa', 'Católica'),
  (22, 'Cristo Ressuscitou', 'Cristã'), (23, 'Nossa Senhora Aparecida 04', 'Católica'), (24, 'Amai-vos Uns aos Outros', 'Cristã'),
  (25, 'Nossa Senhora 01', 'Católica'), (26, 'Fé, Amor e Esperança', 'Cristã'), (27, 'Pastor', 'Evangélica'),
  (28, 'Pastora', 'Evangélica'), (29, 'Nossa Senhora e o Menino Jesus', 'Católica'), (30, 'Leão de Judá', 'Cristã'),
  (31, 'Jesus, Médico dos Médicos', 'Cristã'), (32, 'Deus Nunca Falha', 'Cristã'), (33, 'Promessa de Deus', 'Cristã'),
  (34, 'Eu Escolho Deus', 'Cristã'), (35, 'Deus do Meu Viver', 'Cristã'), (36, 'Conquiste a Paz', 'Cristã'),
  (37, 'Jesus Dá Descanso', 'Cristã'), (38, 'Amor de Deus', 'Cristã'), (39, 'Renovação da Fé', 'Cristã'),
  (40, 'Palavra de Deus', 'Cristã'), (41, 'Deus Abriu o Mar', 'Cristã'), (42, 'Agradecer a Deus', 'Cristã'),
  (43, 'Sem Fé é Impossível', 'Cristã'), (44, 'Nas Mãos de Deus', 'Cristã'), (45, 'Protegido por Jesus', 'Cristã'),
  (46, 'Meu Alvo é Cristo', 'Cristã'), (47, 'Fé na Cruz', 'Cristã'), (48, 'Deus é Grande', 'Cristã'),
  (49, 'Jesus Te Ama', 'Cristã'), (50, 'Unidos pelo Amor do Pai', 'Cristã');

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
  'religiao-' || lpad(number::text, 2, '0'),
  'religiao-' || lpad(number::text, 2, '0'),
  'CC-RELIGIAO-' || lpad(number::text, 2, '0'),
  name,
  tradition,
  'Caneca personalizada ' || name || ', coleção Religião.',
  39.90,
  'published',
  false,
  number - 1,
  name || ' | Criativa Canecas',
  'Conheça a caneca ' || name || ' personalizada pela Criativa Canecas.'
from selected_religion_products
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
  'religiao-' || lpad(number::text, 2, '0'),
  'religiao',
  number - 1
from selected_religion_products
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
  selected.name,
  image.width,
  image.height,
  0
from selected_religion_products as selected
cross join lateral (
  select 'religiao-' || lpad(selected.number::text, 2, '0') as product_id
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
