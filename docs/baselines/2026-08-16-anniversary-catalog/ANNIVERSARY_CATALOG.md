# Expansão do catálogo — Aniversários

Data: 16 de agosto de 2026.

## Escopo

- Origem recebida: `D:\estampas\34 - ANIVERSÁRIO`.
- Os sete produtos já publicados (`aniversario-01` a `aniversario-07`) foram preservados.
- A triagem considerou hash de arquivo e inspeção visual para evitar cópias renomeadas e artes já representadas em mockups existentes.
- Dos 36 arquivos encontrados, quatro eram cópias exatas em duas localizações, sete eram os mockups já publicados e nove artes já estavam representadas nesses produtos. Restaram 16 artes novas.
- Os novos IDs são `aniversario-08` a `aniversario-23`, sem reutilização de URL ou objeto existente.

## Mockups e variantes

Os 16 mockups seguem o padrão atual: imagem quadrada, duas canecas brancas, prévia superior da estampa, fundo de estúdio neutro e aviso “Foto Meramente Ilustrativa”. A estampa original foi usada como alvo; `aniversario-01.jpg` foi usado somente como referência de composição.

Após a geração, o pipeline oficial produziu:

- 374 originais WebP no acervo, sendo 16 novos;
- 1.122 variantes (`card/320`, `card/640` e `social`), sendo 48 novas;
- 1.496 objetos públicos verificados por `GET`;
- zero objetos ausentes, zero `Content-Type` incorreto e zero cache incorreto.

O upload foi limitado aos 64 objetos novos por meio das entradas configuráveis `PRODUCT_IMAGES_INPUT_DIR` e `PRODUCT_IMAGE_VARIANTS_DIR`.

## Catálogo e banco

A migration `20260816200000_anniversary_catalog_expansion.sql` cadastrou 16 produtos publicados, 16 relações com a coleção `aniversario` e 64 associações de imagem. O estado remoto validado ficou em:

- 17 coleções publicadas, 15 listadas;
- 357 produtos publicados;
- 357 relações produto–coleção;
- 1.428 associações de imagem.

O rollback versionado remove somente `aniversario-08` a `aniversario-23`. Os objetos do Storage são preservados durante rollback e só devem ser removidos depois de comprovadamente órfãos.

## Segurança e qualidade

O relatório [`catalog-verify-report.json`](catalog-verify-report.json) registra as verificações remotas. Foram confirmados:

- leitura pública dos produtos publicados e das imagens;
- escrita e upload negados para anônimo;
- escrita e upload negados para autenticado sem papel administrativo;
- escrita, auditoria e exclusão permitidas para administrador temporário;
- rascunho oculto ao público;
- remoção do usuário, produto, auditoria e objeto sentinela.

Também passaram `db lint`, 36 testes unitários, 12 cenários Playwright/axe no Chrome, `npm run typecheck`, `npm run build` e o prerender de 357 produtos, 17 coleções e 377 URLs.

## Rollback

1. Aplicar `supabase/rollback/20260816200000_anniversary_catalog_expansion.sql` em ambiente autorizado.
2. Reverter os arquivos de aplicação e testes do mesmo ciclo.
3. Fazer novo deploy da Vercel.
4. Manter os 64 objetos no Storage até confirmar que nenhum catálogo publicado os referencia.
