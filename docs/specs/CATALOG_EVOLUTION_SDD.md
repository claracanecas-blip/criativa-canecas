# Especificação SDD — Evolução da Criativa Canecas

## 1. Controle do documento

| Campo | Valor |
|---|---|
| Projeto | Criativa Canecas |
| Tipo | Especificação orientada por requisitos (Spec-Driven Development) |
| Estado | Em execução; Fases 0–7 e 9–11 concluídas, Fase 8 em andamento |
| Versão | 1.43 |
| Data-base | 30 de agosto de 2026 |
| Produção | https://criativacanecas.com.br |
| Repositório | https://github.com/claracanecas-blip/criativa-canecas |

Este documento é a fonte de verdade para o próximo ciclo do produto. Cada fase deve começar pela revisão dos requisitos relacionados e terminar com evidências de que seus critérios de aceite foram cumpridos.

## 2. Contexto atual

A aplicação é um catálogo Vue 3 com TypeScript, Tailwind CSS, Lucide Icons e Vite. A Vercel publica automaticamente a branch `main`. O Supabase Storage hospeda 2.952 caminhos WebP do conjunto atual e 16 objetos anteriores preservados para rollback no bucket público `product-images`; o Postgres contém 721 produtos publicados com metadados reconciliados.

O catálogo público é lido do Supabase por uma camada de repositório tipada e possui fallback operacional para os arquivos TypeScript. A manutenção cotidiana é feita pelo painel administrativo protegido por Supabase Auth e RLS. O fluxo comercial termina no WhatsApp e mede a jornada por agregados diários sem identificador de visitante ou texto livre.

## 3. Objetivos do ciclo

1. Permitir manutenção do catálogo sem editar código.
2. Criar páginas compartilháveis e indexáveis para produtos.
3. Melhorar velocidade, SEO, acessibilidade e rastreabilidade de conversões.
4. Permitir que o cliente monte um orçamento com vários produtos antes de abrir o WhatsApp.
5. Preparar a arquitetura para avaliações, domínio próprio e pagamento futuro.

## 4. Fora de escopo inicial

- Controle contábil, emissão fiscal ou ERP.
- Estoque transacional em tempo real.
- Marketplace com múltiplos vendedores.
- Checkout com cartão ou Pix na primeira entrega.
- Migração imediata para Nuxt ou outro framework sem evidência de necessidade.

Esses itens podem virar especificações próprias depois que o catálogo administrável e a medição de conversão estiverem estáveis.

## 5. Princípios de implementação

- Toda mudança começa por requisito e critério de aceite identificável.
- Migrações de banco devem ser versionadas em `supabase/migrations/`.
- A interface pública nunca recebe a chave `service_role`.
- Leitura pública deve expor apenas registros publicados.
- Alterações devem ser reversíveis e manter um caminho de rollback.
- A experiência principal continua funcionando sem login para o cliente.
- O WhatsApp permanece o canal comercial principal até decisão explícita sobre checkout.
- Mudanças estruturais atualizam `docs/PROJECT_MEMORY.md` no mesmo ciclo.

## 6. Fluxo Spec-Driven Development

Para cada incremento:

1. Selecionar os requisitos e registrar as decisões pendentes.
2. Confirmar modelo de dados, estados da interface e casos de erro.
3. Criar ou atualizar migrações, tipos e contratos.
4. Implementar a menor entrega vertical utilizável.
5. Executar testes automatizados, build e inspeção de segurança.
6. Publicar preview na Vercel e validar os critérios de aceite.
7. Promover para produção somente após aceite.
8. Atualizar esta especificação e a memória do projeto.

## 7. Requisitos funcionais

### CAT — Catálogo no Supabase

- **CAT-001:** produtos devem ser armazenados no banco do Supabase.
- **CAT-002:** coleções devem ser armazenadas no banco e possuir `slug` único.
- **CAT-003:** um produto pode pertencer a uma ou mais coleções.
- **CAT-004:** produtos devem possuir nome, slug, código, preço, descrição, tema, estado de publicação, destaque e ordem.
- **CAT-005:** cada produto pode possuir várias imagens ordenadas e com texto alternativo.
- **CAT-006:** apenas produtos e coleções publicados podem ser lidos anonimamente.
- **CAT-007:** o catálogo atual deve ser importado sem perder associação com imagens ou coleções.
- **CAT-008:** o frontend deve apresentar estado de carregamento, vazio e erro recuperável.
- **CAT-009:** durante a transição deve existir rollback para o catálogo TypeScript anterior.

### ADM — Administração

- **ADM-001:** a rota `/admin` deve exigir autenticação Supabase.
- **ADM-002:** somente usuários com papel `admin` podem criar, editar ou excluir conteúdo.
- **ADM-003:** o administrador deve gerenciar produtos, coleções, preços, publicação, destaque e ordem.
- **ADM-004:** o administrador deve enviar imagens com validação de tipo e tamanho.
- **ADM-005:** imagens enviadas devem gerar variantes otimizadas antes ou durante a publicação.
- **ADM-006:** ações destrutivas devem pedir confirmação e evitar exclusão de imagem ainda referenciada.
- **ADM-007:** alterações devem registrar `created_at`, `updated_at` e, quando viável, o usuário responsável.

### PDP — Página de produto

- **PDP-001:** cada produto publicado deve possuir URL canônica `/produto/:slug`.
- **PDP-002:** a página deve mostrar imagens, nome, código, preço, descrição e coleções relacionadas.
- **PDP-003:** o botão de WhatsApp deve incluir nome, código e URL do produto.
- **PDP-004:** a página deve oferecer produtos relacionados sem duplicar o atual.
- **PDP-005:** produtos inexistentes ou não publicados devem retornar experiência de “não encontrado”.
- **PDP-006:** o link deve gerar uma prévia adequada ao ser compartilhado.

### SEO — Descoberta e compartilhamento

- **SEO-001:** páginas públicas devem ter título, descrição e URL canônica específicos.
- **SEO-002:** devem existir `robots.txt` e sitemap com coleções e produtos publicados.
- **SEO-003:** produtos devem expor JSON-LD do tipo `Product` e breadcrumbs estruturados.
- **SEO-004:** páginas compartilháveis devem ter Open Graph com título, imagem e descrição.
- **SEO-005:** conteúdo crítico deve ser rastreável por mecanismos de busca; prerenderização deve ser avaliada antes de considerar migração para SSR/Nuxt.
- **SEO-006:** slugs antigos não podem quebrar silenciosamente; devem redirecionar ou mostrar estado controlado.

### IMG — Imagens e desempenho

- **IMG-001:** imagens versionadas devem usar cache público prolongado.
- **IMG-002:** cards não devem baixar a imagem de 1000 px quando uma variante menor for suficiente.
- **IMG-003:** devem existir variantes adequadas para card, detalhe e compartilhamento.
- **IMG-004:** formatos modernos devem ser usados com fallback quando necessário.
- **IMG-005:** dimensões devem ser declaradas para evitar deslocamento de layout.
- **IMG-006:** falhas de imagem devem exibir placeholder profissional e manter o conteúdo utilizável.

### ANA — Analytics e consentimento

- **ANA-001:** medir visualização de produto, busca, seleção de coleção e clique no WhatsApp.
- **ANA-002:** eventos não podem conter texto livre, telefone, nome ou outro dado pessoal do cliente.
- **ANA-003:** integrações opcionais de marketing devem respeitar consentimento e a LGPD.
- **ANA-004:** o ambiente de desenvolvimento não deve contaminar métricas de produção.
- **ANA-005:** deve existir documentação do significado e dos campos de cada evento.

### ORC — Carrinho de orçamento

- **ORC-001:** o visitante deve adicionar e remover produtos sem criar conta.
- **ORC-002:** a seleção deve sobreviver à navegação e a uma atualização da página.
- **ORC-003:** o WhatsApp deve receber uma mensagem legível com itens, quantidades e links.
- **ORC-004:** a interface deve mostrar quantidade total e permitir limpar a seleção.
- **ORC-005:** preço exibido deve ser tratado como estimativa até confirmação no atendimento.
- **ORC-006:** o carrinho não deve prometer reserva de estoque ou confirmação de pedido.

### SOC — Confiança e conteúdo comercial

- **SOC-001:** avaliações só podem ser publicadas após moderação.
- **SOC-002:** fotos de clientes exigem consentimento registrado fora ou dentro do fluxo administrativo.
- **SOC-003:** informações de produção, entrega, materiais e cuidados devem ser acessíveis.
- **SOC-004:** contatos e identidade visual devem ser consistentes em todas as páginas.

### ESC — Escala e descoberta

- **ESC-001:** catálogo público, painel administrativo e geração de SEO não podem truncar silenciosamente ao ultrapassar 1.000 produtos, relações ou imagens.
- **ESC-002:** consultas públicas devem transferir somente os campos necessários e carregar o fallback local apenas quando ele for usado.
- **ESC-003:** busca deve ignorar diferenças de acentuação, aceitar SKU/slug e paginar conjuntos extensos.
- **ESC-004:** a home deve respeitar destaques administrativos e evitar concentrar toda a vitrine em uma única coleção.
- **ESC-005:** a navegação mobile deve caber na viewport, ser acionável por teclado e expor corretamente o estado aberto/fechado.
- **ESC-006:** campanhas sazonais não podem permanecer como destaque fixo fora do período ativo.

## 8. Requisitos não funcionais

- **NFR-001 — Segurança:** nenhuma credencial administrativa pode chegar ao bundle, Git ou logs públicos.
- **NFR-002 — Autorização:** RLS deve negar escrita por padrão e liberar somente administradores.
- **NFR-003 — Desempenho:** meta inicial de Lighthouse móvel ≥ 90 em Performance, Accessibility, Best Practices e SEO nas páginas principais, aferida em condições reproduzíveis.
- **NFR-004 — Acessibilidade:** navegação por teclado, foco visível, rótulos acessíveis, contraste e textos alternativos devem atender WCAG 2.2 AA nos fluxos principais.
- **NFR-005 — Qualidade:** `npm run typecheck` e `npm run build` devem passar em todo pull request.
- **NFR-006 — Confiabilidade:** falha temporária do Supabase deve produzir mensagem recuperável, não tela branca.
- **NFR-007 — Observabilidade:** erros de produção devem ter contexto técnico sem dados pessoais.
- **NFR-008 — Compatibilidade:** suportar versões atuais de Chrome, Edge, Firefox e Safari, incluindo celular.
- **NFR-009 — Backup:** antes da migração, o catálogo TypeScript e um export do banco devem permitir restauração.
- **NFR-010 — Custo:** funcionalidades devem respeitar os limites atuais até que a necessidade de plano pago seja aprovada.

## 9. Modelo de dados proposto

### `collections`

`id`, `slug`, `name`, `description`, `icon_name`, `image_path`, `display_order`, `is_published`, `is_listed`, `seo_title`, `seo_description`, `created_at`, `updated_at`.

`is_published` controla acesso por URL; `is_listed` controla presença em menus e vitrines. Essa separação preserva links legados sem recolocá-los na navegação principal.

### `products`

`id`, `slug`, `sku`, `name`, `theme`, `description`, `price`, `status`, `is_featured`, `display_order`, `seo_title`, `seo_description`, `created_at`, `updated_at`.

O campo `status` deve ser enum ou restrição equivalente com, no mínimo: `draft`, `published` e `archived`.

### `product_collections`

`product_id`, `collection_id`, `display_order`. A chave primária deve impedir relações duplicadas.

### `product_images`

`id`, `product_id`, `storage_path`, `variant`, `alt_text`, `width`, `height`, `display_order`, `created_at`.

### `admin_users`

`user_id`, `role`, `created_at`, ligado a `auth.users`. Inicialmente apenas o papel `admin` é necessário.

### Extensões do ciclo

`analytics_daily_events` armazena somente agregados diários permitidos; `testimonials` controla moderação e consentimento; `site_content_sections` mantém cartões institucionais e FAQ com estados de publicação. `site_settings`, `banners` e `redirects` continuam adiados até haver requisito específico.

## 10. Segurança e políticas RLS

1. Anônimos podem selecionar somente registros publicados.
2. Usuários autenticados sem papel administrativo continuam sem permissão de escrita.
3. Administradores podem manter catálogo e imagens conforme políticas explícitas.
4. O bucket público permite leitura; upload, alteração e exclusão exigem administrador.
5. A chave pública do Supabase pode estar no frontend; `service_role` fica apenas em ambiente seguro.
6. Migrações devem incluir testes de permissão positiva e negativa.

## 11. Critérios de aceite transversais

Uma fase só está concluída quando:

- seus requisitos possuem evidência de teste;
- TypeScript e build passam sem erro;
- não há segredo ou arquivo pessoal no diff;
- rotas novas funcionam ao serem abertas diretamente na Vercel;
- interface foi conferida em desktop e celular;
- estados de carregamento, vazio e falha foram exercitados;
- rollback foi documentado ou testado proporcionalmente ao risco;
- memória e status deste documento foram atualizados.

## 12. Plano de execução

### Fase 0 — Baseline e proteção

**Estado:** concluída em 13 de agosto de 2026.

**Objetivo:** criar uma referência mensurável antes de alterar dados.

**Entregas:** inventário do catálogo, export de segurança, medição Lighthouse, mapa de rotas, testes básicos e registro dos cabeçalhos atuais.

**Aceite:** contagens reconciliadas, backup restaurável e baseline anexado ao projeto.

**Evidências:** [`docs/baselines/2026-08-13/BASELINE.md`](../baselines/2026-08-13/BASELINE.md), [`LIGHTHOUSE.md`](../baselines/2026-08-13/LIGHTHOUSE.md), backup JSON com SHA-256 e quatro testes automatizados de integridade.

**Estimativa:** 0,5 a 1 dia.

### Fase 1 — Cache e variantes de imagem

**Estado:** concluída em produção em 13 de agosto de 2026.

**Objetivo:** reduzir tráfego e acelerar carregamento móvel.

**Entregas:** correção de `Cache-Control`, geração de variantes, `srcset`, placeholder de falha e atualização dos scripts de upload/verificação.

**Aceite:** resposta pública com cache prolongado, variante correta selecionada em celular e nenhuma imagem ausente.

**Rollback:** manter URLs WebP atuais até a validação das novas variantes.

**Evidências:** [`docs/baselines/2026-08-13-phase-1-local/PHASE_1.md`](../baselines/2026-08-13-phase-1-local/PHASE_1.md), [`docs/baselines/2026-08-13-phase-1-production/LIGHTHOUSE.md`](../baselines/2026-08-13-phase-1-production/LIGHTHOUSE.md), suíte reproduzível de sete testes, validação local das 1.074 variantes e verificação pública dos 1.432 objetos.

**Estimativa:** 1 a 2 dias.

### Fase 2 — Banco do catálogo e importação

**Estado:** concluída no Supabase em 13 de agosto de 2026.

**Objetivo:** transferir metadados do catálogo para o Supabase.

**Entregas:** migrações, RLS, tipos gerados, importador idempotente e relatório de reconciliação.

**Aceite:** catálogo importado sem perda, leitura anônima limitada a publicados e escrita anônima negada.

**Rollback:** feature flag ou adaptador para retornar aos dados TypeScript.

**Evidências:** [`docs/baselines/2026-08-13-phase-2/PHASE_2.md`](../baselines/2026-08-13-phase-2/PHASE_2.md), relatórios JSON de reconciliação/RLS, três migrations remotas reconciliadas, tipos gerados e 11 testes locais.

**Estimativa:** 2 a 4 dias.

### Fase 3 — Frontend consumindo Supabase

**Estado:** concluída e validada em 13 de agosto de 2026.

**Objetivo:** fazer listagem, coleção e busca consumirem o novo catálogo.

**Entregas:** camada de repositório, cache de consulta, estados de carregamento/erro e paginação.

**Aceite:** paridade com o catálogo atual, links preservados e falha simulada sem tela branca.

**Rollback:** definir `VITE_CATALOG_SOURCE=typescript` na Vercel e criar novo deploy; o adaptador local permanece versionado.

**Evidências:** [`docs/baselines/2026-08-13-phase-3/PHASE_3.md`](../baselines/2026-08-13-phase-3/PHASE_3.md), suíte de 14 testes, validação navegada das rotas de listagem/coleção/busca/link legado e Lighthouse local P99/P98 com Supabase.

**Estimativa:** 2 a 3 dias.

### Fase 4 — Painel administrativo

**Estado:** concluída e validada em 13 de agosto de 2026.

**Objetivo:** permitir manutenção cotidiana pelo navegador.

**Entregas:** login, proteção de rota, CRUD de produtos/coleções, upload, ordenação e publicação.

**Aceite:** administrador completa o ciclo criar → revisar → publicar → visualizar; usuário não autorizado não escreve.

**Rollback:** reverter o frontend para o commit anterior e aplicar, em ordem, `20260813205500_catalog_actor_privacy.sql` e `20260813204000_catalog_admin_audit.sql` da pasta `supabase/rollback/`. O catálogo público permanece disponível durante o rollback.

**Evidências:** [`docs/baselines/2026-08-13-phase-4/PHASE_4.md`](../baselines/2026-08-13-phase-4/PHASE_4.md), relatório RLS remoto e teste Playwright do ciclo login → criar coleção → criar/publicar produto com quatro variantes → visualizar → excluir → logout.

**Estimativa:** 4 a 7 dias.

### Fase 5 — Página de produto e SEO técnico

**Estado:** concluída e validada em 13 de agosto de 2026.

**Objetivo:** tornar cada item encontrável e compartilhável.

**Entregas:** `/produto/:slug`, metadados, Open Graph, JSON-LD, sitemap, robots e breadcrumbs.

**Aceite:** URL direta retorna `200`, prévia de compartilhamento correta, sitemap contém somente publicados e validadores não apontam erros críticos.

**Rollback:** reverter o frontend para o commit anterior; não há mudança de banco. A rota SPA anterior e o catálogo por coleção permanecem disponíveis.

**Evidências:** [`docs/baselines/2026-08-13-phase-5/PHASE_5.md`](../baselines/2026-08-13-phase-5/PHASE_5.md), HTML de preview validado via Vercel com `200`, canonical/OG/JSON-LD/conteúdo estático, sitemap de 360 URLs, testes automatizados e Lighthouse SEO 100 nas três páginas medidas.

**Estimativa:** 3 a 5 dias.

### Fase 6 — Analytics, acessibilidade e qualidade

**Estado:** concluída e validada em 13 de agosto de 2026.

**Objetivo:** medir resultados e prevenir regressões.

**Entregas:** eventos, consentimento quando aplicável, Playwright para fluxos críticos, auditoria axe/Lighthouse e monitoramento de erro.

**Aceite:** eventos aparecem apenas em produção, não contêm PII e os fluxos principais passam no CI.

**Rollback:** reverter frontend/CI e aplicar `supabase/rollback/20260813211500_catalog_analytics.sql`; catálogo e administração não são alterados.

**Evidências:** [`docs/baselines/2026-08-13-phase-6/PHASE_6.md`](../baselines/2026-08-13-phase-6/PHASE_6.md), oito verificações remotas de RLS, 55 cenários Playwright/axe em Chrome, Edge, Firefox, WebKit desktop e Safari móvel, além de Lighthouse P90+ nas três páginas.

**Estimativa:** 2 a 4 dias.

### Fase 7 — Carrinho de orçamento

**Estado:** concluída e validada em 13 de agosto de 2026.

**Objetivo:** permitir seleção de vários produtos antes do atendimento.

**Entregas:** estado persistente local, drawer/página de orçamento, quantidades e mensagem consolidada para WhatsApp.

**Aceite:** seleção sobrevive ao refresh, mensagem corresponde à lista e funciona em desktop/celular.

**Rollback:** reverter os componentes/serviços da fase; nenhum dado remoto ou migration é afetado.

**Evidências:** [`docs/baselines/2026-08-13-phase-7/PHASE_7.md`](../baselines/2026-08-13-phase-7/PHASE_7.md), 24 testes unitários, 8 cenários Playwright/axe, inspeção desktop/celular e Lighthouse P90+.

**Estimativa:** 2 a 4 dias.

### Fase 8 — Confiança, domínio e conteúdo comercial

**Estado:** em andamento; base técnica concluída em 13 de agosto e domínio próprio ativado em 14 de agosto de 2026, aguardando dados comerciais e avaliações reais.

**Objetivo:** aumentar credibilidade e conversão.

**Entregas:** avaliações moderadas, FAQ, materiais/cuidados, políticas, domínio próprio e redirecionamento canônico.

**Aceite:** domínio HTTPS ativo, apenas um domínio canônico indexável e conteúdo administrativo publicável.

**Parcial entregue:** página de informações/FAQ com seções publicáveis em `/admin/informacoes`, fallback seguro e HTML rastreável; depoimentos moderados com RLS, administração e consentimento obrigatório para fotos; origem oficial `https://criativacanecas.com.br` ativa com HTTPS, canonical único e redirecionamentos permanentes de `www` e do hostname anterior; responsável público e WhatsApp oficial confirmados e exibidos no rodapé; política de entrega centralizada com preço da caneca sem frete, entrega/retirada em Araranguá e envio pelos Correios calculado por CEP. Metadados de consentimento/autoria são privados e acessíveis integralmente somente por RPC administrativa. Nenhum CNPJ, depoimento fictício ou condição comercial não confirmada foi publicado.

**Evidências:** [`docs/baselines/2026-08-13-phase-8/PHASE_8_TECHNICAL.md`](../baselines/2026-08-13-phase-8/PHASE_8_TECHNICAL.md), [`docs/baselines/2026-08-14-phase-8-domain/DOMAIN_ACTIVATION.md`](../baselines/2026-08-14-phase-8-domain/DOMAIN_ACTIVATION.md), [`docs/baselines/2026-08-27-delivery-clarity/DELIVERY_CLARITY.md`](../baselines/2026-08-27-delivery-clarity/DELIVERY_CLARITY.md), [`docs/runbooks/CUSTOM_DOMAIN.md`](../runbooks/CUSTOM_DOMAIN.md), 18 verificações RLS remotas, seis verificações administrativas navegadas, domínio de produção validado, 66 testes atuais e matriz de 115 cenários Playwright/Axe nos cinco perfis pelo CI do PR `#2`; preview Vercel `Ready` e smoke autenticado concluído.

**Estimativa:** 2 a 4 dias, excluindo prazos de DNS e produção de conteúdo.

### Fase 9 — Descoberta sobre pagamento online

**Estado:** concluída em 13 de agosto de 2026 com decisão de adiar checkout e medir o funil.

**Objetivo:** decidir com dados se um checkout próprio compensa.

**Entregas:** análise de volume, abandono, taxas, logística, LGPD, antifraude e fornecedores.

**Aceite:** decisão registrada com custo total, riscos e métricas que justificam implementar ou adiar.

**Decisão:** manter orçamento + WhatsApp e reavaliar após 30 dias de dados, operação comercial definida e sinais de volume/perda. Nenhuma contratação ou integração foi feita.

**Evidência:** [`docs/decisions/CHECKOUT_DISCOVERY.md`](../decisions/CHECKOUT_DISCOVERY.md).

**Estimativa:** 1 a 2 dias para descoberta; implementação é uma especificação separada.

### Fase 10 — Escala e descoberta do catálogo

**Estado:** concluída e validada em produção em 26 de agosto de 2026.

**Objetivo:** sustentar o crescimento acima de 1.000 produtos e facilitar a descoberta do catálogo, especialmente no celular.

**Entregas locais:** paginação integral nas consultas públicas, administrativas e de SEO; payload público reduzido; fallback sob demanda; busca tolerante a acentos/SKU com paginação; vitrine diversificada; cabeçalho e menu mobile acessíveis; remoção do destaque sazonal vencido; hierarquia `h1` nas páginas principais.

**Aceite:** simulação acima de 1.000 linhas sem perda; busca `sao paulo` equivalente a `São Paulo`; SKU encontrável; no máximo 20 cards por página de busca; menu mobile sem overflow e operável por teclado; home sem campanha vencida; typecheck, testes, build, E2E/axe, preview e smoke de produção aprovados.

**Rollback:** reverter somente os arquivos de aplicação, testes e documentação do incremento. Não há migration nem alteração de dados remotos.

**Evidência:** [`docs/baselines/2026-08-26-scale-discovery/PHASE_10_LOCAL.md`](../baselines/2026-08-26-scale-discovery/PHASE_10_LOCAL.md), PR `#1`, CI da `main` e smoke navegável no domínio oficial.

### Fase 11 — Experiência de escolha e personalização

**Estado:** concluída e validada em produção; simplificação comercial do atendimento assistido publicada em 30 de agosto de 2026 pelo PR `#8`.

**Objetivo:** permitir inspeção detalhada do mockup, reduzir dúvidas sobre produto e facilitar a descoberta e a personalização antes do WhatsApp.

**Entregas:** zoom acessível de 2,4× recortado na própria caixa e galeria preparada para múltiplas imagens; bloco seguro de detalhes/cuidados; depoimentos moderados no contexto do produto; filtros por tema e ordenação, com controles de preço condicionados à existência de valores diferentes na coleção; `/personalizada` com um único fluxo assistido para informar frase/orientações e escolha obrigatória entre enviar arte pronta ou solicitar criação/adaptação; mensagem, valor, CTA, passos e instrução de anexo específicos para a escolha; resumo comercial que explica recebimento, criação do mockup quando aplicável e aprovação antes da produção; seleção e compartilhamento nativo do arquivo somente em celulares cuja Web Share API aceita arquivos; no computador, nenhuma caixa de imagem é exibida e o link de WhatsApp direciona ao número oficial para que a foto seja escolhida uma única vez, dentro da conversa; celulares incompatíveis usam o mesmo fallback, pois `wa.me` não transporta arquivos; arquivo mantido somente no navegador até a ação do cliente; CTAs dos modelos prontos distinguidos do fluxo de personalização, com modelo, SKU e URL preservados na mensagem; `/personalizada` limitada a uma única `Caneca personalizada`, com estampa inclusa e sem oferta separada “com foto”; comparação direta entre `R$ 39,90` com arte pronta para impressão e `R$ 44,90` com criação ou adaptação pela equipe, sem apresentar taxa separada. O protótipo 3D/editor/exportação foi retirado por decisão do proprietário.

**Aceite:** fluxo assistido sem editor, simulação ou download de prévia; nenhuma ação de WhatsApp aparece até a escolha do serviço; arte pronta gera mensagem somente com `R$ 39,90` e declara que não requer criação/adaptação; criação/adaptação gera mensagem somente com `R$ 44,90` e solicita composição e mockup para aprovação; em celular compatível, seleção valida JPEG/PNG/WebP de até 10 MB e o compartilhamento nativo inclui o original e um resumo de modelo, arquivo, frase, detalhes, opção, valor e cidade/CEP; no computador, não existe input de arquivo e o CTA usa `wa.me/5548991992341`, abre a conversa oficial com o resumo e instrui a seleção única do arquivo dentro do WhatsApp; somente uma ação principal de envio é exibida por vez; troca/remoção da imagem no celular funciona sem persistência ou upload; filtros não alteram o catálogo de origem, tratam zero resultados e não mostram preço enquanto todos os itens tiverem o mesmo valor; modelos prontos usam linguagem de pedido sem sugerir personalização; `/personalizada` mostra uma única oferta e compara claramente o nível com arte pronta ao nível com criação/adaptação, sem linguagem de taxa; nenhum material, capacidade, foto ou avaliação não confirmada é publicado; typecheck, testes, build, E2E/axe, preview e inspeção desktop/celular aprovados.

**Dependências externas:** fotos adicionais reais, dados técnicos por modelo e avaliações autorizadas são conteúdo comercial, não bloqueiam a infraestrutura e permanecem ocultos/condicionados enquanto ausentes.

**Rollback:** reverter somente componentes, utilitários, views, testes e documentação da fase. Não há migration nem alteração remota.

**Evidência:** [`docs/baselines/2026-08-27-customer-experience/CUSTOMER_EXPERIENCE.md`](../baselines/2026-08-27-customer-experience/CUSTOMER_EXPERIENCE.md), [`docs/baselines/2026-08-29-assisted-personalization/PERSONALIZATION_HANDOFF.md`](../baselines/2026-08-29-assisted-personalization/PERSONALIZATION_HANDOFF.md), histórico do protótipo em [`docs/baselines/2026-08-29-personalization-3d/PERSONALIZATION_3D.md`](../baselines/2026-08-29-personalization-3d/PERSONALIZATION_3D.md), PRs `#3`, `#4` e `#8`, previews Vercel `Ready`, Lighthouse com todas as categorias em pelo menos 90 e smoke do zoom de produto em produção por cursor e toque.

## 13. Ordem, dependências e marcos

```text
Fase 0 → Fase 1
      └→ Fase 2 → Fase 3 → Fase 4
                         └→ Fase 5 → Fase 6 → Fase 7 → Fase 8
                                                        └→ Fase 9
                                                        └→ Fase 10
                                                                └→ Fase 11
```

- **Marco A — Base rápida:** fases 0 e 1.
- **Marco B — Catálogo administrável:** fases 2, 3 e 4.
- **Marco C — Aquisição mensurável:** fases 5 e 6.
- **Marco D — Conversão comercial:** fases 7 e 8.
- **Marco E — Decisão de checkout:** fase 9.
- **Marco F — Escala e descoberta:** fase 10.
- **Marco G — Experiência assistida:** fase 11.

## 14. Estratégia de testes

- **Unidade:** transformação de URLs, preços, filtros, mensagens e validações.
- **Integração:** consultas Supabase e políticas RLS com perfis anônimo/admin.
- **Contrato:** tipos gerados compatíveis com migrations.
- **E2E:** navegar coleção, buscar, abrir produto, selecionar itens e abrir WhatsApp.
- **Acessibilidade:** axe nas páginas principais e navegação manual por teclado.
- **Desempenho:** Lighthouse em home, coleção e produto.
- **Segurança:** busca de segredos no diff e testes negativos de escrita.
- **Auditoria de conclusão:** [`docs/audits/2026-08-13-SDD_COMPLETION_AUDIT.md`](../audits/2026-08-13-SDD_COMPLETION_AUDIT.md) mapeia os 59 requisitos às evidências e separa conclusão técnica de dependências externas.

## 15. Definição de pronto

Um item pode entrar em implementação quando possui requisito, dependências, estados de erro, critérios de aceite e decisão de dados/segurança definidos.

Um item está concluído quando código, migrations, testes, documentação, preview, aceite e produção foram completados e a memória foi atualizada.

## 16. Decisões pendentes

As respostas oficiais podem ser enviadas usando [`docs/templates/PHASE_8_BUSINESS_INPUT.md`](../templates/PHASE_8_BUSINESS_INPUT.md), sem incluir credenciais ou dados que não devam ser públicos.

- Domínio próprio desejado e responsável pelo DNS.
- Ativação final do convite pela conta administrativa proprietária, se ainda pendente.
- Necessidade comercial futura de Meta Pixel e respectivo fluxo de consentimento.
- Conteúdo oficial restante de troca, materiais, cuidados e prazos.
- Avaliações reais e referências de autorização para nomes/fotos.
- CNPJ, e-mail e cidade/endereço público da operação.

## 17. Registro de progresso

| Fase | Estado | Evidência |
|---|---|---|
| 0 — Baseline | Concluída | `docs/baselines/2026-08-13/` e testes de integridade |
| 1 — Imagens | Concluída | Produção P99/P98, CLS 0 e 1.432 objetos verificados |
| 2 — Banco | Concluída | Importação inicial de 341 produtos; catálogo atual com 721 e RLS positiva/negativa verificada |
| 3 — Integração frontend | Concluída | Catálogo remoto, fallback, 14 testes e validação navegada |
| 4 — Administração | Concluída | RLS remota e ciclo administrativo E2E completo |
| 5 — Produto e SEO | Concluída | 721 páginas de produto, canonical único por HTML, sitemap de 741 URLs, preview e Lighthouse |
| 6 — Medição e qualidade | Concluída | Eventos sem PII, RLS, 90 cenários em cinco perfis, Lighthouse e actions no runtime Node 24 |
| 7 — Orçamento | Concluída | Persistência local, quantidades, WhatsApp consolidado e E2E desktop/móvel |
| 8 — Confiança e domínio | Em andamento | Domínio próprio, HTTPS, redirects, canonical, Auth e opções de entrega concluídos; dados comerciais oficiais restantes e avaliações reais pendentes |
| 9 — Descoberta de checkout | Concluída | Decisão documentada: adiar, medir 30 dias e reavaliar por critérios |
| 10 — Escala e descoberta | Concluída | Produção validada; 65 testes, 100 cenários E2E/axe, Lighthouse P90+, redirects, SEO, buscas e menu mobile aprovados |
| 11 — Experiência assistida | Concluída em produção | Galeria e zoom de produto validados; `/personalizada` usa oferta única com arte pronta a R$ 39,90 ou criação/adaptação a R$ 44,90, recebimento da foto/orientações e mockup feito pela equipe |

## 18. Evoluções incrementais após o roadmap

- **30 de agosto de 2026 — refinamento visual e responsivo do catálogo:** coleções ganharam cabeçalho contextual com amostra real, contagem e filtros foram consolidados em uma barra compacta, cards receberam hierarquia visual e rótulos adequados ao espaço móvel e títulos longos de produto passaram a quebrar sem causar overflow. Em coleção e busca com até 700 px, o atalho flutuante redundante do WhatsApp fica oculto para não cobrir a grade; os CTAs de cada produto permanecem visíveis e o atalho continua nas outras rotas. Não houve migration nem mudança de dados ou regra comercial. O aceite local cobriu 73 testes, typecheck, build com 741 URLs, 120/120 cenários Playwright/Axe em Chrome, Firefox, Safari desktop e Safari móvel, inspeção em 1440 × 1000/390 × 844 e Lighthouse P90+ em todas as categorias. O PR `#9` foi mesclado por `f2630dd`; o CI da `main` `33318994130` aprovou novamente 120 cenários principais, 30 no Edge e Lighthouse, a Vercel publicou `dpl_9myA5GtA5zo99KYjkKwyTHAcgpDc` e o smoke no domínio oficial aprovou as três rotas e o comportamento responsivo. Rollback: reverter somente os componentes, views, teste E2E e documentação deste incremento. Evidência em [`docs/baselines/2026-08-30-catalog-mobile-polish/CATALOG_MOBILE_POLISH.md`](../baselines/2026-08-30-catalog-mobile-polish/CATALOG_MOBILE_POLISH.md).

- **30 de agosto de 2026 — checkup comercial e integridade do catálogo:** como os 721 produtos publicados têm preço único de `R$ 39,90`, coleções passaram a omitir filtro e ordenação por preço, mantendo tema, `Destaques` e nome; a interface reativa preço automaticamente quando houver valores distintos. URLs legadas foram preservadas por redirecionamento: `/com-fotos` leva à personalização atual e `/dia-dos-pais` a presentes. A auditoria de 17 coleções, 721 relações e 2.884 imagens eliminou duas ambiguidades de nome: seis artes antigas de Demon Slayer receberam nomes descritivos e `geek-16` virou `Breaking Bad — Walter e Jesse`; IDs, URLs, SKUs, imagens e preços não mudaram. As migrations `20260830090000_clarify_demon_slayer_names.sql` e `20260830100000_clarify_breaking_bad_name.sql` possuem rollbacks espelhados e passaram em lint remoto, leitura pública e bloqueio anônimo de escrita `42501`. O incremento passou em typecheck, 73 testes, build com 741 URLs, 116 cenários E2E/Axe com três timeouts do Firefox aprovados na repetição serial e inspeção visual desktop/celular. O commit `96486d0` foi publicado na `main`; o CI `33301474746` aprovou 116 cenários principais, 29 no Edge e Lighthouse P90+, a Vercel concluiu o deployment de produção e o smoke oficial aprovou filtros, redirects, nomes e status `200`. Rollback: reverter os arquivos de aplicação e executar, em ordem inversa, os dois SQLs correspondentes em `supabase/rollback/`.

- **30 de agosto de 2026 — escolha explícita e navegação comercial simplificada:** `/personalizada` exige que o cliente escolha `Vou enviar a arte pronta` ou `Quero criação ou adaptação` antes de mostrar o formulário e o CTA. Os dois níveis e preços são os próprios cartões de escolha no início da página; o cartão comercial e os quatro passos genéricos repetidos foram removidos. A primeira mensagem informa somente `R$ 39,90`, identifica o arquivo como arte final e dispensa criação; a segunda informa somente `R$ 44,90` e pede criação/adaptação e mockup para aprovação. Campos, resumo, passos, CTA e instrução de anexo acompanham a opção. `Caneca Mágica` e `Canecas com Foto` foram removidas da barra e do mega menu; foto continua como referência possível dentro da personalização, e as rotas antigas permanecem compatíveis. O commit `af15594` passou localmente em typecheck, 70 testes, build de 741 URLs, inspeção desktop/celular e `112/112` cenários E2E/Axe; o CI remoto `33300067856` aprovou também `28/28` no Edge e Lighthouse. Deployment Vercel concluído e smoke do domínio oficial aprovou navegação, mensagens, valores exclusivos, WhatsApp e status `200`.

- **29–30 de agosto de 2026 — personalização assistida sem editor:** por decisão do proprietário, o protótipo híbrido do PR `#8` foi simplificado para um único pedido de criação. O cliente informa frase e orientações; a equipe recebe a foto, prepara o mockup e o envia para aprovação antes da produção. Em celulares compatíveis, `Enviar foto e pedido pelo WhatsApp` leva arquivo e resumo curto ao seletor do sistema. No computador, a caixa de arquivo foi removida para não exigir a mesma foto duas vezes; `Abrir WhatsApp da Criativa` usa o número oficial e a imagem é escolhida somente na conversa. Não há upload, armazenamento, editor, prévia 2D/3D nem PNG de gabarito. Three.js e os módulos exclusivos da simulação foram removidos; o chunk da rota caiu de aproximadamente `147,7 KB gzip` para `4,3 KB gzip`. A oferta foi consolidada em uma única caneca personalizada e compara dois níveis do mesmo serviço: `R$ 39,90` com arte pronta para impressão e `R$ 44,90` com criação ou adaptação pela equipe. Página e WhatsApp evitam linguagem de taxa. O PR `#8` foi mesclado por `a84c342`, e o refinamento final foi publicado por `bb92956`; o CI da `main` aprovou 70 testes, `112/112` cenários nos navegadores principais, `28/28` no Edge e Lighthouse P90+. O deployment Vercel `dpl_AHx3wNsAkz5TrjYaU4yyy9mArg7i` ficou `Ready`, e o smoke do domínio oficial confirmou os dois níveis, ausência de linguagem de taxa, número e mensagem do WhatsApp. Evidência em [`docs/baselines/2026-08-29-assisted-personalization/PERSONALIZATION_HANDOFF.md`](../baselines/2026-08-29-assisted-personalization/PERSONALIZATION_HANDOFF.md).

- **29 de agosto de 2026 — protótipo histórico de fluxo híbrido e prévia 3D:** antes da simplificação registrada acima, `/personalizada` chegou a renderizar uma caneca procedural com Three.js e aplicar imagem/frase por textura de canvas mantida somente no navegador. `Quero ver e ajustar` ampliava automaticamente a foto em até `140%` e oferecia conferência/editor; `Quero que vocês criem` deixava o mockup com a equipe. O gabarito usava `21 × 8,7 cm`, faixas transparentes próximas à alça e exportação `2480 × 1028 px`/`300 dpi`. Esse protótipo foi validado com 79 testes, `112/112` cenários Playwright/Axe e Lighthouse P90+, mas foi removido do PR `#8` por decisão posterior do proprietário. O histórico técnico e o rollback permanecem em [`docs/baselines/2026-08-29-personalization-3d/PERSONALIZATION_3D.md`](../baselines/2026-08-29-personalization-3d/PERSONALIZATION_3D.md).

- **28 de agosto de 2026 — apresentação comercial da home:** a primeira dobra passou a mostrar canecas reais, preço de referência e dois caminhos distintos para modelos prontos e personalização. Categorias com miniaturas aparecem antes dos banners e da entrega detalhada; oito modelos continuam compondo a vitrine; o processo de aprovação e recebimento é explicado em três passos. A identidade rosa ganhou somente curvas, pontilhado e brilhos de baixo contraste, com redução específica no celular. O aceite local cobriu revisão visual em 1440 × 1000 e 390 × 844, 69 testes, typecheck, build com 741 URLs e E2E de hierarquia mais Axe WCAG 2.2 A/AA. Não houve migration, upload nem alteração de dados remotos; rollback consiste em reverter os arquivos da home, aviso e teste relacionado.

- **27–28 de agosto de 2026 — experiência de escolha e personalização:** produto ganhou zoom acessível e suporte a múltiplas imagens, detalhes/cuidados sem inventar especificações e prova social condicionada a depoimentos reais publicados. Coleções e busca ganharam filtros/ordenação; `/personalizada` recebeu prévia 2D local que não armazena nem envia o arquivo e leva o resumo ao WhatsApp. A validação aprovou 69 testes, typecheck, build local com 741 URLs, 104 de 104 cenários Playwright/Axe nos perfis Chrome, Firefox, Safari desktop e Safari móvel, 26 de 26 no Edge e Lighthouse com todas as categorias em pelo menos 90. O PR `#3` publicou a fase; após revisão do proprietário, o PR `#4` substituiu o modal por zoom de 2,4× dentro da própria caixa e o smoke de produção confirmou cursor, toque, teclado e ausência de overflow. Evidência em [`docs/baselines/2026-08-27-customer-experience/CUSTOMER_EXPERIENCE.md`](../baselines/2026-08-27-customer-experience/CUSTOMER_EXPERIENCE.md).

- **27 de agosto de 2026 — clareza de preço e entrega:** política centralizada informa que o valor exibido corresponde à caneca e não inclui frete; a UI diferencia entrega/retirada em Araranguá, com mimo conforme disponibilidade, de envio pelos Correios com cálculo pelo CEP. Home, produto, informações, personalizada, presentes, cards, orçamento e mensagens do WhatsApp foram reconciliados. O PR `#2` cobre 66 testes, typecheck, build com 741 URLs, 115 cenários Playwright/Axe nos cinco perfis e Lighthouse; preview Vercel `Ready` e smoke autenticado concluído. Uma falha transitória de imagem revelou e levou à correção do contraste do placeholder, agora testado de forma determinística. A evidência está em [`docs/baselines/2026-08-27-delivery-clarity/DELIVERY_CLARITY.md`](../baselines/2026-08-27-delivery-clarity/DELIVERY_CLARITY.md).

- **26 de agosto de 2026 — escala e descoberta:** consultas públicas, administrativas e de SEO passaram a percorrer páginas de até 1.000 linhas até o fim do conjunto; a home reduziu os corpos REST observados de aproximadamente 598 KB para 287 KB e isolou o fallback TypeScript em chunk próprio. Busca ganhou normalização de acentos, SKU/slug e paginação; a home passou a misturar coleções; o cabeçalho/menu mobile foi compactado e tornado acessível; Dia dos Pais saiu da navegação fixa. O PR `#1` foi mesclado em `main` por `a71d71c`; Vercel e CI ficaram verdes com 65 testes, 100 cenários E2E/axe e Lighthouse P90+. O smoke no domínio oficial confirmou rotas `200`, redirects `308`, sitemap com 741 URLs, canonical oficial, buscas tolerantes, produto corrigido e menu mobile sem overflow. Evidência em [`docs/baselines/2026-08-26-scale-discovery/PHASE_10_LOCAL.md`](../baselines/2026-08-26-scale-discovery/PHASE_10_LOCAL.md).

- **16 de agosto de 2026 — coleção Aniversário:** 16 artes novas foram selecionadas após deduplicação contra os sete itens existentes; os mockups `aniversario-08` a `aniversario-23`, suas quatro variantes, o fallback TypeScript e os metadados remotos foram publicados pela migration `20260816200000`. O catálogo passou a 357 produtos e 1.496 objetos públicos. Evidência: [`docs/baselines/2026-08-16-anniversary-catalog/ANNIVERSARY_CATALOG.md`](../baselines/2026-08-16-anniversary-catalog/ANNIVERSARY_CATALOG.md).
- **20 de agosto de 2026 — coleção Pets:** 50 mockups selecionados de cães e gatos foram publicados como `pets-01` a `pets-50`, com quatro variantes por produto, fallback TypeScript e migration `20260820115000`. A revisão visual posterior dos 50 itens identificou somente uma faixa sem estampa na caneca frontal de `pets-19`; a imagem foi corrigida e publicada em quatro caminhos `pets-19-r2.webp` pela migration `20260820193000`, mantendo os objetos anteriores para rollback. O catálogo permanece com 407 produtos e 1.696 caminhos de imagem ativos. Evidência: [`docs/baselines/2026-08-20-pets-catalog/PETS_CATALOG.md`](../baselines/2026-08-20-pets-catalog/PETS_CATALOG.md).
- **20 de agosto de 2026 — coleção Futebol & Esportes:** 78 artes foram triadas por popularidade, qualidade e duplicidade; 50 mockups de 20 clubes foram publicados como `futebol-01` a `futebol-50`, com quatro variantes por produto, fallback TypeScript e migration `20260820210000`. O catálogo passou a 457 produtos e 1.896 caminhos WebP no conjunto atual; a auditoria visual confirmou 50 arquivos únicos, 1254 × 1254 e sem faixas inferiores sem estampa. Evidência: [`docs/baselines/2026-08-20-football-catalog/FOOTBALL_CATALOG.md`](../baselines/2026-08-20-football-catalog/FOOTBALL_CATALOG.md).
- **20 de agosto de 2026 — coleção Profissões:** 1.770 imagens raster foram inventariadas e 50 estampas JPG/PNG de profissões distintas foram selecionadas, excluindo pastas de mockups. Cada produto possui estampa de produção comprovada no manifesto, mockup revisado e quatro variantes WebP; a migration `20260820220000` levou o catálogo a 507 produtos e 2.096 caminhos WebP no conjunto atual. Evidência: [`docs/baselines/2026-08-20-professions-catalog/PROFESSIONS_CATALOG.md`](../baselines/2026-08-20-professions-catalog/PROFESSIONS_CATALOG.md).
- **20 de agosto de 2026 — coleção Religião:** 210 imagens raster foram inventariadas e 50 estampas únicas foram convertidas em mockups revisados, cada uma com quatro variantes WebP. A migration `20260820230000` levou o catálogo a 557 produtos e 2.296 caminhos WebP no conjunto atual. A origem é predominantemente cristã: 49 itens são de raiz cristã e um é islâmico; ampliar o alcance geral depende de novas estampas autênticas de outras tradições. Evidência: [`docs/baselines/2026-08-20-religion-catalog/RELIGION_CATALOG.md`](../baselines/2026-08-20-religion-catalog/RELIGION_CATALOG.md).
- **26 de agosto de 2026 — substituição de `religiao-01`:** a arte `Fé Islâmica` foi substituída, por decisão do proprietário, por `Porque Ele Vive`, selecionada do acervo original. O ID/SKU e a URL foram preservados; metadados e quatro caminhos de imagem passaram a usar a versão `religiao-01-r2`. A migration `20260826150000` passou em lint e RLS positiva/negativa; os objetos anteriores permanecem disponíveis para rollback. Evidência: [`docs/baselines/2026-08-26-religion-01-replacement/RELIGION_01_REPLACEMENT.md`](../baselines/2026-08-26-religion-01-replacement/RELIGION_01_REPLACEMENT.md).
- **20 de agosto de 2026 — coleção Divertidas:** 46 estampas únicas foram triadas e 36 mockups aprovados foram publicados com quatro variantes WebP por produto. Uma imagem sem estampa plana, uma paródia de medicamento e oito artes bloqueadas pelo gerador ficaram de fora. A migration `20260820233000` levou o catálogo a 593 produtos e 2.440 caminhos WebP no conjunto atual; texto, preenchimento e unicidade foram revisados. Evidência: [`docs/baselines/2026-08-20-funny-catalog/FUNNY_CATALOG.md`](../baselines/2026-08-20-funny-catalog/FUNNY_CATALOG.md).
- **21 de agosto de 2026 — coleção Animes:** 2.301 imagens raster foram inventariadas e 100 mockups foram gerados. A revisão corretiva identificou `animes-027` como Nanatsu no Taizai e `animes-083` como repetição visual de `animes-026`; a migration `20260821200000` retirou os dois do catálogo e classificou `animes-017` a `animes-020` como Cavaleiros do Zodíaco Dourados. Permanecem 98 produtos novos, 141 na coleção, 691 no catálogo e 2.832 caminhos WebP ativos. Os oito objetos retirados permanecem preservados para rollback. Evidência: [`docs/baselines/2026-08-21-anime-catalog/ANIME_CATALOG.md`](../baselines/2026-08-21-anime-catalog/ANIME_CATALOG.md).
- **21 de agosto de 2026 — coleção Amizade:** a pasta adicional `71 - DIA DOS AMIGOS` forneceu 50 artes com hashes distintos das fontes usadas anteriormente. Trinta estampas genéricas foram selecionadas, excluindo uma arte de personagem conhecido; os mockups `amizade-43` a `amizade-72` foram revisados, possuem hashes únicos e receberam quatro variantes WebP cada. A migration `20260821210000` levou o catálogo a 721 produtos e 2.952 caminhos WebP ativos. Evidência: [`docs/baselines/2026-08-21-friendship-catalog/FRIENDSHIP_CATALOG.md`](../baselines/2026-08-21-friendship-catalog/FRIENDSHIP_CATALOG.md).
