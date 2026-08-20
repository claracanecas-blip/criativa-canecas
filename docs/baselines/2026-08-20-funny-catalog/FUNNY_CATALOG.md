# Expansão do catálogo — Divertidas

Data: 20 de agosto de 2026.

## Escopo e seleção

- Origem: `D:\estampas\76 - DIVERTIDAS-20260820T201450Z-1-001\76 - DIVERTIDAS\02 - DIVERTIDAS 1`.
- 46 imagens raster únicas foram inventariadas: 44 JPG e 2 PNG.
- Foram aprovadas 36 estampas com mockups finais; o manifesto liga produto, nome, tema, estampa, mockup, dimensões e SHA-256 em `D:\estampas\76 - DIVERTIDAS-20260820T201450Z-1-001\76 - DIVERTIDAS\02 - DIVERTIDAS 1\MOCKUPS - DIVERTIDAS 1\manifest.csv`.
- Uma imagem foi excluída porque continha apenas um mockup pronto, sem estampa plana disponível.
- A paródia de cloroquina foi excluída por apresentar medicamento e alegação de prescrição em formato inadequado para o catálogo.
- O gerador integrado bloqueou oito artes de personagens: duas do Stitch, Bob Esponja, Homer, Rapunzel, duas do Bart e Star Wars. Os bloqueios não foram contornados e os personagens não foram redesenhados.
- O lote aprovado contém humor geral, bebidas, relacionamento, tecnologia, paródias, humor adulto e uma arte política; os temas deixam esse conteúdo explícito no catálogo.

## Mockups e revisão visual

- Os mockups `divertidas-01.png` a `divertidas-36.png` foram gerados individualmente em 1254 × 1254 pixels.
- O layout apresenta a estampa plana acima e duas canecas abaixo, nas vistas inclinada e frontal, sobre estúdio cinza claro.
- A aplicação alcança o limite inferior natural das duas canecas; áreas brancas integrantes das próprias estampas foram preservadas.
- Três folhas de contato foram inspecionadas. Os 36 mockups e as 36 estampas selecionadas possuem hashes SHA-256 únicos.
- Frases, cores, repetições e paródias tipográficas foram conferidas contra as origens; não foram misturados elementos entre produtos.
- Arquivos finais: `D:\estampas\76 - DIVERTIDAS-20260820T201450Z-1-001\76 - DIVERTIDAS\02 - DIVERTIDAS 1\MOCKUPS - DIVERTIDAS 1`.

## Imagens publicadas

- 36 originais WebP de 1000 × 1000.
- 36 variantes `card-320`, 36 variantes `card-640` e 36 variantes sociais de 1200 × 630.
- 144 objetos enviados ao bucket público `product-images` com cache de um ano.
- Os 144 objetos foram verificados individualmente por `GET`: HTTP 200, `image/webp`, cache correto e hash remoto idêntico ao local.
- O conjunto atual passou a 610 originais e 1.830 variantes, totalizando 2.440 caminhos. O bucket conserva quatro objetos antigos de `pets-19` para rollback, total físico de 2.444 objetos.

## Catálogo e banco

- Migration aplicada: `20260820233000_funny_catalog_expansion.sql`.
- Produtos publicados: `divertidas-01` a `divertidas-36`, preço-base de R$ 39,90 e quatro imagens por produto.
- Coleção usada: `divertidas`, exibida como `Divertidas`; ela já existia publicada e listada, mas não possuía produtos.
- Resultado remoto: 593 produtos publicados, 593 relações produto/coleção e 2.372 associações de imagem.
- O fallback TypeScript contém os mesmos 36 produtos e o build gera 593 páginas de produto e sitemap com 613 URLs.

## Segurança e qualidade

- Relatório remoto: [`catalog-verify-report.json`](catalog-verify-report.json).
- `db lint` sem apontamentos e histórico de migrations local/remoto alinhado.
- RLS validada positiva e negativamente para leitura anônima, usuário autenticado sem administração e administrador temporário; todos os sentinelas foram removidos.
- 53 testes automatizados, `npm run typecheck` e `npm run build` aprovados.
- 17 cenários Playwright/axe aprovados no Chrome, incluindo paginação 20 + 16 e limites `Vem Ni Mim`/`Surte e Atirei o Pau na Dona Chica`.
- HTML estático conferido para a coleção, o produto `divertidas-36` e o sitemap de 613 URLs.

## Rollback

- O rollback versionado está em `supabase/rollback/20260820233000_funny_catalog_expansion.sql` e remove somente os 36 produtos e seus registros dependentes.
- Os 144 objetos do Storage e as estampas são preservados no rollback até comprovação de que estão órfãos, evitando exclusão irreversível ou quebra de cache.
- O catálogo local anterior continua recuperável pelo histórico do Git e pela fonte TypeScript.
