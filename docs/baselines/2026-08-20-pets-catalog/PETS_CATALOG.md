# Expansão do catálogo — Pets

Data: 20 de agosto de 2026.

## Escopo

- Origem recebida: `D:\estampas\134 - PETS-20260816T171303Z-1-001\134 - PETS`.
- Cem estampas PNG foram triadas visualmente; animais selvagens e variações duplicadas foram excluídos da seleção.
- Cinquenta mockups distintos de cães e gatos foram preparados e preservados fora do Git.
- Os produtos publicados usam IDs e slugs `pets-01` a `pets-50`, sem colisão com objetos ou produtos anteriores.

## Imagens

O pipeline oficial produziu para Pets:

- 50 originais WebP de 1000 × 1000;
- 50 variantes `card-320`;
- 50 variantes `card-640`;
- 50 variantes `social` de 1200 × 630.

Os 200 objetos foram enviados isoladamente ao bucket público `product-images`, com `Content-Type: image/webp` e cache público de um ano. A verificação completa por `GET` confirmou 1.696 objetos acessíveis, sem ausência, tipo incorreto ou cache incorreto.

## Catálogo e banco

A migration `20260820115000_pets_catalog_expansion.sql` cadastrou 50 produtos publicados, 50 relações com a coleção `pets` e 200 associações de imagem. O estado remoto validado ficou em:

- 17 coleções publicadas, 15 listadas;
- 407 produtos publicados;
- 407 relações produto–coleção;
- 1.628 associações de imagem.

O fallback TypeScript possui os mesmos 50 produtos. O build gera 407 páginas de produto, 17 páginas de coleção e sitemap com 427 URLs; o HTML estático da coleção inclui links para os 50 itens, sem o limite anterior de 40 produtos.

## Segurança e qualidade

O relatório [`catalog-verify-report.json`](catalog-verify-report.json) registra as verificações remotas. Foram confirmados:

- leitura pública somente de conteúdo publicado;
- escrita e upload negados para anônimo;
- escrita e upload negados para autenticado sem papel administrativo;
- escrita, auditoria e exclusão permitidas para administrador temporário;
- rascunho oculto ao público;
- remoção integral do usuário, produto, auditoria e objeto sentinela.

Também passaram `db lint`, 40 testes unitários, 13 cenários Playwright/axe no Chrome, `npm run typecheck`, `npm run build` e a paginação pública de 20 + 20 + 10 produtos.

## Rollback

1. Aplicar `supabase/rollback/20260820115000_pets_catalog_expansion.sql` em ambiente autorizado.
2. Reverter os arquivos de aplicação e testes do mesmo ciclo.
3. Fazer novo deploy da Vercel.
4. Manter os 200 objetos no Storage até confirmar que nenhum catálogo publicado os referencia.
