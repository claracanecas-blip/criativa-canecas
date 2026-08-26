# Fase 10 — Escala e descoberta — evidência de preview

Data: 26 de agosto de 2026.

## Escopo entregue

- consultas paginadas de produtos, relações e imagens no catálogo público, no painel administrativo e no gerador de SEO;
- teste sintético com 1.205 registros para impedir regressão do antigo limite silencioso de 1.000 linhas;
- seleção pública reduzida aos campos efetivamente consumidos;
- fallback TypeScript carregado sob demanda, sem entrar no bundle principal da operação normal;
- busca sem diferença de acentos, com suporte a SKU e slug;
- paginação de resultados da busca em grupos de 20 produtos;
- home usando produtos destacados e uma amostra de coleções diferentes, em vez dos oito primeiros itens de Séries;
- cabeçalho mobile compacto e menu de categorias acionável por botão, teclado, `aria-expanded` e `Escape`;
- campanha fixa de Dia dos Pais retirada dos menus, preservando a rota para compatibilidade;
- títulos principais corrigidos para `h1` nas páginas públicas de coleção, busca, personalização, fotos e presentes.

## Medições

- dados REST carregados pela home local: de aproximadamente 597.945 bytes para 286.838 bytes, redução aproximada de 52%;
- bundle principal Vite: de 394,67 kB para 374,21 kB; o fallback local passou para chunk separado de 20,48 kB;
- limite inferior do cabeçalho/nav em 390 px: de aproximadamente 290 px para 210 px;
- menu mobile: gatilho e painel alinhados em 390 px, sem overflow horizontal;
- busca navegada: `sao paulo` retorna os mesmos sete produtos de `São Paulo`, e `CC-ARROW-1` encontra `Arrow 01`.

Os tamanhos REST são corpos decodificados observados pelo navegador local contra o catálogo remoto. Eles servem como comparação deste incremento, não como franquia ou medição de cobrança do Supabase.

## Verificações

- `npm run typecheck`: aprovado;
- `npm test`: 64 testes aprovados;
- `npm run build`: aprovado, com 721 HTMLs de produto, 17 de coleção e sitemap de 741 URLs;
- Playwright Chrome: 20 cenários aprovados, incluindo Axe WCAG 2.2 A/AA, busca tolerante, paginação, catálogo, produto e orçamento;
- inspeção visual local: home desktop, home mobile e menu mobile.

## Preview e CI

- commit: `3cacea9`;
- draft PR: `https://github.com/claracanecas-blip/criativa-canecas/pull/1`;
- preview Vercel: `https://criativa-canecas-fevvdqk1j-claracanecas-9141s-projects.vercel.app`;
- build do preview: aprovado pela integração Vercel;
- CI em instalação limpa: 64 testes, typecheck e build aprovados;
- compatibilidade: 80 cenários nos perfis Chrome, Firefox, WebKit desktop e Safari móvel, mais 20 cenários no Edge;
- Lighthouse CI: home P98/A98/B100/S100, coleção P99/A98/B100/S100 e produto P97/A100/B100/S100.

O preview está protegido por autenticação Vercel. Requisições anônimas retornam a tela de login da plataforma, portanto o smoke remoto e o aceite visual precisam ser feitos em uma sessão autorizada.

## Segurança, dados e rollback

Nenhuma migration, política RLS, credencial ou dado remoto foi alterado. O rollback consiste em reverter os arquivos de aplicação, testes e documentação deste incremento; o catálogo e o Storage permanecem inalterados.

## Pendente para concluir a fase

- abrir o preview em sessão Vercel autorizada e repetir o smoke responsivo;
- promover para produção somente após autorização e aceite do preview;
- confirmar no preview autenticado a ausência de regressão não coberta pelo Lighthouse CI;
- avaliar consultas por rota como próximo passo para deixar de carregar os 721 produtos na home.
