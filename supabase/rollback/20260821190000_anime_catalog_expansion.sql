begin;

delete from public.products
where id in (
  select 'animes-' || lpad(number::text, 3, '0')
  from generate_series(1, 100) as series(number)
);

delete from public.catalog_audit_logs
where entity_type = 'product'
  and entity_id in (
    select 'animes-' || lpad(number::text, 3, '0')
    from generate_series(1, 100) as series(number)
  );

-- Os 400 objetos WebP e as respectivas estampas permanecem no Storage para rollback seguro
-- e podem ser removidos apenas após comprovar que nenhum catálogo publicado os referencia.

commit;
