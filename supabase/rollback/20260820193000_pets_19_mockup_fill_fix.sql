begin;

update public.product_images
set
  storage_path = case variant
    when 'original' then 'pets-19.webp'
    when 'card-320' then 'card/320/pets-19.webp'
    when 'card-640' then 'card/640/pets-19.webp'
    when 'social' then 'social/pets-19.webp'
  end
where product_id = 'pets-19'
  and variant in ('original', 'card-320', 'card-640', 'social');

update public.products
set updated_at = now()
where id = 'pets-19';

-- As quatro imagens anteriores permanecem no Storage para permitir rollback
-- imediato sem depender de restauração externa.

commit;
