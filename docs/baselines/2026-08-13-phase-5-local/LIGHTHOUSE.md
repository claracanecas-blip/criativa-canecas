# Lighthouse — Fase 5 local com página de produto e SEO

Medição móvel laboratorial. Variações entre execuções são esperadas. URL medida: `http://127.0.0.1:4180`.

| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| home | 99 | 93 | 100 | 100 | 1.7 s | 0.03 | 50 ms |
| collection-series | 99 | 95 | 100 | 100 | 2.0 s | 0 | 40 ms |
| product-arrow-1 | 90 | 95 | 100 | 100 | 3.5 s | 0 | 50 ms |

## Imagens requisitadas

| Página | Requisições | Transferência | Variantes |
|---|---:|---:|---|
| home | 12 | 260.8 KB | other: 2, original: 2, card-640: 8 |
| collection-series | 20 | 392.5 KB | other: 2, card-640: 18 |
| product-arrow-1 | 7 | 121.0 KB | original: 1, other: 2, card-640: 4 |

O JSON preserva métricas numéricas, condições da auditoria e as URLs efetivamente requisitadas pelo navegador móvel.
