# Evidências da Fase 7 — carrinho de orçamento

Implementação e validação concluídas em 13 de agosto de 2026.

## Experiência entregue

- “Meu orçamento” no cabeçalho abre um drawer modal com contador total.
- Cards e página de produto adicionam itens sem exigir conta.
- Quantidades podem ser alteradas entre 1 e 99; itens podem ser removidos e a seleção pode ser limpa com confirmação.
- A seleção versionada sobrevive à navegação e ao refresh por `localStorage`.
- Dados locais inválidos/corrompidos são descartados; slugs inválidos e quantidades fora do limite são normalizados.
- Desktop usa drawer lateral e celular usa painel inferior, ambos com fechamento por botão, backdrop ou Escape.

## Mensagem comercial

O WhatsApp recebe uma lista consolidada com quantidade, nome, SKU, subtotal e URL de cada produto, seguida do total estimado. A mensagem declara explicitamente que personalização, prazo e disponibilidade serão confirmados e que a seleção não reserva estoque nem confirma o pedido.

O visitante ainda pode usar “WhatsApp agora” para conversar sobre apenas um produto.

## Qualidade

- `npm test`: 24/24 aprovados, incluindo storage corrompido, deduplicação, limites, arredondamento monetário e conteúdo da mensagem.
- `npm run test:e2e`: 8/8 aprovados, incluindo adicionar → alterar quantidade → refresh → enviar → limpar e drawer móvel.
- Axe: zero violações automáticas WCAG 2.2 A/AA nas páginas públicas auditadas.
- `npm run typecheck` e `npm run build`: aprovados; SEO continua com 341 produtos, 17 coleções e 360 URLs.
- Lighthouse: home P99/A98/B100/S100; coleção P99/A100/B100/S100; produto P91/A100/B100/S100.
- Inspeção visual desktop registrada localmente e não versionada em `tmp/phase7-quote-drawer.png`.

## Dados, segurança e rollback

Não existe dado de carrinho no servidor. O navegador armazena apenas slug e quantidade, sem nome, contato ou identificador. Nenhuma migration foi necessária.

Rollback: reverter os componentes/serviços da Fase 7. O conteúdo de `localStorage` torna-se inerte e pode ser removido pelo usuário; catálogo, Supabase e painel administrativo não são alterados.
