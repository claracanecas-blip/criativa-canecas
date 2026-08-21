begin;

do $$
begin
  if not exists (
    select 1
    from public.products
    where id = 'animes-027' and theme = 'Fairy Tail'
  ) then
    raise exception 'O produto animes-027 identificado como Fairy Tail não foi encontrado.';
  end if;

  if not exists (
    select 1
    from public.products
    where id = 'animes-083' and theme = 'Hunter x Hunter'
  ) then
    raise exception 'O produto duplicado animes-083 não foi encontrado.';
  end if;
end;
$$;

delete from public.products
where id in ('animes-027', 'animes-083');

delete from public.catalog_audit_logs
where entity_type = 'product'
  and entity_id in ('animes-027', 'animes-083');

update public.products
set
  name = case id
    when 'animes-016' then 'Cavaleiros do Zodíaco 08'
    when 'animes-017' then 'Cavaleiros do Zodíaco Dourados 13'
    when 'animes-018' then 'Cavaleiros do Zodíaco Dourados 14'
    when 'animes-019' then 'Cavaleiros do Zodíaco Dourados 15'
    when 'animes-020' then 'Cavaleiros do Zodíaco Dourados 16'
  end,
  theme = case
    when id = 'animes-016' then 'Cavaleiros do Zodíaco'
    else 'Cavaleiros do Zodíaco Dourados'
  end,
  description = 'Caneca personalizada ' || case id
    when 'animes-016' then 'Cavaleiros do Zodíaco 08'
    when 'animes-017' then 'Cavaleiros do Zodíaco Dourados 13'
    when 'animes-018' then 'Cavaleiros do Zodíaco Dourados 14'
    when 'animes-019' then 'Cavaleiros do Zodíaco Dourados 15'
    when 'animes-020' then 'Cavaleiros do Zodíaco Dourados 16'
  end || ', coleção Animes.',
  seo_title = case id
    when 'animes-016' then 'Cavaleiros do Zodíaco 08'
    when 'animes-017' then 'Cavaleiros do Zodíaco Dourados 13'
    when 'animes-018' then 'Cavaleiros do Zodíaco Dourados 14'
    when 'animes-019' then 'Cavaleiros do Zodíaco Dourados 15'
    when 'animes-020' then 'Cavaleiros do Zodíaco Dourados 16'
  end || ' | Criativa Canecas',
  seo_description = 'Conheça a caneca ' || case id
    when 'animes-016' then 'Cavaleiros do Zodíaco 08'
    when 'animes-017' then 'Cavaleiros do Zodíaco Dourados 13'
    when 'animes-018' then 'Cavaleiros do Zodíaco Dourados 14'
    when 'animes-019' then 'Cavaleiros do Zodíaco Dourados 15'
    when 'animes-020' then 'Cavaleiros do Zodíaco Dourados 16'
  end || ' personalizada pela Criativa Canecas.'
where id between 'animes-016' and 'animes-020';

update public.product_images as image
set alt_text = product.name
from public.products as product
where image.product_id = product.id
  and product.id between 'animes-016' and 'animes-020';

commit;
