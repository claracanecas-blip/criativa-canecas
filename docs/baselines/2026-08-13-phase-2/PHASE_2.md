# Evidências da Fase 2 — banco do catálogo

Migração e importação concluídas no projeto Supabase `bqhqqgbdhglnecpfrbig` em 13 de agosto de 2026.

## Schema versionado

- `20260813184000_catalog_schema.sql`: tabelas, constraints, índices, timestamps, RLS e políticas do Storage.
- `20260813190000_catalog_collection_visibility.sql`: separa publicação de listagem para preservar links legados.
- `20260813191500_catalog_function_hardening.sql`: remove execução pública desnecessária da função interna de timestamp.
- Tipos gerados do banco remoto em `src/types/database.ts`.
- `supabase db lint --linked --level warning`: nenhum erro ou aviso.
- Histórico local/remoto reconciliado nas três migrations.

## Reconciliação do catálogo

O importador foi executado duas vezes seguidas para provar idempotência.

| Entidade | Esperado | Remoto | Exato |
|---|---:|---:|---|
| Coleções | 17 | 17 | Sim |
| Produtos | 341 | 341 | Sim |
| Relações produto–coleção | 341 | 341 | Sim |
| Imagens associadas | 1.364 | 1.364 | Sim |

As 17 coleções são publicadas para preservar URLs diretas. Quinze possuem `is_listed = true`; `desenhos` e `herois` continuam acessíveis, mas não aparecem na navegação principal.

## Segurança RLS

| Verificação remota | Resultado |
|---|---|
| Leitura anônima de coleções publicadas | 17/17 |
| Coleções listadas anonimamente | 15/15 |
| Leitura anônima de produtos | 341/341 |
| Leitura anônima de relações | 341/341 |
| Leitura anônima de imagens | 1.364/1.364 |
| Escrita anônima | Negada, HTTP 401 |
| Escrita autenticada sem papel admin | Negada, HTTP 403 |
| Escrita de administrador temporário | Permitida, HTTP 201 |
| Rascunho visível anonimamente | Não, 0 linhas |
| Exclusão pelo administrador temporário | Permitida, HTTP 204 |
| Upload anônimo/sem admin no Storage | Negado, HTTP 400 |
| Upload, leitura e exclusão no Storage pelo admin | Permitidos, HTTP 200 |

O usuário de teste, o papel temporário, o produto e o objeto sentinela foram removidos da origem. Como o bucket usa cache imutável prolongado, uma URL sentinela já consultada pode continuar no CDN até expirar; a limpeza é confirmada pela listagem autenticada da origem, não pela resposta pública em cache.

## Rollback

O frontend ainda usa os dados TypeScript, portanto a aplicação pública não depende do banco nesta fase. Para reverter o schema, execute em ordem:

1. `supabase/rollback/20260813191500_catalog_function_hardening.sql`;
2. `supabase/rollback/20260813190000_catalog_collection_visibility.sql`;
3. `supabase/rollback/20260813184000_catalog_schema.sql`.

O rollback remove apenas metadados/tabelas da Fase 2 e suas políticas; o bucket e os 1.432 objetos da Fase 1 são preservados. O backup restaurável do catálogo permanece em `docs/baselines/2026-08-13/catalog-backup.json`.
