begin;

do $$
begin
  if not exists (
    select 1 from public.collections where id = 'divertidas' and is_published
  ) then
    raise exception 'A coleção publicada divertidas é obrigatória.';
  end if;
end;
$$;

create temporary table selected_funny_products (
  number integer primary key,
  name text not null,
  theme text not null
) on commit drop;

insert into selected_funny_products (number, name, theme)
values
  (1, 'Vem Ni Mim', 'Frases'), (2, 'Aceita um Café?', 'Café'), (3, 'Caneca Pilhada', 'Frases'),
  (4, 'Cuidado: Já Tem Dono', 'Humor'), (5, 'Eu Digo Não para a Bebida', 'Bebidas'), (6, 'Arrisco', 'Paródia'),
  (7, 'Tommy Cachaça', 'Bebidas'), (8, 'Malgosto', 'Bebidas'), (9, 'Beer: Beba Sempre', 'Bebidas'),
  (10, 'Danosse', 'Paródia'), (11, 'Ardidas', 'Humor Adulto'), (12, 'Game Over 01', 'Casamento'),
  (13, 'Wi Fe', 'Relacionamento'), (14, 'No Stress, Uma Porra', 'Humor Adulto'), (15, 'Só Ctrl+S Salva', 'Tecnologia'),
  (16, 'Viagra Electron', 'Humor Adulto'), (17, 'Game Over 02', 'Casamento'), (18, 'Enxuta', 'Humor Adulto'),
  (19, 'Pum', 'Humor'), (20, 'Não Intendo', 'Paródia'), (21, 'Vivo Sem Dinheiro', 'Humor'),
  (22, 'Hardcore', 'Paródia'), (23, 'Azarado', 'Casamento'), (24, 'Viagra', 'Humor Adulto'),
  (25, 'No Stress O Caralho', 'Humor Adulto'), (26, 'Não Toque Nessa Caneca', 'Humor'), (27, 'Frete Grátis', 'Compras Online'),
  (28, 'Tá com Inveja? Morra', 'Humor'), (29, 'Bebaça Sem Limites', 'Bebidas'), (30, 'Teu Cu', 'Humor Adulto'),
  (31, 'Teu Cu com Lhama', 'Humor Adulto'), (32, 'Bolsonaro 100%', 'Política'), (33, 'O Golpe Tá Aí', 'Humor'),
  (34, 'Que se Dane', 'Lhamas'), (35, 'Sem Um Minuto de Paz', 'Humor Adulto'), (36, 'Surte e Atirei o Pau na Dona Chica', 'Gatos');

insert into public.products (
  id, slug, sku, name, theme, description, price, status, is_featured,
  display_order, seo_title, seo_description
)
select
  'divertidas-' || lpad(number::text, 2, '0'),
  'divertidas-' || lpad(number::text, 2, '0'),
  'CC-DIVERTIDAS-' || lpad(number::text, 2, '0'),
  name,
  theme,
  'Caneca personalizada ' || name || ', coleção Divertidas.',
  39.90,
  'published',
  false,
  number - 1,
  name || ' | Criativa Canecas',
  'Conheça a caneca ' || name || ' personalizada pela Criativa Canecas.'
from selected_funny_products
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
select 'divertidas-' || lpad(number::text, 2, '0'), 'divertidas', number - 1
from selected_funny_products
on conflict (product_id, collection_id) do update set display_order = excluded.display_order;

insert into public.product_images (
  id, product_id, storage_path, variant, alt_text, width, height, display_order
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
from selected_funny_products as selected
cross join lateral (
  select 'divertidas-' || lpad(selected.number::text, 2, '0') as product_id
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
