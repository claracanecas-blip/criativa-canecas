begin;

do $$
begin
  if not exists (
    select 1
    from public.products
    where id = 'pets-19'
      and status = 'published'
  ) then
    raise exception 'O produto publicado pets-19 é obrigatório.';
  end if;

  if (
    select count(*)
    from public.product_images
    where product_id = 'pets-19'
      and variant in ('original', 'card-320', 'card-640', 'social')
  ) <> 4 then
    raise exception 'As quatro variantes de pets-19 são obrigatórias.';
  end if;
end;
$$;

update public.product_images
set
  storage_path = case variant
    when 'original' then 'pets-19-r2.webp'
    when 'card-320' then 'card/320/pets-19-r2.webp'
    when 'card-640' then 'card/640/pets-19-r2.webp'
    when 'social' then 'social/pets-19-r2.webp'
  end
where product_id = 'pets-19'
  and variant in ('original', 'card-320', 'card-640', 'social');

update public.products
set updated_at = now()
where id = 'pets-19';

commit;
