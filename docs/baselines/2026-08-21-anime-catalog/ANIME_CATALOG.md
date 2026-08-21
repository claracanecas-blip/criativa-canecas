# Expansão do catálogo — Animes

Data: 21 de agosto de 2026.

## Escopo, pesquisa e seleção

- Origem: `D:\estampas\39 - ANIMES\00 - MEGA PACOTE ANIMES`.
- O inventário encontrou 2.301 imagens raster em 36 pastas, incluindo volumes com nomes genéricos como `Cópia de...` e arquivos numerados.
- A seleção inicial continha 100 estampas. A revisão posterior identificou `animes-027` como Nanatsu no Taizai, e não Fairy Tail, e confirmou que `animes-083` repetia visualmente `animes-026`; os dois ficaram preservados localmente, mas foram retirados da publicação.
- A priorização combinou disponibilidade/qualidade local com sinais atuais: vencedores do [Crunchyroll Anime Awards](https://www.crunchyroll.com/animeawards/pastwinners/), reconhecimento de [Attack on Titan pelo impacto global](https://www.crunchyroll.com/news/latest/2025/5/21/anime-awards-2025-attack-on-titan-global-impact-award), audiência de anime na [Netflix no primeiro semestre de 2025](https://www.gamesradar.com/entertainment/anime-shows/netflix-subscribers-cant-get-enough-of-anime-with-over-4-4-billion-hours-watched-so-far-in-2025-and-a-classic-show-beat-the-likes-of-attack-on-titan-and-demon-slayer-to-take-the-number-1-spot/) e desempenho de [Demon Slayer no Brasil](https://www.jbox.com.br/2025/09/22/demon-slayer-castelo-infinito-ultrapassa-pokemon-e-se-torna-o-filme-de-anime-mais-assistido-do-brasil/).
- O manifesto completo liga ID, nome identificado, arquivo de origem, mockup, dimensões e hashes SHA-256 em `D:\estampas\39 - ANIMES\00 - MEGA PACOTE ANIMES\MOCKUPS - 100 ANIMES\manifest.csv`.
- Os cinco arquivos inicialmente escolhidos de Pokémon foram rejeitados pelo sistema de segurança do gerador. O bloqueio não foi contornado; eles foram substituídos por Hunter x Hunter, uma arte depois reconhecida como Nanatsu no Taizai, Berserk, Black Rock Shooter e No Game No Life.

## Mockups e revisão visual

- Os arquivos `animes-001.png` a `animes-100.png` foram gerados individualmente em 1254 × 1254 pixels com o gerador de imagem integrado.
- O layout mostra a estampa plana na parte superior e duas canecas grandes na parte inferior, sobre fundo de estúdio cinza claro.
- A arte cobre a superfície imprimível até a curvatura inferior natural; áreas claras que pertencem à própria estampa foram preservadas.
- Dez folhas de contato foram inspecionadas. A primeira revisão detectou três correspondências incorretas nos arquivos genéricos (`animes-065`, `animes-071` e `animes-090`); os três mockups foram refeitos com My Hero Academia, Death Note e Date A Live e aprovados na segunda revisão.
- As 100 estampas selecionadas e os 100 mockups possuem hashes SHA-256 únicos; nenhum arquivo final está ausente.
- Prompt final do modo integrado: mockup quadrado de e-commerce, prévia plana completa acima, exatamente duas canecas brancas abaixo, fotografia de estúdio neutra, arte original preservada e aplicação integral sem faixa inferior sem impressão.

## Imagens publicadas

- 100 originais WebP de 1000 × 1000.
- 100 variantes `card-320`, 100 variantes `card-640` e 100 variantes sociais de 1200 × 630.
- 400 objetos enviados ao bucket público `product-images` com cache de um ano.
- Os 400 objetos foram verificados individualmente: HTTP 200, `image/webp`, cache correto e hash remoto idêntico ao local.
- Após a correção, o conjunto ativo possui 708 originais e 2.124 variantes, totalizando 2.832 caminhos. O bucket conserva quatro objetos antigos de `pets-19` e os oito WebPs de `animes-027`/`animes-083` para rollback, total físico de 2.844 objetos.

## Catálogo e banco

- Migration aplicada: `20260821190000_anime_catalog_expansion.sql`.
- Migration corretiva: `20260821200000_correct_anime_catalog_classification.sql`.
- Produtos publicados após a revisão: 98 dos IDs `animes-001` a `animes-100`; `animes-027` e `animes-083` foram removidos.
- `animes-016` foi renomeado para Cavaleiros do Zodíaco 08. A inspeção visual classificou `animes-017` a `animes-020` como Cavaleiros do Zodíaco Dourados 13 a 16.
- Coleção usada: `animes`, com 141 produtos e todos os 43 modelos anteriores preservados.
- Resultado remoto esperado após a correção: 691 produtos publicados, 691 relações produto/coleção e 2.764 associações de imagem.
- O fallback TypeScript contém os mesmos 98 produtos novos; o build gera 691 páginas de produto e sitemap com 711 URLs.

## Segurança e qualidade

- Relatório remoto: [`catalog-verify-report.json`](catalog-verify-report.json).
- `db lint` sem apontamentos e histórico de migrations local/remoto alinhado.
- RLS validada positiva e negativamente para leitura anônima, usuário autenticado sem administração e administrador temporário; produtos, usuários, auditoria e objetos sentinela foram removidos.
- 58 testes automatizados, typecheck e build aprovados; o build remoto reconciliado gerou 691 páginas de produto e 711 URLs.
- RLS positiva/negativa, `db lint`, fluxo administrativo e os 18 cenários Playwright/axe do Chrome foram aprovados. O cenário público verifica paginação de 141 produtos, Cavaleiros Dourados 13, ausência das rotas `animes-027`/`animes-083` e preservação do Fairy Tail antigo válido.

## Rollback

- O rollback versionado está em `supabase/rollback/20260821190000_anime_catalog_expansion.sql` e remove somente os 100 produtos novos e seus registros dependentes.
- O rollback da correção está em `supabase/rollback/20260821200000_correct_anime_catalog_classification.sql`; ele restaura os dois registros removidos e a classificação anterior somente para recuperação de emergência.
- Os 400 objetos do Storage e as estampas permanecem preservados até comprovação de que não são mais referenciados, evitando exclusão irreversível e quebra de cache.
- O catálogo local anterior continua recuperável pelo histórico do Git e pelo fallback TypeScript.
