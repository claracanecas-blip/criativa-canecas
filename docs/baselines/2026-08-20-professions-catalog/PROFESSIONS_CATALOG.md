# Expansão do catálogo — Profissões

Data: 20 de agosto de 2026.

## Escopo e seleção

- Origem: `D:\estampas\30 - TEMA PROFISSÕES-20260816T171131Z-1-001\30 - TEMA PROFISSÕES`.
- 1.770 imagens raster foram inventariadas (1.294 JPG, 471 PNG e 5 JPEG), além de arquivos editáveis e fontes.
- Pastas chamadas `Mockup` ou `Mockups` foram excluídas da seleção automática.
- Foram escolhidas 50 profissões distintas, de Administração a Veterinária.
- Cada produto possui uma estampa JPG/PNG existente e verificável; nenhum mockup isolado foi aprovado para publicação.
- O vínculo entre produto, profissão, estampa de produção, mockup, dimensões e SHA-256 está em `D:\estampas\30 - TEMA PROFISSÕES-20260816T171131Z-1-001\30 - TEMA PROFISSÕES\MOCKUPS - 50 PROFISSÕES\manifest.csv`.

## Mockups e revisão visual

- Os mockups `profissoes-01.png` a `profissoes-50.png` foram gerados individualmente em 1254 × 1254 pixels.
- O layout mantém a prévia plana da estampa acima e duas canecas abaixo, nas vistas inclinada e frontal.
- A aplicação foi instruída a alcançar o limite inferior natural das duas canecas, sem faixa branca acidental; áreas brancas pertencentes à própria estampa foram preservadas.
- Três folhas de contato foram inspecionadas. Os 50 mockups possuem hashes SHA-256 únicos e as 50 estampas vinculadas existem no disco.
- Artes com campos de nome obrigatório foram descartadas; Comissária de Bordo e Eletricista substituíram opções que não funcionariam como catálogo genérico.
- Arquivos finais: `D:\estampas\30 - TEMA PROFISSÕES-20260816T171131Z-1-001\30 - TEMA PROFISSÕES\MOCKUPS - 50 PROFISSÕES`.

## Imagens publicadas

- 50 originais WebP de 1000 × 1000.
- 50 variantes `card-320`, 50 variantes `card-640` e 50 variantes sociais de 1200 × 630.
- 200 objetos enviados ao bucket público `product-images` com cache de um ano.
- Os 200 objetos foram verificados individualmente por `GET`: HTTP 200, `image/webp`, cache correto e hash remoto idêntico ao local.
- O conjunto atual passou a 524 originais e 1.572 variantes, totalizando 2.096 caminhos. O bucket contém ainda quatro objetos antigos de `pets-19` preservados para rollback, ou 2.100 objetos físicos.

## Catálogo e banco

- Migration aplicada: `20260820220000_professions_catalog_expansion.sql`.
- Produtos publicados: `profissoes-01` a `profissoes-50`, preço-base de R$ 39,90 e quatro imagens por produto.
- Coleção usada: `profissoes`, exibida como `Profissões`; a coleção já existia publicada e listada, mas não possuía produtos.
- Resultado remoto: 507 produtos publicados, 507 relações produto/coleção e 2.028 associações de imagem.
- O fallback TypeScript contém os mesmos 50 produtos e o build gera 507 páginas de produto e sitemap com 527 URLs.

## Segurança e qualidade

- Relatório remoto: [`catalog-verify-report.json`](catalog-verify-report.json).
- `db lint` sem apontamentos e histórico de migrations local/remoto alinhado.
- RLS validada positiva e negativamente para leitura anônima, usuário autenticado sem administração e administrador temporário; todos os sentinelas foram removidos.
- 47 testes automatizados, `npm run typecheck` e `npm run build` aprovados.
- 15 cenários Playwright/axe aprovados no Chrome, incluindo paginação 20 + 20 + 10 e limites `Administração 01`/`Veterinária 01`.
- HTML estático conferido para a coleção, o produto `profissoes-50` e o sitemap.

## Rollback

- O rollback versionado está em `supabase/rollback/20260820220000_professions_catalog_expansion.sql` e remove somente os 50 produtos e seus registros dependentes.
- Os 200 objetos do Storage e as estampas são preservados no rollback até comprovação de que estão órfãos, evitando exclusão irreversível ou quebra de cache.
- O catálogo local anterior continua recuperável pelo histórico do Git e pela fonte TypeScript.
