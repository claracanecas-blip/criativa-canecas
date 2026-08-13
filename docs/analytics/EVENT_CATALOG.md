# Catálogo de eventos — Fase 6

Atualizado em 13 de agosto de 2026. Todos os eventos são agregados por dia no Supabase e só são enviados pelo domínio oficial de produção. Não existem cookies, sessão de visitante, IP, telefone, nome, e-mail ou texto livre na tabela de métricas.

| Evento | Quando ocorre | Dimensão 1 | Dimensão 2 |
|---|---|---|---|
| `product_view` | Abertura de uma página de produto publicada | slug validado no banco | origem fechada: direta, home, coleção, busca, relacionado, externa ou outra |
| `search` | Busca não vazia após o catálogo carregar | faixa do tamanho: `1`, `2-3`, `4-10`, `11+` | faixa de resultados: `0`, `1`, `2-5`, `6-20`, `21+` |
| `collection_select` | Abertura de uma coleção publicada | slug validado no banco | origem fechada: direta, home, coleções, busca, menu, produto, externa ou outra |
| `whatsapp_click` | Clique em qualquer CTA do WhatsApp | slug validado ou `general` | posição fechada do CTA |
| `client_error` | Erro técnico global ou fallback do catálogo | código técnico fechado | grupo de rota fechado |

## Privacidade e consentimento

- A busca envia apenas faixas numéricas; o termo digitado nunca sai do navegador como evento.
- Eventos de produto/coleção aceitam somente slugs publicados já existentes.
- Erros não enviam mensagem, stack trace, URL completa nem conteúdo inserido pelo usuário.
- A aplicação não usa Vercel Web Analytics, Google Analytics, Meta Pixel ou outro marketing tracker nesta fase.
- Como não há cookie, identificação individual ou integração opcional de marketing, nenhum banner de consentimento foi introduzido. Uma futura ferramenta de marketing deve ter avaliação LGPD e consentimento antes de carregar.
- Preview, localhost e desenvolvimento não enviam métricas. Ao adotar domínio próprio, a allowlist de produção em `src/services/analytics.ts` deve ser atualizada.

## Armazenamento e acesso

`record_catalog_event` valida todas as combinações e incrementa `analytics_daily_events`. Visitantes podem executar apenas a função; leitura e escrita direta são negadas. Usuários autenticados comuns recebem zero linhas e administradores podem consultar agregados.

Consulta administrativa sugerida no SQL Editor do Supabase:

```sql
select event_date, event_name, dimension_1, dimension_2, event_count
from public.analytics_daily_events
order by event_date desc, event_count desc;
```

Os dados são contagens operacionais, não uma fonte contábil. A migration limita as combinações possíveis para impedir a gravação de texto arbitrário e controlar o crescimento da tabela.
