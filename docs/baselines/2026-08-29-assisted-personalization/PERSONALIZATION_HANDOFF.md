# Encaminhamento assistido de personalização

Data: 29 de agosto de 2026.

## Decisão

`/personalizada` usa um único fluxo assistido. O cliente envia a imagem original e descreve a ideia; a Criativa Canecas prepara o mockup e o cliente aprova antes da produção. O editor e a simulação automática foram retirados para reduzir esforço, dúvida e divergência entre a visualização do site e a arte final.

## Funcionamento

- O formulário coleta modelo, JPEG/PNG/WebP de até 10 MB, frase opcional e orientações.
- A imagem selecionada fica somente na memória do navegador. O site exibe nome e confirmação, sem upload ou persistência.
- Quando a Web Share API aceita arquivos, `Compartilhar foto e pedido` abre o seletor nativo com o original e o texto; no celular, o cliente pode escolher o WhatsApp.
- O link universal abre o WhatsApp com modelo, nome do arquivo, frase, orientações, pedido de mockup e aprovação final.
- Links `wa.me` não transportam anexos. Por isso, a interface orienta conferir se o compartilhamento levou a foto e anexá-la manualmente quando necessário.
- A equipe recebe o original, prepara o melhor enquadramento e devolve o mockup para aprovação humana.

## Simplificação técnica

- Removidos prévia 3D, fallback 2D, editor de posição, exportação PNG e testes exclusivos dessas funções.
- Removidas as dependências `three` e `@types/three`.
- O chunk JavaScript de `/personalizada` caiu de aproximadamente `147,7 KB gzip` para `4,3 KB gzip`.
- Não houve migration, alteração de banco, Storage, serviço pago ou envio automático de arquivos.

## Validação

- 69 testes unitários aprovados.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado, com 721 produtos, 17 coleções e 741 URLs no SEO.
- `108/108` cenários Playwright/Axe aprovados em Chrome, Firefox, Safari desktop e Safari móvel. A personalização cobre seleção e remoção do arquivo, compartilhamento nativo simulado, fallback sem suporte a arquivos, resumo completo e ausência de editor/3D/download.
- Inspeção visual aprovada em `1440 × 1000` e `390 × 844` com uma arte real mantida fora do projeto; nenhum arquivo do acervo foi copiado, enviado ou versionado.
- O Edge local mantém a falha conhecida de encerramento no lançamento; o perfil será confirmado pelo GitHub Actions após a publicação da branch.
- Lighthouse e o preview Vercel serão registrados após a publicação da branch.

## Rollback

Reverter o commit de simplificação restaura o protótipo 3D/editor e suas dependências sem banco, Storage ou limpeza remota. A imagem do cliente nunca é mantida pelo site.
