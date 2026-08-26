begin;

do $$
declare
  affected integer;
begin
  update public.products
  set
    name = 'Porque Ele Vive',
    theme = 'Cristã',
    description = 'Caneca personalizada Porque Ele Vive, coleção Religião.',
    seo_title = 'Porque Ele Vive | Criativa Canecas',
    seo_description = 'Conheça a caneca Porque Ele Vive personalizada pela Criativa Canecas.'
  where id = 'religiao-01';

  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'Produto religiao-01 ausente ou duplicado.';
  end if;

  update public.product_images
  set
    storage_path = case variant
      when 'original' then 'religiao-01-r2.webp'
      when 'card-320' then 'card/320/religiao-01-r2.webp'
      when 'card-640' then 'card/640/religiao-01-r2.webp'
      when 'social' then 'social/religiao-01-r2.webp'
    end,
    alt_text = 'Porque Ele Vive'
  where product_id = 'religiao-01'
    and variant in ('original', 'card-320', 'card-640', 'social');

  get diagnostics affected = row_count;
  if affected <> 4 then
    raise exception 'Esperadas quatro variantes de religiao-01; encontradas %.', affected;
  end if;
end;
$$;

commit;
