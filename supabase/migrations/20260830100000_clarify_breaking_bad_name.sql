begin;

do $$
begin
  if not exists (
    select 1
    from public.products
    where id = 'geek-16'
      and name = 'Breaking Bad 01'
      and theme = 'Breaking Bad'
  ) then
    raise exception 'O produto geek-16 não está no estado esperado.';
  end if;
end;
$$;

update public.products
set
  name = 'Breaking Bad — Walter e Jesse',
  description = 'Caneca personalizada Breaking Bad — Walter e Jesse, tema Breaking Bad.',
  seo_title = 'Breaking Bad — Walter e Jesse | Criativa Canecas',
  seo_description = 'Conheça a caneca Breaking Bad — Walter e Jesse personalizada pela Criativa Canecas.'
where id = 'geek-16';

update public.product_images
set alt_text = 'Breaking Bad — Walter e Jesse'
where product_id = 'geek-16';

commit;
