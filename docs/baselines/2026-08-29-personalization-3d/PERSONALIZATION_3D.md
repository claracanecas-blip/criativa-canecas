# Prévia 3D de personalização

Data: 29 de agosto de 2026.

## Objetivo

Permitir que o cliente visualize a própria imagem e frase sobre a curvatura de uma caneca, gire o objeto e ajuste a composição antes de continuar pelo WhatsApp, sem enviar ou persistir o arquivo no site.

## Entrega local

- `/personalizada` passou de uma representação plana em CSS para uma caneca tridimensional procedural renderizada com Three.js.
- A imagem e a frase são compostas em um canvas local e aplicadas à área curva por uma textura dinâmica.
- A caneca pode ser girada por mouse, toque, botões ou teclado; zoom funciona por roda do mouse e gesto de pinça.
- Escala e posição da imagem continuam disponíveis nos controles acessíveis existentes.
- O renderizador limita a densidade de pixels e só pertence ao chunk sob demanda da rota personalizada.
- Dispositivos sem WebGL 2 mantêm uma simulação 2D e o fluxo comercial continua utilizável.
- O seletor comercial foi simplificado para `Caneca personalizada` e `Caneca personalizada com foto`; caneca mágica e opção colorida separada foram removidas por decisão do proprietário.

## Privacidade e dados

- JPEG, PNG e WebP continuam usando somente uma URL temporária criada pelo navegador.
- O arquivo não é enviado ao Supabase, não entra em analytics e é descartado ao sair ou recarregar.
- A mensagem do WhatsApp registra somente o nome do arquivo e orienta o cliente a anexá-lo na conversa.
- Não houve migration, upload, serviço pago ou alteração de banco, Storage ou produção.

## Acessibilidade e compatibilidade

- A área 3D possui descrição, status anunciado e foco visível.
- Botões permitem girar e centralizar sem gesto; setas e `Home` oferecem operação por teclado.
- O canvas não substitui os campos e controles HTML que descrevem e alteram a personalização.
- A simulação continua identificada como aproximada e não substitui a arte final aprovada antes da produção.

## Validação

- 72 testes unitários aprovados, incluindo aparência das opções e cálculo de proporção, escala e deslocamento da arte.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado, com 721 produtos, 17 coleções e 741 URLs no SEO.
- Playwright: seis cenários direcionados aprovados em Chrome desktop e Safari móvel, cobrindo upload, duas opções comerciais, contexto do WhatsApp, controles 3D, acessibilidade e foto/frase no fallback 2D.
- Axe: `/personalizada` sem violações automáticas WCAG 2.2 A/AA em Chrome desktop e Safari móvel.
- Inspeção visual concluída em 1440 × 1000 e 390 × 844 com imagem, frase, textura curva e layout responsivo.

## Preview de avaliação

- Branch: `feat/personalizacao-3d`.
- PR em rascunho: `#8`.
- Vercel: deployment `Ready` em `https://criativa-canecas-git-feat-pe-5eb553-claracanecas-9141s-projects.vercel.app`.
- A proteção de previews do projeto redireciona visitantes sem sessão para o login da Vercel.
- A branch `main` e o site oficial permanecem inalterados até a aprovação do proprietário.

## Limites conhecidos

- A geometria representa uma caneca genérica. Fidelidade dimensional da área imprimível depende das medidas reais do modelo produzido.
- O 3D melhora a decisão visual, mas não garante corte, cor ou posição final de impressão; a aprovação humana permanece obrigatória.
- O chunk 3D é carregado somente em `/personalizada`, mas ainda adiciona aproximadamente 140 KB gzip nessa rota.

## Rollback

Reverter `Mug3DPreview.vue`, `mugPersonalization.ts`, a integração em `PersonalizationPreview.vue`, os testes relacionados e as dependências `three`/`@types/three`. A prévia 2D anterior pode ser restaurada sem banco, Storage ou limpeza remota.
