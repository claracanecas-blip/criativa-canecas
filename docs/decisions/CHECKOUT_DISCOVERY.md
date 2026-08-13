# Decisão de produto — checkout online

Decisão registrada em 13 de agosto de 2026: **adiar a implementação de checkout e continuar com orçamento + confirmação no WhatsApp**.

## Por que adiar agora

O site acabou de ganhar medição de produto, busca, coleção e WhatsApp, portanto ainda não existe janela histórica para estimar abandono, volume mensal qualificado ou perda causada especificamente pela ausência de pagamento online. Também faltam condições oficiais de frete, produção, disponibilidade, identificação do fornecedor e processo fiscal/pós-venda.

Um checkout antecipado transformaria preços estimados e itens personalizados em pedidos pagos antes de confirmar arte, prazo e entrega. Isso adicionaria reembolso, conciliação, chargeback, antifraude, webhooks, idempotência, privacidade de dados do pagador e suporte operacional sem evidência de retorno.

## Custos e alternativas observados

- Checkout hospedado é preferível a coletar cartão diretamente, reduzindo superfície PCI e risco técnico.
- O Mercado Pago Checkout Pro suporta redirecionamento e oferece cartão, Pix, boleto e carteira; taxas/prazos devem ser conferidos na conta comercial no momento da decisão: https://www.mercadopago.com.br/developers/pt/docs/loja-integrada/payment-methods/configure-checkout
- A Stripe informa, na consulta desta decisão, 3,99% + R$ 0,39 para cartão nacional, Pix a 1,19% somente por convite e R$ 55 por contestação recebida; valores são temporais e precisam ser revalidados: https://stripe.com/br/pricing
- Links de pagamento enviados após a confirmação da arte são uma etapa intermediária de menor complexidade que um checkout integrado.

## Critérios para reabrir

Reavaliar depois de pelo menos 30 dias completos de métricas e quando todos os itens abaixo estiverem disponíveis:

1. volume mensal de orçamentos e cliques no WhatsApp reconciliado com vendas reais;
2. taxa de desistência atribuída ao pagamento manual, registrada no atendimento;
3. preço, frete, prazo, disponibilidade e política pós-venda definidos antes da cobrança;
4. dados empresariais/fiscais e responsável por conciliação/reembolso definidos;
5. conta do provedor aprovada e tarifas atuais comparadas;
6. benefício esperado maior que tarifas, suporte e manutenção.

Como sinal inicial, um piloto passa a ser justificável se houver volume recorrente de ao menos 30 pedidos confirmáveis por mês **ou** evidência registrada de que 10% ou mais dos orçamentos qualificados são perdidos pela falta de pagamento imediato. Esses números são gatilhos de investigação, não autorização automática para contratar.

## Desenho recomendado se aprovado

Começar por link/checkout hospedado criado somente após a confirmação do orçamento. O servidor deve calcular o valor, criar a cobrança com chave secreta fora do frontend, usar idempotência, validar webhook assinado, persistir apenas identificadores necessários e nunca armazenar dados brutos de cartão. Pix/cartão, reembolso, expiração, falha e duplicidade precisam de testes antes de produção.

Nenhum fornecedor foi contratado e nenhum pagamento foi implementado nesta descoberta.
