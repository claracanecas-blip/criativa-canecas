begin;

delete from public.products
where id in (
  select 'pets-' || lpad(number::text, 2, '0')
  from generate_series(1, 50) as series(number)
);

delete from public.catalog_audit_logs
where entity_type = 'product'
  and entity_id in (
    select 'pets-' || lpad(number::text, 2, '0')
    from generate_series(1, 50) as series(number)
  );

-- Os 200 objetos WebP permanecem no Storage para rollback seguro e podem ser
-- removidos depois apenas após confirmação de que ficaram órfãos.

commit;
