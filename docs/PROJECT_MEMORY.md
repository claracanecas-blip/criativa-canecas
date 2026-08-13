# Memória do projeto — Criativa Canecas

Atualizada em 13 de agosto de 2026. Este arquivo preserva contexto operacional e decisões entre sessões. Não deve conter tokens, senhas ou chaves privadas.

## Identidade e serviços

- Produção: https://criativa-canecas.vercel.app
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
- Imagens: 358 originais WebP e 1.074 variantes verificadas no Supabase, totalizando 1.432 objetos.
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
- Supabase Auth usa `https://criativa-canecas.vercel.app` como Site URL e permite callbacks de produção, previews do projeto e Vite local.
- Um convite administrativo foi enviado ao e-mail proprietário do projeto; o destinatário define a própria senha por link do Supabase.
- E2E Playwright comprovou login, 341 produtos iniciais, criação de coleção, publicação com quatro imagens, visualização pública, exclusões confirmadas e logout; nenhum sentinela permaneceu.
- Fase 5 concluída: 341 URLs `/produto/:slug` exibem imagem, SKU, preço, descrição, coleções, relacionados e WhatsApp com SKU/URL.
- O build gera 341 HTMLs de produto, 17 HTMLs de coleção, sitemap com 360 URLs e robots bloqueando `/admin`; HTML estático contém canonical, Open Graph, JSON-LD e conteúdo rastreável.
- Vercel usa `cleanUrls` e dá precedência aos HTMLs gerados antes do fallback SPA; preview confirmou `200` e metadados sem executar JavaScript.
- Lighthouse local da Fase 5: home P99/A93/B100/S100; coleção P99/A95/B100/S100; produto P90/A95/B100/S100, todos com CLS baixo/zero.

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
- Não existe medição formal de clique no WhatsApp, busca ou visualização de produto.
- Não há carrinho de orçamento com vários itens.
- O site ainda não possui domínio próprio registrado nesta memória.
- Há atividade residual do GitHub Pages, mas produção oficial é Vercel; não desativar serviço externo sem autorização explícita.

## Próxima execução recomendada

1. Implementar a Fase 6 com eventos tipados e sem PII para visualização, busca, coleção e WhatsApp.
2. Adicionar consentimento somente para integrações opcionais que realmente precisem dele e impedir métricas em desenvolvimento.
3. Ampliar Playwright/axe/Lighthouse no CI e adicionar monitoramento de erros sem dados pessoais.

## Protocolo de atualização da memória

Após mudança material:

1. atualizar a data;
2. registrar arquitetura e decisão permanente, não detalhes efêmeros;
3. atualizar estado, riscos e próxima execução;
4. nunca adicionar credenciais;
5. versionar a memória junto com a mudança relacionada.
