begin;

do $$
begin
  if not exists (
    select 1
    from public.products
    where id = 'geek-16'
      and name = 'Breaking Bad — Walter e Jesse'
      and theme = 'Breaking Bad'
  ) then
    raise exception 'O produto geek-16 renomeado não está no estado esperado.';
  end if;
end;
$$;

update public.products
set
  name = 'Breaking Bad 01',
  description = 'Caneca personalizada Breaking Bad 01, tema Breaking Bad.',
  seo_title = 'Breaking Bad 01 | Criativa Canecas',
  seo_description = 'Conheça a caneca Breaking Bad 01 personalizada pela Criativa Canecas.'
where id = 'geek-16';

update public.product_images
set alt_text = 'Breaking Bad 01'
where product_id = 'geek-16';

commit;
