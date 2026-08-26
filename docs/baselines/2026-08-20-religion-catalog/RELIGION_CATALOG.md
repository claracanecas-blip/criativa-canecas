# Expansão do catálogo — Religião

Data: 20 de agosto de 2026.

> Correção posterior: em 26 de agosto de 2026, `religiao-01` foi substituído por `Porque Ele Vive`. Consulte [`../2026-08-26-religion-01-replacement/RELIGION_01_REPLACEMENT.md`](../2026-08-26-religion-01-replacement/RELIGION_01_REPLACEMENT.md). Este documento preserva a evidência histórica do lote original.

## Escopo e representatividade

- Origem: `D:\estampas\146 - RELIGIÕES DIVERSAS`.
- 210 imagens raster foram inventariadas: 150 PNG e 60 JPG.
- Foram selecionadas 50 estampas distintas e verificáveis, vinculadas aos respectivos mockups pelo manifesto em `D:\estampas\146 - RELIGIÕES DIVERSAS\MOCKUPS - 50 RELIGIÕES\manifest.csv`.
- A diversidade possível ficou limitada pelo material fornecido. A seleção contém 49 temas de raiz cristã — 30 cristãos genéricos, 14 católicos, 4 evangélicos e 1 messiânico — e 1 tema islâmico.
- Portanto, este lote tem impacto muito maior no público cristão do que no público religioso geral. Uma expansão genuinamente inter-religiosa requer estampas autênticas de budismo, judaísmo não messiânico, espiritismo, umbanda/candomblé, hinduísmo e mais opções islâmicas.
- Não foram inventados símbolos nem misturadas tradições somente para aparentar diversidade.

## Mockups e revisão visual

- Os mockups `religiao-01.png` a `religiao-50.png` foram gerados individualmente em 1254 × 1254 pixels.
- O layout apresenta a estampa plana acima e duas canecas abaixo, nas vistas inclinada e frontal.
- A aplicação da arte alcança o limite inferior natural das canecas; áreas brancas integrantes das estampas foram preservadas e não são faixas acidentais.
- Três folhas de contato foram inspecionadas. Os 50 mockups e as 50 estampas selecionadas possuem hashes SHA-256 únicos.
- `religiao-47` foi refeito porque a primeira versão acrescentou um padrão inexistente; o arquivo final preserva somente a arte original de fé e cruzes sobre fundo branco.
- Arquivos finais: `D:\estampas\146 - RELIGIÕES DIVERSAS\MOCKUPS - 50 RELIGIÕES`.

## Imagens publicadas

- 50 originais WebP de 1000 × 1000.
- 50 variantes `card-320`, 50 variantes `card-640` e 50 variantes sociais de 1200 × 630.
- 200 objetos enviados ao bucket público `product-images` com cache de um ano.
- Os 200 objetos foram verificados individualmente por `GET`: HTTP 200, `image/webp`, cache correto e hash remoto idêntico ao local.
- O conjunto atual passou a 574 originais e 1.722 variantes, totalizando 2.296 caminhos. O bucket conserva quatro objetos antigos de `pets-19` para rollback, total físico de 2.300 objetos.

## Catálogo e banco

- Migration aplicada: `20260820230000_religion_catalog_expansion.sql`.
- Produtos publicados: `religiao-01` a `religiao-50`, preço-base de R$ 39,90 e quatro imagens por produto.
- Coleção usada: `religiao`, exibida como `Religião`; ela já existia publicada e listada, mas não possuía produtos.
- Resultado remoto: 557 produtos publicados, 557 relações produto/coleção e 2.228 associações de imagem.
- O fallback TypeScript contém os mesmos 50 produtos e o build gera 557 páginas de produto e sitemap com 577 URLs.

## Segurança e qualidade

- Relatório remoto: [`catalog-verify-report.json`](catalog-verify-report.json).
- `db lint` sem apontamentos e histórico de migrations local/remoto alinhado.
- RLS validada positiva e negativamente para leitura anônima, usuário autenticado sem administração e administrador temporário; todos os sentinelas foram removidos.
- 50 testes automatizados, `npm run typecheck` e `npm run build` aprovados.
- 16 cenários Playwright/axe aprovados no Chrome, incluindo paginação 20 + 20 + 10 e limites `Fé Islâmica`/`Unidos pelo Amor do Pai`.
- HTML estático conferido para a coleção, o produto `religiao-50` e o sitemap de 577 URLs.

## Rollback

- O rollback versionado está em `supabase/rollback/20260820230000_religion_catalog_expansion.sql` e remove somente os 50 produtos e seus registros dependentes.
- Os 200 objetos do Storage e as estampas são preservados no rollback até comprovação de que estão órfãos, evitando exclusão irreversível ou quebra de cache.
- O catálogo local anterior continua recuperável pelo histórico do Git e pela fonte TypeScript.
