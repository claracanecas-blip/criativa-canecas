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
- Catálogo ainda é definido em `src/data/produtos.ts` e `src/data/colecoes.ts`.
- O frontend resolve caminhos antigos `.jpg`/`.png` para WebP no Supabase por `src/utils/assets.ts`.
- Fluxo de compra atual: contato pelo WhatsApp, sem checkout próprio.
- Fase 0 do roadmap concluída: 341 produtos/IDs únicos, 358 imagens locais/remotas, 21 arquivos e 2,10 MB no build limpo.
- Lighthouse móvel inicial: home P74/A93/B100/S92; coleção de séries P79/A95/B100/S92.
- Evidências e backup restaurável da Fase 0 estão em `docs/baselines/2026-08-13/`; o backup possui SHA-256 validado por teste.
- Fases 0 e 1 publicadas em produção; GitHub Actions do commit `1fb5910` passou instalação limpa, testes e build.
- Fase 1 concluída: cache GET de um ano em todos os objetos, variantes 320/640/social, `srcset`, dimensões declaradas e placeholder de falha.
- Lighthouse móvel em produção: home P99/A93/B100/S92 e coleção P98/A95/B100/S92, ambas com CLS 0; a coleção requisitou somente variantes `card-640` para produtos.

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

## Histórico relevante

- Commit `7be0f68`: migração para TypeScript, Tailwind, Lucide e Supabase.
- Commit `abab262`: exclusões para uploads da Vercel e conexão automática.
- Commit `dbdc35f`: centralização do ícone de busca.
- Primeiro deploy via CLI enviou 947 MB de arquivos locais; `.vercelignore` foi criado e o deploy automático seguinte terminou em aproximadamente 12 segundos.
- GitHub CLI, Supabase CLI e Vercel CLI estão autenticados neste computador no contexto do usuário.

## Cuidados operacionais

- O projeto está dentro do OneDrive. Arquivos antigos podem reaparecer em `dist`; apague apenas o `dist` validado e gere um build limpo antes de medir ou publicar manualmente.
- O `supabase link` apresentou conflito `AlreadyExists` em `supabase/.temp` sob o OneDrive. A integração do Storage foi concluída por API/CLI sem guardar a chave no Git.
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
- Metadados do catálogo ainda exigem código e deploy.
- Ainda não existe painel administrativo ou autenticação de administrador.
- Não existem páginas individuais de produto, sitemap dinâmico, JSON-LD de produto ou Open Graph por item.
- Não existe medição formal de clique no WhatsApp, busca ou visualização de produto.
- Não há carrinho de orçamento com vários itens.
- O site ainda não possui domínio próprio registrado nesta memória.
- Há atividade residual do GitHub Pages, mas produção oficial é Vercel; não desativar serviço externo sem autorização explícita.

## Próxima execução recomendada

1. Iniciar a Fase 2 com migration versionada, RLS e importador idempotente.
2. Validar leitura anônima positiva e escrita anônima negativa antes de migrar o frontend.
3. Reconciliar os 341 produtos, 15 coleções e relações com o backup da Fase 0.

## Protocolo de atualização da memória

Após mudança material:

1. atualizar a data;
2. registrar arquitetura e decisão permanente, não detalhes efêmeros;
3. atualizar estado, riscos e próxima execução;
4. nunca adicionar credenciais;
5. versionar a memória junto com a mudança relacionada.
