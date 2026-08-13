# Evidências da Fase 6 — analytics, acessibilidade e qualidade

Implementação e validação concluídas em 13 de agosto de 2026.

## Analytics e observabilidade

- Cinco eventos tipados: visualização de produto, busca, seleção de coleção, clique no WhatsApp e erro do cliente.
- Eventos ativos somente em `https://criativa-canecas.vercel.app`; localhost e previews são ignorados.
- Busca usa apenas faixas de tamanho/resultado e erros usam códigos/grupos fechados.
- Agregação diária no Supabase, sem identificador de visitante, cookie, texto livre ou dados pessoais.
- `analytics_daily_events` tem leitura administrativa via RLS; visitantes não podem ler ou escrever diretamente.
- A função RPC valida eventos, slugs e dimensões antes de incrementar a contagem.
- Catálogo completo dos eventos em [`docs/analytics/EVENT_CATALOG.md`](../../analytics/EVENT_CATALOG.md).

## RLS remota

A migration `20260813211500_catalog_analytics.sql` foi aplicada ao projeto vinculado e o lint remoto terminou sem apontamentos. O relatório [`analytics-rls-report.json`](analytics-rls-report.json) comprova oito casos positivos/negativos, incluindo rejeição de dimensão livre/PII, bloqueio de leitura/escrita direta e leitura exclusiva de administrador. Dados e usuário temporários foram removidos ao final.

## Acessibilidade e E2E

Playwright + axe verificam home, coleção, busca e produto contra regras WCAG 2.2 A/AA. A primeira auditoria detectou contraste insuficiente em CTAs rosa e verde; fundos interativos foram escurecidos mantendo a identidade visual. Resultado final: 6/6 testes E2E e zero violações automáticas nas quatro páginas.

O fluxo busca → produto → WhatsApp valida contexto comercial, e um cenário móvel confirma página de produto e navegação inicial por teclado.

## Lighthouse e CI

O CI agora executa instalação limpa, testes unitários, typecheck, build, Playwright/axe e Lighthouse. O gate falha se alguma categoria ficar abaixo de 90.

| Página | Performance | Acessibilidade | Boas práticas | SEO |
|---|---:|---:|---:|---:|
| Home | 99 | 98 | 100 | 100 |
| Coleção Séries | 99 | 100 | 100 | 100 |
| Produto Arrow 01 | 90 | 100 | 100 | 100 |

## Rollback

Reverter as mudanças do frontend/CI e aplicar `supabase/rollback/20260813211500_catalog_analytics.sql`. O rollback remove somente a função e a tabela de agregados; não altera catálogo, usuários, imagens ou auditoria administrativa.
