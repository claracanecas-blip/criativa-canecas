begin;

do $$
declare
  affected integer;
begin
  update public.collections
  set
    is_published = true,
    is_listed = true,
    updated_at = now()
  where id = 'personalizada';

  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'Coleção personalizada ausente ou duplicada.';
  end if;
end
$$;

commit;
