# Evolução da experiência de escolha e personalização

Data: 27–28 de agosto de 2026.

## Objetivo

Reduzir dúvidas na escolha de uma caneca, melhorar a inspeção visual do mockup e permitir que o cliente experimente uma personalização antes de continuar pelo WhatsApp.

## Entregas

1. **Zoom e galeria de produto**
   - a imagem principal virou um controle acessível para abrir a ampliação;
   - o diálogo oferece zoom de 100% a 300%, restauração, fechamento por teclado e navegação entre imagens quando houver mais de uma;
   - mouse, teclado e toque podem percorrer a imagem ampliada;
   - o repositório agora preserva todas as imagens `original` ordenadas de um produto, mantendo compatibilidade com o catálogo atual de uma imagem.

2. **Detalhes e cuidados**
   - a página de produto apresenta personalização/prévia, cuidados, preço e entrega;
   - material, capacidade e compatibilidade permanecem explicitamente sujeitos à confirmação do modelo;
   - nenhum dado comercial ou técnico não confirmado foi inventado.

3. **Prova social no contexto do produto**
   - depoimentos publicados e moderados podem aparecer na página do produto;
   - a seção fica ausente quando não há avaliação real publicada;
   - fotos continuam condicionadas ao fluxo existente de consentimento e somente caminhos locais ou URLs HTTPS são renderizados.

4. **Filtros de catálogo**
   - coleções podem ser refinadas por tema e faixa de preço, além de ordenadas por preço ou nome;
   - a busca pode ser refinada por coleção e ordenação;
   - filtros sem resultados exibem estado vazio correto e podem ser limpos sem recarregar a página.

5. **Prévia 2D local**
   - `/personalizada` permite escolher modelo, imagem, frase e observações;
   - a imagem pode ser redimensionada e reposicionada na simulação;
   - JPEG, PNG e WebP de até 10 MB são aceitos;
   - o arquivo usa apenas uma URL temporária do navegador, não é enviado ao Supabase, não é persistido e desaparece ao sair/recarregar;
   - o WhatsApp recebe modelo, frase e observações, com instrução clara para o cliente anexar a imagem na conversa;
   - a interface informa que a simulação é aproximada e que a arte final ainda exige aprovação.

## Segurança e privacidade

- Nenhuma migration ou alteração remota foi necessária.
- Nenhum token ou conteúdo de `.env.local` entrou no diff.
- A prévia não envia arquivo, texto livre ou CEP para analytics ou armazenamento.
- Depoimentos continuam sujeitos à RLS, moderação e consentimento já existentes.
- Arquivos pessoais não rastreados da raiz permaneceram intocados.

## Validação local

- `npm test`: 69 testes aprovados.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado, com 721 produtos, 17 coleções e 741 URLs no SEO.
- Playwright/Axe: 104 de 104 cenários aprovados em uma rodada integral com Chrome, Firefox, Safari desktop e Safari móvel.
- A camada de repositório possui teste específico para preservar todas as imagens originais na ordem da galeria.
- Inspeção visual: produto/zoom e personalização em desktop e viewport móvel de 390 × 844.

## Preview e CI

- PR `#3` sem conflitos e com checks obrigatórios aprovados.
- Preview Vercel `Ready`; home, produto, coleção, busca e personalizada responderam `200` por acesso autenticado.
- CI em instalação limpa: 69 testes, typecheck e build aprovados.
- Matriz remota: 104 cenários Playwright/Axe nos quatro perfis principais e 26 no Edge.
- Lighthouse CI: todas as categorias avaliadas ficaram em pelo menos 90.

## Limitações deliberadas

- O catálogo atual possui uma imagem por produto; a galeria já aceita várias, mas novas fotos reais precisam ser cadastradas e autorizadas.
- Material, capacidade, micro-ondas e lava-louças aguardam dados oficiais por modelo.
- Nenhuma avaliação fictícia foi criada; a prova social só fica visível após publicação administrativa de conteúdo real.
- A prévia 2D não substitui a arte final de produção e não transfere automaticamente o arquivo ao WhatsApp.

## Rollback

Reverter os componentes `ProductGallery`, `ProductInformation`, `ProductSocialProof` e `PersonalizationPreview`, o utilitário `catalogFilters`, as integrações nas views e os testes/documentos deste incremento. Não há banco, Storage ou dado remoto a desfazer.
