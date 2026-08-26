begin;

do $$
declare
  affected integer;
begin
  update public.products
  set
    name = 'Fé Islâmica',
    theme = 'Islâmica',
    description = 'Caneca personalizada Fé Islâmica, coleção Religião.',
    seo_title = 'Fé Islâmica | Criativa Canecas',
    seo_description = 'Conheça a caneca Fé Islâmica personalizada pela Criativa Canecas.'
  where id = 'religiao-01';

  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'Produto religiao-01 ausente ou duplicado.';
  end if;

  update public.product_images
  set
    storage_path = case variant
      when 'original' then 'religiao-01.webp'
      when 'card-320' then 'card/320/religiao-01.webp'
      when 'card-640' then 'card/640/religiao-01.webp'
      when 'social' then 'social/religiao-01.webp'
    end,
    alt_text = 'Fé Islâmica'
  where product_id = 'religiao-01'
    and variant in ('original', 'card-320', 'card-640', 'social');

  get diagnostics affected = row_count;
  if affected <> 4 then
    raise exception 'Esperadas quatro variantes de religiao-01; encontradas %.', affected;
  end if;
end;
$$;

-- Os quatro objetos religiao-01-r2 permanecem no Storage para rollback seguro.
commit;
