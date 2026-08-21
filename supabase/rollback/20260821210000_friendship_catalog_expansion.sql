begin;

delete from public.products
where id in (
  select 'amizade-' || lpad(number::text, 2, '0')
  from generate_series(43, 72) as series(number)
);

delete from public.catalog_audit_logs
where entity_type = 'product'
  and entity_id in (
    select 'amizade-' || lpad(number::text, 2, '0')
    from generate_series(43, 72) as series(number)
  );

-- Os 120 objetos WebP permanecem no Storage para rollback seguro e só devem ser
-- removidos depois de comprovar que nenhum catálogo publicado ainda os referencia.

commit;
