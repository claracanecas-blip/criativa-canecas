# Auditoria de conclusão da especificação SDD — 2026-08-13

## Escopo e resultado

Auditoria executada sobre o commit `494e952`, o deployment de produção `dpl_Axiqyot2wQ9NYnHMpkEDzDq22wyT`, o Supabase vinculado e o workflow GitHub Actions `31746994598`.

- 59/59 requisitos funcionais e não funcionais possuem implementação e evidência técnica.
- Fases 0–7 e 9 atendem à definição de pronto.
- A Fase 8 possui base técnica pronta, mas não atende ainda ao aceite externo: falta ativar um domínio próprio e cadastrar identidade, condições comerciais e avaliações reais fornecidas pela proprietária.
- Nenhuma credencial, condição comercial inventada ou depoimento fictício foi usado para completar a auditoria.

`Comprovado` significa que há implementação versionada e uma evidência reproduzível. O aceite da fase pode continuar `Dependência externa` mesmo quando seus requisitos técnicos já estão comprovados.

## Catálogo — CAT

| Requisito | Estado | Evidência principal |
|---|---|---|
| CAT-001 | Comprovado | `products` versionada em `supabase/migrations/20260813184000_catalog_schema.sql`; 341 produtos reconciliados no relatório da Fase 2. |
| CAT-002 | Comprovado | `collections.slug` possui unicidade no schema; 17 coleções e zero slugs duplicados. |
| CAT-003 | Comprovado | Relação N:N em `product_collections`; repositório tipado aceita múltiplas coleções. |
| CAT-004 | Comprovado | Campos obrigatórios, status, destaque e ordem definidos por constraints na migration inicial. |
| CAT-005 | Comprovado | `product_images` guarda imagens ordenadas e texto alternativo; 1.364 associações reconciliadas. |
| CAT-006 | Comprovado | RLS pública filtra entidades publicadas; testes positivos e negativos em `docs/baselines/2026-08-13-phase-2/rls-report.json`. |
| CAT-007 | Comprovado | Importador idempotente reconciliou 341 produtos, 17 coleções, 341 relações e 1.364 imagens. |
| CAT-008 | Comprovado | Camada de catálogo possui carregamento, vazio, fallback, erro recuperável e nova tentativa; testes do repositório cobrem falha das fontes. |
| CAT-009 | Comprovado | `VITE_CATALOG_SOURCE=typescript` mantém rollback operacional documentado na Fase 3. |

## Administração — ADM

| Requisito | Estado | Evidência principal |
|---|---|---|
| ADM-001 | Comprovado | Rotas `/admin` usam Supabase Auth; Playwright confirma redirecionamento anônimo ao login. |
| ADM-002 | Comprovado | `admin_users` e RLS negam escrita anônima/não administrativa e permitem somente administrador. |
| ADM-003 | Comprovado | `AdminCatalogView.vue` administra produtos, coleções, preços, publicação, destaque e ordem. |
| ADM-004 | Comprovado | Upload aceita JPEG/PNG/WebP, até 10 MB e mínimo de 640 × 640; validação unitária presente. |
| ADM-005 | Comprovado | Publicação gera WebP 1000, 320, 640 e social 1200 × 630 antes de concluir. |
| ADM-006 | Comprovado | Exclusões pedem confirmação, coleções relacionadas não são removidas e objetos antigos são preservados para evitar perda de referência. |
| ADM-007 | Comprovado | Timestamps, `created_by`, `updated_by` e auditoria de insert/update/delete protegidos por RLS. |

## Página de produto — PDP

| Requisito | Estado | Evidência principal |
|---|---|---|
| PDP-001 | Comprovado | 341 rotas prerenderizadas em `/produto/:slug`, com canonical único. |
| PDP-002 | Comprovado | PDP exibe imagem, nome, SKU, preço, descrição e coleções relacionadas. |
| PDP-003 | Comprovado | WhatsApp contém nome, SKU e URL oficial do produto; fluxo verificado em todos os perfis E2E. |
| PDP-004 | Comprovado | Quatro relacionados excluem o item atual; teste e navegação registrados na Fase 5. |
| PDP-005 | Comprovado | Slug ausente ou não publicado usa estado controlado de não encontrado. |
| PDP-006 | Comprovado | HTML de produção retorna título, descrição, imagem social, Open Graph e JSON-LD sem depender de JavaScript. |

## SEO — SEO

| Requisito | Estado | Evidência principal |
|---|---|---|
| SEO-001 | Comprovado | Metadados específicos e canonical derivam de uma única origem oficial. |
| SEO-002 | Comprovado | `robots.txt` e sitemap de produção contêm 361 URLs e filtram rascunhos/arquivados. |
| SEO-003 | Comprovado | Produtos expõem `Product` e `BreadcrumbList` em JSON-LD. |
| SEO-004 | Comprovado | Páginas compartilháveis possuem `og:title`, `og:description` e `og:image`. |
| SEO-005 | Comprovado | Prerender gera conteúdo crítico estático; decisão registrada de não migrar para SSR/Nuxt sem necessidade. |
| SEO-006 | Comprovado | Coleções legadas continuam publicadas e rotas desconhecidas exibem estado controlado. |

## Imagens — IMG

| Requisito | Estado | Evidência principal |
|---|---|---|
| IMG-001 | Comprovado | 1.432 objetos respondem `Cache-Control: public, max-age=31536000`. |
| IMG-002 | Comprovado | Cards usam `srcset` 320/640 e a auditoria móvel não baixou originais de 1000 px. |
| IMG-003 | Comprovado | Cada ativo possui original, card 320, card 640 e social 1200 × 630. |
| IMG-004 | Comprovado | Variantes usam WebP e falha de decodificação/carregamento troca para fallback visual seguro. |
| IMG-005 | Comprovado | Cards e detalhe declaram dimensões/aspect ratio; produção aferiu CLS 0. |
| IMG-006 | Comprovado | `ProductImage.vue` usa placeholder profissional `ImageOff`, com texto acessível e conteúdo preservado. |

## Analytics — ANA

| Requisito | Estado | Evidência principal |
|---|---|---|
| ANA-001 | Comprovado | Eventos tipados medem produto, busca, coleção e WhatsApp. |
| ANA-002 | Comprovado | Payload aceita somente dimensões fechadas; busca vira faixas e RLS rejeita texto livre/PII. |
| ANA-003 | Comprovado | Nenhuma integração opcional de marketing foi ativada sem decisão e consentimento. |
| ANA-004 | Comprovado | Entrega ocorre somente no hostname definido por `VITE_SITE_URL`; localhost e preview são ignorados. |
| ANA-005 | Comprovado | Campos e semântica estão em `docs/analytics/EVENT_CATALOG.md`. |

## Carrinho de orçamento — ORC

| Requisito | Estado | Evidência principal |
|---|---|---|
| ORC-001 | Comprovado | Adição/remoção é local e não exige conta. |
| ORC-002 | Comprovado | Estado versionado em `localStorage` sobrevive a navegação e refresh. |
| ORC-003 | Comprovado | Mensagem consolidada possui itens, quantidades, SKUs e links. |
| ORC-004 | Comprovado | Cabeçalho/drawer mostram total, controles de quantidade e limpeza confirmada. |
| ORC-005 | Comprovado | Interface e mensagem identificam preço/total como estimativa sujeita a confirmação. |
| ORC-006 | Comprovado | Texto declara que a seleção não reserva estoque nem confirma pedido. |

## Confiança e conteúdo — SOC

| Requisito | Estado | Evidência principal |
|---|---|---|
| SOC-001 | Comprovado | Depoimentos começam em rascunho e somente `published` aparece anonimamente. |
| SOC-002 | Comprovado | Foto exige referência de consentimento; metadado fica privado e protegido por RPC administrativa. |
| SOC-003 | Comprovado | `/informacoes` publica produção/entrega, materiais/cuidados e pós-venda via painel, com fallback seguro. O detalhamento oficial ainda depende da proprietária. |
| SOC-004 | Comprovado | Nome, logo, WhatsApp e origem oficial são centralizados e reutilizados em cabeçalho, rodapé, páginas e links. Identificação legal/e-mail ainda aguardam dados oficiais. |

## Não funcionais — NFR

| Requisito | Estado | Evidência principal |
|---|---|---|
| NFR-001 | Comprovado | Bundle usa somente URL/chave publicável; busca de segredos no diff e `.gitignore` protegem credenciais administrativas. |
| NFR-002 | Comprovado | RLS nega escrita por padrão; relatórios cobrem anônimo, autenticado comum e administrador. |
| NFR-003 | Comprovado | Gate Lighthouse móvel ≥ 90 passa em home, coleção e produto no CI. |
| NFR-004 | Comprovado | Axe WCAG 2.2 A/AA, foco visível, rótulos, contraste, alt e teclado são exercitados nos fluxos principais. |
| NFR-005 | Comprovado | CI executa e aprovou `npm run typecheck` e `npm run build`. |
| NFR-006 | Comprovado | Falha Supabase usa fallback TypeScript/mensagem recuperável, sem tela branca. |
| NFR-007 | Comprovado | Evento de erro usa somente códigos e grupos fechados, sem texto livre/PII. |
| NFR-008 | Comprovado | CI `31746994598`: 11/11 no Edge atual em Windows e 44/44 em Chrome, Firefox, WebKit desktop e perfil Safari móvel. WebKit é a prova automatizada do motor Safari; validação física em iPhone permanece recomendável antes de campanha de grande alcance. |
| NFR-009 | Comprovado | Backup `catalog-backup.json`, SHA-256, fontes TypeScript e importador permitem restauração. |
| NFR-010 | Comprovado | Solução usa os serviços atuais, evita checkout/marketing pagos e exige aprovação antes de elevar custo. |

## Gates reproduzidos nesta auditoria

| Gate | Resultado |
|---|---|
| Testes unitários | 32/32 aprovados |
| Typecheck | Aprovado |
| Build e SEO | Aprovado; 341 produtos, 17 coleções e 361 URLs |
| E2E principal | 44/44 aprovados em Chrome, Firefox, WebKit desktop e Safari móvel |
| E2E Edge | 11/11 aprovados no job Windows do CI |
| Lighthouse | Aprovado no mesmo workflow, todas as categorias ≥ 90 |
| Supabase migrations | Dez versões locais/remotas reconciliadas |
| Supabase lint | Nenhum erro de schema |
| Produção Vercel | Deployment Ready e aliases oficiais atribuídos |
| Smoke de produção | Produto e informações HTTP 200, canonical único, JSON-LD e sitemap com 361 URLs |

## Estado por fase

| Fase | Resultado da auditoria | Observação |
|---|---|---|
| 0 — Baseline | Concluída | Inventário, backup, hash, rotas e Lighthouse registrados. |
| 1 — Imagens | Concluída | Variantes, cache, responsividade e fallback publicados. |
| 2 — Banco | Concluída | Schema, importação, tipos, RLS e rollback reconciliados. |
| 3 — Frontend Supabase | Concluída | Paridade, estados, resiliência e rollback por variável. |
| 4 — Administração | Concluída | Auth, RLS, CRUD, imagens, auditoria e ciclo E2E. |
| 5 — Produto e SEO | Concluída | PDP, prerender, canonical, social, sitemap e robots. |
| 6 — Qualidade | Concluída | Analytics privado, acessibilidade, cinco perfis de navegador e Lighthouse no CI. |
| 7 — Orçamento | Concluída | Persistência, quantidades, ressalvas e WhatsApp consolidado. |
| 8 — Confiança e domínio | Dependência externa | Base publicável pronta; faltam domínio próprio, identidade/condições oficiais e avaliações reais. |
| 9 — Descoberta de checkout | Concluída | Decisão de adiar registrada com gatilhos de reavaliação. |

## Único caminho restante para concluir a Fase 8

1. A proprietária fornece nome empresarial ou CPF/CNPJ, endereço/e-mail e condições oficiais de produção, entrega, troca e pós-venda.
2. A proprietária escolhe/compra o domínio e autoriza acesso ao DNS; executar `docs/runbooks/CUSTOM_DOMAIN.md`.
3. Cadastrar avaliações exclusivamente reais, com referência de autorização para toda foto.
4. Validar HTTPS, redirecionamento, canonical único, Supabase Auth, produção e CI; então marcar a Fase 8 como concluída.
