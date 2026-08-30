begin;

do $$
begin
  if (
    select count(*)
    from public.products
    where (id, name) in (
      ('demon-slayer-gyuu', 'Demon Slayer — Giyu'),
      ('demon-slayer-inosuke', 'Demon Slayer — Inosuke'),
      ('demon-slayer-kanao', 'Demon Slayer — Kanao'),
      ('demon-slayer-kimetsu-no-yaiba', 'Demon Slayer — Elenco 01'),
      ('demon-slayer-kimetsu-no-yaiba-2', 'Demon Slayer — Elenco 02'),
      ('demon-slayer-kimetsu-no-yaiba-3', 'Demon Slayer — Elenco 03')
    )
  ) <> 6 then
    raise exception 'Os seis produtos renomeados de Demon Slayer não estão no estado esperado.';
  end if;
end;
$$;

with previous_names (id, name) as (
  values
    ('demon-slayer-gyuu', 'Demon Slayer 01'),
    ('demon-slayer-inosuke', 'Demon Slayer 02'),
    ('demon-slayer-kanao', 'Demon Slayer 03'),
    ('demon-slayer-kimetsu-no-yaiba', 'Demon Slayer 04'),
    ('demon-slayer-kimetsu-no-yaiba-2', 'Demon Slayer 05'),
    ('demon-slayer-kimetsu-no-yaiba-3', 'Demon Slayer 06')
)
update public.products as product
set
  name = previous.name,
  description = 'Caneca personalizada ' || previous.name || ', coleção Animes.',
  seo_title = previous.name || ' | Criativa Canecas',
  seo_description = 'Conheça a caneca ' || previous.name || ' personalizada pela Criativa Canecas.'
from previous_names as previous
where product.id = previous.id;

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
