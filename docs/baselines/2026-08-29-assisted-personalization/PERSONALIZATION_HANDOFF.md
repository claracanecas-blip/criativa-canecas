# Encaminhamento assistido de personalização

Data: 29 de agosto de 2026.

## Decisão

`/personalizada` usa um único fluxo assistido. O cliente envia a imagem original e descreve a ideia; a Criativa Canecas prepara o mockup e o cliente aprova antes da produção. O editor e a simulação automática foram retirados para reduzir esforço, dúvida e divergência entre a visualização do site e a arte final.

A oferta comercial também foi consolidada em uma única `Caneca personalizada`, apresentada em dois níveis do mesmo serviço: `R$ 39,90` com arte pronta para impressão e `R$ 44,90` com criação ou adaptação da composição pela equipe. A diferença não é apresentada como taxa, pois “personalizada” já pode sugerir criação inclusa.

## Funcionamento

- O formulário coleta modelo, JPEG/PNG/WebP de até 10 MB, frase opcional e orientações.
- A imagem selecionada fica somente na memória do navegador. O site exibe nome e confirmação, sem upload ou persistência.
- Em celulares cuja Web Share API aceita arquivos, `Enviar foto e pedido pelo WhatsApp` abre o seletor nativo com o original e um resumo curto; o cliente escolhe o WhatsApp e a conversa da Criativa.
- No computador, a caixa de seleção da imagem fica oculta para não pedir o mesmo arquivo duas vezes. Mesmo quando o sistema informa suporte genérico ao compartilhamento, `Abrir WhatsApp da Criativa` direciona ao número oficial e pede que a foto seja anexada somente na conversa. O mesmo fallback é usado em celulares sem compartilhamento de arquivos.
- Para evitar duas ações concorrentes, apenas um dos caminhos aparece. O resumo contém modelo, nome do arquivo, frase, detalhes, os dois níveis de valor em uma linha, pedido de mockup e campo de cidade/CEP.
- Links `wa.me` não transportam anexos. Por isso, a interface orienta conferir se o compartilhamento levou a foto e anexá-la manualmente quando necessário.
- A equipe recebe o original, prepara o melhor enquadramento e devolve o mockup para aprovação humana.

## Simplificação técnica

- Removidos prévia 3D, fallback 2D, editor de posição, exportação PNG e testes exclusivos dessas funções.
- Removidas as dependências `three` e `@types/three`.
- O chunk JavaScript de `/personalizada` caiu de aproximadamente `147,7 KB gzip` para `4,3 KB gzip`.
- Não houve migration, alteração de banco, Storage, serviço pago ou envio automático de arquivos.

## Validação

- 70 testes unitários aprovados.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado, com 721 produtos, 17 coleções e 741 URLs no SEO.
- `112/112` cenários Playwright/Axe aprovados em Chrome, Firefox, Safari desktop e Safari móvel. A personalização cobre oferta e valores, seleção e remoção do arquivo, compartilhamento nativo simulado, fallback sem suporte a arquivos, resumo completo e ausência de editor/3D/download.
- Inspeção visual aprovada em `1440 × 1000` e `390 × 844` com uma arte real mantida fora do projeto; nenhum arquivo do acervo foi copiado, enviado ou versionado.
- O Edge local mantém a falha conhecida de encerramento no lançamento; o GitHub Actions aprovou `28/28` cenários nesse perfil.
- O CI da `main` no merge `a84c342` aprovou 70 testes, typecheck, build, `112/112` cenários nos quatro perfis principais, `28/28` no Edge e Lighthouse com todas as categorias em pelo menos `90`.
- A Vercel publicou o refinamento final no deployment de produção `dpl_AHx3wNsAkz5TrjYaU4yyy9mArg7i`, estado `Ready`. O smoke navegável no domínio oficial confirmou a oferta única, `R$ 39,90` com arte pronta, `R$ 44,90` com criação/adaptação, ausência de linguagem de taxa e mensagem destinada ao WhatsApp oficial.

## Rollback

Reverter o commit de simplificação restaura o protótipo 3D/editor e suas dependências sem banco, Storage ou limpeza remota. A imagem do cliente nunca é mantida pelo site.
