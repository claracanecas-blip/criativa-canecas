# Evidências da Fase 5 — página de produto e SEO técnico

Implementação e validação concluídas em 13 de agosto de 2026.

## Página de produto

- Rota canônica `/produto/:slug` para os 341 produtos publicados.
- Imagem prioritária, nome, SKU, tema, preço, descrição e coleções relacionadas.
- Quatro produtos relacionados, sem repetir o item atual.
- WhatsApp inclui nome, código e URL canônica.
- Slug inexistente apresenta experiência controlada de página não encontrada.
- Cards da home, coleções e busca apontam para a página de detalhe.

## SEO rastreável

O pós-build consulta o Supabase e gera:

| Artefato | Quantidade/resultado |
|---|---:|
| HTML de produto | 341 |
| HTML de coleção publicada | 17 |
| URLs no sitemap | 360 |
| Canonical por produto/coleção | Sim |
| Open Graph com imagem social | Sim |
| JSON-LD `Product` | Sim |
| JSON-LD `BreadcrumbList` | Sim |
| Conteúdo sem JavaScript | Sim |
| `/admin` bloqueado em robots | Sim |

O sitemap possui home, listagem, 17 coleções publicadas — inclusive as duas URLs legadas preservadas — e 341 produtos publicados. Rascunhos/arquivados são filtrados na consulta.

Revalidação posterior confirmou que o gerador remove os metadados-base antes de injetar os específicos: `/informacoes` e `/produto/arrow-1` possuem exatamente um canonical cada no HTML estático.

## Preview Vercel

O deployment `dpl_79pTTs5z3fEYPc62dk98MsNaY9Qh` foi consultado com bypass autenticado da proteção de preview:

- `/produto/arrow-1`: HTTP 200;
- título `Arrow 01 | Criativa Canecas` no HTML de origem;
- canonical de produção, `og:type=product`, JSON-LD Product e `<h1>` estático presentes;
- `/sitemap.xml`: 360 URLs;
- `/robots.txt`: permite o site, bloqueia `/admin` e referencia o sitemap.

Isso confirma que a Vercel serve o arquivo prerenderizado antes do fallback SPA. `cleanUrls` mantém a URL sem `.html` e `trailingSlash=false` evita duplicidade por barra final.

## Experiência e qualidade

- Playwright navegou a página, validou SKU, relacionados, canonical dinâmico, JSON-LD, WhatsApp com SKU/URL e estado inexistente.
- `npm test`: 17/17 testes aprovados.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado, gerando 341 produtos, 17 coleções e 360 URLs.
- Lighthouse móvel: home P99/A93/B100/S100; coleção P99/A95/B100/S100; produto P90/A95/B100/S100.
- [Relatório Lighthouse reproduzível](../2026-08-13-phase-5-local/LIGHTHOUSE.md).

## Decisão de prerenderização e rollback

O HTML estático atende o catálogo atual com custo operacional baixo e preserva Vue/Vite. Não há evidência para justificar SSR/Nuxt agora. Como consequência conhecida, alteração administrativa atualiza a SPA imediatamente, mas HTML social/sitemap somente no próximo deploy.

Rollback: reverter as mudanças da Fase 5. Nenhuma migration foi criada e nenhum dado remoto precisa ser revertido.
