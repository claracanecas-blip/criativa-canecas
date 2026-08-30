begin;

do $$
begin
  if (
    select count(*)
    from public.products
    where (id, name) in (
      ('demon-slayer-gyuu', 'Demon Slayer 01'),
      ('demon-slayer-inosuke', 'Demon Slayer 02'),
      ('demon-slayer-kanao', 'Demon Slayer 03'),
      ('demon-slayer-kimetsu-no-yaiba', 'Demon Slayer 04'),
      ('demon-slayer-kimetsu-no-yaiba-2', 'Demon Slayer 05'),
      ('demon-slayer-kimetsu-no-yaiba-3', 'Demon Slayer 06')
    )
  ) <> 6 then
    raise exception 'Os seis produtos antigos de Demon Slayer não estão no estado esperado.';
  end if;
end;
$$;

with clarified_names (id, name) as (
  values
    ('demon-slayer-gyuu', 'Demon Slayer — Giyu'),
    ('demon-slayer-inosuke', 'Demon Slayer — Inosuke'),
    ('demon-slayer-kanao', 'Demon Slayer — Kanao'),
    ('demon-slayer-kimetsu-no-yaiba', 'Demon Slayer — Elenco 01'),
    ('demon-slayer-kimetsu-no-yaiba-2', 'Demon Slayer — Elenco 02'),
    ('demon-slayer-kimetsu-no-yaiba-3', 'Demon Slayer — Elenco 03')
)
update public.products as product
set
  name = clarified.name,
  description = 'Caneca personalizada ' || clarified.name || ', tema Demon Slayer.',
  seo_title = clarified.name || ' | Criativa Canecas',
  seo_description = 'Conheça a caneca ' || clarified.name || ' personalizada pela Criativa Canecas.'
from clarified_names as clarified
where product.id = clarified.id;

update public.product_images as image
set alt_text = product.name
from public.products as product
where image.product_id = product.id
  and product.id in (
    'demon-slayer-gyuu',
    'demon-slayer-inosuke',
    'demon-slayer-kanao',
    'demon-slayer-kimetsu-no-yaiba',
    'demon-slayer-kimetsu-no-yaiba-2',
    'demon-slayer-kimetsu-no-yaiba-3'
  );

commit;
