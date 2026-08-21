begin;

do $$
begin
  if not exists (
    select 1 from public.collections where id = 'animes' and is_published
  ) then
    raise exception 'A coleção publicada animes é obrigatória.';
  end if;
end;
$$;

create temporary table selected_anime_products (
  number integer primary key,
  theme text not null
) on commit drop;

insert into selected_anime_products select number, 'Spy x Family' from generate_series(1, 5) as series(number);
insert into selected_anime_products select number, 'Lycoris Recoil' from generate_series(6, 10) as series(number);
insert into selected_anime_products select number, 'Chainsaw Man' from generate_series(11, 15) as series(number);
insert into selected_anime_products select number, 'Cavaleiros do Zodíaco' from generate_series(16, 20) as series(number);
insert into selected_anime_products select number, 'Dragon Ball' from generate_series(21, 25) as series(number);
insert into selected_anime_products (number, theme) values
  (26, 'Hunter x Hunter'), (27, 'Fairy Tail'), (28, 'Berserk'),
  (29, 'Black Rock Shooter'), (30, 'No Game No Life');
insert into selected_anime_products select number, 'Tokyo Ghoul' from generate_series(31, 35) as series(number);
insert into selected_anime_products select number, 'Nanatsu no Taizai' from generate_series(36, 40) as series(number);
insert into selected_anime_products select number, 'Demon Slayer' from generate_series(41, 45) as series(number);
insert into selected_anime_products select number, 'Attack on Titan' from generate_series(46, 50) as series(number);
insert into selected_anime_products select number, 'Naruto' from generate_series(51, 55) as series(number);
insert into selected_anime_products select number, 'Yu-Gi-Oh!' from generate_series(56, 60) as series(number);
insert into selected_anime_products select number, 'My Hero Academia' from generate_series(61, 65) as series(number);
insert into selected_anime_products select number, 'One Piece' from generate_series(66, 70) as series(number);
insert into selected_anime_products select number, 'Death Note' from generate_series(71, 75) as series(number);
insert into selected_anime_products select number, 'Sword Art Online' from generate_series(76, 80) as series(number);
insert into selected_anime_products (number, theme) values
  (81, 'One Punch Man'), (82, 'One Punch Man'), (83, 'Hunter x Hunter'),
  (84, 'Fullmetal Alchemist'), (85, 'Bleach'), (86, 'Sailor Moon'),
  (87, 'Akira'), (88, 'Soul Eater'), (89, 'Doraemon'), (90, 'Date A Live'),
  (91, 'Haikyuu!!'), (92, 'InuYasha'), (93, 'Yu Yu Hakusho'),
  (94, 'Blue Exorcist'), (95, 'Your Name'), (96, 'My Neighbor Totoro'),
  (97, 'Overlord'), (98, 'Date A Live'), (99, 'My Neighbor Totoro'),
  (100, 'Studio Ghibli');

with named_products as (
  select
    number,
    theme,
    theme || ' ' || lpad(row_number() over (partition by theme order by number)::text, 2, '0') as name
  from selected_anime_products
)
insert into public.products (
  id, slug, sku, name, theme, description, price, status, is_featured,
  display_order, seo_title, seo_description
)
select
  'animes-' || lpad(number::text, 3, '0'),
  'animes-' || lpad(number::text, 3, '0'),
  'CC-ANIMES-' || lpad(number::text, 3, '0'),
  name,
  theme,
  'Caneca personalizada ' || name || ', coleção Animes.',
  39.90,
  'published',
  false,
  number + 42,
  name || ' | Criativa Canecas',
  'Conheça a caneca ' || name || ' personalizada pela Criativa Canecas.'
from named_products
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
  'animes-' || lpad(number::text, 3, '0'),
  'animes',
  number + 42
from selected_anime_products
on conflict (product_id, collection_id) do update set display_order = excluded.display_order;

with named_products as (
  select
    number,
    theme || ' ' || lpad(row_number() over (partition by theme order by number)::text, 2, '0') as name
  from selected_anime_products
)
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
from named_products as selected
cross join lateral (
  select 'animes-' || lpad(selected.number::text, 3, '0') as product_id
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
