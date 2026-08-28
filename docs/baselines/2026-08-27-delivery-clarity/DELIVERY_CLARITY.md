# Clareza de preço e entrega — Fase 8

Validado localmente em 27 de agosto de 2026.

## Objetivo

Explicar antes do contato comercial que o valor exibido corresponde à caneca, que o frete não está incluído e que existem dois fluxos de recebimento:

- entrega ou retirada local em Araranguá, combinada pelo WhatsApp, com mimo sujeito à disponibilidade;
- envio para outras cidades pelos Correios, com frete calculado separadamente pelo CEP.

O incremento atende principalmente `SOC-003`, `SOC-004`, `ORC-003`, `ORC-005`, `ORC-006`, `PDP-003`, `NFR-004` e `NFR-005`.

## Implementação

- `deliveryPolicy`, em `src/data/site.ts`, centraliza preço, atendimento local, envio e pergunta por cidade/CEP.
- `DeliveryOptions.vue` apresenta as duas opções na home, na página de informações, na página de produto e no fluxo de caneca personalizada.
- Cards e páginas de produto distinguem o preço da caneca do frete e usam CTAs explícitos de personalização/pedido.
- O orçamento consolidado inclui a ressalva de frete e solicita cidade/CEP sem persistir esses dados no site.
- A página de presentes deixa claro que `Presente Criativa` é uma opção adicional, com composição e valor confirmados no atendimento.
- O contraste dos preços em `/personalizada` foi elevado para cumprir WCAG AA.

Nenhum dado pessoal novo é armazenado. A cidade ou o CEP são preenchidos pelo cliente diretamente na mensagem aberta no WhatsApp.

## Validação local

- `npm run typecheck`: aprovado.
- `npm test`: 66/66 testes aprovados.
- `npm run build`: aprovado; 721 produtos, 17 coleções e 741 URLs geradas.
- Playwright/Axe em Chrome, Firefox, WebKit desktop e Safari móvel: 88/88 cenários aprovados.
- Axe incluiu `/personalizada` e `/presentes`; nenhuma violação WCAG 2.2 A/AA permaneceu.
- Inspeção visual em 1440 × 1000 e 390 × 844: home, produto e personalizada sem overflow ou sobreposição; opções e CTAs permanecem legíveis.

O Microsoft Edge local 151.0.4129.72 encerrou antes de criar qualquer página, inclusive em um lançamento Playwright vazio. Os 22 cenários não chegaram a acessar a aplicação; a execução Windows do GitHub Actions permanece como verificação definitiva desse perfil para o incremento.

## Rollback

Reverter o componente `DeliveryOptions.vue` e as alterações de aplicação, testes e documentação deste incremento. Não há migration, escrita remota ou objeto de Storage envolvido.
