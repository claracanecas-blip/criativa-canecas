# Especificação SDD — Evolução da Criativa Canecas

## 1. Controle do documento

| Campo | Valor |
|---|---|
| Projeto | Criativa Canecas |
| Tipo | Especificação orientada por requisitos (Spec-Driven Development) |
| Estado | Em execução; Fases 0–7 e 9 concluídas, domínio da Fase 8 ativo e dados comerciais externos pendentes |
| Versão | 1.21 |
| Data-base | 20 de agosto de 2026 |
| Produção | https://criativacanecas.com.br |
| Repositório | https://github.com/claracanecas-blip/criativa-canecas |

Este documento é a fonte de verdade para o próximo ciclo do produto. Cada fase deve começar pela revisão dos requisitos relacionados e terminar com evidências de que seus critérios de aceite foram cumpridos.

## 2. Contexto atual

A aplicação é um catálogo Vue 3 com TypeScript, Tailwind CSS, Lucide Icons e Vite. A Vercel publica automaticamente a branch `main`. O Supabase Storage hospeda 2.096 caminhos WebP do conjunto atual e quatro objetos anteriores preservados para rollback no bucket público `product-images`; o Postgres contém 507 produtos publicados com metadados reconciliados.

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

**Parcial entregue:** página de informações/FAQ com seções publicáveis em `/admin/informacoes`, fallback seguro e HTML rastreável; depoimentos moderados com RLS, administração e consentimento obrigatório para fotos; origem oficial `https://criativacanecas.com.br` ativa com HTTPS, canonical único e redirecionamentos permanentes de `www` e do hostname anterior; responsável público e WhatsApp oficial confirmados e exibidos no rodapé. Metadados de consentimento/autoria são privados e acessíveis integralmente somente por RPC administrativa. Nenhum CNPJ, depoimento fictício ou condição comercial não confirmada foi publicado.

**Evidências:** [`docs/baselines/2026-08-13-phase-8/PHASE_8_TECHNICAL.md`](../baselines/2026-08-13-phase-8/PHASE_8_TECHNICAL.md), [`docs/baselines/2026-08-14-phase-8-domain/DOMAIN_ACTIVATION.md`](../baselines/2026-08-14-phase-8-domain/DOMAIN_ACTIVATION.md), [`docs/runbooks/CUSTOM_DOMAIN.md`](../runbooks/CUSTOM_DOMAIN.md), 18 verificações RLS remotas, seis verificações administrativas navegadas, domínio de produção validado, 47 testes atuais e 75 cenários Playwright/axe entre os cinco perfis de navegador.

**Estimativa:** 2 a 4 dias, excluindo prazos de DNS e produção de conteúdo.

### Fase 9 — Descoberta sobre pagamento online

**Estado:** concluída em 13 de agosto de 2026 com decisão de adiar checkout e medir o funil.

**Objetivo:** decidir com dados se um checkout próprio compensa.

**Entregas:** análise de volume, abandono, taxas, logística, LGPD, antifraude e fornecedores.

**Aceite:** decisão registrada com custo total, riscos e métricas que justificam implementar ou adiar.

**Decisão:** manter orçamento + WhatsApp e reavaliar após 30 dias de dados, operação comercial definida e sinais de volume/perda. Nenhuma contratação ou integração foi feita.

**Evidência:** [`docs/decisions/CHECKOUT_DISCOVERY.md`](../decisions/CHECKOUT_DISCOVERY.md).

**Estimativa:** 1 a 2 dias para descoberta; implementação é uma especificação separada.

## 13. Ordem, dependências e marcos

```text
Fase 0 → Fase 1
      └→ Fase 2 → Fase 3 → Fase 4
                         └→ Fase 5 → Fase 6 → Fase 7 → Fase 8
                                                        └→ Fase 9
```

- **Marco A — Base rápida:** fases 0 e 1.
- **Marco B — Catálogo administrável:** fases 2, 3 e 4.
- **Marco C — Aquisição mensurável:** fases 5 e 6.
- **Marco D — Conversão comercial:** fases 7 e 8.
- **Marco E — Decisão de checkout:** fase 9.

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
- Conteúdo oficial de entrega, troca, materiais e cuidados.
- Avaliações reais e referências de autorização para nomes/fotos.
- CNPJ, e-mail e cidade/endereço público da operação.

## 17. Registro de progresso

| Fase | Estado | Evidência |
|---|---|---|
| 0 — Baseline | Concluída | `docs/baselines/2026-08-13/` e testes de integridade |
| 1 — Imagens | Concluída | Produção P99/P98, CLS 0 e 1.432 objetos verificados |
| 2 — Banco | Concluída | Importação inicial de 341 produtos; catálogo atual com 507 e RLS positiva/negativa verificada |
| 3 — Integração frontend | Concluída | Catálogo remoto, fallback, 14 testes e validação navegada |
| 4 — Administração | Concluída | RLS remota e ciclo administrativo E2E completo |
| 5 — Produto e SEO | Concluída | 507 páginas de produto, canonical único por HTML, sitemap de 527 URLs, preview e Lighthouse |
| 6 — Medição e qualidade | Concluída | Eventos sem PII, RLS, 75 cenários em cinco perfis, Lighthouse e actions no runtime Node 24 |
| 7 — Orçamento | Concluída | Persistência local, quantidades, WhatsApp consolidado e E2E desktop/móvel |
| 8 — Confiança e domínio | Em andamento | Domínio próprio, HTTPS, redirects, canonical e Auth concluídos; dados comerciais oficiais e avaliações reais pendentes |
| 9 — Descoberta de checkout | Concluída | Decisão documentada: adiar, medir 30 dias e reavaliar por critérios |

## 18. Evoluções incrementais após o roadmap

- **16 de agosto de 2026 — coleção Aniversário:** 16 artes novas foram selecionadas após deduplicação contra os sete itens existentes; os mockups `aniversario-08` a `aniversario-23`, suas quatro variantes, o fallback TypeScript e os metadados remotos foram publicados pela migration `20260816200000`. O catálogo passou a 357 produtos e 1.496 objetos públicos. Evidência: [`docs/baselines/2026-08-16-anniversary-catalog/ANNIVERSARY_CATALOG.md`](../baselines/2026-08-16-anniversary-catalog/ANNIVERSARY_CATALOG.md).
- **20 de agosto de 2026 — coleção Pets:** 50 mockups selecionados de cães e gatos foram publicados como `pets-01` a `pets-50`, com quatro variantes por produto, fallback TypeScript e migration `20260820115000`. A revisão visual posterior dos 50 itens identificou somente uma faixa sem estampa na caneca frontal de `pets-19`; a imagem foi corrigida e publicada em quatro caminhos `pets-19-r2.webp` pela migration `20260820193000`, mantendo os objetos anteriores para rollback. O catálogo permanece com 407 produtos e 1.696 caminhos de imagem ativos. Evidência: [`docs/baselines/2026-08-20-pets-catalog/PETS_CATALOG.md`](../baselines/2026-08-20-pets-catalog/PETS_CATALOG.md).
- **20 de agosto de 2026 — coleção Futebol & Esportes:** 78 artes foram triadas por popularidade, qualidade e duplicidade; 50 mockups de 20 clubes foram publicados como `futebol-01` a `futebol-50`, com quatro variantes por produto, fallback TypeScript e migration `20260820210000`. O catálogo passou a 457 produtos e 1.896 caminhos WebP no conjunto atual; a auditoria visual confirmou 50 arquivos únicos, 1254 × 1254 e sem faixas inferiores sem estampa. Evidência: [`docs/baselines/2026-08-20-football-catalog/FOOTBALL_CATALOG.md`](../baselines/2026-08-20-football-catalog/FOOTBALL_CATALOG.md).
- **20 de agosto de 2026 — coleção Profissões:** 1.770 imagens raster foram inventariadas e 50 estampas JPG/PNG de profissões distintas foram selecionadas, excluindo pastas de mockups. Cada produto possui estampa de produção comprovada no manifesto, mockup revisado e quatro variantes WebP; a migration `20260820220000` levou o catálogo a 507 produtos e 2.096 caminhos WebP no conjunto atual. Evidência: [`docs/baselines/2026-08-20-professions-catalog/PROFESSIONS_CATALOG.md`](../baselines/2026-08-20-professions-catalog/PROFESSIONS_CATALOG.md).
