begin;

delete from public.products
where id in (
  select 'divertidas-' || lpad(number::text, 2, '0')
  from generate_series(1, 36) as series(number)
);

delete from public.catalog_audit_logs
where entity_type = 'product'
  and entity_id in (
    select 'divertidas-' || lpad(number::text, 2, '0')
    from generate_series(1, 36) as series(number)
  );

-- Os 144 objetos WebP e as respectivas estampas permanecem no Storage para rollback seguro
-- e podem ser removidos apenas após comprovar que nenhum catálogo publicado os referencia.

commit;
