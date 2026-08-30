# Refinamento visual e responsivo do catálogo

Data: 30 de agosto de 2026.

## Escopo

- cabeçalho contextual de coleção com nome, contagem e amostra real;
- filtros e contagem reunidos em uma barra compacta;
- cards com hierarquia visual, foco visível e rótulos reduzidos apenas no celular;
- títulos longos protegidos contra overflow na página do produto;
- WhatsApp flutuante oculto em grades móveis de coleção e busca, onde cada card já possui CTA próprio.

Não houve migration, upload, alteração de catálogo, preço, política de entrega ou mensagem comercial.

## Aceite local

- `npm run typecheck`: aprovado;
- `npm test`: 73/73;
- `npm run build`: aprovado, com 721 produtos, 17 coleções e 741 URLs;
- Playwright/Axe: 120/120 nos perfis Chrome, Firefox, Safari desktop e Safari móvel;
- inspeção visual: coleção em 1440 × 1000 e 390 × 844; busca e produto longo em 390 × 844;
- teste dedicado: duas colunas móveis, rótulos compactos, ausência de overflow e visibilidade contextual do WhatsApp flutuante;
- Lighthouse: home P99/A100/B100/S100, coleção P94/A98/B100/S100 e produto P91/A100/B100/S100.

O Lighthouse gerou os três relatórios válidos; no Windows, o Chrome Launcher encontrou apenas o bloqueio conhecido `EPERM` ao remover diretórios temporários depois de cada relatório, tratado pelo verificador do projeto.

## Segurança e dados

- nenhum segredo ou arquivo pessoal integra o diff;
- os PNGs de cartões, os scripts PowerShell e `docs/guides/` permanecem não rastreados;
- nenhuma chamada administrativa ou escrita remota foi necessária.

## Rollback

Reverter os quatro arquivos de aplicação, o teste E2E e a documentação deste incremento. Não há migration, objeto de Storage ou dado remoto para desfazer.
