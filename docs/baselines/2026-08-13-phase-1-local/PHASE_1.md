# Evidências da Fase 1 — imagens

Verificação local e no Supabase realizada em 13 de agosto de 2026. A publicação foi confirmada na Vercel e a medição final está em `../2026-08-13-phase-1-production/`.

## Storage e variantes

| Conjunto | Arquivos | Dimensão | Tamanho local |
|---|---:|---:|---:|
| Originais otimizados | 358 | até 1000 × 1000 | 24,35 MiB |
| Cards pequenos | 358 | 320 × 320 | 3,82 MiB |
| Cards grandes | 358 | 640 × 640 | 11,00 MiB |
| Compartilhamento | 358 | 1200 × 630 | 11,63 MiB |

- Total esperado e enviado: 1.432 objetos WebP.
- Verificação pública por `GET`: 1.432 acessíveis, 0 ausentes, 0 tipos incorretos e 0 caches incorretos.
- Verificação autenticada imediatamente após o upload: 0 objetos extras nos quatro prefixos conhecidos.
- Cabeçalho público confirmado: `Cache-Control: public, max-age=31536000`.
- As URLs originais foram preservadas como rollback; as variantes vivem em `card/320/`, `card/640/` e `social/`.

## Frontend móvel

- Cards usam `srcset` com 320w, 640w e original de 1000w, dimensões declaradas e prioridade apenas para o primeiro item.
- A auditoria móvel da coleção requisitou 18 imagens de produtos em `card/640/` e nenhuma original de 1000 px.
- Falhas trocam a imagem por um placeholder com o ícone profissional `ImageOff` e texto acessível.
- O logotipo exibido e o favicon passaram de um PNG de 2.019.829 bytes para um WebP de 11.826 bytes; o PNG permanece no repositório como rollback.

## Qualidade e desempenho local

- Testes locais antes do upload: 8 aprovados, incluindo integridade do catálogo, URLs do `srcset`, correspondência dos 358 nomes e dimensões das 1.074 variantes.
- Suíte reproduzível em checkout limpo: 7 aprovados; o teste do gerador cria entradas sintéticas e valida as seis saídas sem depender de `tmp/` ou de originais não versionados.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado.
- Lighthouse móvel local: home P100/A93/B100/S92, LCP 1,4 s e CLS 0; coleção P99/A95/B100/S92, LCP 1,7 s e CLS 0.
- O CLS anterior de 0,536 foi atribuído pelo relatório bruto ao rodapé renderizado antes da rota assíncrona. A altura mínima do conteúdo mantém o rodapé fora da viewport até a rota resolver.

Os resultados detalhados e as URLs efetivamente requisitadas estão em `LIGHTHOUSE.md` e `lighthouse-summary.json`. Em produção, as rotas `/` e `/colecao/series` responderam diretamente com HTTP 200; o Lighthouse registrou home P99 e coleção P98, ambas com CLS 0.
