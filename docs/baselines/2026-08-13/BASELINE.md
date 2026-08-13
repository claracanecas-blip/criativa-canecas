# Baseline técnico — 2026-08-13

Gerado em 2026-08-13T17:18:07.581Z a partir do commit `08aa4397540987e25aaeb4344ee7591b14aeb054`.

## Inventário reconciliado

| Medida | Valor |
|---|---:|
| Coleções públicas | 15 |
| Grupos com produtos | 11 |
| Produtos materializados | 341 |
| IDs únicos | 341 |
| Imagens referenciadas únicas | 341 |
| WebP otimizadas locais | 358 |
| Originais preservados | 358 |
| Imagens remotas acessíveis | 358 |
| Arquivos do build limpo | 21 |
| Tamanho do build limpo | 2.10 MB |

As contagens de IDs estão reconciliadas quando “Produtos materializados” e “IDs únicos” são iguais. As imagens não referenciadas são mantidas no backup porque podem ser alternativas ou ativos ainda não cadastrados.

## Integridade

- IDs de produto duplicados: 0
- Slugs públicos duplicados: 0
- Referências sem WebP local: 0
- Imagens remotas inacessíveis: 0
- WebP locais sem produto atual: 17
- Distribuição de cache remoto: `{"no-cache":358}`

## Mapa e resposta das rotas

Rotas declaradas: `/`, `/colecoes`, `/colecao/:slug`, `/personalizada`, `/com-fotos`, `/presentes`, `/dia-dos-pais`, `/busca`, `/:pathMatch(.*)*`.

| Rota exercitada | HTTP | Content-Type | Cache-Control |
|---|---:|---|---|
| `/` | 200 | text/html; charset=utf-8 | public, max-age=0, must-revalidate |
| `/colecoes` | 200 | text/html; charset=utf-8 | public, max-age=0, must-revalidate |
| `/colecao/series` | 200 | text/html; charset=utf-8 | public, max-age=0, must-revalidate |
| `/personalizada` | 200 | text/html; charset=utf-8 | public, max-age=0, must-revalidate |
| `/com-fotos` | 200 | text/html; charset=utf-8 | public, max-age=0, must-revalidate |
| `/presentes` | 200 | text/html; charset=utf-8 | public, max-age=0, must-revalidate |
| `/dia-dos-pais` | 200 | text/html; charset=utf-8 | public, max-age=0, must-revalidate |
| `/busca?q=caneca` | 200 | text/html; charset=utf-8 | public, max-age=0, must-revalidate |
| `/baseline-rota-inexistente` | 200 | text/html; charset=utf-8 | public, max-age=0, must-revalidate |

A rota inexistente retornar o HTML da SPA com HTTP 200 é o comportamento atual do rewrite da Vercel; o Vue apresenta a tela de não encontrado no cliente.

## Backup e restauração

- Backup: `catalog-backup.json`
- SHA-256: `0e4c1f45af95d48ec9abd24747f631d823b746566eb91de85a3bc0a0c7a2e681`
- Fontes protegidas por checksum: `src/data/produtos.ts`, `src/data/colecoes.ts`, `src/data/site.ts`

O backup contém coleções, grupos originais e produtos materializados com preço efetivo. Execute `npm test` para validar sua leitura e reconciliação. Para restauração exata do código, use o commit registrado; para a futura migração ao Supabase, importe `materializedProducts` e reconstrua as relações a partir de `productGroups`.

## Evidências relacionadas

- `baseline-summary.json`: inventário completo, anomalias, arquivos e cabeçalhos.
- `lighthouse-summary.json`: métricas Lighthouse de home e coleção.
- `catalog-backup.json`: backup restaurável do catálogo.
