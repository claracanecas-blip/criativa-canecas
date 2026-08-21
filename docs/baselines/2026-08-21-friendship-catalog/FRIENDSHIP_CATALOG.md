# Expansão do catálogo — Amizade

Data: 21 de agosto de 2026.

## Escopo e seleção

- Origem: `D:\estampas\71 - DIA DOS AMIGOS`.
- A pasta contém 50 imagens raster e não repete por hash as fontes do lote anterior de Amizade.
- Foram escolhidas 30 artes genéricas: índices 1–14 e 16–31 da ordenação alfabética em português. O índice 15 foi excluído por usar personagem conhecido.
- O manifesto liga produto, origem, mockup, dimensões e SHA-256 em `D:\estampas\71 - DIA DOS AMIGOS\MOCKUPS - EXPANSAO AMIZADE 2026\manifest.csv`.

## Mockups e revisão

- Produtos: `amizade-43` a `amizade-72`, preservando os 42 anteriores.
- Os 30 mockups foram gerados individualmente em 1254 × 1254 pixels com o gerador integrado.
- O padrão visual usa a estampa plana completa na parte superior, duas canecas brancas grandes abaixo e fundo neutro de estúdio.
- A impressão ocupa a área útil até a curvatura inferior natural; não há faixa branca adicionada na base.
- A folha de contato `tmp/amizade-expansao-30-sheet.png` foi inspecionada. Os 30 mockups e as 30 origens possuem hashes SHA-256 únicos.

Prompt usado no modo integrado:

> Mockup quadrado de e-commerce para caneca de amizade; preservar integralmente a estampa, as cores e o texto em português; mostrar a prévia plana completa no terço superior e exatamente duas canecas brancas grandes abaixo, com impressão até a curvatura inferior, fundo cinza-claro e iluminação neutra de estúdio; sem objetos, textos, marcas ou faixas adicionais.

## Imagens e banco

- Foram publicados 30 originais WebP, 30 variantes `card-320`, 30 `card-640` e 30 sociais de 1200 × 630.
- As 120 URLs foram verificadas com até três tentativas: HTTP 200 e `image/webp`, sem falhas.
- Migration aplicada: `20260821210000_friendship_catalog_expansion.sql`.
- Resultado remoto: 721 produtos, 721 relações produto/coleção e 2.884 associações de imagem.
- O conjunto ativo possui 2.952 caminhos WebP; 12 objetos anteriores continuam preservados para rollback.

## Segurança, qualidade e rollback

- Relatórios: [`catalog-verify-report.json`](catalog-verify-report.json) e [`admin-e2e-report.json`](admin-e2e-report.json).
- RLS positiva e negativa passou para leitura anônima, escrita anônima negada, usuário autenticado sem administração e administrador temporário; sentinelas foram removidos.
- `db lint` não encontrou erros.
- Os 61 testes unitários, typecheck, build e 19 cenários públicos Playwright/axe no Chrome passaram. O build gerou 721 páginas de produto e sitemap com 741 URLs.
- O fluxo administrativo E2E confirmou 721 produtos e concluiu criação, publicação, visualização e exclusão dos sentinelas sem resíduos.
- O rollback versionado `supabase/rollback/20260821210000_friendship_catalog_expansion.sql` remove somente `amizade-43` a `amizade-72` e preserva os objetos no Storage para recuperação segura.
- O fallback TypeScript contém os mesmos 30 produtos.
