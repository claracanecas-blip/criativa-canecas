# Criativa Canecas

Catálogo responsivo de canecas personalizadas, desenvolvido com Vue 3, TypeScript, Tailwind CSS, Lucide Icons e Vite. O site é publicado na Vercel e as imagens otimizadas são servidas pelo Supabase Storage.

## Desenvolvimento local

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run preview
```

O catálogo usa leitura pública do Supabase. Copie `.env.example` para `.env.local` e preencha a chave publicável:

```dotenv
VITE_SUPABASE_STORAGE_URL=https://SEU-PROJETO.supabase.co/storage/v1/object/public/product-images
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publicavel
VITE_CATALOG_SOURCE=supabase
```

Não coloque a chave `service_role` em arquivos do projeto ou em variáveis que começam com `VITE_`, pois elas ficam públicas no navegador.

## Estrutura principal

```text
src/
  components/       componentes Vue e ícones reutilizáveis
  composables/      cache e estado compartilhado do catálogo
  data/             fallback local do catálogo e dados do site
  repositories/     leitura tipada do Supabase e adaptador de fallback
  router/           rotas com URLs limpas
  types/            tipos TypeScript do catálogo
  utils/            resolução de imagens no Supabase
  views/            páginas do catálogo
scripts/            otimização, envio e verificação de imagens
supabase/           configuração local do Supabase CLI
vercel.json         fallback de rotas para a SPA
```

## Imagens de produtos

Os arquivos originais ficam em `source-images/`, que não é enviado ao GitHub. Para preparar e sincronizar as imagens:

```bash
npm run images:optimize
npm run images:variants
npm run images:upload
npm run images:verify
```

O script de otimização gera WebP com até 1000 × 1000 pixels em `tmp/supabase-upload/`. O gerador de variantes cria cards de 320 × 320 e 640 × 640, além da imagem social de 1200 × 630, em `tmp/supabase-variants/`. O upload usa cache público de um ano e exige `SUPABASE_PROJECT_REF` (ou `SUPABASE_URL`) e `SUPABASE_SERVICE_KEY` (ou `SUPABASE_SERVICE_ROLE_KEY`) somente no ambiente local da execução.

O frontend consome os metadados do Supabase. Em caso de indisponibilidade temporária, o repositório exibe a cópia TypeScript de forma automática. Para rollback operacional, defina `VITE_CATALOG_SOURCE=typescript` na Vercel e faça um novo deploy. Os caminhos legados `.jpg` e `.png` continuam convertidos automaticamente para o arquivo `.webp` correspondente no bucket.

## Publicação

A Vercel detecta o Vite, executa `npm run build` e publica `dist/`. O arquivo `vercel.json` mantém as rotas do Vue Router funcionando ao abrir uma página diretamente.

O workflow do GitHub executa instalação limpa, verificação TypeScript e build em cada push ou pull request. O deploy fica a cargo da integração GitHub–Vercel.

O baseline reproduzível do catálogo, das rotas, imagens e Lighthouse pode ser atualizado com `npm run baseline`. As evidências versionadas ficam em `docs/baselines/`.

## Banco do catálogo

O schema do catálogo é versionado em `supabase/migrations/`. A importação usa o backup validado da Fase 0 e pode ser repetida sem duplicar registros:

```bash
npm run catalog:import
npm run catalog:verify
```

Esses comandos administrativos exigem as chaves apenas no ambiente da execução. O frontend nunca recebe `service_role`. Os scripts de rollback ficam em `supabase/rollback/` e não são aplicados automaticamente.

## Painel administrativo

O painel protegido está em `/admin`. A autenticação usa Supabase Auth e o acesso depende também de uma linha com papel `admin` em `public.admin_users`; estar apenas autenticado não concede escrita.

O painel permite criar, editar e excluir produtos/coleções, controlar preço, ordem, destaque e publicação, relacionar múltiplas coleções e enviar JPEG/PNG/WebP. O navegador valida a imagem e gera quatro WebP (`original`, `card-320`, `card-640` e `social`) antes de publicar. Exclusões exigem confirmação e preservam objetos do Storage para evitar perda acidental.

A verificação ponta a ponta administrativa cria e remove um usuário e registros sentinela:

```bash
npm run admin:verify-e2e
```

Ela exige URL, chave publicável e `service_role` somente no ambiente da execução. O relatório não armazena essas credenciais.

## Página de produto e SEO

Cada produto publicado possui a URL `/produto/:slug`, com código, preço, descrição, coleções, relacionados e mensagem de WhatsApp contendo SKU e link canônico.

Ao final do build, `scripts/generate-seo.ts` consulta o catálogo público (ou usa o backup validado se o Supabase estiver indisponível) e gera:

- HTML rastreável de produtos e coleções com canonical, Open Graph e conteúdo sem JavaScript;
- JSON-LD `Product` e `BreadcrumbList`;
- `sitemap.xml` apenas com registros publicados;
- `robots.txt`, bloqueando `/admin`.

Os arquivos SEO refletem o estado do catálogo no momento do deploy. Alterações administrativas aparecem imediatamente na interface dinâmica; metadados estáticos e sitemap são atualizados no próximo deploy.

## Planejamento e memória

- [Especificação SDD e fases de evolução](docs/specs/CATALOG_EVOLUTION_SDD.md)
- [Memória técnica do projeto](docs/PROJECT_MEMORY.md)
