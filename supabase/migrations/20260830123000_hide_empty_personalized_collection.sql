begin;

do $$
declare
  affected integer;
begin
  if exists (
    select 1
    from public.product_collections
    where collection_id = 'personalizada'
  ) then
    raise exception 'A coleção personalizada possui produtos associados e não pode ser ocultada automaticamente.';
  end if;

  update public.collections
  set
    is_published = false,
    is_listed = false,
    updated_at = now()
  where id = 'personalizada';

  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'Coleção personalizada ausente ou duplicada.';
  end if;
end
$$;

commit;
