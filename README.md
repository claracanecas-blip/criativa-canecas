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

O endereço do bucket público pode ser substituído em `.env.local`:

```dotenv
VITE_SUPABASE_STORAGE_URL=https://SEU-PROJETO.supabase.co/storage/v1/object/public/product-images
```

Não coloque a chave `service_role` em arquivos do projeto ou em variáveis que começam com `VITE_`, pois elas ficam públicas no navegador.

## Estrutura principal

```text
src/
  components/       componentes Vue e ícones reutilizáveis
  data/             coleções, produtos e dados do site
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

Para cadastrar produtos, edite `src/data/produtos.ts`. Os caminhos legados `.jpg` e `.png` são convertidos automaticamente para o arquivo `.webp` correspondente no bucket.

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

## Planejamento e memória

- [Especificação SDD e fases de evolução](docs/specs/CATALOG_EVOLUTION_SDD.md)
- [Memória técnica do projeto](docs/PROJECT_MEMORY.md)
