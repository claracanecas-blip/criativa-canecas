# Expansão do catálogo — Futebol & Esportes

Data: 20 de agosto de 2026.

## Escopo e seleção

- Origem: `D:\estampas\07 - ESPORTES`.
- 78 artes JPEG/PNG foram inventariadas e revisadas em folhas de contato.
- 50 artes de 20 clubes foram selecionadas por popularidade, qualidade visual e ausência de duplicidade.
- A distribuição priorizou Flamengo, Corinthians, São Paulo e Palmeiras conforme pesquisas nacionais de torcida publicadas em 2025. Real Madrid e Barcelona representaram os clubes estrangeiros mais citados por torcedores brasileiros; Chelsea completou a seleção internacional disponível.
- O vínculo entre arquivo de origem, mockup, clube e produto está em `D:\estampas\07 - ESPORTES\MOCKUPS - 50 ESPORTES\manifest.csv`.

## Mockups e revisão visual

- Os mockups `futebol-01.png` a `futebol-50.png` foram gerados individualmente em 1254 × 1254 pixels.
- O layout mantém a prévia plana da arte acima e duas canecas abaixo, com vistas inclinada e frontal.
- A estampa foi solicitada até o limite inferior natural da área curva nas duas canecas, sem faixa branca acidental.
- Três folhas de contato foram inspecionadas visualmente. Os 50 arquivos possuem hashes SHA-256 únicos, dimensões iguais e preenchimento inferior correto.
- Um arquivo de São Paulo semelhante a outro foi substituído antes da publicação por uma arte distinta.
- Arquivos finais: `D:\estampas\07 - ESPORTES\MOCKUPS - 50 ESPORTES`.

## Imagens publicadas

- 50 originais WebP de 1000 × 1000.
- 50 variantes `card-320`, 50 variantes `card-640` e 50 variantes sociais de 1200 × 630.
- 200 objetos enviados ao bucket público `product-images` com cache de um ano.
- Os 200 objetos foram verificados individualmente por `GET`: HTTP 200, `image/webp`, cache correto e hash remoto idêntico ao local.
- O conjunto atual passou a 474 originais e 1.422 variantes, totalizando 1.896 caminhos. O bucket contém ainda quatro objetos antigos de `pets-19` preservados para rollback, ou 1.900 objetos físicos.

## Catálogo e banco

- Migration aplicada: `20260820210000_football_catalog_expansion.sql`.
- Produtos publicados: `futebol-01` a `futebol-50`, preço-base de R$ 39,90 e quatro imagens por produto.
- Coleção usada: `futebol`, exibida como `Futebol & Esportes` e acessível pelas categorias de esportes e futebol.
- Resultado remoto: 457 produtos publicados, 457 relações produto/coleção e 1.828 associações de imagem.
- O fallback TypeScript contém os mesmos 50 produtos e o build gera 457 páginas de produto e sitemap com 477 URLs.

## Segurança e qualidade

- Relatório remoto: [`catalog-verify-report.json`](catalog-verify-report.json).
- `db lint` sem apontamentos e histórico de migrations local/remoto alinhado.
- RLS validada positiva e negativamente para leitura anônima, usuário autenticado sem administração e administrador temporário; todos os sentinelas foram removidos.
- 44 testes automatizados aprovados.
- `npm run typecheck` e `npm run build` aprovados.
- 14 cenários Playwright/axe aprovados no Chrome, incluindo paginação 20 + 20 + 10 e limites `Flamengo 01`/`Chelsea 02`.
- HTML estático conferido para a coleção, o produto `futebol-50` e o sitemap.

## Rollback

- O rollback versionado está em `supabase/rollback/20260820210000_football_catalog_expansion.sql` e remove somente os 50 produtos e seus registros dependentes.
- Os 200 objetos do Storage são preservados no rollback até que uma rotina comprove que estão órfãos, evitando exclusão irreversível ou quebra de cache.
- O catálogo local anterior continua recuperável pelo histórico do Git e pela fonte TypeScript.
