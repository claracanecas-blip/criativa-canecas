# Memória do projeto — Criativa Canecas

Atualizada em 30 de agosto de 2026. Este arquivo preserva contexto operacional e decisões entre sessões. Não deve conter tokens, senhas ou chaves privadas.

## Identidade e serviços

- Produção: https://criativacanecas.com.br
- Hostname anterior: `https://criativa-canecas.vercel.app`, com redirecionamento permanente para a produção
- GitHub: https://github.com/claracanecas-blip/criativa-canecas
- Branch de produção: `main`
- Conta GitHub: `claracanecas-blip`
- Conta Vercel: `claracanecas-9141`
- Projeto Vercel: `criativa-canecas`
- Supabase project ref: `bqhqqgbdhglnecpfrbig`
- Supabase Storage: bucket público `product-images`
- URL pública do bucket: `https://bqhqqgbdhglnecpfrbig.supabase.co/storage/v1/object/public/product-images`

## Estado atual

- Stack: Vue 3, TypeScript 5.9, Vue Router, Tailwind CSS 4, Lucide Icons e Vite 6.
- Hospedagem: Vercel ligada ao GitHub; push em `main` cria deploy de produção.
- CI: GitHub Actions executa `npm ci`, `npm test` e `npm run build`.
- Imagens do conjunto atual: 738 originais WebP e 2.214 variantes no Supabase, totalizando 2.952 caminhos ativos; quatro objetos anteriores de `pets-19`, oito de `animes-027`/`animes-083` e quatro de `religiao-01` permanecem preservados para rollback, total físico de 2.968 objetos.
- Originais: preservados localmente em `source-images/` e ignorados pelo Git.
- Pacote de produção limpo: aproximadamente 2,1 MB e 21 arquivos na medição da migração.
- Rotas usam `createWebHistory`; `vercel.json` fornece fallback de SPA.
- O frontend consome o catálogo do Supabase por `src/repositories/catalogRepository.ts`; os dados TypeScript permanecem como fallback/rollback.
- O frontend resolve caminhos antigos `.jpg`/`.png` para WebP no Supabase por `src/utils/assets.ts`.
- Fluxo de compra atual: contato pelo WhatsApp, sem checkout próprio.
- Fase 0 do roadmap concluída: 341 produtos/IDs únicos, 358 imagens locais/remotas, 21 arquivos e 2,10 MB no build limpo.
- Lighthouse móvel inicial: home P74/A93/B100/S92; coleção de séries P79/A95/B100/S92.
- Evidências e backup restaurável da Fase 0 estão em `docs/baselines/2026-08-13/`; o backup possui SHA-256 validado por teste.
- Fases 0 e 1 publicadas em produção; GitHub Actions do commit `1fb5910` passou instalação limpa, testes e build.
- Fase 1 concluída: cache GET de um ano em todos os objetos, variantes 320/640/social, `srcset`, dimensões declaradas e placeholder de falha.
- Lighthouse móvel em produção: home P99/A93/B100/S92 e coleção P98/A95/B100/S92, ambas com CLS 0; a coleção requisitou somente variantes `card-640` para produtos.
- Workspace oficial local: `C:\Projetos\criativa-canecas-main`; a pasta anterior no OneDrive é somente backup e não deve receber novas alterações.
- Fase 2 concluída no Supabase: 17 coleções publicadas (15 listadas), 341 produtos, 341 relações e 1.364 associações de imagem.
- Migrations remotas `20260813184000`, `20260813190000` e `20260813191500` reconciliadas; tipos gerados em `src/types/database.ts` e `db lint` sem apontamentos.
- RLS remota validada para anon, autenticado sem admin e administrador temporário; nenhum usuário ou produto de teste permaneceu.
- Fase 3 concluída: listagem, coleção, busca, home e menus usam um cache compartilhado do catálogo remoto, com estados de carregamento, erro recuperável e fallback local.
- Variáveis públicas `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_CATALOG_SOURCE` configuradas na Vercel para Production, Preview e Development; nenhuma chave administrativa foi adicionada.
- Paridade navegada: 15 coleções listadas, 80 itens em `/colecao/series`, quatro resultados para `Arrow` e link legado `/colecao/desenhos` com 27 itens.
- Lighthouse local da Fase 3: home P99/A93/B100/S92 e coleção P98/A95/B100/S92.
- Fase 4 concluída: `/admin` exige sessão Supabase e papel em `admin_users`; login, recuperação/definição de senha, CRUD, múltiplas coleções, status, destaque, ordem e upload estão disponíveis.
- Upload administrativo valida JPEG/PNG/WebP até 10 MB e no mínimo 640 × 640, gerando no navegador as quatro variantes WebP antes da publicação.
- Auditoria remota registra criação/atualização/exclusão e ator; UUIDs de autoria foram removidos da superfície de leitura pública por privilégios de coluna.
- Supabase Auth usa `https://criativacanecas.com.br` como Site URL e permite callbacks do domínio principal, `www`, hostname anterior, previews do projeto e Vite local.
- Um convite administrativo foi enviado ao e-mail proprietário do projeto; o destinatário define a própria senha por link do Supabase.
- E2E Playwright comprovou login, 341 produtos iniciais, criação de coleção, publicação com quatro imagens, visualização pública, exclusões confirmadas e logout; nenhum sentinela permaneceu.
- Fase 5 concluída: 341 URLs `/produto/:slug` exibem imagem, SKU, preço, descrição, coleções, relacionados e WhatsApp com SKU/URL.
- O build gera 721 HTMLs de produto, 17 HTMLs de coleção, sitemap com 741 URLs e robots bloqueando `/admin`; HTML estático contém canonical, Open Graph, JSON-LD e conteúdo rastreável.
- Vercel usa `cleanUrls` e dá precedência aos HTMLs gerados antes do fallback SPA; preview confirmou `200` e metadados sem executar JavaScript.
- Lighthouse local da Fase 5: home P99/A93/B100/S100; coleção P99/A95/B100/S100; produto P90/A95/B100/S100, todos com CLS baixo/zero.
- Fase 6 concluída: eventos de produto, busca, coleção, WhatsApp e erro são agregados diariamente no Supabase, sem cookie, identificador de visitante, texto livre ou PII.
- Analytics só envia no hostname oficial de produção; localhost e previews são ignorados. A função RPC aceita apenas eventos/dimensões fechados e slugs publicados.
- RLS de analytics passou oito casos positivos/negativos; somente administradores leem os agregados e visitantes não acessam a tabela diretamente.
- CI executa 61 testes unitários, typecheck, build, 95 cenários Playwright/axe e Lighthouse com gate 90. `actions/checkout@v5` e `actions/setup-node@v5` usam runtime Node 24; a matriz cobre Chrome, Edge atual em Windows, Firefox, WebKit desktop e perfil Safari móvel, sem violações Axe WCAG 2.2 A/AA nos fluxos públicos.
- Lighthouse local da Fase 6: home P99/A98/B100/S100; coleção P99/A100/B100/S100; produto P90/A100/B100/S100.
- Fase 7 concluída: visitantes adicionam/removem produtos, alteram quantidades e mantêm a seleção em `localStorage`, sem conta ou dado pessoal.
- “Meu orçamento” abre drawer lateral no desktop e painel inferior no celular; contador, estado vazio, confirmação para limpar e anúncios acessíveis estão implementados.
- WhatsApp consolidado inclui quantidade, nome, SKU, subtotal, link e total estimado, com ressalvas de preço/prazo/disponibilidade e sem promessa de reserva/pedido.
- Qualidade da Fase 7: 24 testes unitários, 8 E2E/axe e Lighthouse home P99/A98, coleção P99/A100 e produto P91/A100; Boas Práticas/SEO 100.
- Base técnica da Fase 8 concluída: `/informacoes` está no rodapé, prerender e sitemap de 713 URLs; textos evitam promessas antes da confirmação no atendimento.
- O gerador de SEO remove metadados-base antes do prerender; páginas estáticas devem conter exatamente um canonical, validado em `/informacoes` e `/produto/arrow-1`.
- Depoimentos nascem em rascunho, só publicados aparecem na home e fotos exigem referência de consentimento. O banco permanece sem depoimentos fictícios.
- Referências de consentimento e autoria não são colunas públicas; o painel lê os dados completos por RPC que exige papel administrativo.
- `/admin/depoimentos` permite moderação; sete verificações RLS remotas e lint passaram. A suíte agora possui 26 testes e 9 E2E/axe.
- Fase 8 ganhou conteúdo institucional administrável: `site_content_sections` mantém cartões e FAQ em rascunho/publicado/arquivado; `/admin/informacoes` permite editar, ordenar, publicar, arquivar e excluir sem alterar código.
- A página pública lê somente seções publicadas, usa backup local seguro em falha do Supabase e o prerender consulta a mesma fonte para produzir HTML rastreável. Nove textos-base seguros foram reconciliados sem inventar condições comerciais.
- A migration remota `20260813221500` e o lint passaram; 11 verificações RLS confirmaram leitura pública limitada, escrita exclusiva de administrador, autoria privada, ciclo rascunho → publicação e limpeza integral dos dados temporários.
- O fluxo real de `/admin/informacoes` passou seis verificações navegadas: proteção por login, abertura autorizada, criação de rascunho com autoria, invisibilidade pública, publicação visível e exclusão confirmada; conta e conteúdo temporários foram removidos.
- Qualidade local atual: 66 testes, 23 E2E/axe por perfil, typecheck e build; Lighthouse mais recente: home P98/A98, coleção P98/A100 e produto P91/A100, com Boas Práticas/SEO 100.
- A origem canônica foi centralizada em `VITE_SITE_URL`, configurada como variável pública na Vercel para Production, Preview e Development. Canonical, Open Graph, JSON-LD, sitemap, robots, links comerciais e analytics seguem a mesma origem.
- O responsável público e o WhatsApp oficial foram confirmados pelo proprietário e centralizados em `src/data/site.ts`; o rodapé exibe ambos de forma consistente. CNPJ e avaliações permanecem ausentes até o fornecimento de dados reais.
- A auditoria `docs/audits/2026-08-13-SDD_COMPLETION_AUDIT.md` mapeia os 59 requisitos: todos têm evidência técnica; somente o aceite externo da Fase 8 continua pendente.
- O domínio `criativacanecas.com.br` foi ativado em 14 de agosto de 2026 com HTTPS, canonical único, sitemap de 361 URLs e analytics no hostname novo; `www` e o hostname `vercel.app` redirecionam com `308`, preservando caminho e parâmetros.
- A troca coordenada atualizou `VITE_SITE_URL` nos três ambientes da Vercel e a configuração versionada do Supabase Auth. O procedimento e o rollback estão em `docs/runbooks/CUSTOM_DOMAIN.md`; a evidência está em `docs/baselines/2026-08-14-phase-8-domain/DOMAIN_ACTIVATION.md`.
- Fase 9 de descoberta concluída com decisão de adiar checkout: faltam histórico de conversão e operação comercial definida; orçamento + WhatsApp permanece o fluxo oficial.
- A coleção Aniversário foi ampliada em 16 de agosto de 2026 sem duplicar os sete itens existentes: 16 mockups novos (`aniversario-08` a `aniversario-23`), 64 objetos novos no Storage e migration remota `20260816200000`.
- Após a expansão de Aniversário, o catálogo possuía 357 produtos, 357 relações e 1.428 associações de imagem. RLS positiva/negativa, `db lint`, os 1.496 objetos públicos, typecheck e build foram validados; a evidência está em `docs/baselines/2026-08-16-anniversary-catalog/`.
- A coleção Pets foi publicada em 20 de agosto de 2026 com 50 produtos (`pets-01` a `pets-50`), 200 objetos WebP novos e migration remota `20260820115000`.
- Após a expansão de Amizade, o catálogo remoto possui 721 produtos, 721 relações e 2.884 associações de imagem. O conjunto atual referencia 2.952 caminhos; o Storage contém 2.968 objetos físicos porque preserva quatro WebPs antigos de `pets-19`, oito de `animes-027`/`animes-083` e quatro de `religiao-01` para rollback.
- Os 50 mockups de Pets foram revisados visualmente em folhas de contato. Somente `pets-19` tinha uma faixa sem estampa na base da caneca frontal; o PNG foi corrigido, preservado com backup local e publicado nos quatro caminhos versionados `pets-19-r2.webp` pela migration `20260820193000`. Os quatro objetos anteriores permanecem disponíveis para rollback.
- A coleção `Futebol & Esportes`, antes vazia, recebeu em 20 de agosto de 2026 50 produtos (`futebol-01` a `futebol-50`) de 20 clubes, 200 objetos WebP e migration remota `20260820210000`. Os 78 arquivos de origem foram triados por popularidade, qualidade e duplicidade; os 50 mockups finais foram revisados quanto a preenchimento, dimensões e unicidade. Evidência em `docs/baselines/2026-08-20-football-catalog/`.
- A coleção `Profissões`, antes vazia, recebeu em 20 de agosto de 2026 50 produtos (`profissoes-01` a `profissoes-50`) de 50 temas, 200 objetos WebP e migration remota `20260820220000`. A seleção excluiu pastas de mockups e exige uma estampa JPG/PNG existente para cada produto; o manifesto liga todos os mockups aos respectivos arquivos de produção. Evidência em `docs/baselines/2026-08-20-professions-catalog/`.
- A coleção `Religião`, antes vazia, recebeu em 20 de agosto de 2026 50 produtos (`religiao-01` a `religiao-50`), 200 objetos WebP e migration remota `20260820230000`. Em 26 de agosto, `religiao-01` foi substituído a pedido do proprietário por `Porque Ele Vive`, com mockup e quatro caminhos versionados `religiao-01-r2.webp` pela migration `20260826150000`; os quatro objetos islâmicos anteriores permanecem somente para rollback. O conjunto ativo da coleção agora possui 49 temas cristãos e um messiânico. Evidências em `docs/baselines/2026-08-20-religion-catalog/` e `docs/baselines/2026-08-26-religion-01-replacement/`.
- A coleção `Divertidas`, antes vazia, recebeu em 20 de agosto de 2026 36 produtos (`divertidas-01` a `divertidas-36`), 144 objetos WebP e migration remota `20260820233000`. Das 46 estampas únicas, uma foi excluída por ser apenas mockup sem estampa plana, uma por paródia de medicamento e oito porque o gerador bloqueou personagens conhecidos. Os 36 mockups aprovados foram revisados quanto a texto, fidelidade, preenchimento, dimensões e unicidade; o lote inclui humor adulto e uma arte política. Evidência em `docs/baselines/2026-08-20-funny-catalog/`.
- A coleção `Animes` recebeu inicialmente 100 produtos (`animes-001` a `animes-100`) em 21 de agosto de 2026. A revisão visual posterior identificou `animes-027` como Nanatsu no Taizai, não Fairy Tail, e `animes-083` como repetição de `animes-026`; ambos foram removidos pela migration `20260821200000`, deixando 98 novos e 141 na coleção. `animes-017` a `animes-020` foram classificados como Cavaleiros do Zodíaco Dourados 13 a 16. Os 100 mockups locais permanecem preservados e o manifesto registra os dois não publicados; evidência em `docs/baselines/2026-08-21-anime-catalog/`.
- A coleção `Amizade` recebeu 30 produtos adicionais (`amizade-43` a `amizade-72`) em 21 de agosto de 2026, selecionados da pasta `71 - DIA DOS AMIGOS` sem repetir as 42 artes anteriores. Os 30 mockups e as 30 origens possuem hashes únicos, foram revisados em folha de contato e publicados com 120 objetos WebP pela migration `20260821210000`. Evidência em `docs/baselines/2026-08-21-friendship-catalog/`.
- A Fase 10 de escala e descoberta foi concluída em produção em 26 de agosto de 2026. O incremento elimina truncamento acima de 1.000 linhas no catálogo público, admin e SEO, reduz a carga REST observada da home de aproximadamente 598 KB para 287 KB e separa o fallback TypeScript do bundle principal.
- Busca local agora ignora acentos, aceita SKU/slug e pagina em 20 itens; `sao paulo` encontra os mesmos sete produtos de `São Paulo`, e `CC-ARROW-1` encontra `Arrow 01`.
- A home local respeita `is_featured` e completa a vitrine com oito coleções diferentes. O menu mobile passou a usar botão acessível, abre abaixo do gatilho sem overflow e o cabeçalho caiu de aproximadamente 290 px para 210 px em viewport de 390 px.
- O destaque fixo de Dia dos Pais saiu dos menus após a campanha; a rota foi preservada. O PR `#1` foi mesclado em `main` por `a71d71c`, e o deployment Vercel `dpl_Ehkg11YwFUPWwBccNT6JAwvgMs7J` ficou `Ready` no domínio oficial. O CI da `main` aprovou 65 testes, typecheck, build, 80 cenários nos quatro perfis principais, 20 no Edge e Lighthouse. O smoke de produção confirmou rotas `200`, redirects `308`, sitemap com 741 URLs, canonical oficial, buscas por acento/SKU, `Porque Ele Vive` e menu mobile sem overflow.
- O incremento local de clareza de preço e entrega centraliza em `src/data/site.ts` que o valor exibido corresponde à caneca e não inclui frete. A interface diferencia entrega/retirada em Araranguá, com mimo conforme disponibilidade, de envio pelos Correios para outras cidades com cálculo por CEP; mensagens do WhatsApp e orçamento pedem cidade/CEP sem armazenar esse dado no site.
- A validação desse incremento cobre 66 testes, typecheck, build com 741 URLs, 92 cenários Playwright/Axe em Chrome, Firefox, WebKit desktop e Safari móvel e 23 no Edge/Windows. O Edge local encerra antes de criar páginas, mas a matriz do GitHub Actions cobre esse perfil.
- Uma oscilação de carregamento de imagens no CI revelou contraste insuficiente no placeholder (`3,79:1`). O texto foi escurecido e o E2E agora aborta o Storage deliberadamente para validar esse estado de erro em toda execução.
- O PR `#2` foi mesclado em `main` por `1d7cf9a` em 28 de agosto de 2026. O deployment Vercel de produção ficou `Ready`; smoke navegável confirmou home, produto, personalizada e informações com status `200`, canonical oficial, texto de frete e redirecionamentos `308` preservando caminho e parâmetros.
- A Fase 11 de experiência assistida foi publicada inicialmente pelo PR `#3`: produto possui galeria preparada para múltiplas imagens; detalhes seguros e depoimentos moderados entram no contexto do produto; coleção/busca têm filtros e ordenação; `/personalizada` possui prévia 2D local com resumo para WhatsApp. Não houve migration, upload ou persistência da imagem do cliente.
- Após revisão do proprietário, o zoom modal de tela cheia foi substituído por ampliação de 2,4× recortada na própria caixa: acompanha o cursor no computador, ativa por toque e arraste no celular e continua operável por teclado. O PR `#4` foi mesclado por `3e51a2c`; Vercel ficou `Ready` e o smoke de produção confirmou foco proporcional ao cursor/toque, ausência de modal e ausência de overflow.
- O preview Vercel da Fase 11 ficou `Ready` e respondeu `200` nas rotas home, produto, coleção, busca e personalizada. O CI aprovou 69 testes, typecheck, build, 104 cenários Playwright/Axe nos quatro perfis principais, 26 no Edge e Lighthouse com todas as categorias em pelo menos 90.
- Nos modelos prontos do catálogo, os CTAs agora dizem `Pedir pelo WhatsApp` nos cards e `Pedir este modelo pelo WhatsApp` na página do produto. A mensagem identifica interesse no modelo, SKU e URL; `personalizar` permanece reservado ao fluxo `/personalizada`.
- A seção comercial de `/personalizada` apresenta uma única oferta, `Caneca personalizada`, em dois níveis de serviço: `R$ 39,90` quando o cliente envia arte pronta para impressão e `R$ 44,90` quando a equipe cria ou adapta a composição. A interface não apresenta uma taxa separada, evitando a impressão de cobrança duplicada. Nenhuma caneca sem estampa é anunciada ou oferecida.
- A nova home aprovada em 28 de agosto de 2026 coloca produtos reais e os caminhos `Ver modelos`/`Criar minha caneca` na primeira dobra, antecipa categorias com miniaturas, mantém oito modelos em destaque e apresenta personalização e entrega em uma sequência comercial clara. O hero rosa usa somente textura pontilhada, curvas e brilhos discretos, com composição específica para celular.
- A faixa superior da home passou a comunicar entrega ou retirada em Araranguá e envio pelos Correios. A mudança não altera banco, catálogo ou política comercial; typecheck, build com 741 URLs, 69 testes e os cenários E2E de estrutura/acessibilidade da home foram aprovados localmente antes da publicação direta autorizada na `main`.
- Um incremento local de 29 de agosto substituiu a caneca plana em CSS de `/personalizada` por uma prévia 3D procedural com Three.js. Imagem e frase viram uma textura dinâmica local; mouse, toque, teclado e botões giram a caneca, roda/pinça controlam zoom e dispositivos sem WebGL 2 recebem fallback 2D. A rota continua sem upload ou persistência do arquivo do cliente.
- Em uma etapa anterior do PR `#8`, `/personalizada` ofereceu `Caneca personalizada` e `Caneca personalizada com foto`; essa divisão foi posteriormente substituída pela oferta única descrita acima. Caneca mágica e a opção colorida separada continuam removidas. O histórico do protótipo permanece em `docs/baselines/2026-08-29-personalization-3d/`.
- A revisão do PR `#8` acrescentou um editor plano complementar para fotos: o cliente arrasta a imagem dentro da área aproximada de impressão, usa ações de foto inteira, preenchimento e centralização, controla zoom até 250% e conserva ajustes finos e teclado. A mesma composição atualiza imediatamente a caneca 3D e o fallback 2D, sem upload.
- O gabarito de produção da caneca cerâmica branca foi confirmado no acervo operacional como `21 × 8,7 cm`. O editor agora usa essa proporção e gera no próprio navegador uma prévia PNG de `2480 × 1028 px`, com metadado de `300 dpi`; a interface oferece download e, em dispositivos compatíveis, compartilhamento nativo. A mensagem do WhatsApp registra arquivo original, zoom, posição e nome da prévia, enquanto orienta o envio da prévia e da foto original.
- A personalização do PR `#8` adota fluxo híbrido. `Quero ver e ajustar` mantém a prévia automática e deixa o editor detalhado recolhido como opção; `Quero que vocês criem` coleta foto, frase e orientação sem exigir enquadramento nem download do gabarito. O WhatsApp distingue os dois pedidos: no primeiro solicita prévia e original; no segundo solicita o original e registra que a equipe preparará o mockup final para aprovação.
- O caminho `Quero ver e ajustar` ganhou uma conferência guiada após o upload: a interface anuncia que a prévia automática está pronta e oferece as ações diretas `Ver na caneca` e `Ajustar foto`. A primeira leva foco e rolagem à caneca 3D, que agora possui título e instrução contextual; a segunda abre/fecha explicitamente o editor. Uma arte real do acervo operacional foi usada somente em teste local, sem cópia, upload ou versionamento, e confirmou fotos/texto legíveis e exportação `2480 × 1028 px`/`300 dpi`.
- O enquadramento automático do modo ajustável passou a ampliar fotos em até `140%` quando isso melhora o preenchimento, preservando `Foto inteira` como retorno a `100%`. O gabarito de `21 × 8,7 cm` reserva `3%` em cada lateral como proteção transparente próxima à alça; o editor mostra essas faixas, o posicionamento não abre lacunas dentro da área útil, o PNG aplica o mesmo recorte e a caneca 3D mascara a arte sob a região física da alça. O teste local com arte real confirmou uma composição mais preenchida e uma faixa branca limpa antes da alça, sem copiar ou publicar o arquivo do acervo.
- Uma decisão posterior do proprietário simplificou o PR `#8` para um único atendimento assistido: o cliente informa modelo, frase e orientações e pede que a Criativa Canecas produza o mockup para aprovação. A prévia 3D, o editor, a exportação do gabarito e as dependências Three.js foram removidos. Em celulares compatíveis, a caixa de imagem e `Enviar foto e pedido pelo WhatsApp` usam o compartilhamento nativo com o arquivo original. No computador, a caixa fica oculta para evitar seleção duplicada; `Abrir WhatsApp da Criativa` direciona ao número oficial e a foto é anexada somente na conversa. A mensagem foi reduzida a modelo, arquivo quando compartilhado, frase, detalhes, pedido de mockup e cidade/CEP. O arquivo permanece somente no navegador até uma ação explícita do cliente. O commit `34d03d6` foi aprovado pelo CI com 69 testes, 108 cenários nos quatro perfis principais, 27 no Edge e Lighthouse P90+; a Vercel publicou o preview `Ready`, enquanto `main` e produção continuam inalteradas.
- Em 30 de agosto de 2026, o proprietário autorizou consolidar esse fluxo em uma única `Caneca personalizada`. Após observar que “personalizada” já pode sugerir criação inclusa, a apresentação comercial foi refinada para comparar diretamente `Com arte pronta para impressão — R$ 39,90` e `Com criação ou adaptação por nós — R$ 44,90`, sem chamar a diferença de taxa. O resumo do WhatsApp usa a mesma comparação em uma linha.
- O PR `#8` foi mesclado em `main` por `a84c342` e publicado em produção pela Vercel no deployment `dpl_92kp1f2yz5Q4xrD7JhJye22HjZaa`, estado `Ready`. O CI da `main` aprovou 70 testes, typecheck, build, 112 cenários nos quatro perfis principais, 28 no Edge e Lighthouse. O smoke em `https://criativacanecas.com.br/personalizada` confirmou a oferta única, os três valores, a isenção de arte pronta, o número oficial `5548991992341` e os valores na mensagem do WhatsApp; domínio oficial respondeu `200` e aliases preservaram redirects `308`.
- O refinamento comercial sem linguagem de taxa foi publicado por `bb92956` no deployment de produção `dpl_AHx3wNsAkz5TrjYaU4yyy9mArg7i`, estado `Ready`. O CI aprovou novamente 70 testes, typecheck, build, 112 cenários principais, 28 no Edge e Lighthouse. O smoke em navegador real confirmou os dois níveis de preço, ausência da palavra `taxa` na página e na mensagem, e destino oficial do WhatsApp.
- A escolha explícita entre `Vou enviar a arte pronta` e `Quero criação ou adaptação` foi publicada em produção pelo commit `af15594`. Os níveis e preços são os dois cartões clicáveis no início de `/personalizada`; a apresentação comercial e os quatro passos genéricos anteriores foram removidos para não duplicar a decisão. Só depois da escolha aparecem os campos, passos, resumo de preço e CTA adequados. Arte pronta a `R$ 39,90` não exibe nome/frase nem pede criação; criação/adaptação a `R$ 44,90` coleta a ideia e pede composição e mockup para aprovação. `Caneca Mágica` e `Canecas com Foto` saíram da barra e do mega menu porque não são ofertas separadas. Localmente passaram typecheck, 70 testes, build com 741 URLs, inspeção em 1440 × 1000/390 × 844 e `112/112` cenários E2E/Axe. O CI remoto `33300067856` aprovou ainda `28/28` cenários Edge e Lighthouse; a Vercel concluiu o deployment de produção `criativa-canecas-3b1ehvgoo-claracanecas-9141s-projects.vercel.app`. Smoke no domínio oficial confirmou status `200`, navegação simplificada, os dois valores exclusivos por mensagem e o WhatsApp `5548991992341`.
- O checkup comercial de 30 de agosto de 2026 confirmou que os 721 produtos usam o mesmo preço de `R$ 39,90`; por isso, coleções ocultam filtro e ordenação por preço enquanto os valores forem uniformes, mantendo apenas tema e `Destaques`/nome. Se preços diferentes forem publicados no futuro, os controles reaparecem automaticamente. `/com-fotos` agora redireciona para `/personalizada`, e `/dia-dos-pais` para `/presentes`, preservando links antigos sem exibir ofertas redundantes ou campanha vencida. A auditoria remota verificou 17 coleções, 721 relações e 2.884 registros de imagem, com nomes, IDs, slugs, SKUs, ordem, metadados e quatro variantes por produto íntegros. Seis artes antigas de Demon Slayer receberam nomes descritivos e `geek-16` passou a `Breaking Bad — Walter e Jesse`, eliminando números repetidos sem alterar IDs, URLs, SKUs, preços ou imagens. As migrations `20260830090000` e `20260830100000` possuem rollback versionado; banco sem erros de lint, leitura pública positiva e escrita anônima negativa `42501`. A aplicação passou em typecheck, 73 testes, build com 741 URLs e 116 cenários E2E/Axe; três timeouts locais do Firefox sob seis workers passaram na repetição serial. A inspeção visual cobriu coleção em 1440 × 1000/390 × 844 e os produtos renomeados em 1280 × 900. O commit `96486d0` foi publicado na `main`; o CI `33301474746` aprovou os 116 cenários principais, 29 no Edge e Lighthouse com todas as categorias em pelo menos 90. A Vercel publicou `criativa-canecas-cx0jninne-claracanecas-9141s-projects.vercel.app` em produção. Smoke no domínio oficial confirmou status `200`, filtros simplificados, os dois redirecionamentos e os nomes corrigidos.

## Decisões tomadas

1. Manter Vue em vez de fazer uma reescrita sem necessidade.
2. Adotar TypeScript estrito e validar no build.
3. Usar Lucide para evitar ícones com aparência de emoji.
4. Usar Supabase Storage para retirar imagens pesadas do deploy.
5. Manter a chave `service_role` fora do repositório e do bundle, mesmo havendo autorização para salvá-la localmente.
6. Usar Vercel como produção e GitHub Actions como CI, não como deploy principal.
7. Preservar os arquivos pessoais de cartão existentes na raiz; eles não pertencem ao site e não devem ser adicionados ao Git sem pedido explícito.
8. Evoluir primeiro o catálogo e o orçamento via WhatsApp; pagamento online depende de uma descoberta posterior.
9. Pré-gerar variantes no plano atual do Supabase, evitando depender das transformações dinâmicas de imagem de planos pagos.
10. Tratar caminhos de imagem como versionados: quando o conteúdo mudar, publicar um novo nome em vez de reutilizar indefinidamente uma URL com cache de um ano.
11. Usar IDs textuais estáveis no banco para preservar os IDs/slugs existentes durante a migração.
12. Separar `is_published` de `is_listed`: coleções legadas continuam acessíveis por URL, mas não voltam aos menus.
13. Centralizar leitura do catálogo em um repositório tipado; a UI não acessa diretamente o cliente Supabase.
14. Manter fallback automático para TypeScript em falhas transitórias e feature flag `VITE_CATALOG_SOURCE=typescript` para rollback integral.
15. Autorizar o painel em duas camadas: sessão válida no Supabase Auth e papel `admin` no banco/RLS.
16. Gerar variantes de imagem no navegador antes de publicar; caminhos recebem nome versionado e objetos antigos não são apagados automaticamente.
17. Não expor `created_by`/`updated_by` nas consultas públicas; administradores consultam autoria pelo log protegido.
18. Prerenderizar HTML estático no build atual em vez de migrar para SSR/Nuxt sem evidência; manter a SPA para interatividade e fallback.
19. Gerar SEO pelo catálogo remoto na Vercel e usar o backup local somente quando a leitura remota falhar durante o build.
20. Usar agregação diária própria no Supabase em vez de eventos customizados pagos da Vercel; não armazenar sessão, IP, termo buscado ou mensagem de erro.
21. Não exibir banner de consentimento enquanto não houver cookies ou integração opcional de marketing; qualquer Pixel/GA futuro exige avaliação e consentimento antes de carregar.
22. Tratar contraste WCAG como gate de CI: CTAs rosa usam `--pink-dark` e WhatsApp usa verde escuro com texto branco.
23. Manter o orçamento exclusivamente local e versionado; armazenar apenas slug/quantidade, normalizar conteúdo inválido e limitar cada item a 99 unidades.
24. Tratar valores do orçamento como estimativas e manter o WhatsApp como confirmação humana de personalização, prazo, disponibilidade e preço.
25. Preservar lacunas de IDs quando uma arte publicada for removida por classificação incorreta ou duplicidade; não renumerar produtos existentes nem apagar seus objetos de imagem enquanto o rollback estiver ativo.
25. Não inventar identidade empresarial, políticas, prazos ou avaliações; disponibilizar conteúdo-base seguro e aguardar dados oficiais para afirmações comerciais definitivas.
26. Exigir moderação administrativa de depoimentos e referência externa de consentimento para qualquer foto de cliente.
27. Reavaliar checkout somente após 30 dias de métricas e operação pronta; gatilhos de investigação: 30 pedidos confirmáveis/mês ou perda documentada ≥10% por ausência de pagamento imediato.
28. Se aprovado futuramente, começar por link/checkout hospedado após confirmação da arte, sem dados brutos de cartão no sistema.
29. Manter FAQ e informações comerciais em seções versionadas no Supabase, com fallback local seguro; somente conteúdo publicado é público e a autoria fica restrita à RPC administrativa.
30. Definir uma única origem oficial por `VITE_SITE_URL`; aliases e previews nunca devem virar canonical nem contaminar analytics.
31. Paginar consultas Supabase em blocos de até 1.000 linhas até receber uma página incompleta; nenhuma camada pode assumir que o catálogo permanecerá abaixo do limite do PostgREST.
32. Consultar no frontend somente colunas realmente consumidas e carregar o catálogo TypeScript de fallback sob demanda.
33. Campanhas sazonais permanecem acessíveis por rota quando necessário, mas só entram nos menus durante período ativo ou gestão explícita.
34. Centralizar a política de entrega junto à identidade do site: preço da caneca sem frete, atendimento local em Araranguá e envio pelos Correios para outras cidades. Cidade/CEP entram somente na mensagem do WhatsApp e não são persistidos pela aplicação.
35. Manter a imagem de personalização inteiramente no navegador: o arquivo selecionado não é persistido nem enviado automaticamente; o cliente compartilha ou anexa o original no WhatsApp e aprova o mockup antes da produção.
36. Exibir ficha e prova social apenas com dados seguros: material/capacidade permanecem como confirmação por modelo e avaliações/fotos só aparecem após moderação e consentimento reais.
37. Manter produto e decisão comercial na primeira dobra da home; detalhes decorativos devem ter baixo contraste, não competir com as canecas e ser reduzidos no celular.
38–44. Decisões históricas do protótipo 3D/editor do PR `#8`, superadas pela simplificação registrada na decisão 45; detalhes e rollback permanecem em `docs/baselines/2026-08-29-personalization-3d/` e no histórico Git.
45. Usar um único fluxo assistido em `/personalizada`: receber imagem original, frase e orientações; permitir compartilhamento explícito do arquivo pela Web Share API quando suportado; usar o link do WhatsApp apenas para preencher a mensagem e instruir anexo manual quando necessário; a equipe cria o mockup e o cliente aprova antes da produção. Não manter editor, simulação 3D ou PNG de prévia no site.
46. Tratar foto como possível insumo da personalização, não como oferta independente, e não anunciar Caneca Mágica enquanto ela não fizer parte da operação. Preservar URLs antigas por redirecionamento para a oferta atual, sem manter páginas ou itens redundantes na navegação.
47. Ocultar filtros e ordenações de preço quando todos os produtos da coleção custarem o mesmo; reativá-los automaticamente somente quando houver valores distintos.

## Histórico relevante

- Commit `7be0f68`: migração para TypeScript, Tailwind, Lucide e Supabase.
- Commit `abab262`: exclusões para uploads da Vercel e conexão automática.
- Commit `dbdc35f`: centralização do ícone de busca.
- Primeiro deploy via CLI enviou 947 MB de arquivos locais; `.vercelignore` foi criado e o deploy automático seguinte terminou em aproximadamente 12 segundos.
- GitHub CLI, Supabase CLI e Vercel CLI estão autenticados neste computador no contexto do usuário.

## Cuidados operacionais

- A antiga cópia do projeto no OneDrive deve permanecer apenas como backup até confirmação posterior do usuário; o workspace ativo está em `C:\Projetos`.
- Fora do OneDrive, `supabase link`, migrations e geração de tipos funcionam normalmente. Docker Desktop continua ausente, então `db dump`/stack local não estão disponíveis; o backup JSON e os rollbacks versionados cobrem esta fase.
- O PowerShell bloqueia o alias `npm.ps1`; use `C:\Program Files\nodejs\npm.cmd` e `C:\Program Files\nodejs\npx.cmd` quando necessário.
- Git e GitHub CLI foram instalados depois da abertura da sessão; alguns processos não enxergam o Git no `PATH`. O executável está em `C:\Program Files\Git\cmd\git.exe`.
- `.env.local` é ignorado e pode conter dados locais gerenciados pela Vercel. Nunca imprima seu conteúdo completo em logs.
- Não use `git add .` neste workspace. Há imagens de cartões e scripts PowerShell pessoais não rastreados.

## Comandos de verificação

```powershell
& "C:\Program Files\nodejs\npm.cmd" run typecheck
& "C:\Program Files\nodejs\npm.cmd" run build
& "C:\Program Files\nodejs\npm.cmd" run images:verify
& "C:\Program Files\Git\cmd\git.exe" status --short
```

Scripts de imagem disponíveis:

- `npm run images:optimize`
- `npm run images:variants`
- `npm run images:upload`
- `npm run images:verify`

Upload exige `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` apenas no ambiente da execução.

## Riscos e débitos conhecidos

- A coleta inicial de cache usou `HEAD` e foi inconclusiva para `GET`; a Fase 1 agora verifica por `GET` e confirmou `public, max-age=31536000` nos 1.432 objetos.
- Objetos antigos do Storage são preservados quando um produto é excluído; uma rotina futura de limpeza deve remover somente órfãos comprovados.
- Metadados estáticos e sitemap refletem o catálogo no momento do deploy; mudanças administrativas aparecem imediatamente na SPA, mas exigem novo deploy para atualizar prévias sociais e HTML rastreável.
- O orçamento não sincroniza entre dispositivos e navegadores; isso é intencional enquanto não houver conta de cliente.
- O hostname aceito pelo analytics deriva de `VITE_SITE_URL`; qualquer troca futura de domínio deve ocorrer no mesmo deploy das canônicas e da configuração do Supabase Auth.
- Métricas são agregadas e não substituem uma plataforma de marketing/atribuição; adicionar Pixel ou GA depende de decisão de negócio e consentimento.
- O DNS permanece administrado no Registro.br; os registros raiz e `www` apontam para a Vercel. Não trocar nameservers nem remover o hostname anterior antes de validar um rollback.
- A Fase 8 ainda depende de CNPJ ou identificação pública aplicável, endereço e e-mail, condições oficiais restantes de troca, materiais, cuidados e prazos, além de avaliações reais; domínio, cidade de atendimento local, nome do responsável, WhatsApp e opções de entrega já foram confirmados.
- A Fase 11 está funcional sem esses dados, mas a ficha só poderá informar material/capacidade exatos e a galeria/prova social só ficará completa após o fornecimento de especificações, fotos reais e avaliações autorizadas.
- A prévia 3D usa geometria genérica. A área plana já segue o gabarito confirmado de `21 × 8,7 cm`, mas curvatura, corte, cor e posição física ainda são aproximados e não substituem a arte final aprovada.
- O PNG exportado registra o enquadramento em tamanho de gabarito, mas não substitui a foto original: ampliação, compressão de origem e variações de impressão ainda exigem conferência humana.
- No caminho assistido, a caneca 3D mostra somente uma referência automática; ela não deve ser interpretada como o mockup criado pela equipe nem como aprovação para impressão.
- Há atividade residual do GitHub Pages, mas produção oficial é Vercel; não desativar serviço externo sem autorização explícita.
- Mesmo após a redução de aproximadamente 52%, a home ainda carrega o catálogo remoto completo para sustentar busca, menus e orçamento compartilhados. Consultas por rota são o próximo passo de escala, mas exigem redesenhar cache, busca e resolução dos itens persistidos.

## Próxima execução recomendada

1. Fazer uma impressão física de calibração com o PNG de `21 × 8,7 cm`, conferir margem, emenda e orientação no processo real e ajustar somente se o equipamento exigir compensação.
2. Especificar consultas por rota para a home não precisar carregar todos os produtos.
3. Após 30 dias, reconciliar métricas com vendas reais e revisar `docs/decisions/CHECKOUT_DISCOVERY.md`.

## Protocolo de atualização da memória

Após mudança material:

1. atualizar a data;
2. registrar arquitetura e decisão permanente, não detalhes efêmeros;
3. atualizar estado, riscos e próxima execução;
4. nunca adicionar credenciais;
5. versionar a memória junto com a mudança relacionada.
