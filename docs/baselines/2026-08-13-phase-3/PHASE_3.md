# Evidências da Fase 3 — frontend consumindo Supabase

Implementação concluída e validada em 13 de agosto de 2026.

## Arquitetura entregue

- Cliente público Supabase tipado com `Database` gerado do projeto remoto.
- Repositório único para coleções, produtos, relações e imagens originais.
- Cache compartilhado em memória para evitar consultas duplicadas entre menu e páginas.
- Suporte a múltiplas coleções por produto no contrato do frontend.
- Estados globais de carregamento, fallback recuperável e erro com ação de nova tentativa.
- Fallback automático para o catálogo TypeScript e rollback integral por `VITE_CATALOG_SOURCE=typescript`.
- Home, menus, listagem, coleção, busca e páginas sazonais usando a nova fonte.
- Paginação existente preservada em 20 produtos por página.

## Paridade e rotas

| Verificação | Resultado |
|---|---:|
| Coleções remotas/publicadas | 17 |
| Coleções listadas na navegação | 15 |
| Produtos publicados | 341 |
| Relações produto–coleção | 341 |
| Imagens associadas | 1.364 |
| `/colecao/series` | 80 produtos |
| `/busca?q=Arrow` | 4 produtos |
| `/colecao/desenhos` (legada) | 27 produtos |

As rotas foram abertas diretamente em build de produção local por navegador headless. A home terminou o carregamento sem banner de fallback e renderizou produtos/imagens provenientes do Supabase.

## Resiliência e rollback

A falha foi exercitada em dois níveis:

1. teste automatizado com repositório remoto indisponível, confirmando estado `fallback` e os 341 produtos locais;
2. navegador com o hostname do Supabase direcionado para endereço indisponível, confirmando mensagem recuperável e catálogo visível, sem tela branca.

Rollback operacional: alterar `VITE_CATALOG_SOURCE` para `typescript` nos ambientes desejados da Vercel e criar um novo deploy. Para retornar ao Supabase, restaurar o valor `supabase`.

## Qualidade

- `npm test`: 14/14 testes aprovados.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado com as variáveis públicas do Supabase.
- Consulta anônima remota: 17 coleções, 341 produtos, 341 relações e 1.364 imagens.
- [Lighthouse móvel local com Supabase](../2026-08-13-phase-3-local/LIGHTHOUSE.md): home P99/A93/B100/S92; coleção P98/A95/B100/S92.
- Preview Vercel criado com build aprovado; o projeto aplica proteção de autenticação a previews, então a inspeção pública final ocorre no deploy de produção pela `main`.

Os valores das variáveis da Vercel não foram gravados neste documento ou no Git. Somente URL pública e chave publicável chegam ao bundle; `service_role` permanece ausente.
